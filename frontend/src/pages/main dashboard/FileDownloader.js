import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";  
import axios from "axios";

const FileDownloader = () => {
  const { transactionId } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate(); // To navigate to the home page
  const [isLoginAttempted, setIsLoginAttempted] = useState(false);
  const [error, setError] = useState(null); // State to handle and display errors
  const [successMessage, setSuccessMessage] = useState(null); // Track success message
  const [isDownloaded, setIsDownloaded] = useState(false); // Track if the file has already been downloaded

  // Function to trigger the file download
  const downloadFile = async (authToken) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/download/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "blob",
        }
      );

      // Handle the downloaded file and create the download link
      const blob = new Blob([response.data], { type: "application/octet-stream" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = transactionId; // Set the download file name
      link.click(); // Trigger the download

      // Clean up the link after triggering download
      URL.revokeObjectURL(url);

      // Mark that the file has been downloaded
      setIsDownloaded(true);
      setSuccessMessage("File downloaded successfully!");

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate("/"); // Redirect to home page after 3 seconds
      }, 3000);
    } catch (error) {
      console.error("Error downloading the file:", error);

      if (error.response) {
        // Extract error message and status code from the backend response
        const statusCode = error.response.status;
        const errorMessage = error.response.data.error;
  
        console.error(`Error (${statusCode}): ${errorMessage}`);
  
        // Handle specific cases based on status code
        if (statusCode === 401) {
          console.log("Session expired. Prompting user to log in...");
          if (!isLoginAttempted) {
            setIsLoginAttempted(true); // Mark login as attempted
            await login(); // Call login to show the login window
  
            // Retry downloading the file after login
            await fetchFile();
          } else {
            setError("Authentication failed. Please try again."); // Prevent infinite retries
          }
        } else {
          console.log("Unexpected error:", errorMessage);
        }
      } else {
        console.error("Network or other error:", error.message);
      }
    }
  };

  // Main function to check token and call downloadFile
  const fetchFile = async () => {
    if (isDownloaded) {
      console.log("File already downloaded.");
      return; // Skip if the file has already been downloaded
    }

    console.log("Downloading file...");

    let authToken = localStorage.getItem("authToken");

    // If user is not authenticated, attempt login
    if (!authToken) {
      if (!isLoginAttempted) {
        setIsLoginAttempted(true); // Mark login as attempted
        await login();
        authToken = localStorage.getItem("authToken");

        if (!authToken) {
          setError("Authentication failed. Token not found.");
          return;
        }
      } else {
        return; // Login already attempted, waiting for user
      }
    }

    // Call the downloadFile function to fetch the file
    await downloadFile(authToken);
  };

  useEffect(() => {
    fetchFile(); // Call the fetchFile function to start the process
  }, []); // Run only once when the component mounts

  const handleAlertClose = () => {
    setError(null); // Clear the error message to hide the alert
    setIsLoginAttempted(false); // Reset login attempt to allow a retry if needed
  };

  return (
    <div>
      <p>Processing your file download...</p>
      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#842029",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            border: "1px solid #f5c2c7",
          }}
        >
          <p>Error: {error}</p>
          <button
            onClick={handleAlertClose}
            style={{
              padding: "5px 10px",
              backgroundColor: "#842029",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "5px",
            border: "1px solid #c3e6cb",
          }}
        >
          <p>{successMessage}</p>
        </div>
      )}
    </div>
  );
};

export default FileDownloader;
