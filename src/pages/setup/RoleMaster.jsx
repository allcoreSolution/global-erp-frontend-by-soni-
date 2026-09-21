import React, { useState, useEffect } from 'react';
import api from '../../api';
import { ShieldCheck, Download, Printer, Plus, Check, X, Shield, Star, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoleMaster = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
      if (response.data.length > 0) {
        setSelectedRole(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderPermissionTable = (title, icon, permissions) => {
    if (!permissions || permissions.length === 0) return null;
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden mb-6">
        <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
          {icon}
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</h3>
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
              {permissions.map((mod, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-5 py-2.5 font-bold text-slate-700">{mod.name || mod.module}</td>
                  <td className="px-3 py-2.5 text-center">{mod.view ? <Check className="inline w-4 h-4 text-emerald-500" /> : <X className="inline w-4 h-4 text-slate-300" />}</td>
                  <td className="px-3 py-2.5 text-center">{mod.create ? <Check className="inline w-4 h-4 text-emerald-500" /> : <X className="inline w-4 h-4 text-slate-300" />}</td>
                  <td className="px-3 py-2.5 text-center">{mod.edit ? <Check className="inline w-4 h-4 text-emerald-500" /> : <X className="inline w-4 h-4 text-slate-300" />}</td>
                  <td className="px-3 py-2.5 text-center">{mod.delete ? <Check className="inline w-4 h-4 text-emerald-500" /> : <X className="inline w-4 h-4 text-slate-300" />}</td>
                  <td className="px-3 py-2.5 text-center">{mod.approve ? <Check className="inline w-4 h-4 text-emerald-500" /> : <X className="inline w-4 h-4 text-slate-300" />}</td>
                  <td className="px-3 py-2.5 text-center">{mod.export ? <Check className="inline w-4 h-4 text-emerald-500" /> : <X className="inline w-4 h-4 text-slate-300" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 p-4 sm:p-6 rounded-lg min-h-screen space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" size={22} /> Role Master & Permissions Settings
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
            Define corporate job roles and configure feature-wise permissions.
          </p>
        </div>
        
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={() => navigate('/setup/role-master/add')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
          >
            <Plus size={14} /> Create Role
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Roles List */}
        <div className="lg:col-span-3 border border-slate-200 rounded-2xl p-5 bg-white space-y-4 h-fit shadow-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b pb-2">Defined Roles</h3>
          <div className="space-y-2 max-h-[600px] overflow-auto pr-1">
            {isLoading ? <p className="text-xs text-slate-400">Loading roles...</p> : roles.length === 0 ? <p className="text-xs text-slate-400">No roles found.</p> : roles.map((r, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedRole(r)}
                className={`p-4 border rounded-xl cursor-pointer transition flex flex-col justify-between ${
                  selectedRole?._id === r._id ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-500' : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-bold ${selectedRole?._id === r._id ? 'text-indigo-700' : 'text-slate-700'}`}>{r.name}</span>
                  {r.roleType && <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{r.roleType}</span>}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed line-clamp-2">{r.description || 'No description provided.'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Details View */}
        <div className="lg:col-span-9 space-y-4">
          {selectedRole ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{selectedRole.name} <span className="text-xs text-slate-400 font-normal ml-2">{selectedRole.roleCode || ''}</span></h2>
                  <p className="text-xs text-slate-500 mt-1">{selectedRole.description}</p>
                </div>
                <div className="flex gap-4 text-xs font-semibold text-slate-600">
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-lg">Status: {selectedRole.status || 'Active'}</span>
                  <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-lg">Company Access: {selectedRole.companyAccess || 'All'}</span>
                </div>
              </div>

              {renderPermissionTable('Module Permissions', <Shield size={14} className="text-indigo-500" />, selectedRole.modulePermissions)}
              {renderPermissionTable('Approval Permissions', <CheckSquare size={14} className="text-purple-500" />, selectedRole.approvalPermissions)}
              {renderPermissionTable('Special Permissions', <Star size={14} className="text-rose-500" />, selectedRole.specialPermissions)}
              
              {(!selectedRole.modulePermissions?.length && !selectedRole.approvalPermissions?.length && !selectedRole.specialPermissions?.length) && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center text-slate-500 text-sm">
                  No detailed permissions configured for this role yet. Please edit the role or recreate it.
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center text-slate-500 text-sm">
              Select a role from the list to view its permissions.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RoleMaster;
