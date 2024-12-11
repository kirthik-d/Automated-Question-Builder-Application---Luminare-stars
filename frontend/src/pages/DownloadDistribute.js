import React from 'react';
import ExportToCSV from './ExportToCSV';
import ExportToPDF from './ExportToPDF';

function DownloadDistribute() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">Download and Distribute Question Bank</h1>

        <div className="mt-6 flex gap-4">
          <ExportToCSV />
          <ExportToPDF />
        </div>
      </div>
    </div>
  );
}

export default DownloadDistribute;
