import React from 'react';

function MonitorSystem({ logs, metrics, activeUsers }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Monitor System</h2>

      {/* Performance Metrics */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Performance Metrics</h3>
        <ul className="list-disc pl-5">
          <li>Server Uptime: {metrics.serverUptime || 'Loading...'}</li>
          <li>Active Users: {activeUsers || 'Loading...'}</li>
          <li>API Response Time: {metrics.apiResponseTime || 'Loading...'}</li>
        </ul>
      </div>

      {/* Activity Logs */}
      <div>
        <h3 className="text-xl font-bold mb-2">Activity Logs</h3>
        <div className="border p-4 bg-gray-50">
          {logs.length > 0 ? (
            <ul>
              {logs.map((log, index) => (
                <li key={index} className="mb-4">
                  <strong>Message:</strong> {log.logMessage} <br />
                  <strong>Level:</strong> {log.level} <br />
                  <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No activity logs available.</p>
          )}
        </div>
      </div>

    </div>
  );
}

export default MonitorSystem;
