// import React, { useState } from 'react';
// import axios from 'axios';
// import ExportToPDF from './ExportToPDF.js';
// import ExportToCSV from './ExportToCSV.js';

// function Home() {
//     const [content, setContent] = useState('');
//     const [questions, setQuestions] = useState([]);
//     const [error, setError] = useState('');

//     const handleGenerate = async () => {
//         try {
//             setError('');
//             const response = await axios.post('http://127.0.0.1:5000/generate-questions', { content });
//             setQuestions(response.data.questions);
//         } catch (err) {
//             setError(err.response?.data?.error || 'An error occurred');
//         }
//     };   

//     return (
//         <div className="min-h-screen bg-gray-100 p-6">
//             <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
//                 <h1 className="text-2xl font-bold text-gray-800 mb-4">Generate Questions</h1>
//                 <textarea
//                     value={content}
//                     onChange={(e) => setContent(e.target.value)}
//                     placeholder="Enter content here..."
//                     className="w-full p-4 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button
//                     onClick={handleGenerate}
//                     className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
//                 >
//                     Generate Questions
//                 </button>

//                 {error && <p className="text-red-500 mt-4">{error}</p>}

//                 {questions.length > 0 && (
//                     <div>
//                         <h2 className="text-xl font-semibold mb-4 text-gray-700">Generated Questions</h2>
//                         <ul className="space-y-4">
//                         {questions.map((q, idx) => (
//                             <li key={idx} className="p-4 bg-gray-100 rounded-md shadow-sm">
//                             <strong className="block text-gray-800 mb-2">{q.question}</strong>
//                             <ul className="pl-5 list-disc text-gray-600">
//                                 {q.options.map((opt, i) => (
//                                 <li key={i}>{opt}</li>
//                                 ))}
//                             </ul>
//                             </li>
//                         ))}
//                         </ul>
//                         <div className="mt-6 flex gap-4">
//                         <ExportToCSV questions={questions} />
//                         <ExportToPDF questions={questions} />
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default Home;
// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// function Home() {
//   const navigate = useNavigate();

//   const handleLogin = (role) => {
//     if (role === 'admin') navigate('/admin');
//     if (role === 'trainer') navigate('/trainer');
//     if (role === 'employee') navigate('/employee');
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
//       <div className="bg-white rounded-lg shadow-lg p-8 w-96">
//         <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
//         <div className="space-y-4">
//           <button
//             className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
//             onClick={() => handleLogin('admin')}
//           >
//             Admin Login
//           </button>
//           <button
//             className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg"
//             onClick={() => handleLogin('trainer')}
//           >
//             Trainer Login
//           </button>
//           <button
//             className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
//             onClick={() => handleLogin('employee')}
//           >
//             Employee Login
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Home;
// Home.js 
import React from "react";
import { useNavigate, useLocation } from "react-router-dom"; // To navigate and get the current path
import { useAuth } from "../auth/useAuth";

const Home = () => {
  const { login, logout, isAuthenticated, user, loading, getUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location to determine the active link

  const handleSSOLogin = async () => {
    try {
      await login(); // Wait for login to complete
      await getUserRole(); // Fetch the role from the API and update the state
  
      const role = localStorage.getItem("userRole"); // Get the updated role from localStorage
      console.log("Role from localStorage:", role); // Log the role before navigating
  
      if (role) {
        console.log("Navigating to role:", role); // Log to ensure the role is valid
        navigate(`/${role.toLowerCase()}`); // Redirect to the appropriate dashboard based on the role
      } else {
        console.error("Role not found in localStorage");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const isActive = (path) => location.pathname === path ? 'text-blue-700' : 'text-gray-600'; // Check if the link is active

  return (
    <header className="w-full bg-white shadow-md py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <h1 className="text-xl font-bold">Automated Question Builder</h1>
        <nav className="flex items-center space-x-4">
          <a
            href="/"
            className={`text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive('/')}`}
          >
            Home
          </a>
          <a
            href="/#about"
            className={`text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive('/#about')}`}
          >
            About
          </a>
          <a
            href="/#services"
            className={`text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive('/#services')}`}
          >
            Services
          </a>
          <a
            href="/contactus"
            className={`text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive('/contactus')}`}
          >
            Contact
          </a>

          {isAuthenticated ? (
            <div className="text-blue-600 font-semibold">
              <span>Welcome, {user?.name || "User"}! </span>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none active:bg-blue-800"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none active:bg-blue-800"
              onClick={handleSSOLogin}
            >
              SSO Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Home;
