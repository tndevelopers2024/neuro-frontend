import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Brain, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Activity, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center p-4 md:p-8 select-none relative overflow-hidden">
      
      {/* Main Container - Split Layout */}
      <div className="w-full max-w-[1200px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-fadeIn h-[800px] max-h-screen">
        
        {/* Left Side: Brand & Visuals (Hidden on small screens) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-navy via-[#0c2445] to-primaryBlue p-12 flex-col justify-between relative overflow-hidden text-white">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center mb-16">
              <img src="/nuro-logo.png" alt="NeuroMind Logo" className="h-32 w-auto object-contain" />
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white">
                Master the complexities of <span className="text-cyan">Neuroscience</span>.
              </h1>
              <p className="text-lg text-white/80 font-medium leading-relaxed max-w-md">
                The premier interactive curriculum platform designed specifically for psychiatry and neurology residents.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg mt-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-navy bg-cyan flex items-center justify-center">
                <Activity className="w-5 h-5 text-navy" />
              </div>
              <div className="text-sm font-semibold">
                <span className="text-cyan">500+</span> Residents
              </div>
            </div>
            <p className="text-sm text-white/80 font-medium italic">
              "NeuroMind completely transformed my board prep. The interactive maps are a game-changer."
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
          
          {/* Mobile Header (Only visible on small screens) */}
          <div className="md:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#E9F2FF] border border-primaryBlue/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Brain className="w-10 h-10 text-primaryBlue animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">NeuroMind</h1>
          </div>

          <div className="max-w-md w-full mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-navy tracking-tight mb-2">Welcome back</h2>
              <p className="text-sm font-semibold text-muted uppercase tracking-wider">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative flex items-center group">
                  <Mail className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-primaryBlue hover:text-[#0D55C2] transition-colors">Forgot Password?</Link>
                </div>
                <div className="relative flex items-center group">
                  <Lock className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-muted hover:text-primaryBlue transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primaryBlue hover:bg-[#0D55C2] text-white font-bold py-4 rounded-xl shadow-lg shadow-primaryBlue/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-4 disabled:opacity-70 disabled:transform-none"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Curriculum'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Quick Demo Credentials Login Bar */}
            <div className="mt-10 pt-8 border-t border-gray-100 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-xs font-bold text-muted uppercase tracking-wider">
                ⚡ Quick Demo Login
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => handleDemoFill('resident@neuromind.edu')}
                  type="button"
                  className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl bg-[#EAF7ED] hover:bg-medicalGreen text-medicalGreen hover:text-white border border-medicalGreen/20 transition-all shadow-sm group"
                >
                  <UserCheck className="w-5 h-5 group-hover:text-white transition-colors" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Resident</span>
                </button>
                <button
                  onClick={() => handleDemoFill('admin@neuromind.edu')}
                  type="button"
                  className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl bg-[#FFF3EA] hover:bg-medicalOrange text-medicalOrange hover:text-white border border-medicalOrange/20 transition-all shadow-sm group"
                >
                  <ShieldCheck className="w-5 h-5 group-hover:text-white transition-colors" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Admin</span>
                </button>
              </div>
            </div>

            <div className="mt-8 text-center text-sm font-medium text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-primaryBlue hover:text-[#0D55C2] transition-colors hover:underline">
                Register now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
