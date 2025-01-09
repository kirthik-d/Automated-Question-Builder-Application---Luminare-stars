import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from "../../auth/useAuth";

function GenerateQuestionBank({ topics = [], subtopics = [], setActiveTab, predefinedTechnologies = [] }) {
  const [selectedTopics, setSelectedTopics] = useState({});
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [technologies, setTechnologies] = useState([
    "JavaScript",
    "Python",
    "Java",
    "C#",
    "Ruby",
    "PHP",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
  ]);  
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const [newTechnology, setNewTechnology] = useState("");

  const { user } = useAuth();

  // Memoize the mapping of subtopics to topics to avoid recalculating unnecessarily
  const topicSubtopicMap = useMemo(() => {
    const topicMap = {};
    topics.forEach((topic, index) => {
      if (!topicMap[topic]) topicMap[topic] = [];
      const parsedSubtopics = subtopics[index]
      ? subtopics[index].split(",").map((sub) => sub.trim())
      : [];
      topicMap[topic].push(...parsedSubtopics);
    });
    return topicMap;
  }, [topics, subtopics]);

  const distinctTopics = useMemo(() => Object.keys(topicSubtopicMap), [topicSubtopicMap]);

  const validateForm = () => {
    if (Object.keys(selectedTopics).length === 0) {
      setError('Please select at least one topic.');
      return false;
    }
    if (numQuestions <= 0) {
      setError('Number of questions must be greater than zero.');
      return false;
    }
    if (technologies.length === 0) {
      setError('Please select or add at least one technology.');
      return false;
    }
    return true;
  };

  const handleTopicChange = (topic) => {
    setSelectedTopics((prevSelected) => {
      const updated = { ...prevSelected };
      if (updated[topic]) {
        delete updated[topic]; // Deselect topic and its subtopics
      } else {
        updated[topic] = []; // Select topic with empty subtopics
      }
      return updated;
    });
  };

  const handleSubtopicChange = (topic, subtopic) => {
    setSelectedTopics((prevSelected) => {
      const updated = { ...prevSelected };
      if (!updated[topic]) {
        updated[topic] = [];
      }
      if (updated[topic].includes(subtopic)) {
        updated[topic] = updated[topic].filter((s) => s !== subtopic);
      } else {
        updated[topic] = [...updated[topic], subtopic];
      }
      return updated;
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setError("");
      setSuccessMessage("");
      setIsLoading(true);

      const selectedTopicsArray = Object.keys(selectedTopics);
      const selectedSubtopicsArray = selectedTopicsArray.flatMap((topic) =>
        selectedTopics[topic]
      );

      const response = await axios.post("http://127.0.0.1:5000/generate-quests", {
        topics: selectedTopicsArray,
        subtopics: selectedSubtopicsArray,
        technologies: selectedTechnologies.join(","),
        num_questions: numQuestions,
        difficulty,
        username: user?.username || "Trainer",
      });

      if (response.data && response.data.message) {
        const transactionId = response.data.message;
        setSuccessMessage(`Questions generated successfully! Transaction ID: ${transactionId}`);
        setTransactionId(transactionId);
      } else {
        setError(response?.data?.error || "An error occurred");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAllSubtopics = (topic) => {
    setSelectedTopics((prevSelected) => ({
      ...prevSelected,
      [topic]: topicSubtopicMap[topic],
    }));
  };

  const handleClearAllSubtopics = (topic) => {
    setSelectedTopics((prevSelected) => ({
      ...prevSelected,
      [topic]: [],
    }));
  };

  const handleReviewEditQuestionBank = () => {
    setActiveTab('reviewEditQuestionBank', transactionId);
  };

  const handleTechnologySelect = (technology) => {
    setSelectedTechnologies((prev) =>
      prev.includes(technology)
        ? prev.filter((tech) => tech !== technology) // Deselect
        : [...prev, technology] // Select
    );
  };

  const handleAddNewTechnology = () => {
    if (newTechnology.trim() && !technologies.includes(newTechnology)) {
      setTechnologies((prev) => [...prev, newTechnology]);
      setSelectedTechnologies((prev) => [...prev, newTechnology]);
      setNewTechnology("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">Generate Question Bank</h1>

        <form onSubmit={handleGenerate}>
          {/* Technology Selection */}
          <div className="mb-4">
            <label className="block text-gray-700">Select Technologies</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {technologies.map((tech, idx) => (
                <div key={idx} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`tech-${tech}`}
                    checked={selectedTechnologies.includes(tech)}
                    onChange={() => handleTechnologySelect(tech)}
                    className="mr-2"
                  />
                  <label htmlFor={`tech-${tech}`} className="text-gray-600">
                    {tech}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="text"
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                placeholder="Add a new technology"
                className="border rounded-md px-3 py-2 mr-2"
              />
              <button
                type="button"
                onClick={handleAddNewTechnology}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>

          {/* Topics Selection */}
          <div className="mb-4">
            <label className="block text-gray-700">Select Topics</label>
            <div className="space-y-2">
              {distinctTopics.length > 0 ? (
                distinctTopics.map((topic, idx) => (
                  <div key={idx} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`topic-${topic}`}
                      checked={!!selectedTopics[topic]}
                      onChange={() => handleTopicChange(topic)}
                      className="mr-2"
                    />
                    <label htmlFor={`topic-${topic}`} className="text-gray-600">
                      {topic}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No topics available. Upload curriculum.</p>
              )}
            </div>
          </div>

          {/* Subtopics for Selected Topics */}
          {Object.keys(selectedTopics).map((topic, idx) => (
            <div key={idx} className="mb-4">
              <label className="block text-gray-700">Select Subtopics for {topic}</label>
              <div className="space-y-2">
                {topicSubtopicMap[topic] && topicSubtopicMap[topic].length > 0 ? (
                  topicSubtopicMap[topic].map((subtopic, subIdx) => (
                    <div key={subIdx} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`subtopic-${topic}-${subtopic}`}
                        value={subtopic}
                        checked={selectedTopics[topic]?.includes(subtopic)}
                        onChange={() => handleSubtopicChange(topic, subtopic)}
                        className="mr-2"
                      />
                      <label htmlFor={`subtopic-${topic}-${subtopic}`} className="text-gray-600">
                        {subtopic}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No subtopics available.</p>
                )}
              </div>

              {/* Select All / Clear All Buttons for Subtopics */}
              <div className="flex space-x-4 mt-2">
                <button
                  type="button"
                  onClick={() => handleSelectAllSubtopics(topic)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => handleClearAllSubtopics(topic)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Clear All
                </button>
              </div>
            </div>
          ))}

          {/* Number of Questions */}
          <div className="mb-4">
            <label className="block text-gray-700">Number of Questions</label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
              min="1"
            />
          </div>

          {/* Difficulty Level */}
          <div className="mb-4">
            <label className="block text-gray-700">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md ${
              isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLoading ? 'Generating...' : 'Generate Question Bank'}
          </button>
        </form>

        {/* Display Messages */}
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {successMessage && (
          <p className="text-green-500 mt-4">
            {successMessage}{' '}
            <button
              onClick={handleReviewEditQuestionBank}
              className="text-blue-500 underline"
            >
              Go to Review and Edit
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default GenerateQuestionBank;
