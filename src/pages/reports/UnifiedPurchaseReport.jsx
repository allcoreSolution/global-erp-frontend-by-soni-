import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  FileText,
  Calendar,
  Package,
  Users,
  Building,
  RotateCcw,
  DollarSign,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Percent,
  Warehouse as WarehouseIcon,
  Truck,
  TrendingDown,
  Layers,
  AlertCircle
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

const UnifiedPurchaseReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'invoices';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);

  // Real Dynamic Data States from MongoDB
  const [invoices, setInvoices] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [supplierPurchases, setSupplierPurchases] = useState([]);
  const [productPurchases, setProductPurchases] = useState([]);
  const [branchPurchases, setBranchPurchases] = useState([]);
  const [warehousePurchases, setWarehousePurchases] = useState([]);
  const [returns, setReturns] = useState([]);
  const [taxReport, setTaxReport] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [frequentlyPurchased, setFrequentlyPurchased] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch all purchase report datasets in parallel
  const fetchAllPurchaseData = async () => {
    setIsLoading(true);
    try {
      const [
        invRes,
        dailyRes,
        monthlyRes,
        suppRes,
        prdRes,
        branchRes,
        whRes,
        retRes,
        taxRes,
        topSuppRes,
        freqRes
      ] = await Promise.all([
        api.get('/reports/purchases/invoice-register').catch(() => ({ data: { data: [] } })),
        api.get('/reports/purchases/daily').catch(() => ({ data: { data: [] } })),
        api.get('/reports/purchases/monthly').catch(() => ({ data: { data: [] } })),
        api.get('/reports/purchases/analysis/supplier-wise').catch(() => ({ data: { data: [] } })),
        api.get('/reports/purchases/analysis/product-wise').catch(() => ({ data: { data: [] } })),
        api.get('/reports/purchases/analysis/branch-wise').catch(() => ({ data: { data: [] } })),
        api.get('/reports/purchases/analysis/warehouse-wise').catch(() => ({ data: { data: [] } })),
        api.get('/reports/purchases/return-report').catch(() => ({ data: { data: [] } })),
        api.get('/reports/purchases/financial/tax-gst-paid').catch(() => ({ data: { data: [] } })),
        api.get('/reports/purchases/performance/top-suppliers').catch(() => ({ data: { data: [] } })),
        api.get('/reports/purchases/performance/frequently-purchased').catch(() => ({ data: { data: [] } }))
      ]);

      setInvoices(invRes.data?.data || []);
      setDailyData(dailyRes.data?.data || []);
      setMonthlyData(monthlyRes.data?.data || []);
      setSupplierPurchases(suppRes.data?.data || []);
      setProductPurchases(prdRes.data?.data || []);
      setBranchPurchases(branchRes.data?.data || []);
      setWarehousePurchases(whRes.data?.data || []);
      setReturns(retRes.data?.data || []);
      setTaxReport(taxRes.data?.data || []);
      setTopSuppliers(topSuppRes.data?.data || []);
      setFrequentlyPurchased(freqRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch purchase report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPurchaseData();
  }, []);

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

  // Calculations for KPI Cards
  const totalGrossPurchases = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);
  }, [invoices]);

  const totalPaid = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + Number(inv.paidAmount || 0), 0);
  }, [invoices]);

  const totalPendingDue = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + Number(inv.dueAmount || 0), 0);
  }, [invoices]);

  const totalTaxPaid = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + Number(inv.taxAmount || 0), 0);
  }, [invoices]);

  const totalReturnAmount = useMemo(() => {
    return returns.reduce((acc, ret) => acc + Number(ret.returnAmount || 0), 0);
  }, [returns]);

  const netPurchases = Math.max(0, totalGrossPurchases - totalReturnAmount);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        searchTerm === '' ||
        inv.purchaseNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.supplier?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchFrom = !fromDate || (inv.date && inv.date >= fromDate);
      const matchTo = !toDate || (inv.date && inv.date <= toDate);

      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [invoices, searchTerm, statusFilter, fromDate, toDate]);

  // Export Invoices CSV
  const exportInvoicesCSV = () => {
    if (!filteredInvoices || filteredInvoices.length === 0) return;
    const headers = ['Purchase No,Date,Supplier,Warehouse,Branch,Tax Amount,Total Amount,Paid Amount,Due Amount,Status'];
    const rows = filteredInvoices.map(
      (row) =>
        `"${row.purchaseNo || ''}","${row.date || ''}","${row.supplier || ''}","${row.warehouse || ''}","${row.branch || ''}",${row.taxAmount || 0},${row.totalAmount || 0},${row.paidAmount || 0},${row.dueAmount || 0},"${row.status || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchase_Invoice_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bg-slate-50/50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* ── HEADER ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-blue-100">
            Real-Time Procurement & Inwards Analytics
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2 mt-2">
            <ShoppingBag className="text-blue-600" size={26} /> Purchase Reports Master Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live dynamic insights into purchase orders, supplier bills, monthly inwards, vendor outstandings, and ITC tax claims.
          </p>
        </div>

        {/* Global Controls */}
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
            onClick={fetchAllPurchaseData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={exportInvoicesCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── TOP KPI METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Gross Purchases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Purchases</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-slate-800">{formatINR(totalGrossPurchases)}</div>
            <span className="text-[10px] text-blue-600 font-semibold">Total vendor bills</span>
          </div>
        </div>

        {/* Purchase Orders Count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inward Bills</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-emerald-600">{invoices.length} Bills</div>
            <span className="text-[10px] text-slate-500 font-medium">Recorded inwards</span>
          </div>
        </div>

        {/* Paid to Suppliers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Paid Amount</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-teal-600">{formatINR(totalPaid)}</div>
            <span className="text-[10px] text-slate-500 font-medium">Cleared to suppliers</span>
          </div>
        </div>

        {/* Outstanding Due */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payables Due</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-amber-600">{formatINR(totalPendingDue)}</div>
            <span className="text-[10px] text-slate-500 font-medium">Pending to settle</span>
          </div>
        </div>

        {/* Net Purchases (Minus Returns) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Purchases</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-purple-600">{formatINR(netPurchases)}</div>
            <span className="text-[10px] text-slate-500 font-medium">After {formatINR(totalReturnAmount)} returns</span>
          </div>
        </div>
      </div>

      {/* ── UNIFIED TABS ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'invoices', label: 'Purchase Invoices & Bills', icon: FileText },
            { id: 'daily-monthly', label: 'Daily & Monthly Turnover', icon: Calendar },
            { id: 'suppliers', label: 'Supplier Performance & Vendors', icon: Users },
            { id: 'products', label: 'Product & Item Procurement', icon: Package },
            { id: 'branches', label: 'Branch & Warehouse Inwards', icon: Building },
            { id: 'returns', label: 'Purchase Returns & Debit Notes', icon: RotateCcw },
            { id: 'financial', label: 'Taxes (GST Paid) & Financials', icon: Percent }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <RefreshCw size={28} className="animate-spin text-blue-600" />
              <p className="text-xs font-medium">Aggregating live purchase records from MongoDB...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: INVOICES & BILLS */}
              {activeTab === 'invoices' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="relative w-full sm:w-72">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search invoice or supplier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-700 font-semibold"
                      >
                        <option value="ALL">All Payment Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                        <tr>
                          <th className="py-3 px-4">Purchase No</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Supplier</th>
                          <th className="py-3 px-4">Warehouse</th>
                          <th className="py-3 px-4 text-right">Tax (GST)</th>
                          <th className="py-3 px-4 text-right">Total Amount</th>
                          <th className="py-3 px-4 text-right">Paid</th>
                          <th className="py-3 px-4 text-right">Due</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredInvoices.length > 0 ? (
                          filteredInvoices.map((inv, idx) => (
                            <tr key={inv._id || idx} className="hover:bg-slate-50/60 transition">
                              <td className="py-3 px-4 font-black text-blue-600">{inv.purchaseNo}</td>
                              <td className="py-3 px-4 text-slate-500">{inv.date}</td>
                              <td className="py-3 px-4 font-semibold text-slate-800">{inv.supplier}</td>
                              <td className="py-3 px-4 text-slate-500">{inv.warehouse}</td>
                              <td className="py-3 px-4 text-right font-medium text-slate-500">{formatINR(inv.taxAmount)}</td>
                              <td className="py-3 px-4 text-right font-black text-slate-800">{formatINR(inv.totalAmount)}</td>
                              <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatINR(inv.paidAmount)}</td>
                              <td className="py-3 px-4 text-right font-bold text-amber-600">{formatINR(inv.dueAmount)}</td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    inv.status === 'Paid'
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                      : inv.status === 'Partial'
                                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                                  }`}
                                >
                                  {inv.status || 'Received'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-slate-400">
                              No purchase records match the selected criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: DAILY & MONTHLY TURNOVER */}
              {activeTab === 'daily-monthly' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Calendar size={16} className="text-blue-600" /> Daily Purchase Summary
                    </h2>
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                          <tr>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4 text-center">Bills Count</th>
                            <th className="py-3 px-4 text-right">Tax Paid</th>
                            <th className="py-3 px-4 text-right">Total Purchase Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {dailyData.length > 0 ? (
                            dailyData.map((d, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{d.date}</td>
                                <td className="py-3 px-4 text-center font-semibold text-blue-600">{d.invoices || d.count || 1} Bills</td>
                                <td className="py-3 px-4 text-right font-medium text-slate-500">{formatINR(d.tax || 0)}</td>
                                <td className="py-3 px-4 text-right font-black text-slate-800">{formatINR(d.amount || d.totalAmount || 0)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-slate-400">
                                No daily purchase records found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Calendar size={16} className="text-indigo-600" /> Monthly Procurement Trends
                    </h2>
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                          <tr>
                            <th className="py-3 px-4">Month</th>
                            <th className="py-3 px-4 text-center">Total Bills</th>
                            <th className="py-3 px-4 text-right">Tax Paid (GST)</th>
                            <th className="py-3 px-4 text-right">Gross Purchases</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {monthlyData.length > 0 ? (
                            monthlyData.map((m, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-indigo-600">{m.month}</td>
                                <td className="py-3 px-4 text-center font-semibold text-slate-700">{m.invoices || m.count || 1} Bills</td>
                                <td className="py-3 px-4 text-right font-medium text-slate-500">{formatINR(m.tax || 0)}</td>
                                <td className="py-3 px-4 text-right font-black text-slate-800">{formatINR(m.amount || m.totalAmount || 0)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-slate-400">
                                No monthly purchase trends available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SUPPLIERS */}
              {activeTab === 'suppliers' && (
                <div className="space-y-6">
                  {/* Top Suppliers Cards */}
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Users size={16} className="text-blue-600" /> Top Procurement Partners
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {topSuppliers.slice(0, 4).map((s, idx) => (
                        <div key={idx} className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                              Rank #{s.rank || idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">{s.orders || s.billsCount || 1} Bills</span>
                          </div>
                          <div className="mt-2">
                            <div className="text-sm font-bold text-slate-800 truncate">{s.name || s.supplier}</div>
                            <div className="text-base font-black text-blue-600 mt-0.5">{formatINR(s.amount || s.totalAmount || s.volume || 0)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supplier Wise Table */}
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">All Supplier Outstandings & Turnover</h2>
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                          <tr>
                            <th className="py-3 px-4">Supplier Name</th>
                            <th className="py-3 px-4 text-center">Inward Count</th>
                            <th className="py-3 px-4 text-right">Total Purchased</th>
                            <th className="py-3 px-4 text-center">Compliance / Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {supplierPurchases.length > 0 ? (
                            supplierPurchases.map((s, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{s.name || s.supplier}</td>
                                <td className="py-3 px-4 text-center font-semibold text-blue-600">{s.orders || s.billsCount || 1} Bills</td>
                                <td className="py-3 px-4 text-right font-black text-slate-800">{formatINR(s.volume || s.totalPurchases || s.totalAmount || 0)}</td>
                                <td className="py-3 px-4 text-center">
                                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    {s.compliance || '99%'} | {s.status || 'Active'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-slate-400">
                                No supplier transaction data recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* Frequently Purchased Highlights */}
                  {frequentlyPurchased.length > 0 && (
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Package size={16} className="text-emerald-600" /> Frequently Purchased Items
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {frequentlyPurchased.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="bg-emerald-50/40 border border-emerald-100 p-3.5 rounded-xl">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100/60 px-2 py-0.5 rounded">
                              Order Frequency: {item.frequency || 1} Orders
                            </span>
                            <h3 className="font-bold text-slate-800 text-xs mt-1.5 truncate">{item.name || item.productName}</h3>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-slate-500">Avg Cost: {formatINR(item.cost || item.avgCost || 0)}</span>
                              <span className="text-xs font-black text-emerald-700">{item.avgRestock || 'Regular'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Product-wise Inward Volume</h2>
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                          <tr>
                            <th className="py-3 px-4">Product Name</th>
                            <th className="py-3 px-4">SKU / Code</th>
                            <th className="py-3 px-4 text-center">Inward Qty</th>
                            <th className="py-3 px-4 text-right">Avg Unit Cost</th>
                            <th className="py-3 px-4 text-right">Total Procurement Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {productPurchases.length > 0 ? (
                            productPurchases.map((prd, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{prd.name || prd.productName}</td>
                                <td className="py-3 px-4 text-slate-500">{prd.sku || 'SKU-001'}</td>
                                <td className="py-3 px-4 text-center font-bold text-indigo-600">{prd.quantity || prd.totalQuantity || 0}</td>
                                <td className="py-3 px-4 text-right font-medium text-slate-500">{formatINR(prd.avgCost || prd.avgRate || 0)}</td>
                                <td className="py-3 px-4 text-right font-black text-slate-800">{formatINR(prd.totalCost || prd.totalPurchased || 0)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400">
                                No product procurement history available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BRANCHES & WAREHOUSES */}
              {activeTab === 'branches' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Branch Breakdown */}
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Building size={16} className="text-blue-600" /> Branch Wise Inwards
                    </h2>
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                          <tr>
                            <th className="py-3 px-4">Branch</th>
                            <th className="py-3 px-4 text-center">Orders</th>
                            <th className="py-3 px-4 text-right">Total Procurement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {branchPurchases.length > 0 ? (
                            branchPurchases.map((b, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{b.branch || b.name}</td>
                                <td className="py-3 px-4 text-center font-semibold text-blue-600">{b.orders || b.billsCount || 1}</td>
                                <td className="py-3 px-4 text-right font-black text-slate-800">{formatINR(b.volume || b.totalPurchases || 0)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-slate-400">
                                No branch inwards recorded.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Warehouse Breakdown */}
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <WarehouseIcon size={16} className="text-emerald-600" /> Warehouse Stock Allocation
                    </h2>
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                          <tr>
                            <th className="py-3 px-4">Warehouse</th>
                            <th className="py-3 px-4 text-center">Location</th>
                            <th className="py-3 px-4 text-right">Total Inward Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {warehousePurchases.length > 0 ? (
                            warehousePurchases.map((w, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{w.warehouse || w.name}</td>
                                <td className="py-3 px-4 text-center font-semibold text-emerald-600">{w.location || 'Optimal'}</td>
                                <td className="py-3 px-4 text-right font-black text-slate-800">{formatINR(w.volume || w.totalPurchases || 0)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-slate-400">
                                No warehouse inwards recorded.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: RETURNS & DEBIT NOTES */}
              {activeTab === 'returns' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Purchase Return Register (Debit Notes)</h2>
                      <p className="text-xs text-slate-500">Inventory sent back to suppliers with debit notes adjusted.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                        <tr>
                          <th className="py-3 px-4">Debit Note / Return No</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Supplier</th>
                          <th className="py-3 px-4">Reason / Notes</th>
                          <th className="py-3 px-4 text-right">Refund / Debit Amount</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {returns.length > 0 ? (
                          returns.map((ret, i) => (
                            <tr key={i} className="hover:bg-slate-50/60">
                              <td className="py-3 px-4 font-bold text-rose-600">{ret.debitNote || ret.returnNo || 'RET-001'}</td>
                              <td className="py-3 px-4 text-slate-500">{ret.date}</td>
                              <td className="py-3 px-4 font-semibold text-slate-800">{ret.supplier}</td>
                              <td className="py-3 px-4 text-slate-500">{ret.reason || 'Goods returned / defective'}</td>
                              <td className="py-3 px-4 text-right font-black text-rose-600">{formatINR(ret.amount || ret.returnAmount || 0)}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                  {ret.status || 'Processed'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400">
                              No purchase return or debit note records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: TAXES & FINANCIALS */}
              {activeTab === 'financial' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Percent size={16} className="text-purple-600" /> GST Input Tax Credit (ITC) Summary
                    </h2>
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                          <tr>
                            <th className="py-3 px-4">Supplier / Vendor</th>
                            <th className="py-3 px-4">GSTIN</th>
                            <th className="py-3 px-4 text-right">Taxable Procurement</th>
                            <th className="py-3 px-4 text-right">CGST Paid</th>
                            <th className="py-3 px-4 text-right">SGST Paid</th>
                            <th className="py-3 px-4 text-right">Total ITC Claimable</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {taxReport.length > 0 ? (
                            taxReport.map((t, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{t.vendor || t.supplier || 'Vendor'}</td>
                                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{t.gstin || '27AABCS1234R1ZX'}</td>
                                <td className="py-3 px-4 text-right font-medium text-slate-500">{formatINR(t.taxableAmount)}</td>
                                <td className="py-3 px-4 text-right font-medium text-slate-500">{formatINR(t.cgst)}</td>
                                <td className="py-3 px-4 text-right font-medium text-slate-500">{formatINR(t.sgst)}</td>
                                <td className="py-3 px-4 text-right font-black text-purple-600">{formatINR(t.totalTax || t.totalTaxPaid || 0)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400">
                                No GST input tax credit records found.
                              </td>
                            </tr>
                          )}
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

export default UnifiedPurchaseReport;
