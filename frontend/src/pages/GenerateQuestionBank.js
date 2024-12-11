import React, { useState } from 'react';
import axios from 'axios';

function GenerateQuestionBank() {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    try {
      setError('');
      const response = await axios.post('http://127.0.0.1:5000/generate-quests', {
        topics: selectedTopics,
        num_questions: numQuestions,
        difficulty: difficulty,
      });
      setQuestions(response.data.questions); // Assuming the API returns the generated question bank.
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">Generate Question Bank</h1>

        {/* Topics Selection */}
        <div className="mb-4">
          <label className="block text-gray-700">Select Topics</label>
          <select
            multiple
            className="w-full px-3 py-2 border rounded-md"
            onChange={(e) => setSelectedTopics([...e.target.selectedOptions].map(option => option.value))}
          >
            <option value="JavaScript">JavaScript</option>
            <option value="React">React</option>
            <option value="NodeJS">NodeJS</option>
            {/* Add other topics */}
          </select>
        </div>

        {/* Number of Questions */}
        <div className="mb-4">
          <label className="block text-gray-700">Number of Questions</label>
          <input
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Difficulty Level */}
        <div className="mb-4">
          <label className="block text-gray-700">Difficulty Level</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Generate Question Bank
        </button>

        {/* Display Generated Questions */}
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {questions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Generated Questions</h2>
            <ul className="space-y-4">
              {questions.map((q, idx) => (
                <li key={idx} className="p-4 bg-gray-100 rounded-md shadow-sm">
                  <strong className="block text-gray-800 mb-2">{q.question}</strong>
                  <ul className="pl-5 list-disc text-gray-600">
                    {q.options.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default GenerateQuestionBank;
