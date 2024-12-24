import React, { useState, useEffect } from "react";

const FeedbackSubmission = () => {
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  // Fetch completed assessments for a specific employee
  useEffect(() => {
    const loggedInUserEmail = localStorage.getItem("user_email");
    const fetchCompletedAssessments = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/completed-assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_email: loggedInUserEmail }),  
        });

        if (response.ok) {
          const data = await response.json();
          setCompletedAssessments(data);
        } else {
          console.error("Failed to fetch completed assessments.");
        }
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };

    fetchCompletedAssessments();
  }, []);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || !rating || !selectedTransactionId) {
      alert("Please provide valid feedback and rating.");
      return;
    }

    try {
      const loggedInUserEmail = localStorage.getItem("user_email");
      const response = await fetch("http://127.0.0.1:5000/api/submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: selectedTransactionId,
          feedback,
          rating,
          user: loggedInUserEmail,  
        }),
      });

      if (response.ok) {
        alert("Feedback submitted successfully!");
        setFeedback("");
        setRating(0);
        setSelectedTransactionId(null);
      } else {
        console.error("Failed to submit feedback.");
        alert("Error submitting feedback.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Completed Assessments</h2>
      <div className="space-y-4">
        {completedAssessments.length > 0 ? (
          completedAssessments.map((assessment) => (
            <div
              key={assessment.transaction_id}
              className="p-4 bg-white shadow-md rounded-lg"
            >
              <h3 className="text-lg font-bold">{assessment.topics}</h3>
              <p className="text-gray-600">
                Technologies: {assessment.technologies}
              </p>
              <p className="text-gray-600">
                Completed on: {assessment.completed_at}
              </p>
              <button
                className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                onClick={() => setSelectedTransactionId(assessment.transaction_id)}
              >
                Provide Feedback
              </button>
            </div>
          ))
        ) : (
          <p>No completed assessments found.</p>
        )}
      </div>
      {selectedTransactionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h3 className="text-xl font-bold mb-4">Provide Feedback</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="4"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Describe how this assessment could be improved..."
            ></textarea>
            <div className="mt-4">
              <label className="block mb-2 text-gray-600">Rating: 1 (Lowest) - 5 (highest): </label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                min="1"
                max="5"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded"
                onClick={() => setSelectedTransactionId(null)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white py-2 px-4 rounded"
                onClick={handleSubmitFeedback}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackSubmission;
