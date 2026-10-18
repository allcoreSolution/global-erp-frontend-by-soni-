import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, Search, Eye, Filter, RefreshCw, FileText, Download,
  Printer, X, CheckCircle, Clock, AlertTriangle, Building, Phone, Mail,
  MapPin, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Tag,
  ShieldCheck, ChevronRight, User, ExternalLink, Calendar, Receipt, Landmark,
  Boxes, FileSpreadsheet, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api';

const ProductLedger = () => {
  const navigate = useNavigate();

  // State management
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState('all'); // 'all', 'due', 'zero'

  // Selected supplier details
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices', 'profile', 'history'
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All'); // 'All', 'Received', 'Due', 'Cancelled'

  // Selected invoice modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Fetch all suppliers ledger summary
  const fetchLedgerSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers/ledger/summary');
      if (res.data?.success) {
        setSuppliers(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching supplier ledger summary:', error);
      // Fallback: fetch raw suppliers if summary endpoint has issue
      try {
        const fallbackRes = await api.get('/suppliers');
        if (fallbackRes.data?.success) {
          setSuppliers(fallbackRes.data.data || []);
        }
      } catch (err) {
        toast.error('Failed to load supplier ledger data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerSummary();
  }, []);

  // Fetch detailed data when a supplier is selected
  const handleViewSupplier = async (supplierId) => {
    setSelectedSupplierId(supplierId);
    setDetailsLoading(true);
    setActiveTab('invoices');
    setInvoiceStatusFilter('All');
    try {
      const res = await api.get(`/suppliers/${supplierId}/ledger`);
      if (res.data?.success) {
        setSupplierDetails(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching supplier ledger details:', error);
      toast.error('Failed to load supplier detailed history');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedSupplierId(null);
    setSupplierDetails(null);
  };

  // Open invoice view modal
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  // Export Suppliers Summary to CSV
  const handleExportCSV = () => {
    if (!suppliers.length) {
      toast.info('No supplier data available to export');
      return;
    }
    const headers = ['Supplier Code', 'Company Name', 'Contact Person', 'Phone', 'Email', 'GSTIN', 'Total Invoices', 'Total Purchase (₹)', 'Total Paid (₹)', 'Outstanding Due (₹)', 'Status'];
    const rows = filteredSuppliers.map(s => [
      `"${s.supplierCode || ''}"`,
      `"${s.companyName || ''}"`,
      `"${s.contactPerson || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.email || ''}"`,
      `"${s.gstin || ''}"`,
      s.totalInvoices || 0,
      (s.totalPurchaseAmount || 0).toFixed(2),
      (s.totalPaid || 0).toFixed(2),
      (s.dueAmount || s.balance || 0).toFixed(2),
      s.status ? 'Active' : 'Inactive'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Supplier_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (s.companyName || '').toLowerCase().includes(q) ||
        (s.supplierCode || '').toLowerCase().includes(q) ||
        (s.contactPerson || '').toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q) ||
        (s.gstin || '').toLowerCase().includes(q);

      const due = s.dueAmount !== undefined ? s.dueAmount : (s.balance || 0);
      let matchesDue = true;
      if (filterDueOnly === 'due') {
        matchesDue = due > 0;
      } else if (filterDueOnly === 'zero') {
        matchesDue = due <= 0;
      }

      return matchesSearch && matchesDue;
    });
  }, [suppliers, searchTerm, filterDueOnly]);

  // Overall aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const totalSuppliers = suppliers.length;
    let totalPurchases = 0;
    let totalPaid = 0;
    let totalDue = 0;

    suppliers.forEach(s => {
      totalPurchases += Number(s.totalPurchaseAmount) || 0;
      totalPaid += Number(s.totalPaid) || 0;
      const due = s.dueAmount !== undefined ? Number(s.dueAmount) : Number(s.balance) || 0;
      totalDue += due;
    });

    return { totalSuppliers, totalPurchases, totalPaid, totalDue };
  }, [suppliers]);

  // Filtered invoices for detailed view
  const filteredInvoices = useMemo(() => {
    if (!supplierDetails?.purchases) return [];
    if (invoiceStatusFilter === 'All') return supplierDetails.purchases;
    if (invoiceStatusFilter === 'Received') {
      return supplierDetails.purchases.filter(p => p.purchaseStatus === 'Received');
    }
    if (invoiceStatusFilter === 'Due') {
      return supplierDetails.purchases.filter(p => p.paymentStatus !== 'Paid' && p.purchaseStatus !== 'Cancelled');
    }
    if (invoiceStatusFilter === 'Paid') {
      return supplierDetails.purchases.filter(p => p.paymentStatus === 'Paid');
    }
    if (invoiceStatusFilter === 'Cancelled') {
      return supplierDetails.purchases.filter(p => p.purchaseStatus === 'Cancelled');
    }
    return supplierDetails.purchases;
  }, [supplierDetails, invoiceStatusFilter]);

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER SECTION
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Supplier Ledger & Purchase Hub
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
                  {filteredSuppliers.length} Parties
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage purchase suppliers, track complete bills, payment statuses, and outstanding dues.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Clean single row with Export CSV & Add Purchase Invoice side-by-side */}
        <div className="flex items-center gap-2 sm:gap-2.5 self-stretch sm:self-auto shrink-0 flex-nowrap">
          <button
            onClick={fetchLedgerSummary}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            title="Refresh Ledger Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap"
            title="Export CSV"
          >
            <Download size={16} className="text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/purchases/add-purchase')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
            title="Add Purchase Invoice"
          >
            <Plus size={18} />
            <span>Add Purchase Invoice</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP SUMMARY METRIC CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Suppliers */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Suppliers</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800">{aggregateMetrics.totalSuppliers}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold">Active in Directory</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>

        {/* Card 2: Total Purchases */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Purchased</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Boxes size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800">₹{aggregateMetrics.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-purple-600 mt-1 flex items-center gap-1 font-semibold">
              <Receipt size={13} /> Across all purchase bills
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
        </div>

        {/* Card 3: Total Paid */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Paid Out</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-700">₹{aggregateMetrics.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-emerald-600 mt-1 font-medium">
              Cleared payments & settlements
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        </div>

        {/* Card 4: Outstanding Due */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-gradient-to-br from-white via-amber-50/20 to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Total Balance Due</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-700">₹{aggregateMetrics.totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
              <AlertTriangle size={13} /> Payable to suppliers
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-red-500" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH, FILTERS & CONTROLS
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Supplier Name, Code, Phone, or GSTIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs bg-slate-200/60 rounded-full w-5 h-5 flex items-center justify-center"
              >
                &times;
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterDueOnly('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterDueOnly === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Suppliers ({suppliers.length})
            </button>
            <button
              onClick={() => setFilterDueOnly('due')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterDueOnly === 'due'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <AlertTriangle size={13} />
              With Outstanding Dues
            </button>
            <button
              onClick={() => setFilterDueOnly('zero')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterDueOnly === 'zero'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              Fully Cleared (₹0 Due)
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN SUPPLIERS LEDGER TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">GSTIN & PAN</th>
                <th className="py-3.5 px-4 text-center">Invoices</th>
                <th className="py-3.5 px-4 text-right">Total Purchased</th>
                <th className="py-3.5 px-4 text-right">Total Paid</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-indigo-600" />
                      <span className="text-sm font-semibold">Loading purchase suppliers ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building size={36} className="text-slate-300" />
                      <span className="text-base font-bold text-slate-600">No Suppliers Found</span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchTerm ? 'No supplier matches your search query.' : 'No purchase suppliers have been registered yet.'}
                      </p>
                      <button
                        onClick={() => navigate('/purchases/add-purchase')}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                      >
                        <Plus size={15} /> Create First Purchase
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => {
                  const due = s.dueAmount !== undefined ? Number(s.dueAmount) : Number(s.balance) || 0;
                  const isSelected = selectedSupplierId === s._id;

                  return (
                    <tr
                      key={s._id}
                      className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      {/* Supplier Column */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-sm hover:text-indigo-600 cursor-pointer" onClick={() => handleViewSupplier(s._id)}>
                          {s.companyName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {s.supplierCode || 'SUP-N/A'}
                          </span>
                          {s.type && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                              {s.type}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-semibold">{s.contactPerson || '—'}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          {s.phone && <span>📞 {s.phone}</span>}
                          {s.email && <span className="truncate max-w-[140px]" title={s.email}>✉️ {s.email}</span>}
                        </div>
                      </td>

                      {/* GSTIN & PAN */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-700">
                          {s.gstin || 'Unregistered'}
                        </div>
                        {s.pan && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            PAN: {s.pan}
                          </div>
                        )}
                      </td>

                      {/* Total Invoices */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {s.totalInvoices || 0} Bills
                        </span>
                      </td>

                      {/* Total Purchased */}
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                        ₹{(s.totalPurchaseAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Total Paid */}
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                        ₹{(s.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4 text-right font-bold">
                        {due > 0 ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-block">
                            ₹{due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-block font-semibold">
                            ₹0.00
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {s.status !== false ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewSupplier(s._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95"
                            title="View Full Supplier Details & All Invoices"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => navigate(`/purchases/add-purchase?supplierId=${s._id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors"
                            title="Create New Invoice for this Supplier"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. SUPPLIER 360° FULL DETAIL VIEW OVERLAY / MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedSupplierId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Top Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-indigo-300 font-extrabold text-lg shrink-0">
                  {supplierDetails?.supplier?.companyName?.slice(0, 2).toUpperCase() || 'SP'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {supplierDetails?.supplier?.companyName || 'Loading Supplier Details...'}
                    </h2>
                    <span className="font-mono text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded">
                      {supplierDetails?.supplier?.supplierCode || 'SUP-CODE'}
                    </span>
                    {supplierDetails?.supplier?.type && (
                      <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded font-medium">
                        {supplierDetails.supplier.type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-4">
                    {supplierDetails?.supplier?.contactPerson && (
                      <span className="flex items-center gap-1">
                        <User size={13} className="text-indigo-400" /> {supplierDetails.supplier.contactPerson}
                      </span>
                    )}
                    {supplierDetails?.supplier?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={13} className="text-indigo-400" /> {supplierDetails.supplier.phone}
                      </span>
                    )}
                    {supplierDetails?.supplier?.gstin && (
                      <span className="flex items-center gap-1 font-mono">
                        <ShieldCheck size={13} className="text-emerald-400" /> GSTIN: {supplierDetails.supplier.gstin}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseDetails}
                className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
                title="Close Profile"
              >
                <X size={22} />
              </button>
            </div>

            {/* Quick Stat Bar */}
            {supplierDetails?.summary && (
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Invoices</span>
                  <span className="text-base font-extrabold text-slate-800">
                    {supplierDetails.summary.totalInvoices || 0} Bills
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Purchased</span>
                  <span className="text-base font-extrabold text-indigo-700">
                    ₹{(supplierDetails.summary.totalPurchased || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Paid</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    ₹{(supplierDetails.summary.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Net Balance</span>
                  <span className={`text-base font-extrabold ${supplierDetails.summary.netBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    ₹{(supplierDetails.summary.netBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="px-6 pt-3 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm font-semibold">
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'invoices'
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Receipt size={16} />
                  <span>All Invoices / Purchase Bills ({supplierDetails?.purchases?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'profile'
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Building size={16} />
                  <span>Supplier Profile & Legal Details</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'history'
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Clock size={16} />
                  <span>Payments & Returns History</span>
                </button>
              </div>

              {/* Add invoice button inside modal */}
              <button
                onClick={() => navigate(`/purchases/add-purchase?supplierId=${supplierDetails?.supplier?._id}`)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2 transition-all active:scale-95"
              >
                <Plus size={14} /> + Add Invoice for this Supplier
              </button>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">
              {detailsLoading ? (
                <div className="py-16 text-center text-slate-400">
                  <RefreshCw size={28} className="animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Loading supplier profile & transaction history...</p>
                </div>
              ) : (
                <>
                  {/* ──────────────────────────────────
                      TAB 1: ALL INVOICES
                  ────────────────────────────────── */}
                  {activeTab === 'invoices' && (
                    <div>
                      {/* Sub-Filter pills */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          {['All', 'Received', 'Due', 'Paid', 'Cancelled'].map((st) => (
                            <button
                              key={st}
                              onClick={() => setInvoiceStatusFilter(st)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                invoiceStatusFilter === st
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st === 'All' ? `All Bills (${supplierDetails?.purchases?.length || 0})` : st}
                            </button>
                          ))}
                        </div>

                        <span className="text-xs text-slate-400 font-medium">
                          Showing {filteredInvoices.length} bill(s)
                        </span>
                      </div>

                      {/* Invoices Table */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              <th className="py-3 px-4">Invoice / Ref No</th>
                              <th className="py-3 px-4">Bill Date</th>
                              <th className="py-3 px-4">Due Date</th>
                              <th className="py-3 px-4">Warehouse</th>
                              <th className="py-3 px-4 text-center">Items</th>
                              <th className="py-3 px-4 text-right">Grand Total</th>
                              <th className="py-3 px-4 text-right">Paid Amount</th>
                              <th className="py-3 px-4 text-center">Purchase Status</th>
                              <th className="py-3 px-4 text-center">Payment Status</th>
                              <th className="py-3 px-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {filteredInvoices.length === 0 ? (
                              <tr>
                                <td colSpan={10} className="py-10 text-center text-slate-400">
                                  <Receipt size={32} className="mx-auto mb-2 text-slate-300" />
                                  <p className="font-semibold text-sm text-slate-600">No invoices match this filter</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Click '+ Add Invoice' to create a new purchase invoice for this supplier.</p>
                                </td>
                              </tr>
                            ) : (
                              filteredInvoices.map((inv) => {
                                const grandTotal = Number(inv.grandTotal) || 0;
                                const amountPaid = Number(inv.amountPaid) || 0;
                                const balanceDue = Math.max(0, grandTotal - amountPaid);

                                return (
                                  <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="font-bold text-slate-800 font-mono text-xs">
                                        {inv.referenceNo || inv.purchaseNo || 'PUR-BILL'}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-600">
                                      {inv.purchaseDate || '—'}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-600">
                                      {inv.dueDate || '—'}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-600">
                                      {inv.warehouse?.name || (typeof inv.warehouse === 'string' ? inv.warehouse : 'General')}
                                    </td>
                                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                                      {inv.orderItems?.length || 1}
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                                      ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                                      ₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        inv.purchaseStatus === 'Received'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : inv.purchaseStatus === 'Pending'
                                          ? 'bg-amber-100 text-amber-800'
                                          : inv.purchaseStatus === 'Cancelled'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {inv.purchaseStatus || 'Received'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        inv.paymentStatus === 'Paid'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : inv.paymentStatus === 'Partial'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {inv.paymentStatus || (balanceDue === 0 ? 'Paid' : 'Due')}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <button
                                        onClick={() => handleViewInvoice(inv)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors"
                                        title="View Full Invoice Breakdown"
                                      >
                                        <Eye size={12} />
                                        <span>View Bill</span>
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
                  )}

                  {/* ──────────────────────────────────
                      TAB 2: SUPPLIER FULL PROFILE
                  ────────────────────────────────── */}
                  {activeTab === 'profile' && supplierDetails?.supplier && (
                    <div className="space-y-6">
                      {/* Section A: Company & Contact */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                          <Building size={16} className="text-indigo-600" /> Basic Company & Contact Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Company / Trade Name</span>
                            <span className="font-bold text-slate-800 text-sm">{supplierDetails.supplier.companyName}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Supplier Code</span>
                            <span className="font-mono font-bold text-slate-800 text-sm">{supplierDetails.supplier.supplierCode}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Contact Person</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.contactPerson || 'Not Provided'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Phone Number</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.phone || 'Not Provided'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Email Address</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.email || 'Not Provided'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Supplier Type</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.type || 'Manufacturer'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Category</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.category || 'Raw Materials'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Account Status</span>
                            <span className="font-bold text-emerald-600">
                              {supplierDetails.supplier.status !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section B: GST & Compliance */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                          <ShieldCheck size={16} className="text-emerald-600" /> GST, Tax & Statutory Compliance
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">GSTIN</span>
                            <span className="font-mono font-bold text-slate-800 text-sm">{supplierDetails.supplier.gstin || 'Unregistered'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">GST Status</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.gstStatus || 'Registered'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">PAN Number</span>
                            <span className="font-mono font-bold text-slate-800">{supplierDetails.supplier.pan || 'N/A'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Tax Preference</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.taxPreference || 'Taxable'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">TDS Applicable</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.tdsApplicable ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Currency</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.currency || 'INR'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Payment Terms</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.paymentTerms || 'Net 30'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Credit Limit</span>
                            <span className="font-bold text-slate-800">₹{(supplierDetails.supplier.creditLimit || 0).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section C: Addresses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Billing Address */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                            <MapPin size={15} className="text-red-500" /> Billing Address
                          </h4>
                          <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-4 rounded-xl leading-relaxed">
                            <p className="font-bold text-slate-800">{supplierDetails.supplier.billingAddress?.street1 || 'No street address'}</p>
                            {supplierDetails.supplier.billingAddress?.street2 && <p>{supplierDetails.supplier.billingAddress.street2}</p>}
                            <p>
                              {supplierDetails.supplier.billingAddress?.city || '—'}, {supplierDetails.supplier.billingAddress?.state || '—'} {supplierDetails.supplier.billingAddress?.zip || ''}
                            </p>
                            <p className="text-slate-500">{supplierDetails.supplier.billingAddress?.country || 'India'}</p>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                            <MapPin size={15} className="text-blue-500" /> Shipping / Dispatch Address
                          </h4>
                          <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-4 rounded-xl leading-relaxed">
                            <p className="font-bold text-slate-800">{supplierDetails.supplier.shippingAddress?.street1 || 'Same as billing address'}</p>
                            {supplierDetails.supplier.shippingAddress?.street2 && <p>{supplierDetails.supplier.shippingAddress.street2}</p>}
                            <p>
                              {supplierDetails.supplier.shippingAddress?.city || '—'}, {supplierDetails.supplier.shippingAddress?.state || '—'} {supplierDetails.supplier.shippingAddress?.zip || ''}
                            </p>
                            <p className="text-slate-500">{supplierDetails.supplier.shippingAddress?.country || 'India'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Section D: Bank Accounts */}
                      {supplierDetails.supplier.banks && supplierDetails.supplier.banks.length > 0 && (
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                            <Landmark size={16} className="text-indigo-600" /> Bank Account Details
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {supplierDetails.supplier.banks.map((b, idx) => (
                              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                                <div className="font-bold text-slate-800 text-sm mb-1">{b.bankName || 'Bank'}</div>
                                <div className="text-slate-600">A/C No: <span className="font-mono font-bold text-slate-800">{b.accountNumber || b.accountNo || '—'}</span></div>
                                <div className="text-slate-600">IFSC: <span className="font-mono font-bold text-slate-800">{b.ifscCode || b.ifsc || '—'}</span></div>
                                {b.branch && <div className="text-slate-500 mt-1">Branch: {b.branch}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ──────────────────────────────────
                      TAB 3: PAYMENTS & RETURNS HISTORY
                  ────────────────────────────────── */}
                  {activeTab === 'history' && (
                    <div className="space-y-6">
                      {/* Payments History */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                          <CreditCard size={16} className="text-emerald-600" /> Payments Disbursed to Supplier
                        </h3>
                        {supplierDetails?.payments?.length === 0 ? (
                          <div className="py-6 text-center text-slate-400 text-xs">
                            No standalone payment records found for this party. Payments recorded during purchase bills appear directly in bills.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500 text-[10px]">
                                  <th className="py-2.5 px-3">Payment No</th>
                                  <th className="py-2.5 px-3">Date</th>
                                  <th className="py-2.5 px-3">Mode</th>
                                  <th className="py-2.5 px-3">Ref / Cheque</th>
                                  <th className="py-2.5 px-3 text-right">Amount</th>
                                  <th className="py-2.5 px-3 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {supplierDetails?.payments?.map((pay) => (
                                  <tr key={pay._id}>
                                    <td className="py-2.5 px-3 font-mono font-bold">{pay.paymentNo || 'PAY-N/A'}</td>
                                    <td className="py-2.5 px-3">{pay.paymentDate}</td>
                                    <td className="py-2.5 px-3">{pay.paymentMethod || 'Bank'}</td>
                                    <td className="py-2.5 px-3 font-mono">{pay.transactionRef || pay.chequeNo || '—'}</td>
                                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">₹{(pay.paymentAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        {pay.status || 'Success'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Purchase Returns History */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                          <ArrowDownRight size={16} className="text-red-500" /> Purchase Returns & Debit Notes
                        </h3>
                        {supplierDetails?.returns?.length === 0 ? (
                          <div className="py-6 text-center text-slate-400 text-xs">
                            No goods have been returned to this supplier.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500 text-[10px]">
                                  <th className="py-2.5 px-3">Return No</th>
                                  <th className="py-2.5 px-3">Date</th>
                                  <th className="py-2.5 px-3 font-mono">Debit Note No</th>
                                  <th className="py-2.5 px-3">Reason</th>
                                  <th className="py-2.5 px-3 text-right">Goods Value</th>
                                  <th className="py-2.5 px-3 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {supplierDetails?.returns?.map((ret) => (
                                  <tr key={ret._id}>
                                    <td className="py-2.5 px-3 font-mono font-bold">{ret.returnNo}</td>
                                    <td className="py-2.5 px-3">{ret.returnDate}</td>
                                    <td className="py-2.5 px-3 font-mono">{ret.debitNoteNo || '—'}</td>
                                    <td className="py-2.5 px-3">{ret.returnReason || 'Defective Goods'}</td>
                                    <td className="py-2.5 px-3 text-right font-bold text-red-600">₹{(ret.totals?.goodsValue || ret.totals?.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                        {ret.status || 'Draft'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Supplier ID: <span className="font-mono text-slate-600">{supplierDetails?.supplier?._id}</span>
              </span>
              <button
                onClick={handleCloseDetails}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. FULL TAX INVOICE OVERVIEW MODAL
      ───────────────────────────────────────────────────────────── */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative text-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8">
            
            {/* Close Icon */}
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 p-2 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            {/* Printable Area Header */}
            <div className="border-b border-slate-200 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Purchase Tax Invoice</span>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                  {selectedInvoice.referenceNo || selectedInvoice.purchaseNo || 'PUR-BILL'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
                >
                  <Printer size={14} /> Print Bill
                </button>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedInvoice.purchaseStatus === 'Received'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedInvoice.purchaseStatus || 'Received'}
                </span>
              </div>
            </div>

            {/* Bill Meta Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block font-medium">Invoice Date</span>
                <span className="font-bold text-slate-800 text-sm">{selectedInvoice.purchaseDate || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Due Date</span>
                <span className="font-bold text-slate-800 text-sm">{selectedInvoice.dueDate || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Warehouse / Branch</span>
                <span className="font-bold text-slate-800">{selectedInvoice.warehouse?.name || (typeof selectedInvoice.warehouse === 'string' ? selectedInvoice.warehouse : 'General Warehouse')}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Payment Status</span>
                <span className={`font-bold ${selectedInvoice.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedInvoice.paymentStatus || 'Due'}
                </span>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Itemized Purchase Products</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Item Details</th>
                      <th className="py-2.5 px-3 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Unit Cost</th>
                      <th className="py-2.5 px-3 text-center">Tax %</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.orderItems && selectedInvoice.orderItems.length > 0 ? (
                      selectedInvoice.orderItems.map((item, idx) => {
                        const rawCost = (Number(item.netUnitCost) || Number(item.productPrice) || 0) - (Number(item.discount) || 0);
                        const taxAmt = rawCost * ((Number(item.taxPercent) || 0) / 100);
                        const sub = (rawCost + taxAmt) * (Number(item.quantity) || 1);

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-800">{item.name || item.product?.productName || 'Product Item'}</div>
                              <div className="text-[10px] font-mono text-slate-400">{item.code || item.product?.productCode || ''}</div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-700">₹{(Number(item.netUnitCost) || 0).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{item.taxPercent || 0}%</td>
                            <td className="py-2.5 px-3 text-right text-slate-600">₹{(Number(item.discount) || 0).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{sub.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{selectedInvoice.productName || 'Standard Item'}</div>
                          <div className="text-[10px] font-mono text-slate-400">{selectedInvoice.productCode || ''}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold">{selectedInvoice.purchaseQty || 1}</td>
                        <td className="py-3 px-3 text-right">₹{Number(selectedInvoice.productCost || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-center">0%</td>
                        <td className="py-3 px-3 text-right">₹0.00</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">₹{Number(selectedInvoice.grandTotal || 0).toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals Breakdown Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex flex-col items-end space-y-1.5">
                <div className="flex justify-between w-full sm:w-1/2 text-slate-600">
                  <span>Order Tax:</span>
                  <span className="font-medium text-slate-800">{selectedInvoice.orderTax || 'No Tax'}</span>
                </div>
                {selectedInvoice.discountValue > 0 && (
                  <div className="flex justify-between w-full sm:w-1/2 text-slate-600">
                    <span>Discount:</span>
                    <span className="font-medium text-emerald-700">-₹{Number(selectedInvoice.discountValue).toFixed(2)}</span>
                  </div>
                )}
                {selectedInvoice.shippingCost > 0 && (
                  <div className="flex justify-between w-full sm:w-1/2 text-slate-600">
                    <span>Shipping:</span>
                    <span className="font-medium text-slate-800">₹{Number(selectedInvoice.shippingCost).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between w-full sm:w-1/2 text-slate-900 font-extrabold text-sm border-t border-slate-200 pt-2">
                  <span>Grand Total:</span>
                  <span className="text-indigo-700">₹{(Number(selectedInvoice.grandTotal) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between w-full sm:w-1/2 text-emerald-700 font-bold">
                  <span>Amount Paid:</span>
                  <span>₹{(Number(selectedInvoice.amountPaid) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between w-full sm:w-1/2 text-amber-700 font-bold border-t border-slate-200/60 pt-1">
                  <span>Balance Due:</span>
                  <span>₹{Math.max(0, (Number(selectedInvoice.grandTotal) || 0) - (Number(selectedInvoice.amountPaid) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Note / Remarks */}
            {selectedInvoice.note && (
              <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-600">
                <span className="font-bold text-slate-700">Remarks / Notes: </span> {selectedInvoice.note}
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all"
              >
                Close Bill View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductLedger;
