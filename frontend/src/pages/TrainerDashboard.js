import React, { useState } from 'react';
import UploadCurriculum from './UploadCurriculum';
import GenerateQuestionBank from './GenerateQuestionBank';
import ReviewEditQuestionBank from './ReviewEditQuestionBank';
import DownloadDistribute from './DownloadDistribute';
import FeedbackCollection from './FeedbackCollection';

function TrainerDashboard() {
  const [activeTab, setActiveTab] = useState('uploadCurriculum');

  const renderContent = () => {
    switch (activeTab) {
      case 'uploadCurriculum':
        return <UploadCurriculum />;
      case 'generateQuestionBank':
        return <GenerateQuestionBank />;
      case 'reviewEditQuestionBank':
        return <ReviewEditQuestionBank />;
      case 'downloadDistribute':
        return <DownloadDistribute />;
      case 'feedbackCollection':
        return <FeedbackCollection />;
      default:
        return <UploadCurriculum />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-500 text-white">
        <div className="p-4 text-2xl font-bold">Trainer Dashboard</div>
        <nav className="mt-6">
          <button
            className={`w-full text-left py-2 px-4 ${activeTab === 'uploadCurriculum' ? 'bg-blue-700' : ''}`}
            onClick={() => setActiveTab('uploadCurriculum')}
          >
            Upload Curriculum
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${activeTab === 'generateQuestionBank' ? 'bg-blue-700' : ''}`}
            onClick={() => setActiveTab('generateQuestionBank')}
          >
            Generate Question Bank
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${activeTab === 'reviewEditQuestionBank' ? 'bg-blue-700' : ''}`}
            onClick={() => setActiveTab('reviewEditQuestionBank')}
          >
            Review & Edit Question Bank
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${activeTab === 'downloadDistribute' ? 'bg-blue-700' : ''}`}
            onClick={() => setActiveTab('downloadDistribute')}
          >
            Download & Distribute
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${activeTab === 'feedbackCollection' ? 'bg-blue-700' : ''}`}
            onClick={() => setActiveTab('feedbackCollection')}
          >
            Feedback Collection
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">{renderContent()}</div>
    </div>
  );
}

export default TrainerDashboard;
