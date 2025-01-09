import React, { useEffect, useState } from "react";

function LearningAndDevelopment() {
  const [materials, setMaterials] = useState([]);
  const [completedMaterials, setCompletedMaterials] = useState([]);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [total_pages_count, setTotalPages] = useState(0);
  const userEmail = localStorage.getItem("user_email");

  const fetchLearningMaterials = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/learning-materials?user_email=${userEmail}`
      );
      const data = await response.json();

      const questionBankResponse = await fetch(
        `http://127.0.0.1:5000/api/question-banks?employee_email=${userEmail}`
      );
      const questionBanks = await questionBankResponse.json();

      const materialsWithPages = data.map((material) => {
        const hasPracticeQuestions = questionBanks.some((bank) =>
          bank.technologies.includes(material.name)
        );
        const totalPages = 3 + (hasPracticeQuestions ? 1 : 0);
        setTotalPages(totalPages);
        return {
          ...material,
          total_pages: totalPages,
          hasPracticeQuestions,
          questionBank: questionBanks.find((bank) =>
            bank.technologies.includes(material.name)
          ),
        };
      });

      const completed = materialsWithPages.filter(
        (material) => material.completed_pages === material.total_pages
      );
      const inProgress = materialsWithPages.filter(
        (material) => material.completed_pages < material.total_pages
      );

      setMaterials(inProgress);
      setCompletedMaterials(completed);
    } catch (error) {
      console.error("Error fetching learning materials or question banks:", error);
    }
  };

  const updateProgress = async (materialId, completedPages, totalPages) => {
    try {
      await fetch("http://127.0.0.1:5000/api/track-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: userEmail,
          learning_material_id: materialId,
          completed_pages: completedPages,
          total_pages: totalPages,
        }),
      });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const previousPage = currentPage - 1;

      // Only decrement progress if the current page is *not* already marked as read
      if (currentPage > currentMaterial.completed_pages) {
        updateProgress(currentMaterial.id, previousPage, total_pages_count);
      }

      setCurrentPage(previousPage);
    }
  };

  const handleNextPage = () => {
    if (currentMaterial) {
      const total_pages = total_pages_count;
      if (currentPage < total_pages) {
        const nextPage = currentPage + 1;

        // Only increment progress if advancing to a new, unread page
        if (nextPage > currentMaterial.completed_pages) {
          updateProgress(currentMaterial.id, nextPage, total_pages);
        }

        setCurrentPage(nextPage);
      }
    }
  };

  const handleMaterialSelect = (material) => {
    setCurrentMaterial(material);
    setCurrentPage(material.completed_pages || 0);
  };

  const handleRestart = (material) => {
    // Remove the material from completed learnings
    setCompletedMaterials((prevCompletedMaterials) =>
      prevCompletedMaterials.filter((completed) => completed.id !== material.id)
    );

    // Reset progress in the backend
    updateProgress(material.id, 0, material.total_pages);

    // Reset progress locally
    const resetMaterial = {
      ...material,
      completed_pages: 0,
    };

    // Add the material back to the learning materials
    setMaterials((prevMaterials) => [...prevMaterials, resetMaterial]);

    // Set the material as the current material to restart
    setCurrentMaterial(resetMaterial);
    setCurrentPage(0);
  };

  const handleExit = () => {
    if (currentMaterial) {
      const totalPages = currentMaterial.total_pages;

      // Save the progress in the backend
      updateProgress(currentMaterial.id, currentPage, totalPages);

      // Update the local state for materials to reflect the current progress
      setMaterials((prevMaterials) =>
        prevMaterials.map((material) =>
          material.id === currentMaterial.id
            ? { ...material, completed_pages: currentPage }
            : material
        )
      );

      // Reset the current material and page
      setCurrentMaterial(null);
      setCurrentPage(0);
    }
  };


  const getPageContent = () => {
    switch (currentPage) {
      case 0:
        return (
          <div>
            <h4 className="text-lg font-bold">Introduction</h4>
            <p>{currentMaterial.introduction}</p>
            <div className="flex justify-between items-center">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={handleNextPage}
              >
                Mark as Read & Next
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={handleExit}
              >
                Exit
              </button>
            </div>

          </div>
        );
      case 1:
        return (
          <div>
            <h4 className="text-lg font-bold">Resource Link</h4>
            <a
              href={currentMaterial.resource_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Go to Resource
            </a>
            <div className="flex justify-between items-center">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={handlePreviousPage}
              >
                Back
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={handleNextPage}
              >
                Mark as Read & Next
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={handleExit}
              >
                Exit
              </button>
            </div>

          </div>
        );
      case 2:
        return currentMaterial.hasPracticeQuestions ? (
          <div>
            <h4 className="text-lg font-bold">Practice Questions</h4>
            <a
              href={currentMaterial.questionBank.resource_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Access Question Bank
            </a>
            <div className="flex justify-between items-center">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={handlePreviousPage}
              >
                Back
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={handleNextPage}
              >
                Mark as Read & Next
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={handleExit}
              >
                Exit
              </button>
            </div>

          </div>
        ) : (
          handleNextPage()
        );
      case total_pages_count:
        updateProgress(currentMaterial.id, total_pages_count, total_pages_count);
        return (
          <div>
            <h4 className="text-lg font-bold">Conclusion</h4>
            <p>{currentMaterial.conclusion}</p>
            <div className="flex justify-between items-center">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={handlePreviousPage}
              >
                Back
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={() => {
                  const updatedMaterial = {
                    ...currentMaterial,
                    completed_pages: currentMaterial.total_pages,
                  };

                  // Update progress in the backend
                  updateProgress(
                    currentMaterial.id,
                    currentMaterial.total_pages,
                    currentMaterial.total_pages
                  );

                  // Update the state to move the material to completed learnings
                  setMaterials((prevMaterials) =>
                    prevMaterials.filter((material) => material.id !== currentMaterial.id)
                  );

                  setCompletedMaterials((prevCompletedMaterials) => [
                    ...prevCompletedMaterials,
                    updatedMaterial,
                  ]);

                  // Close the course
                  setCurrentMaterial(null);
                }}
              >
                Finish
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4"
                onClick={handleExit}
              >
                Exit
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchLearningMaterials();
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Learning and Development</h2>
      <p className="mb-6">Access learning materials and track your progress.</p>

      {currentMaterial ? (
        <div>
          <h3 className="text-xl font-semibold mb-3">{currentMaterial.name}</h3>
          {getPageContent()}
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold mb-3">Learning Materials</h3>
          <ul className="space-y-4">
            {materials.length > 0 ? (
              materials.map((material) => (
                <li
                  key={material.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-lg font-bold">{material.name}</h4>
                    <p>Completion: {Math.round((material.completed_pages / material.total_pages) * 100)}%</p>
                  </div>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    onClick={() => handleMaterialSelect(material)}
                  >
                    Start
                  </button>
                </li>
              ))
            ) : (
              <div className="text-gray-500 text-center">
                No available learning materials currently. You’ll be notified when new materials are added.
              </div>
            )}
          </ul>


          {completedMaterials.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3">Completed Learnings</h3>
              <ul className="space-y-4">
                {completedMaterials.map((material) => (
                  <li
                    key={material.id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-lg font-bold">{material.name}</h4>
                    </div>
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-md"
                      onClick={() => handleRestart(material)}
                    >
                      Restart
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LearningAndDevelopment;
