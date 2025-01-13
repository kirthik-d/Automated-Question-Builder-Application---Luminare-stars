import React, { useState, useEffect } from 'react'; 
import ManageUsers from './ManageUsers';
import MonitorSystem from './MonitorSystem';
import GenerateReports from './GenerateReports';
import { useDashboardContext } from '../../auth/DashboardContext';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('manageUsers');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to toggle sidebar
  const { logs, metrics, activeUsers } = useDashboardContext();
  

  useEffect(() => {
    const hash = window.location.hash.replace('#', ''); // Get the hash without the `#`
    if (hash) {
      setActiveTab(hash); // Set the active tab based on the URL hash
    } else {
      setActiveTab('manageUsers'); // Default tab
    }
  }, []);

  const navigateToTab = (tab) => {
    window.location.hash = `#${tab}`; // Update the hash in the URL
    setActiveTab(tab); // Set the active tab
  };

  // useEffect(() => {
  //   const userEmail = localStorage.getItem('user_email');
  //   const userRole = localStorage.getItem('userRole');

  //   if (userEmail) {
  //     const socket = io('http://127.0.0.1:5000', {
  //       query: {
  //         user_id: userEmail.split('@')[0],
  //         user_email: userEmail,
  //         user_role: userRole
  //       },
  //     });

  //     socket.on('connect', () => {
  //       console.log('Connected to the server');
  //     });

  //     socket.on('logs', (data) => {
  //       console.log("data", data)
  //       if (data && data.logMessage) {
  //         setLogs((prevLogs) => [
  //           ...prevLogs,
  //           `${data.level}: ${data.logMessage} at ${data.timestamp}`,
  //         ]);
  //       }
  //     });

  //     socket.on('metrics', (data) => {
  //       setMetrics(data || {});
  //     });

  //     socket.on('active_users', (count) => {
  //       setActiveUsers(count);
  //     });

  //     socket.on('connect_error', (error) => {
  //       console.error('Connection error:', error);
  //     });

  //     return () => {
  //       socket.disconnect(); // Clean up socket connection
  //     };
  //   }
  // }, [setLogs, setMetrics, setActiveUsers]);

  const renderContent = () => {
    switch (activeTab) {
      case 'manageUsers':
        return <ManageUsers />;
      case 'monitorSystem':
        return (
          <MonitorSystem logs={logs} metrics={metrics} activeUsers={activeUsers} />
        );
      case 'generateReports':
        return <GenerateReports />;
      default:
        return <ManageUsers />;
    }
  };

  return (
    <div className="flex min-h-screen">
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
          <div className="text-2xl font-bold">Admin Dashboard</div>
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
              activeTab === 'manageUsers' ? 'bg-blue-700' : ''
            }`}
            onClick={() => {
              navigateToTab('manageUsers');
              setIsSidebarOpen(false);
            }}
          >
            Manage Users
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'monitorSystem' ? 'bg-blue-700' : ''
            }`}
            onClick={() => {
              navigateToTab('monitorSystem');
              setIsSidebarOpen(false);
            }}
          >
            Monitor System
          </button>
          <button
            className={`w-full text-left py-2 px-4 ${
              activeTab === 'generateReports' ? 'bg-blue-700' : ''
            }`}
            onClick={() => {
              navigateToTab('generateReports');
              setIsSidebarOpen(false);
            }}
          >
            Generate Reports
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
      <div className="flex-1 p-6">{renderContent()}</div>
    </div>
  );
}

export default AdminDashboard;
