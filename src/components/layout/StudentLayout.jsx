import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Brain } from 'lucide-react';

const StudentLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-secondaryBg flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#E9F2FF] border border-primaryBlue/30 flex items-center justify-center shadow-lg animate-bounce">
          <Brain className="w-10 h-10 text-primaryBlue" />
        </div>
        <p className="text-sm font-bold text-navy tracking-wide animate-pulse">Loading NeuroMind Scholars Curriculum...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#FAFCFF]">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
