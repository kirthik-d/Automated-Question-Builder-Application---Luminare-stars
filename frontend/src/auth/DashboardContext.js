import React, { createContext, useContext, useState } from "react";

const DashboardContext = createContext();

export const useDashboardContext = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [activeUsers, setActiveUsers] = useState(0);

  return (
    <DashboardContext.Provider value={{ logs, setLogs, metrics, setMetrics, activeUsers, setActiveUsers }}>
      {children}
    </DashboardContext.Provider>
  );
};
