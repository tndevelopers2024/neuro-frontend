import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Bell, User, LogOut, Settings as SettingsIcon, LayoutDashboard, Brain, Activity, Compass, Play, FileText, ChevronRight } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import { useAuth } from '../../context/AuthContext.jsx';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchRef = useRef(null);

  // Real-time global query search
  const { data: searchResults, isFetching } = useQuery({
    queryKey: ['globalSearch', searchTerm],
    queryFn: () => api.get(`/search?q=${encodeURIComponent(searchTerm)}`),
    enabled: searchTerm.trim().length >= 2,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (link) => {
    setSearchTerm('');
    setShowDropdown(false);
    navigate(link);
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'Subject': return <Brain className="w-4 h-4 text-primaryBlue" />;
      case 'Category': return <Activity className="w-4 h-4 text-cyan" />;
      case 'VIDEO': return <Play className="w-4 h-4 text-medicalPurple" />;
      case 'NOTES':
      case 'PDF': return <FileText className="w-4 h-4 text-primaryBlue" />;
      default: return <Compass className="w-4 h-4 text-medicalGreen" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-borderLine px-6 py-3 flex items-center justify-between shadow-xs">
      {/* Mobile brand fallback / spacer */}
      <div className="md:hidden flex items-center gap-2">
        <Brain className="w-7 h-7 text-primaryBlue animate-pulse" />
        <span className="font-bold text-navy text-lg tracking-tight">NEUROMIND</span>
      </div>
      <div className="hidden md:flex w-1/4" />

      {/* Center Large Search Field */}
      <div ref={searchRef} className="relative flex-1 max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-muted absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search topics, disorders, drugs, scales..."
            className="w-full pl-12 pr-4 py-2.5 rounded-full bg-secondaryBg border border-borderLine focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 transition-all duration-200 text-sm font-medium text-navy placeholder:text-muted/75 outline-none shadow-inner/30"
          />
        </div>

        {/* Search Results Autocomplete Dropdown */}
        {showDropdown && searchTerm.trim().length >= 2 && (
          <div className="absolute top-full mt-2 w-full bg-white border border-borderLine rounded-2xl shadow-elevated overflow-hidden z-50 animate-fadeIn">
            <div className="px-4 py-2 bg-secondaryBg/80 border-b border-borderLine text-xs font-semibold uppercase tracking-wider text-muted">
              {isFetching ? 'Searching curriculum...' : `Results for "${searchTerm}"`}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-borderLine/50">
              {searchResults?.results?.length > 0 ? (
                searchResults.results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item.link)}
                    className="p-3.5 hover:bg-secondaryBg/80 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondaryBg rounded-lg border border-borderLine group-hover:bg-white group-hover:shadow-xs transition-all">
                        {renderIcon(item.type)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-navy group-hover:text-primaryBlue transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs font-medium text-muted">
                          {item.type} {item.subtitle && `• ${item.subtitle}`}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-primaryBlue group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm font-medium text-muted">
                  No medical topics or materials matched your query.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right User Actions */}
      <div className="flex items-center justify-end gap-4 w-1/4">
        {isAdmin && (
          <Link
            to="/admin/dashboard"
            className="hidden lg:inline-flex items-center gap-2 bg-[#E9F2FF] text-primaryBlue text-xs font-bold px-3.5 py-2 rounded-full hover:bg-primaryBlue hover:text-white transition-all shadow-xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Admin Panel
          </Link>
        )}

        {/* Notifications Icon with count badge */}
        <button className="relative p-2.5 rounded-full bg-secondaryBg border border-borderLine hover:bg-white hover:border-primaryBlue/30 text-navy transition-all duration-200">
          <Bell className="w-5 h-5 text-navy" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DB2674] text-white font-bold text-[10px] flex items-center justify-center rounded-full shadow-sm animate-bounce">
            3
          </span>
        </button>

        {/* User Avatar & Profile Modal Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pl-2 rounded-full bg-secondaryBg border border-borderLine hover:bg-white transition-all group"
          >
            <span className="text-xs font-bold text-navy hidden xl:inline-block pl-1 max-w-[120px] truncate">
              {user ? user.fullName.split(' ')[0] : 'Resident'} 👋
            </span>
            <div className="w-9 h-9 rounded-full bg-primaryBlue text-white font-bold flex items-center justify-center shadow-md overflow-hidden border-2 border-white">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-borderLine rounded-2xl shadow-elevated py-2 z-50 animate-fadeIn">
              <div className="px-5 py-3 border-b border-borderLine/80">
                <div className="font-bold text-sm text-navy">{user?.fullName || 'Resident Dr. Sarah Jenkins'}</div>
                <div className="text-xs font-medium text-muted truncate">{user?.email || 'resident@neuromind.edu'}</div>
                <div className="mt-1 inline-block bg-[#EAF7ED] text-medicalGreen text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  {user?.role === 'admin' ? 'Curriculum Administrator' : user?.specialization || 'Psychiatry Resident'}
                </div>
              </div>

              <div className="py-2">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="px-5 py-2.5 text-sm font-medium text-navy hover:text-primaryBlue hover:bg-secondaryBg/80 flex items-center gap-3 transition-colors"
                >
                  <User className="w-4 h-4 text-muted" /> Profile Settings
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setShowProfileMenu(false)}
                  className="px-5 py-2.5 text-sm font-medium text-navy hover:text-primaryBlue hover:bg-secondaryBg/80 flex items-center gap-3 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-muted" /> My Learning Dashboard
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="px-5 py-2.5 text-sm font-medium text-navy hover:text-primaryBlue hover:bg-secondaryBg/80 flex items-center gap-3 transition-colors"
                >
                  <SettingsIcon className="w-4 h-4 text-muted" /> Account Preferences
                </Link>
              </div>

              <div className="border-t border-borderLine/80 pt-2">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full px-5 py-2.5 text-sm font-semibold text-[#DB2674] hover:bg-[#FFF5F9] flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-[#DB2674]" /> Logout Securely
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
