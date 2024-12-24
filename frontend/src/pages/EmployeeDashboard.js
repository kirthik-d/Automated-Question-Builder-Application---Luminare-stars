import React, { useState } from 'react';
import SelfAssessment from './SelfAssessment';
import FeedbackSubmission from './FeedbackSubmission';
import LearningAndDevelopment from './LearningAndDevelopment';
import RequestLearningPlan from './RequestLearningPlan';

function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState('selfAssessment'); // Initial active tab

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

  return (
    <div className="flex min-h-screen bg-[#EBE8FF] text-[#2B2280]">
      {/* Sidebar */}
      <div className="w-64 bg-[#3C2CDA] text-white">
        <div className="p-4 text-2xl font-bold border-b border-[#5047C9]">
          Employee Dashboard
        </div>
        <nav className="mt-6">
          <button
            className={`w-full text-left py-2 px-4 rounded-md hover:bg-[#5047C9] ${
              activeTab === 'selfAssessment' ? 'bg-[#6458F5]' : ''
            }`}
            onClick={() => setActiveTab('selfAssessment')}
          >
            Self-Assessment
          </button>
          <button
            className={`w-full text-left py-2 px-4 rounded-md hover:bg-[#5047C9] ${
              activeTab === 'feedbackSubmission' ? 'bg-[#6458F5]' : ''
            }`}
            onClick={() => setActiveTab('feedbackSubmission')}
          >
            Feedback Submission
          </button>
          <button
            className={`w-full text-left py-2 px-4 rounded-md hover:bg-[#5047C9] ${
              activeTab === 'learningAndDevelopment' ? 'bg-[#6458F5]' : ''
            }`}
            onClick={() => setActiveTab('learningAndDevelopment')}
          >
            Learning & Development
          </button>
          <button
            className={`w-full text-left py-2 px-4 rounded-md hover:bg-[#5047C9] ${
              activeTab === 'requestLearningPlan' ? 'bg-[#6458F5]' : ''
            }`}
            onClick={() => setActiveTab('requestLearningPlan')}
          >
            Request Learning Plan
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-white text-[#2B2280] rounded-tl-lg shadow-md">
        <div className="mb-6 text-3xl font-bold border-b border-[#5047C9] pb-3">
          {activeTab
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())}
        </div>
        {renderContent()} {/* This will display the content based on the active tab */}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
