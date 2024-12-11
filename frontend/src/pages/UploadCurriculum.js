import React, { useState } from 'react';
import axios from 'axios';
import ExportToPDF from './ExportToPDF.js';
import ExportToCSV from './ExportToCSV.js';

function UploadCurriculum() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      setError('');
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response)
      setQuestions(response.data.questions); // Assuming the API returns generated questions.
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">Upload Curriculum</h1>
        <form onSubmit={handleUpload} className="mb-6">
          <div className="mb-4">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Upload Curriculum
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {questions.length > 0 && (
          <div>
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
            <div className="mt-6 flex gap-4">
              <ExportToCSV questions={questions} />
              <ExportToPDF questions={questions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadCurriculum;
