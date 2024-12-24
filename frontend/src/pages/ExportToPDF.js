import React from "react";

const ExportToPDF = ({ questions }) => {
  const exportToPDF = () => {
    import("jspdf").then((module) => {
      const { jsPDF } = module;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 10;
      const pageHeight = doc.internal.pageSize.height;
      let y = margin;

      questions.forEach((q, i) => {
        // Add question text with wrapping
        const wrappedQuestion = doc.splitTextToSize(
          `${i + 1}. ${q.question_text}`,
          contentWidth
        );
        wrappedQuestion.forEach((line) => {
          if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });

        // Parse and add options with wrapping
        let options;
        try {
          options = JSON.parse(q.options); // Parse options as JSON
        } catch (error) {
          options = q.options.split("|"); // Fallback: Split options by commas
        }

        options.forEach((opt, j) => {
          const wrappedOption = doc.splitTextToSize(
            `${String.fromCharCode(65 + j)}. ${opt.trim()}`,
            contentWidth
          );

          wrappedOption.forEach((line) => {
            if (y + lineHeight > pageHeight - margin) {
              doc.addPage();
              y = margin;
            }
            doc.text(line, margin + 10, y);
            y += lineHeight;
          });
        });

        // Add correct answer with wrapping
        const wrappedAnswer = doc.splitTextToSize(
          `Correct Answer: ${q.correct_answer}`,
          contentWidth
        );

        wrappedAnswer.forEach((line) => {
          if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });

        // Add metadata (difficulty, topics, transaction ID) with wrapping
        if (q.difficulty || q.topics || q.transaction_id) {
          const metadataText = `Difficulty: ${q.difficulty || "N/A"}, Topics: ${q.topics || "N/A"}, Transaction ID: ${q.transaction_id}`;
          const wrappedMetadata = doc.splitTextToSize(metadataText, contentWidth);

          wrappedMetadata.forEach((line) => {
            if (y + lineHeight > pageHeight - margin) {
              doc.addPage();
              y = margin;
            }
            doc.text(line, margin, y);
            y += lineHeight;
          });
        }

        // Add spacing between questions
        y += lineHeight;
      });

      doc.save("questions.pdf");
    });
  };

  return (
    <button
      onClick={exportToPDF}
      className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
    >
      Export to PDF
    </button>
  );
};

export default ExportToPDF;
