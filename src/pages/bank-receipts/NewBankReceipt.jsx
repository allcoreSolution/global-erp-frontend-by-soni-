import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const NewBankReceipt = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Basic Information State
  const [form, setForm] = useState({
    receiptNo: `BRCT-${Date.now().toString().slice(-5)}`,
    receiptDate: new Date().toISOString().split('T')[0],
    customerParty: '',
    amount: 0,
    method: '',
    bankAccount: '',
    utrNo: '',
    transactionDate: new Date().toISOString().split('T')[0],
    chequeNo: '',
    remarks: ''
  });

  const [branch, setBranch] = useState('');
  const [warehouse, setWarehouse] = useState('');

  // Dropdown States
  const [branchesList, setBranchesList] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [paymentModesList, setPaymentModesList] = useState([]);
  const [depositAccountsList, setDepositAccountsList] = useState([]);

  // Derived filtered options
  const warehouses = allWarehouses.filter(w => !branch || w.branchName === branch).map(w => w.name);
  const customers = allCustomers.filter(c => !warehouse || c.warehouseName === warehouse);
  const invoices = allSales.filter(s => s.customer === form.customerParty && s.paymentStatus !== 'Paid');

  // Totals State
  const [totals, setTotals] = useState({
    received: 0,
    adjusted: 0,
    unadjusted: 0
  });

  const [invoiceAdjustments, setInvoiceAdjustments] = useState([]);

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
        
        setBranchesList((branchRes.data?.data || []).map(b => b.name));
        setAllWarehouses((whRes.data?.data || []).map(w => ({
          name: w.name,
          branchName: w.branch?.name || w.branch || ''
        })));
        setAllCustomers((custRes.data?.data || []).map(c => ({
          id: c._id,
          name: c.customerName || c.name,
          phone: c.mobile || c.phone || '',
          balance: c.openingBalance || 0,
          warehouseName: c.warehouse?.name || c.warehouse || ''
        })));
        setAllSales((salesRes.data?.data || []).map(s => ({
          id: s._id,
          referenceNo: s.referenceNo,
          customer: s.customer,
          paymentStatus: s.paymentStatus,
          grandTotal: s.grandTotal || 0,
          paidAmount: s.paidAmount || 0,
          dueAmount: (s.grandTotal || 0) - (s.paidAmount || 0)
        })));
        
        const pmData = pmRes.data?.data || [];
        setPaymentModesList(pmData.map(p => p.name || p.modeName || p));
        
        const accData = accRes.data?.data || [];
        setDepositAccountsList(accData.map(a => a.accountName || a.name || a));

      } catch (error) {
        console.error('Error fetching catalogs:', error);
      }
    };
    fetchCatalogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'amount') {
        calculateTotals(Number(value) || 0, invoiceAdjustments);
      }
      return updated;
    });
  };

  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    setForm(prev => ({ ...prev, customerParty: custId }));
    
    // Automatically prepare pending invoices for this customer
    const pending = allSales.filter(s => s.customer === custId && s.paymentStatus !== 'Paid');
    const preparedAdjustments = pending.map(inv => ({
      id: inv.id,
      referenceNo: inv.referenceNo,
      invoiceAmount: inv.grandTotal,
      dueAmount: inv.dueAmount,
      adjustAmount: 0
    }));
    setInvoiceAdjustments(preparedAdjustments);
    calculateTotals(Number(form.amount) || 0, preparedAdjustments);
  };

  const handleAdjustmentChange = (id, value) => {
    setInvoiceAdjustments(prev => {
      const updated = prev.map(inv => inv.id === id ? { ...inv, adjustAmount: Number(value) || 0 } : inv);
      calculateTotals(Number(form.amount) || 0, updated);
      return updated;
    });
  };

  const calculateTotals = (receivedAmt, currentInvoices) => {
    const totalAdjusted = currentInvoices.reduce((sum, inv) => sum + (inv.adjustAmount || 0), 0);
    setTotals({
      received: receivedAmt,
      adjusted: totalAdjusted,
      unadjusted: receivedAmt - totalAdjusted
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        branch,
        warehouse,
        amount: Number(form.amount) || 0,
        invoices: invoiceAdjustments.filter(i => i.adjustAmount > 0)
      };
      
      if (id) {
        await api.put(`/bank-receipts/${id}`, payload);
        alert('Bank Receipt Updated successfully!');
      } else {
        await api.post('/bank-receipts', payload);
        alert('Bank Receipt Posted successfully!');
      }
      navigate('/bank-receipt/list');
    } catch (error) {
      console.error('Error saving bank receipt', error);
      alert('Failed to save bank receipt. Please check the inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/bank-receipt/list')} className="flex items-center gap-2 text-teal-600 hover:text-teal-800 font-semibold transition-colors">
          <ArrowLeft size={18} /> Back to Bank Receipt List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/bank-receipt/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Post Bank Receipt
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-teal-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-teal-900 uppercase tracking-wide">CREATE BANK RECEIPT</h2>
          <p className="text-sm text-slate-500 font-medium">Record bank receipt from customer</p>
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
                  <input type="date" name="receiptDate" value={form.receiptDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <select value={branch} onChange={(e) => { setBranch(e.target.value); setWarehouse(''); setForm(prev => ({ ...prev, customerParty: '' })); }} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white" required>
                    <option value="">Select branch...</option>
                    {branchesList.map((b, i) => <option key={i} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse *</label>
                  <select value={warehouse} onChange={(e) => { setWarehouse(e.target.value); setForm(prev => ({ ...prev, customerParty: '' })); }} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white" required>
                    <option value="">{branch ? "Select warehouse..." : "Select branch first"}</option>
                    {warehouses.map((w, i) => <option key={i} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: CUSTOMER / PARTY DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Details</h3>
                 {form.customerParty && (
                    <span className="text-sm font-bold text-red-600">
                      Outstanding: ₹{customers.find(c => c.name === form.customerParty || c.id === form.customerParty)?.balance || 0}
                    </span>
                 )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Party *</label>
                  <select 
                    name="customerParty" 
                    value={form.customerParty} 
                    onChange={handleCustomerSelect}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white"
                    disabled={!warehouse}
                    required
                  >
                    <option value="">{warehouse ? "-- Select Customer --" : "Select warehouse first"}</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* SECTION: BANK & PAYMENT DETAILS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Bank & Payment Details</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Received *</label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-bold text-teal-700 focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <select name="method" value={form.method} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white">
                    <option value="">Select Mode</option>
                    {paymentModesList.map((pm, i) => <option key={i} value={pm}>{pm}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account (Credit To) *</label>
                  <select name="bankAccount" value={form.bankAccount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none bg-white">
                    <option value="">Select Bank Account</option>
                    {depositAccountsList.map((acc, i) => <option key={i} value={acc}>{acc}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UTR / Ref No.</label>
                  <input type="text" name="utrNo" value={form.utrNo} onChange={handleChange} placeholder="UTR No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Date</label>
                  <input type="date" name="transactionDate" value={form.transactionDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cheque No. (If applicable)</label>
                  <input type="text" name="chequeNo" value={form.chequeNo} onChange={handleChange} placeholder="Cheque No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                </div>
                <div className="col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                  <input type="text" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Add any notes here..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                </div>
            </div>
          </div>

          {/* SECTION: INVOICE ADJUSTMENT */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Invoice Adjustment (Unpaid Sales Bills)</h3>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="px-3 py-2 text-xs font-bold uppercase">Invoice No.</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase text-right">Invoice Amount (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase text-right">Due Amount (₹)</th>
                    <th className="px-3 py-2 text-xs font-bold uppercase text-right">Adjust Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceAdjustments.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-3 py-2 font-medium text-slate-700">
                        {inv.referenceNo || 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {inv.invoiceAmount}
                      </td>
                      <td className="px-3 py-2 text-right text-red-600 font-semibold">
                        {inv.dueAmount}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input type="number" min="0" max={inv.dueAmount} value={inv.adjustAmount} onChange={(e) => handleAdjustmentChange(inv.id, e.target.value)} className="w-32 border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-teal-700 focus:border-teal-500 outline-none bg-white text-right ml-auto" />
                      </td>
                    </tr>
                  ))}
                  {invoiceAdjustments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-3 py-4 text-center text-sm text-slate-500 italic">No unpaid invoices found for the selected customer.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex flex-col items-end gap-2 text-sm font-medium pr-4 border-t border-slate-200 pt-4">
              <div className="flex w-64 justify-between text-slate-600">
                 <span>Total Received:</span>
                 <span>₹{totals.received.toFixed(2)}</span>
              </div>
              <div className="flex w-64 justify-between text-slate-600">
                 <span>Total Adjusted:</span>
                 <span className="text-teal-600">₹{totals.adjusted.toFixed(2)}</span>
              </div>
              <div className="flex w-64 justify-between text-slate-800 font-bold border-t border-slate-200 pt-1 mt-1">
                 <span>Unadjusted / Advance:</span>
                 <span className={totals.unadjusted < 0 ? 'text-red-600' : 'text-slate-800'}>₹{totals.unadjusted.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewBankReceipt;
