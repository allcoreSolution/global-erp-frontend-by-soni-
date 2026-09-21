import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Bell, Save } from 'lucide-react';

const NotificationSettings = () => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    api.get('/settings/notification-settings').then(res => {
      if (res.data) setFormData(res.data);
    }).catch(console.error);
  }, []);

  const handleChange = (f, v) => setFormData(p => ({...p, [f]: v}));

  const handleSave = async (e) => { 
    e.preventDefault(); 
    try {
      await api.put('/settings/notification-settings', formData);
      alert('Notification settings saved!');
    } catch(e) { console.error(e); alert('Error'); }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-orange-600" size={22} /> Notification & Alerts
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Set up system notifications and pop-up alerts.</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded" onClick={handleSave}><Save size={14} /> Save</button>
      </div>
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase text-slate-700">Alert Preferences</h3>
        <div className="grid grid-cols-2 gap-4">
            <div><label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1"><input type="checkbox" checked={formData.emailNotifications || false} onChange={e => handleChange('emailNotifications', e.target.checked)} /> Email Notifications</label></div>
            <div><label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1"><input type="checkbox" checked={formData.smsAlerts || false} onChange={e => handleChange('smsAlerts', e.target.checked)} /> SMS Alerts</label></div>
            <div><label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1"><input type="checkbox" checked={formData.inAppPopups || false} onChange={e => handleChange('inAppPopups', e.target.checked)} /> In-App Popups</label></div>
            <div><label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-1"><input type="checkbox" checked={formData.dailySummary || false} onChange={e => handleChange('dailySummary', e.target.checked)} /> Daily Summary</label></div>
        </div>
      </div>
    </div>
  );
};
export default NotificationSettings;
