import React from 'react';
import { Outlet, Navigate, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, Brain, Activity, Compass, FileText, HelpCircle, Layers, Users, LogOut, ArrowLeft, ShieldCheck, PlusCircle, Table } from 'lucide-react';

const AdminLayout = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
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
    <div className="flex min-h-screen bg-[#F4F7FC] text-navy font-sans select-none">
      {/* Admin Light Sidebar */}
      <aside className="w-72 h-screen bg-white text-navy border-r border-borderLine flex flex-col justify-between p-6 shrink-0 z-30 sticky top-0 overflow-y-auto">
        <div>
          <Link to="/admin/dashboard" className="block px-1 mb-8">
            <img src="/nuro-logo.png" alt="Admin Portal" className="w-48 object-contain mx-auto" />
          </Link>

          <nav className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="px-3 text-[11px] font-semibold text-primaryBlue uppercase tracking-wider">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                            isActive
                              ? 'bg-primaryBlue text-white shadow-md font-bold'
                              : 'text-muted hover:text-primaryBlue hover:bg-secondaryBg'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Exit to Student Curriculum Button (Requirement 34) */}
        <div className="space-y-3 pt-6 border-t border-borderLine">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-secondaryBg hover:bg-[#E9F2FF] hover:text-primaryBlue text-navy font-semibold text-xs transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit to Student Curriculum</span>
          </Link>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#DB2674] hover:bg-[#B7185D] text-white font-semibold text-xs transition-all shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Securely</span>
          </button>
        </div>
      </aside>

      {/* Admin Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-borderLine px-8 py-4 flex items-center justify-between shadow-xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="bg-[#EAF7ED] text-medicalGreen text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              System Health: Online & Fully Hydrated
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted">Administrator Logged In: <span className="text-navy">{user?.fullName || 'Dr. Alistair Vance'}</span></span>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
