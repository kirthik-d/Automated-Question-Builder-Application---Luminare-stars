import React, { useState, useEffect } from "react";

const FeedbackSubmission = () => {
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [completedMaterials, setCompletedMaterials] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [isMaterialFeedback, setIsMaterialFeedback] = useState(false);

  // Fetch completed assessments for a specific employee
  useEffect(() => {
    const loggedInUserEmail = localStorage.getItem("user_email");
    const fetchCompletedData = async () => {
      try {
        // Fetch completed assessments
        const assessmentResponse = await fetch("http://127.0.0.1:5000/api/completed-assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_email: loggedInUserEmail }),
        });

        if (assessmentResponse.ok) {
          const assessmentData = await assessmentResponse.json();
          setCompletedAssessments(assessmentData);
        } else {
          console.error("Failed to fetch completed assessments.");
        }

        // Fetch completed materials
        const materialResponse = await fetch(`http://127.0.0.1:5000/api/learning-materials?user_email=${loggedInUserEmail}`);
        
        if (materialResponse.ok) {
          const materialData = await materialResponse.json();

          const completedMaterials = materialData.filter(material => material.is_completed === true);

          console.log(completedMaterials);
          setCompletedMaterials(completedMaterials);
        } else {
          console.error("Failed to fetch completed materials.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCompletedData();
  }, []);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || !rating || !selectedId) {
      alert("Please provide valid feedback and rating.");
      return;
    }

    try {
      const loggedInUserEmail = localStorage.getItem("user_email");
      const apiUrl = "http://127.0.0.1:5000/api/submit-feedback";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: !isMaterialFeedback ? selectedId : undefined,
          material_id: isMaterialFeedback ? selectedId : undefined,
          feedback,
          rating,
          user: loggedInUserEmail,
        }),
      });

      if (response.ok) {
        alert("Feedback submitted successfully!");
        setFeedback("");
        setRating(0);
        setSelectedId(null);
        setIsMaterialFeedback(false);
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
      <h2 className="text-2xl font-bold mb-6">Completed Assessments and Question Banks</h2>
      {/* Completed Assessments */}
      <div className="space-y-4">
        {completedAssessments.length > 0 ? (
          completedAssessments.map((assessment) => (
            <div
              key={assessment.transaction_id}
              className="p-4 bg-white shadow-md rounded-lg"
            >
              <h3 className="text-lg font-bold">{assessment.topics}</h3>
              <p className="text-gray-600">Technologies: {assessment.technologies}</p>
              <p className="text-gray-600">Completed on: {assessment.completed_at}</p>
              <button
                className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                onClick={() => {
                  setSelectedId(assessment.transaction_id);
                  setIsMaterialFeedback(false);
                }}
              >
                Provide Feedback
              </button>
            </div>
          ))
        ) : (
          <p>No completed assessments found.</p>
        )}
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-6">Completed Learning Materials</h2>
      {/* Completed Materials */}
      <div className="space-y-4">
        {completedMaterials.length > 0 ? (
          completedMaterials.map((material) => (
            <div
              key={material.id}
              className="p-4 bg-white shadow-md rounded-lg"
            >
              <h3 className="text-lg font-bold">{material.name}</h3>
              <p className="text-gray-600">Description: {material.description}</p>
              <p className="text-gray-600">Completed: {material.is_completed ? "Yes" : "No"}</p>
              <button
                className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                onClick={() => {
                  setSelectedId(material.id);
                  setIsMaterialFeedback(true);
                }}
              >
                Provide Feedback
              </button>
            </div>
          ))
        ) : (
          <p>No completed learning materials found.</p>
        )}
      </div>

      {/* Feedback Modal */}
      {selectedId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h3 className="text-xl font-bold mb-4">Provide Feedback</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="4"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Describe how this could be improved..."
            ></textarea>
            <div className="mt-4">
              <label className="block mb-2 text-gray-600">Rating: 1 (Lowest) - 5 (Highest): </label>
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
                onClick={() => setSelectedId(null)}
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
