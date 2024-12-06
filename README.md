# Automated-Question-Builder-Application---Luminare-stars

**Automated Question Builder Application** is an AI-driven platform designed to automate the creation of diverse question banks for training and assessment purposes. By leveraging advanced NLP and ML technologies, the application provides tailored questions based on user inputs while ensuring secure access for Hexaware employees.  

---

## **Table of Contents**  
1. [Project Overview](#project-overview)  
2. [Features](#features)  
3. [Folder Structure](#folder-structure)  
4. [Setup and Installation](#setup-and-installation)  
   - Backend Setup  
   - Frontend Setup  
5. [Usage](#usage)  
6. [API Endpoints](#api-endpoints)  
7. [Technologies Used](#technologies-used)  
8. [Contributing](#contributing)  
9. [License](#license)  

---

## **Project Overview**  
This application is designed to:  
- Automate question generation for MCQs, coding challenges, and case studies.  
- Allow customization of topics, question counts, and difficulty levels.  
- Provide secure access and real-time notifications.  

---

## **Features**  
- AI-powered question generation based on curriculum.  
- Curriculum upload in CSV/Excel format.  
- Role-Based Access Control (RBAC).  
- Multi-format question bank exports (Excel, PDF).  
- Real-time email notifications.  

---

## **Folder Structure**  
```plaintext  
/ProjectRoot  
├── /backend       # Backend API built with Python (Flask).  
│   ├── app.py     # Main application file.  
│   ├── /models    # AI/ML models and logic.  
│   ├── /routes    # Flask API endpoints.  
│   └── /static    # Static files for backend, if any.  
├── /frontend      # Frontend application built with React.js.  
│   ├── /src       # Source code for React.  
│   └── package.json # Frontend dependencies.  
└── README.md      # Project documentation.  
```  

---

## **Setup and Installation**  

### **Backend Setup**  
1. **Install Python and pip**  
   Ensure Python 3.11+ and pip are installed.  

2. **Set up a virtual environment**  
   ```bash  
   python -m venv venv  
   source venv/bin/activate  # For Linux/Mac  
   venv\Scripts\activate     # For Windows  
   ```  

3. **Install dependencies**  
   Navigate to the `backend` folder and run:  
   ```bash  
   pip install -r requirements.txt  
   ```  

4. **Run the Flask application**  
   Start the Flask server:  
   ```bash  
   flask run  
   ```  
   The backend will be available at `http://127.0.0.1:5000/`.  

### **Frontend Setup**  
1. **Install Node.js and npm**  
   Ensure Node.js and npm are installed.  

2. **Install dependencies**  
   Navigate to the `frontend` folder and run:  
   ```bash  
   npm install  
   ```  

3. **Start the React application**  
   ```bash  
   npm start  
   ```  
   The frontend will be available at `http://localhost:3000/`.  

---

## **Usage**  
1. **Upload Curriculum**  
   - Navigate to the curriculum upload page and upload a CSV/Excel file.  

2. **Customize Question Bank**  
   - Select topics, specify question count, and choose difficulty levels.  

3. **Generate Question Bank**  
   - Click "Generate," and wait for the notification about completion.  

4. **Download Question Bank**  
   - Download the generated question bank in Excel or PDF format.  

---

## **API Endpoints**  

| **Endpoint**           | **Method** | **Description**                           |  
|-------------------------|------------|-------------------------------------------|  
| `/upload-curriculum`    | POST       | Upload curriculum file (CSV/Excel).       |  
| `/generate-questions`   | POST       | Generate question bank based on inputs.   |  
| `/get-topics`           | GET        | Fetch topics from uploaded curriculum.    |  
| `/download-questions`   | GET        | Download the generated question bank.     |  

---

## **Technologies Used**  
- **Backend**: Python (Flask), Pandas, TensorFlow/PyTorch.  
- **Frontend**: React.js, Axios for API integration.  
- **Database**: PostgreSQL/MongoDB.  
- **File Storage**: AWS S3/Azure Blob Storage.  

---

## **Contributing**  
1. Fork the repository.  
2. Create a feature branch:  
   ```bash  
   git checkout -b feature-name  
   ```  
3. Commit your changes and push the branch.  
4. Submit a pull request for review.  

---

Feel free to reach out for queries or feature requests!  
