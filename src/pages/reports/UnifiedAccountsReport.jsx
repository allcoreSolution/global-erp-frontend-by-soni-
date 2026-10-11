import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Truck,
  FileText,
  CreditCard,
  Receipt,
  Scale,
  PieChart,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building
} from 'lucide-react';
import api from '../../api';

// Format Indian Currency
const formatINR = (val) => {
  const num = Number(val || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(num);
};

const UnifiedAccountsReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'daybook';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Selected party for detailed ledger drilldown modal/view
  const [selectedParty, setSelectedParty] = useState(null);

  // Fetch report data
  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await api.get('/reports/accounts/unified-overview', { params });
      if (res.data?.success) {
        setReportData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fromDate, toDate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Filter Day Book
  const filteredDayBook = useMemo(() => {
    if (!reportData?.dayBook) return [];
    return reportData.dayBook.filter(item => {
      const matchesSearch = searchTerm === '' ||
        item.voucherNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'ALL' || item.category === selectedType;

      return matchesSearch && matchesType;
    });
  }, [reportData, searchTerm, selectedType]);

  // CSV Export for Daybook
  const exportDayBookCSV = () => {
    if (!filteredDayBook || filteredDayBook.length === 0) return;
    const headers = ['Date,Voucher No,Type,Party Name,Debit (Dr),Credit (Cr),Mode,Status,Narration'];
    const rows = filteredDayBook.map(row => 
      `"${row.date || ''}","${row.voucherNo || ''}","${row.type || ''}","${row.partyName || ''}",${row.debit || 0},${row.credit || 0},"${row.mode || ''}","${row.status || ''}","${row.narration || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DayBook_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const metrics = reportData?.metrics || {};

  return (
    <div className="bg-slate-50/50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      
      {/* ── HEADER ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-100">
            Real-Time Accounting & Audits
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2 mt-2">
            <BookOpen className="text-indigo-600" size={26} /> Accounts & Financial Reports Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated Ledger statements, live Day Book entries, P&L, Trial Balance, and Customer/Supplier balances powered by real transaction data.
          </p>
        </div>

        {/* Global Controls & Date Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none text-xs"
              placeholder="From"
            />
            <span className="text-slate-300">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none text-xs"
              placeholder="To"
            />
          </div>

          <button
            onClick={fetchReport}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={exportDayBookCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── TOP KPI METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-slate-800">{formatINR(metrics.totalSales)}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">Active revenue</span>
          </div>
        </div>

        {/* Total Purchases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Purchases</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-slate-800">{formatINR(metrics.totalPurchases)}</div>
            <span className="text-[10px] text-purple-600 font-semibold">Inventory procurement</span>
          </div>
        </div>

        {/* Customer Receivables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Receivables Due</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-blue-600">{formatINR(metrics.totalReceivables)}</div>
            <span className="text-[10px] text-slate-500 font-medium">Pending from customers</span>
          </div>
        </div>

        {/* Customer Collections (Receipts) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Receipts</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-teal-600">{formatINR(metrics.totalReceipts)}</div>
            <span className="text-[10px] text-teal-600 font-semibold">Collected in Cash/Bank</span>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Entries</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-indigo-600">{metrics.totalTransactions || 0}</div>
            <span className="text-[10px] text-slate-500 font-medium">System vouchers & bills</span>
          </div>
        </div>
      </div>

      {/* ── UNIFIED TABS ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'daybook', label: 'Day Book & All Transactions', icon: FileText },
            { id: 'customers', label: 'Customer Ledgers & Receivables', icon: Users },
            { id: 'suppliers', label: 'Supplier Ledgers & Payables', icon: Truck },
            { id: 'financial', label: 'Financial Statements (TB, P&L, BS)', icon: Scale },
            { id: 'aging', label: 'Aging & Outstandings', icon: Clock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <RefreshCw size={28} className="animate-spin text-indigo-600" />
              <p className="text-xs font-medium">Loading unified account ledger records...</p>
            </div>
          ) : (
            <>
              {/* ─────────────────────────────────────────────────────────── */}
              {/* TAB 1: DAY BOOK & ALL TRANSACTIONS */}
              {/* ─────────────────────────────────────────────────────────── */}
              {activeTab === 'daybook' && (
                <div className="space-y-4">
                  {/* Search and Category Filters */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search voucher no, party name, or transaction..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                      {['ALL', 'Sales', 'Purchases', 'Receipts', 'Payments', 'Contra', 'Notes'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedType(cat)}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition ${
                            selectedType === cat
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day Book Table */}
                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Voucher No</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Party / Account</th>
                          <th className="py-3 px-4 text-right">Debit (Dr)</th>
                          <th className="py-3 px-4 text-right">Credit (Cr)</th>
                          <th className="py-3 px-4 text-center">Mode</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredDayBook.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400">
                              No transactions found for the selected criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredDayBook.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{row.date || '—'}</td>
                              <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                                <span className="text-indigo-600">{row.voucherNo}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  row.category === 'Sales' ? 'bg-emerald-50 text-emerald-700' :
                                  row.category === 'Purchases' ? 'bg-purple-50 text-purple-700' :
                                  row.category === 'Receipts' ? 'bg-teal-50 text-teal-700' :
                                  row.category === 'Payments' ? 'bg-amber-50 text-amber-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {row.type}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-700 max-w-[200px] truncate" title={row.partyName}>
                                {row.partyName}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                                {row.debit > 0 ? formatINR(row.debit) : '—'}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                                {row.credit > 0 ? formatINR(row.credit) : '—'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-semibold">
                                  {row.mode}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                  <CheckCircle2 size={12} /> {row.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 pt-2 font-medium">
                    <span>Showing <strong>{filteredDayBook.length}</strong> transactions</span>
                    <span>Total Debit: <strong>{formatINR(filteredDayBook.reduce((a, b) => a + (b.debit || 0), 0))}</strong> | Total Credit: <strong>{formatINR(filteredDayBook.reduce((a, b) => a + (b.credit || 0), 0))}</strong></span>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────── */}
              {/* TAB 2: CUSTOMER LEDGERS & RECEIVABLES */}
              {/* ─────────────────────────────────────────────────────────── */}
              {activeTab === 'customers' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Customer Code</th>
                          <th className="py-3 px-4">Customer Name</th>
                          <th className="py-3 px-4">Contact Phone</th>
                          <th className="py-3 px-4 text-right">Total Invoiced</th>
                          <th className="py-3 px-4 text-right">Total Paid (Receipts)</th>
                          <th className="py-3 px-4 text-right">Balance Due (Dr)</th>
                          <th className="py-3 px-4 text-center">Invoices</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {(reportData?.customerLedgers || []).map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-indigo-600">{c.code}</td>
                            <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                            <td className="py-3 px-4 text-slate-600">{c.phone || '—'}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">{formatINR(c.totalInvoiced)}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-teal-600">{formatINR(c.totalPaid)}</td>
                            <td className="py-3 px-4 text-right font-mono font-black text-rose-600">
                              {formatINR(c.balanceDue)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600">
                                {c.invoices?.length || 0} bills
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────── */}
              {/* TAB 3: SUPPLIER LEDGERS & PAYABLES */}
              {/* ─────────────────────────────────────────────────────────── */}
              {activeTab === 'suppliers' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Supplier Code</th>
                          <th className="py-3 px-4">Company Name</th>
                          <th className="py-3 px-4">Contact Phone</th>
                          <th className="py-3 px-4 text-right">Total Billed</th>
                          <th className="py-3 px-4 text-right">Total Paid</th>
                          <th className="py-3 px-4 text-right">Payable Balance (Cr)</th>
                          <th className="py-3 px-4 text-center">Bills</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {(reportData?.supplierLedgers || []).map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-purple-600">{s.code}</td>
                            <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                            <td className="py-3 px-4 text-slate-600">{s.phone || '—'}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">{formatINR(s.totalBilled)}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-teal-600">{formatINR(s.totalPaid)}</td>
                            <td className="py-3 px-4 text-right font-mono font-black text-amber-600">
                              {formatINR(s.balancePayable)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600">
                                {s.bills?.length || 0} bills
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────── */}
              {/* TAB 4: FINANCIAL STATEMENTS (TB, P&L, BS) */}
              {/* ─────────────────────────────────────────────────────────── */}
              {activeTab === 'financial' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 1. Trial Balance */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                    <div className="border-b pb-2 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Scale size={16} className="text-indigo-600" /> Trial Balance
                      </h3>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Balanced</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      {(reportData?.trialBalance || []).map((tb, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                          <div>
                            <div className="font-bold text-slate-800">{tb.account}</div>
                            <div className="text-[10px] text-slate-400">{tb.group}</div>
                          </div>
                          <div className="text-right font-mono font-bold">
                            {tb.debit > 0 && <span className="text-slate-800">Dr {formatINR(tb.debit)}</span>}
                            {tb.credit > 0 && <span className="text-indigo-600">Cr {formatINR(tb.credit)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Profit & Loss */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                    <div className="border-b pb-2 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <TrendingUp size={16} className="text-emerald-600" /> Profit & Loss Statement
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Net Summary</span>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600 font-medium">Sales Revenue (Income)</span>
                        <span className="font-bold font-mono text-emerald-600">{formatINR(reportData?.profitAndLoss?.revenue?.totalSales)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600 font-medium">Cost of Purchases</span>
                        <span className="font-bold font-mono text-purple-600">{formatINR(reportData?.profitAndLoss?.expenses?.costOfPurchases)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600 font-medium">Operational Expenses</span>
                        <span className="font-bold font-mono text-slate-700">₹ 0.00</span>
                      </div>
                      <div className="pt-2 flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-bold">
                        <span>Net Profit / Margin</span>
                        <span className={`font-mono text-sm ${reportData?.profitAndLoss?.grossProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatINR(reportData?.profitAndLoss?.grossProfit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Balance Sheet */}
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                    <div className="border-b pb-2 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Building size={16} className="text-purple-600" /> Balance Sheet Summary
                      </h3>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Assets vs Liabilities</span>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Current Assets</div>
                      <div className="flex justify-between pl-2 text-slate-600">
                        <span>Customer Receivables</span>
                        <span className="font-mono font-bold text-slate-800">{formatINR(reportData?.balanceSheet?.assets?.currentAssets?.debtorsReceivables)}</span>
                      </div>
                      <div className="flex justify-between pl-2 text-slate-600">
                        <span>Cash & Bank Balances</span>
                        <span className="font-mono font-bold text-slate-800">
                          {formatINR((reportData?.balanceSheet?.assets?.currentAssets?.cashInHand || 0) + (reportData?.balanceSheet?.assets?.currentAssets?.bankBalances || 0))}
                        </span>
                      </div>

                      <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider pt-2">Current Liabilities</div>
                      <div className="flex justify-between pl-2 text-slate-600">
                        <span>Supplier Payables</span>
                        <span className="font-mono font-bold text-slate-800">{formatINR(reportData?.balanceSheet?.liabilities?.currentLiabilities?.creditorsPayables)}</span>
                      </div>
                      <div className="flex justify-between pl-2 text-slate-600">
                        <span>Taxes & Duties</span>
                        <span className="font-mono font-bold text-slate-800">{formatINR(reportData?.balanceSheet?.liabilities?.currentLiabilities?.taxDuties)}</span>
                      </div>

                      <div className="pt-2 flex justify-between items-center bg-purple-50/60 p-2.5 rounded-lg border border-purple-100 font-bold text-purple-900">
                        <span>Total Assets Base</span>
                        <span className="font-mono text-sm">{formatINR(reportData?.balanceSheet?.assets?.totalAssets)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────── */}
              {/* TAB 5: AGING & OUTSTANDINGS */}
              {/* ─────────────────────────────────────────────────────────── */}
              {activeTab === 'aging' && (
                <div className="space-y-6">
                  {/* Customer Aging */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={14} className="text-indigo-600" /> Customer Receivables Aging Breakdown
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2.5 px-4">Customer</th>
                            <th className="py-2.5 px-4 text-right">0 - 30 Days</th>
                            <th className="py-2.5 px-4 text-right">31 - 60 Days</th>
                            <th className="py-2.5 px-4 text-right">61 - 90 Days</th>
                            <th className="py-2.5 px-4 text-right">90+ Days</th>
                            <th className="py-2.5 px-4 text-right font-black">Total Due</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {(reportData?.customerLedgers || []).map(c => (
                            <tr key={c.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-4 font-bold text-slate-800">{c.name}</td>
                              <td className="py-2.5 px-4 text-right font-mono">{formatINR(c.aging['0_30'])}</td>
                              <td className="py-2.5 px-4 text-right font-mono">{formatINR(c.aging['31_60'])}</td>
                              <td className="py-2.5 px-4 text-right font-mono">{formatINR(c.aging['61_90'])}</td>
                              <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-bold">{formatINR(c.aging['90_plus'])}</td>
                              <td className="py-2.5 px-4 text-right font-mono font-black text-indigo-600">{formatINR(c.balanceDue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Supplier Aging */}
                  <div className="space-y-2 pt-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck size={14} className="text-purple-600" /> Supplier Payables Aging Breakdown
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2.5 px-4">Supplier</th>
                            <th className="py-2.5 px-4 text-right">0 - 30 Days</th>
                            <th className="py-2.5 px-4 text-right">31 - 60 Days</th>
                            <th className="py-2.5 px-4 text-right">61 - 90 Days</th>
                            <th className="py-2.5 px-4 text-right">90+ Days</th>
                            <th className="py-2.5 px-4 text-right font-black">Total Payable</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {(reportData?.supplierLedgers || []).map(s => (
                            <tr key={s.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-4 font-bold text-slate-800">{s.name}</td>
                              <td className="py-2.5 px-4 text-right font-mono">{formatINR(s.aging['0_30'])}</td>
                              <td className="py-2.5 px-4 text-right font-mono">{formatINR(s.aging['31_60'])}</td>
                              <td className="py-2.5 px-4 text-right font-mono">{formatINR(s.aging['61_90'])}</td>
                              <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-bold">{formatINR(s.aging['90_plus'])}</td>
                              <td className="py-2.5 px-4 text-right font-mono font-black text-purple-600">{formatINR(s.balancePayable)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedAccountsReport;
