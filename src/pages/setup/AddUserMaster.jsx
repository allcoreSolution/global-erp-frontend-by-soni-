import api from '../../api';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Save, X, User, Lock, Shield, Building, LayoutGrid, CheckSquare, ShieldCheck, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddUserMaster = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchHelper = async (url) => {
          try {
            const res = await api.get(url);
            return Array.isArray(res.data) ? res.data : (res.data.data || []);
          } catch (e) {
            console.error('Error fetching ' + url, e);
            return [];
          }
        };

        const [empData, compData, deptData, roleData, branchData] = await Promise.all([
          fetchHelper('/employees'),
          fetchHelper('/companies'),
          fetchHelper('/departments'),
          fetchHelper('/roles'),
          fetchHelper('/branches')
        ]);
        
        setEmployees(empData);
        setCompanies(compData);
        setDepartments(deptData);
        setRoles(roleData);
        setBranches(branchData);
      } catch (err) {
        console.error('Error in fetchData:', err);
      }
    };
    fetchData();
  }, []);


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
    {
      module: 'Dashboard',
      pages: [
        { name: 'Main Dashboard', view: true, create: false, edit: false, del: false, approve: false, export: false }
      ]
    },
    {
      module: 'Sales & Distribution',
      pages: [
        { name: 'Sales Quotation', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Proforma Invoice', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Sales Order', view: true, create: true, edit: true, del: true, approve: true, export: true },
        { name: 'Delivery Challan', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Sales Invoice', view: true, create: true, edit: true, del: true, approve: true, export: true },
        { name: 'Sales Return / CR Note', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'E-Way Bill', view: false, create: false, edit: false, del: false, approve: false, export: false }
      ]
    },
    {
      module: 'Purchase & Procurement',
      pages: [
        { name: 'Purchase Requisition', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Purchase Order', view: true, create: true, edit: true, del: true, approve: true, export: true },
        { name: 'Goods Receipt Note (GRN)', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Purchase Invoice', view: true, create: true, edit: true, del: true, approve: true, export: true },
        { name: 'Purchase Return / DR Note', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Supplier Master', view: false, create: false, edit: false, del: false, approve: false, export: false }
      ]
    },
    {
      module: 'Inventory / Stock',
      pages: [
        { name: 'Item Master', view: true, create: true, edit: true, del: true, approve: true, export: true },
        { name: 'Product Categories', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Stock Adjustment', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Stock Transfer', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Warehouse Master', view: false, create: false, edit: false, del: false, approve: false, export: false }
      ]
    },
    {
      module: 'Accounts & Finance',
      pages: [
        { name: 'Chart of Accounts', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Cash & Bank Book', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Receipts & Payments', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Journal Vouchers', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Debit / Credit Notes', view: false, create: false, edit: false, del: false, approve: false, export: false }
      ]
    },
    {
      module: 'HR & Payroll',
      pages: [
        { name: 'Employee Master', view: true, create: true, edit: true, del: false, approve: true, export: true },
        { name: 'Attendance Entry', view: true, create: true, edit: true, del: false, approve: true, export: true },
        { name: 'Leave Management', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Payroll Processing', view: true, create: true, edit: true, del: false, approve: true, export: true }
      ]
    },
    {
      module: 'Reports',
      pages: [
        { name: 'Sales Reports', view: true, create: false, edit: false, del: false, approve: false, export: true },
        { name: 'Purchase Reports', view: true, create: false, edit: false, del: false, approve: false, export: true },
        { name: 'Inventory Reports', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Financial Reports', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'GST / TDS Reports', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'MIS / Dashboards', view: false, create: false, edit: false, del: false, approve: false, export: false }
      ]
    },
    {
      module: 'Setup & Administration',
      pages: [
        { name: 'Company Profile', view: true, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'User Master & Roles', view: true, create: true, edit: true, del: true, approve: false, export: false },
        { name: 'System Settings', view: true, create: true, edit: true, del: true, approve: false, export: false },
        { name: 'Utilities & Backup', view: false, create: false, edit: false, del: false, approve: false, export: false }
      ]
    }
  ]);

  const [approvalPermissions, setApprovalPermissions] = useState([
    {
      group: 'HR & Admin',
      items: [
        { name: 'Leave', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Expense', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Appraisal', view: false, create: false, edit: false, del: false, approve: false, export: false }
      ]
    },
    {
      group: 'Sales & Purchase',
      items: [
        { name: 'Sales', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Purchase', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Purchase Return', view: false, create: false, edit: false, del: false, approve: false, export: false }
      ]
    },
    {
      group: 'Accounts & Finance',
      items: [
        { name: 'Payment', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Receipt', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Journal', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Credit Note', view: false, create: false, edit: false, del: false, approve: false, export: false },
        { name: 'Debit Note', view: false, create: false, edit: false, del: false, approve: false, export: false }
      ]
    },
    {
      group: 'Inventory',
      items: [
        { name: 'Stock Adjustment', view: false, create: false, edit: false, del: false, approve: false, export: false }
      ]
    }
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleModulePermChange = (modIdx, pageIdx, field) => {
    setModulePermissions(prev => {
      const newPerms = [...prev];
      const newPages = [...newPerms[modIdx].pages];
      newPages[pageIdx] = { ...newPages[pageIdx], [field]: !newPages[pageIdx][field] };
      newPerms[modIdx] = { ...newPerms[modIdx], pages: newPages };
      return newPerms;
    });
  };

  const handleApprovePermChange = (groupIdx, itemIdx, field) => {
    setApprovalPermissions(prev => {
      const updated = [...prev];
      const newItems = [...updated[groupIdx].items];
      newItems[itemIdx] = { ...newItems[itemIdx], [field]: !newItems[itemIdx][field] };
      updated[groupIdx] = { ...updated[groupIdx], items: newItems };
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        roleId: form.primaryRole || undefined,
        modulePermissions,
        approvalPermissions
      };
      const res = await api.post('/users', payload);
      if (res && res.data && res.data.success !== false) {
        alert('User Created Successfully!');
        navigate('/setup/user-master');
      } else {
        alert('User created (Fallback)!');
        navigate('/setup/user-master');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error saving user: ' + (error.response?.data?.message || error.message));
    }
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
      </div>

      <div className="max-w-7xl mx-auto space-y-6">

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">

              {/* 1. BASIC INFORMATION */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} className="text-blue-500" /> Basic Information
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">User ID</label>
                      <input type="text" name="userId" value={form.userId} readOnly className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Link Employee</label>
                      <select name="employee" value={form.employee} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none">
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                    <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile No</label>
                      <input type="text" name="mobile" value={form.mobile} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email ID</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. COMPANY & ACCESS */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Building size={14} className="text-orange-500" /> Company & Access
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Company / Entity</label>
                    <select name="company" value={form.company} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none">
                      <option value="">Select Company</option>
                      {companies.map(comp => (
                        <option key={comp._id} value={comp._id}>{comp.companyName || comp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Branch Access</label>
                      <select name="branchAccess" value={form.branchAccess} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none">
                        <option value="All">All Branches</option>
                        {branches.map(branch => (
                          <option key={branch._id} value={branch._id}>{branch.branchName || branch.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department</label>
                      <select name="department" value={form.department} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none">
                        <option value="">Select Dept</option>
                        {departments.map(dept => (
                          <option key={dept._id} value={dept._id}>{dept.name || dept.departmentName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">

              {/* 2. LOGIN INFORMATION */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Lock size={14} className="text-emerald-500" /> Login Information
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username *</label>
                    <input type="text" name="username" value={form.username} onChange={handleChange} required autoComplete="new-password" placeholder="Choose username" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password *</label>
                      <input type="password" name="password" value={form.password} onChange={handleChange} required autoComplete="new-password" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Confirm Password *</label>
                      <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none" />
                    </div>
                  </div>
                  <div className="pt-2 flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="twoFactorAuth" checked={form.twoFactorAuth === 'Yes'} onChange={(e) => setForm({ ...form, twoFactorAuth: e.target.checked ? 'Yes' : 'No' })} className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500" />
                      <span className="text-xs text-slate-600 font-medium">Enable 2FA</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="forcePassword" checked={form.forcePassword === 'Yes'} onChange={(e) => setForm({ ...form, forcePassword: e.target.checked ? 'Yes' : 'No' })} className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500" />
                      <span className="text-xs text-slate-600 font-medium">Force Password Reset</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. ROLE & SECURITY */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} className="text-rose-500" /> Role & Security
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Role</label>
                    <select name="primaryRole" value={form.primaryRole} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none">
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role._id} value={role._id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                      <select name="status" value={form.status} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Session Timeout</label>
                      <select name="sessionTimeout" value={form.sessionTimeout} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 outline-none">
                        <option value="15 Minutes">15 Minutes</option>
                        <option value="30 Minutes">30 Minutes</option>
                        <option value="1 Hour">1 Hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
              <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Shield size={16} className="text-purple-600" />
                Configuration & Permissions
              </h3>
            </div>
            <div className="p-0 overflow-y-auto max-h-[600px] bg-slate-50/30">
              <div className="p-5 space-y-6">
                {/* 5. MODULE PERMISSIONS */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                  <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                    <LayoutGrid size={14} className="text-indigo-500" />
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Module Permissions</h3>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b text-slate-500">
                        <tr>
                          <th className="px-5 py-3 font-bold">Module / Page Name</th>
                          <th className="px-3 py-3 font-bold text-center">View</th>
                          <th className="px-3 py-3 font-bold text-center">Create</th>
                          <th className="px-3 py-3 font-bold text-center">Edit</th>
                          <th className="px-3 py-3 font-bold text-center">Delete</th>
                          <th className="px-3 py-3 font-bold text-center">Approve</th>
                          <th className="px-3 py-3 font-bold text-center">Export</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {modulePermissions.map((mod, modIdx) => (
                          <React.Fragment key={mod.module}>
                            <tr className="bg-slate-50 border-t-2 border-slate-200">
                              <td colSpan="7" className="px-5 py-2 font-bold text-indigo-700 uppercase text-[10px] tracking-widest bg-indigo-50/30">
                                {mod.module}
                              </td>
                            </tr>
                            {mod.pages.map((page, pageIdx) => (
                              <tr key={page.name} className="hover:bg-slate-50/50">
                                <td className="px-5 py-2 pl-8 font-medium text-slate-700 text-xs flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> {page.name}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={page.view} onChange={() => handleModulePermChange(modIdx, pageIdx, 'view')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={page.create} onChange={() => handleModulePermChange(modIdx, pageIdx, 'create')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={page.edit} onChange={() => handleModulePermChange(modIdx, pageIdx, 'edit')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={page.del} onChange={() => handleModulePermChange(modIdx, pageIdx, 'del')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={page.approve} onChange={() => handleModulePermChange(modIdx, pageIdx, 'approve')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={page.export} onChange={() => handleModulePermChange(modIdx, pageIdx, 'export')} className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
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
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b text-slate-500">
                        <tr>
                          <th className="px-5 py-3 font-bold">Transaction Type</th>
                          <th className="px-3 py-3 font-bold text-center">View</th>
                          <th className="px-3 py-3 font-bold text-center">Create</th>
                          <th className="px-3 py-3 font-bold text-center">Edit</th>
                          <th className="px-3 py-3 font-bold text-center">Delete</th>
                          <th className="px-3 py-3 font-bold text-center">Approve</th>
                          <th className="px-3 py-3 font-bold text-center">Export</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {approvalPermissions.map((group, groupIdx) => (
                          <React.Fragment key={group.group}>
                            <tr className="bg-slate-50 border-t-2 border-slate-200">
                              <td colSpan="7" className="px-5 py-2 font-bold text-purple-700 uppercase text-[10px] tracking-widest bg-purple-50/30">
                                {group.group}
                              </td>
                            </tr>
                            {group.items.map((item, itemIdx) => (
                              <tr key={item.name} className="hover:bg-slate-50/50">
                                <td className="px-5 py-2 pl-8 font-medium text-slate-700 text-xs flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> {item.name}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={item.view} onChange={() => handleApprovePermChange(groupIdx, itemIdx, 'view')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={item.create} onChange={() => handleApprovePermChange(groupIdx, itemIdx, 'create')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={item.edit} onChange={() => handleApprovePermChange(groupIdx, itemIdx, 'edit')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={item.del} onChange={() => handleApprovePermChange(groupIdx, itemIdx, 'del')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={item.approve} onChange={() => handleApprovePermChange(groupIdx, itemIdx, 'approve')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input type="checkbox" checked={item.export} onChange={() => handleApprovePermChange(groupIdx, itemIdx, 'export')} className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" />
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-8">
            <button type="button" onClick={() => navigate('/setup/user-master')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50">
              Cancel
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
