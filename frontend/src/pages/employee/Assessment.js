import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

const Assessment = () => {
  const { state } = useLocation();
  const questionBank = state?.questionBank;
  const transaction_id = questionBank.transaction_id;
  const [questions, setQuestions] = useState([]);
  const [shuffledIndices, setShuffledIndices] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [remainingTime, setRemainingTime] = useState(
    questionBank.estimated_time * 60
  );
  const [violations, setViolations] = useState(0);
  const maxViolations = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const {user} = useAuth();
  const today = new Date();
  const currentDate = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;
  const navigate = useNavigate();

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);
  
  const handleBeforeUnload = useCallback(
    (event) => {
      if (!isSubmittingRef.current) {
        event.preventDefault();
        event.returnValue =
          "Are you sure you want to leave this page? Your progress will be lost.";
      }
    },
    []
  );
  
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "hidden" && !isSubmittingRef.current) {
      setViolations((prev) => prev + 1);
      alert("Warning: Navigating away is prohibited during the assessment!");
    }
  }, []);
  
  const cleanupListeners = useCallback(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleBeforeUnload, handleVisibilityChange]);
  

  const submitAssessment = useCallback(
    () => {
      setIsSubmitting(true);
      cleanupListeners();

      const name = user?.name;
      const employeeEmail = localStorage.getItem("user_email");

      fetch("http://127.0.0.1:5000/api/submit-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id,
          answers,
          employee_email: employeeEmail,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.status === "Pass") {
            navigate("/generate-certificate", {
              state: {
                employeeEmail,
                name,
                currentDate,
                certification_name: questionBank.technologies + " with the score of " + result.score,
                score: result.score
              },
            }, {replace: true});
          } else {
            alert(`You failed the assessment with the score of ${result.score}. Redirecting to self-assessment...`);
            navigate("/employee", {replace: true});
          }
        })
        .catch((err) => {
          console.error("Failed to submit assessment", err);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    },
    [answers,
      cleanupListeners,
      navigate,
      questionBank.technologies,
      transaction_id,
      user?.name,
      currentDate,]
  );

  const handleTimeOut = useCallback(() => {
    setRemainingTime(0);
    cleanupListeners();
    submitAssessment(true);
  }, [cleanupListeners, submitAssessment]);

  useEffect(() => {
    fetch(
      `http://127.0.0.1:5000/api/question-banks/${transaction_id}/questions`
    )
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        const indices = data.map((_, index) => index);
        setShuffledIndices(indices);
      })
      .catch((err) => console.error("Failed to fetch questions", err));

    const timer = setInterval(() => {
      setRemainingTime((time) => {
        if (time <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [transaction_id, handleTimeOut]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      cleanupListeners();
    };
  }, [handleBeforeUnload, handleVisibilityChange, cleanupListeners]);

  useEffect(() => {
    if (violations >= maxViolations) {
      alert(
        "You violated the rules too many times. The assessment has been terminated."
      );
      cleanupListeners();
      navigate("/employee", {replace: true});
    }
  }, [violations, cleanupListeners, navigate]);

  const handleAnswer = (answer) => {
    const currentQuestionId =
      questions[shuffledIndices[currentQuestionIndex]].id;
    setAnswers({ ...answers, [currentQuestionId]: answer });
  };

  const toggleMarkForReview = () => {
    const currentQuestionId =
      questions[shuffledIndices[currentQuestionIndex]].id;
    if (markedForReview.includes(currentQuestionId)) {
      setMarkedForReview(
        markedForReview.filter((id) => id !== currentQuestionId)
      );
    } else {
      setMarkedForReview([...markedForReview, currentQuestionId]);
    }
  };

  const renderSummary = () => (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Assessment Summary</h2>
      <ul className="list-disc ml-6">
        {shuffledIndices.map((index, idx) => {
          const question = questions[index];
          const isAnswered = question.id in answers;
          const isMarkedForReview = markedForReview.includes(question.id);

          return (
            <li key={index} className="mb-2 flex items-center">
              <button
                className={`py-2 px-4 rounded mr-4 ${
                  isAnswered ? "bg-green-500 text-white" : "bg-gray-300 text-black"
                }`}
                onClick={() => {
                  setCurrentQuestionIndex(idx);
                  setShowSummary(false);
                }}
              >
                Question {idx + 1} - {isAnswered ? "Answered" : "Not Answered"}
              </button>
              {isMarkedForReview && (
                <span className="text-yellow-500 font-semibold">
                  Marked for Review
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <button
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
        onClick={() => setShowSummary(false)}
      >
        Back to Assessment
      </button>
    </div>
  );

  const renderTimer = () => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return (
      <div className="text-right font-bold text-red-600">
        Time Remaining: {minutes}:{seconds.toString().padStart(2, "0")}
      </div>
    );
  };

  if (!questions.length || !shuffledIndices.length) {
    return <div>Loading questions...</div>;
  }

  const currentQuestion = questions[shuffledIndices[currentQuestionIndex]];

  return (
    <div className="p-6">
      {renderTimer()}
      {showSummary ? (
        renderSummary()
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">
            Assessment - {questionBank.technologies}
          </h2>
          <div className="mb-6">
            <h3 className="text-lg font-semibold">{`${currentQuestionIndex + 1}. ${
              currentQuestion.question_text
            }`}</h3>
            {currentQuestion.options.map((option, index) => (
              <label key={index} className="block mt-2">
                <input
                  type="radio"
                  name="option"
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleAnswer(option)}
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between">
            {currentQuestionIndex > 0 && (
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded"
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              >
                Back
              </button>
            )}
            <button
              className="bg-yellow-500 text-white py-2 px-4 rounded"
              onClick={toggleMarkForReview}
            >
              {markedForReview.includes(currentQuestion.id) ? "Unmark" : "Mark for Review"}
            </button>
            {currentQuestionIndex < shuffledIndices.length - 1 && (
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              >
                Next
              </button>
            )}
          </div>
          <div className="flex flex-col items-center mt-6">
            <button
              className="mb-2 bg-green-500 text-white py-2 px-4 rounded"
              onClick={() =>
                setShowSummary(true)}
                >
                  View Summary
                </button>
                <button
                  className="bg-green-500 text-white py-2 px-4 rounded"
                  onClick={submitAssessment}
                >
                  Submit Assessment
                </button>
              </div>
            </>
          )}
          {violations > 0 && (
            <p className="text-red-600 font-bold">
              Warning: {violations}/{maxViolations} violations recorded.
            </p>
          )}
        </div>
      );
    };
    
    export default Assessment;
    
