import { useMsal } from "@azure/msal-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const { instance, accounts } = useMsal();
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "Employee"); // Default to "Employee"
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check localStorage for persisted auth state and role on component mount
  useEffect(() => {
    const storedAuthStatus = localStorage.getItem("authenticated");
    if (storedAuthStatus === "true") {
      setAuthenticated(true);
      setLoading(false);
    }
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      const loginResponse = await instance.loginPopup({
        scopes: ["User.Read"],
      });
      instance.setActiveAccount(loginResponse.account); 
      console.log("Login successful:", loginResponse);

      setAuthenticated(true);
      localStorage.setItem("authenticated", "true");

      // Fetch the role after login if it's not already set
      if (!userRole || userRole === "Employee") {
        await getUserRole(); // Fetch role if not already set
      }
    } catch (error) {
      console.error("Error during login:", error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    instance.logout();
    setAuthenticated(false);
    setUserRole("Employee"); // Reset role to default after logout
    localStorage.removeItem("authenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/"); 
  };

  const getUserRole = async () => {
    try {
      setLoading(true);
      const account = instance.getActiveAccount();
      if (!account) throw new Error("No active account found.");
  
      const tokenResponse = await instance.acquireTokenSilent({
        account,
        scopes: ["User.Read"],
      });
  
      const token = tokenResponse.idToken;
      const response = await fetch("http://127.0.0.1:5000/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Role validation failed");
      }
  
      const data = await response.json();
      const role = data.role || "Employee"; // Default to "Employee" if no role is found
      console.log("Fetched role:", role); // Log the role fetched from the API
      setUserRole(role);
      localStorage.setItem("userRole", role); // Persist role in localStorage
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole("Employee"); // Default to "Employee" if role fetching fails
      localStorage.setItem("userRole", "Employee"); // Persist default role
    } finally {
      setLoading(false);
    }
  };

  // Ensure that isAuthenticated is checked correctly based on the active account
  const isAuthenticated = authenticated && accounts.length > 0;

  return { login, logout, isAuthenticated, user: accounts[0], userRole, loading, getUserRole };
};
