import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Save, X, User, Lock, Shield, Building, LayoutGrid, CheckSquare, ShieldCheck, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddUserMaster = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // Basic User Information
    userId: 'USR-1021',
    employee: '',
    empId: 'Auto',
    fullName: 'Auto',
    mobile: '',
    email: '',
    status: 'Active',

    // Login Information
    username: '',
    password: '',
    confirmPassword: '',
    twoFactorAuth: 'No',
    forcePassword: 'No',
    accountExpiry: '',

    // Role Assignment
    primaryRole: '',
    additionalRole: '',
    permissionGroup: '',

    // Company & Access
    company: '',
    branchAccess: 'All',
    warehouse: '',
    department: '',
    defaultBranch: '',
    defaultWarehouse: '',

    // Security Settings
    loginAllowed: 'Yes',
    sessionTimeout: '30 Minutes',
    multipleLogin: 'No',
    passwordExpiry: '90 Days',
    failedAttempts: '5'
  });

  const [modulePermissions, setModulePermissions] = useState([
    { module: 'Dashboard', view: true, create: false, edit: false, del: false, approve: false, export: false },
    { module: 'Employee', view: true, create: true, edit: true, del: false, approve: true, export: true },
    { module: 'Attendance', view: true, create: true, edit: true, del: false, approve: true, export: true },
    { module: 'Payroll', view: true, create: true, edit: true, del: false, approve: true, export: true },
    { module: 'Sales', view: true, create: true, edit: true, del: true, approve: true, export: true },
    { module: 'Purchase', view: true, create: true, edit: true, del: true, approve: true, export: true },
    { module: 'Inventory', view: true, create: true, edit: true, del: true, approve: true, export: true },
    { module: 'Reports', view: true, create: false, edit: false, del: false, approve: false, export: true },
    { module: 'Settings', view: true, create: true, edit: true, del: true, approve: false, export: false }
  ]);

  const [approvalPermissions, setApprovalPermissions] = useState({
    leave: true, expense: true, purchase: true, payment: true, receipt: true, stockAdjustment: true,
    journal: true, creditNote: true, debitNote: true, appraisal: true, sales: true, purchaseReturn: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleModulePermChange = (index, field) => {
    const newPerms = [...modulePermissions];
    newPerms[index][field] = !newPerms[index][field];
    setModulePermissions(newPerms);
  };

  const handleApprovePermChange = (key) => {
    setApprovalPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('User Created Successfully!');
    navigate('/setup/user-master');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/setup/user-master')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm"
        >
          <ArrowLeft size={18} /> Back to User List
        </button>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700">
            <Plus size={16} /> Create User
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. BASIC USER INFORMATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <User size={14} className="text-indigo-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Basic User Information</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">User ID</label>
                  <input type="text" value={form.userId} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Employee *</label>
                  <select name="employee" value={form.employee} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Employee</option>
                    <option>Soni Tiwari</option>
                    <option>Vikram Singh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Employee ID</label>
                  <input type="text" value={form.empId} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Full Name</label>
                  <input type="text" value={form.fullName} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Mobile</label>
                  <input type="text" name="mobile" value={form.mobile} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. 9876543210" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="email@company.com" />
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

            {/* 3. ROLE ASSIGNMENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} className="text-amber-500" /> Role Assignment
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Primary Role *</label>
                  <select name="primaryRole" value={form.primaryRole} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Role</option>
                    <option>System Admin</option>
                    <option>HR Manager</option>
                    <option>Sales Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Additional Role</label>
                  <select name="additionalRole" value={form.additionalRole} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Role</option>
                    <option>Finance Viewer</option>
                    <option>Inventory Manager</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Permission Group</label>
                  <select name="permissionGroup" value={form.permissionGroup} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Group</option>
                    <option>All Access</option>
                    <option>Standard Employee</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. MODULE PERMISSIONS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <LayoutGrid size={14} className="text-emerald-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Module Permissions</h3>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b text-slate-500">
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

            {/* 6. APPROVAL PERMISSIONS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <CheckSquare size={14} className="text-purple-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Approval Permissions</h3>
              </div>
              <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
                {Object.keys(approvalPermissions).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={approvalPermissions[key]} 
                      onChange={() => handleApprovePermChange(key)}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-6">

            {/* 2. LOGIN INFORMATION */}
            <div className="bg-slate-800 rounded-2xl shadow-xl shadow-slate-200 overflow-hidden text-white border border-slate-700">
              <div className="bg-slate-900 border-b border-slate-700 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Lock size={14} className="text-emerald-400" /> Login Information
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username *</label>
                  <input type="text" name="username" value={form.username} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password *</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Confirm Password</label>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">2FA</label>
                    <select name="twoFactorAuth" value={form.twoFactorAuth} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Force Password Reset</label>
                    <select name="forcePassword" value={form.forcePassword} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Account Expiry</label>
                  <input type="date" name="accountExpiry" value={form.accountExpiry} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400 outline-none" />
                </div>
              </div>
            </div>

            {/* 4. COMPANY & ACCESS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Building size={14} className="text-blue-500" /> Company & Access
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Company *</label>
                  <select name="company" value={form.company} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Company</option>
                    <option>Acme Corp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Branch Access</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="radio" name="branchAccess" value="All" checked={form.branchAccess === 'All'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500" />
                      All
                    </label>
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="radio" name="branchAccess" value="Selected" checked={form.branchAccess === 'Selected'} onChange={handleChange} className="text-indigo-600 focus:ring-indigo-500" />
                      Selected
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Warehouse</label>
                  <select name="warehouse" value={form.warehouse} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Warehouse</option>
                    <option>Main Warehouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Department</label>
                  <select name="department" value={form.department} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Department</option>
                    <option>IT & Systems</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Default Branch</label>
                  <select name="defaultBranch" value={form.defaultBranch} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Branch</option>
                    <option>HQ - Mumbai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Default Warehouse</label>
                  <select name="defaultWarehouse" value={form.defaultWarehouse} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option value="">Select Warehouse</option>
                    <option>Main Warehouse</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 7. SECURITY SETTINGS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-rose-500" /> Security Settings
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Login Allowed</label>
                    <select name="loginAllowed" value={form.loginAllowed} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Multiple Login</label>
                    <select name="multipleLogin" value={form.multipleLogin} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Session Timeout</label>
                  <select name="sessionTimeout" value={form.sessionTimeout} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>30 Minutes</option>
                    <option>60 Minutes</option>
                    <option>120 Minutes</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Password Expiry</label>
                    <select name="passwordExpiry" value={form.passwordExpiry} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      <option>90 Days</option>
                      <option>60 Days</option>
                      <option>Never</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Failed Attempts</label>
                    <input type="number" name="failedAttempts" value={form.failedAttempts} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-12 flex justify-end items-center gap-3 mt-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/setup/user-master')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button type="button" className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-900 flex items-center gap-2">
              <Save size={16} /> Save Draft
            </button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <CheckCircle size={16} /> Create User
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddUserMaster;
