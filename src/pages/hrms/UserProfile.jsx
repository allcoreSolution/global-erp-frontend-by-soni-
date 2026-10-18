import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Building,
  Briefcase,
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
  Layers
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Form Fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/auth/profile');
      if (res.data) {
        const userData = res.data.data || res.data;
        setProfile(userData);
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        if (userData.profilePhoto) {
          setImagePreview(userData.profilePhoto);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load user profile. Please try again.',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'File Too Large',
          text: 'Profile photo size must be less than 5MB',
          confirmButtonColor: '#4f46e5'
        });
        return;
      }
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Username is required.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    if (!formData.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Email address is required.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        Swal.fire({
          icon: 'warning',
          title: 'Password Too Short',
          text: 'New password must be at least 6 characters long.',
          confirmButtonColor: '#4f46e5'
        });
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        Swal.fire({
          icon: 'warning',
          title: 'Passwords Mismatch',
          text: 'New password and confirm password do not match.',
          confirmButtonColor: '#4f46e5'
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('username', formData.username.trim());
      payload.append('email', formData.email.trim());
      payload.append('phone', formData.phone.trim());

      if (formData.newPassword) {
        payload.append('currentPassword', formData.currentPassword);
        payload.append('newPassword', formData.newPassword.trim());
      }

      if (profileImageFile) {
        payload.append('profilePhoto', profileImageFile);
      }

      const res = await api.put('/auth/profile', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success) {
        const updated = res.data.data;
        setProfile(updated);
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));

        // Update local storage user details if cached
        try {
          const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (cachedUser) {
            cachedUser.username = updated.username;
            cachedUser.email = updated.email;
            if (updated.profilePhoto) cachedUser.profilePhoto = updated.profilePhoto;
            localStorage.setItem('user', JSON.stringify(cachedUser));
          }
        } catch (_) {}

        Swal.fire({
          icon: 'success',
          title: 'Profile Updated!',
          text: 'Your profile details have been successfully updated.',
          confirmButtonColor: '#4f46e5',
          timer: 2000
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Could not update profile. Please try again.',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-xs text-slate-500 font-medium">Loading user profile...</p>
      </div>
    );
  }

  const roleName = profile?.role || 'Staff';
  const roleBadgeColor =
    roleName.toLowerCase().includes('admin') || roleName.toLowerCase().includes('super')
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : roleName.toLowerCase().includes('hr')
      ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-2xl flex items-center justify-center overflow-hidden shadow-md border-2 border-white">
                {imagePreview ? (
                  <img
                    src={imagePreview.startsWith('http') || imagePreview.startsWith('blob:') ? imagePreview : `${api.defaults.baseURL?.replace('/api', '') || ''}${imagePreview}`}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                    }}
                  />
                ) : (
                  profile?.username?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm text-slate-600 hover:text-indigo-600 cursor-pointer transition"
                title="Change Photo"
              >
                <Camera size={14} />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {profile?.username}
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleBadgeColor}`}>
                  {roleName}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Active
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>{profile?.email}</span>
                {profile?.company?.name && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Building size={12} className="text-indigo-500" /> {profile.company.name}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-slate-400">Account Type</div>
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end">
                <Shield size={13} className="text-indigo-600" />
                {roleName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details Overview + Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account & Organization Details */}
        <div className="space-y-6">
          {/* Quick Info Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User size={15} className="text-indigo-600" /> Organization Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Shield size={13} className="text-slate-400" /> Assigned Role
                </span>
                <span className="font-bold text-slate-800">{roleName}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building size={13} className="text-slate-400" /> Company
                </span>
                <span className="font-semibold text-slate-800">{profile?.company?.name || 'Default Organization'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-slate-400" /> Department
                </span>
                <span className="font-semibold text-slate-800">{profile?.department || 'Administration'}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-slate-400" /> Designation
                </span>
                <span className="font-semibold text-slate-800">{profile?.designation || roleName}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" /> Account Created
                </span>
                <span className="font-mono text-slate-700">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Permissions Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Layers size={15} className="text-indigo-600" /> Role Permissions
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {profile?.permissions?.length || 0} Rights
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Access granted to ERP modules according to your <span className="font-semibold text-slate-700">{roleName}</span> role.
            </p>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {profile?.permissions?.length > 0 ? (
                profile.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-600 transition"
                  >
                    {perm}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">All Superadmin permissions enabled</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-7 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User size={18} className="text-indigo-600" /> Edit Profile Information
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your contact details, username, and change account password.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" /> Username / Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" /> Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" /> Mobile / Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <KeyRound size={14} className="text-indigo-600" /> Change Password
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Leave blank if you do not wish to change your current password.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600">Current Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600">New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 chars"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600">Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-type new password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/30"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={fetchProfile}
                  disabled={isSaving}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Discard Changes
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm hover:shadow transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} /> Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
