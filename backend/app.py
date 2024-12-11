from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from flask_socketio import SocketIO, emit
import os
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
from transformers import pipeline, T5Tokenizer, T5ForConditionalGeneration
import logging
from PyPDF2 import PdfReader  # For extracting text from PDFs
from flask_sqlalchemy import SQLAlchemy
import jwt
import requests
import sqlite3
from huggingface_hub import login

# Set up logging to output to the console
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
HUGGINGFACE_TOKEN = "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"

# Set up the connection string for Supabase PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres.arvyyohqdhsejhxhtekr:21HZ35yFlAMTLZF6@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'  # In-memory SQLite DB for example
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Use your SMTP server
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'kirthikd0212@gmail.com'  # Replace with your email
app.config['MAIL_PASSWORD'] = 'sutg grex zidn orfq'  # Replace with your email password
mail = Mail(app)
db = SQLAlchemy(app)

# Allow CORS for React frontend
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Initialize Socket.IO with CORS allowed
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {'id': self.id, 'email': self.email, 'role': self.role}
    
# Define the Question model
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Integer type for id
    question_text = db.Column(db.String(500), nullable=False)  # Varchar equivalent for question text
    options = db.Column(db.String(500), nullable=True)  # Varchar for options
    correct_answer = db.Column(db.String(500), nullable=True)  # Varchar for correct answer
    status = db.Column(db.Text, nullable=True, default='Generated')  # Text type for status
    difficulty = db.Column(db.Text, nullable=True)  # Text type for difficulty
    topics = db.Column(db.Text, nullable=True)  # Text type for topics

    def __repr__(self):
        return f'<Question {self.id}: {self.question_text}>'

# Feedback Model
class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user = db.Column(db.String(255), nullable=False)
    feedback = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f"<Feedback {self.user} - {self.rating}>"

    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user,
            'feedback': self.feedback,
            'rating': self.rating,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }


# Initialize the database
with app.app_context():
    db.create_all()

# Set the public key for Azure AD to validate the token
AZURE_PUBLIC_KEY_URL = "https://login.microsoftonline.com/7c0c36f5-af83-4c24-8844-9962e0163719/discovery/v2.0/keys"

@socketio.on('test_event')
def handle_test_event():
    emit('metrics', {
        "serverUptime": "Test Server",
        "activeUsers": 50,
        "apiResponseTime": "123ms"
    })

@socketio.on('log_event')
def handle_log_event(data):
    log_message = data.get('message', 'No message provided')
    log_level = data.get('level', 'INFO').upper()

    # Emit the log data to the frontend
    socketio.emit('logs', {
        "logMessage": log_message,
        "level": log_level,
    })

    # Log the message to the server console for debugging
    log_methods = {
        'DEBUG': logger.debug,
        'INFO': logger.info,
        'WARNING': logger.warning,
        'ERROR': logger.error,
        'CRITICAL': logger.critical
    }
    log_methods.get(log_level, logger.info)(log_message)

def get_azure_public_keys():
    response = requests.get(AZURE_PUBLIC_KEY_URL)
    return response.json()

def verify_token(token):
    try:
        keys = get_azure_public_keys()
        headers = jwt.get_unverified_header(token)
        key = next((k for k in keys["keys"] if k["kid"] == headers["kid"]), None)

        if not key:
            raise Exception("Key not found")

        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
        decoded_token = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience="e3d709a8-6042-4a6a-b058-c4293a989b54",  # Replace with your Azure App's client ID
            issuer="https://login.microsoftonline.com/7c0c36f5-af83-4c24-8844-9962e0163719/v2.0"
        )
        return decoded_token
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        return None

@app.route('/validate', methods=['POST', 'OPTIONS'])
@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
def validate_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token missing'}), 400

    token = token.split(' ')[1]
    decoded_token = verify_token(token)
    if not decoded_token:
        return jsonify({'error': 'Invalid token'}), 401

    email = decoded_token.get('preferred_username')
    user = User.query.filter_by(email=email).first()
    logger.info("Email: %s, User: %s", email, user)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    logger.info({'role': user.role})
    return jsonify({'role': user.role}), 200

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.json
    email = data.get('email')
    role = data.get('role')

    if not email or not role:
        return jsonify({'error': 'Email and role are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 400

    user = User(email=email, role=role)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User added', 'user': user.to_dict()}), 201
    
# API to get all users
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

# API to remove a user
@app.route('/remove_user/<int:user_id>', methods=['DELETE'])
def remove_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'User removed successfully'})

