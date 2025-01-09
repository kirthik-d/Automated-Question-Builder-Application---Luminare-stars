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
