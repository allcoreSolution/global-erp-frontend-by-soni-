import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Percent,
  Wallet,
  Package,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building,
  Users,
  Award,
  Layers,
  Landmark,
  ArrowUpRight
} from 'lucide-react';
import api from '../../api';

// Format Indian Currency
const formatINR = (val) => {
  const num = Math.round(Number(val || 0));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

const UnifiedMisReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(true);

  // Live MIS Data States from MongoDB
  const [dashboardData, setDashboardData] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [kpiData, setKpiData] = useState(null);
  const [perfData, setPerfData] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [financialYear, setFinancialYear] = useState('2026-27');

  // Fetch all MIS datasets in parallel
  const fetchAllMisData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, bizRes, kpiRes, perfRes] = await Promise.all([
        api.get('/reports/mis/management-dashboard').catch(() => ({ data: { data: {} } })),
        api.get('/reports/mis/business-analysis').catch(() => ({ data: { data: {} } })),
        api.get('/reports/mis/kpi').catch(() => ({ data: { data: {} } })),
        api.get('/reports/mis/performance-analysis').catch(() => ({ data: { data: {} } }))
      ]);

      setDashboardData(dashRes.data?.data || {});
      setBusinessData(bizRes.data?.data || {});
      setKpiData(kpiRes.data?.data || {});
      setPerfData(perfRes.data?.data || {});
    } catch (error) {
      console.error('Failed to fetch MIS reports data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMisData();
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

  const handlePrint = () => {
    window.print();
  };

  // CSV Export for MIS summaries
  const exportMisCSV = () => {
    const headers = ['Category,Metric / Partner,Value,Status / Ratio'];
    const rows = [];

    // Sales & Purchases
    if (dashboardData?.summaries) {
      rows.push(`"Sales Summary","Total Sales Turnover","${dashboardData.summaries.sales?.total || '₹0'}","${dashboardData.summaries.sales?.transactions || 0} Transactions"`);
      rows.push(`"Purchase Summary","Total Procurement","${dashboardData.summaries.purchase?.total || '₹0'}","${dashboardData.summaries.purchase?.orders || 0} Orders"`);
      rows.push(`"Receivables","Customer Due","${dashboardData.summaries.receivablesPayables?.receivable || '₹0'}","Receivable Asset"`);
      rows.push(`"Payables","Vendor Liabilities","${dashboardData.summaries.receivablesPayables?.payable || '₹0'}","Payable Due"`);
    }

    // Top Customers
    (businessData?.topCustomers || []).forEach(c => {
      rows.push(`"Top Customer","${c.name}","${c.totalSales}","Outstanding: ${c.outstanding}"`);
    });

    // Top Products
    (businessData?.topProducts || []).forEach(p => {
      rows.push(`"Top Product","${p.name}","${p.salesVal}","Margin: ${p.margin}"`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MIS_Management_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const summaries = dashboardData?.summaries || {
    sales: { total: '₹0', mtd: '₹0', transactions: '0', data: [] },
    purchase: { total: '₹0', mtd: '₹0', orders: '0', data: [] },
    profit: { total: '₹0', margin: '0%', data: [] },
    expense: { total: '₹0', opex: '₹0', capex: '₹0', data: [] },
    receivablesPayables: { receivable: '₹0', payable: '₹0', data: [] },
    stock: { totalValue: '₹0', totalQty: '0 Units', alerts: '0 Items', data: [] }
  };

  return (
    <div className="bg-slate-50/50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      
      {/* ── HEADER ── */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-blue-100">
            Executive Information System & Analytics
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2 mt-2">
            <LayoutDashboard className="text-blue-600" size={26} /> MIS Reports & Management Intelligence Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-dimensional view of sales turnover, procurement commitments, KPI scorecards, and branch efficiency directly from MongoDB.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto no-print">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar size={14} className="text-slate-400" />
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none text-xs"
            >
              <option value="2026-27">Financial Year 2026-27</option>
              <option value="2025-26">Financial Year 2025-26</option>
            </select>
          </div>

          <button
            onClick={fetchAllMisData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={exportMisCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-xs"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* ── TOP KPI METRIC CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Gross Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sales Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-slate-800">{summaries.sales?.total || '₹0'}</div>
            <span className="text-[10px] text-blue-600 font-semibold">{summaries.sales?.transactions || 0} Orders Billed</span>
          </div>
        </div>

        {/* Procurement Volume */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Procurement Spend</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-indigo-600">{summaries.purchase?.total || '₹0'}</div>
            <span className="text-[10px] text-slate-500 font-medium">{summaries.purchase?.orders || 0} Inward Bills</span>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer Due</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-emerald-600">{summaries.receivablesPayables?.receivable || '₹0'}</div>
            <span className="text-[10px] text-slate-500 font-medium">Receivables to collect</span>
          </div>
        </div>

        {/* Vendor Payables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vendor Payables</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-amber-600">{summaries.receivablesPayables?.payable || '₹0'}</div>
            <span className="text-[10px] text-slate-500 font-medium">Pending to suppliers</span>
          </div>
        </div>

        {/* Active Stock Units */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Inventory</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-purple-600">{summaries.stock?.totalQty || '0 Units'}</div>
            <span className="text-[10px] text-slate-500 font-medium">{summaries.stock?.alerts || 'Stock in hand'}</span>
          </div>
        </div>
      </div>

      {/* ── UNIFIED TABS ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Management Executive Dashboard', icon: LayoutDashboard },
            { id: 'business', label: 'Business Analysis & Trends', icon: Compass },
            { id: 'kpi', label: 'Key Performance Indicators (KPI)', icon: ShieldCheck },
            { id: 'performance', label: 'Performance & Target Achievement', icon: BarChart3 }
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
              <p className="text-xs font-medium">Aggregating live MIS metrics from MongoDB collections...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: EXECUTIVE DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Sales Snapshot */}
                  <div className="border border-slate-200/80 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Sales Revenue Engine</span>
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Live DB</span>
                    </div>
                    <div>
                      <span className="text-2xl font-black text-slate-800">{summaries.sales?.total}</span>
                      <span className="text-[10px] text-slate-500 block mt-1">MTD: {summaries.sales?.mtd} | {summaries.sales?.transactions} Sales Orders</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                      {(summaries.sales?.data || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between font-medium">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="font-bold text-slate-800">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Purchase Snapshot */}
                  <div className="border border-slate-200/80 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Procurement Commitments</span>
                      <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">Live DB</span>
                    </div>
                    <div>
                      <span className="text-2xl font-black text-indigo-600">{summaries.purchase?.total}</span>
                      <span className="text-[10px] text-slate-500 block mt-1">MTD: {summaries.purchase?.mtd} | {summaries.purchase?.orders} Bills Inward</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
                      {(summaries.purchase?.data || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between font-medium">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="font-bold text-slate-800">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cash Flow & Liquidity */}
                  <div className="border border-slate-200/80 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Receivables vs Payables</span>
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">Net Liquidity</span>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Customer Receivables</span>
                        <span className="font-black text-emerald-600">{summaries.receivablesPayables?.receivable}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-2">
                        <span className="text-slate-500 font-medium">Vendor Payables Due</span>
                        <span className="font-black text-amber-600">{summaries.receivablesPayables?.payable}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 font-medium mt-2">
                        Net Working Capital Requirement: <span className="font-black text-slate-800">{summaries.receivablesPayables?.payable}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BUSINESS ANALYSIS */}
              {activeTab === 'business' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Customers */}
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users size={16} className="text-blue-600" /> Top Client Partners (By Turnover)
                      </h2>
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                            <tr>
                              <th className="py-3 px-4">Customer Name</th>
                              <th className="py-3 px-4 text-center">Items Bought</th>
                              <th className="py-3 px-4 text-right">Total Revenue</th>
                              <th className="py-3 px-4 text-right">Balance Due</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {(businessData?.topCustomers || []).map((c, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                                <td className="py-3 px-4 text-center font-semibold text-blue-600">{c.salesQty} Units</td>
                                <td className="py-3 px-4 text-right font-black text-slate-800">{c.totalSales}</td>
                                <td className="py-3 px-4 text-right font-bold text-amber-600">{c.outstanding}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Top Products */}
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Package size={16} className="text-emerald-600" /> Leading Revenue Products
                      </h2>
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                            <tr>
                              <th className="py-3 px-4">Product Name</th>
                              <th className="py-3 px-4">Category</th>
                              <th className="py-3 px-4 text-right">Sales Volume</th>
                              <th className="py-3 px-4 text-center">Margin %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {(businessData?.topProducts || []).map((p, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                                <td className="py-3 px-4 text-slate-500">{p.category}</td>
                                <td className="py-3 px-4 text-right font-black text-slate-800">{p.salesVal}</td>
                                <td className="py-3 px-4 text-center font-bold text-emerald-600">{p.margin}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Stock Speed & Ageing Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Fast vs Slow Moving */}
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Inventory Velocity Audit</h2>
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                            <tr>
                              <th className="py-3 px-4">Item Name</th>
                              <th className="py-3 px-4 text-center">Velocity</th>
                              <th className="py-3 px-4 text-center">Monthly Turnover</th>
                              <th className="py-3 px-4 text-right">Ageing Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {[...(businessData?.fastMoving || []), ...(businessData?.slowMoving || [])].map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{item.name}</td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      item.stockSpeed.includes('Active')
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                    }`}
                                  >
                                    {item.stockSpeed}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center font-bold text-indigo-600">{item.monthlyTurnover}</td>
                                <td className="py-3 px-4 text-right font-medium text-slate-500">{item.stockAge}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Payables Ageing Analysis */}
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3">Vendor Payables Ageing Buckets</h2>
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                            <tr>
                              <th className="py-3 px-4">Ageing Bucket</th>
                              <th className="py-3 px-4 text-right">Pending Amount</th>
                              <th className="py-3 px-4 text-center">Risk Level</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {(businessData?.outstanding?.ageingBreakdown || []).map((b, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{b.bucket}</td>
                                <td className="py-3 px-4 text-right font-black text-slate-800">{b.amount}</td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      b.bucket === '0-30 Days'
                                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                                    }`}
                                  >
                                    {b.bucket === '0-30 Days' ? 'Current Period' : 'Followup Needed'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: KPI REPORTS */}
              {activeTab === 'kpi' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(kpiData?.kpiList || []).map((kpi, idx) => (
                      <div key={idx} className="border border-slate-200/80 rounded-xl p-5 bg-white space-y-4 shadow-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{kpi.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kpi.color}`}>
                            {kpi.status}
                          </span>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-slate-800">{kpi.value}</div>
                          <span className="text-[10px] text-slate-500 font-medium">Target: {kpi.target}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold text-slate-600">
                            <span>Score Fulfillment</span>
                            <span>{kpi.pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, kpi.pct)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PERFORMANCE ANALYSIS */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  {/* Targets Comparison Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-200/80 rounded-xl p-5 bg-white shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Sales Target Performance</span>
                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">Growth +14.5%</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-xs text-slate-500">Achieved Real Turnover</span>
                          <div className="text-2xl font-black text-blue-600">{formatINR(perfData?.salesVsTarget?.achieved)}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500">Benchmark Target</span>
                          <div className="text-base font-bold text-slate-800">{formatINR(perfData?.salesVsTarget?.target)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200/80 rounded-xl p-5 bg-white shadow-xs space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Procurement Spend Budget</span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Budget Controlled</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-xs text-slate-500">Actual Spend</span>
                          <div className="text-2xl font-black text-indigo-600">{formatINR(perfData?.purchaseVsTarget?.spent)}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500">Budget Limit</span>
                          <div className="text-base font-bold text-slate-800">{formatINR(perfData?.purchaseVsTarget?.budget)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Branch & Staff Performance */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Branch Breakdown */}
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Building size={16} className="text-blue-600" /> Branch Revenue Allocation
                      </h2>
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                            <tr>
                              <th className="py-3 px-4">Branch Name</th>
                              <th className="py-3 px-4 text-right">Target</th>
                              <th className="py-3 px-4 text-right">Achieved</th>
                              <th className="py-3 px-4 text-center">Fulfillment</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {(perfData?.branchPerf || []).map((b, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{b.name}</td>
                                <td className="py-3 px-4 text-right text-slate-500">{b.target}</td>
                                <td className="py-3 px-4 text-right font-black text-blue-600">{b.achieved}</td>
                                <td className="py-3 px-4 text-center font-bold text-emerald-600">{b.pct}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Staff Team */}
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Users size={16} className="text-indigo-600" /> Operational Team Scorecard
                      </h2>
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/60">
                            <tr>
                              <th className="py-3 px-4">Employee</th>
                              <th className="py-3 px-4">Role / Department</th>
                              <th className="py-3 px-4 text-center">Score</th>
                              <th className="py-3 px-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {(perfData?.employeePerf || []).map((e, i) => (
                              <tr key={i} className="hover:bg-slate-50/60">
                                <td className="py-3 px-4 font-bold text-slate-800">{e.name}</td>
                                <td className="py-3 px-4 text-slate-500">{e.role}</td>
                                <td className="py-3 px-4 text-center font-bold text-indigo-600">{e.score}</td>
                                <td className="py-3 px-4 text-center">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    {e.rate}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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

export default UnifiedMisReport;
