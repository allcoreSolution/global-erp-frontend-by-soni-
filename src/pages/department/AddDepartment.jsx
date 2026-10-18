import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Save, X, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';

const AddDepartment = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    deptCode: `DPT-${Math.floor(Math.random() * 1000)}`,
    deptName: '',
    status: 'Active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/departments', form);
      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Department Created Successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#4f46e5', // indigo-600 to match theme
        }).then(() => {
          navigate('/department/list');
        });
      }
    } catch (err) {
      console.error('Error creating department:', err);
      setError(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800 pb-20">
      
      {/* Main Form Content */}
      <div className="max-w-3xl mx-auto space-y-6 mt-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={14} className="text-indigo-500" /> Create New Department
            </h3>
          </div>
          
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Department Code</label>
              <input type="text" value={form.deptCode} disabled className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono" />
              <p className="text-[10px] text-slate-400 mt-1">Auto-generated code for internal tracking.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Department Name *</label>
              <input 
                type="text" 
                name="deptName" 
                value={form.deptName} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" 
                placeholder="e.g. Sales, Human Resources, IT" 
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold text-emerald-600">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/department/list')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-100 flex items-center gap-2 transition-colors">
              <X size={16} /> Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              <CheckCircle size={16} /> {loading ? 'Saving...' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;
