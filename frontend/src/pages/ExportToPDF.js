import React from 'react';

const ExportToPDF = ({ questions }) => {
  const exportToPDF = () => {
    import('jspdf').then((module) => {
      const { jsPDF } = module;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 10;
      const pageHeight = doc.internal.pageSize.height;
      let y = margin;

      questions.forEach((q, i) => {
        const wrappedQuestion = doc.splitTextToSize(`${i + 1}. ${q.question}`, contentWidth);
        wrappedQuestion.forEach((line) => {
          if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });

        q.options.forEach((opt, j) => {
          if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(`${String.fromCharCode(65 + j)}. ${opt}`, margin + 10, y);
          y += lineHeight;
        });

        y += lineHeight; // Add space between questions
      });

      doc.save('questions.pdf');
    });
  };

  return (
    <button onClick={exportToPDF} className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400">Export to PDF</button>
  );
};

export default ExportToPDF;