# API to update a user's role
@app.route('/assignRole', methods=['POST'])
def assign_role():
    data = request.json
    user_id = data.get('userId')
    new_role = data.get('role')

    if not user_id or not new_role:
        return jsonify({'error': 'User ID and new role are required'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.role = new_role
    db.session.commit()

    return jsonify({'message': 'User role updated', 'user': user.to_dict()})

# API to monitor user and check if their role matches
@app.route('/monitor_user', methods=['POST'])
def monitor_user():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'message': 'User found', 'user': user.to_dict()})

# Load model and tokenizer explicitly with error handling
try:
    logger.debug("Inside initialise generate_questions.")

    # Log in to Hugging Face to access gated models
    login(token=HUGGINGFACE_TOKEN)

    # Initialize the question generator pipeline
    #pragnakalp/Question_Generation_T5, meta-llama/Llama-3.3-70B-Instruct, valhalla/t5-small-qg-prepend
    question_generator = pipeline(
        "text2text-generation", 
        model="ramsrigouthamg/t5_boolean_questions"
    )
    logger.info("Model and tokenizer loaded successfully.")

except Exception as e:
    question_generator = None
    logger.error("Failed to initialize the question generator.")
    logger.error(f"Error loading model: {e}")
    print(f"Error loading model: {e}")

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Check file extension
    allowed_extensions = {'txt', 'pdf'}
    file_extension = file.filename.split('.')[-1].lower()
    if file_extension not in allowed_extensions:
        return jsonify({'error': 'Unsupported file type. Allowed: txt, pdf'}), 400

    try:
        # Save the file securely
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Extract content based on file type
        content = ''
        if file_extension == 'txt':
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        elif file_extension == 'pdf':
            reader = PdfReader(filepath)
            content = ''.join([page.extract_text() for page in reader.pages if page.extract_text()])

        if not content.strip():
            return jsonify({'error': 'The uploaded file contains no readable text'}), 400

        # Get the number of questions from the form input
        num_questions = int(request.form.get('num_questions', 3))  # Default to 3 questions

        # Refined input for question generation
        question_input = f"Generate 3 multiple-choice questions based on the following content. For each question, provide four options in the format 'A) Option1, B) Option2, C) Option3, D) Option4':\n\n{content}"

        # Call the question generator
        questions = question_generator(question_input, max_length=350, num_beams=3, num_return_sequences=3)

        if not questions:  # If no questions are generated
            return jsonify({'error': 'No questions generated from the content'}), 500

        # Parse the model output to extract questions and options
        mcqs = []
        formatted_questions = []
        for q in questions:
            logger.debug(q)
            question_text = q['generated_text']
            
            # Basic check to ensure there is a question
            if '?' in question_text:
                # Try to extract the question and options
                parts = question_text.split('?')  # Split at question mark
                question = parts[0].strip() + '?'  # Keep the question part
                options = []
                
                # Assuming the options follow the question after a newline or some marker like "A)"
                options_part = parts[1] if len(parts) > 1 else ""
                
                # Find and separate options based on typical MCQ format (A), B), etc. for each letter
                for option_letter in ['A', 'B', 'C', 'D']:
                    option_start = options_part.find(f'{option_letter})')
                    if option_start != -1:
                        option_end = options_part.find('\n', option_start)
                        option_text = options_part[option_start + 3:option_end].strip() if option_end != -1 else options_part[option_start + 3:].strip()
                        options.append(f'{option_letter}) {option_text}')
                
                # Add to the MCQs list
                mcqs.append({
                    'question': question,
                    'options': options if options else None  # If no options, set as None
                })
            else:
                logger.warning(f"Model output not in expected format: {question_text}")

        # If no valid MCQs were generated, return an error
        if not mcqs:
            return jsonify({'error': 'Failed to generate valid multiple-choice questions'}), 500

        # Return the formatted response with questions and options, if available
        logger.debug({
            'message': 'File uploaded and questions generated successfully',
            'file_path': filepath,
            'questions': [{'question': m['question'], 'options': m['options']} for m in mcqs]  # Include both question and options (if available)
        })

        # Response to frontend: If options are not found, return the question alone
        return jsonify({
            'message': 'File uploaded and questions generated successfully',
            'file_path': filepath,
            'questions': [{'question': m['question'], 'options': m['options'] if m['options'] else []} for m in mcqs]  # Ensure options is empty array if None
        })

    except Exception as e:
        logger.error(f"Error processing file: {e}")
        return jsonify({'error': f'Failed to upload file: {e}'}), 500


