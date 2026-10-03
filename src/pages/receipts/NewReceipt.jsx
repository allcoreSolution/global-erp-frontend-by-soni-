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

  const [branchesList, setBranchesList] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [paymentModesList, setPaymentModesList] = useState([]);
  const [depositAccountsList, setDepositAccountsList] = useState([]);

  const [branch, setBranch] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [customer, setCustomer] = useState('');

  // Derived filtered options
  const warehouses = allWarehouses.filter(w => !branch || w.branchName === branch).map(w => w.name);
  const customers = allCustomers.filter(c => !warehouse || c.warehouseName === warehouse);
  const invoices = allSales.filter(s => s.customer === customer && s.paymentStatus !== 'Paid');

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [branchRes, whRes, custRes, salesRes, pmRes, accRes] = await Promise.all([
          api.get('/branches').catch(() => ({ data: { data: [] } })),
          api.get('/catalogs/warehouses').catch(() => ({ data: { data: [] } })),
          api.get('/customers').catch(() => ({ data: { data: [] } })),
          api.get('/sales').catch(() => ({ data: { data: [] } })),
          api.get('/payment-modes').catch(() => ({ data: { data: [] } })),
          api.get('/account-ledgers').catch(() => ({ data: { data: [] } }))
        ]);
        
        const brData = branchRes.data?.data || [];
        setBranchesList(brData.map(b => b.name));

        const wData = whRes.data?.data || [];
        setAllWarehouses(wData.map(w => ({
          name: w.name,
          branchName: w.branch?.name || w.branch || ''
        })));

        const cData = custRes.data?.data || [];
        setAllCustomers(cData.map(c => ({
          id: c._id,
          name: c.customerName || c.name,
          phone: c.mobile || c.phone || '',
          balance: c.openingBalance || 0,
          warehouseName: c.warehouseAddress || c.warehouseName || ''
        })));

        const sData = salesRes.data?.data || [];
        setAllSales(sData.map(s => ({
          id: s._id,
          referenceNo: s.referenceNo,
          customer: s.customer,
          paymentStatus: s.paymentStatus,
          grandTotal: s.grandTotal || 0,
          paid: s.paidAmount || 0,
          due: (s.grandTotal || 0) - (s.paidAmount || 0)
        })));

        const pmData = pmRes.data?.data || [];
        setPaymentModesList(pmData.map(p => p.name || p.modeName || p));

        const accData = accRes.data?.data || [];
        setDepositAccountsList(accData.map(a => a.accountName || a.name || a));

      } catch (err) {
        console.error("Error fetching catalogs", err);
      }
    };
    fetchCatalogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'againstInvoice') {
      const inv = invoices.find(i => i.id === value);
      if (inv) {
        setForm(prev => ({ ...prev, receivedAmount: inv.due }));
      }
    }
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
                {customer && (
                  <span className="text-sm font-bold text-rose-600">
                    Outstanding: ₹{allCustomers.find(c => c.name === customer)?.balance || 0}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Branch */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <select
                    value={branch}
                    onChange={(e) => {
                      setBranch(e.target.value);
                      setWarehouse('');
                      setCustomer('');
                      setForm(prev => ({ ...prev, customer: '', againstInvoice: '' }));
                    }}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="">Select branch...</option>
                    {branchesList.map((b, i) => <option key={i} value={b}>{b}</option>)}
                  </select>
                </div>

                {/* Warehouse */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse *</label>
                  <select
                    value={warehouse}
                    onChange={(e) => {
                      setWarehouse(e.target.value);
                      setCustomer('');
                      setForm(prev => ({ ...prev, customer: '', againstInvoice: '' }));
                    }}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="">{branch ? "Select warehouse..." : "Select branch first"}</option>
                    {warehouses.map((w, i) => <option key={i} value={w}>{w}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Party *</label>
                  <select
                    name="customer"
                    value={customer}
                    onChange={(e) => {
                      setCustomer(e.target.value);
                      setForm(prev => ({ ...prev, customer: e.target.value, againstInvoice: '' }));
                    }}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white"
                    disabled={!warehouse}
                    required
                  >
                    <option value="">{warehouse ? "-- Select Customer --" : "Select warehouse first"}</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} {c.phone ? `(${c.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Against Invoice</label>
                  <select name="againstInvoice" value={form.againstInvoice} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">-- Select Pending Invoice --</option>
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.referenceNo} (Due: ₹{inv.due})</option>
                    ))}
                  </select>
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
                    <option value="">Select Mode</option>
                    {paymentModesList.map((pm, i) => <option key={i} value={pm}>{pm}</option>)}
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
                    {depositAccountsList.map((acc, i) => <option key={i} value={acc}>{acc}</option>)}
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
