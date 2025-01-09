import React, { useState } from 'react';
import axios from 'axios';

function UploadCurriculum({ setActiveTab }) {
  const [file, setFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      setError('');
      setUploadSuccess(false);
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      console.log(response);
      setTopics(response.data.topics);
      setSubtopics(response.data.subtopics);
      console.log(response.data.topics);
      console.log(response.data.subtopics);
      setUploadSuccess(true); // Mark success after upload
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while uploading the file.');
    }
  };

  const handleGenerateQuestionBank = () => {
    // Set the active tab to 'generateQuestionBank' after upload success
    setActiveTab('generateQuestionBank', { topics, subtopics });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">Upload Curriculum</h1>
        <form onSubmit={handleUpload} className="mb-6">
          <div className="mb-4">
            <input
              type="file"
              accept=".csv, .xls, .xlsx"
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

        {uploadSuccess && (
          <div className="mb-4">
            <p className="text-green-500">File uploaded successfully!</p>
            <button
              onClick={handleGenerateQuestionBank} // Call the function to change tab
              className="inline-block mt-4 text-blue-500 hover:underline"
            >
              Go to Generate Question Bank
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadCurriculum;
