import React, { useState } from 'react';
import { Settings, Save, RotateCcw, ShieldCheck, Mail, FileText, Globe, Key } from 'lucide-react';

const GeneralSettings = () => {
  const [formData, setFormData] = useState({
    companyName: 'AllCore Solutions Private Limited',
    currency: 'INR (₹)',
    timeZone: 'IST (UTC+05:30)',
    defaultGstSlab: '18%',
    invoicePrefix: 'INV-2024-',
    startInvNo: '1001',
    lowStockAlert: true,
    emailAlerts: true,
    twoFactorAuth: false,
    sessionTimeout: '60 minutes'
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert('General settings configurations saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Reset all values to factory default settings?')) {
      setFormData({
        companyName: 'AllCore Solutions Private Limited',
        currency: 'INR (₹)',
        timeZone: 'IST (UTC+05:30)',
        defaultGstSlab: '18%',
        invoicePrefix: 'INV-2024-',
        startInvNo: '1001',
        lowStockAlert: true,
        emailAlerts: true,
        twoFactorAuth: false,
        sessionTimeout: '30 minutes'
      });
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Globe className="text-indigo-600" size={22} /> General System Settings
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Configure system-wide parameters, localization, invoicing prefix rules, alerts, and security options.
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded transition"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition"
          >
            <Save size={14} /> Save Configuration
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Localization & General Settings */}
        <div className="border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Globe size={16} className="text-blue-500" /> Localization Parameters
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Company Display Name</label>
              <input 
                type="text" 
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full text-xs border rounded p-2 focus:ring-1 focus:ring-blue-500" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Base Currency</label>
                <select 
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                  className="w-full text-xs border rounded p-2 focus:ring-1 focus:ring-blue-500"
                >
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">System Time Zone</label>
                <select 
                  value={formData.timeZone}
                  onChange={(e) => setFormData({...formData, timeZone: e.target.value})}
                  className="w-full text-xs border rounded p-2 focus:ring-1 focus:ring-blue-500"
                >
                  <option>IST (UTC+05:30)</option>
                  <option>EST (UTC-05:00)</option>
                  <option>GMT (UTC+00:00)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Invoice & GST Prefix Rules */}
        <div className="border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText size={16} className="text-blue-500" /> Invoicing Rules
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Invoice Prefix</label>
                <input 
                  type="text" 
                  value={formData.invoicePrefix}
                  onChange={(e) => setFormData({...formData, invoicePrefix: e.target.value})}
                  className="w-full text-xs border rounded p-2 focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Start Bill Number</label>
                <input 
                  type="text" 
                  value={formData.startInvNo}
                  onChange={(e) => setFormData({...formData, startInvNo: e.target.value})}
                  className="w-full text-xs border rounded p-2 focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Default GST Slab</label>
              <select 
                value={formData.defaultGstSlab}
                onChange={(e) => setFormData({...formData, defaultGstSlab: e.target.value})}
                className="w-full text-xs border rounded p-2 focus:ring-1 focus:ring-blue-500"
              >
                <option>5%</option>
                <option>12%</option>
                <option>18%</option>
                <option>28%</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Alerts & Communications */}
        <div className="border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Mail size={16} className="text-blue-500" /> Communications & Logs
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input 
                type="checkbox" 
                checked={formData.lowStockAlert}
                onChange={(e) => setFormData({...formData, lowStockAlert: e.target.checked})}
                className="rounded text-indigo-600 focus:ring-blue-500"
              />
              <span>Trigger low stock warning email alerts</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input 
                type="checkbox" 
                checked={formData.emailAlerts}
                onChange={(e) => setFormData({...formData, emailAlerts: e.target.checked})}
                className="rounded text-indigo-600 focus:ring-blue-500"
              />
              <span>Send invoice receipt directly to customer email</span>
            </label>
          </div>
        </div>

        {/* 4. Access Control Security Settings */}
        <div className="border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Key size={16} className="text-blue-500" /> Security Credentials
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Session Invalidation Timeout</label>
              <select 
                value={formData.sessionTimeout}
                onChange={(e) => setFormData({...formData, sessionTimeout: e.target.value})}
                className="w-full text-xs border rounded p-2 focus:ring-1 focus:ring-blue-500"
              >
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 pt-1">
              <input 
                type="checkbox" 
                checked={formData.twoFactorAuth}
                onChange={(e) => setFormData({...formData, twoFactorAuth: e.target.checked})}
                className="rounded text-indigo-600 focus:ring-blue-500"
              />
              <span>Enforce Two-Factor Authentication (2FA) for admin role</span>
            </label>
          </div>
        </div>

      </form>
    </div>
  );
};

export default GeneralSettings;
