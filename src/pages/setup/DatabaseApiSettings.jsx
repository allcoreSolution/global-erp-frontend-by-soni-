import React from 'react';
import { Database, Save } from 'lucide-react';

const DatabaseApiSettings = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Database className="text-slate-600" size={22} /> Database & API
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Manage developer API keys and webhooks.</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded"><Save size={14} /> Save</button>
      </div>
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase text-slate-700">API Access</h3>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
          <input type="checkbox" defaultChecked className="rounded" /> Enable External API Access
        </label>
        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Generated API Key</label><input type="text" readOnly className="w-full text-xs border bg-slate-50 rounded p-2" value="pk_live_ab325983758345793485798345" /></div>
      </div>
    </div>
  );
};
export default DatabaseApiSettings;
