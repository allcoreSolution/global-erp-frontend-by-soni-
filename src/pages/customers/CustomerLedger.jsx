import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Plus, Search, Eye, Filter, RefreshCw, FileText, Download,
  Printer, X, CheckCircle, Clock, AlertTriangle, Building, Phone, Mail,
  MapPin, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Tag,
  ShieldCheck, ChevronRight, User, ExternalLink, Calendar, Receipt, Landmark,
  Boxes, FileSpreadsheet, AlertCircle, ArrowLeft, ShoppingCart, ShoppingBag,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api';

// WhatsApp Brand SVG Icon
const WhatsAppIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// Convert number to Indian currency words
const numberToWords = (num) => {
  const n = Math.floor(Math.abs(Number(num) || 0));
  if (n === 0) return 'Zero Rupees Only';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (val) => {
    if ((val = val.toString()).length > 9) return 'Amount Exceeds Crores';
    const match = ('000000000' + val).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!match) return '';
    let str = '';
    str += (match[1] != 0) ? (a[Number(match[1])] || `${b[match[1][0]]} ${a[match[1][1]]}`) + 'Crore ' : '';
    str += (match[2] != 0) ? (a[Number(match[2])] || `${b[match[2][0]]} ${a[match[2][1]]}`) + 'Lakh ' : '';
    str += (match[3] != 0) ? (a[Number(match[3])] || `${b[match[3][0]]} ${a[match[3][1]]}`) + 'Thousand ' : '';
    str += (match[4] != 0) ? (a[Number(match[4])] || `${b[match[4][0]]} ${a[match[4][1]]}`) + 'Hundred ' : '';
    str += (match[5] != 0) ? ((str !== '') ? 'and ' : '') + (a[Number(match[5])] || `${b[match[5][0]]}`) : '';
    return str.trim();
  };

  return `${inWords(n)} Rupees Only`;
};

