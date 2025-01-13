import React, { useEffect, useState } from "react";
import axios from "axios";

const ReviewEditQuestionBank = ({ transactionId }) => {
  const [questions, setQuestions] = useState([]);
  const [approvedQuestions, setApprovedQuestions] = useState([]);
  const [inputTransactionId, setInputTransactionId] = useState(transactionId || "");
  const [passingPercentage, setPassingPercentage] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    options: ["", "", "", ""],
    correct_answer: "",
    difficulty: "",
    topics: "",
  });
  const [technologies, setTechnologies] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  useEffect(() => {
    fetchQuestions(inputTransactionId || null); // Pass null if no transaction_id
  }, [inputTransactionId]); // Re-fetch when transactionId changes

  const fetchQuestions = async (id) => {
    try {
      const params = id
        ? { transaction_id: id, user_email: localStorage.getItem("user_email") }
        : { user_email: localStorage.getItem("user_email") };

      const response = await axios.get("http://127.0.0.1:5000/get-questions", { params });

      if (response.data.questions.length > 0) {
        const generated = response.data.questions.filter((q) => q.status === "Generated");
        const approved = response.data.questions.filter((q) => q.status === "Approved");

        setQuestions(generated);
        setApprovedQuestions(approved);
        setTechnologies(response.data.question_bank.technologies);
        setCreatedBy(response.data.question_bank.created_by);

        if (!id) {
          setInputTransactionId(response.data.questions[0].transaction_id);
        }

        setPassingPercentage(response.data.question_bank.passing_percentage || 0);
        setMaxAttempts(response.data.question_bank.max_attempts || 0);
        setEstimatedTime(response.data.question_bank.estimated_time || 0);
      } else {
        setQuestions([]);
        setApprovedQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleEdit = async (id, updatedQuestion) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, ...updatedQuestion } : q
    );
    setQuestions(updatedQuestions);

    const updatedPayload = {
      id,
      ...updatedQuestion,
    };

    try {
      await axios.post("http://127.0.0.1:5000/update-questions", updatedPayload);
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post("http://127.0.0.1:5000/approve-question", { id });
      fetchQuestions(inputTransactionId || transactionId);
    } catch (error) {
      console.error("Error approving question:", error);
    }
  };

  const handleApproveAll = async () => {
    try {
      await axios.post("http://127.0.0.1:5000/approve-all-questions", {
        transaction_id: inputTransactionId || transactionId,
      });
      fetchQuestions(inputTransactionId || transactionId);
    } catch (error) {
      console.error("Error approving all questions:", error);
    }
  };

  const handleEditApproved = async (id, updatedFields) => {
    const updatedQuestions = approvedQuestions.map((q) =>
      q.id === id ? { ...q, ...updatedFields } : q
    ); 
    setApprovedQuestions(updatedQuestions);
    const updatedPayload = {
      id,
      ...updatedFields,
    };

    try {
      await axios.post("http://127.0.0.1:5000/update-questions", updatedPayload);
    } catch (error) {
      console.error("Error updating question:", error);
    } 
  };

  const handleTransactionSubmit = () => {
    if (inputTransactionId) {
      fetchQuestions(inputTransactionId);
    }
  };

  const handlePassingPercentageChange = async (newValue) => {
    setPassingPercentage(newValue);
    try {
      await axios.post("http://127.0.0.1:5000/update-question-bank", {
        transaction_id: inputTransactionId,
        passing_percentage: newValue,
      });
    } catch (error) {
      console.error("Error updating passing percentage:", error);
    }
  };

  const handleMaxAttemptsChange = async (newValue) => {
    setMaxAttempts(newValue);
    try {
      await axios.post("http://127.0.0.1:5000/update-question-bank", {
        transaction_id: inputTransactionId,
        max_attempts: newValue,
      });
    } catch (error) {
      console.error("Error updating max attempts:", error);
    }
  };

  const handleEstimatedTimeChange = async (newValue) => {
    setEstimatedTime(newValue);
    try {
      await axios.post("http://127.0.0.1:5000/update-question-bank", {
        transaction_id: inputTransactionId,
        estimated_time: newValue,
      });
    } catch (error) {
      console.error("Error updating estimated time:", error);
    }
  };

  const handleAddQuestion = async () => {
    console.log(newQuestion.options)
    try {
      const payload = {
        ...newQuestion,
        transaction_id: inputTransactionId,
        status: "Approved",
        technologies: technologies,
        created_by: createdBy,
        options: Array.isArray(newQuestion.options) ? newQuestion.options.join("|") : ""
      };

      const response = await axios.post("http://127.0.0.1:5000/add-question", payload);

      if (response.status === 201) {
        const addedQuestion = response.data.question;
        setApprovedQuestions([...approvedQuestions, addedQuestion]);
        setShowAddQuestionForm(false);
        setNewQuestion({
          question_text: "",
          options: ["", "", "", ""],
          correct_answer: "",
          difficulty: "",
          topics: "",
        });
      }
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/delete-question/${id}`);
      setQuestions(questions.filter((q) => q.id !== id));
      setApprovedQuestions(approvedQuestions.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  return (
    <div>
      <h1 className="table-heading">Review and Edit Questions</h1>
      {inputTransactionId && (
        <div className="question-bank-info">
          <label>
            Passing Percentage:
            <input
              type="number"
              value={passingPercentage}
              onChange={(e) => handlePassingPercentageChange(Number(e.target.value))}
              className="percentage-input"
            />
          </label>
          <label>
            Max Attempts:
            <input
              type="number"
              value={maxAttempts}
              onChange={(e) => handleMaxAttemptsChange(Number(e.target.value))}
              className="attempts-input"
            />
          </label>
          <label>
            Estimated Time (mins):
            <input
              type="number"
              value={estimatedTime}
              onChange={(e) => handleEstimatedTimeChange(Number(e.target.value))}
              className="time-input"
            />
          </label>
        </div>
      )}

      <div className="transaction-input-container">
        <input
          type="text"
          placeholder="Enter Transaction ID"
          value={inputTransactionId}
          onChange={(e) => setInputTransactionId(e.target.value)}
          className="transaction-input"
        />
        <button onClick={handleTransactionSubmit} className="submit-btn">
          Submit
        </button>
      </div>

      <button onClick={() => setShowAddQuestionForm(!showAddQuestionForm)} className="add-question-btn">
        {showAddQuestionForm ? "Cancel" : "New Question"}
      </button>

      {showAddQuestionForm && (
        <div className="add-question-form">
          <h2>Add New Question</h2>
          <label>
            Question Text:
            <textarea
              value={newQuestion.question_text}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
              className="question-input"
            />
          </label>
          <label>
            Options:
            {newQuestion.options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => {
                  const updatedOptions = [...newQuestion.options];
                  updatedOptions[index] = e.target.value;
                  setNewQuestion({ ...newQuestion, options: updatedOptions });
                }}
                className="option-input"
              />
            ))}
          </label>
          <label>
            Correct Answer:
            <textarea
              type="text"
              value={newQuestion.correct_answer}
              onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
              className="correct-answer-input"
            />
          </label>
          <label>
            Difficulty:
            <input
              type="text"
              value={newQuestion.difficulty}
              onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
              className="difficulty-input"
            />
          </label> 
          <label>
            Topics:
            <textarea
              type="text"
              value={newQuestion.topics}
              onChange={(e) => setNewQuestion({ ...newQuestion, topics: e.target.value })}
              className="topics-input"
            />
          </label>
          <button onClick={handleAddQuestion} className="save-question-btn">
            Save Question
          </button>
        </div>
      )}

      {questions.length > 0 || approvedQuestions.length > 0 ? (
        <>
          {questions.length > 0 && (
            <>
              <button onClick={handleApproveAll} className="approve-all-btn">
                Approve All
              </button>

              <h2 className="subheading">Generated Questions</h2>
              <table className="question-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Question</th>
                    <th>Options</th>
                    <th>Correct Answer</th>
                    <th>Difficulty</th>
                    <th>Topics</th> 
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id}>
                      <td>{q.id}</td>
                      <td>
                        <textarea
                          value={q.question_text}
                          onChange={(e) => handleEdit(q.id, { question_text: e.target.value })}
                          className="question-input"
                        />
                      </td>
                      <td>
                        {Array.isArray(q.options) ? (
                          q.options.map((option, index) => (
                            <input
                              key={index}
                              type="text"
                              value={option || ""}
                              onChange={(e) => {
                                const updatedOptions = [...q.options];
                                updatedOptions[index] = e.target.value;
                                handleEdit(q.id, { options: updatedOptions });
                              }}
                              className="option-input"
                            />
                          ))
                        ) : (
                          <textarea
                            value={q.options || ""}
                            onChange={(e) => handleEdit(q.id, { options: e.target.value.split("\n") })}
                            className="options-textarea"
                          />
                        )}
                      </td>
                      <td>
                        <textarea
                          type="text"
                          value={q.correct_answer || ""}
                          onChange={(e) => handleEdit(q.id, { correct_answer: e.target.value })}
                          className="correct-answer-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={q.difficulty || ""}
                          onChange={(e) => handleEdit(q.id, { difficulty: e.target.value })}
                          className="difficulty-input"
                        />
                      </td>
                      <td>
                        <textarea
                          type="text"
                          value={q.topics || ""}
                          onChange={(e) => handleEdit(q.id, { topics: e.target.value })}
                          className="topics-input"
                        />
                      </td>
                      <td>
                        <button onClick={() => handleApprove(q.id)} className="approve-btn">
                          Approve
                        </button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="delete-btn">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {approvedQuestions.length > 0 && (
            <>
              <h2 className="subheading">Approved Questions</h2>
              <table className="question-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Question</th>
                    <th>Options</th>
                    <th>Correct Answer</th>
                    <th>Difficulty</th>
                    <th>Topics</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedQuestions.map((q) => (
                    <tr key={q.id}>
                      <td>{q.id}</td>
                      <td>
                        <textarea
                          value={q.question_text}
                          onChange={(e) => handleEditApproved(q.id, { question_text: e.target.value })}
                          className="question-input"
                        />
                      </td>
                      <td>
                        {Array.isArray(q.options) ? (
                          q.options.map((option, index) => (
                            <input
                              key={index}
                              type="text"
                              value={option || ""}
                              onChange={(e) => {
                                const updatedOptions = [...q.options];
                                updatedOptions[index] = e.target.value;
                                handleEditApproved(q.id, { options: updatedOptions });
                              }}
                              className="option-input"
                            />
                          ))
                        ) : (
                          <textarea
                            value={q.options || ""}
                            onChange={(e) => handleEditApproved(q.id, { options: e.target.value.split("\n") })}
                            className="options-textarea"
                          />
                        )}
                      </td>
                      <td>
                        <textarea
                          type="text"
                          value={q.correct_answer || ""}
                          onChange={(e) => handleEditApproved(q.id, { correct_answer: e.target.value })}
                          className="correct-answer-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={q.difficulty || ""}
                          onChange={(e) => handleEditApproved(q.id, { difficulty: e.target.value })}
                          className="difficulty-input"
                        />
                      </td>
                      <td>
                        <textarea
                          type="text"
                          value={q.topics || ""}
                          onChange={(e) => handleEditApproved(q.id, { topics: e.target.value })}
                          className="topics-input"
                        />
                      </td>
                      <td>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="delete-btn">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      ) : (
        <div className="no-data-message">
          {inputTransactionId ? (
            <p>No questions found to approve for the provided transaction ID. Please generate a question bank for a new transaction or verify the transaction ID.</p>
          ) : (
            <p>Please enter a transaction ID to see past transaction data or generate a question bank to create a new transaction.</p>
          )}
        </div>
      )}

      <style jsx>{`
        .table-heading {
          font-weight: bold;
          margin-bottom: 15px;
        }

        .transaction-input-container {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .transaction-input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin-right: 10px;
        }

        .submit-btn,
        .approve-all-btn {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .approve-all-btn {
          margin-bottom: 10px;
          float: right;
        }

        .submit-btn:hover,
        .approve-all-btn:hover {
          background-color: #0056b3;
        }

        .question-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .question-table th,
        .question-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .question-table th {
          font-weight: bold;
          background-color: #f4f4f4;
        }

        .question-input {
          width: 100%;
          min-width: 250px;
          min-height: 150px;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 4px;
          resize: vertical;
        }

        .topics-input { 
          width: 100%;
          min-width: 200px;
          min-height: 150px;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .correct-answer-input {
          width: 100%;
          min-width: 200px;
          min-height: 150px;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .options-textarea {
          width: 100%;
          min-height: 100%;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 4px;
          resize: vertical;
        }

        .option-input {
          width: 100%;
          min-height: 100%;
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 4px;
          resize: vertical;
        }
        
        .approve-btn {
          padding: 8px 16px;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 3px;
        }

        .approve-btn:hover {
          background-color: #45a049;
        }

        .no-data-message {
          margin-top: 20px;
          color: #555;
          font-size: 16px;
          text-align: center;
        }

        .question-bank-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .percentage-input,
        .attempts-input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 100px;
          margin-left: 10px;
        }

        .time-input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 120px;
          margin-left: 10px;
        }

        .add-question-form {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 20px;
          margin-bottom: 20px;
          background-color: #f9f9f9;
        }
      
        .add-question-form h2 {
          margin-bottom: 15px;
          color: #333;
        }
      
        .add-question-form label {
          display: block;
          margin-bottom: 10px;
          font-weight: bold;
          color: #555;
        }
      
        .add-question-form textarea,
        .add-question-form input {
          width: 100%;
          padding: 8px;
          margin-top: 5px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 4px;
          resize: none;
        }
      
        .save-question-btn {
          padding: 10px 20px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: block;
          margin-top: 10px;
        }
      
        .save-question-btn:hover {
          background-color: #218838;
        }
      
        .delete-btn {
          padding: 8px 16px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      
        .delete-btn:hover {
          background-color: #c823e6;
        }
      
        .question-list {
          margin-top: 20px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
      
        .question-item {
          padding: 15px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #f8f9fa;
        }
      
        .question-item h4 {
          margin: 0 0 10px 0;
          color: #343a40;
        }
      
        .question-item p {
          margin: 0 0 5px 0;
          color: #495057;
        }
      
        .question-item .options {
          margin-top: 10px;
          list-style: none;
          padding: 0;
        }
      
        .question-item .options li {
          margin-bottom: 5px;
          color: #6c757d;
        }
      
        .question-item .options li.correct {
          font-weight: bold;
          color: #28a745;
        }
      
        .question-item .options li.incorrect {
          font-weight: bold;
          color: #dc3545;
        }
      
        .question-actions {
          margin-top: 10px;
          display: flex;
          gap: 10px;
        }

        .add-question-btn {
          padding: 12px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          display: inline-block;
          margin-bottom: 20px;
          margin-right: 5px;
        }
      
        .add-question-btn:hover {
          background-color: #0056b3;
        }

        .subheading {
          font-weight: bold;
          font-size: 18px; 
          color: #333; 
          margin-bottom: 10px; 
        }

        .difficulty-input {
          width: 100%;
          min-width:60px;
        }
      `}</style>      
    </div>
  );
};

export default ReviewEditQuestionBank;
