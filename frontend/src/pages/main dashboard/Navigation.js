import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";  
import { useAuth } from "../../auth/useAuth";

const Navigation = () => {
  const { login, logout, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSSOLogin = async () => {
    try {
      await login();
      //await getUserRole();

      const role = localStorage.getItem("userRole");
      if (role) {
        navigate(`/${role.toLowerCase()}`);
      } else {
        console.error("Role not found in localStorage");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const isActive = (path) => (location.pathname === path ? "text-blue-700" : "text-gray-600");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <header className="w-full bg-white shadow-md relative z-10">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 md:flex-row">
        {/* Logo */}
        <h1 className="text-xl font-bold md:text-left flex-1 text-center">
          Automated Question Builder
        </h1>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-4">
          <a
            href="/"
            className={`text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive("/")}`}
          >
            Home
          </a>
          <a
            href="/#about"
            className={`text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive("/#about")}`}
          >
            About
          </a>
          <a
            href="/#services"
            className={`text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive("/#services")}`}
          >
            Services
          </a>
          <a
            href="/contactus"
            className={`text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive("/contactus")}`}
          >
            Contact
          </a>
          {isAuthenticated ? (
            <div className="text-blue-600 font-semibold flex items-center space-x-4">
              <span>Welcome, {user?.name || "User"}!</span>
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

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav
          className="absolute top-full left-0 w-full bg-white shadow-lg flex flex-col items-center md:hidden z-50"
        >
          <a
            href="/"
            className={`block text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive("/")}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </a>
          <a
            href="/#about"
            className={`block text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive("/#about")}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </a>
          <a
            href="/#services"
            className={`block text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive("/#services")}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Services
          </a>
          <a
            href="/contactus"
            className={`block text-gray-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-md transition-all ${isActive("/contactus")}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </a>
          {isAuthenticated ? (
            <button
              className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none mt-2"
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
            >
              Logout
            </button>
          ) : (
            <button
              className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none mt-2"
              onClick={() => {
                handleSSOLogin();
                setIsMobileMenuOpen(false);
              }}
            >
              SSO Login
            </button>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navigation;
