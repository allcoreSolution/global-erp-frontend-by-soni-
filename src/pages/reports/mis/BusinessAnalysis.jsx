import React, { useState } from 'react';
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

const BusinessAnalysis = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [yearScope, setYearScope] = useState('2024-25');

  // Datasets matching the requested sections
  const topCustomers = [
    { name: 'Aditya Enterprises', totalSales: '₹4,20,000', salesQty: 840, outstanding: '₹20,000' },
    { name: 'Balaji & Sons', totalSales: '₹3,50,000', salesQty: 710, outstanding: '₹0' },
    { name: 'Choudhary Logistics', totalSales: '₹2,80,000', salesQty: 560, outstanding: '₹45,000' }
  ];

  const topProducts = [
    { name: 'Premium Steel Sheet', category: 'Metals', salesVal: '₹5,60,000', margin: '24%' },
    { name: 'Industrial Valve XL', category: 'Machinery', salesVal: '₹4,10,000', margin: '32%' },
    { name: 'Copper Winding Cable', category: 'Electrical', salesVal: '₹3,20,000', margin: '18%' }
  ];

  const fastMoving = [
    { name: 'Solder Wire 1mm', stockSpeed: 'Highly Active', monthlyTurnover: '4.8x', stockAge: '8 Days' },
    { name: 'Hex Bolt M12', stockSpeed: 'Highly Active', monthlyTurnover: '4.2x', stockAge: '12 Days' }
  ];

  const slowMoving = [
    { name: 'Heavy Duty Gear Box 10HP', stockSpeed: 'Stagnant', monthlyTurnover: '0.4x', stockAge: '110 Days' },
    { name: 'Pressure Gauge Grade 4', stockSpeed: 'Stagnant', monthlyTurnover: '0.6x', stockAge: '95 Days' }
  ];

  const lowStock = [
    { name: 'Pneumatic Actuator', currentQty: '5 units', minQty: '15 units', code: 'PROD-2204' },
    { name: 'Hydraulic Seals Kit', currentQty: '12 units', minQty: '40 units', code: 'PROD-1899' },
    { name: 'Silicon Sealant Tube', currentQty: '8 units', minQty: '25 units', code: 'PROD-0554' }
  ];

  const outstanding = {
    receivables: '₹6,40,000',
    payables: '₹4,10,200',
    netStatus: 'Surplus Margin',
    ageingBreakdown: [
      { slab: '0-30 Days Due', val: '₹3,80,000' },
      { slab: '31-60 Days Due', val: '₹1,90,000' },
      { slab: '60+ Days Overdue', val: '₹70,000' }
    ]
  };

  const monthlySummary = [
    { month: 'Apr', rev: '₹4.50 L', exp: '₹3.10 L', profit: '₹1.40 L', customers: 1104 },
    { month: 'May', rev: '₹5.20 L', exp: '₹3.40 L', profit: '₹1.80 L', customers: 1142 },
    { month: 'Jun', rev: '₹4.90 L', exp: '₹3.20 L', profit: '₹1.70 L', customers: 1188 },
    { month: 'Jul', rev: '₹5.80 L', exp: '₹3.80 L', profit: '₹2.00 L', customers: 1210 },
    { month: 'Aug', rev: '₹6.10 L', exp: '₹4.00 L', profit: '₹2.10 L', customers: 1248 }
  ];

  const yearComparison = [
    { year: 'FY 2024-25', rev: '₹33.00 L', profit: '₹11.30 L', margin: '34.2%', YoY: '+14.2%' },
    { year: 'FY 2023-24', rev: '₹28.90 L', profit: '₹9.40 L', margin: '32.5%', YoY: '+11.8%' },
    { year: 'FY 2022-23', rev: '₹25.84 L', profit: '₹8.10 L', margin: '31.3%', YoY: '--' }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Report Category', 'Metric Item', 'Value Parameter'];
    const rows = [
      ['Top Customer', topCustomers[0].name, topCustomers[0].totalSales],
      ['Top Product', topProducts[0].name, topProducts[0].salesVal],
      ['Outstanding Receivables', 'Total', outstanding.receivables],
      ['Low Stock Item Alert', lowStock[0].name, `Qty: ${lowStock[0].currentQty}`],
      ['FY 24-25 Revenue', 'Consolidated', yearComparison[0].rev]
    ];
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Business_Analysis_General_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

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
            <div className="grid grid-cols-2 gap-2 border-b pb-3">
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
              <table className="w-full text-left text-xs">
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
