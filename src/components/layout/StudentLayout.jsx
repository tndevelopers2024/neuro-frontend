import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const StudentLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#FAFCFF] overflow-hidden relative">
      {/* Left Navigation Sidebar (Collapsible & Mobile Drawer) */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div id="main-scroll-container" className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
