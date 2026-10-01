import React, { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { Building, Mail, Phone, MapPin, User, Lock, Loader2 } from 'lucide-react';

const RegisterCompany = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [plans, setPlans] = useState([]);
  
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    adminEmail: '',
    adminPassword: '',
    subscriptionPlan: '',
    subscriptionExpiry: ''
  });

  React.useEffect(() => {
    api.get('/plans').then(res => setPlans(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/companies/register', formData);
      setSuccess('Company and Admin User registered successfully!');
      setTimeout(() => {
        navigate('/super-admin/companies');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Register New Company (SaaS Tenant)</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Create a new workspace for your client and assign them an admin account.</p>

      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
      {success && <div className="p-4 mb-6 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-100">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Company Details Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Company Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Company Name</label>
              <div className="relative">
                <Building size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Acme Corp Pvt Ltd"/>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Company Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input required type="email" name="companyEmail" value={formData.companyEmail} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="info@acmecorp.com"/>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input required type="text" name="companyPhone" value={formData.companyPhone} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+91 9876543210"/>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Mumbai, Maharashtra"/>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Setup Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Subscription Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Assign Plan</label>
              <select name="subscriptionPlan" value={formData.subscriptionPlan} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select a Plan (Optional)</option>
                {plans.filter(p => p.isActive).map(plan => (
                  <option key={plan._id} value={plan._id}>{plan.name} - ${plan.price}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Expiry Date</label>
              <input type="date" name="subscriptionExpiry" value={formData.subscriptionExpiry} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Admin Details Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Client Admin Setup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Admin Email (Login ID)</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input required type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="admin@acmecorp.com"/>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Admin Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input required type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••"/>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Building size={20} />}
          {loading ? 'Registering Company...' : 'Register Company & Generate Admin Account'}
        </button>

      </form>
    </div>
  );
};

export default RegisterCompany;
