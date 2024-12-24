import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth"; // Import the useAuth hook

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, userRole, loading } = useAuth(); // Get auth state
    const [isReady, setIsReady] = useState(false); // Track if auth state is ready
    // This effect ensures the route will only render after isAuthenticated and userRole are updated
    useEffect(() => {
        if (!loading && (isAuthenticated || userRole)) {
            setIsReady(true); // Set ready state once authentication and role are determined
        }
    }, [isAuthenticated, userRole, loading]);

    // If auth state is still being fetched, show loading
    if (!isReady) {
        return <div>Loading...</div>;
    }

    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // If the user doesn't have the right role, redirect to Unauthorized page
    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // If authenticated and role matches, render the children (protected content)
    return children;
};

export default ProtectedRoute;
