import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Building, 
  Users, 
  Award, 
  Percent, 
  ShoppingBag, 
  ShoppingCart, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle, 
  ArrowUpRight 
} from 'lucide-react';
import api from '../../../api';

const PerformanceAnalysis = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [period, setPeriod] = useState('This Month');

  // Datasets matching the requested sections
  
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/mis/performance-analysis')
      .then(res => {
        if (res.data && res.data.success) {
          setApiData(res.data.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !apiData) {
    return <div className="p-6 text-center text-slate-500">Loading mis/PerformanceAnalysis.jsx...</div>;
  }

  const { salesVsTarget, purchaseVsTarget, margins, branchPerf, deptPerf, employeePerf, salespersonPerf } = apiData;

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
            <BarChart3 className="text-indigo-600" size={22} /> Performance Analysis Report
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Compare target vs performance metrics across Sales, Purchases, Branch margins, Departments, and Staff efficiency.
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

      {/* Filters and Navigation Tab list */}
      <div className="flex flex-col gap-4 no-print border-b pb-4">
        <div className="bg-slate-50/50 p-3 rounded-lg border border-gray-200/60 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1 text-gray-600 text-xs font-semibold">
            <Filter size={14} className="text-blue-500" />
            <span>Select Period:</span>
          </div>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs border rounded p-1 focus:ring-1 focus:ring-blue-500"
          >
            <option value="This Month">This Month</option>
            <option value="Last Quarter">Last Quarter</option>
            <option value="Financial Year">Financial Year</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {['All', 'Targets & Margins', 'Organizational Unit', 'People Performance'].map((tab) => (
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

      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. SALES VS TARGET */}
        {(activeTab === 'All' || activeTab === 'Targets & Margins') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Sales vs Target</h3>
              <div className="p-2 rounded bg-blue-50 text-indigo-600"><ShoppingCart size={18} /></div>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-extrabold text-slate-800">₹{(salesVsTarget.achieved/100000).toFixed(2)} L</span>
              <span className="text-[10px] text-gray-500 block">Target: ₹{(salesVsTarget.target/100000).toFixed(2)} L</span>
            </div>
            <div className="space-y-1">
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${salesVsTarget.pct}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                <span>{salesVsTarget.pct}% Achieved</span>
                <span className="text-emerald-600 font-bold">{salesVsTarget.growth} YoY</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. PURCHASE VS TARGET */}
        {(activeTab === 'All' || activeTab === 'Targets & Margins') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Purchase vs Target</h3>
              <div className="p-2 rounded bg-orange-50 text-orange-600"><ShoppingBag size={18} /></div>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-extrabold text-slate-800">₹{(purchaseVsTarget.spent/100000).toFixed(2)} L</span>
              <span className="text-[10px] text-gray-500 block">Budget Cap: ₹{(purchaseVsTarget.budget/100000).toFixed(2)} L</span>
            </div>
            <div className="space-y-1">
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${purchaseVsTarget.pct}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                <span>{purchaseVsTarget.pct}% Expended</span>
                <span className="text-emerald-600 font-bold">{purchaseVsTarget.savings}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. PROFIT MARGIN */}
        {(activeTab === 'All' || activeTab === 'Targets & Margins') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Profit Margin Index</h3>
              <div className="p-2 rounded bg-emerald-50 text-emerald-600"><Percent size={18} /></div>
            </div>
            <div className="space-y-3">
              {margins.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-gray-700 block">{m.title}</span>
                    <span className="text-[9px] text-gray-400">Target: {m.target}</span>
                  </div>
                  <span className="font-extrabold text-emerald-600 text-sm">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. BRANCH PERFORMANCE */}
        {(activeTab === 'All' || activeTab === 'Organizational Unit') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Branch Performance</h3>
              <div className="p-2 rounded bg-indigo-50 text-indigo-600"><Building size={18} /></div>
            </div>
            <div className="space-y-3">
              {branchPerf.map((branch, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span>{branch.name}</span>
                    <span>{branch.achieved} / {branch.target}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(branch.pct, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DEPARTMENT PERFORMANCE */}
        {(activeTab === 'All' || activeTab === 'Organizational Unit') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Department Performance</h3>
              <div className="p-2 rounded bg-purple-50 text-purple-600"><Users size={18} /></div>
            </div>
            <div className="space-y-3">
              {deptPerf.map((dept, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-gray-700 block">{dept.name}</span>
                    <span className="text-[9px] text-gray-400">HOD: {dept.lead}</span>
                  </div>
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{dept.efficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. EMPLOYEE PERFORMANCE */}
        {(activeTab === 'All' || activeTab === 'People Performance') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Employee Ratings</h3>
              <div className="p-2 rounded bg-rose-50 text-rose-600"><Award size={18} /></div>
            </div>
            <div className="space-y-3">
              {employeePerf.map((emp, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-gray-800 block">{emp.name}</span>
                    <span className="text-[9px] text-gray-400">{emp.role}</span>
                  </div>
                  <span className="font-extrabold text-indigo-600">{emp.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SALESPERSON PERFORMANCE */}
        {(activeTab === 'All' || activeTab === 'People Performance') && (
          <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 md:col-span-2 lg:col-span-3">
            <div className="flex justify-between items-center border-b pb-3 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Salesperson Target Leaderboard</h3>
              <span className="text-[10px] text-gray-400">Commission incentive tracking active</span>
            </div>
            <div className="overflow-x-auto">
              <table className="block w-full overflow-x-auto w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-500 font-semibold border-b">
                    <th className="py-2">Salesperson Name</th>
                    <th className="py-2">Sales Target</th>
                    <th className="py-2">Achieved Volume</th>
                    <th className="py-2">Incentive Commission</th>
                    <th className="py-2 text-right">Fulfillment Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salespersonPerf.map((sales, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-semibold text-gray-800">{sales.name}</td>
                      <td className="py-2.5 text-gray-600">{sales.target}</td>
                      <td className="py-2.5 text-emerald-600 font-semibold">{sales.achieved}</td>
                      <td className="py-2.5 text-indigo-600 font-semibold">{sales.commission}</td>
                      <td className="py-2.5 text-right font-extrabold">
                        {((parseFloat(sales.achieved.replace('₹', '').replace(' L', '')) / parseFloat(sales.target.replace('₹', '').replace(' L', ''))) * 100).toFixed(1)}%
                      </td>
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

export default PerformanceAnalysis;
