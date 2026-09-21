import React, { useState, useEffect } from 'react';
import api from '../../api';
import { CreditCard, Save } from 'lucide-react';

const PaymentGatewaySettings = () => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    api.get('/settings/payment-gateways').then(res => {
      if (res.data) setFormData(res.data);
    }).catch(console.error);
  }, []);

  const handleChange = (f, v) => setFormData(p => ({...p, [f]: v}));

  const handleSave = async (e) => { 
    e.preventDefault(); 
    try {
      await api.put('/settings/payment-gateways', formData);
      alert('Payment Gateway settings saved!');
    } catch(e) { console.error(e); alert('Error'); }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="text-teal-600" size={22} /> Payment Gateways
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Integrate UPI, Stripe, or Razorpay details.</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded" onClick={handleSave}><Save size={14} /> Save</button>
      </div>
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase text-slate-700">Razorpay Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">API Key ID</label><input type="password" className="w-full text-xs border rounded p-2" value={formData.razorpayKeyId || ''} onChange={e => handleChange('razorpayKeyId', e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">API Secret Key</label><input type="password" className="w-full text-xs border rounded p-2" value={formData.razorpaySecret || ''} onChange={e => handleChange('razorpaySecret', e.target.value)} /></div>
        </div>
      </div>
    </div>
  );
};
export default PaymentGatewaySettings;
