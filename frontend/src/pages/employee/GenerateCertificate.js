import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const GenerateCertificate = () => {
  const { state } = useLocation();
  const { name, currentDate, certification_name, score } = state || {};
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      navigate("/employee", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const downloadCertificate = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          date: currentDate,
          certification_name: certification_name,
          learning_officer_name: "Josh",
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "certificate.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download certificate.");
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
    }
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold mb-4">Certificate Generated Successfully!</h2>
      <p className="text-lg mb-6">
        Congratulations! You have passed the assessment with a score of <strong>{score}</strong>. 
        Please download the certificate below.
      </p>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded mr-4"
        onClick={downloadCertificate}
      >
        Download Certificate
      </button>
      <button
        className="bg-green-500 text-white py-2 px-4 rounded"
        onClick={() => navigate("/employee")}
      >
        Explore Other Question Banks
      </button>
    </div>
  );
};

export default GenerateCertificate;
