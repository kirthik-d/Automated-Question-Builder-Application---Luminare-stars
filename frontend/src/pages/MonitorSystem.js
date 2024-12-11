import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client'; // Import the Socket.IO client

function MonitorSystem() {
  const [metrics, setMetrics] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const socket = io('http://127.0.0.1:5000'); // Connect to your Flask-SocketIO server

    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // Emit test_event to get metrics
    socket.emit('test_event');

    // Listen for 'metrics' event to update metrics state
    socket.on('metrics', (data) => {
      console.log('Metrics received:', data);
      setMetrics(data || {});
    });

    // Emit log_event to get logs
    socket.emit('log_event', { message: "This is a test log", level: "INFO" });

    // Listen for 'logs' event to update logs state
    socket.on('logs', (data) => {
      console.log('Log received:', data);
      // Check if the log data is an object and extract the message and level
      if (data && data.logMessage) {
        setLogs((prevLogs) => [...prevLogs, `${data.level}: ${data.logMessage}`]);
      }
    });

    return () => {
      socket.disconnect(); // Clean up the connection
    };
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Monitor System</h2>

      {/* Performance Metrics */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Performance Metrics</h3>
        <ul className="list-disc pl-5">
          <li>Server Uptime: {metrics.serverUptime || 'Loading...'}</li>
          <li>Active Users: {metrics.activeUsers || 'Loading...'}</li>
          <li>API Response Time: {metrics.apiResponseTime || 'Loading...'}</li>
        </ul>
      </div>

      {/* Activity Logs */}
      <div>
        <h3 className="text-xl font-bold mb-2">Activity Logs</h3>
        <div className="border p-4 bg-gray-50">
          {logs.length > 0 ? (
            logs.map((log, idx) => (
              <p key={idx} className="mb-2">
                {log}
              </p>
            ))
          ) : (
            <p>No logs available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MonitorSystem;
