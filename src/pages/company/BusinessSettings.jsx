import React, { useState, useEffect } from 'react';
import { Settings, FileText, CheckCircle, Edit, Globe, Navigation, Receipt, LayoutList } from 'lucide-react';
import api from '../../api';

const BusinessSettings = () => {
  const [settings, setSettings] = useState({
    financialYear: '',
    currency: '',
    dateFormat: '',
    taxSettings: 'GST Registered',
    invoicePrefix: '',
    invoiceNumbering: 'Auto Increment (001)',
    terms: '',
    signature: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...settings });

  const fetchSettings = async () => {
    try {
      const res = await api.get('/companies/profile');
      if (res.data) {
        setSettings({
          financialYear: res.data.financialYear || '2024-2025',
          currency: res.data.currency || 'INR (₹)',
          dateFormat: res.data.dateFormat || 'YYYY-MM-DD',
          taxSettings: 'GST Registered',
          invoicePrefix: res.data.invoicePrefix || 'INV/',
          invoiceNumbering: 'Auto Increment (001)',
          terms: res.data.terms || 'Payment is due within 30 days of receiving invoice.',
          signature: res.data.signature || 'Authorized Signatory - CEO'
        });
      }
    } catch (err) {
      console.error('Failed to fetch business settings', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = () => {
    setForm({ ...settings });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        financialYear: form.financialYear,
        currency: form.currency,
        dateFormat: form.dateFormat,
        invoicePrefix: form.invoicePrefix,
        terms: form.terms,
        signature: form.signature
      };
      await api.put('/companies/profile', payload);
      await fetchSettings();
      setIsEditing(false);
    } catch (err) {
      alert('Failed to save business settings. ' + (err.response?.data?.message || ''));
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-white font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200">
        
        {/* Header Section */}
        <div className="relative h-24 sm:h-28 bg-slate-50 border-b border-slate-200 flex items-center px-5 sm:px-8 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-slate-200 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Settings size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">System Settings</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Manage preferences & numbering</p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={handleEdit}
              className="absolute top-1/2 -translate-y-1/2 right-5 sm:right-8 bg-white border border-slate-200 text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold tracking-wide flex items-center gap-2 transition-all shadow-sm hover:bg-slate-50 hover:border-indigo-200"
            >
              <Edit size={14} /> EDIT SETTINGS
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-8">
          {isEditing ? (
            <form onSubmit={handleSave} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                <Settings size={16} className="text-indigo-600" /> Update Configuration
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Financial Year</label>
                  <input
                    type="text" required
                    value={form.financialYear}
                    onChange={(e) => setForm({ ...form, financialYear: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Base Currency</label>
                  <input
                    type="text" required
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date Format</label>
                  <input
                    type="text" required
                    value={form.dateFormat}
                    onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Invoice Prefix</label>
                  <input
                    type="text" required
                    value={form.invoicePrefix}
                    onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Authorized Signatory Name</label>
                  <input
                    type="text"
                    value={form.signature}
                    onChange={(e) => setForm({ ...form, signature: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Terms & Conditions</label>
                  <textarea
                    rows="3"
                    value={form.terms}
                    onChange={(e) => setForm({ ...form, terms: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg font-bold hover:bg-indigo-700 shadow shadow-indigo-200 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle size={15} /> Save Settings
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Locale Preferences */}
                <div className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <Globe size={18} strokeWidth={2} />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800">Locale Preferences</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Financial Cycle</p>
                      <p className="text-sm font-bold text-slate-800">{settings.financialYear}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Base Currency</p>
                      <p className="text-sm font-bold text-slate-800">{settings.currency}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Date Format</p>
                      <p className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded border border-slate-200">{settings.dateFormat}</p>
                    </div>
                  </div>
                </div>

                {/* Invoice Sequence */}
                <div className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-pink-200 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300">
                      <Receipt size={18} strokeWidth={2} />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800">Invoice Sequence</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Invoice Prefix</p>
                      <p className="inline-block px-2 py-0.5 bg-pink-50 text-pink-700 text-xs font-mono font-bold rounded border border-pink-100">{settings.invoicePrefix}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Numbering Format</p>
                      <p className="text-sm font-bold text-slate-800">{settings.invoiceNumbering}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Authorized Signatory</p>
                      <p className="text-sm font-medium text-slate-600">{settings.signature}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Terms */}
              <div className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-200 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                    <LayoutList size={18} strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800">Standard Billing Terms</h3>
                </div>
                <div className="pl-[52px]">
                  <p className="text-sm text-slate-600 leading-relaxed italic bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                    "{settings.terms}"
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;
