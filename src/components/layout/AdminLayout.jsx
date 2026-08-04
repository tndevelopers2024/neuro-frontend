import React from 'react';
import { Outlet, Navigate, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, Brain, Activity, Compass, FileText, HelpCircle, Layers, Users, LogOut, ArrowLeft, ShieldCheck } from 'lucide-react';

const AdminLayout = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const adminNavs = [
    { name: 'Analytics Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Subjects Engine', path: '/admin/subjects', icon: Brain },
    { name: 'Category Orbits', path: '/admin/categories', icon: Activity },
    { name: 'Topic Hierarchy & Maps', path: '/admin/topics', icon: Compass },
    { name: 'Study Materials & Uploads', path: '/admin/materials', icon: FileText },
    { name: 'MCQ & Quiz Builder', path: '/admin/mcqs', icon: HelpCircle },
  ];

  return (
    <div className="flex min-h-screen bg-[#F4F7FC] text-navy font-sans select-none">
      {/* Admin Dark Navy Sidebar */}
      <aside className="w-72 h-screen bg-navy text-white flex flex-col justify-between p-6 shrink-0 shadow-elevated z-30 sticky top-0 overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 px-1 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primaryBlue text-white flex items-center justify-center font-black text-lg shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-white tracking-tight text-base leading-none">ADMIN PORTAL</div>
              <div className="text-[10px] font-bold text-primaryBlue tracking-widest mt-1 uppercase">CURRICULUM ENGINE</div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {adminNavs.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-primaryBlue text-white shadow-md font-bold'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Exit to Student Curriculum Button (Requirement 34) */}
        <div className="space-y-3 pt-6 border-t border-white/15">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit to Student Curriculum</span>
          </Link>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#DB2674] hover:bg-[#B7185D] text-white font-extrabold text-xs transition-all shadow-md"
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
