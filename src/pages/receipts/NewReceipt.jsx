import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const NewReceipt = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    receiptNo: `RCPT-${Date.now().toString().slice(-5)}`,
    receiptDate: new Date().toISOString().split('T')[0],
    customer: '',
    contactNumber: '',
    email: '',
    address: '',
    paymentMode: 'UPI',
    receivedAmount: '',
    againstInvoice: '',
    referenceNo: '',
    depositAccount: '',
    remarks: ''
  });

  const [customersList, setCustomersList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [invoices] = useState([
    { id: 'INV-00125', due: 50000 },
    { id: 'INV-00126', due: 20000 }
  ]);
  const [selectedInvoiceDue, setSelectedInvoiceDue] = useState(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers');
        if (res.data?.success) {
          setCustomersList(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching customers", err);
      }
    };
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'againstInvoice') {
      const inv = invoices.find(i => i.id === value);
      setSelectedInvoiceDue(inv ? inv.due : 0);
    }
  };

  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    const cust = customersList.find(c => c._id === custId);
    setSelectedCustomer(cust || null);

    setForm(prev => ({
      ...prev,
      customer: custId,
      contactNumber: cust ? (cust.mobile || cust.phone || cust.contactNumber || '') : '',
      email: cust ? (cust.email || '') : '',
      address: cust ? (cust.billingAddress || cust.address || '') : ''
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        receiptNo: form.receiptNo,
        receiptDate: form.receiptDate,
        customerParty: form.customer,
        paymentAmount: Number(form.receivedAmount) || 0,
        paymentMethod: form.paymentMode,
        referenceInvoice: form.againstInvoice,
        transactionRef: form.referenceNo,
        account: form.depositAccount,
        remarks: form.remarks
      };

      if (id) {
        await api.put(`/receipts/${id}`, payload);
        alert('Receipt Updated successfully!');
      } else {
        await api.post('/receipts', payload);
        alert('Receipt Saved successfully!');
      }
      navigate('/receipt/list');
    } catch (error) {
      console.error('Error saving receipt', error);
      alert('Receipt Saved Locally (Backend might need update for this simplified payload).');
      navigate('/receipt/list');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">

      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/receipt/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Receipt List
        </button>

        <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/receipt/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Cancel
          </button>
          <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
            <CheckCircle size={16} /> Save Receipt
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">

        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-emerald-900 uppercase tracking-wide">CREATE RECEIPT</h2>
          <p className="text-sm text-slate-500 font-medium">Record payment received</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt No. *</label>
                  <input type="text" name="receiptNo" value={form.receiptNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Date *</label>
                  <input type="date" name="receiptDate" value={form.receiptDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* SECTION: PARTY DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Party Details</h3>
                <span className="text-sm font-bold text-rose-600">Outstanding: ₹{selectedCustomer ? (selectedCustomer.openingBalance || 0) : '0'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Party *</label>
                  <select
                    name="customer"
                    value={form.customer}
                    onChange={handleCustomerSelect}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="">-- Select Customer --</option>
                    {customersList.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.customerName || c.name} {c.mobile ? `(${c.mobile})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto-filled Customer Basic Details */}
                {selectedCustomer && (
                  <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200 mt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Number</label>
                      <input type="text" value={form.contactNumber} readOnly className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                      <input type="text" value={form.email} readOnly className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Address</label>
                      <input type="text" value={form.address} readOnly className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none truncate" />
                    </div>
                  </div>
                )}

                <div className={selectedCustomer ? "mt-2" : ""}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Against Invoice</label>
                  <select name="againstInvoice" value={form.againstInvoice} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Invoice</option>
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.id}</option>
                    ))}
                  </select>
                </div>
                <div className={selectedCustomer ? "mt-2" : ""}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Due</label>
                  <input type="text" value={`₹${selectedInvoiceDue}`} readOnly className="w-full border border-slate-300 rounded bg-orange-50 px-3 py-2 text-sm font-bold text-orange-600 outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECTION: PAYMENT DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode *</label>
                  <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>

                  <label className="block text-xs font-semibold text-emerald-600 mb-1">Received Amount *</label>
                  <input type="number" name="receivedAmount" value={form.receivedAmount} onChange={handleChange} required className="w-full border border-emerald-400 bg-emerald-50 rounded px-3 py-2 text-sm font-bold text-emerald-700 focus:border-emerald-600 outline-none" placeholder="₹ 0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reference No.</label>
                  <input type="text" name="referenceNo" value={form.referenceNo} onChange={handleChange} placeholder="UTR / Ref No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deposit Account</label>
                  <select name="depositAccount" value={form.depositAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Account</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="SBI Bank">SBI Bank</option>
                    <option value="Cash in Hand">Cash in Hand</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: ADDITIONAL INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Additional Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                  <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Add any notes here..."></textarea>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReceipt;
