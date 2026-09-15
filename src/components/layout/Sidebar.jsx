import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Home,
  LayoutDashboard,
  Bookmark,
  Clock,
  FileText,
  Layers,
  HelpCircle,
  BookOpen,
  Settings,
  Brain,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../api/axiosInstance.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSidebar } from '../../context/SidebarContext.jsx';

const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const { isMobileOpen, closeMobileSidebar, isDesktopCollapsed, toggleDesktopCollapsed } = useSidebar();

  // Dynamically fetch learning progress from server
  const { data: progressData } = useQuery({
    queryKey: ['studentProgressStats'],
    queryFn: () => api.get('/progress/me'),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const stats = progressData?.stats || {
    progressPercentage: 0,
    topicsExplored: 0,
    totalTopics: 0,
    notesCreated: 0,
    flashcardsAvailable: 0,
    quizzesTaken: 0,
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
    { name: 'My Notes', path: '/my-notes', icon: FileText },
    { name: 'Flashcards', path: '/flashcards/all', icon: Layers },
    { name: 'Quiz', path: '/quiz/all', icon: HelpCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // SVG Circular progress bar metrics
  const percentage = stats.progressPercentage ?? (stats.totalTopics > 0 ? Math.round((stats.topicsExplored / stats.totalTopics) * 100) : 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-navy/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Main Collapsible / Drawer Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          h-screen flex flex-col justify-between shrink-0 select-none
          bg-white border-r border-borderLine overflow-y-auto overflow-x-hidden
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 shadow-2xl w-72 max-w-[85vw] p-5' : '-translate-x-full lg:translate-x-0'}
          ${isDesktopCollapsed ? 'lg:w-20 lg:p-3' : 'lg:w-64 xl:w-72 lg:p-5'}
        `}
      >
        <div>
          {/* Brand Logo & Collapse/Close Controls */}
          <div className="flex items-center justify-between mb-6">
            {!isDesktopCollapsed ? (
              <Link to="/" onClick={closeMobileSidebar} className="block px-1">
                <img src="/nuro-logo.png" alt="Neuro Mind Scholars" className="w-44 object-contain" />
              </Link>
            ) : (
              <Link to="/" onClick={closeMobileSidebar} className="mx-auto block" title="Neuro Mind Scholars">
                <img src="/nuro-logo-fav.png" alt="Neuro Mind Scholars" className="w-8 h-8 object-contain" />
              </Link>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-muted hover:text-navy hover:bg-secondaryBg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Chevron Button */}
            <button
              type="button"
              onClick={toggleDesktopCollapsed}
              className={`hidden lg:flex p-1.5 rounded-lg text-muted hover:text-navy hover:bg-secondaryBg transition-colors ${isDesktopCollapsed ? 'mx-auto mt-2' : ''}`}
              title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isDesktopCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Main Navigation Menu */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="relative group">
                  <NavLink
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isDesktopCollapsed ? 'justify-center px-2' : ''
                      } ${
                        isActive
                          ? 'bg-[#E9F2FF] text-primaryBlue shadow-xs font-bold border border-primaryBlue/10'
                          : 'text-muted hover:text-primaryBlue hover:bg-secondaryBg'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110 text-primaryBlue' : 'text-muted/80'}`} />
                        {!isDesktopCollapsed && <span>{item.name}</span>}
                      </>
                    )}
                  </NavLink>

                  {/* Tooltip on hover when collapsed on desktop */}
                  {isDesktopCollapsed && (
                    <div className="hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Progress Card (Collapsible) */}
        {isDesktopCollapsed ? (
          /* Mini Progress Ring for Collapsed Rail */
          <div className="mt-6 flex flex-col items-center justify-center relative group">
            <div className="w-12 h-12 rounded-xl bg-secondaryBg border border-borderLine flex items-center justify-center cursor-pointer hover:border-primaryBlue transition-colors shadow-xs">
              <div className="relative flex items-center justify-center">
                <svg className="w-9 h-9 transform -rotate-90">
                  <circle cx="18" cy="18" r="14" className="stroke-borderLine/70" strokeWidth="3" fill="transparent" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    className="stroke-primaryBlue transition-all duration-1000 ease-out"
                    strokeWidth="3"
                    strokeDasharray={2 * Math.PI * 14}
                    strokeDashoffset={2 * Math.PI * 14 - (percentage / 100) * (2 * Math.PI * 14)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[9px] font-bold text-primaryBlue">{percentage}%</span>
              </div>
            </div>

            {/* Floating Details Popup for Collapsed Mini-Ring */}
            <div className="hidden lg:block absolute left-full ml-3.5 bottom-0 p-4 bg-white border border-borderLine rounded-xl shadow-elevated w-52 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-navy uppercase tracking-wider">YOUR PROGRESS</span>
                <TrendingUp className="w-3.5 h-3.5 text-primaryBlue" />
              </div>
              <div className="text-xs text-muted mb-2">
                Topics: <span className="font-bold text-navy">{stats.topicsExplored}/{stats.totalTopics}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-borderLine text-center text-[10px]">
                <div className="bg-secondaryBg p-1 rounded font-bold">{stats.notesCreated} <span className="block font-normal text-muted text-[8px]">Notes</span></div>
                <div className="bg-secondaryBg p-1 rounded font-bold text-primaryBlue">{stats.flashcardsAvailable} <span className="block font-normal text-muted text-[8px]">Cards</span></div>
                <div className="bg-secondaryBg p-1 rounded font-bold text-medicalGreen">{stats.quizzesTaken} <span className="block font-normal text-muted text-[8px]">Quizzes</span></div>
              </div>
            </div>
          </div>
        ) : (
          /* Full Dynamic Progress Card */
          <div className="mt-8 bg-secondaryBg border border-borderLine rounded-lg p-5 shadow-soft hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-navy tracking-wider uppercase">YOUR PROGRESS</span>
              <TrendingUp className="w-4 h-4 text-primaryBlue animate-bounce" />
            </div>

            {/* Circular SVG Percentage Progress Ring */}
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    className="stroke-borderLine/70"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    className="stroke-primaryBlue transition-all duration-1000 ease-out"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-primaryBlue tracking-tight">{percentage}%</span>
                  <span className="text-[10px] font-bold text-muted uppercase mt-0.5">Explored</span>
                </div>
              </div>
              <p className="text-xs font-medium text-muted mt-2 text-center">
                Topics Explored: <span className="font-bold text-navy">{stats.topicsExplored}/{stats.totalTopics}</span>
              </p>
            </div>

            {/* Quick Study Activity Counts */}
            <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-borderLine/70 text-center">
              <div className="bg-white p-2 rounded-xl border border-borderLine/60 shadow-xs">
                <div className="text-xs font-bold text-navy">{stats.notesCreated}</div>
                <div className="text-[9px] font-bold text-muted uppercase mt-0.5">Notes</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-borderLine/60 shadow-xs">
                <div className="text-xs font-bold text-primaryBlue">{stats.flashcardsAvailable}</div>
                <div className="text-[9px] font-bold text-muted uppercase mt-0.5">Cards</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-borderLine/60 shadow-xs">
                <div className="text-xs font-bold text-medicalGreen">{stats.quizzesTaken}</div>
                <div className="text-[9px] font-bold text-muted uppercase mt-0.5">Quizzes</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
