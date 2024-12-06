from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from werkzeug.utils import secure_filename
from transformers import pipeline, T5Tokenizer, T5ForConditionalGeneration
import logging

# Set up logging to output to the console
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
CORS(app)

# Load model and tokenizer explicitly with error handling
try:
    logger.debug("Inside initialise generate_questions.")
    question_generator = pipeline("text2text-generation", model="valhalla/t5-small-qg-prepend")
except Exception as e:
    question_generator = None
    logger.error("Inside none of question generator.")
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
    if not file.filename.split('.')[-1].lower() in allowed_extensions:
        return jsonify({'error': 'Unsupported file type. Allowed: txt, pdf'}), 400

    try:
        # Save the file securely
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Read file content for validation (optional)
        if file.filename.endswith('.txt'):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            logger.debug("Uploaded .txt file content: %s", content[:100])  # Log first 100 chars
        elif file.filename.endswith('.pdf'):
            # Optionally extract text from PDF using PyPDF2 or pdfplumber
            logger.debug("Uploaded a PDF file, path: %s", filepath)

        return jsonify({'message': 'File uploaded successfully', 'file_path': filepath})
    except Exception as e:
        logger.error("Error while processing file: %s", e)
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
        questions = question_generator(content, max_length=50, num_beams=3, num_return_sequences=3)
        return jsonify({'questions': [q['generated_text'] for q in questions]})
    except Exception as e:
        return jsonify({'error': f'Error generating questions: {e}'}), 500


if __name__ == '__main__':
    app.run(debug=True)
