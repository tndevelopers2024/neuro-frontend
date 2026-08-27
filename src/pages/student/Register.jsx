import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Brain, User, Mail, Lock, Stethoscope, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, sendOtp } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialization: '',
    medicalCollege: '',
    otp: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!otpSent) {
        // Step 1: Send OTP
        await sendOtp(formData.email);
        setOtpSent(true);
      } else {
        // Step 2: Complete Registration
        if (!formData.otp) {
          toast.error('Please enter the OTP sent to your email.');
          setIsSubmitting(false);
          return;
        }
        
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...submitData } = formData;
        await register(submitData);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      }
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
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center bg-white relative overflow-y-auto">
          
          {/* Mobile Header (Only visible on small screens) */}
          <div className="md:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#E9F2FF] border border-primaryBlue/20 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Brain className="w-10 h-10 text-primaryBlue animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-navy tracking-tight">NeuroMind</h1>
          </div>

          <div className="max-w-md w-full mx-auto my-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-navy tracking-tight mb-2">
                {otpSent ? 'Verify Email' : 'Create Account'}
              </h2>
              <p className="text-sm font-semibold text-muted uppercase tracking-wider">
                {otpSent ? 'Enter the OTP sent to your email' : 'Join Medical Resident Clinical Network'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!otpSent ? (
                <>
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
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        placeholder="Min 6 characters"
                        minLength={6}
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

                  <div>
                    <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Confirm Password</label>
                    <div className="relative flex items-center group">
                      <Lock className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        placeholder="Confirm your password"
                        minLength={6}
                        className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 text-muted hover:text-primaryBlue transition-colors focus:outline-none"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Enter OTP</label>
                  <div className="relative flex items-center group mb-4">
                    <ShieldCheck className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      required
                      placeholder="6-digit code"
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-lg text-navy tracking-widest focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all text-center"
                    />
                  </div>
                  <p className="text-xs text-muted text-center">
                    Sent to <span className="font-bold text-navy">{formData.email}</span>. <br/>
                    <button type="button" onClick={() => setOtpSent(false)} className="text-primaryBlue hover:underline mt-2">Change Email or Details</button>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primaryBlue hover:bg-[#0D55C2] text-white font-bold py-4 rounded-xl shadow-lg shadow-primaryBlue/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-6 disabled:opacity-70 disabled:transform-none"
              >
                <span>
                  {isSubmitting 
                    ? (otpSent ? 'Verifying...' : 'Sending OTP...') 
                    : (otpSent ? 'Verify & Register' : 'Continue')}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {!otpSent && (
              <div className="mt-8 text-center text-sm font-medium text-muted border-t border-gray-100 pt-6">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-primaryBlue hover:text-[#0D55C2] transition-colors hover:underline">
                  Sign In here
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
