import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import Swal from 'sweetalert2';

const NewBankPayment = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Basic Information State
  const [form, setForm] = useState({
    paymentNo: `BPMT-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 1000)}`,
    paymentDate: new Date().toISOString().split('T')[0],
    supplierParty: '',
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
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [allPurchases, setAllPurchases] = useState([]);
  const [paymentModesList, setPaymentModesList] = useState([]);
  const [depositAccountsList, setDepositAccountsList] = useState([]);

  // Derived filtered options
  const warehouses = allWarehouses.filter(w => !branch || w.branchName === branch).map(w => w.name);
  const suppliers = allSuppliers; 
  const invoices = allPurchases.filter(p => p.supplier === form.supplierParty && p.paymentStatus !== 'Paid');

  // Totals State
  const [totals, setTotals] = useState({
    payment: 0,
    adjusted: 0,
    unadjusted: 0
  });

  const [invoiceAdjustments, setInvoiceAdjustments] = useState([]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [branchRes, whRes, suppRes, purchRes, pmRes, accRes] = await Promise.all([
          api.get('/branches').catch(() => ({ data: { data: [] } })),
          api.get('/catalogs/warehouses').catch(() => ({ data: { data: [] } })),
          api.get('/suppliers').catch(() => ({ data: { data: [] } })),
          api.get('/purchases').catch(() => ({ data: { data: [] } })), 
          api.get('/payment-modes').catch(() => ({ data: { data: [] } })),
          api.get('/account-ledgers').catch(() => ({ data: { data: [] } }))
        ]);
        
        setBranchesList((branchRes.data?.data || []).map(b => b.name));
        setAllWarehouses((whRes.data?.data || []).map(w => ({
          name: w.name,
          branchName: w.branch?.name || w.branch || ''
        })));
        setAllSuppliers((suppRes.data?.data || []).map(s => ({
          id: s._id,
          name: s.companyName || s.supplierName || s.name,
          phone: s.phone || s.mobile || '',
          balance: s.openingBalance || 0
        })));
        setAllPurchases((purchRes.data?.data || []).map(p => ({
          id: p._id,
          referenceNo: p.referenceNo,
          supplier: p.supplier?.companyName || p.supplier || '',
          paymentStatus: p.paymentStatus,
          grandTotal: p.grandTotal || 0,
          paidAmount: p.amountPaid || 0,
          dueAmount: (p.grandTotal || 0) - (p.amountPaid || 0)
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
        const amt = Number(value) || 0;
        let remaining = amt;
        const newAdjustments = invoiceAdjustments.map(inv => {
          if (remaining > 0) {
            const adjust = Math.min(remaining, inv.dueAmount);
            remaining -= adjust;
            return { ...inv, adjustAmount: adjust };
          }
          return { ...inv, adjustAmount: 0 };
        });
        setInvoiceAdjustments(newAdjustments);
        calculateTotals(amt, newAdjustments);
      }
      return updated;
    });
  };

  const handleSupplierSelect = (e) => {
    const suppId = e.target.value;
    setForm(prev => ({ ...prev, supplierParty: suppId }));
    
    // Automatically prepare pending invoices for this supplier
    const pending = allPurchases.filter(p => p.supplier === suppId && p.paymentStatus !== 'Paid');
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

  const calculateTotals = (paymentAmt, currentInvoices) => {
    const totalAdjusted = currentInvoices.reduce((sum, inv) => sum + (inv.adjustAmount || 0), 0);
    setTotals({
      payment: paymentAmt,
      adjusted: totalAdjusted,
      unadjusted: paymentAmt - totalAdjusted
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        branch,
        warehouse,
        paymentId: form.paymentNo, // Added to bypass stale MongoDB index
        amount: Number(form.amount) || 0,
        invoices: invoiceAdjustments.filter(i => i.adjustAmount > 0)
      };
      
      if (id) {
        await api.put(`/bank-payments/${id}`, payload);
        Swal.fire('Success', 'Bank Payment Updated successfully!', 'success');
      } else {
        await api.post('/bank-payments', payload);
        Swal.fire('Success', 'Bank Payment Posted successfully!', 'success');
      }
      navigate('/bank-payment/list');
    } catch (error) {
      console.error('Error saving bank payment', error);
      const errMsg = error.response?.data?.message || error.response?.data || error.message;
      Swal.fire('Error', 'Failed to save bank payment: ' + JSON.stringify(errMsg), 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/bank-payment/list')} className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-semibold transition-colors">
          <ArrowLeft size={18} /> Back to Bank Payment List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/bank-payment/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Post Bank Payment
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-orange-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-orange-900 uppercase tracking-wide">CREATE BANK PAYMENT</h2>
          <p className="text-sm text-slate-500 font-medium">Record bank payment made to supplier</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment No. *</label>
                  <input type="text" name="paymentNo" value={form.paymentNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date *</label>
                  <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <select value={branch} onChange={(e) => { setBranch(e.target.value); setWarehouse(''); setForm(prev => ({ ...prev, supplierParty: '' })); }} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none bg-white" required>
                    <option value="">Select branch...</option>
                    {branchesList.map((b, i) => <option key={i} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse *</label>
                  <select value={warehouse} onChange={(e) => { setWarehouse(e.target.value); setForm(prev => ({ ...prev, supplierParty: '' })); }} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none bg-white" required>
                    <option value="">{branch ? "Select warehouse..." : "Select branch first"}</option>
                    {warehouses.map((w, i) => <option key={i} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: PARTY DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Party Details</h3>
                 {form.supplierParty && (
                    <span className="text-sm font-bold text-red-600">
                      Outstanding: ₹{suppliers.find(s => s.name === form.supplierParty)?.balance || 0}
                    </span>
                 )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Party *</label>
                  <select 
                    name="supplierParty" 
                    value={form.supplierParty} 
                    onChange={handleSupplierSelect}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none bg-white"
                    required
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name} {s.phone ? `(${s.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* SECTION: BANK PAYMENT DETAILS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Bank Payment Details</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount *</label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-bold text-orange-700 focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <select name="method" value={form.method} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none bg-white">
                    <option value="">Select Mode</option>
                    {paymentModesList.map((pm, i) => <option key={i} value={pm}>{pm}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Paid From Account *</label>
                  <select name="bankAccount" value={form.bankAccount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none bg-white">
                    <option value="">Select Account</option>
                    {depositAccountsList.map((acc, i) => <option key={i} value={acc}>{acc}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UTR / Ref No.</label>
                  <input type="text" name="utrNo" value={form.utrNo} onChange={handleChange} placeholder="UTR No." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Date</label>
                  <input type="date" name="transactionDate" value={form.transactionDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cheque No. (If applicable)</label>
                  <input type="text" name="chequeNo" value={form.chequeNo} onChange={handleChange} placeholder="Cheque No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none" />
                </div>
                <div className="col-span-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                  <input type="text" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Add any notes here..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-orange-500 outline-none" />
                </div>
            </div>
          </div>

          {/* SECTION: INVOICE ADJUSTMENT */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Invoice Adjustment (Unpaid Bills)</h3>
            
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
                        <input type="number" min="0" max={inv.dueAmount} value={inv.adjustAmount} onChange={(e) => handleAdjustmentChange(inv.id, e.target.value)} className="w-32 border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-orange-700 focus:border-orange-500 outline-none bg-white text-right ml-auto" />
                      </td>
                    </tr>
                  ))}
                  {invoiceAdjustments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-3 py-4 text-center text-sm text-slate-500 italic">No unpaid invoices found for the selected supplier.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex flex-col items-end gap-2 text-sm font-medium pr-4 border-t border-slate-200 pt-4">
              <div className="flex w-64 justify-between text-slate-600">
                 <span>Total Payment:</span>
                 <span>₹{totals.payment.toFixed(2)}</span>
              </div>
              <div className="flex w-64 justify-between text-slate-600">
                 <span>Total Adjusted:</span>
                 <span className="text-orange-600">₹{totals.adjusted.toFixed(2)}</span>
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

export default NewBankPayment;
