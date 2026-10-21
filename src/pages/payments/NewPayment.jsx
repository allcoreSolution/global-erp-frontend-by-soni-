import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, UploadCloud } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import Swal from 'sweetalert2';

const NewPayment = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Basic Information State
  const [form, setForm] = useState({
    paymentNo: `PAY-${Date.now().toString().slice(-5)}`,
    paymentDate: new Date().toISOString().split('T')[0],
    supplierParty: '',
    paymentAmount: 0,
    paymentMethod: 'Bank',
    isSplitPayment: false,
    bankAmount: '',
    cashAmount: '',
    isLoanRepayment: false,
    principalAmount: '',
    interestAmount: '',
    paidFromAccount: '',
    transactionRef: '',
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
  const invoices = allPurchases.filter(p => (p.supplier?._id || p.supplier) === form.supplierParty && p.paymentStatus !== 'Paid');

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
          name: s.companyName || s.supplierName || s.name || 'Unknown Supplier',
          phone: s.mobile || s.phone || '',
          balance: s.balance || s.openingBalance || 0
        })));
        setAllPurchases((purchRes.data?.data || []).map(p => ({
          id: p._id,
          referenceNo: p.referenceNo,
          supplier: p.supplier,
          paymentStatus: p.paymentStatus,
          grandTotal: p.grandTotal || 0,
          paidAmount: p.amountPaid || 0,
          dueAmount: (p.grandTotal || 0) - (p.amountPaid || 0)
        })));

        const pmData = pmRes.data?.data || [];
        const defaultModes = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Credit Card'];
        setPaymentModesList(pmData.length > 0 ? pmData.map(p => p.name || p.modeName || p) : defaultModes);

        const accData = accRes.data?.data || [];
        setDepositAccountsList(accData.map(a => a.accountName || a.name || a));

      } catch (error) {
        console.error('Error fetching catalogs:', error);
      }
    };
    fetchCatalogs();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchPaymentData = async () => {
        try {
          const res = await api.get(`/payments/${id}`);
          if (res.data.success) {
            const p = res.data.data;
            setForm({
              paymentNo: p.paymentNo || '',
              paymentDate: p.paymentDate ? p.paymentDate.substring(0, 10) : '',
              supplierParty: p.supplierParty || '',
              paymentAmount: p.paymentAmount || 0,
              paymentMethod: p.paymentMethod || 'Bank',
              isSplitPayment: Boolean(p.isSplitPayment),
              bankAmount: p.bankAmount || '',
              cashAmount: p.cashAmount || '',
              isLoanRepayment: Boolean(p.principalAmount || p.interestAmount),
              principalAmount: p.principalAmount || '',
              interestAmount: p.interestAmount || '',
              paidFromAccount: p.paidFromAccount || '',
              transactionRef: p.transactionRef || '',
              remarks: p.remarks || ''
            });
          }
        } catch (error) {
          console.error('Error fetching payment details:', error);
        }
      };
      fetchPaymentData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm(prev => {
      const updated = { ...prev, [name]: val };

      if (name === 'bankAmount' || name === 'cashAmount') {
        const b = Number(name === 'bankAmount' ? val : prev.bankAmount) || 0;
        const c = Number(name === 'cashAmount' ? val : prev.cashAmount) || 0;
        updated.paymentAmount = b + c;
      } else if (name === 'principalAmount' || name === 'interestAmount') {
        const p = Number(name === 'principalAmount' ? val : prev.principalAmount) || 0;
        const i = Number(name === 'interestAmount' ? val : prev.interestAmount) || 0;
        updated.paymentAmount = p + i;
      }

      const amt = Number(updated.paymentAmount) || 0;
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

      return updated;
    });
  };

  const handleSupplierSelect = (e) => {
    const suppId = e.target.value;
    setForm(prev => ({ ...prev, supplierParty: suppId }));

    const pending = allPurchases.filter(p => (p.supplier?._id || p.supplier) === suppId && p.paymentStatus !== 'Paid');
    const preparedAdjustments = pending.map(inv => ({
      id: inv.id,
      referenceNo: inv.referenceNo,
      invoiceAmount: inv.grandTotal,
      dueAmount: inv.dueAmount,
      adjustAmount: 0
    }));
    setInvoiceAdjustments(preparedAdjustments);
    calculateTotals(Number(form.paymentAmount) || 0, preparedAdjustments);
  };

  const handleAdjustmentChange = (id, value) => {
    setInvoiceAdjustments(prev => {
      const updated = prev.map(inv => inv.id === id ? { ...inv, adjustAmount: Number(value) || 0 } : inv);
      calculateTotals(Number(form.paymentAmount) || 0, updated);
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
      const finalAmount = form.isSplitPayment
        ? ((Number(form.bankAmount) || 0) + (Number(form.cashAmount) || 0))
        : (form.isLoanRepayment
          ? ((Number(form.principalAmount) || 0) + (Number(form.interestAmount) || 0))
          : (Number(form.paymentAmount) || 0));

      const payload = {
        ...form,
        branch,
        warehouse,
        paymentAmount: finalAmount,
        isSplitPayment: Boolean(form.isSplitPayment),
        bankAmount: Number(form.bankAmount) || 0,
        cashAmount: Number(form.cashAmount) || 0,
        principalAmount: Number(form.principalAmount) || 0,
        interestAmount: Number(form.interestAmount) || 0,
        invoices: invoiceAdjustments.filter(i => i.adjustAmount > 0)
      };

      if (id) {
        await api.put(`/payments/${id}`, payload);
        Swal.fire({ title: 'Success!', text: 'Payment Updated successfully!', icon: 'success', confirmButtonColor: '#4f46e5' });
      } else {
        await api.post('/payments', payload);
        Swal.fire({ title: 'Success!', text: 'Payment Posted successfully!', icon: 'success', confirmButtonColor: '#4f46e5' });
      }
      navigate('/payment/list');
    } catch (error) {
      console.error('Error saving payment', error);
      Swal.fire({ title: 'Error!', text: 'Failed to save payment. Please check the inputs.', icon: 'error', confirmButtonColor: '#4f46e5' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">

      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/payment/list')} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
          <ArrowLeft size={18} /> Back to Payment List
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/payment/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Cancel
          </button>
          <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
            <CheckCircle size={16} /> Post Payment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-blue-900 uppercase tracking-wide">CREATE PAYMENT</h2>
          <p className="text-sm text-slate-500 font-medium">Record payment made to supplier</p>
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
                  <input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <select value={branch} onChange={(e) => { setBranch(e.target.value); setWarehouse(''); setForm(prev => ({ ...prev, supplierParty: '' })); }} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white" required>
                    <option value="">Select branch...</option>
                    {branchesList.map((b, i) => <option key={i} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse *</label>
                  <select value={warehouse} onChange={(e) => { setWarehouse(e.target.value); setForm(prev => ({ ...prev, supplierParty: '' })); }} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white" required>
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
                    Outstanding: ₹{suppliers.find(s => s.name === form.supplierParty || s.id === form.supplierParty)?.balance || 0}
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
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.phone ? `(${s.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: PAYMENT DETAILS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <div className="flex flex-wrap justify-between items-center mb-4 pb-2 border-b border-slate-100 gap-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Details</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  <input
                    type="checkbox"
                    name="isSplitPayment"
                    checked={form.isSplitPayment}
                    onChange={(e) => {
                      if (e.target.checked) setForm(prev => ({ ...prev, isSplitPayment: true, isLoanRepayment: false }));
                      else setForm(prev => ({ ...prev, isSplitPayment: false }));
                    }}
                    className="w-3.5 h-3.5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span>Split Payment (Bank + Cash)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                  <input
                    type="checkbox"
                    name="isLoanRepayment"
                    checked={form.isLoanRepayment}
                    onChange={(e) => {
                      if (e.target.checked) setForm(prev => ({ ...prev, isLoanRepayment: true, isSplitPayment: false }));
                      else setForm(prev => ({ ...prev, isLoanRepayment: false }));
                    }}
                    className="w-3.5 h-3.5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span>Loan Installment (Principal + Interest)</span>
                </label>
              </div>
            </div>

            {/* Split Payment (Bank + Cash) Box */}
            {form.isSplitPayment && (
              <div className="space-y-3 mb-4 p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <p className="text-[11px] text-indigo-900 font-semibold">
                  Multi-Account Payment: Specify amount paid from Bank vs Cash
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-indigo-800 mb-1">Bank Payment Amount (₹) *</label>
                    <input
                      type="number"
                      name="bankAmount"
                      value={form.bankAmount}
                      onChange={handleChange}
                      placeholder="e.g. 50000"
                      className="w-full border border-indigo-300 rounded px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">Cash Payment Amount (₹) *</label>
                    <input
                      type="number"
                      name="cashAmount"
                      value={form.cashAmount}
                      onChange={handleChange}
                      placeholder="e.g. 10000"
                      className="w-full border border-emerald-300 rounded px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Loan Repayment Split Box */}
            {form.isLoanRepayment && (
              <div className="space-y-3 mb-4 p-3.5 bg-purple-50/50 rounded-lg border border-purple-100">
                <p className="text-[11px] text-purple-900 font-semibold">
                  Loan Repayment Split: Entry 28 (Principal Repayment + Interest Expense)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-purple-800 mb-1">Principal Reduction (Liability Dr) ₹ *</label>
                    <input
                      type="number"
                      name="principalAmount"
                      value={form.principalAmount}
                      onChange={handleChange}
                      placeholder="e.g. 10000"
                      className="w-full border border-purple-300 rounded px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-rose-800 mb-1">Interest Expense (Expense Dr) ₹ *</label>
                    <input
                      type="number"
                      name="interestAmount"
                      value={form.interestAmount}
                      onChange={handleChange}
                      placeholder="e.g. 2000"
                      className="w-full border border-rose-300 rounded px-3 py-2 text-sm font-bold text-slate-800 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Payment Amount (₹) *</label>
                <input
                  type="number"
                  name="paymentAmount"
                  value={form.paymentAmount}
                  onChange={handleChange}
                  readOnly={form.isSplitPayment || form.isLoanRepayment}
                  required
                  className={`w-full border border-slate-300 rounded px-3 py-2 text-sm font-bold text-blue-700 focus:border-indigo-500 outline-none ${(form.isSplitPayment || form.isLoanRepayment) ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                  <option value="">Select Mode</option>
                  {paymentModesList.map((pm, i) => <option key={i} value={pm}>{pm}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Paid From Account *</label>
                <select name="paidFromAccount" value={form.paidFromAccount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                  <option value="">Select Account</option>
                  {depositAccountsList.map((acc, i) => <option key={i} value={acc}>{acc}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref.</label>
                <input type="text" name="transactionRef" value={form.transactionRef} onChange={handleChange} placeholder="UTR / Cheque No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                <input type="text" name="remarks" value={form.remarks} onChange={handleChange} placeholder="Add any notes here..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
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
                        <input type="number" min="0" max={inv.dueAmount} value={inv.adjustAmount} onChange={(e) => handleAdjustmentChange(inv.id, e.target.value)} className="w-32 border border-slate-300 rounded px-2 py-1.5 text-sm font-bold text-indigo-700 focus:border-indigo-500 outline-none bg-white text-right ml-auto" />
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
                <span className="text-blue-600">₹{totals.adjusted.toFixed(2)}</span>
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

export default NewPayment;
