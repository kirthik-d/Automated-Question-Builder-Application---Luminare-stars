from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event
from sqlalchemy.orm import relationship
import pickle

db = SQLAlchemy()

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
    embedding = db.Column(db.PickleType)

    @staticmethod
    def generate_and_store_embedding(mapper, connection, target): 
        if not target.embedding and target.technologies:
            embedding = generate_embedding(target.technologies)
            target.embedding = embedding  

# Hook into the insert event for QuestionBank
event.listen(QuestionBank, 'before_insert', QuestionBank.generate_and_store_embedding)

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
    transaction_id = db.Column(db.String(255), nullable=True)  # Nullable for learning material feedback
    material_id = db.Column(db.Integer, nullable=True)  # Nullable for assessment feedback


# LearningMaterials Table
class LearningMaterials(db.Model):
    __tablename__ = "learning_materials"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    introduction = db.Column(db.Text)
    conclusion = db.Column(db.Text)
    resource_url = db.Column(db.Text)
    resource_type = db.Column(db.String(50))  
    technology = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    embedding = db.Column(db.PickleType)

    @staticmethod
    def generate_and_store_embedding(mapper, connection, target):
        # Generate the embedding only if it isn't already set
        if not target.embedding and target.technology:
            embedding = generate_embedding(target.technology)
            target.embedding = embedding  # Store the embedding directly

# Hook into the insert event for LearningMaterials
event.listen(LearningMaterials, 'before_insert', LearningMaterials.generate_and_store_embedding)

# UserProgress Table
class UserProgress(db.Model):
    __tablename__ = "user_progress"

    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(255), nullable=False)
    learning_material_id = db.Column(
        db.Integer, db.ForeignKey("learning_materials.id"), nullable=False
    )
    completed_pages = db.Column(db.Integer, default=0)
    total_pages = db.Column(db.Integer, default=0)
    is_completed = db.Column(db.Boolean, default=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    learning_material = db.relationship("LearningMaterials", backref="progress")

class LearningPlans(db.Model):
    __tablename__ = "learning_plans"

    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(255), nullable=False)
    plan_details = db.Column(db.Text, nullable=False)  # JSON for storing plan details
    created_at = db.Column(db.DateTime, default=datetime.utcnow)



