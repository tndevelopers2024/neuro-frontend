import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Brain, User, Mail, Lock, Stethoscope, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    specialization: '',
    medicalCollege: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center p-4 md:p-8 select-none relative overflow-hidden">
      
      {/* Main Container - Split Layout */}
      <div className="w-full max-w-[1200px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-fadeIn h-[700px] max-h-screen">
        
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
                Join the elite <span className="text-cyan">Medical Network</span>.
              </h1>
              <p className="text-lg text-white/80 font-medium leading-relaxed max-w-md">
                Create your scholar account to access comprehensive clinical roadmaps, mind-maps, and board-level quizzes.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg mt-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-navy bg-cyan flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-navy" />
              </div>
              <div className="text-sm font-semibold">
                <span className="text-cyan">Peer-Reviewed</span> Curriculum
              </div>
            </div>
            <p className="text-sm text-white/80 font-medium italic">
              "A must-have resource for any neurology resident navigating complex clinical pathways."
            </p>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-white relative overflow-y-auto">
          
          {/* Mobile Header (Only visible on small screens) */}
          <div className="md:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#E9F2FF] border border-primaryBlue/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Brain className="w-10 h-10 text-primaryBlue animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">NeuroMind</h1>
          </div>

          <div className="max-w-md w-full mx-auto my-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-navy tracking-tight mb-2">Create Account</h2>
              <p className="text-sm font-semibold text-muted uppercase tracking-wider">Join Medical Resident Clinical Network</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative flex items-center group">
                  <User className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Institutional Email</label>
                <div className="relative flex items-center group">
                  <Mail className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Enter your institutional email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Specialization</label>
                <div className="relative flex items-center group">
                  <Stethoscope className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Enter your specialization"
                    className="w-full pl-12 pr-3 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Password</label>
                <div className="relative flex items-center group">
                  <Lock className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Min 6 characters"
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primaryBlue hover:bg-[#0D55C2] text-white font-bold py-4 rounded-xl shadow-lg shadow-primaryBlue/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-6 disabled:opacity-70 disabled:transform-none"
              >
                <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-muted border-t border-gray-100 pt-6">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-primaryBlue hover:text-[#0D55C2] transition-colors hover:underline">
                Sign In here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
