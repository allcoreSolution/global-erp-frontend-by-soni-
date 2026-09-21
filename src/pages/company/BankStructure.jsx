import React, { useState, useEffect } from 'react';
import { Building, Landmark, Users, BarChart3, ChevronRight } from 'lucide-react';
import api from '../../api';

const BankStructure = () => {
  const [banks, setBanks] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('bank');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [banksRes, branchesRes, usersRes] = await Promise.all([
          api.get('/banks'),
          api.get('/branches'),
          api.get('/users')
        ]);
        
        setBanks(banksRes.data?.data || banksRes.data || []);
        setBranches(branchesRes.data?.data || branchesRes.data || []);
        setUsers(usersRes.data?.data || usersRes.data || []);
      } catch (err) {
        console.error('Failed to fetch data for Bank Structure', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Corporate Banking & Operational Structures</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Track company clearing banks details, regional offices, branch parameters, and user permissions mappings.</p>
      </div>

      <div className="flex bg-slate-100 rounded text-[10px] sm:text-xs font-semibold overflow-x-auto no-scrollbar mb-4">
        {[
          { id: 'bank', label: 'Bank Details', icon: Landmark },
          { id: 'branches', label: 'Company Branches', icon: Building },
          { id: 'users', label: 'Active Users Roles', icon: Users }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1 sm:gap-1.5 transition-colors border-r last:border-r-0 whitespace-nowrap px-3 ${
              activeTab === tab.id ? 'bg-white text-indigo-600 border-b-2 border-b-blue-600' : 'text-gray-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="border rounded-lg p-4 min-h-[250px] overflow-hidden">
        {activeTab === 'bank' && (
          <div className="space-y-3 text-[11px] sm:text-xs">
            <h4 className="font-bold text-slate-800">Company Standard Banking Clearing Accounts</h4>
            <div className="overflow-x-auto border rounded">
              <table className="block w-full overflow-x-auto w-full text-left">
                <thead className="bg-slate-50 border-b font-bold text-gray-700">
                  <tr>
                    <th className="p-2.5">Bank Name</th>
                    <th className="p-2.5">Account Number</th>
                    <th className="p-2.5 font-mono">IFSC</th>
                    <th className="p-2.5">Clearance Branch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {banks.length > 0 ? banks.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-gray-800 whitespace-nowrap">{item.name}</td>
                      <td className="p-2.5 font-mono text-gray-900 whitespace-nowrap">{item.accountNumber}</td>
                      <td className="p-2.5 font-mono text-gray-600 whitespace-nowrap">{item.ifscCode}</td>
                      <td className="p-2.5 text-gray-500 whitespace-nowrap">{item.branchName}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">No bank accounts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="space-y-3 text-[11px] sm:text-xs">
            <h4 className="font-bold text-slate-800">Corporate Branch Registries</h4>
            <div className="overflow-x-auto border rounded">
              <table className="block w-full overflow-x-auto w-full text-left">
                <thead className="bg-slate-50 border-b font-bold text-gray-700">
                  <tr>
                    <th className="p-2.5">Branch Code</th>
                    <th className="p-2.5">Branch Name</th>
                    <th className="p-2.5">Branch SPOC Manager</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branches.length > 0 ? branches.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-indigo-600 whitespace-nowrap font-mono">{item.code || item._id.substring(0,6)}</td>
                      <td className="p-2.5 text-gray-900 whitespace-nowrap">{item.name}</td>
                      <td className="p-2.5 text-gray-500 whitespace-nowrap">{item.address || 'N/A'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-gray-500">No branches found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-3 text-[11px] sm:text-xs">
            <h4 className="font-bold text-slate-800">Active User Logins & Permissions Channels</h4>
            <div className="overflow-x-auto border rounded">
              <table className="block w-full overflow-x-auto w-full text-left">
                <thead className="bg-slate-50 border-b font-bold text-gray-700">
                  <tr>
                    <th className="p-2.5">User ID</th>
                    <th className="p-2.5">Staff Name</th>
                    <th className="p-2.5">Authorized Role</th>
                    <th className="p-2.5">Assigned Office Branch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length > 0 ? users.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-gray-800 font-mono whitespace-nowrap">{item._id.substring(0,8)}</td>
                      <td className="p-2.5 text-gray-900 whitespace-nowrap">{item.name}</td>
                      <td className="p-2.5 text-gray-600 whitespace-nowrap">
                        <span className="bg-blue-50 text-indigo-600 font-semibold px-2 py-0.5 rounded text-[10px]">
                          {item.role?.name || item.role || 'User'}
                        </span>
                      </td>
                      <td className="p-2.5 text-gray-500 whitespace-nowrap">{item.email}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankStructure;
