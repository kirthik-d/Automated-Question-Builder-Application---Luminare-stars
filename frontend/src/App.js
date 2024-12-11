import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Feedback from "./pages/Feedback";
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import { AuthProvider } from "./auth/authProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
import MainDashboard from "./pages/MainDashboard";
import UnAuthorizedPage from "./pages/UnAuthorizedPage";
import ContactUs from "./pages/ContactUs";

const App = () => (
    <AuthProvider>
        <Router>
            <Home />
            <Routes>
                <Route path="/" element={<MainDashboard />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/trainer"
                    element={
                        <ProtectedRoute allowedRoles={["Trainer"]}>
                            <TrainerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/employee"
                    element={
                        <ProtectedRoute allowedRoles={["Employee"]}>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/contactus" element={<ContactUs />} />
                <Route path="/unauthorized" element={<UnAuthorizedPage />} />
                <Route path="*" element={<UnAuthorizedPage />} />
            </Routes>
        </Router>
    </AuthProvider>
);

export default App;