@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    if question_generator is None:
        return jsonify({'error': 'Model is not loaded'}), 500

    data = request.get_json()
    if not data or 'content' not in data:
        return jsonify({'error': 'Invalid request, content missing'}), 400

    content = data['content']
    try:
        # Generate questions using the model with beam search
        num_questions = int(request.form.get('num_questions', 3))
        question_input = f"Generate 3 multiple-choice questions based on the following content. For each question, provide four options in the format 'A) Option1, B) Option2, C) Option3, D) Option4':\n\n{content}"
        questions = question_generator(content, max_length=350, num_beams=3, num_return_sequences=3)
        if not questions:  # If no questions are generated
            return jsonify({'error': 'No questions generated from the content'}), 500

        # Parse the model output to extract questions and options
        mcqs = []
        formatted_questions = []
        for q in questions:
            logger.debug(q)
            question_text = q['generated_text']
            
            # Basic check to ensure there is a question
            if '?' in question_text:
                # Try to extract the question and options
                parts = question_text.split('?')  # Split at question mark
                question = parts[0].strip() + '?'  # Keep the question part
                options = []
                
                # Assuming the options follow the question after a newline or some marker like "A)"
                options_part = parts[1] if len(parts) > 1 else ""
                
                # Find and separate options based on typical MCQ format (A), B), etc. for each letter
                for option_letter in ['A', 'B', 'C', 'D']:
                    option_start = options_part.find(f'{option_letter})')
                    if option_start != -1:
                        option_end = options_part.find('\n', option_start)
                        option_text = options_part[option_start + 3:option_end].strip() if option_end != -1 else options_part[option_start + 3:].strip()
                        options.append(f'{option_letter}) {option_text}')
                
                # Add to the MCQs list
                mcqs.append({
                    'question': question,
                    'options': options if options else None  # If no options, set as None
                })
            else:
                logger.warning(f"Model output not in expected format: {question_text}")

        # If no valid MCQs were generated, return an error
        if not mcqs:
            return jsonify({'error': 'Failed to generate valid multiple-choice questions'}), 500

        # Return the formatted response with questions and options, if available
        logger.debug({
            'message': 'Questions generated successfully',
            'questions': [{'question': m['question'], 'options': m['options']} for m in mcqs]  # Include both question and options (if available)
        })

        # Response to frontend: If options are not found, return the question alone
        return jsonify({
            'message': 'Questions generated successfully',
            'questions': [{'question': m['question'], 'options': m['options'] if m['options'] else []} for m in mcqs]  # Ensure options is empty array if None
        })
    except Exception as e:
        return jsonify({'error': f'Error generating questions: {e}'}), 500

@app.route('/')
def index():
    return render_template('index.html')

#generate reports
def create_report_table():
    conn = sqlite3.connect('app.db')  # Open a database connection
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS report_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_type TEXT NOT NULL,
            user_id INTEGER,
            activity TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Insert example data for 'Usage Statistics'
    cursor.execute('''
        INSERT INTO report_data (report_type, user_id, activity)
        VALUES ('Usage Statistics', 1, 'User logged in and viewed the dashboard')
    ''')

    # Insert example data for 'Question Bank Summary'
    cursor.execute('''
        INSERT INTO report_data (report_type, user_id, activity)
        VALUES ('Question Bank Summary', 2, 'Trainer added new questions to the question bank')
    ''')

    # Insert example data for 'System Health'
    cursor.execute('''
        INSERT INTO report_data (report_type, user_id, activity)
        VALUES ('System Health', 3, 'Admin performed system health check')
    ''')
    
    conn.commit()
    conn.close()

