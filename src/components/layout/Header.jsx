import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Bell, User, LogOut, Settings as SettingsIcon, LayoutDashboard, Brain, Activity, Compass, Play, FileText, ChevronRight, Menu, PanelLeftClose } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSidebar } from '../../context/SidebarContext.jsx';
import { getAvatarUrl } from '../../utils/urlHelper.js';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { toggleMobileSidebar, isDesktopCollapsed, toggleDesktopCollapsed } = useSidebar();
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-borderLine px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 shadow-xs">
      {/* Left Area: Mobile Hamburger Button & Brand, Desktop Collapse Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-navy hover:bg-secondaryBg border border-transparent hover:border-borderLine transition-all flex items-center justify-center shrink-0 active:scale-95"
          aria-label="Toggle navigation drawer"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5 text-navy" />
        </button>

        {/* Mobile Brand Link */}
        <Link to="/" className="flex items-center gap-1.5 md:hidden shrink-0">
          <Brain className="w-6 h-6 text-primaryBlue animate-pulse" />
          <span className="font-extrabold text-navy text-sm sm:text-base tracking-tight hidden xs:inline">NEUROMIND</span>
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-3 w-1/4">
        <button
          type="button"
          onClick={toggleDesktopCollapsed}
          className="p-2 rounded-xl text-muted hover:text-navy hover:bg-secondaryBg border border-transparent hover:border-borderLine transition-all flex items-center gap-2 text-xs font-semibold"
          title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeftClose className={`w-4 h-4 transition-transform duration-200 ${isDesktopCollapsed ? 'rotate-180 text-primaryBlue' : ''}`} />
          <span className="hidden xl:inline text-[11px] text-muted font-medium">{isDesktopCollapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      </div>

      {/* Center Large Search Field */}
      <div ref={searchRef} className="relative flex-1 max-w-2xl mx-1 sm:mx-auto min-w-0">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted absolute left-3 sm:left-4 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search topics, disorders, drugs..."
            className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-full bg-secondaryBg border border-borderLine focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 transition-all duration-200 text-xs sm:text-sm font-medium text-navy placeholder:text-muted/75 outline-none shadow-inner/30"
          />
        </div>

        {/* Search Results Autocomplete Dropdown */}
        {showDropdown && searchTerm.trim().length >= 2 && (
          <div className="absolute top-full mt-2 left-0 right-0 sm:left-auto sm:right-auto sm:w-full bg-white border border-borderLine rounded-lg shadow-elevated overflow-hidden z-50 animate-fadeIn max-w-[calc(100vw-1.5rem)]">
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
      <div className="flex items-center justify-end gap-2 sm:gap-4 shrink-0 sm:w-1/4">
        {isAdmin && (
          <Link
            to="/admin/dashboard"
            className="hidden md:inline-flex items-center gap-2 bg-[#E9F2FF] text-primaryBlue text-xs font-bold px-3.5 py-2 rounded-full hover:bg-primaryBlue hover:text-white transition-all shadow-xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Admin Panel
          </Link>
        )}

        {/* User Avatar & Profile Modal Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center justify-center p-0.5 sm:p-1 rounded-full bg-secondaryBg border border-borderLine hover:bg-white transition-all group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primaryBlue text-white font-bold flex items-center justify-center shadow-md overflow-hidden border border-white">
              <img 
                src={getAvatarUrl(user)} 
                alt={user?.fullName || 'User'} 
                className="w-full h-full object-cover" 
              />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white border border-borderLine rounded-lg shadow-elevated py-2 z-50 animate-fadeIn">
              <div className="px-5 py-3 border-b border-borderLine/80">
                <div className="font-bold text-sm text-navy">{user?.fullName || 'Resident Dr. Sarah Jenkins'}</div>
                <div className="text-xs font-medium text-muted truncate">{user?.email || 'resident@neuromind.edu'}</div>
                <div className="mt-1 inline-block bg-[#EAF7ED] text-medicalGreen text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  {user?.role === 'admin' ? 'Curriculum Administrator' : user?.specialization || 'Psychiatry Resident'}
                </div>
              </div>

              <div className="py-2">
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
                  <SettingsIcon className="w-4 h-4 text-muted" /> Account
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
                  <LogOut className="w-4 h-4 text-[#DB2674]" /> Logout
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
