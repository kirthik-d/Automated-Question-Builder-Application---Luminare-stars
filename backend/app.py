from flask import Flask, request, jsonify, send_file, send_from_directory, current_app as curr_app, make_response
from flask_mail import Mail, Message
from flask_socketio import SocketIO, emit
import os
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
from transformers import pipeline, T5Tokenizer, T5ForConditionalGeneration, AutoTokenizer, AutoModelForCausalLM, LlamaTokenizerFast, LlamaForCausalLM, BitsAndBytesConfig
import logging
from PyPDF2 import PdfReader, PdfWriter
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from concurrent.futures import ThreadPoolExecutor
import jwt
import torch
import requests
import sqlite3
import pandas as pd
from huggingface_hub import login, hf_hub_download
from openai import OpenAI
from datetime import datetime
import json
import uuid
from fpdf import FPDF
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import aliased
from sqlalchemy import func, and_
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import tempfile

# Set up logging to output to the console
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {'csv', 'xls', 'xlsx'}
HUGGINGFACE_TOKEN = "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" #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, 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
NVIDIA_TOKEN = "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"
#nvidia api key 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

# Set up the connection string for Supabase PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres.arvyyohqdhsejhxhtekr:21HZ35yFlAMTLZF6@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'   
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAIL_SERVER'] = 'smtp.gmail.com' 
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'kirthikd0212@gmail.com'   
app.config['MAIL_PASSWORD'] = 'sutg grex zidn orfq'   
mail = Mail(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
executor = ThreadPoolExecutor()

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
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.Text, nullable=True)  
    options = db.Column(db.Text, nullable=True)   
    correct_answer = db.Column(db.String(1000), nullable=True)  
    status = db.Column(db.String(100), default="Generated")   
    difficulty = db.Column(db.String(100), nullable=True)   
    topics = db.Column(db.String(500), nullable=True)   
    technologies = db.Column(db.String(500), nullable=True)    
    transaction_id = db.Column(db.String(500), nullable=False)  
    created_by = db.Column(db.String(500), nullable=False)   
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    file_url = db.Column(db.String(1000), nullable=True)  

    def to_dict(self):
        return {
            'id': self.id,
            'question_text': self.question_text,
            'options': self.options.split('|'),
            'correct_answer': self.correct_answer,
            'status': self.status,
            'difficulty': self.difficulty,
            'topics': self.topics,
            'technologies': self.technologies,
            'transaction_id': self.transaction_id,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'file_url': self.file_url
        }


# Define the QuestionBank model
class QuestionBank(db.Model):
    __tablename__ = 'question_banks'
    transaction_id = db.Column(db.String, primary_key=True)
    topics = db.Column(db.String)
    technologies = db.Column(db.String)
    created_by = db.Column(db.String)
    created_at = db.Column(db.DateTime)
    num_questions = db.Column(db.Integer)
    difficulty = db.Column(db.String)
    file_url_excel = db.Column(db.String)
    file_url_pdf = db.Column(db.String)
    passing_percentage = db.Column(db.Float)   
    max_attempts = db.Column(db.Integer)
    status = db.Column(db.String, default="Generated")  
    estimated_time = db.Column(db.Integer, default=60)

