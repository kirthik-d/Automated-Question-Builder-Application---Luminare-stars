import React, { useState, useMemo } from 'react';
import Select from 'react-select';  
import makeAnimated from 'react-select/animated';
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

  // Convert topics and subtopics to dropdown options
  const topicOptions = useMemo(() => {
    return distinctTopics.map((topic) => ({
      value: topic,
      label: topic,
    }));
  }, [distinctTopics]);

  const subtopicOptions = useMemo(() => {
    return Object.entries(topicSubtopicMap).reduce((options, [topic, subtopics]) => {
      options[topic] = subtopics.map((subtopic) => ({
        value: subtopic,
        label: subtopic,
      }));
      return options;
    }, {});
  }, [topicSubtopicMap]);

  const handleTopicChange = (selected) => {
    const selectedMap = {};
    selected.forEach((option) => {
      selectedMap[option.value] = selectedTopics[option.value] || [];
    });
    setSelectedTopics(selectedMap);
  };

  const handleSubtopicChange = (topic, selected) => {
    setSelectedTopics((prev) => ({
      ...prev,
      [topic]: selected.map((option) => option.value),
    }));
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

  // const handleSelectAllSubtopics = (topic) => {
  //   setSelectedTopics((prevSelected) => ({
  //     ...prevSelected,
  //     [topic]: topicSubtopicMap[topic],
  //   }));
  // };

  // const handleClearAllSubtopics = (topic) => {
  //   setSelectedTopics((prevSelected) => ({
  //     ...prevSelected,
  //     [topic]: [],
  //   }));
  // };

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
            <div className="flex items-center">
              <Select
                isMulti
                options={topicOptions}
                components={makeAnimated()}
                onChange={handleTopicChange}
                value={Object.keys(selectedTopics).map((topic) => ({
                  value: topic,
                  label: topic,
                }))}
                className="mt-2 flex-grow"
                placeholder="Choose topics"
              />
              <button
                type="button"
                onClick={() => {
                  const allTopics = distinctTopics.reduce((map, topic) => {
                    map[topic] = subtopicOptions[topic].map((sub) => sub.value);
                    return map;
                  }, {});
                  setSelectedTopics(allTopics);
                }}
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Select All
              </button>
            </div>
          </div>


          {/* Subtopics Selection */}
          {Object.keys(selectedTopics).map((topic) => (
          <div key={topic} className="mb-4">
            <label className="block text-gray-700">Select Subtopics for {topic}</label>
            <div className="flex items-center">
              <Select
                isMulti
                options={subtopicOptions[topic]}
                components={makeAnimated()}
                onChange={(selected) => handleSubtopicChange(topic, selected)}
                value={selectedTopics[topic].map((sub) => ({
                  value: sub,
                  label: sub,
                }))}
                className="mt-2 flex-grow"
                placeholder={`Choose subtopics for ${topic}`}
              />
              <button
                type="button"
                onClick={() =>
                  setSelectedTopics((prev) => ({
                    ...prev,
                    [topic]: subtopicOptions[topic].map((sub) => sub.value),
                  }))
                }
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Select All
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
