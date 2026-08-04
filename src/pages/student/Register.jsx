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
    specialization: 'General & Child Psychiatry',
    medicalCollege: 'NeuroMind Institute of Medical Sciences',
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
    <div className="min-h-screen bg-secondaryBg flex items-center justify-center p-6 select-none relative overflow-hidden">
      <div className="max-w-lg w-full bg-white border border-borderLine rounded-[28px] p-8 md:p-10 shadow-elevated relative z-10 animate-fadeIn">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E9F2FF] border border-primaryBlue/20 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Brain className="w-8 h-8 text-primaryBlue" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight">Create Scholar Account</h1>
          <p className="text-xs font-semibold text-muted mt-1 uppercase tracking-wider">Join Medical Resident Clinical Network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative flex items-center">
              <User className="w-5 h-5 text-muted absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                placeholder="Dr. Alexander Vance"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">Institutional Email</label>
            <div className="relative flex items-center">
              <Mail className="w-5 h-5 text-muted absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="vance@neuromind.edu"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">Specialization</label>
              <div className="relative flex items-center">
                <Stethoscope className="w-5 h-5 text-muted absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full pl-11 pr-3 py-3 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 text-muted absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Min 6 characters"
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primaryBlue hover:bg-[#0D55C2] text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-4"
          >
            <span>{isSubmitting ? 'Registering...' : 'Complete Scholar Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium text-muted">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-primaryBlue hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
