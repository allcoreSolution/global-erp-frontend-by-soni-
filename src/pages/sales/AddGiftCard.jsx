import React, { useState } from 'react';
import { ArrowLeft, Save, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddGiftCard = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    giftCardCode: 'GC-00001',
    giftCardName: '',
    giftCardType: 'Digital',
    company: 'Select',
    branch: 'Select',
    status: 'Active',
    cardValue: '',
    currency: 'INR',
    currentBalance: '',
    minPurchase: '',
    maxUsage: '',
    issueDate: '',
    activationDate: '',
    expiryDate: '',
    validityPeriod: '365 Days',
    neverExpire: false,
    customer: 'Select',
    recipientName: '',
    mobile: '',
    email: '',
    greetingMessage: '',
    usageType: 'Multiple',
    redeemableAt: 'All Branches',
    onlineUsage: false,
    offlineUsage: false,
    partialRedemption: false,
    transferable: false,
    applicableFor: 'All Products',
    salesAccount: 'Select',
    liabilityAccount: 'Select',
    taxConfiguration: 'Select',
    termsConditions: '',
    internalNotes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Gift Card created successfully!');
    navigate('/sales/gift-card-list');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Top Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/sales/gift-card-list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Gift Card List
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-indigo-900 uppercase tracking-wide">Create Gift Card</h2>
          <p className="text-sm text-slate-500 font-medium">Create and manage gift card</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          {/* SECTION: BASIC INFORMATION */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gift Card Code *</label>
                <input type="text" name="giftCardCode" value={form.giftCardCode} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gift Card Name *</label>
                <input type="text" name="giftCardName" value={form.giftCardName} onChange={handleChange} required placeholder="Enter Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gift Card Type</label>
                <select name="giftCardType" value={form.giftCardType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all bg-white">
                  <option>Digital</option>
                  <option>Physical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                <select name="company" value={form.company} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all bg-white">
                  <option>Select</option>
                  <option>Allcore Solutions</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                <select name="branch" value={form.branch} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all bg-white">
                  <option>Select</option>
                  <option>Head Office</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all bg-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION: CARD VALUE & VALIDITY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD VALUE */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Card Value</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Card Value *</label>
                  <input type="number" name="cardValue" value={form.cardValue} onChange={handleChange} required placeholder="e.g. 1000" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                  <select name="currency" value={form.currency} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>INR</option>
                    <option>USD</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Balance</label>
                  <input type="number" name="currentBalance" value={form.currentBalance} onChange={handleChange} placeholder="e.g. 1000" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Purchase</label>
                  <input type="number" name="minPurchase" value={form.minPurchase} onChange={handleChange} placeholder="e.g. 500" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Usage</label>
                  <input type="number" name="maxUsage" value={form.maxUsage} onChange={handleChange} placeholder="e.g. 1000" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            {/* VALIDITY */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Validity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date *</label>
                  <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Activation Date</label>
                  <input type="date" name="activationDate" value={form.activationDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date *</label>
                  <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required disabled={form.neverExpire} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-400" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Validity Period</label>
                  <select name="validityPeriod" value={form.validityPeriod} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>30 Days</option>
                    <option>90 Days</option>
                    <option>180 Days</option>
                    <option>365 Days</option>
                  </select>
                </div>
                <div className="col-span-2 mt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="neverExpire" checked={form.neverExpire} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    Never Expire
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION: CUSTOMER / RECIPIENT */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Customer / Recipient</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer</label>
                <select name="customer" value={form.customer} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                  <option>Select</option>
                  <option>Walk-in Customer</option>
                  <option>John Doe</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Name</label>
                <input type="text" name="recipientName" value={form.recipientName} onChange={handleChange} placeholder="Enter Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile</label>
                <input type="text" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile Number" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email Address" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Greeting / Message</label>
                <textarea name="greetingMessage" value={form.greetingMessage} onChange={handleChange} rows="2" placeholder="Happy Birthday! etc." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
              </div>
            </div>
          </div>

          {/* SECTION: USAGE RULES & ACCOUNTING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* USAGE RULES */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Usage Rules</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Usage Type</label>
                  <select name="usageType" value={form.usageType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Multiple</option>
                    <option>Single</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Redeemable At</label>
                  <select name="redeemableAt" value={form.redeemableAt} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>All Branches</option>
                    <option>Specific Branch</option>
                  </select>
                </div>
                
                <div className="col-span-2 grid grid-cols-2 gap-2 mt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="onlineUsage" checked={form.onlineUsage} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    Online Usage
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="offlineUsage" checked={form.offlineUsage} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    Offline Usage
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="partialRedemption" checked={form.partialRedemption} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    Partial Redemption
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="transferable" checked={form.transferable} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    Transferable
                  </label>
                </div>

                <div className="col-span-2 mt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Applicable For</label>
                  <select name="applicableFor" value={form.applicableFor} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>All Products</option>
                    <option>Specific Categories</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ACCOUNTING */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Accounting</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Account</label>
                  <select name="salesAccount" value={form.salesAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>Sales - Gift Cards</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Liability Account</label>
                  <select name="liabilityAccount" value={form.liabilityAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>Gift Card Liability</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Configuration</label>
                  <select name="taxConfiguration" value={form.taxConfiguration} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>GST 18%</option>
                    <option>Tax Exempt</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION: TERMS & NOTES */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Terms & Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Terms & Conditions</label>
                <textarea name="termsConditions" value={form.termsConditions} onChange={handleChange} rows="3" placeholder="Enter terms of use..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
                <textarea name="internalNotes" value={form.internalNotes} onChange={handleChange} rows="3" placeholder="For internal staff only..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/sales/gift-card-list')} className="px-6 py-2.5 border border-slate-300 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Cancel
            </button>
            <button type="button" className="px-6 py-2.5 border border-indigo-200 bg-indigo-50 rounded text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm">
              Save Draft
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
              <Gift size={16} /> Create Gift Card
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddGiftCard;
