import React, { useState, useEffect } from 'react';
import api from '../../api';
import { ArrowLeft, CheckCircle, Save, X, Shield, Key, LayoutGrid, CheckSquare, Star, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddRoleMaster = () => {
  const navigate = useNavigate();
  
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [compRes, branchRes] = await Promise.all([
          api.get('/companies').catch(() => ({ data: [] })),
          api.get('/branches').catch(() => ({ data: [] }))
        ]);
        setCompanies(Array.isArray(compRes.data) ? compRes.data : compRes.data.data || []);
        setBranches(Array.isArray(branchRes.data) ? branchRes.data : branchRes.data.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchDropdownData();
  }, []);

  const [form, setForm] = useState({
    // Basic Information
    roleCode: 'ROL-005',
    roleName: '',
    roleType: 'Custom',
    company: '',
    description: '',
    status: 'Active',

    // Access Scope
    companyAccess: 'All',
    branchAccess: 'All',
    departmentAccess: 'All',
    warehouseAccess: 'All',
    defaultBranch: '',
    defaultWarehouse: ''
  });

  const [modulePermissions, setModulePermissions] = useState([
    { module: 'Dashboard', view: true, create: false, edit: false, del: false, approve: false, export: false },
    { module: 'Employee', view: true, create: true, edit: true, del: false, approve: true, export: true },
    { module: 'Attendance', view: true, create: true, edit: true, del: false, approve: true, export: true },
    { module: 'Leave', view: true, create: true, edit: true, del: false, approve: true, export: true },
    { module: 'Payroll', view: true, create: true, edit: true, del: false, approve: true, export: true },
    { module: 'Sales', view: true, create: true, edit: true, del: true, approve: true, export: true },
    { module: 'Purchase', view: true, create: true, edit: true, del: true, approve: true, export: true },
    { module: 'Inventory', view: true, create: true, edit: true, del: true, approve: true, export: true },
    { module: 'Reports', view: true, create: false, edit: false, del: false, approve: false, export: true },
    { module: 'Settings', view: true, create: true, edit: true, del: true, approve: false, export: false }
  ]);

  const [approvalPermissions, setApprovalPermissions] = useState([
    { name: 'Leave Approval', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Expense Approval', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Purchase Approval', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Payment Approval', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Receipt Approval', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Stock Adjustment', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Journal Approval', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Appraisal Approval', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Credit Note', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Debit Note', view: false, create: false, edit: false, del: false, approve: false, export: false }
  ]);

  const [specialPermissions, setSpecialPermissions] = useState([
    { name: 'Manage Users', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Manage Roles', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'View Salary', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Edit Salary', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Financial Reports', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Profit And Loss', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Manage Branches', view: false, create: false, edit: false, del: false, approve: false, export: false },
    { name: 'Manage Masters', view: false, create: false, edit: false, del: false, approve: false, export: false }
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleModulePermChange = (index, field) => {
    setModulePermissions(prev => {
      const newPerms = [...prev];
      newPerms[index] = { ...newPerms[index], [field]: !newPerms[index][field] };
      return newPerms;
    });
  };

  const handleApprovePermChange = (index, field) => {
    setApprovalPermissions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: !updated[index][field] };
      return updated;
    });
  };

  const handleSpecialPermChange = (index, field) => {
    setSpecialPermissions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: !updated[index][field] };
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        name: form.roleName,
        modulePermissions,
        approvalPermissions,
        specialPermissions
      };
      
      const res = await api.post('/roles', payload);
      if (res.data) {
        alert('Role Created Successfully!');
        navigate('/setup/role-master');
      }
    } catch (err) {
      console.error('Error creating role:', err);
      alert('Error saving role: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/setup/role-master')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm"
        >
          <ArrowLeft size={18} /> Back to Role List
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. BASIC INFORMATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <Shield size={14} className="text-indigo-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Basic Information</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Role Code *</label>
                  <input type="text" value={form.roleCode} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Role Name *</label>
                  <input type="text" name="roleName" value={form.roleName} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. Finance Manager" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Role Type *</label>
                  <select name="roleType" value={form.roleType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Custom</option>
                    <option>System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Company *</label>
                  <select name="company" value={form.company} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Company</option>
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>{c.companyName || c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description</label>
                  <input type="text" name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="Role description..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Status *</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none text-emerald-600 font-bold">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. MODULE PERMISSIONS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <LayoutGrid size={14} className="text-emerald-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Module Permissions</h3>
              </div>
              <div className="p-0 overflow-auto max-h-[300px]">
                <table className="block w-full overflow-x-auto w-full text-left text-xs relative">
                  <thead className="bg-slate-50 border-b text-slate-500 sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-3 font-bold">Module</th>
                      <th className="px-3 py-3 font-bold text-center">View</th>
                      <th className="px-3 py-3 font-bold text-center">Create</th>
                      <th className="px-3 py-3 font-bold text-center">Edit</th>
                      <th className="px-3 py-3 font-bold text-center">Delete</th>
                      <th className="px-3 py-3 font-bold text-center">Approve</th>
                      <th className="px-3 py-3 font-bold text-center">Export</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modulePermissions.map((mod, idx) => (
                      <tr key={mod.module} className="hover:bg-slate-50/50">
                        <td className="px-5 py-2.5 font-bold text-slate-700">{mod.module}</td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.view} onChange={() => handleModulePermChange(idx, 'view')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.create} onChange={() => handleModulePermChange(idx, 'create')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.edit} onChange={() => handleModulePermChange(idx, 'edit')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.del} onChange={() => handleModulePermChange(idx, 'del')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.approve} onChange={() => handleModulePermChange(idx, 'approve')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.export} onChange={() => handleModulePermChange(idx, 'export')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. APPROVAL PERMISSIONS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <CheckSquare size={14} className="text-purple-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Approval Permissions</h3>
              </div>
              <div className="p-0 overflow-auto max-h-[300px]">
                <table className="block w-full overflow-x-auto w-full text-left text-xs relative">
                  <thead className="bg-slate-50 border-b text-slate-500 sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-3 font-bold">Approval Type</th>
                      <th className="px-3 py-3 font-bold text-center">View</th>
                      <th className="px-3 py-3 font-bold text-center">Create</th>
                      <th className="px-3 py-3 font-bold text-center">Edit</th>
                      <th className="px-3 py-3 font-bold text-center">Delete</th>
                      <th className="px-3 py-3 font-bold text-center">Approve</th>
                      <th className="px-3 py-3 font-bold text-center">Export</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {approvalPermissions.map((mod, idx) => (
                      <tr key={mod.name} className="hover:bg-slate-50/50">
                        <td className="px-5 py-2.5 font-bold text-slate-700">{mod.name}</td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.view} onChange={() => handleApprovePermChange(idx, 'view')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.create} onChange={() => handleApprovePermChange(idx, 'create')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.edit} onChange={() => handleApprovePermChange(idx, 'edit')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.del} onChange={() => handleApprovePermChange(idx, 'del')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.approve} onChange={() => handleApprovePermChange(idx, 'approve')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.export} onChange={() => handleApprovePermChange(idx, 'export')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-6">

            {/* 2. ACCESS SCOPE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Key size={14} className="text-amber-500" /> Access Scope
                </h3>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Company Access</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="radio" name="companyAccess" value="All" checked={form.companyAccess === 'All'} onChange={handleChange} className="text-emerald-500 focus:ring-emerald-400 bg-white border-slate-300" /> All
                    </label>
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="radio" name="companyAccess" value="Selected" checked={form.companyAccess === 'Selected'} onChange={handleChange} className="text-emerald-500 focus:ring-emerald-400 bg-white border-slate-300" /> Selected
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Branch Access</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="radio" name="branchAccess" value="All" checked={form.branchAccess === 'All'} onChange={handleChange} className="text-emerald-500 focus:ring-emerald-400 bg-white border-slate-300" /> All
                    </label>
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="radio" name="branchAccess" value="Selected" checked={form.branchAccess === 'Selected'} onChange={handleChange} className="text-emerald-500 focus:ring-emerald-400 bg-white border-slate-300" /> Selected
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Department Access</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="radio" name="departmentAccess" value="All" checked={form.departmentAccess === 'All'} onChange={handleChange} className="text-emerald-500 focus:ring-emerald-400 bg-white border-slate-300" /> All
                    </label>
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="radio" name="departmentAccess" value="Selected" checked={form.departmentAccess === 'Selected'} onChange={handleChange} className="text-emerald-500 focus:ring-emerald-400 bg-white border-slate-300" /> Selected
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Warehouse Access</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="radio" name="warehouseAccess" value="All" checked={form.warehouseAccess === 'All'} onChange={handleChange} className="text-emerald-500 focus:ring-emerald-400 bg-white border-slate-300" /> All
                    </label>
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="radio" name="warehouseAccess" value="Selected" checked={form.warehouseAccess === 'Selected'} onChange={handleChange} className="text-emerald-500 focus:ring-emerald-400 bg-white border-slate-300" /> Selected
                    </label>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4 mt-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Default Branch</label>
                  <select name="defaultBranch" value={form.defaultBranch} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none">
                    <option value="">Select Branch</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.branchName || b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Default Warehouse</label>
                  <select name="defaultWarehouse" value={form.defaultWarehouse} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none">
                    <option value="">Select Warehouse</option>
                    <option>Main Warehouse</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. SPECIAL PERMISSIONS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Star size={14} className="text-rose-500" /> Special Permissions
                </h3>
              </div>
              <div className="p-0 overflow-auto max-h-[300px]">
                <table className="block w-full overflow-x-auto w-full text-left text-xs relative">
                  <thead className="bg-slate-50 border-b text-slate-500 sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-3 font-bold">Permission</th>
                      <th className="px-3 py-3 font-bold text-center">View</th>
                      <th className="px-3 py-3 font-bold text-center">Create</th>
                      <th className="px-3 py-3 font-bold text-center">Edit</th>
                      <th className="px-3 py-3 font-bold text-center">Delete</th>
                      <th className="px-3 py-3 font-bold text-center">Approve</th>
                      <th className="px-3 py-3 font-bold text-center">Export</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {specialPermissions.map((mod, idx) => (
                      <tr key={mod.name} className="hover:bg-slate-50/50">
                        <td className="px-5 py-2.5 font-bold text-slate-700">{mod.name}</td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.view} onChange={() => handleSpecialPermChange(idx, 'view')} className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.create} onChange={() => handleSpecialPermChange(idx, 'create')} className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.edit} onChange={() => handleSpecialPermChange(idx, 'edit')} className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.del} onChange={() => handleSpecialPermChange(idx, 'del')} className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.approve} onChange={() => handleSpecialPermChange(idx, 'approve')} className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500" />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input type="checkbox" checked={mod.export} onChange={() => handleSpecialPermChange(idx, 'export')} className="w-4 h-4 text-rose-500 rounded border-gray-300 focus:ring-rose-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-12 flex justify-end items-center gap-3 mt-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/setup/role-master')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button type="button" className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-900 flex items-center gap-2">
              <Save size={16} /> Save Draft
            </button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <CheckCircle size={16} /> Create Role
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddRoleMaster;
