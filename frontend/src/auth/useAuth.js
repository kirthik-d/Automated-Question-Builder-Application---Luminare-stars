import { useMsal } from "@azure/msal-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { useDashboardContext } from "./DashboardContext";

export const useAuth = () => {
  const { instance, accounts } = useMsal();
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "Employee");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setLogs, setMetrics, setActiveUsers } = useDashboardContext();

  useEffect(() => {
    const storedAuthStatus = localStorage.getItem("authenticated");
    if (storedAuthStatus === "true") {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    let socket;
    if (authenticated) {
      const userEmail = localStorage.getItem("user_email");
      const userRole = localStorage.getItem("userRole");

      socket = io("http://127.0.0.1:5000", {
        query: {
          user_id: userEmail?.split("@")[0],
          user_email: userEmail,
          user_role: userRole,
        },
        transports: ["websocket"],
      });

      socket.on("logs", (log) => {
        setLogs((prevLogs) => {
          const isDuplicate = prevLogs.some(
            (prevLog) =>
              prevLog.logMessage === log.logMessage &&
              prevLog.timestamp === log.timestamp
          );
          return isDuplicate ? prevLogs : [...prevLogs, log];
        });
      });

      socket.on("metrics", (metrics) => {
        setMetrics(metrics);
      });

      socket.on("active_users", (count) => {
        setActiveUsers(count);
      });

      // Cleanup socket connection on component unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [authenticated, setLogs, setMetrics, setActiveUsers]);

  const login = async () => {
    try {
      setLoading(true);
      const loginResponse = await instance.loginPopup({
        scopes: ["User.Read"],
      });
      instance.setActiveAccount(loginResponse.account);
      setAuthenticated(true);
      localStorage.setItem("authenticated", "true");

      const account = instance.getActiveAccount();
      if (!account) throw new Error("No active account found.");

      const tokenResponse = await instance.acquireTokenSilent({
        account,
        scopes: ["User.Read"],
      });

      const token = tokenResponse.idToken;
      localStorage.setItem("authToken", token);
      localStorage.setItem("user_email", account.username);

      await getUserRole();
      return true;
    } catch (error) {
      console.error("Error during login:", error);
      setAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const userEmail = localStorage.getItem("user_email");
      const userRole = localStorage.getItem("userRole");

      if (userEmail && userRole) {
        await axios.post("http://127.0.0.1:5000/logout", {
          user_email: userEmail,
          user_role: userRole,
        });
      }

      instance.logout();
      setAuthenticated(false);
      setUserRole("Employee");
      localStorage.clear();

      // Reset dashboard context
      setLogs([]);
      setMetrics({});
      setActiveUsers(0);

      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
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
      localStorage.setItem("authToken", token);

      const response = await fetch("http://127.0.0.1:5000/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Role validation failed");

      const data = await response.json();
      const role = data.role || "Employee";
      setUserRole(role);
      localStorage.setItem("userRole", role);
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole("Employee");
      localStorage.setItem("userRole", "Employee");
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = authenticated && accounts.length > 0;

  return { login, logout, isAuthenticated, user: accounts[0], userRole, loading, getUserRole };
};
