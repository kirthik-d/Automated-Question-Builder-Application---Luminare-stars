import React, { useState, useEffect } from 'react';
import UploadCurriculum from './UploadCurriculum';
import GenerateQuestionBank from './GenerateQuestionBank';
import ReviewEditQuestionBank from './ReviewEditQuestionBank';
import DownloadDistribute from './DownloadDistribute';
import FeedbackCollection from './FeedbackCollection'; 

function TrainerDashboard() {
  const [activeTab, setActiveTab] = useState('uploadCurriculum'); // Initial active tab
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to toggle sidebar
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    const hash = window.location.hash.replace('#', ''); // Get the hash without the `#`
    if (hash) {
      setActiveTab(hash); // Set the active tab based on the URL hash
    } else {
      setActiveTab('uploadCurriculum'); // Default tab
    }
  }, []);

  const navigateToTab = (tab) => {
    const basePath = window.location.pathname; // Get the current path (e.g., /trainer/)
    window.history.pushState(null, '', `${basePath}#${tab}`); // Update the URL with the tab hash
    setActiveTab(tab); // Set the active tab
  };

  const handleSetActiveTabUploadCurriculum = (tab, data) => {
    navigateToTab(tab);
    if (data) {
      setTopics(data.topics);
      setSubtopics(data.subtopics);
    }
  };

  const handleSetActiveTabReviewEditQuestionBank = (tab, data) => {
    navigateToTab(tab);
    if (data) setTransactionId(data); // Set transactionId
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'uploadCurriculum':
        return <UploadCurriculum setActiveTab={handleSetActiveTabUploadCurriculum} />;
      case 'generateQuestionBank':
        return (
          <GenerateQuestionBank
            topics={topics}
            subtopics={subtopics}
            setActiveTab={handleSetActiveTabReviewEditQuestionBank}
          />
        );
      case 'reviewEditQuestionBank':
        return <ReviewEditQuestionBank transactionId={transactionId} />;
      case 'downloadDistribute':
        return <DownloadDistribute />;
      case 'feedbackCollection':
        return <FeedbackCollection />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Hamburger Menu Button */}
      <div className="md:hidden bg-blue-500 text-white p-4">
        <button
          className="text-2xl"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-20 bg-blue-500 text-white w-64 h-full md:h-auto transition-transform transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{ height: 'auto' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#5047C9]">
          <div className="text-2xl font-bold">Trainer Dashboard</div>
          <button
            className="text-white md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="mt-6">
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'uploadCurriculum' ? 'bg-blue-700' : ''
            }`}
            onClick={() => {
              navigateToTab('uploadCurriculum');
              setIsSidebarOpen(false); // Close sidebar on navigation
            }}
          >
            Upload Curriculum
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'generateQuestionBank' ? 'bg-blue-700' : ''
            }`}
            onClick={() => {
              navigateToTab('generateQuestionBank');
              setIsSidebarOpen(false);
            }}
          >
            Generate Question Bank
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'reviewEditQuestionBank' ? 'bg-blue-700' : ''
            }`}
            onClick={() => {
              navigateToTab('reviewEditQuestionBank');
              setIsSidebarOpen(false);
            }}
          >
            Review & Edit Question Bank
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'downloadDistribute' ? 'bg-blue-700' : ''
            }`}
            onClick={() => {
              navigateToTab('downloadDistribute');
              setIsSidebarOpen(false);
            }}
          >
            Download & Distribute
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'feedbackCollection' ? 'bg-blue-700' : ''
            }`}
            onClick={() => {
              navigateToTab('feedbackCollection');
              setIsSidebarOpen(false);
            }}
          >
            Feedback Collection
          </button>
        </nav>
      </div>

      {/* Overlay to close sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Content Area */}
      <div className="flex-1 p-6">
        {renderContent()} {/* This will display the content based on the active tab */}
      </div>
    </div>
  );
}

export default TrainerDashboard;
