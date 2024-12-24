import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProtectedRoute from "./auth/ProtectedRoute";
import MainDashboard from "./pages/MainDashboard";
import UnAuthorizedPage from "./pages/UnAuthorizedPage";
import ContactUs from "./pages/ContactUs";
import GenerateQuestionBank from "./pages/GenerateQuestionBank";
import FileDownloader from "./pages/FileDownloader";
import Assessment from "./pages/Assessment";
import GenerateCertificate from "./pages/GenerateCertificate";

const AppLayout = ({ children }) => {
    const location = useLocation();

    const excludeHomeRoutes = ["/employee/assessment"];
    const isExcluded = excludeHomeRoutes.some((route) =>
      location.pathname.startsWith(route)
    );
  
    return (
      <>
        {!isExcluded && <Home />}  
        {children}
      </>
    );
  };
const App = () => (
    <Router>
        <AppLayout />
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
                path="/generateQuestionBank"
                element={
                    <ProtectedRoute allowedRoles={["Trainer"]}>
                        <GenerateQuestionBank />
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
            <Route path="/employee/assessment/:transactionId" 
                element={
                    <ProtectedRoute allowedRoles={["Employee"]}>
                        <Assessment />
                    </ProtectedRoute>
                } 
            />
            <Route
                path="/generate-certificate"
                element={
                    <ProtectedRoute allowedRoles={["Employee"]}>
                        <GenerateCertificate />
                    </ProtectedRoute>
                }
            />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/download/:transactionId" element={<FileDownloader />} />
            <Route path="/unauthorized" element={<UnAuthorizedPage />} />
            <Route path="*" element={<UnAuthorizedPage />} />
        </Routes>
    </Router>
);

export default App;
