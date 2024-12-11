import React from 'react';
import { saveAs } from 'file-saver';

const ExportToCSV = ({ questions }) => {
  const exportToCSV = () => {
    // Check if there are any questions with options (not None or empty)
    const hasOptions = questions.some(q => q.options && q.options.length > 0);

    // Create the CSV content based on whether options are present
    const csvContent = [
      ['Question', ...(hasOptions ? ['Options'] : [])], 
      ...questions.map((q) => [
        q.question,
        ...(hasOptions ? [q.options.join(' | ')] : []) 
      ])
    ].map((row) => row.join(",")).join("\n");

    // Create a Blob and save as CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'questions.csv');
  };

  return (
    <button onClick={exportToCSV} className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">
      Export to CSV
    </button>
  );
};

export default ExportToCSV;
