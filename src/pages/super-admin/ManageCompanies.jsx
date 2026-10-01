import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Building, Mail, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [subFormData, setSubFormData] = useState({
    subscriptionPlan: '',
    subscriptionExpiry: '',
    subscriptionStatus: 'Active'
  });

  useEffect(() => {
    fetchCompanies();
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/plans');
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.put(`/companies/${id}/toggle-status`);
      fetchCompanies(); // Refresh the list
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Error updating company status');
    }
  };

  const openSubEdit = (company) => {
    setEditingCompany(company);
    setSubFormData({
      subscriptionPlan: company.subscriptionPlan?._id || '',
      subscriptionExpiry: company.subscriptionExpiry ? company.subscriptionExpiry.split('T')[0] : '',
      subscriptionStatus: company.subscriptionStatus || 'Active'
    });
    setIsSubModalOpen(true);
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/companies/${editingCompany._id}/subscription`, subFormData);
      setIsSubModalOpen(false);
      fetchCompanies();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating subscription');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Manage Client Companies</h1>
      
      {loading ? (
        <p className="text-gray-500">Loading companies...</p>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Company Info</th>
                <th className="px-6 py-4 font-semibold">Admin Info</th>
                <th className="px-6 py-4 font-semibold">Subscription</th>
                <th className="px-6 py-4 font-semibold">System Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700/50">
              {companies.map((company) => (
                <tr key={company._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Building size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{company.name}</p>
                        <p className="text-xs flex items-center gap-1 mt-0.5"><Phone size={10}/> {company.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {company.adminUser ? (
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{company.adminUser.username}</p>
                        <p className="text-xs flex items-center gap-1 mt-0.5"><Mail size={10}/> {company.adminUser.email}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No Admin Assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {company.subscriptionPlan ? company.subscriptionPlan.name : 'No Plan'}
                      </span>
                      {company.subscriptionExpiry && (
                        <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded w-fit">
                          Exp: {new Date(company.subscriptionExpiry).toLocaleDateString()}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wide w-fit ${
                        company.subscriptionStatus === 'Active' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {company.subscriptionStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      company.isActive 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {company.isActive ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                      {company.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => openSubEdit(company)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-400"
                    >
                      Subscription
                    </button>
                    <button 
                      onClick={() => toggleStatus(company._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        company.isActive 
                        ? 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400'
                        : 'bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400'
                      }`}
                    >
                      {company.isActive ? 'Block System' : 'Unblock System'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subscription Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Manage Subscription</h2>
            <form onSubmit={handleSubSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Plan</label>
                <select 
                  value={subFormData.subscriptionPlan}
                  onChange={e => setSubFormData({...subFormData, subscriptionPlan: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none"
                >
                  <option value="">No Plan</option>
                  {plans.map(p => (
                    <option key={p._id} value={p._id}>{p.name} (${p.price})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  value={subFormData.subscriptionExpiry}
                  onChange={e => setSubFormData({...subFormData, subscriptionExpiry: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <select 
                  value={subFormData.subscriptionStatus}
                  onChange={e => setSubFormData({...subFormData, subscriptionStatus: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCompanies;