// Dedicated Full Page Component for Customer Ledger & Profile
const CustomerLedgerDetailPage = ({
  customerDetails,
  detailsLoading,
  activeTab,
  setActiveTab,
  invoiceStatusFilter,
  setInvoiceStatusFilter,
  filteredInvoices,
  handleBackToLedger,
  fetchCustomerDetails,
  activeCustomerId,
  handleSendInvoiceWhatsApp,
  handleSendCustomerStatementWhatsApp,
  handleViewInvoice,
  navigate,
  showInvoiceModal,
  setShowInvoiceModal,
  selectedInvoice
}) => {
  const customer = customerDetails?.customer || {};
  const summary = customerDetails?.summary || {};

  // Invoice Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    receiptType: 'Bank', // 'Bank' or 'Cash'
    paymentMethod: 'UPI',
    bankAccount: 'Business Bank Account',
    receiptDate: new Date().toISOString().slice(0, 10),
    transactionRef: '',
    remarks: ''
  });

  // Official Receipt Slip Voucher Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const handleOpenPaymentModal = (inv = null) => {
    setPaymentModalInvoice(inv);
    let defaultAmount = '';
    if (inv) {
      const grandTotal = Number(inv.grandTotal) || 0;
      const amountPaid = Number(inv.amountPaid) || 0;
      const returnedAmount = Number(inv.returnedAmount) || 0;
      const due = inv.balanceDue !== undefined ? Number(inv.balanceDue) : Math.max(0, grandTotal - amountPaid - returnedAmount);
      defaultAmount = due > 0 ? due : '';
    } else {
      const net = customerDetails?.summary?.netBalance || 0;
      defaultAmount = net > 0 ? net : '';
    }

    setPaymentForm({
      amount: defaultAmount,
      receiptType: 'Bank',
      paymentMethod: 'UPI',
      bankAccount: 'Business Bank Account',
      receiptDate: new Date().toISOString().slice(0, 10),
      transactionRef: '',
      remarks: inv ? `Payment received against Invoice #${inv.invoiceNo}` : 'Direct on-account customer collection'
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    const payAmt = Number(paymentForm.amount);
    const inv = paymentModalInvoice;
    const cust = customerDetails?.customer || {};
    const isBank = paymentForm.receiptType === 'Bank';
    const genReceiptNo = isBank ? `BRCP-${Date.now().toString().slice(-6)}` : `RCP-${Date.now().toString().slice(-6)}`;

    try {
      setPaymentSubmitting(true);
      let res;

      if (isBank) {
        const payload = {
          receiptNo: genReceiptNo,
          receiptDate: paymentForm.receiptDate,
          customerParty: cust.name || cust.businessName || '',
          contactNumber: cust.phone || '',
          amount: payAmt,
          paymentAmount: payAmt,
          method: paymentForm.paymentMethod || 'UPI',
          bankName: paymentForm.bankAccount || 'Business Bank Account',
          utrNo: paymentForm.transactionRef || '',
          chequeNo: paymentForm.transactionRef || '',
          referenceNumber: paymentForm.transactionRef || '',
          remarks: paymentForm.remarks || (inv ? `Bank Receipt against Invoice #${inv.invoiceNo}` : 'On-Account Collection')
        };

        if (inv) {
          payload.invoiceNo = inv.invoiceNo;
          payload.saleId = inv._id;
          payload.invoices = [{
            invoiceNo: inv.invoiceNo,
            invoiceAmount: Number(inv.grandTotal || 0),
            dueAmount: Number(inv.balanceDue || inv.grandTotal || 0),
            adjustAmount: payAmt
          }];
        }

        res = await api.post('/bank-receipts', payload);
      } else {
        const payload = {
          receiptNo: genReceiptNo,
          receiptDate: paymentForm.receiptDate,
          receiptType: 'Customer',
          customerParty: cust.name || cust.businessName || '',
          contactNumber: cust.phone || '',
          paymentAmount: payAmt,
          cashAmount: payAmt,
          amount: payAmt,
          paymentMethod: 'Cash',
          remarks: paymentForm.remarks || (inv ? `Cash Receipt against Invoice #${inv.invoiceNo}` : 'On-Account Cash Collection')
        };

        if (inv) {
          payload.referenceInvoice = inv.invoiceNo;
          payload.saleId = inv._id;
          payload.invoices = [{
            invoiceNo: inv.invoiceNo,
            invoiceAmount: Number(inv.grandTotal || 0),
            dueAmount: Number(inv.balanceDue || inv.grandTotal || 0),
            adjustAmount: payAmt
          }];
        }

        res = await api.post('/receipts', payload);
      }

      toast.success(`Receipt of ₹${payAmt.toLocaleString('en-IN')} recorded successfully!`);
      setShowPaymentModal(false);

      // Prepare voucher slip modal for instant view, print & WhatsApp
      const createdData = res?.data?.data || {};
      const receiptSlip = {
        ...createdData,
        source: isBank ? 'Bank Receipt' : 'Cash Receipt',
        receiptNo: createdData.receiptNo || genReceiptNo,
        receiptDate: paymentForm.receiptDate,
        paymentMethod: isBank ? (paymentForm.paymentMethod || 'Bank') : 'Cash',
        paymentAmount: payAmt,
        amount: payAmt,
        transactionRef: paymentForm.transactionRef || '—',
        bankName: isBank ? paymentForm.bankAccount : 'Cash Counter',
        remarks: paymentForm.remarks,
        customerParty: cust.name || cust.businessName,
        customer: cust,
        invoiceNo: inv ? inv.invoiceNo : 'Direct / On-Account',
        status: 'Success'
      };

      setSelectedReceipt(receiptSlip);
      setShowReceiptModal(true);

      if (typeof fetchCustomerDetails === 'function') {
        await fetchCustomerDetails(activeCustomerId);
      }
    } catch (err) {
      console.error('Error recording payment:', err);
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // WhatsApp share for Customer Receipt Voucher
  const handleSendReceiptWhatsApp = (receipt) => {
    const cust = customerDetails?.customer || receipt?.customer || {};
    let rawPhone = cust?.phone || '';
    let digits = String(rawPhone).replace(/\D/g, '');
    if (digits.length === 10) digits = '91' + digits;
    else if (digits.length === 11 && digits.startsWith('0')) digits = '91' + digits.substring(1);

    if (!digits) {
      const prompted = window.prompt(`Customer (${cust.name || 'Customer'}) phone number is missing.\nPlease enter 10-digit WhatsApp phone number:`, '');
      if (prompted) {
        digits = String(prompted).replace(/\D/g, '');
        if (digits.length === 10) digits = '91' + digits;
      }
    }

    const rNo = receipt.receiptNo || receipt._id || 'RCP-N/A';
    const rDate = receipt.receiptDate || new Date().toISOString().slice(0, 10);
    const rAmt = Number(receipt.paymentAmount || receipt.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const rMode = receipt.paymentMethod || receipt.method || 'Cash';
    const invNo = receipt.invoiceNo || (receipt.invoices && receipt.invoices[0]?.invoiceNo) || 'Direct / On-Account';
    const refNo = receipt.transactionRef || receipt.utrNo || receipt.chequeNo || '—';

    const msg =
`🧾 *OFFICIAL PAYMENT RECEIPT ACKNOWLEDGEMENT*
━━━━━━━━━━━━━━━━━━━━
🏢 *From:* Global ERP Services
👤 *Received From:* ${cust.name || cust.businessName || 'Valued Customer'}
📱 *Phone:* ${rawPhone || 'N/A'}
🏛 *GSTIN:* ${cust.gstin || 'Unregistered'}
━━━━━━━━━━━━━━━━━━━━
📄 *RECEIPT DETAILS:*
• *Receipt No:* #${rNo}
• *Date:* ${rDate}
• *Payment Mode:* ${rMode}
• *Channel / Source:* ${receipt.source || 'Receipt Voucher'}
• *Ref / UTR / Cheque:* ${refNo}
• *Settled Against:* #${invNo}
━━━━━━━━━━━━━━━━━━━━
💰 *AMOUNT RECEIVED:*
*₹${rAmt}*
_(${numberToWords(receipt.paymentAmount || receipt.amount || 0)})_
━━━━━━━━━━━━━━━━━━━━
📝 *Remarks:* ${receipt.remarks || 'Payment received with thanks & credited to customer ledger account.'}
━━━━━━━━━━━━━━━━━━━━
_Thank you for your business & prompt payment!_`;

    const encoded = encodeURIComponent(msg);
    const waUrl = digits ? `https://wa.me/${digits}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
    toast.success('WhatsApp receipt slip opened successfully!');
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* 1. TOP BREADCRUMB & BACK ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToLedger}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95 group cursor-pointer"
          >
            <ArrowLeft size={16} className="text-slate-500 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Customer Ledger</span>
          </button>
          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2 font-medium">
            <span>Sales & CRM</span>
            <ChevronRight size={13} />
            <span className="hover:text-indigo-600 cursor-pointer" onClick={handleBackToLedger}>Customer Ledger</span>
            <ChevronRight size={13} />
            <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-md">
              {customer?.name || customer?.businessName || 'Customer Profile'}
            </span>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => fetchCustomerDetails(activeCustomerId)}
            disabled={detailsLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={detailsLoading ? 'animate-spin text-emerald-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleSendCustomerStatementWhatsApp()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 dark:shadow-none transition-all active:scale-95 cursor-pointer"
            title="Send Due Statement Slip on WhatsApp"
          >
            <WhatsAppIcon size={16} />
            <span>
              {(summary?.netBalance || 0) > 0
                ? `WhatsApp Due Slip (₹${(summary.netBalance || 0).toLocaleString('en-IN')})`
                : 'WhatsApp Statement'}
            </span>
          </button>

          <button
            onClick={() => navigate(`/sales/add-sale?customerId=${customer?._id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 dark:shadow-none transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Sale Invoice</span>
          </button>
        </div>
      </div>

      {detailsLoading && !customerDetails ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-16 text-center text-slate-400">
          <RefreshCw size={32} className="animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">Loading Customer Ledger Page...</p>
          <p className="text-xs text-slate-400 mt-1">Fetching sales bills, receipts, and statement history.</p>
        </div>
      ) : (
        <>
          {/* 2. Clean Customer Profile Header (No heavy background & Compact Text) */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-3.5 text-slate-800 dark:text-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {(customer?.name || 'CU').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      {customer?.name || customer?.businessName || 'Customer Name'}
                    </h1>
                    <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-semibold">
                      {customer?.customerCode || 'CUST-CODE'}
                    </span>
                    {customer?.type && (
                      <span className="text-[10px] bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-medium">
                        {customer.type}
                      </span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {customer?.status !== false ? '● Active Customer' : 'Inactive'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-3.5">
                    {customer?.businessName && customer.businessName !== customer.name && (
                      <span className="flex items-center gap-1">
                        <Building size={12} className="text-slate-400" />
                        <span className="text-slate-400">Firm:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{customer.businessName}</strong>
                      </span>
                    )}
                    {customer?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        <span className="text-slate-400">Phone:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{customer.phone}</strong>
                      </span>
                    )}
                    {customer?.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        <span className="text-slate-400">Email:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{customer.email}</strong>
                      </span>
                    )}
                    {customer?.gstin && (
                      <span className="flex items-center gap-1 font-mono">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span className="text-slate-400">GSTIN:</span>
                        <strong className="text-emerald-700 dark:text-emerald-400">{customer.gstin}</strong>
                      </span>
                    )}
                    {customer?.pan && (
                      <span className="flex items-center gap-1 font-mono">
                        <span className="text-slate-400">PAN:</span>
                        <strong className="text-slate-700 dark:text-slate-200">{customer.pan}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Top KPI Metric Cards for Customer (Compact Font Sizes) */}
          {summary && (
            <div className={`grid grid-cols-2 sm:grid-cols-2 ${(summary.totalReturns || 0) > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-2.5 mb-3.5`}>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Sale Invoices</span>
                  <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Receipt size={13} />
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">{summary.totalInvoices || 0} Bills</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">All recorded sales bills</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Billed (Sales)</span>
                  <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Boxes size={13} />
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="text-sm sm:text-base font-bold text-purple-700 dark:text-purple-400">₹{(summary.totalSold || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div className="text-[9px] text-purple-600 dark:text-purple-400 mt-0.5">Gross sales billing volume</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Collected</span>
                  <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle size={13} />
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">₹{(summary.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5">Total receipts & payments received</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
              </div>

              {(summary.totalReturns || 0) > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 sm:p-3 border border-amber-200 dark:border-amber-900/60 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Returns / Credits</span>
                    <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <RotateCcw size={13} />
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <div className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400">-₹{(summary.totalReturns || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5">{customerDetails?.returns?.length || 1} return slip(s) credit</div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 sm:p-3 border border-rose-200 dark:border-rose-900/60 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">Balance Receivable Due</span>
                  <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                    <DollarSign size={13} />
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className={`text-sm sm:text-base font-bold ${summary.netBalance > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    ₹{(summary.netBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-rose-700 dark:text-rose-400 font-semibold mt-0.5 flex items-center gap-1">
                    {summary.netBalance > 0 ? (
                      <><AlertTriangle size={11} /> Net Due (Billed − Paid − Returns)</>
                    ) : (
                      'Fully Settled (₹0 Due)'
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-500" />
              </div>
            </div>
          )}

          {/* 4. Tab Navigation Bar */}
          {/* 4. Tab Navigation Bar (Compact Text) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4">
            <div className="px-3 pt-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-4 text-[11px] font-semibold whitespace-nowrap">
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`pb-2 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'invoices'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Receipt size={13} />
                  <span>All Sales Invoices ({customerDetails?.sales?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-2 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Building size={13} />
                  <span>Customer Profile & Legal Details</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-2 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'history'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Clock size={13} />
                  <span>Receipts & Returns History</span>
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-3.5 sm:p-4 bg-slate-50/40 dark:bg-slate-900/60">
              {/* TAB 1: ALL INVOICES */}
              {activeTab === 'invoices' && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      {['All', 'Completed', 'Due', 'Paid', 'Cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setInvoiceStatusFilter(st)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                            invoiceStatusFilter === st
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {st === 'All' ? `All Bills (${customerDetails?.sales?.length || 0})` : st}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendCustomerStatementWhatsApp(customer, summary, customerDetails?.sales, false)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-sm transition-all active:scale-95 cursor-pointer"
                        title="Send All Due Invoices & Statement together on WhatsApp"
                      >
                        <WhatsAppIcon size={12} />
                        <span>Send All Invoices Slip (सारा एक साथ)</span>
                      </button>

                      <span className="text-[10px] text-slate-400 font-medium">
                        Showing {filteredInvoices.length} bill(s)
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto relative">
                    <table className="w-full min-w-[1100px] text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                          <th className="py-2 px-3">Invoice No</th>
                          <th className="py-2 px-3">Sale Date</th>
                          <th className="py-2 px-3">Mode</th>
                          <th className="py-2 px-3 text-center">Items</th>
                          <th className="py-2 px-3 text-right">Grand Total</th>
                          <th className="py-2 px-3 text-right">Paid Amount</th>
                          <th className="py-2 px-3 text-right">Return / Credit</th>
                          <th className="py-2 px-3 text-right">Balance Due</th>
                          <th className="py-2 px-3 text-center">Status</th>
                          <th className="py-2 px-3 text-center sticky right-0 bg-slate-50 dark:bg-slate-800 z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] min-w-[200px]">Action / Slip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                        {filteredInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-10 text-center text-slate-400">
                              <Receipt size={32} className="mx-auto mb-1.5 text-slate-300 dark:text-slate-600" />
                              <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">No invoices match this filter</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Click '+ Create Sale Invoice' to record a new sale for this customer.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredInvoices.map((inv) => {
                            const grandTotal = Number(inv.grandTotal) || 0;
                            const amountPaid = Number(inv.amountPaid) || 0;
                            const returnedAmount = Number(inv.returnedAmount) || 0;
                            const balanceDue = inv.balanceDue !== undefined
                              ? Number(inv.balanceDue)
                              : Math.max(0, grandTotal - amountPaid - returnedAmount);

                            return (
                              <tr key={inv._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                                <td className="py-2 px-3">
                                  <div className="font-bold text-slate-800 dark:text-slate-100 font-mono text-[11px]">
                                    {inv.invoiceNo}
                                  </div>
                                  {inv.referenceNo && (
                                    <div className="text-[9px] text-slate-400">Ref: {inv.referenceNo}</div>
                                  )}
                                </td>

                                <td className="py-2 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap text-[11px]">
                                  {inv.saleDate || (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—')}
                                </td>

                                <td className="py-2 px-3">
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {inv.paymentMode || 'Cash'}
                                  </span>
                                </td>

                                <td className="py-2 px-3 text-center">
                                  <span className="font-bold text-slate-700 dark:text-slate-200 text-[11px]">
                                    {inv.orderItems?.length || 0}
                                  </span>
                                </td>

                                <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-100 text-[11px]">
                                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>

                                <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                                  ₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>

                                <td className="py-2 px-3 text-right font-semibold text-[11px]">
                                  {returnedAmount > 0 ? (
                                    <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/60 inline-block text-[10px]">
                                      -₹{returnedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>

                                <td className="py-2 px-3 text-right font-bold text-[11px]">
                                  {balanceDue > 0 ? (
                                    <div>
                                      <span className="text-rose-600 dark:text-rose-400">
                                        ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </span>
                                      {returnedAmount > 0 && (
                                        <div className="text-[9px] text-slate-400 font-normal">
                                          (₹{(grandTotal - amountPaid).toLocaleString('en-IN')} − ₹{returnedAmount.toLocaleString('en-IN')})
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-emerald-600 dark:text-emerald-400">₹0.00</span>
                                  )}
                                </td>

                                <td className="py-2 px-3 text-center">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      balanceDue === 0 || inv.paymentStatus === 'Paid'
                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                    }`}
                                  >
                                    {balanceDue === 0 || inv.paymentStatus === 'Paid' ? 'Paid' : 'Due'}
                                  </span>
                                </td>

                                <td className="py-2 px-3 text-center sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-850 transition-colors z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] min-w-[200px]">
                                  <div className="flex items-center justify-center gap-1 flex-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => handleViewInvoice(inv)}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                                      title="View Full Invoice Breakdown & Items"
                                    >
                                      <Eye size={11} />
                                      <span>View</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenPaymentModal(inv)}
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded font-bold text-[10px] transition-all active:scale-95 shadow-sm cursor-pointer ${
                                        balanceDue > 0
                                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
                                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
                                      }`}
                                      title={balanceDue > 0 ? `Record Payment / Receipt for Invoice #${inv.invoiceNo} (Due: ₹${balanceDue.toLocaleString('en-IN')})` : `Invoice #${inv.invoiceNo} is fully settled`}
                                    >
                                      <CreditCard size={11} />
                                      <span>{balanceDue > 0 ? 'Payment' : 'Paid'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSendInvoiceWhatsApp(inv, customer)}
                                      className={`inline-flex items-center gap-1 px-2 py-1 rounded font-bold text-[10px] transition-all active:scale-95 shadow-sm cursor-pointer ${
                                        balanceDue > 0
                                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'
                                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                      }`}
                                      title={balanceDue > 0 ? `Send Unpaid Invoice Slip #${inv.invoiceNo} on WhatsApp (Due: ₹${balanceDue.toLocaleString('en-IN')})` : `Share Invoice Slip #${inv.invoiceNo} on WhatsApp`}
                                    >
                                      <WhatsAppIcon size={11} />
                                      <span>{balanceDue > 0 ? 'Send Slip' : 'WhatsApp'}</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>

                      {filteredInvoices.length > 0 && (
                        <tfoot className="bg-slate-50/90 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 text-[11px] font-bold">
                          <tr>
                            <td colSpan={4} className="py-2.5 px-3 text-slate-700 dark:text-slate-200">
                              Total Summary ({filteredInvoices.length} Bills)
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-900 dark:text-slate-100 font-black">
                              ₹{filteredInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-black">
                              ₹{filteredInvoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400 font-black">
                              {filteredInvoices.reduce((sum, inv) => sum + (Number(inv.returnedAmount) || 0), 0) > 0
                                ? `-₹${filteredInvoices.reduce((sum, inv) => sum + (Number(inv.returnedAmount) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-black">
                              ₹{filteredInvoices.reduce((sum, inv) => {
                                const gTot = Number(inv.grandTotal) || 0;
                                const pd = Number(inv.amountPaid) || 0;
                                const ret = Number(inv.returnedAmount) || 0;
                                return sum + (inv.balanceDue !== undefined ? Number(inv.balanceDue) : Math.max(0, gTot - pd - ret));
                              }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-400">
                              —
                            </td>
                            <td className="py-2.5 px-3 text-center sticky right-0 bg-slate-50 dark:bg-slate-800 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] min-w-[200px] text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              Net Outstanding
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE & LEGAL DETAILS */}
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Financial & Credit Overview */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <CreditCard size={16} className="text-emerald-600" />
                      Credit & Financial Terms
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">Credit Limit:</span>
                        <strong className="text-slate-800 dark:text-slate-200">₹ {(customer.creditLimit || 0).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">Credit Period:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{customer.creditPeriod || 0} Days</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">Opening Balance:</span>
                        <strong className="text-slate-800 dark:text-slate-200">₹ {(customer.openingBalance || 0).toLocaleString()} ({customer.balanceType || 'Dr'})</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">Current Outstanding:</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-bold">₹ {(summary.netBalance || 0).toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Tax & Registration Details */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      Tax & Legal Registrations
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">GSTIN:</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200">{customer.gstin || 'Unregistered'}</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">PAN Number:</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200">{customer.pan || 'Not Provided'}</strong>
                      </div>
                      {customer.drugLicenceNo && (
                        <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                          <span className="text-slate-500">Drug License:</span>
                          <strong className="text-slate-800 dark:text-slate-200">{customer.drugLicenceNo} (Valid: {customer.drugLicenceValidity || 'N/A'})</strong>
                        </div>
                      )}
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">Bank Details:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{customer.bankName ? `${customer.bankName} - ${customer.bankAccount || ''}` : 'Not Provided'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 md:col-span-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <MapPin size={16} className="text-emerald-600" />
                      Billing & Shipping Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Billing Address:</span>
                        <p className="text-slate-600 dark:text-slate-400">
                          {customer.billingAddress?.street || customer.billingAddress?.city || customer.billingAddress?.state ? (
                            `${customer.billingAddress.street || ''}, ${customer.billingAddress.city || ''}, ${customer.billingAddress.state || ''} ${customer.billingAddress.zip || ''}`
                          ) : (
                            'No billing address recorded.'
                          )}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Shipping Address:</span>
                        <p className="text-slate-600 dark:text-slate-400">
                          {customer.shippingAddress?.street || customer.shippingAddress?.city || customer.shippingAddress?.state ? (
                            `${customer.shippingAddress.street || ''}, ${customer.shippingAddress.city || ''}, ${customer.shippingAddress.state || ''} ${customer.shippingAddress.zip || ''}`
                          ) : (
                            'Same as billing address.'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RECEIPTS & HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  {/* Receipts History */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle size={15} className="text-emerald-600" />
                        Receipts / Payments Received History ({customerDetails?.receipts?.length || 0})
                      </h4>
                    </div>
                    <div className="overflow-x-auto relative">
                      <table className="w-full min-w-[850px] text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
                            <th className="p-3">Receipt No</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Method</th>
                            <th className="p-3">Account / Ref</th>
                            <th className="p-3 text-right">Amount Received (₹)</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-center sticky right-0 bg-slate-50 dark:bg-slate-800 z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] min-w-[130px]">Receipt Slip</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                          {(!customerDetails?.receipts || customerDetails.receipts.length === 0) ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400">
                                No separate receipts recorded for this customer yet.
                              </td>
                            </tr>
                          ) : (
                            customerDetails.receipts.map((r) => (
                              <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                                <td className="p-3 font-mono font-bold text-emerald-600">{r.receiptNo || 'REC'}</td>
                                <td className="p-3">{r.receiptDate || (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—')}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {r.paymentMethod || 'Cash'}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-500 font-mono">{r.transactionRef || r.account || '—'}</td>
                                <td className="p-3 text-right font-bold text-emerald-600">
                                  ₹{(Number(r.paymentAmount || r.totals?.received || r.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-3 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                                    {r.status || 'Received'}
                                  </span>
                                </td>
                                <td className="p-3 text-center sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] min-w-[130px]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedReceipt(r);
                                      setShowReceiptModal(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shadow-sm active:scale-95"
                                    title="View & Print Official Receipt Slip"
                                  >
                                    <Printer size={12} />
                                    <span>Receipt Slip</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sales Return History */}
                  {customerDetails?.returns && customerDetails.returns.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                          <RotateCcw size={15} className="text-amber-600" />
                          Sales Returns ({customerDetails.returns.length})
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
                              <th className="p-3">Return No</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">Invoice Ref</th>
                              <th className="p-3">Reason</th>
                              <th className="p-3 text-right">Refund Amount (₹)</th>
                              <th className="p-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            {customerDetails.returns.map((ret) => (
                              <tr key={ret._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="p-3 font-mono font-bold text-amber-600">{ret.returnNumber || ret.returnNo}</td>
                                <td className="p-3">{ret.returnDate || ret.date}</td>
                                <td className="p-3">{ret.invoiceNumber || ret.invoiceNo || '—'}</td>
                                <td className="p-3 text-slate-500">{ret.reason || ret.returnReason || 'Approved sales return'}</td>
                                <td className="p-3 text-right font-bold text-amber-600">
                                  ₹{(Number(ret.totalRefundAmount || ret.totalAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="p-3 text-center">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                                    {ret.status || 'Approved'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          EXPANDED ITEM-LEVEL SALE INVOICE BREAKDOWN MODAL (max-w-4xl)
      ───────────────────────────────────────────────────────────── */}
      {showInvoiceModal && selectedInvoice && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setShowInvoiceModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Sales Tax Invoice Breakdown
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  Invoice #{selectedInvoice.invoiceNo}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recorded Date: {selectedInvoice.saleDate || (selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : '—')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSendInvoiceWhatsApp(selectedInvoice, customer)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Share this Invoice Slip on WhatsApp"
                >
                  <WhatsAppIcon size={14} />
                  <span>WhatsApp Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Printer size={14} /> Print Bill
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* 4-Column Overview Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{customer?.name || customer?.businessName || 'Valued Customer'}</span>
                {customer?.phone && <span className="block text-slate-500 text-[11px]">Phone: {customer.phone}</span>}
                {customer?.gstin && <span className="block font-mono text-emerald-600 text-[10px]">GSTIN: {customer.gstin}</span>}
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Billing Date & Mode</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {selectedInvoice.saleDate || (selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString() : '—')}
                </span>
                <span className="block text-slate-500 mt-0.5">Mode: <strong className="text-slate-700 dark:text-slate-300">{selectedInvoice.paymentMode || 'Cash'}</strong></span>
                {selectedInvoice.referenceNo && (
                  <span className="block text-[10px] text-slate-400 font-mono">Ref: {selectedInvoice.referenceNo}</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Warehouse / Branch</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedInvoice.warehouse?.name || (typeof selectedInvoice.warehouse === 'string' ? selectedInvoice.warehouse : 'General Branch')}
                </span>
                <span className="block text-slate-500 text-[11px] mt-0.5">
                  Items Count: <strong>{selectedInvoice.orderItems?.length || 0} Products</strong>
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Status</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black mt-1 ${
                  selectedInvoice.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                }`}>
                  {selectedInvoice.paymentStatus || 'Due'}
                </span>
                {Number(selectedInvoice.returnedAmount || 0) > 0 && (
                  <span className="block text-amber-600 text-[10px] font-semibold mt-1">
                    Return Credit: ₹{Number(selectedInvoice.returnedAmount).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Itemized Order Products Table (us invoice per kya kya liya hai) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Boxes size={14} className="text-emerald-600" />
                  <span>Purchased Items on this Invoice (सामान का पूरा विवरण)</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  Total Items: {selectedInvoice.orderItems?.length || 0}
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Item Name & Code</th>
                      <th className="py-2.5 px-3">Batch</th>
                      <th className="py-2.5 px-3 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                      <th className="py-2.5 px-3 text-center">Tax %</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                      <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {(selectedInvoice.orderItems && selectedInvoice.orderItems.length > 0) ? (
                      selectedInvoice.orderItems.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800 dark:text-slate-100">
                              {it.name || it.product?.productName || 'Product'}
                            </div>
                            {(it.code || it.product?.productCode) && (
                              <div className="text-[10px] font-mono text-slate-400">
                                {it.code || it.product?.productCode}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {it.batch || it.batchNumber || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-100">
                            {it.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium">
                            ₹{Number(it.netUnitPrice || it.productPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">
                            {it.taxPercent || 0}%
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                            ₹{Number(it.discount || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                            ₹{Number(it.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          No item rows recorded on this bill document.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Totals & Net Due Calculation Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex flex-col items-end space-y-1.5">
                <div className="flex justify-between w-full sm:w-80 text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    ₹{Number(selectedInvoice.subTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {Number(selectedInvoice.discountTotal || 0) > 0 && (
                  <div className="flex justify-between w-full sm:w-80 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount:</span>
                    <span>-₹{Number(selectedInvoice.discountTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {Number(selectedInvoice.taxTotal || 0) > 0 && (
                  <div className="flex justify-between w-full sm:w-80 text-slate-600 dark:text-slate-400">
                    <span>Tax Amount:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      ₹{Number(selectedInvoice.taxTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between w-full sm:w-80 font-black text-sm text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-700 pt-1.5">
                  <span>Grand Total (Billed):</span>
                  <span>₹{Number(selectedInvoice.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between w-full sm:w-80 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  <span>Amount Paid / Received:</span>
                  <span>₹{Number(selectedInvoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(selectedInvoice.returnedAmount || 0) > 0 && (
                  <div className="flex justify-between w-full sm:w-80 font-bold text-xs text-amber-600 dark:text-amber-400">
                    <span>Sales Return Credit:</span>
                    <span>-₹{Number(selectedInvoice.returnedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between w-full sm:w-80 font-black text-sm text-rose-600 dark:text-rose-400 border-t border-dashed border-slate-300 dark:border-slate-700 pt-1.5">
                  <span>Net Balance Due:</span>
                  <span>
                    ₹{(selectedInvoice.balanceDue !== undefined
                      ? Number(selectedInvoice.balanceDue)
                      : Math.max(0, (Number(selectedInvoice.grandTotal || 0) - Number(selectedInvoice.amountPaid || 0) - Number(selectedInvoice.returnedAmount || 0)))
                    ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap gap-2 justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  handleSendCustomerStatementWhatsApp(customer, summary, customerDetails?.sales, false);
                  setShowInvoiceModal(false);
                }}
                className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Send All Invoices & Due Breakdown together on WhatsApp"
              >
                <WhatsAppIcon size={14} />
                <span>Send All Invoices Slip (सारा एक साथ)</span>
              </button>

              <div className="flex gap-2 items-center flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setShowInvoiceModal(false);
                    handleOpenPaymentModal(selectedInvoice);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-200 dark:shadow-none transition-all cursor-pointer"
                  title="Record Payment / Receipt for this Invoice"
                >
                  <CreditCard size={15} /> Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSendInvoiceWhatsApp(selectedInvoice, customer);
                    setShowInvoiceModal(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 dark:shadow-none transition-all cursor-pointer"
                  title="Send This Single Invoice Slip on WhatsApp"
                >
                  <WhatsAppIcon size={15} /> WhatsApp Bill Slip
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          INVOICE PAYMENT / RECEIPT RECORDING MODAL
      ───────────────────────────────────────────────────────────── */}
      {showPaymentModal && paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in no-print">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Record Invoice Payment</h3>
                  <p className="text-xs text-indigo-200">
                    Invoice #{paymentModalInvoice.invoiceNo} • {customer.name || customer.businessName || 'Customer'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Invoice Overview Pill */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Bill</span>
                <strong className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                  ₹{Number(paymentModalInvoice.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Paid So Far</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                  ₹{Number(paymentModalInvoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Balance Due</span>
                <strong className="text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-black">
                  ₹{(paymentModalInvoice.balanceDue !== undefined ? Number(paymentModalInvoice.balanceDue) : Math.max(0, Number(paymentModalInvoice.grandTotal || 0) - Number(paymentModalInvoice.amountPaid || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePaymentSubmit} className="p-5 space-y-4">
              {/* Mode Selector: Bank vs Cash */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Receipt Type / Mode *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentForm(prev => ({ ...prev, receiptType: 'Bank', paymentMethod: 'UPI' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentForm.receiptType === 'Bank'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Landmark size={15} />
                    <span>Bank Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentForm(prev => ({ ...prev, receiptType: 'Cash', paymentMethod: 'Cash' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentForm.receiptType === 'Cash'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-none'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <DollarSign size={15} />
                    <span>Cash Receipt</span>
                  </button>
                </div>
              </div>

              {/* Amount & Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Amount to Receive (₹) *
                    </label>
                    {paymentModalInvoice.balanceDue > 0 && (
                      <button
                        type="button"
                        onClick={() => setPaymentForm(prev => ({ ...prev, amount: paymentModalInvoice.balanceDue }))}
                        className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
                      >
                        Full Due (₹{Number(paymentModalInvoice.balanceDue).toLocaleString('en-IN')})
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Receipt Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.receiptDate}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, receiptDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Bank Specific Details */}
              {paymentForm.receiptType === 'Bank' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Channel
                    </label>
                    <select
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Bank Transfer">Bank Transfer / IMPS</option>
                      <option value="NEFT">NEFT / RTGS</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      UTR / Ref / Cheque No.
                    </label>
                    <input
                      type="text"
                      value={paymentForm.transactionRef}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionRef: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. UPI-12345678 / CHQ-1001"
                    />
                  </div>
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Narration / Remarks
                </label>
                <input
                  type="text"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Remarks or receipt note..."
                />
              </div>

              {/* Submit Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentSubmitting}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {paymentSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Recording Receipt...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      <span>Record Receipt (रसीद बनाएं)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          OFFICIAL PRINTABLE CUSTOMER RECEIPT VOUCHER MODAL
      ───────────────────────────────────────────────────────────── */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-8 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
            
            {/* Modal Controls Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                  <CheckCircle size={13} /> Official Customer Receipt Voucher
                </span>
                <span className="font-mono text-xs text-slate-400">
                  #{selectedReceipt.receiptNo || selectedReceipt._id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* PRINTABLE RECEIPT CONTENT */}
            <div id="printable-customer-receipt" className="border-2 border-slate-800 dark:border-slate-700 rounded-2xl p-6 sm:p-8 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-800 dark:border-slate-700 pb-5 mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                    GLOBAL ERP SERVICES
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
                    Official Customer Collection & Payment Receipt Voucher
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    GSTIN: 07AAAAA0000A1Z5 • Email: accounts@globalerp.com
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-slate-900 text-white font-mono font-black text-xs px-3 py-1.5 rounded-lg mb-1.5 uppercase tracking-wider">
                    RECEIPT VOUCHER
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold">Receipt No: </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      #{selectedReceipt.receiptNo || selectedReceipt._id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold">Date: </span>
                    <span>{selectedReceipt.receiptDate || (selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString() : new Date().toISOString().slice(0, 10))}</span>
                  </div>
                </div>
              </div>

              {/* Received From & Settlement Channel Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 mb-5 border-b border-dashed border-slate-200 dark:border-slate-800 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    RECEIVED FROM (CUSTOMER)
                  </span>
                  <div className="font-black text-slate-900 dark:text-slate-100 text-sm">
                    {customer?.name || customer?.businessName || selectedReceipt.customerParty || 'Valued Customer'}
                  </div>
                  {customer?.phone && (
                    <div className="text-slate-600 dark:text-slate-400 mt-0.5">Phone: {customer.phone}</div>
                  )}
                  {customer?.email && (
                    <div className="text-slate-600 dark:text-slate-400">Email: {customer.email}</div>
                  )}
                  <div className="text-slate-500 mt-0.5 font-mono">
                    GSTIN: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{customer?.gstin || 'Unregistered'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    SETTLEMENT & PAYMENT DETAILS
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Mode:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedReceipt.paymentMethod || selectedReceipt.method || 'Cash'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Channel / Type:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedReceipt.source || 'Customer Receipt'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Settled Against:</span>
                      <strong className="font-mono text-slate-800 dark:text-slate-200">
                        {selectedReceipt.invoiceNo || (selectedReceipt.invoices && selectedReceipt.invoices[0]?.invoiceNo) || 'Direct / On-Account'}
                      </strong>
                    </div>
                    {(selectedReceipt.transactionRef || selectedReceipt.utrNo || selectedReceipt.chequeNo) && (
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Ref / UTR / Cheque:</span>
                        <strong className="text-slate-700 dark:text-slate-300">{selectedReceipt.transactionRef || selectedReceipt.utrNo || selectedReceipt.chequeNo}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Highlight Box */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 sm:p-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 block">
                    AMOUNT RECEIVED & CREDITED
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
                    ₹{Number(selectedReceipt.paymentAmount || selectedReceipt.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium italic mt-0.5">
                    ({numberToWords(selectedReceipt.paymentAmount || selectedReceipt.amount || 0)})
                  </div>
                </div>
                <div className="text-right sm:self-center">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-sm">
                    {selectedReceipt.status || 'Received & Settled'}
                  </span>
                </div>
              </div>

              {/* Remarks */}
              {selectedReceipt.remarks && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 mb-6">
                  <strong className="text-slate-700 dark:text-slate-300">Remarks / Narration: </strong>
                  {selectedReceipt.remarks}
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="text-center pt-8 border-t border-slate-300 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Customer Signature / Acknowledgement</span>
                </div>
                <div className="text-center pt-8 border-t border-slate-300 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-300">For Global ERP Services (Authorized Signatory)</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                This is a computer-generated official receipt acknowledgement. Thank you for your business!
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-slate-800 mt-6 print:hidden">
              <button
                type="button"
                onClick={() => handleSendReceiptWhatsApp(selectedReceipt)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 dark:shadow-none transition-all active:scale-95 cursor-pointer"
                title="Send Receipt Acknowledgement to Customer on WhatsApp"
              >
                <WhatsAppIcon size={15} />
                <span>Share Receipt on WhatsApp</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Printer size={15} /> Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomerLedger = () => {
  const navigate = useNavigate();
  const { customerId: paramCustomerId } = useParams();
  const [searchParams] = useSearchParams();

  // Active customer id from route params or state
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const activeCustomerId = paramCustomerId || searchParams.get('customerId') || selectedCustomerId;

  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState('all'); // 'all', 'due', 'zero'

  // Selected customer details
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices', 'profile', 'history'
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All'); // 'All', 'Completed', 'Due', 'Paid', 'Cancelled'

  // Selected invoice modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Fetch all customers ledger summary from dynamic backend API
  const fetchLedgerSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers/ledger/summary');
      if (res.data?.success) {
        setCustomers(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customer ledger summary:', error);
      // Fallback: fetch raw customers if summary endpoint has issue
      try {
        const fallbackRes = await api.get('/customers');
        if (fallbackRes.data?.success) {
          setCustomers(fallbackRes.data.data || []);
        }
      } catch (err) {
        toast.error('Failed to load customer ledger data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerSummary();
  }, []);

  // Fetch detailed data when a customer is selected
  const fetchCustomerDetails = async (customerId) => {
    if (!customerId) return;
    setDetailsLoading(true);
    try {
      const res = await api.get(`/customers/${customerId}/ledger`);
      if (res.data?.success) {
        setCustomerDetails(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching customer ledger details:', error);
      toast.error('Failed to load customer detailed history');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (activeCustomerId) {
      fetchCustomerDetails(activeCustomerId);
    }
  }, [activeCustomerId]);

  const handleViewCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    navigate(`/sales/customer-ledger/${customerId}`);
  };

  const handleBackToLedger = () => {
    setSelectedCustomerId(null);
    setCustomerDetails(null);
    navigate('/sales/customer-ledger');
  };

  // Open invoice view modal
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  // Export Customers Summary to CSV
  const handleExportCSV = () => {
    if (!customers.length) {
      toast.info('No customer data available to export');
      return;
    }
    const headers = ['Customer Code', 'Name / Business', 'Contact Person', 'Phone', 'Email', 'GSTIN', 'Total Invoices', 'Total Sales (₹)', 'Total Received (₹)', 'Outstanding Due (₹)', 'Status'];
    const rows = filteredCustomers.map(c => [
      `"${c.customerCode || ''}"`,
      `"${c.name || c.businessName || ''}"`,
      `"${c.contactPerson || c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.gstin || ''}"`,
      c.totalInvoices || 0,
      (c.totalSaleAmount || 0).toFixed(2),
      (c.totalPaid || 0).toFixed(2),
      (c.dueAmount || 0).toFixed(2),
      c.status ? 'Active' : 'Inactive'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Customer_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp phone number sanitizer (adds 91 if 10-digit Indian phone)
  const getCleanPhone = (rawPhone) => {
    if (!rawPhone) return '';
    let digits = String(rawPhone).replace(/\D/g, '');
    if (digits.length === 10) {
      digits = '91' + digits;
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = '91' + digits.substring(1);
    }
    return digits;
  };

  // 1. Send Single Sale Invoice Slip on WhatsApp to Customer
  const handleSendInvoiceWhatsApp = (inv, targetCustomer = null) => {
    const cust = targetCustomer || customerDetails?.customer || {};
    let rawPhone = cust?.phone || inv?.customerMobile || '';
    
    let phone = getCleanPhone(rawPhone);
    if (!phone) {
      const prompted = window.prompt(
        `Customer (${cust.name || 'Customer'}) phone number is missing.\nPlease enter 10-digit WhatsApp phone number:`,
        ''
      );
      if (prompted) {
        phone = getCleanPhone(prompted);
      }
    }

    const customerName = cust?.name || cust?.businessName || 'Valued Customer';
    const invNo = inv.invoiceNo || 'INV-BILL';
    const billDate = inv.saleDate || new Date().toISOString().slice(0, 10);
    const grandTotal = Number(inv.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const paid = Number(inv.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const retAmt = Number(inv.returnedAmount || 0);
    const balanceDue = (inv.balanceDue !== undefined
      ? Number(inv.balanceDue)
      : Math.max(0, (Number(inv.grandTotal || 0) - Number(inv.amountPaid || 0) - retAmt))
    ).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const paymentStatus = inv.paymentStatus || (Number(inv.grandTotal || 0) <= (Number(inv.amountPaid || 0) + retAmt) ? 'PAID' : 'DUE / UNPAID');

    // Build items summary if available
    let itemsText = '';
    if (inv.orderItems && inv.orderItems.length > 0) {
      itemsText = inv.orderItems
        .slice(0, 5)
        .map((it, idx) => `  ${idx + 1}. *${it.name || it.product?.productName || 'Item'}* (Qty: ${it.quantity}) - ₹${(Number(it.netUnitPrice || 0) * Number(it.quantity || 1)).toFixed(2)}`)
        .join('\n');
      if (inv.orderItems.length > 5) {
        itemsText += `\n  ...and ${inv.orderItems.length - 5} more items`;
      }
    }

    const message = 
`🧾 *SALES INVOICE & BILL RECEIPT*
━━━━━━━━━━━━━━━━━━━━
🏢 *From:* Global ERP Services
👤 *To Customer:* ${customerName}
📱 *Contact:* ${rawPhone || phone || 'N/A'}
━━━━━━━━━━━━━━━━━━━━
📄 *Invoice No:* #${invNo}
📅 *Date:* ${billDate}
📌 *Payment Status:* *${paymentStatus.toUpperCase()}*

💰 *Total Bill:* ₹${grandTotal}
💵 *Amount Paid:* ₹${paid}
${retAmt > 0 ? `↩️ *Sales Return / Credit:* -₹${retAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` : ''}🔴 *NET BALANCE OUTSTANDING DUE:* *₹${balanceDue}*
${itemsText ? `\n📦 *Items Summary:*\n${itemsText}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
🏦 *Payment Information:*
Kindly clear any pending balance via UPI / Bank transfer at your earliest convenience.
_Thank you for your business!_`;

    const encoded = encodeURIComponent(message);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
    toast.success('WhatsApp invoice slip opened successfully!');
  };

  // 2. Send Entire Customer Ledger Due Statement / All Invoices on WhatsApp
  const handleSendCustomerStatementWhatsApp = (targetCustomer = null, targetSummary = null, targetSales = null, sendAll = false) => {
    const cust = targetCustomer || customerDetails?.customer || {};
    const summ = targetSummary || customerDetails?.summary || {};
    const bills = targetSales || customerDetails?.sales || [];

    let rawPhone = cust?.phone || '';
    let phone = getCleanPhone(rawPhone);
    if (!phone) {
      const prompted = window.prompt(
        `Customer (${cust.name || 'Customer'}) phone number is missing.\nPlease enter 10-digit WhatsApp phone number:`,
        ''
      );
      if (prompted) {
        phone = getCleanPhone(prompted);
      }
    }

    const customerName = cust?.name || cust?.businessName || 'Valued Customer';
    const totalSold = Number(summ.totalSold || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const totalPaid = Number(summ.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const netBalance = Number(summ.netBalance !== undefined ? summ.netBalance : (cust.dueAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    // Pending bills
    const unpaidBills = bills.filter(b => {
      const due = Math.max(0, (Number(b.grandTotal || 0) - Number(b.amountPaid || 0)));
      return due > 0 || b.paymentStatus === 'Due' || b.paymentStatus === 'Pending' || b.paymentStatus === 'Partial';
    });

    const billsToList = sendAll ? bills : (unpaidBills.length > 0 ? unpaidBills : bills);
    const listTitle = sendAll
      ? `📄 *ALL INVOICES BREAKDOWN (${bills.length} BILLS):*`
      : (unpaidBills.length > 0
          ? `⏳ *PENDING / DUE INVOICES (${unpaidBills.length}):*`
          : `📄 *RECENT INVOICES (${bills.length}):*`);

    let pendingListText = '';
    if (billsToList.length > 0) {
      pendingListText = billsToList
        .slice(0, 15)
        .map((b, idx) => {
          const invNo = b.invoiceNo || `INV-${idx+1}`;
          const gTot = Number(b.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
          const pd = Number(b.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
          const due = Math.max(0, (Number(b.grandTotal || 0) - Number(b.amountPaid || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 });
          const dt = b.saleDate || (b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'N/A');
          return `  ${idx + 1}. *#${invNo}* (${dt})\n     Bill: ₹${gTot} | Paid: ₹${pd} | *Due: ₹${due}*`;
        })
        .join('\n');
      if (billsToList.length > 15) {
        pendingListText += `\n  ...and ${billsToList.length - 15} more invoices`;
      }
    }

    const message =
`📋 *CUSTOMER ACCOUNT STATEMENT & DUE INVOICES SLIP*
━━━━━━━━━━━━━━━━━━━━
🏢 *From:* Global ERP Services
👤 *Customer:* ${customerName}
📱 *Phone:* ${rawPhone || phone || 'N/A'}
🏛 *GSTIN:* ${cust?.gstin || 'Unregistered'}
━━━━━━━━━━━━━━━━━━━━
📊 *ACCOUNT SUMMARY:*
• Total Invoices: ${summ.totalInvoices || bills.length}
• Total Sales Billed: ₹${totalSold}
• Total Paid / Settled: ₹${totalPaid}
🔴 *NET OUTSTANDING BALANCE DUE: ₹${netBalance}*
━━━━━━━━━━━━━━━━━━━━
${pendingListText ? `${listTitle}\n${pendingListText}\n━━━━━━━━━━━━━━━━━━━━\n` : ''}
🏦 *Payment Request:*
Please verify this statement and arrange payment for the outstanding dues. If already settled, kindly share the payment receipt.
_Thank you for your business & partnership!_`;

    const encoded = encodeURIComponent(message);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
    toast.success('WhatsApp all-invoices slip opened successfully!');
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (c.name || '').toLowerCase().includes(q) ||
        (c.businessName || '').toLowerCase().includes(q) ||
        (c.customerCode || '').toLowerCase().includes(q) ||
        (c.contactPerson || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.gstin || '').toLowerCase().includes(q);

      const due = c.dueAmount !== undefined ? c.dueAmount : 0;
      let matchesDue = true;
      if (filterDueOnly === 'due') {
        matchesDue = due > 0;
      } else if (filterDueOnly === 'zero') {
        matchesDue = due <= 0;
      }

      return matchesSearch && matchesDue;
    });
  }, [customers, searchTerm, filterDueOnly]);

  // Overall aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const totalCustomers = customers.length;
    let totalSales = 0;
    let totalPaid = 0;
    let totalDue = 0;

    customers.forEach(c => {
      totalSales += Number(c.totalSaleAmount) || 0;
      totalPaid += Number(c.totalPaid) || 0;
      const due = Number(c.dueAmount) || 0;
      totalDue += due;
    });

    return { totalCustomers, totalSales, totalPaid, totalDue };
  }, [customers]);

  // Filtered invoices for detailed view
  const filteredInvoices = useMemo(() => {
    if (!customerDetails?.sales) return [];
    if (invoiceStatusFilter === 'All') return customerDetails.sales;
    if (invoiceStatusFilter === 'Completed') {
      return customerDetails.sales.filter(s => s.saleStatus === 'Completed');
    }
    if (invoiceStatusFilter === 'Due') {
      return customerDetails.sales.filter(s => s.paymentStatus !== 'Paid' && s.saleStatus !== 'Cancelled');
    }
    if (invoiceStatusFilter === 'Paid') {
      return customerDetails.sales.filter(s => s.paymentStatus === 'Paid');
    }
    if (invoiceStatusFilter === 'Cancelled') {
      return customerDetails.sales.filter(s => s.saleStatus === 'Cancelled');
    }
    return customerDetails.sales;
  }, [customerDetails, invoiceStatusFilter]);

  // If a customer is selected (via route /sales/customer-ledger/:customerId or state), render full-page detail view
  if (activeCustomerId) {
    return (
      <CustomerLedgerDetailPage
        customerDetails={customerDetails}
        detailsLoading={detailsLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        invoiceStatusFilter={invoiceStatusFilter}
        setInvoiceStatusFilter={setInvoiceStatusFilter}
        filteredInvoices={filteredInvoices}
        handleBackToLedger={handleBackToLedger}
        fetchCustomerDetails={fetchCustomerDetails}
        activeCustomerId={activeCustomerId}
        handleSendInvoiceWhatsApp={handleSendInvoiceWhatsApp}
        handleSendCustomerStatementWhatsApp={handleSendCustomerStatementWhatsApp}
        handleViewInvoice={handleViewInvoice}
        navigate={navigate}
        showInvoiceModal={showInvoiceModal}
        setShowInvoiceModal={setShowInvoiceModal}
        selectedInvoice={selectedInvoice}
      />
    );
  }

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER SECTION
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 dark:shadow-none shrink-0">
              <User size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                Customer Ledger & Receivables Hub
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold">
                  {filteredCustomers.length} Parties
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage customer statements, sales billing, payment collection records, and outstanding dues.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 self-stretch sm:self-auto shrink-0 flex-nowrap">
          <button
            type="button"
            onClick={fetchLedgerSummary}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap cursor-pointer"
            title="Refresh Ledger Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            title="Export CSV"
          >
            <Download size={16} className="text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/sales/add-sale')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 dark:shadow-none hover:shadow-lg transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            title="Create Sale Invoice"
          >
            <Plus size={18} />
            <span>Add Sale Invoice</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP SUMMARY METRIC CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Customers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Customers</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{aggregateMetrics.totalCustomers}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active in Directory</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>

        {/* Card 2: Total Sales */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Billed (Sales)</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Boxes size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">₹{aggregateMetrics.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1 font-semibold">
              <Receipt size={13} /> Across all sales invoices
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
        </div>

        {/* Card 3: Total Collected */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Received</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">₹{aggregateMetrics.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              Cleared payments & settlements
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        </div>

        {/* Card 4: Outstanding Due */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-rose-200/80 dark:border-rose-900/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-gradient-to-br from-white via-rose-50/20 to-rose-50/40 dark:from-slate-900 dark:via-rose-950/20 dark:to-rose-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300">Total Balance Receivable</span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">₹{aggregateMetrics.totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1">
              <AlertTriangle size={13} /> Outstanding from customers
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH, FILTERS & CONTROLS
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Customer Name, Firm, Code, Phone, or GSTIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs bg-slate-200/60 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setFilterDueOnly('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterDueOnly === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Customers ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterDueOnly('due')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filterDueOnly === 'due'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200/60 dark:border-rose-900/60'
              }`}
            >
              <AlertTriangle size={13} />
              With Outstanding Dues
            </button>
            <button
              type="button"
              onClick={() => setFilterDueOnly('zero')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterDueOnly === 'zero'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-900/60'
              }`}
            >
              Fully Cleared (₹0 Due)
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN CUSTOMERS LEDGER TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">GSTIN & PAN</th>
                <th className="py-3.5 px-4 text-center">Invoices</th>
                <th className="py-3.5 px-4 text-right">Total Sales Billed</th>
                <th className="py-3.5 px-4 text-right">Total Received</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-emerald-600" />
                      <span className="text-sm font-semibold">Loading customer ledger directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <User size={36} className="text-slate-300 dark:text-slate-600" />
                      <span className="text-base font-bold text-slate-600 dark:text-slate-300">No Customers Found</span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchTerm ? 'No customer matches your search query.' : 'No customers have been registered yet.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/customers/customer-master')}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <Plus size={15} /> Create First Customer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const due = Number(c.dueAmount) || 0;
                  const isSelected = selectedCustomerId === c._id;

                  return (
                    <tr
                      key={c._id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}
                    >
                      {/* Customer Column */}
                      <td className="py-3.5 px-4">
                        <div
                          className="font-bold text-slate-800 dark:text-slate-100 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                          onClick={() => handleViewCustomer(c._id)}
                        >
                          {c.name || c.businessName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {c.customerCode || 'CUST-N/A'}
                          </span>
                          {c.type && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold">
                              {c.type}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-200 font-semibold">{c.contactPerson || c.name || '—'}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          {c.phone && <span>📞 {c.phone}</span>}
                          {c.email && <span className="truncate max-w-[140px]" title={c.email}>✉️ {c.email}</span>}
                        </div>
                      </td>

                      {/* GSTIN & PAN */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {c.gstin || 'Unregistered'}
                        </div>
                        {c.pan && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            PAN: {c.pan}
                          </div>
                        )}
                      </td>

                      {/* Total Invoices */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                          {c.totalInvoices || 0} Bills
                        </span>
                      </td>

                      {/* Total Sales Billed */}
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">
                        ₹{(c.totalSaleAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Total Paid / Received */}
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                        ₹{(c.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4 text-right font-bold">
                        {due > 0 ? (
                          <span className="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-900/60 inline-block">
                            ₹{due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/60 inline-block font-semibold">
                            ₹0.00
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {c.status !== false ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions - Only View Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleViewCustomer(c._id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                          title="View Customer Details & Ledger"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerLedger;
