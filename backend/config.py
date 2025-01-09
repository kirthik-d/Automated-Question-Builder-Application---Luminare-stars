import os
from dotenv import load_dotenv

class Config:
    UPLOAD = 'uploads'
    if not os.path.exists(UPLOAD):
        os.makedirs(UPLOAD)

    UPLOAD_FOLDER = UPLOAD
    ALLOWED_EXTENSIONS = {'csv', 'xls', 'xlsx'}
    HUGGINGFACE_TOKEN = os.getenv('HUGGINGFACE_TOKEN')  
    NVIDIA_TOKEN = os.getenv('NVIDIA_TOKEN')

    # Set up the connection string for Supabase PostgreSQL
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Email server settings
    MAIL_SERVER = 'smtp.gmail.com' 
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')   
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
