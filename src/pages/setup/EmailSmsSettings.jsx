import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Mail, Save } from 'lucide-react';

const EmailSmsSettings = () => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    api.get('/settings/email-sms-settings').then(res => {
      if (res.data) setFormData(res.data);
    }).catch(console.error);
  }, []);

  const handleChange = (f, v) => setFormData(p => ({...p, [f]: v}));

  const handleSave = async (e) => { 
    e.preventDefault(); 
    try {
      await api.put('/settings/email-sms-settings', formData);
      alert('Email & SMS settings saved!');
    } catch(e) { console.error(e); alert('Error'); }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Mail className="text-sky-600" size={22} /> Email & SMS Gateway
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Configure SMTP credentials and SMS API keys.</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded" onClick={handleSave}><Save size={14} /> Save</button>
      </div>
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase text-slate-700">SMTP Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">SMTP Host</label><input type="text" className="w-full text-xs border rounded p-2" value={formData.smtpHost || ''} onChange={e => handleChange('smtpHost', e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">SMTP Port</label><input type="number" className="w-full text-xs border rounded p-2" value={formData.smtpPort || ''} onChange={e => handleChange('smtpPort', e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">SMTP Username</label><input type="text" className="w-full text-xs border rounded p-2" value={formData.smtpUser || ''} onChange={e => handleChange('smtpUser', e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">SMTP Password</label><input type="password" className="w-full text-xs border rounded p-2" value={formData.smtpPass || ''} onChange={e => handleChange('smtpPass', e.target.value)} /></div>
        </div>
      </div>
    </div>
  );
};
export default EmailSmsSettings;
