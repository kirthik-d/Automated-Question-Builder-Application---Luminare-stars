import React from "react";
import { useNavigate } from "react-router-dom";

const UnAuthorizedPage = () => {
  const navigate = useNavigate();

  const redirectToHome = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
        <h1 className="text-3xl font-bold text-red-600">403 Forbidden</h1>
        <p className="text-lg text-gray-600 mt-4">
          You do not have permission to view this page.
        </p>
        <button
          onClick={redirectToHome}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
};

export default UnAuthorizedPage;