class AssessmentResults(db.Model):
    __tablename__ = "assessment_results"

    id = db.Column(db.Integer, primary_key=True)
    employee_email = db.Column(db.String(255), nullable=False)
    transaction_id = db.Column(db.String(255), nullable=False)
    score = db.Column(db.Float, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

# Feedback Model
class Feedback(db.Model):
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user = db.Column(db.String(255), nullable=False)
    feedback = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    transaction_id = db.Column(
        db.String(255), 
        nullable=False
    )

# Initialize the databaseg
with app.app_context():
    db.create_all()

# Set the public key for Azure AD to validate the token
AZURE_PUBLIC_KEY_URL = "https://login.microsoftonline.com/7c0c36f5-af83-4c24-8844-9962e0163719/discovery/v2.0/keys"
def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
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
        return decoded_token, None  # Return decoded token and no error
    except jwt.ExpiredSignatureError:
        # Token expired
        return None, ("Token has expired", 401)   
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        # Any other token validation errors
        return None, ("Invalid token", 401)   

@app.route('/validate', methods=['POST', 'OPTIONS'])
@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
def validate_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token missing'}), 400

    token = token.split(' ')[1]
    decoded_token, error_response = verify_token(token)
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
        # Join Feedback with the latest attempt for each transaction
        feedback_data = db.session.query(
            Feedback.id,
            Feedback.user,
            Feedback.feedback,
            Feedback.rating,
            Feedback.created_at,
            Feedback.transaction_id,
            QuestionBank.topics,
            QuestionBank.technologies
        ).join(QuestionBank, Feedback.transaction_id == QuestionBank.transaction_id) \
         .order_by(Feedback.created_at.desc()).all()

        # Format the results as a list of dictionaries
        feedback_list = [
            {
                "id": feedback.id,
                "user": feedback.user,
                "feedback": feedback.feedback,
                "rating": feedback.rating,
                "created_at": feedback.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                "transaction_id": feedback.transaction_id,
                "topics": feedback.topics,
                "technologies": feedback.technologies,
            }
            for feedback in feedback_data
        ]
        
        return jsonify({'feedback': feedback_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
@app.route('/get-questions', methods=['GET'])
def get_questions():
    transaction_id = request.args.get('transaction_id')
    user_email = request.args.get('user_email')

    if transaction_id:
        query = Question.query.filter(Question.transaction_id == transaction_id)
    else:
        # Fetch the latest transaction ID for the user
        last_transaction = (
            db.session.query(Question.transaction_id)
            .filter_by(created_by=user_email)
            .order_by(Question.created_at.desc())  # Use created_at for determining the latest
            .first()
        )
        if not last_transaction:
            return jsonify({"message": "No Generated questions available"}), 404

        transaction_id = last_transaction.transaction_id
        query = Question.query.filter_by(transaction_id=transaction_id)

    # Fetch questions
    questions = query.all()

    # Fetch question bank details
    question_bank = QuestionBank.query.filter_by(transaction_id=transaction_id).first()

    if not question_bank:
        return jsonify({"error": "Question bank not found"}), 404

    # Prepare questions data
    questions_data = []
    for question in questions:
        questions_data.append({
            'id': question.id,
            'question_text': question.question_text,
            'options': question.options.split('|') if question.options else [], 
            'correct_answer': question.correct_answer,
            'difficulty': question.difficulty,
            'topics': question.topics,
            'status': question.status,
            'transaction_id': question.transaction_id,
        })

    # Response includes questions and question bank details
    return jsonify({
        'questions': questions_data,
        'question_bank': {
            'transaction_id': question_bank.transaction_id,
            'passing_percentage': question_bank.passing_percentage,
            'max_attempts': question_bank.max_attempts,
            'topics': question_bank.topics,
            "estimated_time": question_bank.estimated_time,
            'technologies': question_bank.technologies,
            'created_by': question_bank.created_by
        }
    }), 200


@app.route("/get-approved-questions", methods=["GET"])
@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
def get_approved_questions():
    # Extract token from the Authorization header
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token missing'}), 400

    # Decode and verify token
    token = token.split(' ')[1]
    decoded_token, error_response = verify_token(token)

    # If token validation fails, return the error response
    if error_response:
        message, status_code = error_response
        return make_response(jsonify({"error": message}), status_code)

    # Get username from token
    user_email = decoded_token.get('preferred_username')
    if not user_email:
        return jsonify({'error': 'Invalid token'}), 401

    # Get the transaction ID from the query parameter
    transaction_id = request.args.get("transaction_id")

    if transaction_id:
        # Ensure the transaction belongs to the user
        questions = Question.query.filter_by(
            transaction_id=transaction_id, created_by=user_email, status="Approved"
        ).all()
        if not questions:
            return jsonify({"message": "Transaction ID does not belong to the user or has no approved questions"}), 403
    else:
        # Fetch the last transaction for the user
        last_transaction = (
            Question.query.filter_by(created_by=user_email, status="Approved")
            .order_by(Question.id.desc())
            .first()
        )
        if not last_transaction:
            return jsonify({"message": "No approved questions available"}), 404

        transaction_id = last_transaction.transaction_id
        questions = Question.query.filter_by(transaction_id=transaction_id, status="Approved").all()

    # Serialize the questions
    questions_data = [
        {
            "id": q.id,
            "question_text": q.question_text,
            "options": q.options,
            "correct_answer": q.correct_answer,
            "difficulty": q.difficulty,
            "topics": q.topics,
            "transaction_id": q.transaction_id,
        }
        for q in questions
    ]

    return jsonify({"transaction_id": transaction_id, "questions": questions_data})

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

        # Check if this question is the first approved question in its QuestionBank
        question_bank = QuestionBank.query.get(question.transaction_id)

        # If the QuestionBank status is not already approved, check if there is at least one approved question
        if question_bank.status != "Approved":
            # Check if there's any other approved question in the same QuestionBank
            approved_question = Question.query.filter_by(transaction_id=question.transaction_id, status="Approved").first()

            if approved_question:
                # If there is at least one approved question, update the QuestionBank status to Approved
                question_bank.status = "Approved"
                db.session.commit()

        return jsonify({"message": "Question approved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/approve-all-questions', methods=['POST'])
def approve_all():
    try:
        data = request.json
        transaction_id = data.get('transaction_id')

        if not transaction_id:
            return jsonify({'error': 'Transaction ID is required'}), 400

        # Fetch all questions with status 'Generated' for the given transaction_id
        questions = Question.query.filter_by(transaction_id=transaction_id, status='Generated').all()

        if not questions:
            return jsonify({'error': 'No questions found for the given transaction'}), 404

        # Approve all the fetched questions
        for question in questions:
            question.status = 'Approved'

        # Commit the changes to the Question table
        db.session.commit()

        # After updating all questions, check if all questions are now approved
        all_approved = not any(q.status != 'Approved' for q in questions)

        # If all questions are approved, update the QuestionBank status to 'Approved'
        if all_approved:
            question_bank = QuestionBank.query.get(transaction_id)
            if question_bank and question_bank.status != 'Approved':
                question_bank.status = 'Approved'
                db.session.commit()

        return jsonify({'message': f'All questions for transaction {transaction_id} approved successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update-questions', methods=['POST'])
def update_questions():
    try:
        data = request.json
        question_id = data.get("id")
        question_text = data.get("question_text")
        answer = data.get("answer")
        difficulty = data.get("difficulty")
        topics = data.get("topics")
        options = data.get("options")  
        correct_answer = data.get("correct_answer")
        file_url = data.get("file_url")

        question = Question.query.get(question_id)
        if not question:
            return jsonify({"error": "Question not found"}), 404

        if question_text is not None:
            question.question_text = question_text
        if answer is not None:
            question.correct_answer = answer
        if difficulty is not None:
            question.difficulty = difficulty
        if topics is not None:
            question.topics = topics
        if options is not None:
            question.options = '|'.join(options) 
        if correct_answer is not None:
            question.correct_answer = correct_answer
        if file_url is not None:
            question.file_url = file_url

        db.session.commit()
        return jsonify({"message": "Question updated successfully"}), 200
    except SQLAlchemyError as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({'error': f"Internal error: {str(e)}"}), 500

@app.route('/update-question-bank', methods=['POST'])
def update_question_bank():
    data = request.get_json()
    transaction_id = data.get('transaction_id')
    passing_percentage = data.get('passing_percentage')
    max_attempts = data.get('max_attempts')
    estimated_time = data.get('estimated_time')

    if not transaction_id:
        return jsonify({"error": "Transaction ID is required"}), 400

    # Find the question bank by transaction ID
    question_bank = QuestionBank.query.filter_by(transaction_id=transaction_id).first()

    if not question_bank:
        return jsonify({"error": "Question bank not found"}), 404

    # Update fields if provided
    if passing_percentage is not None:
        question_bank.passing_percentage = passing_percentage

    if max_attempts is not None:
        question_bank.max_attempts = max_attempts

    if estimated_time is not None:
        question_bank.estimated_time = estimated_time

    # Save changes to the database
    try:
        db.session.commit()
        return jsonify({"message": "Question bank updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred while updating the question bank", "details": str(e)}), 500


# Add Question API
@app.route('/add-question', methods=['POST'])
def add_question():
    data = request.json
    try:
        new_question = Question(
            question_text=data.get('question_text'),
            options=data.get('options'),
            correct_answer=data.get('correct_answer'),
            status=data.get('status', 'Generated'),
            difficulty=data.get('difficulty'),
            topics=data.get('topics'),
            technologies=data.get('technologies'),
            transaction_id=data['transaction_id'],
            created_by=data['created_by'],
        )
        db.session.add(new_question)
        db.session.commit()
        logger.info(f"New question ID: {new_question.id}")  # Debug log
        return jsonify({'message': 'Question added successfully', 'question': new_question.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


# Delete Question API
@app.route('/delete-question/<int:id>', methods=['DELETE'])
def delete_question(id):
    question = Question.query.get(id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    try:
        db.session.delete(question)
        db.session.commit()
        return jsonify({'message': 'Question deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

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

#model setup
try:
    logger.debug("Initializing the model from Hugging Face.")
    # Authenticate with Hugging Face
    #login(token=HUGGINGFACE_TOKEN)

    # Load the model and tokenizer directly from Hugging Face
    # question_generator = pipeline(
    #     "text-generation", 
    #     model=MODEL_ID,
    #     tokenizer=MODEL_ID,
    #     use_auth_token=HUGGINGFACE_TOKEN,
    #     device=-1  # Set device to -1 for CPU, or use a specific GPU id like 0
    # )
    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key="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"
    )
    logger.info("Model and tokenizer loaded successfully.")
except Exception as e:
    client = None
    logger.error("Failed to initialize the question generator.")
    logger.error(f"Error loading model: {e}")
    print(f"Error loading model: {e}")

def generate_questions_with_model(content, num_questions=3):
    try:
        # Use NVIDIA model for generating questions
        question_input = f"""Generate {num_questions} multiple-choice questions in JSON format based on the following content. Include:
                        - The question text
                        - Four options
                        - The correct answer
                        - Relevant topics
                        Here is the format:
                        {{
                            "questions": [
                                {{
                                    "question_text": "Question goes here",
                                    "options": ["Option A", "Option B", "Option C", "Option D"],
                                    "correct_answer": "Correct answer goes here",
                                    "topics": "Relevant topics"
                                }}
                            ]
                        }}
                        Content: {content}
                        """
        
        # Call the NVIDIA model
        completion = client.chat.completions.create(
            model="nvidia/llama-3.1-nemotron-70b-instruct",
            messages=[{"role": "user", "content": question_input}],
            temperature=0.5,
            top_p=1,
            max_tokens=1024,
            stream=True
        )

        response_text = ""

        for chunk in completion:
            # Extract content from chunk and ensure it's valid
            delta_content = chunk.choices[0].delta.content
            if delta_content:  # Only append non-empty content
                response_text += delta_content

        logger.info(response_text)  # Log the full raw response

        start_index = response_text.find("{")
        end_index = response_text.rfind("}") + 1
        # Attempt to parse the JSON array
        try:
            if start_index != -1 and end_index != -1:
                json_string = response_text[start_index:end_index]
                parsed_json = json.loads(json_string)
                return parsed_json
        except json.JSONDecodeError as json_err:
            logger.error(f"JSON parsing error: {json_err}")
            return {'error': 'Failed to parse the model response as JSON'}

    except Exception as e:
        logger.error(f"An error occurred: {e}")
        return {'error': str(e)}

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        try:
            # Save the file securely
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # Extract topics and subtopics from the file
            topics, subtopics = [], []
            file_extension = file.filename.split('.')[-1].lower()

            if file_extension == 'csv':
                # Read the CSV file and extract topics and subtopics
                with open(filepath, mode='r', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    header = next(reader)  # Assuming first row is the header
                    for row in reader:
                        if len(row) > 1:  # Ensure there are enough columns
                            topic = row[0].strip()  # Assuming the topic is in the first column
                            subtopic = row[1].strip()  # Assuming the subtopic is in the second column
                            if topic and subtopic:
                                topics.append(topic)
                                subtopics.append(subtopic)

            elif file_extension == 'xlsx':
                # Read the Excel file and extract topics and subtopics
                df = pd.read_excel(filepath)
                if not df.empty:
                    # Assuming the first two columns contain the topic and subtopic
                    for _, row in df.iterrows():
                        topic = str(row[0]).strip()  # Assuming the topic is in the first column
                        subtopic = str(row[1]).strip()  # Assuming the subtopic is in the second column
                        if topic and subtopic:
                            topics.append(topic)
                            subtopics.append(subtopic)

            # If no topics and subtopics were found
            if not topics or not subtopics:
                return jsonify({'error': 'No valid topics or subtopics found in the file'}), 400

            # Return the response with topics and subtopics
            return jsonify({
                'message': 'File uploaded successfully',
                'topics': topics,
                'subtopics': subtopics
            })

        except Exception as e:
            app.logger.error(f"Error processing file: {e}")
            return jsonify({'error': f'Failed to upload file: {e}'}), 500
    else:
        return jsonify({'error': 'Invalid file type. Allowed types are CSV and XLSX'}), 400
        
@app.route('/download/<filename>', methods=['GET'])
@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
def download_file(filename):
    # Extract token from the Authorization header
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'Token missing'}), 400

    # Decode and verify token
    token = token.split(' ')[1]
    decoded_token, error_response = verify_token(token)

    # If token validation fails, return the error response
    if error_response:
        message, status_code = error_response
        return make_response(jsonify({"error": message}), status_code)

    # Get username from token
    username = decoded_token.get('preferred_username')
    if not username:
        return jsonify({'error': 'Invalid token'}), 401

    # Extract transaction ID and file extension from filename
    transaction_id, file_extension = os.path.splitext(filename)
    file_extension = file_extension.lower()

    # Ensure valid file extension
    valid_extensions = {".pdf", ".xlsx"}
    if file_extension not in valid_extensions:
        return jsonify({'error': 'Unsupported file format'}), 400

    # Validate the transaction in the Question table
    question = Question.query.filter_by(transaction_id=transaction_id).first()
    if not question or question.created_by != username:
        return jsonify({'error': 'Unauthorized access to this file'}), 403

    # Construct the full file path
    directory = os.path.join("generated_files", transaction_id)
    full_filename = filename  # The filename includes the transaction ID and extension

    # Check if the file is already being downloaded or has been downloaded
    if hasattr(download_file, 'download_in_progress') and download_file.download_in_progress:
        return jsonify({"error": "File download already in progress"}), 400

    # Mark the download as in progress to prevent multiple downloads
    download_file.download_in_progress = True

    try:
        # Attempt to send the file
        return send_from_directory(directory, full_filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    finally:
        # Reset the flag once download is complete or failed
        download_file.download_in_progress = False

@app.route('/generate-quests', methods=['POST'])
def generate_quests():
    data = request.get_json()

    # Validate input
    required_fields = ['topics', 'num_questions', 'difficulty', 'username', 'technologies']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Invalid request, required fields missing'}), 400

    transaction_id = str(uuid.uuid4())
    process_question_generation(data, transaction_id, data['username'])

    return jsonify({'message': transaction_id}), 202

def save_question_files(questions, transaction_id):
    folder = f"generated_files/{transaction_id}"
    os.makedirs(folder, exist_ok=True)

    # Save as Excel (unchanged from previous response)
    excel_path = os.path.join(folder, f"{transaction_id}.xlsx")
    try:
        processed_questions = []
        id = 1
        for q in questions:
            options = q.get("options", [])
            if isinstance(options, str):
                try:
                    options = eval(options)
                except:
                    options = ["Invalid options format"]

            options_columns = {
                "Option A": options[0] if len(options) > 0 else "N/A",
                "Option B": options[1] if len(options) > 1 else "N/A",
                "Option C": options[2] if len(options) > 2 else "N/A",
                "Option D": options[3] if len(options) > 3 else "N/A",
            }

            processed_question = {
                "ID": id,
                "Question Text": q.get("question_text", "N/A"),
                **options_columns,
                "Correct Answer": q.get("correct_answer", "N/A"),
                "Difficulty": q.get("difficulty", "N/A"),
                "Topics": q.get("topics", "N/A"),
            }
            processed_questions.append(processed_question)
            id += 1

        df = pd.DataFrame(processed_questions)
        df.to_excel(excel_path, index=False)
    except Exception as e:
        raise Exception(f"Error saving Excel file: {e}")

    # Save as PDF
    pdf_path = os.path.join(folder, f"{transaction_id}.pdf")
    try:
        pdf = FPDF()
        pdf.set_font("Arial", size=12)
        pdf.add_page()
        pdf.cell(200, 10, txt="Generated Questions", ln=True, align='C')

        for q in questions:
            question_text = q.get("question_text", "N/A")
            options = q.get("options", [])
            correct_answer = q.get("correct_answer", "N/A")
            if isinstance(options, str):
                try:
                    options = eval(options)
                except:
                    options = ["Invalid options format"]

            # Write question text
            pdf.ln(5)
            pdf.multi_cell(0, 10, txt=f"Q: {question_text}")

            # Write options, one per line
            for idx, option in enumerate(options):
                option_label = f"Option {chr(65 + idx)}"
                pdf.multi_cell(0, 10, txt=f"{option_label}: {option}")

            # Write the correct answer
            pdf.multi_cell(0, 10, txt=f"Answer: {correct_answer}")

            # Add some spacing after each question
            pdf.ln(5)

        pdf.output(pdf_path)
    except Exception as e:
        raise Exception(f"Error saving PDF file: {e}")

    # Return URLs
    return {
        "excel_url": f"http://localhost:3000/download/{transaction_id}.xlsx",
        "pdf_url": f"http://localhost:3000/download/{transaction_id}.pdf"
    }

# Email utility
def send_email_to_trainer(username, subject, body):
    if not username:
        return jsonify({"error": "Invalid input"}), 400

    try:
        # Ensure you're within the application context
        with curr_app.app_context():  # This ensures we are within the app context
            msg = Message(subject, sender=app.config['MAIL_USERNAME'], recipients=[username])
            msg.body = body
            mail.send(msg)

        return jsonify({"message": "Email sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def process_question_generation(data, transaction_id, username):
    topics = data['topics']
    technologies = data['technologies']
    num_questions = data['num_questions']
    difficulty = data['difficulty']

    try:
        # Call the question generation API or model
        content = f"Generate {num_questions} multiple-choice questions on the topic(s): {', '.join(topics)}."
        content += f" From the following technologies: {', '.join(technologies)}. Difficulty: {difficulty}."
        questions_data = generate_questions_with_model(content, num_questions)

        if 'error' in questions_data:
            raise Exception(questions_data['error'])

        if isinstance(technologies, str):
            technologies = [technologies]

        # Prepare question list for storage
        questions = []
        for question in questions_data['questions']:
            questions.append({
                'question_text': question['question_text'],
                'options': question['options'],
                'correct_answer': question['correct_answer'],
                'status': 'Generated',
                'difficulty': difficulty,
                'topics': ', '.join(topics),
                'technologies': ', '.join(technologies),
                'transaction_id': transaction_id,
                'created_by': username,
                'created_at': datetime.utcnow()
            })

        # Save questions to the database
        for q in questions:
            db.session.add(Question(
                question_text=q['question_text'],
                options='|'.join(q['options']),
                correct_answer=q['correct_answer'],
                status=q['status'],
                difficulty=q['difficulty'],
                topics=q['topics'],
                technologies=q['technologies'],
                transaction_id=q['transaction_id'],
                created_by=q['created_by'],
                created_at=q['created_at']
            ))
        db.session.commit()

        # Save files and update file URLs
        file_urls = save_question_files(questions, transaction_id)
        for question in Question.query.filter_by(transaction_id=transaction_id).all():
            question.file_url = file_urls['excel_url']   
        db.session.commit()

        # Insert a record into the QuestionBank table
        db.session.add(QuestionBank(
            transaction_id=transaction_id,
            topics=', '.join(topics),
            technologies=', '.join(technologies),
            num_questions=num_questions,
            difficulty=difficulty,
            created_by=username,
            created_at=datetime.utcnow(),
            file_url_excel=file_urls.get('excel_url'),
            file_url_pdf=file_urls.get('pdf_url'),
            passing_percentage=70.0,
            max_attempts = 3,
            estimated_time = 60
        ))
        db.session.commit()

        # Send success email
        send_email_to_trainer(
            username,
            "Question Bank Generated Successfully",
            f"Your question bank has been generated successfully.\n\nTransaction ID: {transaction_id}\nExcel: {file_urls.get('excel_url')}\nPDF: {file_urls.get('pdf_url')}"
        )

    except Exception as e:
        # Handle errors and notify the user
        send_email_to_trainer(
            username,
            "Question Bank Generation Failed",
            f"An error occurred while generating your question bank.\n\nError: {str(e)}"
        )


@app.route('/api/question-banks', methods=['GET'])
def get_question_banks():
    # Get employee_email from query parameters
    employee_email = request.args.get('employee_email')

    if not employee_email:
        return jsonify({"error": "employee_email is required"}), 400

    # Query the QuestionBank table and join with the AssessmentResults table
    question_banks = db.session.query(
        QuestionBank.transaction_id,
        QuestionBank.topics,
        QuestionBank.technologies,
        QuestionBank.created_by,
        QuestionBank.created_at,
        QuestionBank.num_questions,
        QuestionBank.difficulty,
        QuestionBank.file_url_excel,
        QuestionBank.file_url_pdf,
        QuestionBank.max_attempts,
        QuestionBank.status,
        QuestionBank.estimated_time,
        func.count(AssessmentResults.id).label('attempts_taken'),
        func.max(AssessmentResults.score).label('max_score'),
        func.coalesce(func.bool_or(AssessmentResults.score >= QuestionBank.passing_percentage), False).label('passed')
    ).join(
        AssessmentResults,
        and_(
            AssessmentResults.transaction_id == QuestionBank.transaction_id,
            AssessmentResults.employee_email == employee_email  # Filter by employee_email
        ),
        isouter=True
    ).filter(
        QuestionBank.status == 'Approved'  # Utilize the status column
    ).group_by(
        QuestionBank.transaction_id,
        QuestionBank.topics,
        QuestionBank.technologies,
        QuestionBank.created_by,
        QuestionBank.created_at,
        QuestionBank.num_questions,
        QuestionBank.difficulty,
        QuestionBank.file_url_excel,
        QuestionBank.file_url_pdf,
        QuestionBank.max_attempts,
        QuestionBank.status,
        QuestionBank.estimated_time
    ).all()

    # Prepare the response
    response = [
        {
            "transaction_id": bank.transaction_id,
            "name": f"Question Bank - {bank.transaction_id}",
            "description": f"Topics: {bank.topics}",
            "technologies": bank.technologies,
            "created_by": bank.created_by,
            "created_at": bank.created_at.isoformat(),
            "num_questions": bank.num_questions,
            "difficulty": bank.difficulty,
            "file_url_excel": bank.file_url_excel,
            "file_url_pdf": bank.file_url_pdf,
            "max_attempts": bank.max_attempts,
            "attempts_taken": bank.attempts_taken,
            "max_score": bank.max_score,
            "status": bank.status,
            "passed": bank.passed,
            "estimated_time": bank.estimated_time
        }
        for bank in question_banks
    ]
    return jsonify(response), 200

@app.route('/api/question-banks/<transaction_id>/questions', methods=['GET'])
def get_questions_for_transaction(transaction_id):
    questions = Question.query.filter_by(transaction_id=transaction_id).all()
    response = [
        {
            "id": q.id,
            "question_text": q.question_text,
            "options": q.options.split('|'),
            "status": q.status,
            "difficulty": q.difficulty,
            "topics": q.topics,
            "technologies": q.technologies
        }
        for q in questions
    ]
    return jsonify(response), 200

@app.route('/api/submit-assessment', methods=['POST'])
def submit_assessment():
    data = request.get_json()
    employee_email = data.get('employee_email')
    transaction_id = data.get('transaction_id')
    answers = data.get('answers')

    if not employee_email or not transaction_id:
        return jsonify({"error": "Invalid input"}), 400

    try:
        # Fetch the maximum attempts and passing percentage for the question bank
        question_bank = QuestionBank.query.filter_by(transaction_id=transaction_id).first()
        if not question_bank:
            return jsonify({"error": "Question bank not found"}), 404

        max_attempts = question_bank.max_attempts
        passing_percentage = question_bank.passing_percentage

        # Count the number of attempts made by the employee for this transaction_id
        attempts_count = AssessmentResults.query.filter_by(
            employee_email=employee_email, transaction_id=transaction_id
        ).count()

        # Check if the employee has exceeded the maximum number of attempts
        if attempts_count >= max_attempts:
            return jsonify({
                "error": "Maximum attempts reached",
                "max_attempts": max_attempts
            }), 403

        # Fetch all questions for the transaction_id
        questions = Question.query.filter_by(transaction_id=transaction_id).all()
        if not questions:
            return jsonify({"error": "No questions found for this question bank"}), 404

        # Calculate the score
        correct_answers = 0
        for question in questions:
            if str(question.id) in answers and answers[str(question.id)] == question.correct_answer:
                correct_answers += 1

        total_questions = len(questions)
        score = (correct_answers / total_questions) * 100

        # Save the assessment result
        assessment_result = AssessmentResults(
            employee_email=employee_email,
            transaction_id=transaction_id,
            score=score,
            completed_at=datetime.utcnow()
        )
        db.session.add(assessment_result)
        db.session.commit()

        # Check if the employee passed or failed
        result_status = "Pass" if score >= passing_percentage else "Fail"

        return jsonify({
            "score": score,
            "status": result_status,
            "max_attempts": max_attempts,
            "attempts_remaining": max_attempts - (attempts_count + 1)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

def fill_certificate(name, date, certification_name, learning_officer_name):
    # Set the directory to save the new certificates
    output_dir = "certificates"
    os.makedirs(output_dir, exist_ok=True)  # Create the folder if it doesn't exist

    # Template file (existing PDF template)
    template_path = "certificate.pdf"  # Path to your existing template PDF
    output_path = os.path.join(output_dir, f"certificate_{name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf")

    # Create a new PDF that will overlay the text on the template
    temp_pdf = os.path.join(output_dir, "temp_overlay.pdf")

    # Use reportlab to create a temporary PDF overlay with the text
    c = canvas.Canvas(temp_pdf, pagesize=letter)
    
    # Set the font and size for the text
    c.setFont("Helvetica", 12)
    
    # Overlay text on the template at specific positions
    c.drawString(340, 280, name)
    c.drawString(300, 230, certification_name)
    c.drawString(150, 130, date)
    c.drawString(540, 130, learning_officer_name)
    
    # Save the overlay PDF
    c.save()

    # Now overlay the created PDF onto the template PDF
    with open(template_path, "rb") as template_file, open(temp_pdf, "rb") as overlay_file:
        template_pdf = PdfReader(template_file)
        overlay_pdf = PdfReader(overlay_file)

        writer = PdfWriter()

        # Loop through the pages of the template PDF and merge with overlay text
        page = template_pdf.pages[0]
        page.merge_page(overlay_pdf.pages[0])  # Overlay the first page of the template with the new text
        
        # Add the merged page to the writer object
        writer.add_page(page)

        # Write the merged PDF to a new file
        with open(output_path, "wb") as output_file:
            writer.write(output_file)
    
    # Clean up the temporary overlay PDF
    os.remove(temp_pdf)

    print(f"Certificate saved at {output_path}")  # Log for debugging
    return output_path

@app.route('/generate-certificate', methods=['POST'])
def generate_certificate():
    try:
        data = request.json
        name = data.get("name", "Recipient Name")
        date = data.get("date", "01/01/2024")
        certification_name = data.get("certification_name", "Sample Certification")
        learning_officer_name = data.get("learning_officer_name", "John Doe")

        output_path = fill_certificate(name, date, certification_name, learning_officer_name)
        return send_file(output_path, as_attachment=True)
    except Exception as e:
        return str(e), 500

@app.route('/api/completed-assessments', methods=['POST'])
def get_completed_assessments_for_employee():
    """
    Fetch the most recent completed assessment attempts for a specific employee,
    including technologies and topics from the QuestionBank table.
    """
    data = request.get_json()
    employee_email = data.get("employee_email")

    if not employee_email:
        return jsonify({"error": "Employee email is required."}), 400

    # Subquery to get the latest attempt for each transaction_id
    subquery = (
        db.session.query(
            AssessmentResults.transaction_id,
            func.max(AssessmentResults.completed_at).label('latest_attempt')
        )
        .filter(AssessmentResults.employee_email == employee_email)
        .group_by(AssessmentResults.transaction_id)
        .subquery()
    )

    # Join with AssessmentResults and QuestionBank to fetch enriched details
    latest_assessments = (
        db.session.query(
            AssessmentResults.id,
            AssessmentResults.transaction_id,
            AssessmentResults.score,
            AssessmentResults.completed_at,
            QuestionBank.topics,
            QuestionBank.technologies
        )
        .join(subquery, db.and_(
            AssessmentResults.transaction_id == subquery.c.transaction_id,
            AssessmentResults.completed_at == subquery.c.latest_attempt
        ))
        .join(QuestionBank, AssessmentResults.transaction_id == QuestionBank.transaction_id)
        .filter(AssessmentResults.employee_email == employee_email)
        .all()
    )

    # Format the data for the response
    data = [
        {
            "id": result.id,
            "transaction_id": result.transaction_id,
            "score": result.score,
            "completed_at": result.completed_at.strftime('%Y-%m-%d %H:%M:%S'),
            "topics": result.topics,
            "technologies": result.technologies
        }
        for result in latest_assessments
    ]

    return jsonify(data), 200

@app.route('/api/submit-feedback', methods=['POST'])
def submit_feedback():
    """
    Submit feedback for a completed assessment using transaction_id.
    """
    data = request.get_json()

    user = data.get('user')
    feedback_text = data.get('feedback')
    rating = data.get('rating')
    transaction_id = data.get('transaction_id')

    if not user or not feedback_text or not rating or not transaction_id:
        return jsonify({"error": "User, feedback, rating, and transaction_id are required."}), 400

    # Validate that the transaction_id exists in AssessmentResults
    assessment = AssessmentResults.query.filter_by(transaction_id=transaction_id).first()
    if not assessment:
        return jsonify({"error": "Invalid transaction_id. Assessment not found."}), 404

    try:
        new_feedback = Feedback(
            user=user,
            feedback=feedback_text,
            rating=rating,
            transaction_id=transaction_id
        )
        db.session.add(new_feedback)
        db.session.commit()

        return jsonify({"message": "Feedback submitted successfully!"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    # Query the QuestionBank table
    question_banks = db.session.query(
        QuestionBank.transaction_id,
        QuestionBank.topics,
        QuestionBank.technologies,
        QuestionBank.created_by,
        QuestionBank.created_at,
        QuestionBank.num_questions,
        QuestionBank.difficulty,
        QuestionBank.file_url_excel,
        QuestionBank.file_url_pdf,
        QuestionBank.max_attempts,
        QuestionBank.status,
        QuestionBank.estimated_time
    ).filter(
        QuestionBank.status == 'Approved'  # Only approved Question Banks
    ).all()

    # Prepare the response
    response = [
        {
            "transaction_id": bank.transaction_id,
            "name": f"Question Bank - {bank.transaction_id}",
            "description": f"Topics: {bank.topics}",
            "technologies": bank.technologies,
            "created_by": bank.created_by,
            "created_at": bank.created_at.isoformat(),
            "num_questions": bank.num_questions,
            "difficulty": bank.difficulty,
            "file_url_excel": bank.file_url_excel,
            "file_url_pdf": bank.file_url_pdf,
            "max_attempts": bank.max_attempts,
            "status": bank.status,
            "estimated_time": bank.estimated_time
        }
        for bank in question_banks
    ]
    return jsonify(response), 200


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)