import React from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate, NavLink } from "react-router-dom";

const Header = () => {
  const { login, logout, isAuthenticated, user, getUserRole } = useAuth();
  const [userName, setUserName] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchRole = async () => {
      if (isAuthenticated) {
        try {
          const role = await getUserRole();
          setUserRole(role);
          setUserName(user?.name || "User");
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    if (isAuthenticated) {
      fetchRole();
    }
  }, [isAuthenticated, getUserRole, user]);

  const handleSSOLogin = async () => {
    try {
      await login();
      const role = await getUserRole();
      setUserRole(role);
      setUserName(user?.name || "User");

      if (role === "Admin") {
        navigate("/admin");
      } else if (role === "Trainer") {
        navigate("/trainer");
      } else if (role === "Employee") {
        navigate("/employee");
      } else {
        alert("Unauthorized role!");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <header className="w-full bg-white shadow-md py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <h1 className="text-xl font-bold">Automated Question Builder</h1>
        <nav className="flex items-center space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md ${
                isActive ? "text-white bg-blue-600" : "text-blue-600 hover:bg-blue-100"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md ${
                isActive ? "text-white bg-blue-600" : "text-blue-600 hover:bg-blue-100"
              }`
            }
          >
            Upload
          </NavLink>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-blue-600 font-semibold">Welcome, {userName}!</span>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={handleSSOLogin}
            >
              SSO Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
