import React from 'react';
import { Bell, Save } from 'lucide-react';

const NotificationSettings = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-orange-600" size={22} /> Notification & Alerts
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Set up system notifications and pop-up alerts.</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded"><Save size={14} /> Save</button>
      </div>
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
          <input type="checkbox" defaultChecked className="rounded" /> Enable push notifications
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
          <input type="checkbox" defaultChecked className="rounded" /> Show pending approvals on dashboard
        </label>
      </div>
    </div>
  );
};
export default NotificationSettings;
