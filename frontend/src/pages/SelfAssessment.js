import React, { useState, useEffect } from "react";
import {useNavigate} from "react-router-dom";

const SelfAssessment = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUserEmail = localStorage.getItem("user_email");
    fetch(`http://127.0.0.1:5000/api/question-banks?employee_email=${loggedInUserEmail}`)
      .then((res) => res.json())
      .then((data) => {
        const completed = data.filter((bank) => bank.passed === true);
        const available = data.filter((bank) => bank.passed === false);
        setCompletedAssessments(completed);
        setQuestionBanks(available);
      })
      .catch((err) => console.error("Failed to fetch question banks", err));
  }, []);

  const startAssessment = (bank) => {
    const openFullScreen = () => {
      const docElm = document.documentElement;
      if (docElm.requestFullscreen) docElm.requestFullscreen();
      else if (docElm.mozRequestFullScreen) docElm.mozRequestFullScreen();
      else if (docElm.webkitRequestFullscreen) docElm.webkitRequestFullscreen();
      else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
    };

    openFullScreen();
    navigate(`/employee/assessment/${bank.transaction_id}`, { state: { questionBank: bank } });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Available Question Banks</h2>
      {questionBanks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {questionBanks.map((bank) => (
            <div
              key={bank.transaction_id}
              className="p-4 bg-white shadow-lg rounded-lg cursor-pointer hover:bg-gray-100"
            >
              <h3 className="text-lg font-semibold">Technologies: {bank.technologies}</h3>
              <p className="text-gray-600">{bank.description}</p>
              <p className="text-gray-600">Difficulty: {bank.difficulty}</p>
              <p className="text-gray-600">
                Attempts Remaining: {bank.max_attempts - bank.attempts_taken}
              </p>
              <button
                onClick={() => startAssessment(bank)}
                className={`mt-4 p-2 ${
                  bank.attempts_taken > 0 ? "bg-yellow-500" : "bg-blue-500"
                } text-white rounded hover:opacity-90`}
              >
                {bank.attempts_taken > 0 ? "Reattempt Assessment" : "Start Assessment"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-lg">No available question banks at the moment.</p>
      )}
  
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Completed Assessments</h2>
        {completedAssessments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {completedAssessments.map((bank) => (
              <div
                key={bank.transaction_id}
                className="p-4 bg-white shadow-lg rounded-lg"
              >
                <h3 className="text-lg font-semibold">Technologies: {bank.technologies}</h3>
                <p className="text-gray-600">{bank.description}</p>
                <p className="text-gray-600">Difficulty: {bank.difficulty}</p>
                <p className="text-gray-600">
                  Maximum Score: {bank.max_score}
                </p>
                <p className="text-gray-600">
                  Attempts Remaining: {bank.max_attempts - bank.attempts_taken}
                </p>
                {bank.max_attempts > bank.attempts_taken && (
                  <button
                    onClick={() => startAssessment(bank)}
                    className="mt-4 p-2 bg-green-500 text-white rounded hover:opacity-90"
                  >
                    Reattempt Assessment
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-lg">You have not completed any assessments yet.</p>
        )}
      </div>
    </div>
  );  
};

export default SelfAssessment;
