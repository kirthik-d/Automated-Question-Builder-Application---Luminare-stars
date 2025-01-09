import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./pages/main dashboard/Navigation";
import AdminDashboard from './pages/admin/AdminDashboard';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ProtectedRoute from "./auth/ProtectedRoute";
import MainDashboard from "./pages/main dashboard/MainDashboard";
import UnAuthorizedPage from "./pages/unauthorized/UnAuthorizedPage";
import ContactUs from "./pages/main dashboard/ContactUs";
import GenerateQuestionBank from "./pages/trainer/GenerateQuestionBank";
import FileDownloader from "./pages/main dashboard/FileDownloader";
import Assessment from "./pages/employee/Assessment";
import GenerateCertificate from "./pages/employee/GenerateCertificate"; 
const AppLayout = ({ children }) => {
    const location = useLocation();

    const excludeHomeRoutes = ["/employee/assessment"];
    const isExcluded = excludeHomeRoutes.some((route) =>
      location.pathname.startsWith(route)
    );
  
    return (
      <>
        {!isExcluded && <Navigation />}  
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
