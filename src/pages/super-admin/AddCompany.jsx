import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  Building2,
  User,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  FileText,
  Package,
  Layers,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Globe,
  Briefcase,
  ChevronRight,
  ExternalLink,
  Edit3
} from 'lucide-react';
import api from '../../api';

const AddCompany = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Plans list loaded from database
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingCompany, setLoadingCompany] = useState(isEdit);

  // Form State
  const [formData, setFormData] = useState({
    // Section 1: Company Profile
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    gstin: '',
    website: '',

    // Section 2: Primary Admin
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',

    // Section 3: Subscription & Quota
    planId: '',
    billingCycle: 'yearly',
    maxUsers: 10,
    maxBranches: 2,
    status: 'Active'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Success state for showing credentials modal
  const [successData, setSuccessData] = useState(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Load real plans from MongoDB
  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await api.get('/plans');
      const planList = Array.isArray(res.data) ? res.data : (res.data?.plans || []);
      setPlans(planList);

      if (!isEdit && planList.length > 0) {
        const first = planList[0];
        setFormData(prev => ({
          ...prev,
          planId: first._id,
          maxUsers: first.maxUsers || 10,
          maxBranches: first.maxBranches || 2
        }));
      }
    } catch (err) {
      console.error('Error fetching plans from API:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  // If in Edit mode, fetch existing company details
  useEffect(() => {
    if (id) {
      const fetchCompany = async () => {
        setLoadingCompany(true);
        try {
          const res = await api.get(`/companies/${id}`);
          const c = res.data;
          if (c) {
            setFormData({
              name: c.name || '',
              code: c.code || '',
              email: c.email || '',
              phone: c.phone || '',
              address: c.address || '',
              city: c.city || '',
              state: c.state || '',
              gstin: c.gstin || '',
              website: c.website || '',
              adminName: c.adminUser?.username || 'Admin',
              adminEmail: c.adminUser?.email || '',
              adminPhone: c.adminUser?.phone || c.phone || '',
              adminPassword: '', // keep blank unless modifying
              planId: c.subscriptionPlan?._id || c.subscriptionPlan || '',
              billingCycle: c.billingCycle || 'yearly',
              maxUsers: c.maxUsers || 10,
              maxBranches: c.maxBranches || 2,
              status: c.subscriptionStatus || (c.isActive ? 'Active' : 'Suspended')
            });
            setCodeManuallyEdited(true);
          }
        } catch (err) {
          console.error('Failed to load company for edit:', err);
          setError('Could not load company details from backend.');
        } finally {
          setLoadingCompany(false);
        }
      };
      fetchCompany();
    }
  }, [id]);

  useEffect(() => {
    fetchPlans();
  }, []);

  // Auto-generate code when company name changes (if not manually edited)
  const handleNameChange = (e) => {
    const name = e.target.value;
    if (!codeManuallyEdited) {
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const codePreview = cleanName ? `${cleanName.substring(0, 4)}-${Math.floor(100 + Math.random() * 900)}` : '';
      setFormData(prev => ({ ...prev, name, code: codePreview }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  };

  // Helper to generate a strong random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, adminPassword: pwd }));
    setShowPassword(true);
  };

  // Handle plan selection
  const handlePlanSelect = (selectedPlan) => {
    setFormData(prev => ({
      ...prev,
      planId: selectedPlan._id,
      maxUsers: selectedPlan.maxUsers || prev.maxUsers,
      maxBranches: selectedPlan.maxBranches || prev.maxBranches
    }));
  };

  // Calculate auto expiry preview
  const getExpiryPreview = () => {
    const now = new Date();
    if (formData.billingCycle === 'yearly') {
      now.setFullYear(now.getFullYear() + 1);
    } else if (formData.billingCycle === 'lifetime') {
      now.setFullYear(now.getFullYear() + 10);
    } else {
      now.setDate(now.getDate() + 30);
    }
    return now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.name.trim()) {
      setError('Company Name is required.');
      return;
    }

    if (isEdit) {
      setSubmitting(true);
      const updatePayload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        gstin: formData.gstin.trim(),
        website: formData.website.trim(),
        subscriptionPlan: formData.planId || null,
        billingCycle: formData.billingCycle,
        subscriptionStatus: formData.status
      };

      try {
        await api.put(`/companies/${id}`, updatePayload);
        navigate('/super-admin/companies');
      } catch (err) {
        console.error('Failed to update company:', err);
        setError(err.response?.data?.message || err.message || 'Error updating company.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!formData.adminEmail.trim()) {
      setError('Primary Admin Email is required.');
      return;
    }
    if (!formData.adminName.trim()) {
      setError('Primary Admin Name is required.');
      return;
    }

    // Default password if blank
    const passwordToUse = formData.adminPassword.trim() || 'Admin@123';

    setSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim() || formData.name.substring(0, 4).toUpperCase(),
      email: formData.email.trim() || formData.adminEmail.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      gstin: formData.gstin.trim(),
      website: formData.website.trim(),
      adminName: formData.adminName.trim(),
      adminEmail: formData.adminEmail.trim(),
      adminPhone: formData.adminPhone.trim(),
      adminPassword: passwordToUse,
      subscriptionPlan: formData.planId || null,
      billingCycle: formData.billingCycle,
      maxUsers: Number(formData.maxUsers) || 10,
      maxBranches: Number(formData.maxBranches) || 2,
      status: formData.status
    };

    try {
      const res = await api.post('/companies/register', payload);
      
      const createdCompany = res.data?.company || {};
      const createdAdmin = res.data?.adminUser || {};

      setSuccessData({
        companyName: createdCompany.name || payload.name,
        code: createdCompany.code || payload.code,
        adminEmail: createdAdmin.email || payload.adminEmail,
        adminPassword: createdAdmin.initialPassword || passwordToUse,
        planName: plans.find(p => p._id === formData.planId)?.name || 'Standard Plan',
        expiryDate: getExpiryPreview()
      });

    } catch (err) {
      console.error('Failed to register company:', err);
      setError(err.response?.data?.message || err.message || 'Error registering company in backend.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCredentialsText = () => {
    if (!successData) return;
    const text = `GLOBAL ERP - Client Company Credentials\n---------------------------------------\nCompany: ${successData.companyName} (${successData.code})\nAdmin Email: ${successData.adminEmail}\nAdmin Password: ${successData.adminPassword}\nPlan: ${successData.planName} (Expires: ${successData.expiryDate})\nLogin Portal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Top Header */}
      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 mb-2">
              <Sparkles size={12} className="text-blue-600 dark:text-blue-400" />
              {isEdit ? 'Tenant Modification Engine' : 'Tenant Provisioning Engine'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isEdit ? 'Edit Client Company' : 'Register New Client Company'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {isEdit 
                ? 'Update registered organization details, manage tenant subscription plan, or reconfigure administrator settings.'
                : 'Create a multi-tenant business instance, assign a subscription plan with module quotas, and configure primary administrator access credentials.'}
            </p>
          </div>

          <Link
            to="/super-admin/companies"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Companies
          </Link>
        </div>
      </div>

      {/* Main Form */}
      <div className="w-full">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div>
              <div className="font-bold">Registration Failed</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: Company Profile */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  1. Company & Business Profile
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Primary corporate details, registration identifier, and billing communication lines.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {/* Company Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Company Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Industrial Systems Pvt Ltd"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              {/* Company Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Tenant Short Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. APEX-101"
                  value={formData.code}
                  onChange={(e) => {
                    setCodeManuallyEdited(true);
                    setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }));
                  }}
                  className="w-full px-4 py-2.5 text-sm font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              {/* Official Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    placeholder="contact@apexindustrial.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  GSTIN / Tax ID
                </label>
                <input
                  type="text"
                  placeholder="27ABCDE1234F1Z5"
                  value={formData.gstin}
                  onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-2.5 text-sm font-mono uppercase rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Registered Office Address
                </label>
                <input
                  type="text"
                  placeholder="Suite 400, Industrial Area Phase 2"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-3 sm:col-span-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Primary Company Admin Account */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  2. Primary Tenant Administrator Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This user will be provisioned as the supreme Admin of this client instance to manage staff and settings.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {/* Admin Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Admin Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.adminName}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Admin Login Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Admin Login Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    placeholder="admin@apexindustrial.com"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Login Password
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={11} /> Generate
                  </button>
                </div>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Default: Admin@123"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 3: Subscription & Modules Quota */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                <Package size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  3. Subscription Plan & System Quota
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a live subscription plan to govern which modules and resources this client can access.
                </p>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="mt-6">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Select Subscription Plan
              </label>

              {loadingPlans ? (
                <div className="py-8 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-blue-600" />
                  Loading database plans...
                </div>
              ) : plans.length === 0 ? (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-sm flex items-center justify-between">
                  <span>No plans configured in database yet.</span>
                  <Link to="/super-admin/plans" className="text-xs font-bold underline text-blue-600">
                    Create Plan First
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map(p => {
                    const isSelected = formData.planId === p._id;
                    const price = p.price ?? (formData.billingCycle === 'yearly' ? (p.priceYearly || (p.priceMonthly ? p.priceMonthly * 10 : 0)) : (p.priceMonthly || 0));
                    const priceCycle = p.billingCycle ? `/${p.billingCycle}` : (formData.billingCycle === 'yearly' ? '/yr' : '/mo');

                    return (
                      <div
                        key={p._id}
                        onClick={() => handlePlanSelect(p)}
                        className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                            <Check size={14} />
                          </div>
                        )}
                        <div className="font-extrabold text-slate-900 dark:text-white text-base">
                          {p.name}
                        </div>
                        <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-2">
                          ₹{Number(price || 0).toLocaleString('en-IN')}
                          <span className="text-xs font-semibold text-slate-400 ml-1">
                            {priceCycle}
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <div className="flex items-center justify-between">
                            <span>Allowed Modules:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {p.allowedModules?.length || 12} Modules
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Max Users:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {p.maxUsers || 10} Users
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Max Branches:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {p.maxBranches || 1} Branches
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Billing Cycle & Auto-Inherited Plan Quota Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              
              {/* Billing Cycle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Billing Cycle
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  <option value="monthly">Monthly (30 Days)</option>
                  <option value="yearly">Yearly (365 Days)</option>
                  <option value="lifetime">Lifetime Access</option>
                </select>
                <div className="text-[11px] text-slate-500 mt-1.5">
                  Subscription Expiry Date: <b className="text-slate-700 dark:text-slate-300">{getExpiryPreview()}</b>
                </div>
              </div>

              {/* Inherited Quotas Info Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Auto-Inherited Plan Quotas
                </label>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex flex-col justify-center h-[42px]">
                  <div className="flex items-center justify-between">
                    <span>Licensed Seats: <b className="text-slate-900 dark:text-white">{plans.find(p => p._id === formData.planId)?.maxUsers || formData.maxUsers || 10} Users</b></span>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <span>Branches: <b className="text-slate-900 dark:text-white">{plans.find(p => p._id === formData.planId)?.maxBranches || formData.maxBranches || 1} Branch</b></span>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
                  ✓ Automatically linked from selected Plan ObjectId
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4">
            <Link
              to="/super-admin/companies"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-center transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  {isEdit ? 'Updating Company Details...' : 'Provisioning Company Instance...'}
                </>
              ) : (
                <>
                  {isEdit ? <Edit3 size={16} /> : <Sparkles size={16} />}
                  {isEdit ? 'Save Changes & Update Company' : 'Register & Provision Company'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center">
              Company Instance Created!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
              <b>{successData.companyName}</b> has been provisioned successfully in the database.
            </p>

            {/* Credentials Card */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Tenant Code:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{successData.code}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Admin Email:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{successData.adminEmail}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Admin Password:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                  {successData.adminPassword}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Subscription:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {successData.planName} (Valid till {successData.expiryDate})
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2">
              <button
                onClick={copyCredentialsText}
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow"
              >
                {copiedCredentials ? <Check size={16} /> : <Copy size={16} />}
                {copiedCredentials ? 'Credentials Copied to Clipboard!' : 'Copy Login Credentials'}
              </button>

              <button
                onClick={() => navigate('/super-admin/companies')}
                className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Go to Companies Registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCompany;
