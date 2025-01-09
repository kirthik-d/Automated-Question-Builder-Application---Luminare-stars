# populate_embeddings.py

from app import app, db  
from app import LearningMaterials, QuestionBank  
from app import store_embeddings   

def populate_embeddings():
    with app.app_context():
        store_embeddings()   
        print("Embeddings populated successfully.")

if __name__ == "__main__":
    populate_embeddings()
