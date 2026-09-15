import React, { useState } from 'react';
import { Settings, FileText, CheckCircle } from 'lucide-react';

const BusinessSettings = () => {
  const [settings, setSettings] = useState({
    financialYear: '2024-2025',
    currency: 'INR (₹)',
    dateFormat: 'YYYY-MM-DD',
    taxSettings: 'GST Registered',
    invoicePrefix: 'INV/',
    invoiceNumbering: 'Auto Increment (001)',
    terms: 'Payment is due within 30 days of receiving invoice.',
    signature: 'Authorized Signatory - CEO'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...settings });

  const handleEdit = () => {
    setForm({ ...settings });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSettings({ ...form });
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Business & System Settings</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Manage standard currency models, invoice prefix numbers sequences, financial years cycles, and legal signatures.</p>
      </div>

      <div className="max-w-3xl border rounded-lg p-4 sm:p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-[10px] sm:text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <Settings size={12} className="text-indigo-600" /> Active System Settings
          </span>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 text-[10px] sm:text-xs text-indigo-600 font-semibold border px-2.5 py-1 rounded hover:bg-slate-50 transition-colors"
            >
              Edit Settings
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-[11px] sm:text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Financial Year</label>
                <input
                  type="text"
                  required
                  value={form.financialYear}
                  onChange={(e) => setForm({ ...form, financialYear: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Base Currency</label>
                <input
                  type="text"
                  required
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Date Format</label>
                <input
                  type="text"
                  required
                  value={form.dateFormat}
                  onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  required
                  value={form.invoicePrefix}
                  onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 uppercase mb-1">Terms & Conditions</label>
              <textarea
                rows="2"
                value={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.value })}
                className="w-full border p-2 rounded focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 uppercase mb-1">Authorized Signatory Name</label>
              <input
                type="text"
                value={form.signature}
                onChange={(e) => setForm({ ...form, signature: e.target.value })}
                className="w-full border p-2 rounded focus:outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 border rounded hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700">Save Settings</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-[11px] sm:text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded border space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Settings size={14} className="text-indigo-600" /> Locale Preferences</h4>
                <p><span className="text-gray-500">Financial Cycle:</span> <strong className="text-gray-900">{settings.financialYear}</strong></p>
                <p><span className="text-gray-500">Currency:</span> <strong className="text-gray-900">{settings.currency}</strong></p>
                <p><span className="text-gray-500">Date Format:</span> <strong className="text-gray-900 font-mono">{settings.dateFormat}</strong></p>
              </div>
              <div className="bg-slate-50 p-4 rounded border space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><FileText size={14} className="text-indigo-600" /> Invoice Sequence</h4>
                <p><span className="text-gray-500">Prefix:</span> <strong className="text-gray-900 font-mono">{settings.invoicePrefix}</strong></p>
                <p><span className="text-gray-500">Format:</span> <strong className="text-gray-900">{settings.invoiceNumbering}</strong></p>
                <p><span className="text-gray-500">Signatory:</span> <strong className="text-gray-900">{settings.signature}</strong></p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded border space-y-2">
              <h4 className="font-bold text-slate-800 text-xs">Standard Billing Terms</h4>
              <p className="text-gray-700 leading-relaxed italic">{settings.terms}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessSettings;
