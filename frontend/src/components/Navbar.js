import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const Navbar = () => {
    const { login, logout, isAuthenticated, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-blue-700 text-white px-4 py-3">
            <div className="flex justify-between items-center">
                <div className="text-lg font-bold">
                    <Link to="/">AI Generator</Link>
                </div>
                <button
                    className="md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    ☰
                </button>
                <div
                    className={`${
                        isOpen ? "block" : "hidden"
                    } md:flex space-x-4`}
                >
                    <Link to="/" className="hover:underline">
                        Home
                    </Link>
                    <Link to="/upload" className="hover:underline">
                        Upload
                    </Link>
                    <Link to="/feedback" className="hover:underline">
                        Feedback
                    </Link>
                    {!isAuthenticated ? (
                        <button onClick={login} className="hover:underline">
                            Login
                        </button>
                    ) : (
                        <button onClick={logout} className="hover:underline">
                            Logout ({user?.name || "User"})
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
