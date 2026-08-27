import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Lock, Mail, ArrowRight, ShieldCheck, Activity, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!otpSent) {
        // Step 1: Send OTP
        const res = await api.post('/auth/forgot-password/send-otp', { email });
        toast.success(res.message || 'OTP sent successfully!');
        setOtpSent(true);
      } else {
        // Step 2: Reset Password
        if (newPassword !== confirmPassword) {
          toast.error('Passwords do not match');
          setIsSubmitting(false);
          return;
        }
        
        const res = await api.post('/auth/forgot-password/reset', { email, otp, newPassword });
        toast.success(res.message || 'Password reset successfully!');
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'An error occurred. Please try again.');
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
                Account <span className="text-cyan">Recovery</span>.
              </h1>
              <p className="text-lg text-white/80 font-medium leading-relaxed max-w-md">
                Securely reset your password and regain access to the premier interactive curriculum platform.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg mt-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-navy bg-cyan flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-navy" />
              </div>
              <div className="text-sm font-semibold">
                <span className="text-cyan">Secure</span> Protocol
              </div>
            </div>
            <p className="text-sm text-white/80 font-medium italic">
              "We take your data security seriously. Your clinical progress is always protected."
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
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
              <h2 className="text-3xl font-extrabold text-navy tracking-tight mb-2">
                {otpSent ? 'Secure Reset' : 'Reset Password'}
              </h2>
              <p className="text-sm font-semibold text-muted uppercase tracking-wider">
                {otpSent ? 'Create a new password' : 'Enter your email to receive an OTP'}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {!otpSent ? (
                <div>
                  <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative flex items-center group">
                    <Mail className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your registered email"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-medium text-sm text-navy focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="animate-fadeIn space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Enter OTP</label>
                    <div className="relative flex items-center group mb-2">
                      <ShieldCheck className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        placeholder="6-digit code"
                        maxLength={6}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 font-bold text-lg text-navy tracking-widest focus:bg-white focus:border-primaryBlue focus:ring-4 focus:ring-primaryBlue/10 outline-none transition-all text-center"
                      />
                    </div>
                    <p className="text-xs text-muted text-center mb-4">
                      Sent to <span className="font-bold text-navy">{email}</span>. <br/>
                      <button type="button" onClick={() => setOtpSent(false)} className="text-primaryBlue hover:underline mt-2">Change Email</button>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative flex items-center group">
                      <Lock className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                    <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Confirm New Password</label>
                    <div className="relative flex items-center group">
                      <Lock className="w-5 h-5 text-muted absolute left-4 pointer-events-none group-focus-within:text-primaryBlue transition-colors" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm new password"
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
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primaryBlue hover:bg-[#0D55C2] text-white font-bold py-4 rounded-xl shadow-lg shadow-primaryBlue/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-6 disabled:opacity-70 disabled:transform-none"
              >
                <span>
                  {isSubmitting 
                    ? (otpSent ? 'Resetting Password...' : 'Sending OTP...') 
                    : (otpSent ? 'Reset Password' : 'Send Recovery OTP')}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-muted border-t border-gray-100 pt-6">
              Remember your password?{' '}
              <Link to="/login" className="font-bold text-primaryBlue hover:text-[#0D55C2] transition-colors hover:underline">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
