import React from 'react';
import { CreditCard, Save } from 'lucide-react';

const PaymentGatewaySettings = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <CreditCard className="text-teal-600" size={22} /> Payment Gateways
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Integrate UPI, Stripe, or Razorpay details.</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded"><Save size={14} /> Save</button>
      </div>
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase text-slate-700">Razorpay Configuration</h3>
        <div className="space-y-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">API Key ID</label><input type="password" className="w-full text-xs border rounded p-2" defaultValue="rzp_test_12345" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">API Secret Key</label><input type="password" className="w-full text-xs border rounded p-2" defaultValue="***********" /></div>
        </div>
      </div>
    </div>
  );
};
export default PaymentGatewaySettings;
