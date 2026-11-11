import React from 'react';

const DashboardLayout = ({ sidebar, header, children }) => (
  <div className="dashboard">
    {sidebar}
    <main id="inicio">
      {header}
      <div className="content">{children}</div>
    </main>
  </div>
);

export default DashboardLayout;
