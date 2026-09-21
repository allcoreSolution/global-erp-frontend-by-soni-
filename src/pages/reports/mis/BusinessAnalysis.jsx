import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Users, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle,
  Layers
} from 'lucide-react';
import api from '../../../api';

const BusinessAnalysis = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [yearScope, setYearScope] = useState('2024-25');

  // Datasets matching the requested sections
  
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/mis/business-analysis')
      .then(res => {
        if (res.data && res.data.success) {
          setApiData(res.data.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !apiData) {
    return <div className="p-6 text-center text-slate-500">Loading mis/BusinessAnalysis.jsx...</div>;
  }

  const { topCustomers, topProducts, fastMoving, slowMoving, lowStock, monthlySummary, yearComparison, outstanding } = apiData;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    alert("Export CSV functionality will be implemented here.");
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Compass className="text-indigo-600" size={22} /> Business Analysis & Intelligence
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Advanced reports on top performers, stock trends, receivables analysis, and year-on-year business growth summaries.
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded transition"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition"
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Filters and Navigation Tabs */}
      <div className="flex flex-col gap-4 no-print border-b pb-4">
        <div className="bg-slate-50/50 p-3 rounded-lg border border-gray-200/60 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1 text-gray-600 text-xs font-semibold">
            <Filter size={14} className="text-blue-500" />
            <span>Select View Scope:</span>
          </div>
          <select 
            value={yearScope} 
            onChange={(e) => setYearScope(e.target.value)}
            className="text-xs border rounded p-1 focus:ring-1 focus:ring-blue-500"
          >
            <option value="2024-25">2024-25</option>
            <option value="2023-24">2023-24</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {['All', 'Customers & Products', 'Inventory & Stock', 'Financial & YoY'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. TOP CUSTOMERS */}
        {(activeTab === 'All' || activeTab === 'Customers & Products') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Users size={16} className="text-blue-500" /> Top Customers
              </h3>
              <span className="text-[10px] text-gray-400">By Sales Value</span>
            </div>
            <div className="space-y-3">
              {topCustomers.map((cust, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-gray-800 block">{cust.name}</span>
                    <span className="text-[9px] text-gray-400">Qty Bought: {cust.salesQty}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 block">{cust.totalSales}</span>
                    {parseFloat(cust.outstanding.replace('₹', '').replace(',', '')) > 0 && (
                      <span className="text-[9px] text-rose-500 font-bold block">Bal: {cust.outstanding}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. TOP PRODUCTS */}
        {(activeTab === 'All' || activeTab === 'Customers & Products') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Package size={16} className="text-blue-500" /> Top Products
              </h3>
              <span className="text-[10px] text-gray-400">High Turnover</span>
            </div>
            <div className="space-y-3">
              {topProducts.map((prod, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-gray-800 block">{prod.name}</span>
                    <span className="text-[9px] text-gray-400">Cat: {prod.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 block">{prod.salesVal}</span>
                    <span className="text-[9px] text-emerald-600 font-bold block">Margin: {prod.margin}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3 & 4. SPEED MOVING PRODUCTS (Fast & Slow) */}
        {(activeTab === 'All' || activeTab === 'Inventory & Stock') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-emerald-500" /> Stock Velocity Analysis
              </h3>
              <span className="text-[10px] text-gray-400">Age & Turnover</span>
            </div>
            
            <div className="space-y-4">
              {/* Fast Moving */}
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Fast Moving Products</span>
                <div className="space-y-2">
                  {fastMoving.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-700">{item.name}</span>
                      <span className="text-[10px] text-gray-500">Turnover: {item.monthlyTurnover} ({item.stockAge})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slow Moving */}
              <div className="border-t pt-3">
                <span className="text-[10px] font-bold text-rose-500 uppercase block mb-1">Slow Moving Products</span>
                <div className="space-y-2">
                  {slowMoving.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-700">{item.name}</span>
                      <span className="text-[10px] text-gray-500">Turnover: {item.monthlyTurnover} ({item.stockAge})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. LOW STOCK ITEMS */}
        {(activeTab === 'All' || activeTab === 'Inventory & Stock') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-amber-500" /> Low Stock Alerts
              </h3>
              <span className="text-[10px] text-amber-600 font-bold">Action Needed</span>
            </div>
            <div className="space-y-3">
              {lowStock.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-gray-800 block">{item.name}</span>
                    <span className="text-[9px] text-gray-400">Code: {item.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-500 block">Qty: {item.currentQty}</span>
                    <span className="text-[9px] text-gray-400">Min Reorder: {item.minQty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. OUTSTANDING ANALYSIS */}
        {(activeTab === 'All' || activeTab === 'Financial & YoY') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <DollarSign size={16} className="text-blue-500" /> Outstanding Ageing
              </h3>
              <span className="text-[10px] text-emerald-600 font-semibold">{outstanding.netStatus}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border-b pb-3">
              <div>
                <span className="text-[9px] text-gray-500 block uppercase font-bold">Total Receivables</span>
                <span className="text-base font-extrabold text-slate-800">{outstanding.receivables}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block uppercase font-bold">Total Payables</span>
                <span className="text-base font-extrabold text-slate-800">{outstanding.payables}</span>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              {outstanding.ageingBreakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.slab}</span>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. YEAR-WISE COMPARISON */}
        {(activeTab === 'All' || activeTab === 'Financial & YoY') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Calendar size={16} className="text-indigo-500" /> Year-wise Comparison
              </h3>
              <span className="text-[10px] text-gray-400">Annual Overview</span>
            </div>
            <div className="space-y-3">
              {yearComparison.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-gray-800 block">{item.year}</span>
                    <span className="text-[9px] text-gray-400">Net Profit: {item.profit} ({item.margin})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 block">{item.rev}</span>
                    {item.YoY !== '--' && (
                      <span className="text-[9px] text-emerald-600 font-bold block">{item.YoY} YoY</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. MONTHLY BUSINESS SUMMARY */}
        {(activeTab === 'All' || activeTab === 'Financial & YoY') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 md:col-span-2 lg:col-span-3">
            <div className="flex justify-between items-center border-b pb-3 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Layers size={16} className="text-indigo-600" /> Monthly Business Summary
              </h3>
              <span className="text-[10px] text-gray-400">Consolidated Operational Margin Log</span>
            </div>
            <div className="overflow-x-auto">
              <table className="block w-full overflow-x-auto w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-500 font-semibold border-b">
                    <th className="py-2">Month</th>
                    <th className="py-2">Revenue Generated</th>
                    <th className="py-2">Total Expenses</th>
                    <th className="py-2">Net Operational Profit</th>
                    <th className="py-2 text-right">Active Customer Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthlySummary.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-semibold text-gray-800">{m.month}</td>
                      <td className="py-2.5 text-gray-700 font-medium">{m.rev}</td>
                      <td className="py-2.5 text-rose-600 font-semibold">{m.exp}</td>
                      <td className="py-2.5 text-emerald-600 font-semibold">{m.profit}</td>
                      <td className="py-2.5 text-right font-semibold text-gray-800">{m.customers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BusinessAnalysis;
