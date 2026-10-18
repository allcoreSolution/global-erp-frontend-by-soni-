import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Camera,
  CheckCircle2,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Sparkles,
  ShieldCheck,
  Crown,
  Activity,
  Check,
  AlertTriangle,
  RefreshCw,
  Building2,
  Layers,
  Terminal
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';
import superAdminAvatar from '../../assets/superadmin-avatar.jpg';

const SuperAdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | edit | password

  // Edit Profile Form
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    phone: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Image Upload / Preview
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  // 1. GET PROFILE API
  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/auth/profile');
      if (res.data) {
        const data = res.data.data || res.data;
        setProfile(data);
        setProfileForm({
          username: data.username || '',
          email: data.email || '',
          phone: data.phone || ''
        });
        if (data.profilePhoto) {
          setAvatarPreview(data.profilePhoto);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to load Super Admin profile.',
        confirmButtonColor: '#7c3aed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. EDIT PROFILE API
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.username.trim() || !profileForm.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Fields',
        text: 'Username and Email are mandatory.',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', profileForm.username.trim());
      formDataToSend.append('email', profileForm.email.trim().toLowerCase());
      formDataToSend.append('phone', profileForm.phone ? profileForm.phone.trim() : '');

      if (avatarFile) {
        formDataToSend.append('profilePhoto', avatarFile);
      }

      const res = await api.put('/auth/profile', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        const updated = res.data.data || res.data;
        setProfile(prev => ({ ...prev, ...updated }));
        Swal.fire({
          icon: 'success',
          title: 'Profile Updated',
          text: 'Your Super Admin details have been saved successfully!',
          timer: 2000,
          showConfirmButton: false
        });
        // Notify other components if needed
        window.dispatchEvent(new Event('authChanged'));
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Could not update profile. Please try again.',
        confirmButtonColor: '#7c3aed'
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // 3. CHANGE PASSWORD API
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Current Password Missing',
        text: 'Please enter your current password.',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Weak Password',
        text: 'New password must be at least 6 characters long.',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Passwords Do Not Match',
        text: 'New Password and Confirm Password do not match. Please re-enter.',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Password Changed!',
          text: 'Your master password has been successfully updated.',
          confirmButtonColor: '#7c3aed'
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Swal.fire({
        icon: 'error',
        title: 'Password Change Failed',
        text: error.response?.data?.message || 'Current password might be incorrect.',
        confirmButtonColor: '#7c3aed'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'File Too Large',
          text: 'Image size should be less than 5MB.',
          confirmButtonColor: '#7c3aed'
        });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 size={38} className="animate-spin text-purple-600 mb-3" />
        <span className="text-sm font-medium">Loading Super Admin Profile...</span>
      </div>
    );
  }

  const roleName = profile?.role || 'SuperAdmin';
  const displayAvatar = avatarPreview || profile?.profilePhoto || superAdminAvatar;

  return (
    <div className="min-h-full bg-slate-100 dark:bg-[#050a18] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors duration-200">
      {/* ── 1. Premium Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-purple-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar with Camera Trigger */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-purple-400/40 bg-purple-950 shadow-2xl flex items-center justify-center">
                <img
                  src={displayAvatar}
                  alt={profile?.username || 'Super Admin'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = superAdminAvatar;
                  }}
                />
              </div>
              <label
                htmlFor="avatar-upload-top"
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95"
                title="Change Avatar"
              >
                <Camera size={14} />
                <input
                  id="avatar-upload-top"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {profile?.username || 'Super Admin'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300">
                  <Crown size={12} />
                  Root Administrator
                </span>
              </div>
              <p className="text-xs sm:text-sm text-purple-200/80 mb-3">
                {profile?.email || 'superadmin@gmail.com'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-purple-200/70">
                <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Full System Privileges
                </span>
                <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg">
                  <Calendar size={14} className="text-purple-300" />
                  Created: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB') : 'Master Account'}
                </span>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchProfile}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Refresh Profile</span>
          </button>
        </div>
      </div>

      {/* ── 2. Navigation Tabs ── */}
      <div className="flex border-b border-slate-200 dark:border-[#14234b] space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-[#0b142c] text-purple-600 dark:text-purple-400 border-t-2 border-purple-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <User size={15} />
          <span>Profile Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'edit'
              ? 'bg-white dark:bg-[#0b142c] text-purple-600 dark:text-purple-400 border-t-2 border-purple-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Sparkles size={15} />
          <span>Edit Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'password'
              ? 'bg-white dark:bg-[#0b142c] text-purple-600 dark:text-purple-400 border-t-2 border-purple-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Lock size={15} />
          <span>Change Password</span>
        </button>
      </div>

      {/* ── 3. Tab Contents ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Account Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User size={18} className="text-purple-600 dark:text-purple-400" />
                <span>Super Administrator Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b]">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Username / ID</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{profile?.username}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b]">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Email Address</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{profile?.email}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b]">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Phone Number</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {profile?.phone || 'Not configured'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b]">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Role Status</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                    <Crown size={14} />
                    <span>{roleName}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b]">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tenant Isolation Bypass</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <CheckCircle2 size={14} />
                    <span>Cross-Tenant Super Access Enabled</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b]">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Account Created</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'System Genesis'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#14234b] flex items-center justify-between">
                <span className="text-xs text-slate-500">Need to update your details or password?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-[#14234b] text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-[#182955] transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* Platform Master Privileges */}
            <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span>Super Admin Privileges Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                As the Root Super Admin, you have unrestricted master authority over all tenants, modules, and platform data.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-medium">
                {[
                  'Tenant Registration & Billing',
                  'Plan Management & Pricing',
                  'Database Backup & Restore',
                  'Support Desk Master Control',
                  'Module & Feature Control',
                  'User Activity & Audit Logs',
                  'System Hardware & Health',
                  'Broadcast Notifications',
                  'Global ERP Financials'
                ].map((perm, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    <Check size={13} className="shrink-0" />
                    <span className="truncate">{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Security Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={18} className="text-purple-600 dark:text-purple-400" />
                <span>Security Overview</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b]">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Master Authentication</span>
                    <p className="text-slate-400 text-[10.5px]">HMAC JWT Signed</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                    SECURED
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b]">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Account Status</span>
                    <p className="text-slate-400 text-[10.5px]">Master Root ID</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/30">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b]">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Password Protection</span>
                    <p className="text-slate-400 text-[10.5px]">Bcrypt Salted Hash</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('password')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-semibold cursor-pointer"
                  >
                    Update →
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-300 space-y-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-purple-500" />
                  Security Tip
                </span>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  Always use a strong, unique password for the Super Admin master account to safeguard multi-tenant data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: EDIT PROFILE ── */}
      {activeTab === 'edit' && (
        <div className="max-w-3xl bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
            <span>Update Super Admin Profile</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Update your master administrator name, contact email, and telephone number.
          </p>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {/* Avatar Change Box */}
            <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b]">
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-500/40 bg-purple-950 flex-shrink-0">
                <img
                  src={displayAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = superAdminAvatar;
                  }}
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Profile Photo</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  JPG, PNG or WebP image under 5MB.
                </p>
                <label
                  htmlFor="avatar-upload-form"
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg cursor-pointer transition-colors mt-1"
                >
                  <Camera size={12} />
                  <span>Choose Image</span>
                  <input
                    id="avatar-upload-form"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Super Admin Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profileForm.username}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                    placeholder="superadmin"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                    placeholder="superadmin@gmail.com"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#14234b]">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14234b] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab: CHANGE PASSWORD ── */}
      {activeTab === 'password' && (
        <div className="max-w-2xl bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <KeyRound size={18} className="text-purple-600 dark:text-purple-400" />
            <span>Change Super Admin Master Password</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Ensure your account is protected with a strong password of at least 6 characters.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Validation indicators */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#081026] border border-slate-200 dark:border-[#14234b] space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    passwordForm.newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
                <span className={passwordForm.newPassword.length >= 6 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}>
                  At least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    passwordForm.newPassword && passwordForm.newPassword === passwordForm.confirmPassword
                      ? 'bg-emerald-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
                <span
                  className={
                    passwordForm.newPassword && passwordForm.newPassword === passwordForm.confirmPassword
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  Passwords match
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#14234b]">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14234b] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={13} />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SuperAdminProfile;
