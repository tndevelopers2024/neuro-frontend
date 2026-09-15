import React from 'react';
import { Outlet, Navigate, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSidebar } from '../../context/SidebarContext.jsx';
import { LayoutDashboard, Brain, Users, LogOut, ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './Header.jsx';

const AdminLayout = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isMobileOpen, closeMobileSidebar, isDesktopCollapsed, toggleDesktopCollapsed } = useSidebar();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const navGroups = [
    {
      title: 'OVERVIEW & STRUCTURE',
      items: [
        { name: 'Analytics Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Subjects & Topics', path: '/admin/subjects', icon: Brain },
      ]
    },
    {
      title: 'USER MANAGEMENT',
      items: [
        { name: 'Resident Registry', path: '/admin/users', icon: Users },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#F4F7FC] text-navy font-sans select-none overflow-hidden relative">
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-navy/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Admin Collapsible Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          h-screen bg-white text-navy border-r border-borderLine flex flex-col justify-between shrink-0
          overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 shadow-2xl w-72 max-w-[85vw] p-5' : '-translate-x-full lg:translate-x-0'}
          ${isDesktopCollapsed ? 'lg:w-20 lg:p-3.5' : 'lg:w-72 lg:p-6'}
        `}
      >
        <div>
          {/* Logo & Controls */}
          <div className="flex items-center justify-between mb-6">
            {!isDesktopCollapsed ? (
              <Link to="/admin/dashboard" onClick={closeMobileSidebar} className="block px-1">
                <img src="/nuro-logo.png" alt="Admin Portal" className="w-44 object-contain" />
              </Link>
            ) : (
              <Link to="/admin/dashboard" onClick={closeMobileSidebar} className="mx-auto block" title="Admin Portal">
                <img src="/nuro-logo-fav.png" alt="Admin Portal" className="w-8 h-8 object-contain" />
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

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={toggleDesktopCollapsed}
              className={`hidden lg:flex p-1.5 rounded-lg text-muted hover:text-navy hover:bg-secondaryBg transition-colors ${isDesktopCollapsed ? 'mx-auto mt-2' : ''}`}
              title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isDesktopCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav Groups */}
          <nav className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                {!isDesktopCollapsed && (
                  <div className="px-3 text-[11px] font-semibold text-primaryBlue uppercase tracking-wider">
                    {group.title}
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.name} className="relative group">
                        <NavLink
                          to={item.path}
                          onClick={closeMobileSidebar}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                              isDesktopCollapsed ? 'justify-center px-2' : ''
                            } ${
                              isActive
                                ? 'bg-primaryBlue text-white shadow-md font-bold'
                                : 'text-muted hover:text-primaryBlue hover:bg-secondaryBg'
                            }`
                          }
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {!isDesktopCollapsed && <span>{item.name}</span>}
                        </NavLink>

                        {/* Hover Tooltip when collapsed on desktop */}
                        {isDesktopCollapsed && (
                          <div className="hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity whitespace-nowrap z-50">
                            {item.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Exit & Logout Buttons */}
        <div className="space-y-2.5 pt-4 border-t border-borderLine">
          <div className="relative group">
            <Link
              to="/"
              onClick={closeMobileSidebar}
              className={`flex items-center gap-2 w-full py-2.5 rounded-xl bg-secondaryBg hover:bg-[#E9F2FF] hover:text-primaryBlue text-navy font-semibold text-xs transition-all shadow-xs ${
                isDesktopCollapsed ? 'justify-center px-2' : 'justify-center'
              }`}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              {!isDesktopCollapsed && <span>Student Panel</span>}
            </Link>
            {isDesktopCollapsed && (
              <div className="hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Student Panel
              </div>
            )}
          </div>

          <div className="relative group">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className={`flex items-center gap-2 w-full py-2.5 rounded-xl bg-[#DB2674] hover:bg-[#B7185D] text-white font-semibold text-xs transition-all shadow-md ${
                isDesktopCollapsed ? 'justify-center px-2' : 'justify-center'
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isDesktopCollapsed && <span>Logout</span>}
            </button>
            {isDesktopCollapsed && (
              <div className="hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Admin Workspace */}
      <div id="main-scroll-container" className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
