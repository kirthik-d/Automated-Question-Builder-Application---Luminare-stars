import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ExportToCSV from "./ExportToCSV";
import ExportToPDF from "./ExportToPDF";
import { useAuth } from "../auth/useAuth"; // Import the useAuth hook

function DownloadDistribute() {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [inputTransactionId, setInputTransactionId] = useState("");
  const [isLoginAttempted, setIsLoginAttempted] = useState(false);

  const { login } = useAuth(); // Access the login method from useAuth

  // Define fetchQuestions first
  const fetchQuestions = useCallback(
    async (transactionIdToFetch) => {
      try {
        setError(""); // Clear any previous errors
        setSuccessMessage(""); // Clear previous success messages
        const response = await axios.get("http://127.0.0.1:5000/get-approved-questions", {
          params: transactionIdToFetch ? { transaction_id: transactionIdToFetch } : undefined,
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        setQuestions(response.data.questions);
      } catch (error) {
        handleApiError(error, transactionIdToFetch); // Use handleApiError to handle errors
      }
    },
    [] 
  );

  // Define handleApiError and include fetchQuestions in the dependency array
  const handleApiError = useCallback(
    async (error, transactionIdToFetch) => {
      setSuccessMessage(""); // Clear any success message on error
      if (error.response && error.response.status === 401) {
        // Handle token expiration
        if (!isLoginAttempted) {
          console.log("Session expired. Prompting user to log in...");
          setIsLoginAttempted(true);
          const isLoggedIn = await login();
          if (isLoggedIn) {
            console.log("Login successful. Retrying API call...");
            await fetchQuestions(transactionIdToFetch); // Retry API call after login
          } else {
            setError("Authentication failed. Please try again.");
          }
        } else {
          setError("Authentication failed. Please refresh the page and log in again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
        console.error("API Error:", error);
      }
    },
    [isLoginAttempted, login, fetchQuestions] // Added fetchQuestions here as a dependency
  );

  // Fetch the last transaction's questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]); // fetch questions initially when component mounts

  const fetchQuestionsByTransactionId = async () => {
    await fetchQuestions(inputTransactionId);
    setSuccessMessage("Questions successfully fetched. You can now export them.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">Download and Distribute Question Bank</h1>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}

        {/* Section for exporting latest transaction */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Export Latest Transaction</h2>
          <p className="text-gray-600 mb-4">Click below to export the latest generated question bank questions.</p>
          <div className="flex gap-4">
            <ExportToCSV questions={questions} />
            <ExportToPDF questions={questions} />
          </div>
        </div>

        {/* Section for entering a Transaction ID */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">Enter Transaction ID</h2>
          <p className="text-gray-600 mb-4">If you want to export questions from a specific transaction, please enter the Transaction ID below.</p>
          <div className="mt-4 flex gap-4">
            <input
              type="text"
              placeholder="Enter Transaction ID"
              value={inputTransactionId}
              onChange={(e) => setInputTransactionId(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-1/2"
            />
            <button
              onClick={fetchQuestionsByTransactionId}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Fetch Questions
            </button>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="mt-6 flex gap-4">
            {/* If questions are fetched, allow exporting them */}
            <ExportToCSV questions={questions} />
            <ExportToPDF questions={questions} />
          </div>
        )}

        {questions.length === 0 && !error && (
          <p className="text-gray-500 mt-4">No questions available. Please enter a valid Transaction ID or export the latest transaction.</p>
        )}
      </div>
    </div>
  );
}

export default DownloadDistribute;
