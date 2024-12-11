import React, { useEffect, useState } from "react";
import axios from "axios";

const ReviewEditQuestionBank = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/get-questions", { params: { status: "Generated" } });
      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleEdit = async (id, updatedQuestion) => {
    try {
      await axios.post("http://127.0.0.1:5000/update-questions", updatedQuestion);
      fetchQuestions(); // Refresh the list
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post("http://127.0.0.1:5000/approve-question", { id });
      fetchQuestions(); // Refresh the list
    } catch (error) {
      console.error("Error approving question:", error);
    }
  };

  return (
    <div>
      <h1>Review and Edit Questions</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Options</th>
            <th>Correct Answer</th>
            <th>Difficulty</th>
            <th>Topics</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.id}>
              <td>{q.id}</td>
              <td>
                <input
                  type="text"
                  value={q.question_text}
                  onChange={(e) => handleEdit(q.id, { ...q, question_text: e.target.value })}
                />
              </td>
              <td>
                <textarea
                  value={q.options ? q.options.join("\n") : ""}
                  onChange={(e) => handleEdit(q.id, { ...q, options: e.target.value.split("\n") })}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.correct_answer || ""}
                  onChange={(e) => handleEdit(q.id, { ...q, correct_answer: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.difficulty || ""}
                  onChange={(e) => handleEdit(q.id, { ...q, difficulty: e.target.value })}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={q.topics || ""}
                  onChange={(e) => handleEdit(q.id, { ...q, topics: e.target.value })}
                />
              </td>
              <td>{q.status}</td>
              <td>
                <button onClick={() => handleApprove(q.id)}>Approve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewEditQuestionBank;
