import React from "react";
import { saveAs } from "file-saver";
import * as Papa from "papaparse";

function ExportToCSV({ questions }) {
  const exportToCSV = () => {
    if (!questions || questions.length === 0) {
      alert("No questions available to export.");
      return;
    }

    // Prepare CSV data
    const csvData = questions.map((question) => {
      const options = question.options ? question.options.split('|') : []; // Split options by delimiter '|'
      return {
        ID: question.id,
        "Question Text": question.question_text,
        "Option A": options[0] || "N/A",
        "Option B": options[1] || "N/A",
        "Option C": options[2] || "N/A",
        "Option D": options[3] || "N/A",
        "Correct Answer": question.correct_answer,
        Difficulty: question.difficulty || "N/A",
        Topics: question.topics || "N/A",
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "questions.csv");
  };

  return (
    <button
      onClick={exportToCSV}
      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
    >
      Export to CSV
    </button>
  );
}

export default ExportToCSV;
