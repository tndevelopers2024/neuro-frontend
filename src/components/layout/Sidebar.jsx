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
} from 'lucide-react';
import api from '../../api/axiosInstance.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Sidebar = () => {
  const { isAuthenticated } = useAuth();

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
    { name: 'Recent', path: '/recent', icon: Clock },
    { name: 'My Notes', path: '/my-notes', icon: FileText },
    { name: 'Flashcards', path: '/flashcards/all', icon: Layers },
    { name: 'Quiz', path: '/quiz/all', icon: HelpCircle },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // SVG Circular progress bar metrics
  const percentage = stats.progressPercentage ?? (stats.totalTopics > 0 ? Math.round((stats.topicsExplored / stats.totalTopics) * 100) : 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <aside className="w-64 xl:w-72 bg-white border-r border-borderLine h-screen flex flex-col justify-between p-5 shrink-0 z-30 select-none sticky top-0 overflow-y-auto">
      <div>
        {/* Brand Logo Header */}
        <Link to="/" className="flex items-center gap-3 px-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-[#E9F2FF] border border-primaryBlue/20 flex items-center justify-center group-hover:bg-primaryBlue transition-all duration-300 shadow-xs">
            <Brain className="w-6 h-6 text-primaryBlue group-hover:text-white transition-colors duration-300 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-navy tracking-tight text-lg leading-none">NEUROMIND</div>
            <div className="text-[10px] font-semibold text-primaryBlue tracking-widest mt-1 uppercase">SCHOLARS</div>
          </div>
        </Link>

        {/* Main Navigation Menu */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#E9F2FF] text-primaryBlue shadow-xs font-bold border border-primaryBlue/10'
                      : 'text-muted hover:text-primaryBlue hover:bg-secondaryBg'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-primaryBlue' : 'text-muted/80'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Dynamic Progress Card (Section 4 Reference) */}
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
    </aside>
  );
};

export default Sidebar;
