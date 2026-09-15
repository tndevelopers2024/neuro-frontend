import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Settings as SettingsIcon, User, Mail, Briefcase, GraduationCap, Calendar, Save, Key, UserCircle, Upload, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance.js';
import { getAssetUrl, getAvatarUrl } from '../../utils/urlHelper.js';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    specialization: user?.specialization || '',
    medicalCollege: user?.medicalCollege || '',
    course: user?.course || '',
    year: user?.year || '',
    profileImage: user?.profileImage ? (user.profileImage.includes('unsplash') ? '' : getAssetUrl(user.profileImage)) : '',
    currentPassword: '',
    newPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Only send password fields if attempting to change password
    const submitData = { ...formData };
    if (!submitData.currentPassword || !submitData.newPassword) {
      delete submitData.currentPassword;
      delete submitData.newPassword;
    }

    // Keep profileImage clean in database
    if (submitData.profileImage && submitData.profileImage.includes('/uploads/')) {
      submitData.profileImage = submitData.profileImage.substring(submitData.profileImage.indexOf('/uploads/'));
    }

    try {
      await updateProfile(submitData);
      // Clear password fields on success
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err) {
      // Auth context handles error toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);

    setIsUploading(true);
    try {
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.url) {
        // Backend returns e.g. /uploads/images/xyz.png, resolve to accessible asset URL
        const fullUrl = getAssetUrl(res.url);
        setFormData((prev) => ({ ...prev, profileImage: fullUrl }));
        toast.success('Image uploaded! Save preferences to apply.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-primaryBlue rounded-2xl p-8 lg:p-10 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center backdrop-blur-md shadow-inner shrink-0 overflow-hidden">
            {formData.profileImage ? (
              <img src={getAssetUrl(formData.profileImage)} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <SettingsIcon className="w-10 h-10 text-white" />
            )}
          </div>
          <div>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block border border-white/20 backdrop-blur-md">
              Account Preferences
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-1 text-white">
              Profile Settings
            </h1>
            <p className="text-white/80 font-medium mt-2">
              Manage your personal information, clinical details, and security credentials.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Actions / Info */}
        <div className="space-y-6">
          <div className="bg-white border border-borderLine rounded-2xl p-6 shadow-soft">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2 mb-4">
              <UserCircle className="w-5 h-5 text-primaryBlue" /> Avatar Settings
            </h3>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 rounded-full bg-secondaryBg border border-borderLine flex items-center justify-center overflow-hidden shadow-inner">
                {formData.profileImage ? (
                  <img src={getAssetUrl(formData.profileImage)} alt="Current Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted" />
                )}
              </div>
              <div className="w-full">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-secondaryBg hover:bg-[#E9F2FF] border border-borderLine text-navy hover:text-primaryBlue font-semibold text-sm transition-all"
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Upload New Image</>
                  )}
                </button>
                <p className="text-[10px] text-muted mt-2 leading-relaxed text-center">
                  Recommended size: 400x400px. JPG, PNG or WEBP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-borderLine rounded-2xl p-6 shadow-soft">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-primaryBlue" /> Security & Role
            </h3>
            <p className="text-sm font-medium text-muted mb-4">
              Your account is currently registered as a <strong className="text-navy uppercase">{user?.role}</strong>.
            </p>
            <div className="p-4 bg-medicalGreen/10 rounded-xl border border-medicalGreen/20 flex items-start gap-3">
              <div className="mt-0.5 w-2 h-2 rounded-full bg-medicalGreen shrink-0 animate-pulse" />
              <p className="text-xs font-semibold text-medicalGreen">
                Your data is securely encrypted. We adhere to clinical privacy guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-borderLine rounded-2xl shadow-soft overflow-hidden">
            
            <div className="p-8 border-b border-borderLine">
              <h2 className="text-xl font-bold text-navy mb-6">Personal Identity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primaryBlue" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:bg-white focus:border-primaryBlue focus:ring-1 focus:ring-primaryBlue outline-none text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider flex items-center gap-1.5 opacity-70">
                    <Mail className="w-3.5 h-3.5 text-primaryBlue" /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full p-3 rounded-xl bg-gray-100 border border-borderLine text-muted outline-none text-sm font-medium cursor-not-allowed"
                    title="Email address cannot be changed"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-b border-borderLine bg-gray-50/50">
              <h2 className="text-xl font-bold text-navy mb-6">Clinical & Academic Background</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primaryBlue" /> Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g., Psychiatry Resident"
                    className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:bg-white focus:border-primaryBlue focus:ring-1 focus:ring-primaryBlue outline-none text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-primaryBlue" /> Medical College / Institution
                  </label>
                  <input
                    type="text"
                    name="medicalCollege"
                    value={formData.medicalCollege}
                    onChange={handleChange}
                    placeholder="University Hospital"
                    className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:bg-white focus:border-primaryBlue focus:ring-1 focus:ring-primaryBlue outline-none text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-primaryBlue" /> Course / Degree
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="MD Psychiatry"
                    className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:bg-white focus:border-primaryBlue focus:ring-1 focus:ring-primaryBlue outline-none text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primaryBlue" /> Residency Year
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-secondaryBg border border-borderLine focus:bg-white focus:border-primaryBlue outline-none text-sm font-medium transition-all"
                  >
                    <option value="">Select Year</option>
                    <option value="PGY-1">PGY-1 (Intern)</option>
                    <option value="PGY-2">PGY-2</option>
                    <option value="PGY-3">PGY-3</option>
                    <option value="PGY-4">PGY-4 (Chief)</option>
                    <option value="Attending">Attending / Fellow</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-8 border-b border-borderLine">
              <h2 className="text-xl font-bold text-navy mb-2">Change Password</h2>
              <p className="text-sm font-medium text-muted mb-6">Leave these fields blank if you do not wish to change your password.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">Current Password</label>
                  <div className="relative flex items-center group">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full p-3 pr-12 rounded-xl bg-secondaryBg border border-borderLine focus:bg-white focus:border-primaryBlue outline-none text-sm font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 text-muted hover:text-primaryBlue transition-colors focus:outline-none"
                      aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5 uppercase tracking-wider">New Password</label>
                  <div className="relative flex items-center group">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full p-3 pr-12 rounded-xl bg-secondaryBg border border-borderLine focus:bg-white focus:border-primaryBlue outline-none text-sm font-medium transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 text-muted hover:text-primaryBlue transition-colors focus:outline-none"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex items-center justify-end gap-4">
              <button
                type="button"
                className="px-6 py-3 rounded-xl text-sm font-bold text-navy bg-white border border-borderLine hover:bg-secondaryBg transition-colors"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Changes...' : 'Save Preferences'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
