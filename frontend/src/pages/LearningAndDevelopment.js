import React, { useState } from "react";

const LearningAndDevelopment = () => {
  const [questionBanks, setQuestionBanks] = useState([
    {
      id: 1,
      topic: "JavaScript Basics",
      technology: "JavaScript",
      difficulty: "Beginner",
      questions: [
        {
          id: 1,
          question: "What is the correct syntax for referring to an external script called 'xyz.js'?",
          options: [
            "<script src='xyz.js'>",
            "<script href='xyz.js'>",
            "<script name='xyz.js'>",
          ],
          correctAnswer: 0,
        },
        {
          id: 2,
          question: "Which company developed JavaScript?",
          options: ["Netscape", "Microsoft", "Google"],
          correctAnswer: 0,
        },
      ],
    },
    {
      id: 2,
      topic: "React Fundamentals",
      technology: "React",
      difficulty: "Intermediate",
      questions: [
        {
          id: 1,
          question: "What is the virtual DOM in React?",
          options: [
            "A lightweight copy of the actual DOM",
            "A real copy of the browser's DOM",
            "A DOM maintained on the server",
          ],
          correctAnswer: 0,
        },
      ],
    },
  ]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const startQuestionBank = (bank) => {
    setSelectedBank(bank);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
  };

  const handleAnswer = (optionIndex) => {
    const currentQuestion = selectedBank.questions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    setUserAnswers([
      ...userAnswers,
      { questionId: currentQuestion.id, isCorrect },
    ]);

    if (currentQuestionIndex + 1 < selectedBank.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const getScore = () => {
    return userAnswers.filter((answer) => answer.isCorrect).length;
  };

  return (
    <div className="learning-development-container">
      <h1>Learning and Development</h1>

      {!selectedBank && (
        <div className="question-bank-list">
          <h2>Available Question Banks</h2>
          {questionBanks.map((bank) => (
            <div key={bank.id} className="question-bank-item">
              <h3>{bank.topic}</h3>
              <p>Technology: {bank.technology}</p>
              <p>Difficulty: {bank.difficulty}</p>
              <button onClick={() => startQuestionBank(bank)}>Start</button>
            </div>
          ))}
        </div>
      )}

      {selectedBank && !showResults && (
        <div className="question-area">
          <h2>{selectedBank.topic}</h2>
          <p>Technology: {selectedBank.technology}</p>
          <div className="question">
            <h3>
              Question {currentQuestionIndex + 1}/{selectedBank.questions.length}
            </h3>
            <p>{selectedBank.questions[currentQuestionIndex].question}</p>
            {selectedBank.questions[currentQuestionIndex].options.map(
              (option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="option-btn"
                >
                  {option}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {showResults && (
        <div className="results-area">
          <h2>Results</h2>
          <p>
            You answered {getScore()} out of {selectedBank.questions.length}{" "}
            questions correctly.
          </p>
          <button onClick={() => setSelectedBank(null)}>Back to Question Banks</button>
        </div>
      )}

      <style jsx>{`
        .learning-development-container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .question-bank-list {
          margin-bottom: 20px;
        }
        .question-bank-item {
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .question-bank-item h3 {
          margin: 0;
        }
        .question-bank-item button {
          margin-top: 10px;
          padding: 8px 12px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .question-area {
          margin-top: 20px;
        }
        .question {
          margin-top: 20px;
        }
        .option-btn {
          display: block;
          margin: 10px 0;
          padding: 10px 15px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .results-area {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default LearningAndDevelopment;