def insert_report_data(report_type, user_id, activity):
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO report_data (report_type, user_id, activity)
        VALUES (?, ?, ?)
    ''', (report_type, user_id, activity))
    
    conn.commit()
    conn.close()

def fetch_report_data(report_type):
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT * FROM report_data WHERE report_type = ?
    ''', (report_type,))
    
    report_data = cursor.fetchall()
    conn.close()

    return report_data

@app.route('/reports/<report_type>', methods=['GET'])
def get_report(report_type):
    data = fetch_report_data(report_type)
    return jsonify(data)

@app.route('/get-feedback', methods=['GET'])
def get_feedback():
    try:
        feedback_data = Feedback.query.order_by(Feedback.created_at.desc()).all()  # Fetch feedback ordered by creation time
        feedback_list = [feedback.to_dict() for feedback in feedback_data]
        return jsonify({'feedback': feedback_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/submit-feedback', methods=['POST'])
def submit_feedback():
    try:
        data = request.json
        user = data.get('user')
        feedback_text = data.get('feedback')
        rating = data.get('rating')

        if not user or not feedback_text or not rating:
            return jsonify({'error': 'Missing required fields'}), 400

        # Create new feedback entry
        new_feedback = Feedback(user=user, feedback=feedback_text, rating=rating)
        db.session.add(new_feedback)
        db.session.commit()

        return jsonify({'message': 'Feedback submitted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get-questions', methods=['GET'])
def get_questions():
    status = request.args.get('status', default='Generated')  # Filter by status, default to 'Generated'
    difficulty = request.args.get('difficulty', default=None)  # Optional filter by difficulty
    topics = request.args.get('topics', default=None)  # Optional filter by topics (comma-separated)

    try:
        # Query questions with optional filters
        query = Question.query.filter_by(status=status)

        if difficulty:
            query = query.filter_by(difficulty=difficulty)
        if topics:
            topics_list = topics.split(',')  # Split the comma-separated topics
            query = query.filter(Question.topics.like(f"%{','.join(topics_list)}%"))  # Match topics (this can be improved)

        questions = query.all()

        # Format the questions for the response
        response = [
            {
                'id': q.id,
                'question_text': q.question_text,
                'options': q.options,
                'correct_answer': q.correct_answer,
                'status': q.status,
                'difficulty': q.difficulty,
                'topics': q.topics
            }
            for q in questions
        ]

        return jsonify({'questions': response}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/approve-question', methods=['POST'])
def approve_question():
    try:
        data = request.json  # Expecting JSON body with 'id'
        question_id = data.get("id")

        # Fetch the question by ID
        question = Question.query.get(question_id)
        if not question:
            return jsonify({"error": "Question not found"}), 404

        # Update the status to Approved
        question.status = "Approved"
        db.session.commit()
        return jsonify({"message": "Question approved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/update-questions', methods=['POST'])
def update_questions():
    try:
        data = request.json  # Expecting JSON body with 'id', 'question_text', 'answer', 'difficulty', 'topics', 'options', 'correct_answer'
        question_id = data.get("id")
        question_text = data.get("question_text")
        answer = data.get("answer")
        difficulty = data.get("difficulty")
        topics = data.get("topics")
        options = data.get("options")
        correct_answer = data.get("correct_answer")

        # Fetch the question by ID
        question = Question.query.get(question_id)
        if not question:
            return jsonify({"error": "Question not found"}), 404

        # Update fields if provided
        if question_text:
            question.question_text = question_text
        if answer:
            question.correct_answer = answer  # Update the correct answer field
        if difficulty:
            question.difficulty = difficulty
        if topics:
            question.topics = topics  # topics could be a comma-separated string
        if options:
            question.options = options  # Update the options field

        db.session.commit()
        return jsonify({"message": "Question updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/generate-quests', methods=['POST'])
def generate_quests():
    if question_generator is None:
        return jsonify({'error': 'Model is not loaded'}), 500

    data = request.get_json()
    if not data or 'topics' not in data or 'num_questions' not in data or 'difficulty' not in data:
        return jsonify({'error': 'Invalid request, required fields missing'}), 400

    topics = data['topics']  # Topics for the questions (e.g., ["JavaScript"])
    try:
        num_questions = int(data['num_questions'])  # Convert to integer to avoid type mismatch
    except ValueError:
        return jsonify({'error': 'num_questions must be an integer'}), 400  # Handle invalid integer input
        
    difficulty = data['difficulty']  # Difficulty level (e.g., "Medium")

    try:
        # Generate questions using the model with the provided parameters
        question_input = f"Generate {num_questions} multiple-choice questions on the topic(s): {', '.join(topics)}. Difficulty level: {difficulty}. Provide four options in the format 'A) Option1, B) Option2, C) Option3, D) Option4':"

        # Adjust the model generation based on the topics and difficulty
        questions = question_generator(question_input, max_length=350, num_beams=3, num_return_sequences=num_questions)
        
        if not questions:  # If no questions are generated
            return jsonify({'error': 'No questions generated from the content'}), 500

        # Process and return questions
        mcqs = []
        for q in questions:
            logger.debug(q)
            question_text = q['generated_text']
            
            # Basic check to ensure there is a question
            if '?' in question_text:
                # Try to extract the question and options
                parts = question_text.split('?')  # Split at question mark
                question = parts[0].strip() + '?'  # Keep the question part
                options = []
                
                # Assuming the options follow the question after a newline or some marker like "A) Option1"
                options_part = parts[1] if len(parts) > 1 else ""
                
                # Find and separate options based on typical MCQ format (A), B), etc.
                for option_letter in ['A', 'B', 'C', 'D']:
                    option_start = options_part.find(f'{option_letter})')
                    if option_start != -1:
                        option_end = options_part.find('\n', option_start)
                        option_text = options_part[option_start + 3:option_end].strip() if option_end != -1 else options_part[option_start + 3:].strip()
                        options.append(f'{option_letter}) {option_text}')
                
                # Add to the MCQs list
                mcqs.append({
                    'question': question,
                    'options': options if options else None,  # If no options, set as None
                    'correct_answer': options[0] if options else None  # Set the first option as correct (or define another way)
                })
            else:
                logger.warning(f"Model output not in expected format: {question_text}")

        # If no valid MCQs were generated, return an error
        if not mcqs:
            return jsonify({'error': 'Failed to generate valid multiple-choice questions'}), 500

        # Insert generated questions into the database
        for mcq in mcqs:
            new_question = Question(
                question_text=mcq['question'],
                options=','.join(mcq['options']) if mcq['options'] else None,  # Store options as comma-separated string
                correct_answer=mcq['correct_answer'],  # Add the correct answer
                status='Generated',  # Mark the question as Generated
                difficulty=difficulty,  # Add the difficulty level
                topics=','.join(topics)  # Store topics as a comma-separated string
            )
            db.session.add(new_question)
        db.session.commit()  # Commit all the changes to the database

        # Response to frontend: If options are not found, return the question alone
        return jsonify({
            'message': 'Questions generated successfully',
            'questions': [{'question': m['question'], 'options': m['options'] if m['options'] else []} for m in mcqs]  # Ensure options is empty array if None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/contact', methods=['POST'])
def send_email():
    data = request.json
    if not data or not data.get("name") or not data.get("email") or not data.get("message"):
        return jsonify({"error": "Invalid input"}), 400

    # Prepare the email
    subject = f"Contact Us Message from {data['name']}"
    body = f"""
    Name: {data['name']}
    Email: {data['email']}
    Message: {data['message']}
    """
    recipient = app.config['MAIL_USERNAME']   
    
    try:
        # Send the email
        msg = Message(subject, sender=data['email'], recipients=[recipient])
        msg.body = body
        mail.send(msg)

        return jsonify({"message": "Email sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)