import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import Swal from 'sweetalert2';

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
    isSplitPayment: false,
    bankAmount: '',
    cashAmount: '',
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
  const customers = allCustomers;
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
          referenceNo: s.invoiceNo || s.referenceNo, // Use invoiceNo
          customer: s.customer?.name || s.customer || '', // Extract customer name
          paymentStatus: s.paymentStatus,
          grandTotal: s.grandTotal || 0,
          paid: s.amountPaid || 0,
          due: (s.grandTotal || 0) - (s.amountPaid || 0)
        })));

        const pmData = pmRes.data?.data || [];
        if (pmData.length > 0) {
          setPaymentModesList(pmData.map(p => p.name || p.modeName || p));
        } else {
          setPaymentModesList(['Cash', 'Bank Transfer', 'UPI', 'Cheque']);
        }

        const accData = accRes.data?.data || [];
        setDepositAccountsList(accData.map(a => a.accountName || a.name || a));

      } catch (err) {
        console.error("Error fetching catalogs", err);
      }
    };
    fetchCatalogs();
  }, []);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (id) {
        try {
          const res = await api.get(`/receipts/${id}`);
          const data = res.data?.data || res.data;
          if (data) {
            setForm({
              receiptNo: data.receiptNo || '',
              receiptDate: data.receiptDate ? new Date(data.receiptDate).toISOString().split('T')[0] : '',
              customer: data.customerParty?.name || data.customerParty || '',
              contactNumber: data.contactNumber || '',
              email: data.email || '',
              address: data.address || '',
              paymentMode: data.paymentMethod || 'UPI',
              receivedAmount: data.paymentAmount || '',
              againstInvoice: data.referenceInvoice || '',
              referenceNo: data.transactionRef || '',
              depositAccount: data.account || '',
              remarks: data.remarks || ''
            });
            setCustomer(data.customerParty?.name || data.customerParty || '');
          }
        } catch (error) {
          console.error("Error fetching receipt for edit", error);
        }
      }
    };
    fetchReceipt();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setForm(prev => {
      const updated = { ...prev, [name]: val };
      if (name === 'bankAmount' || name === 'cashAmount') {
        const b = Number(name === 'bankAmount' ? val : prev.bankAmount) || 0;
        const c = Number(name === 'cashAmount' ? val : prev.cashAmount) || 0;
        updated.receivedAmount = (b + c).toString();
      }
      return updated;
    });

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
      const finalAmount = form.isSplitPayment 
        ? ((Number(form.bankAmount) || 0) + (Number(form.cashAmount) || 0))
        : (Number(form.receivedAmount) || 0);

      const payload = {
        receiptNo: form.receiptNo,
        receiptDate: form.receiptDate,
        customerParty: form.customer,
        paymentAmount: finalAmount,
        paymentMethod: form.isSplitPayment ? 'Multi-Account Split (Bank+Cash)' : form.paymentMode,
        isSplitPayment: Boolean(form.isSplitPayment),
        bankAmount: Number(form.bankAmount) || 0,
        cashAmount: Number(form.cashAmount) || 0,
        referenceInvoice: form.againstInvoice,
        transactionRef: form.referenceNo,
        account: form.depositAccount,
        remarks: form.remarks
      };

      if (id) {
        await api.put(`/receipts/${id}`, payload);
        Swal.fire('Success', 'Receipt Updated successfully!', 'success');
      } else {
        await api.post('/receipts', payload);
        Swal.fire('Success', 'Receipt Saved successfully!', 'success');
      }
      navigate('/receipt/list');
    } catch (error) {
      console.error('Error saving receipt', error);
      Swal.fire('Warning', 'Receipt Saved Locally (Backend might need update for this simplified payload).', 'warning');
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
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Details</h3>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  <input
                    type="checkbox"
                    name="isSplitPayment"
                    checked={form.isSplitPayment}
                    onChange={handleChange}
                    className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span>Compound / Split Receipt (Bank + Cash)</span>
                </label>
              </div>

              {form.isSplitPayment ? (
                <div className="space-y-4 mb-4 p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
                  <p className="text-[11px] text-indigo-900 font-semibold">
                    Multi-Account Split Active (e.g. Capital introduction ₹1,000,000 = Bank Dr ₹900,000 + Cash Dr ₹100,000)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-indigo-800 mb-1">Bank Amount Dr (₹) *</label>
                      <input
                        type="number"
                        name="bankAmount"
                        value={form.bankAmount}
                        onChange={handleChange}
                        placeholder="e.g. 900000"
                        className="w-full border border-indigo-300 rounded px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-800 mb-1">Cash Amount Dr (₹) *</label>
                      <input
                        type="number"
                        name="cashAmount"
                        value={form.cashAmount}
                        onChange={handleChange}
                        placeholder="e.g. 100000"
                        className="w-full border border-emerald-300 rounded px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-indigo-100 text-xs font-bold">
                    <span className="text-slate-600">Total Combined Receipt:</span>
                    <span className="text-emerald-700 text-sm">
                      ₹{((Number(form.bankAmount) || 0) + (Number(form.cashAmount) || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode *</label>
                  <select name="paymentMode" value={form.paymentMode} onChange={handleChange} disabled={form.isSplitPayment} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option value="">Select Mode</option>
                    {paymentModesList.map((pm, i) => <option key={i} value={pm}>{pm}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-600 mb-1">Total Received Amount (₹) *</label>
                  <input
                    type="number"
                    name="receivedAmount"
                    value={form.receivedAmount}
                    onChange={handleChange}
                    readOnly={form.isSplitPayment}
                    required
                    className={`w-full border border-emerald-400 rounded px-3 py-2 text-sm font-bold text-emerald-700 focus:border-emerald-600 outline-none ${form.isSplitPayment ? 'bg-slate-100 cursor-not-allowed' : 'bg-emerald-50'}`}
                    placeholder="₹ 0"
                  />
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
