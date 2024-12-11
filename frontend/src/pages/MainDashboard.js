import React from "react";

const MainDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Hero Banner Section */}
      <section
        id="home"
        className="relative flex items-center justify-center h-screen bg-cover bg-left"
        style={{ backgroundImage: `url("https://videos.workvivo.com/img/desktop/C4s51FZDqeV2eNYUuiKtNs7ibqaUkSEOgnljOMcr.jpg?Expires=1734479999&Signature=N9eSNWoPAnQok0xIGS1rt6jo5GmgHPHMoG5SIV-pCIq-thiH~10K4erz8pYrnPmdgPfeifCaV0hkx9tAatdpysQFpQ18kRfeUDsUfcozvh0jy1ZHwQMK~sNt4kZGjk-Jj04P6QhP5ukolK-N9V4Vnm-U5e4khDELIu-~InGnukCkj1~FZpM6ci0wF8qgyeoBBrpQcIU5NNo~GxEJ0nPes2xCJcBriPjFZu6mwFF1piAawhbVVF4vpBfBjiO-vHtqXahfA1YUQgM1XQf7oSLd6qG9PbqioAitkvZ8zr0FTemo~LSMui366F0JAOvqKzCGzwrZg9vIR5M4mo9502ExGA__&Key-Pair-Id=APKAIYJJXCSLTUXVFNWQ")`, height: '500px' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 justify-start pt-34"></div>
        <div className="relative z-10 text-center text-white justify-start p-8 pt-48 px-6">
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
              { label: "About", link: "/about" },
              { label: "Services", link: "/services" },
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
          <p className="text-center text-gray-600 mt-12 text-sm">
            &copy; 2024 Automated Question Builder. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
};

export default MainDashboard;