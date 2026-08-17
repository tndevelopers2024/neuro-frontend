import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Brain, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Activity } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res?.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setIsSubmitting(true);
    try {
      const res = await login(demoEmail, 'password123');
      if (res?.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondaryBg flex items-center justify-center p-6 select-none relative overflow-hidden">
      {/* Background medical glow decorations */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primaryBlue/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyan/10 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-borderLine rounded-[28px] p-8 md:p-10 shadow-elevated relative z-10 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-lg bg-[#E9F2FF] border border-primaryBlue/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Brain className="w-10 h-10 text-primaryBlue animate-pulse" />
          </div>
          <h1 className="text-2xl font-semibold text-navy tracking-tight">Welcome to NeuroMind</h1>
          <p className="text-xs font-semibold text-muted mt-1 uppercase tracking-wider">Interactive Neurology & Psychiatry Platform</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 text-muted absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="resident@neuromind.edu"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-navy uppercase tracking-wider">Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("For demo accounts, default password is 'password123'."); }} className="text-xs font-semibold text-primaryBlue hover:underline">Forgot Password?</a>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 text-muted absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primaryBlue hover:bg-[#0D55C2] text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-2 disabled:opacity-70"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Curriculum'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Credentials Login Bar */}
        <div className="mt-8 pt-6 border-t border-borderLine">
          <p className="text-center text-xs font-bold text-muted uppercase tracking-wider mb-3">⚡ Quick One-Click Demo Login</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleDemoFill('resident@neuromind.edu')}
              type="button"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#EAF7ED] hover:bg-medicalGreen text-medicalGreen hover:text-white border border-medicalGreen/20 font-bold text-xs transition-all shadow-xs group"
            >
              <UserCheck className="w-4 h-4 group-hover:text-white transition-colors" />
              <span>Resident Demo</span>
            </button>
            <button
              onClick={() => handleDemoFill('admin@neuromind.edu')}
              type="button"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#FFF3EA] hover:bg-medicalOrange text-medicalOrange hover:text-white border border-medicalOrange/20 font-bold text-xs transition-all shadow-xs group"
            >
              <ShieldCheck className="w-4 h-4 group-hover:text-white transition-colors" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm font-medium text-muted">
          Don't have a scholar account yet?{' '}
          <Link to="/register" className="font-bold text-primaryBlue hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
