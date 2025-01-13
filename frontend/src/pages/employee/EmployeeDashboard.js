import React, { useState, useEffect } from 'react';
import SelfAssessment from './SelfAssessment';
import FeedbackSubmission from './FeedbackSubmission';
import LearningAndDevelopment from './LearningAndDevelopment';
import RequestLearningPlan from './RequestLearningPlan';

function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  // Effect to set the active tab based on the URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', ''); // Get the hash without the '#' symbol
    if (hash) {
      setActiveTab(hash);
    } else {
      setActiveTab('selfAssessment'); // Default tab if no hash is present
    }
  }, []);

  // Function to render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'selfAssessment':
        return <SelfAssessment />;
      case 'feedbackSubmission':
        return <FeedbackSubmission />;
      case 'learningAndDevelopment':
        return <LearningAndDevelopment />;
      case 'requestLearningPlan':
        return <RequestLearningPlan />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  // Function to update the URL hash and set activeTab
  const navigateToTab = (tab) => {
    window.location.hash = `#${tab}`; // Update the hash in the URL
    setActiveTab(tab); // Set the active tab
  };

  return (
    <div className="flex min-h-screen text-[#2B2280]">
      {/* Hamburger Menu Button */}
      <div className="md:hidden bg-[#3C2CDA] text-white p-4">
        <button
          className="text-2xl"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-20 bg-[#3C2CDA] text-white w-64 h-full transition-transform transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{ height: 'auto' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#5047C9]">
          <div className="text-2xl font-bold">Employee Dashboard</div>
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
              activeTab === 'selfAssessment' ? 'bg-[#6458F5]' : ''
            }`}
            onClick={() => {
              navigateToTab('selfAssessment');
              setIsSidebarOpen(false); // Close sidebar on navigation
            }}
          >
            Self-Assessment
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'feedbackSubmission' ? 'bg-[#6458F5]' : ''
            }`}
            onClick={() => {
              navigateToTab('feedbackSubmission');
              setIsSidebarOpen(false);
            }}
          >
            Feedback Submission
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'learningAndDevelopment' ? 'bg-[#6458F5]' : ''
            }`}
            onClick={() => {
              navigateToTab('learningAndDevelopment');
              setIsSidebarOpen(false);
            }}
          >
            Learning & Development
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'requestLearningPlan' ? 'bg-[#6458F5]' : ''
            }`}
            onClick={() => {
              navigateToTab('requestLearningPlan');
              setIsSidebarOpen(false);
            }}
          >
            Request Learning Plan
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

export default EmployeeDashboard;
