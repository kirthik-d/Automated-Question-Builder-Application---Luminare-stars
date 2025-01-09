import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import axios from 'axios';

function GenerateReports() {
  const [reportType, setReportType] = useState('');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReportData = async (type) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/reports/${type}`);
      console.log("API Response:", response.data);

      // Transform the array of arrays into an array of objects
      const transformedData = response.data.map(item => ({
        id: item[0],
        reportType: item[1],
        userId: item[2],
        activity: item[3],
        timestamp: item[4]
      }));

      setReportData(transformedData);
    } catch (error) {
      console.error("Error fetching report data:", error);
      setReportData([]); // Clear data on error
    }
    setLoading(false);
  };


  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Report: ' + reportType, 10, 10);

    reportData.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.activity}`, 10, 20 + index * 10);
    });

    doc.save(`${reportType || 'Report'}.pdf`);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${reportType || 'Report'}.xlsx`);
  };

  useEffect(() => {
    if (reportType) {
      fetchReportData(reportType);
    }
  }, [reportType]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Generate Reports</h2>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Select Report Type:</label>
        <select
          className="border p-2 w-full"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="">Choose Report</option>
          <option value="Usage Statistics">Usage Statistics</option>
          <option value="Question Bank Summary">Question Bank Summary</option>
          <option value="System Health">System Health</option>
        </select>
      </div>

      {loading ? (
        <p>Loading report data...</p>
      ) : (
        <>
          {reportData.length === 0 ? (
            <p>No report data available.</p>  // Handle no data
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-2">Report Data:</h3>
              <ul className="list-disc pl-5">
                {reportData.map((item, idx) => (
                  <li key={item.id}>
                    {item.activity} - <strong>{item.timestamp}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 mr-2"
              onClick={exportToPDF}
              disabled={!reportType || loading}
            >
              Export to PDF
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2"
              onClick={exportToExcel}
              disabled={!reportType || loading}
            >
              Export to Excel
            </button>
          </div>
        </>
      )}

    </div>
  );
}

export default GenerateReports;
