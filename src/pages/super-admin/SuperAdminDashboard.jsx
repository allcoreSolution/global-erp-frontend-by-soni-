import React from 'react';
import { Building, Briefcase, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Super Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all companies and SAAS subscriptions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/super-admin/register-company')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <Building size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Register Company</h3>
              <p className="text-sm text-slate-500">Add a new company to the system</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/super-admin/companies')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Manage Companies</h3>
              <p className="text-sm text-slate-500">View and edit registered companies</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/super-admin/plans')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Manage Plans</h3>
              <p className="text-sm text-slate-500">Configure SAAS subscription plans</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
