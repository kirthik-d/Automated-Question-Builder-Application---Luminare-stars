import React, { useState } from "react";

function RequestLearningPlan() {
  const [selectedTechnology, setSelectedTechnology] = useState("");
  const [customTechnology, setCustomTechnology] = useState("");
  const [areasOfImprovement, setAreasOfImprovement] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [technologies] = useState(["React", "Python", "AWS"]); // Predifined technologies
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalTechnology = selectedTechnology === "custom" ? customTechnology : selectedTechnology;

    if (!finalTechnology || !areasOfImprovement || !learningGoals) {
      setMessage("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/request-learning-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technology: finalTechnology,
          areasOfImprovement,
          learningGoals,
          user_email: localStorage.getItem("user_email"),  
        }),
      });

      if (response.ok) {
        setMessage("Your learning plan request has been submitted successfully.");
      } else {
        setMessage("There was an issue submitting your request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting learning plan request:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Request a Personalized Learning Plan</h2>
      <p className="mb-6">Fill out the form below to request a learning plan tailored to your needs.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">Technology</label>
          <select
            value={selectedTechnology}
            onChange={(e) => setSelectedTechnology(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select a technology</option>
            {technologies.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
            <option value="custom">Other (Enter manually)</option>
          </select>
          {selectedTechnology === "custom" && (
            <input
              type="text"
              value={customTechnology}
              onChange={(e) => setCustomTechnology(e.target.value)}
              className="w-full mt-2 border rounded-lg p-2"
              placeholder="Enter custom technology"
            />
          )}
        </div>
        <div>
          <label className="block font-semibold mb-2">Areas of Improvement</label>
          <textarea
            value={areasOfImprovement}
            onChange={(e) => setAreasOfImprovement(e.target.value)}
            className="w-full border rounded-lg p-2"
            rows="4"
            placeholder="e.g., Understanding advanced concepts, debugging skills..."
          ></textarea>
        </div>
        <div>
          <label className="block font-semibold mb-2">Learning Goals</label>
          <textarea
            value={learningGoals}
            onChange={(e) => setLearningGoals(e.target.value)}
            className="w-full border rounded-lg p-2"
            rows="4"
            placeholder="e.g., Build an end-to-end project, improve coding efficiency..."
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
    </div>
  );
}

export default RequestLearningPlan;
