import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FeedbackCollection() {
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState('');
  const [newFeedback, setNewFeedback] = useState({ user: '', feedback: '', rating: '' });
  
  useEffect(() => {
    // Fetch feedback for the generated question banks
    const fetchFeedback = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/get-feedback');
        setFeedback(response.data.feedback);
      } catch (err) {
        setError('Failed to fetch feedback');
      }
    };
    fetchFeedback();
  }, []);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('http://127.0.0.1:5000/submit-feedback', newFeedback);
      setNewFeedback({ user: '', feedback: '', rating: '' });
      // Re-fetch feedback after successful submission
      const response = await axios.get('http://127.0.0.1:5000/get-feedback');
      setFeedback(response.data.feedback);
    } catch (err) {
      setError('Failed to submit feedback');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">Feedback Collection</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleSubmitFeedback} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700">User</label>
            <input
              type="text"
              value={newFeedback.user}
              onChange={(e) => setNewFeedback({ ...newFeedback, user: e.target.value })}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Feedback</label>
            <textarea
              value={newFeedback.feedback}
              onChange={(e) => setNewFeedback({ ...newFeedback, feedback: e.target.value })}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
            <input
              type="number"
              value={newFeedback.rating}
              onChange={(e) => setNewFeedback({ ...newFeedback, rating: e.target.value })}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md"
              min="1"
              max="5"
              required
            />
          </div>
          <button type="submit" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md">
            Submit Feedback
          </button>
        </form>

        {feedback.length > 0 ? (
          <div className="space-y-4">
            {feedback.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-100 rounded-md shadow-sm">
                <strong className="block text-gray-800 mb-2">User: {item.user}</strong>
                <p className="text-gray-600">Feedback: {item.feedback}</p>
                <p className="text-gray-600">Rating: {item.rating}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No feedback available.</p>
        )}
      </div>
    </div>
  );
}

export default FeedbackCollection;
