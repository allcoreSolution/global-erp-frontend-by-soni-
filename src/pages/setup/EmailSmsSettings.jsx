import React from 'react';
import { Mail, Save } from 'lucide-react';

const EmailSmsSettings = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Mail className="text-sky-600" size={22} /> Email & SMS Gateway
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Configure SMTP credentials and SMS API keys.</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded"><Save size={14} /> Save</button>
      </div>
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase text-slate-700">SMTP Settings</h3>
        <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">SMTP Host</label><input type="text" className="w-full text-xs border rounded p-2" defaultValue="smtp.gmail.com" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">SMTP Port</label><input type="number" className="w-full text-xs border rounded p-2" defaultValue="587" /></div>
        </div>
      </div>
    </div>
  );
};
export default EmailSmsSettings;
