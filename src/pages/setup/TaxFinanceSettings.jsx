import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Calculator, Save } from 'lucide-react';

const TaxFinanceSettings = () => {
  const [formData, setFormData] = useState({
    fiscalYearStart: 'April 1st',
    baseCurrency: 'INR (Indian Rupee)',
    defaultTaxSystem: 'GST (India)',
    defaultGstRate: '18%',
    hsnSacMandatory: true,
    roundOffInvoices: true,
    autoEInvoicing: false,
    tcsApplicability: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings/tax-finance');
        if (data) setFormData(data);
      } catch (err) {
        console.error('Failed to fetch tax finance settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => { 
    e.preventDefault(); 
    try {
      await api.put('/settings/tax-finance', formData);
      alert('Tax & Financial settings saved!'); 
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="text-purple-600" size={22} /> Tax & Financial Settings
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Setup GST slabs, tax templates, and financial years.</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded" onClick={handleSave}><Save size={14} /> Save</button>
      </div>
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase text-slate-700">Financial Rules</h3>
        <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Fiscal Year Start</label><input type="text" className="w-full text-xs border rounded p-2" value={formData.fiscalYearStart} onChange={e => handleChange('fiscalYearStart', e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Base Currency</label><input type="text" className="w-full text-xs border rounded p-2" value={formData.baseCurrency} onChange={e => handleChange('baseCurrency', e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Default Tax System</label><input type="text" className="w-full text-xs border rounded p-2" value={formData.defaultTaxSystem} onChange={e => handleChange('defaultTaxSystem', e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Default GST Rate</label><input type="text" className="w-full text-xs border rounded p-2" value={formData.defaultGstRate} onChange={e => handleChange('defaultGstRate', e.target.value)} /></div>
        </div>
      </div>
    </div>
  );
};
export default TaxFinanceSettings;
