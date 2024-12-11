import React, { useState } from 'react';
import ManageUsers from './ManageUsers';
import MonitorSystem from './MonitorSystem';
import GenerateReports from './GenerateReports';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('manageUsers');

  const renderContent = () => {
    switch (activeTab) {
      case 'manageUsers':
        return <ManageUsers />;
      case 'monitorSystem':
        return <MonitorSystem />;
      case 'generateReports':
        return <GenerateReports />;
      default:
        return <ManageUsers />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-500 text-white">
        <div className="p-4 text-2xl font-bold">Admin Dashboard</div>
        <nav className="mt-6">
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'manageUsers' ? 'bg-blue-700' : ''
            }`}
            onClick={() => setActiveTab('manageUsers')}
          >
            Manage Users
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'monitorSystem' ? 'bg-blue-700' : ''
            }`}
            onClick={() => setActiveTab('monitorSystem')}
          >
            Monitor System
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'generateReports' ? 'bg-blue-700' : ''
            }`}
            onClick={() => setActiveTab('generateReports')}
          >
            Generate Reports
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6">{renderContent()}</div>
    </div>
  );
}

export default AdminDashboard;
