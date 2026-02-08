import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Root = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />
        <main
          className={`flex-1 transition-all duration-300 ease-in-out bg-white dark:bg-slate-700 ${isCollapsed ? "ml-24" : "ml-72"}`}
        >
          <Outlet></Outlet>
        </main>
      </div>
    );
};

export default Root;