import React from "react";
import Footer from "./Footer";
const MainDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Banner Section */}
      <section
        id="home"
        className="relative flex items-center justify-center h-screen bg-cover bg-left"
        style={{ backgroundImage: `url("https://videos.workvivo.com/img/desktop/C4s51FZDqeV2eNYUuiKtNs7ibqaUkSEOgnljOMcr.jpg?Expires=1736035199&Signature=UKdtA-jyUsqKf7pvev7rxe5MapH32hgUnpNNPwbSsBJQHw5Wj4o64mqLekEM6uxjmFsPvZxDPZNf9E6U~n~iRKdh7-fNc7JPGqVdF1EVPJJ0uzp9XwkCOzmzZQVfQPVIBwhZ9APXjoc1eyaiBoORFgUYv4O5oPg5yzNNBqFvzFRM3QOqL5y-4ed-p7RRztcxdkuwljct0UUlzFHrA~rGK6~ZWDk4zCQL5JvYIE6kE4OKupZuQfcTt3qO5mSzMb32T1Lr2sLEAbZuE3VA2nGrgrwIZAwr89mR5JPl2i53SKeKbGEWxOOJ0tL~4pWvQ~n~qN7xolcIBWDFYiG2-ZIOiA__&Key-Pair-Id=APKAIYJJXCSLTUXVFNWQ")`, 
        height: '500px'
        }}
        
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 justify-start pt-34"></div>
        <div className="relative text-center text-white justify-start p-8 pt-48 px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold">Welcome to Automated Question Builder</h1>
          <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto">
            Your one-stop solution for creating, managing, and enhancing learning experiences through AI-powered question banks.
          </p>
          <a
            href="#services"
            className="inline-block mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all"
          >
            Explore Our Services
          </a>
        </div>
      </section>

      <main className="flex-1 w-full">
        {/* About Section */}
        <section id="about" className="py-16 bg-gray-50">
          <h2 className="text-3xl font-bold text-center text-gray-800">About Us</h2>
          <p className="text-gray-600 mt-4 max-w-4xl mx-auto text-center text-lg">
            The Automated Question Builder application streamlines learning and assessments by leveraging cutting-edge technology to provide a seamless experience for administrators, trainers, and employees.
          </p>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 bg-white">
          <h2 className="text-3xl font-bold text-center text-gray-800">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8 rounded-lg shadow-lg text-center text-white hover:scale-105 transform transition-all">
              <h3 className="text-xl font-semibold">Administrator</h3>
              <p className="mt-4">
                Manage users, monitor systems, and generate detailed reports to ensure a smooth operation.
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-teal-500 p-8 rounded-lg shadow-lg text-center text-white hover:scale-105 transform transition-all">
              <h3 className="text-xl font-semibold">Trainer</h3>
              <p className="mt-4">
                Upload curriculums, generate question banks, and review content to deliver quality training.
              </p>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-8 rounded-lg shadow-lg text-center text-white hover:scale-105 transform transition-all">
              <h3 className="text-xl font-semibold">Employee</h3>
              <p className="mt-4">
                Perform self-assessments, provide feedback, and request learning plans tailored to your needs.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links Section */}
        <section id="quicklinks" className="py-16 bg-gray-100">
          <h2 className="text-3xl font-bold text-center text-gray-800">Quick Links</h2>
          <ul className="mt-6 text-center space-y-4">
            {[
              { label: "Admin Dashboard", link: "/admin" },
              { label: "Trainer Dashboard", link: "/trainer" },
              { label: "Employee Dashboard", link: "/employee" },
              { label: "About", link: "/#about" },
              { label: "Services", link: "/#services" },
              { label: "Contact Us", link: "/contactus" },
              { label: "Privacy Policy", link: "/privacy-policy" },
              { label: "Terms of Service", link: "/terms-of-service" },
            ].map((item, index) => (
              <li key={index}>
                <a
                  href={item.link}
                  className="text-blue-600 hover:underline hover:text-blue-800 font-medium transition-all"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Footer/>
        </section>
      </main>
    </div>
  );
};

export default MainDashboard;