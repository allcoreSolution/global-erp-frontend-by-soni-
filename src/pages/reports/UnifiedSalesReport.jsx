import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  FileText,
  Calendar,
  Package,
  Users,
  Building,
  RotateCcw,
  DollarSign,
  Download,
  Printer,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Percent,
  Warehouse as WarehouseIcon,
  ShieldAlert
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

const UnifiedSalesReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'invoices';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);

  // Real Dynamic Data States
  const [invoices, setInvoices] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [customerSales, setCustomerSales] = useState([]);
  const [branchSales, setBranchSales] = useState([]);
  const [warehouseSales, setWarehouseSales] = useState([]);
  const [returns, setReturns] = useState([]);
  const [taxReport, setTaxReport] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch all real sales report datasets in parallel
  const fetchAllSalesData = async () => {
    setIsLoading(true);
    try {
      const [
        invRes,
        dailyRes,
        monthlyRes,
        prdRes,
        custRes,
        branchRes,
        whRes,
        retRes,
        taxRes
      ] = await Promise.all([
        api.get('/reports/sales/invoice-register').catch(() => ({ data: { data: [] } })),
        api.get('/reports/sales/daily').catch(() => ({ data: { data: [] } })),
        api.get('/reports/sales/monthly').catch(() => ({ data: { data: [] } })),
        api.get('/reports/sales/analysis/product-wise').catch(() => ({ data: { data: [] } })),
        api.get('/reports/sales/analysis/customer-wise').catch(() => ({ data: { data: [] } })),
        api.get('/reports/sales/analysis/branch-wise').catch(() => ({ data: { data: [] } })),
        api.get('/reports/sales/analysis/warehouse-wise').catch(() => ({ data: { data: [] } })),
        api.get('/reports/sales/return-report').catch(() => ({ data: { data: [] } })),
        api.get('/reports/sales/financial/tax').catch(() => ({ data: { data: [] } }))
      ]);

      setInvoices(invRes.data?.data || []);
      setDailyData(dailyRes.data?.data || []);
      setMonthlyData(monthlyRes.data?.data || []);
      setProductSales(prdRes.data?.data || []);
      setCustomerSales(custRes.data?.data || []);
      setBranchSales(branchRes.data?.data || []);
      setWarehouseSales(whRes.data?.data || []);
      setReturns(retRes.data?.data || []);
      setTaxReport(taxRes.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch sales reports data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSalesData();
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
  const totalGrossSales = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);
  }, [invoices]);

  const totalTaxAmount = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + Number(inv.taxAmount || 0), 0);
  }, [invoices]);

  const totalReturnAmount = useMemo(() => {
    return returns.reduce((acc, ret) => acc + Number(ret.returnAmount || 0), 0);
  }, [returns]);

  const totalUnitsSold = useMemo(() => {
    return productSales.reduce((acc, prd) => acc + Number(prd.unitsSold || 0), 0);
  }, [productSales]);

  const netSalesRealized = Math.max(0, totalGrossSales - totalReturnAmount);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = searchTerm === '' ||
        inv.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;

      const matchFrom = !fromDate || (inv.date && inv.date >= fromDate);
      const matchTo = !toDate || (inv.date && inv.date <= toDate);

      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [invoices, searchTerm, statusFilter, fromDate, toDate]);

  // Export Invoices CSV
  const exportInvoicesCSV = () => {
    if (!filteredInvoices || filteredInvoices.length === 0) return;
    const headers = ['Invoice No,Date,Customer,GST/PAN,Taxable Amount,Tax Amount,Total Amount,Status'];
    const rows = filteredInvoices.map(row =>
      `"${row.invoiceNo || ''}","${row.date || ''}","${row.customer || ''}","${row.gstNo || ''}",${row.taxableAmount || 0},${row.taxAmount || 0},${row.totalAmount || 0},"${row.status || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Invoice_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bg-slate-50/50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      
      {/* ── HEADER ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-100">
            Real-Time Revenue & Order Analytics
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2 mt-2">
            <TrendingUp className="text-emerald-600" size={26} /> Sales & Revenue Reports Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete dynamic breakdown of tax invoices, customer buying behaviors, top-selling inventory, daily/monthly turnover and sales returns.
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
            onClick={fetchAllSalesData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={exportInvoicesCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── TOP KPI METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Gross Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-slate-800">{formatINR(totalGrossSales)}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">Total revenue billed</span>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Invoices Issued</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-blue-600">{invoices.length} Orders</div>
            <span className="text-[10px] text-slate-500 font-medium">Billed to customers</span>
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Units Dispatched</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-indigo-600">{totalUnitsSold} Units</div>
            <span className="text-[10px] text-slate-500 font-medium">Products delivered</span>
          </div>
        </div>

        {/* Tax Collected */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tax Collected</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Percent size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-purple-600">{formatINR(totalTaxAmount)}</div>
            <span className="text-[10px] text-slate-500 font-medium">GST & Surcharges</span>
          </div>
        </div>

        {/* Net Realized Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Realized</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-teal-600">{formatINR(netSalesRealized)}</div>
            <span className="text-[10px] text-slate-500 font-medium">Minus {formatINR(totalReturnAmount)} returns</span>
          </div>
        </div>
      </div>

      {/* ── UNIFIED TABS ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'invoices', label: 'Invoice Register & Bills', icon: FileText },
            { id: 'daily-monthly', label: 'Daily & Monthly Turnover', icon: Calendar },
            { id: 'products', label: 'Product-wise & Top Selling', icon: Package },
            { id: 'customers', label: 'Customer-wise Performance', icon: Users },
            { id: 'returns', label: 'Sales Returns & Refunds', icon: RotateCcw },
            { id: 'branches', label: 'Branch & Warehouse Performance', icon: Building }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-emerald-600 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <RefreshCw size={28} className="animate-spin text-emerald-600" />
              <p className="text-xs font-medium">Aggregating live sales records from MongoDB...</p>
            </div>
          ) : (
            <>
              {/* ─────────────────────────────────────────────────────────── */}
              {/* TAB 1: INVOICE REGISTER & BILLS */}
              {/* ─────────────────────────────────────────────────────────── */}
              {activeTab === 'invoices' && (
                <div className="space-y-4">
                  {/* Search and Status Filters */}
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search invoice number or customer name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                      {['ALL', 'Completed', 'Pending', 'Paid'].map(st => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition ${
                            statusFilter === st
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Invoices Table */}
                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Invoice No</th>
                          <th className="py-3 px-4">Customer Name</th>
                          <th className="py-3 px-4">GST / ID</th>
                          <th className="py-3 px-4 text-right">Taxable Value</th>
                          <th className="py-3 px-4 text-right">Tax (GST)</th>
                          <th className="py-3 px-4 text-right">Grand Total</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredInvoices.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="text-center py-12 text-slate-400">
                              No sales invoices found matching current filter.
                            </td>
                          </tr>
                        ) : (
                          filteredInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">{inv.date || '—'}</td>
                              <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                                <span className="text-emerald-600">{inv.invoiceNo}</span>
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-700">{inv.customer}</td>
                              <td className="py-3 px-4 font-mono text-slate-500">{inv.gstNo}</td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                                {formatINR(inv.taxableAmount)}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-purple-600">
                                {formatINR(inv.taxAmount)}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                                {formatINR(inv.totalAmount)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                  inv.status === 'Completed' || inv.status === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  <CheckCircle2 size={12} /> {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 pt-2 font-medium">
                    <span>Showing <strong>{filteredInvoices.length}</strong> tax invoices</span>
                    <span>Total Billed: <strong>{formatINR(filteredInvoices.reduce((a, b) => a + (b.totalAmount || 0), 0))}</strong></span>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────── */}
              {/* TAB 2: DAILY & MONTHLY TURNOVER */}
              {/* ─────────────────────────────────────────────────────────── */}
              {activeTab === 'daily-monthly' && (
                <div className="space-y-6">
                  {/* Daily Turnover Table */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar size={14} className="text-emerald-600" /> Day-by-Day Sales Breakdown
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4 text-center">Invoices</th>
                            <th className="py-3 px-4 text-right">Gross Value</th>
                            <th className="py-3 px-4 text-right">Tax (GST)</th>
                            <th className="py-3 px-4 text-right">Discounts</th>
                            <th className="py-3 px-4 text-right font-black">Net Sales Amount</th>
                            <th className="py-3 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {dailyData.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-mono font-bold text-slate-800">{d.date}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                                  {d.totalInvoices} orders
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">{formatINR(d.grossAmount)}</td>
                              <td className="py-3 px-4 text-right font-mono text-purple-600 font-bold">{formatINR(d.taxAmount)}</td>
                              <td className="py-3 px-4 text-right font-mono text-slate-500">{formatINR(d.discountAmount)}</td>
                              <td className="py-3 px-4 text-right font-mono font-black text-emerald-600">{formatINR(d.netAmount)}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                  {d.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Monthly Summary */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-indigo-600" /> Monthly Consolidated Turnover
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {monthlyData.map((m) => (
                        <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-white flex justify-between items-center shadow-xs">
                          <div>
                            <div className="text-sm font-black text-slate-800">{m.month}</div>
                            <span className="text-[11px] text-slate-500 font-medium">{m.totalInvoices} Invoices billed</span>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-black font-mono text-emerald-600">{formatINR(m.netAmount)}</div>
                            <span className="text-[10px] text-purple-600 font-semibold">Taxes: {formatINR(m.taxAmount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────── */}
              {/* TAB 3: PRODUCT-WISE & TOP SELLING ITEMS */}
              {/* ─────────────────────────────────────────────────────────── */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Item SKU / Code</th>
                          <th className="py-3 px-4">Product Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 text-center">Units Sold</th>
                          <th className="py-3 px-4 text-right">Avg Unit Price</th>
                          <th className="py-3 px-4 text-right font-black">Gross Revenue</th>
                          <th className="py-3 px-4 text-center">Performance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {productSales.length === 0 ? (
                          <tr><td colSpan="7" className="text-center py-10 text-slate-400">No product items found.</td></tr>
                        ) : (
                          productSales.map((p, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-mono font-bold text-indigo-600">{p.sku}</td>
                              <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                              <td className="py-3 px-4 text-slate-500">{p.category}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-600 text-[11px]">
                                  {p.unitsSold} pcs
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">{formatINR(p.avgPrice)}</td>
                              <td className="py-3 px-4 text-right font-mono font-black text-emerald-600">{formatINR(p.grossRevenue)}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────── */}
              {/* TAB 4: CUSTOMER-WISE PERFORMANCE */}
              {/* ─────────────────────────────────────────────────────────── */}
              {activeTab === 'customers' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Customer ID</th>
                          <th className="py-3 px-4">Customer Name</th>
                          <th className="py-3 px-4">Client Type</th>
                          <th className="py-3 px-4 text-center">Orders Placed</th>
                          <th className="py-3 px-4 text-right">Avg Order Value</th>
                          <th className="py-3 px-4 text-right font-black">Total Revenue Spent</th>
                          <th className="py-3 px-4 text-center">Last Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {customerSales.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono font-bold text-blue-600">{c.id}</td>
                            <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                            <td className="py-3 px-4 text-slate-500">{c.type}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-600 text-[11px]">
                                {c.orders} invoices
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">{formatINR(c.avgOrderValue)}</td>
                            <td className="py-3 px-4 text-right font-mono font-black text-emerald-600">{formatINR(c.totalSpent)}</td>
                            <td className="py-3 px-4 text-center font-mono text-slate-500">{c.lastOrderDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────── */}
              {/* TAB 5: SALES RETURNS & REFUNDS */}
              {/* ─────────────────────────────────────────────────────────── */}
              {activeTab === 'returns' && (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Return No</th>
                          <th className="py-3 px-4">Invoice Ref</th>
                          <th className="py-3 px-4">Return Date</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Return Reason</th>
                          <th className="py-3 px-4 text-right font-black">Refund Amount</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {returns.length === 0 ? (
                          <tr><td colSpan="7" className="text-center py-10 text-slate-400">No sales return records found.</td></tr>
                        ) : (
                          returns.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-mono font-bold text-rose-600">{r.returnNo}</td>
                              <td className="py-3 px-4 font-bold text-slate-700">{r.invoiceNo}</td>
                              <td className="py-3 px-4 font-mono text-slate-500">{r.date}</td>
                              <td className="py-3 px-4 font-bold text-slate-800">{r.customer}</td>
                              <td className="py-3 px-4 text-slate-600">{r.reason}</td>
                              <td className="py-3 px-4 text-right font-mono font-black text-rose-600">{formatINR(r.returnAmount)}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────── */}
              {/* TAB 6: BRANCH & WAREHOUSE PERFORMANCE */}
              {/* ─────────────────────────────────────────────────────────── */}
              {activeTab === 'branches' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Branch Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Building size={14} className="text-indigo-600" /> Branch Revenue Performance
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3">Branch Name</th>
                            <th className="py-2.5 px-3">Manager</th>
                            <th className="py-2.5 px-3 text-center">Orders</th>
                            <th className="py-2.5 px-3 text-right">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {branchSales.map((b, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-800">{b.name}</td>
                              <td className="py-2.5 px-3 text-slate-500">{b.manager}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-blue-600">{b.totalOrders}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">{formatINR(b.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Warehouse Dispatches */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <WarehouseIcon size={14} className="text-purple-600" /> Warehouse Dispatches & Stock Out
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-bold text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3">Warehouse</th>
                            <th className="py-2.5 px-3">Location</th>
                            <th className="py-2.5 px-3 text-center">Items Dispatched</th>
                            <th className="py-2.5 px-3 text-right">Dispatched Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {warehouseSales.map((w, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-800">{w.name}</td>
                              <td className="py-2.5 px-3 text-slate-500">{w.location}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-purple-600">{w.itemsDispatched} pcs</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">{formatINR(w.revenue)}</td>
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

export default UnifiedSalesReport;
