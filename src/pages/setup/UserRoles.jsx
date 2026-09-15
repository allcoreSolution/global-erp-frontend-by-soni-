import React, { useState } from 'react';
import { Users, UserPlus, Key, ShieldCheck, Lock, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

const UserRoles = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([
    { id: 'USR-001', name: 'Amit Sharma', email: 'amit@allcore.com', role: 'Accountant', branch: 'Mumbai HO', status: 'Active' },
    { id: 'USR-002', name: 'Neha Gupta', email: 'neha@allcore.com', role: 'Sales Lead', branch: 'Delhi NCR', status: 'Active' },
    { id: 'USR-003', name: 'Rajesh Kumar', email: 'rajesh@allcore.com', role: 'Operator', branch: 'Bangalore', status: 'Inactive' }
  ]);

  const [roles, setRoles] = useState([
    { name: 'Admin', desc: 'Full system-wide administrative access', usersCount: 1 },
    { name: 'Accountant', desc: 'Manage ledger, payments, bank receipts & taxes', usersCount: 1 },
    { name: 'Sales Lead', desc: 'Create sales orders, pos billing, and returns', usersCount: 1 },
    { name: 'Operator', desc: 'Data entry, stock count, and warehouse listings', usersCount: 1 }
  ]);

  const [selectedRole, setSelectedRole] = useState('Accountant');
  const [permissions, setPermissions] = useState({
    Sales: { view: true, add: true, edit: false, delete: false },
    Purchases: { view: true, add: false, edit: false, delete: false },
    Accounts: { view: true, add: true, edit: true, delete: false },
    Settings: { view: false, add: false, edit: false, delete: false }
  });

  const togglePermission = (module, action) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
  };

  const handleToggleStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-indigo-600" size={22} /> User & Role Management Master
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Create system user credentials, assign roles, and configure feature-wise permissions (view, add, edit, delete).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-3 no-print">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'users' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <UserPlus size={14} /> Users Directory
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'roles' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ShieldCheck size={14} /> Roles & Permissions Matrix
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'users' ? (
        <div className="space-y-6">
          {/* User addition and list layout */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50/50 p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Active ERP Users Directory</h3>
              <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 font-bold text-[10px] rounded shadow-sm transition">
                + Create New User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
                  <tr>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role Assigned</th>
                    <th className="p-3">Branch Location</th>
                    <th className="p-3">Llogin Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/30">
                      <td className="p-3 font-semibold text-gray-800">{user.id}</td>
                      <td className="p-3 text-slate-800 font-medium">{user.name}</td>
                      <td className="p-3 text-gray-500">{user.email}</td>
                      <td className="p-3 text-gray-700">{user.role}</td>
                      <td className="p-3 text-gray-600">{user.branch}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => handleToggleStatus(user.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}
                        >
                          {user.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {user.status}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button className="p-1 hover:bg-slate-100 rounded text-indigo-600 transition" title="Edit Profile">
                          <Edit2 size={13} />
                        </button>
                        <button className="p-1 hover:bg-slate-100 rounded text-rose-600 transition" title="Delete User">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Roles List */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Defined Roles</h3>
            <div className="space-y-2">
              {roles.map((r, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedRole(r.name)}
                  className={`p-3 border rounded-xl cursor-pointer transition flex flex-col justify-between ${
                    selectedRole === r.name ? 'border-blue-500 bg-blue-50/10' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">{r.name}</span>
                    <span className="text-[9px] text-gray-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">{r.usersCount} users</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Permissions Grid Matrix */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 lg:col-span-2">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Permissions for: {selectedRole}</h3>
                <p className="text-[10px] text-gray-400">Configure what actions this role can perform.</p>
              </div>
              <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 font-bold text-[10px] rounded shadow-xs transition">
                Save Permissions
              </button>
            </div>
            
            <div className="space-y-4 pt-2">
              {Object.keys(permissions).map((module) => (
                <div key={module} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center border-b pb-3">
                  <span className="text-xs font-bold text-slate-800 sm:col-span-1">{module}</span>
                  <div className="grid grid-cols-4 gap-2 sm:col-span-4 text-center">
                    {['view', 'add', 'edit', 'delete'].map((action) => (
                      <label 
                        key={action}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1.5 cursor-pointer p-2 bg-slate-50/50 hover:bg-slate-100 border rounded-lg transition select-none"
                      >
                        <input 
                          type="checkbox"
                          checked={permissions[module][action]}
                          onChange={() => togglePermission(module, action)}
                          className="rounded text-indigo-600 focus:ring-blue-500 self-center sm:self-auto"
                        />
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default UserRoles;
