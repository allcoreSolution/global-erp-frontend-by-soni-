import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingCart, 
  ShoppingBag, 
  DollarSign, 
  Percent, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Filter, 
  Download, 
  Printer, 
  ListCollapse, 
  Layers 
} from 'lucide-react';

const ManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [branch, setBranch] = useState('All');

  // Stats data mapped to the sections requested
  const summaries = {
    sales: {
      title: 'Sales Summary',
      total: '₹18,45,200',
      mtd: '₹4,20,500',
      transactions: 342,
      growth: '+14.2%',
      isPositive: true,
      data: [
        { label: 'Retail sales', val: '₹12,45,200' },
        { label: 'Wholesale sales', val: '₹6,00,000' }
      ]
    },
    purchase: {
      title: 'Purchase Summary',
      total: '₹11,20,400',
      mtd: '₹2,90,100',
      orders: 124,
      growth: '+8.6%',
      isPositive: true,
      data: [
        { label: 'Imported', val: '₹4,50,000' },
        { label: 'Domestic Raw Mat', val: '₹6,70,400' }
      ]
    },
    profit: {
      title: 'Profit Summary',
      total: '₹7,24,800',
      margin: '39.2%',
      growth: '+12.5%',
      isPositive: true,
      data: [
        { label: 'Gross Margin', val: '₹10,50,000' },
        { label: 'Net Profit Margin', val: '₹7,24,800' }
      ]
    },
    expense: {
      title: 'Expense Summary',
      total: '₹3,95,600',
      opex: '₹2,80,000',
      capex: '₹1,15,600',
      growth: '-2.4%',
      isPositive: true,
      data: [
        { label: 'HR & Salaries', val: '₹2,10,000' },
        { label: 'Rent & Admin', val: '₹1,85,600' }
      ]
    },
    cashBank: {
      title: 'Cash & Bank Position',
      total: '₹14,50,000',
      cash: '₹1,20,000',
      bank: '₹13,30,000',
      data: [
        { label: 'ICICI Bank Current', val: '₹8,50,000' },
        { label: 'HDFC Bank Current', val: '₹4,80,000' },
        { label: 'Cash in Safe', val: '₹1,20,000' }
      ]
    },
    receivablesPayables: {
      title: 'Receivable / Payable',
      receivable: '₹6,40,000',
      payable: '₹4,10,200',
      netStatus: 'Creditor Deficit',
      data: [
        { label: 'Receivables (Due)', val: '₹6,40,000' },
        { label: 'Payables (Due)', val: '₹4,10,200' }
      ]
    },
    stock: {
      title: 'Stock Position',
      totalValue: '₹24,80,000',
      totalQty: '18,500 units',
      alerts: '3 items low stock',
      data: [
        { label: 'Main Warehouse', val: '₹18,30,000' },
        { label: 'Transit / Branch', val: '₹6,50,000' }
      ]
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Metric Title', 'Primary Value', 'Secondary Indicator/Breakdown'];
    const rows = [
      ['Sales Total', summaries.sales.total, `MTD: ${summaries.sales.mtd}`],
      ['Purchase Total', summaries.purchase.total, `MTD: ${summaries.purchase.mtd}`],
      ['Net Profit', summaries.profit.total, `Margin: ${summaries.profit.margin}`],
      ['Expense Total', summaries.expense.total, `Opex: ${summaries.expense.opex}`],
      ['Cash & Bank Balance', summaries.cashBank.total, `Bank: ${summaries.cashBank.bank}, Cash: ${summaries.cashBank.cash}`],
      ['Receivables / Payables', `Rec: ${summaries.receivablesPayables.receivable}`, `Pay: ${summaries.receivablesPayables.payable}`],
      ['Stock Valuation', summaries.stock.totalValue, `Qty: ${summaries.stock.totalQty}`]
    ];
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Executive_Management_Dashboard_${financialYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-blue-400/50 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutDashboard className="text-blue-600" size={22} /> Executive Management Dashboard
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Consolidated summaries across critical enterprise sectors: Sales, Purchases, Profits, Expenses, Liquidity, and Inventory.
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
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition"
          >
            <Printer size={14} /> Print Dashboard
          </button>
        </div>
      </div>

      {/* Filters and Section Tabs */}
      <div className="flex flex-col gap-4 no-print border-b pb-4">
        {/* Filters */}
        <div className="bg-slate-50/50 p-3 rounded-lg border border-gray-200/60 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-1 text-gray-600 text-xs font-semibold">
            <Filter size={14} className="text-blue-500" />
            <span>Filters:</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Financial Year</label>
            <select 
              value={financialYear} 
              onChange={(e) => setFinancialYear(e.target.value)}
              className="text-xs border rounded p-1 focus:ring-1 focus:ring-blue-500"
            >
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Branch Location</label>
            <select 
              value={branch} 
              onChange={(e) => setBranch(e.target.value)}
              className="text-xs border rounded p-1 focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All Locations</option>
              <option value="HO">Mumbai Head Office</option>
              <option value="Delhi">Delhi Branch</option>
              <option value="Bangalore">Bangalore Branch</option>
            </select>
          </div>
        </div>

        {/* Dynamic Navigation/Tab Selector */}
        <div className="flex flex-wrap gap-2">
          {['All', 'Sales & Purchases', 'Finance & Profitability', 'Assets & Liquidity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. SALES SUMMARY */}
        {(activeTab === 'All' || activeTab === 'Sales & Purchases') && (
          <div className="border border-gray-200/80 rounded-xl p-5 hover:shadow-md transition duration-200 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sales Summary</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <ShoppingCart size={18} />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{summaries.sales.total}</span>
              <span className="text-[10px] text-gray-500 block mt-1">MTD: {summaries.sales.mtd} | {summaries.sales.transactions} Sales Vouchers</span>
            </div>
            <div className="border-t pt-3 space-y-2">
              {summaries.sales.data.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.label}</span>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <ArrowUpRight size={14} />
              <span>{summaries.sales.growth} growth Year-over-Year</span>
            </div>
          </div>
        )}

        {/* 2. PURCHASE SUMMARY */}
        {(activeTab === 'All' || activeTab === 'Sales & Purchases') && (
          <div className="border border-gray-200/80 rounded-xl p-5 hover:shadow-md transition duration-200 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Purchase Summary</span>
              <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                <ShoppingBag size={18} />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{summaries.purchase.total}</span>
              <span className="text-[10px] text-gray-500 block mt-1">MTD: {summaries.purchase.mtd} | {summaries.purchase.orders} Purchase Bills</span>
            </div>
            <div className="border-t pt-3 space-y-2">
              {summaries.purchase.data.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.label}</span>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <ArrowUpRight size={14} />
              <span>{summaries.purchase.growth} growth Year-over-Year</span>
            </div>
          </div>
        )}

        {/* 3. PROFIT SUMMARY */}
        {(activeTab === 'All' || activeTab === 'Finance & Profitability') && (
          <div className="border border-gray-200/80 rounded-xl p-5 hover:shadow-md transition duration-200 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Profit Summary</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp size={18} />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-emerald-600 tracking-tight">{summaries.profit.total}</span>
              <span className="text-[10px] text-gray-500 block mt-1">Net Margin index: {summaries.profit.margin}</span>
            </div>
            <div className="border-t pt-3 space-y-2">
              {summaries.profit.data.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.label}</span>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <ArrowUpRight size={14} />
              <span>{summaries.profit.growth} Net growth YoY</span>
            </div>
          </div>
        )}

        {/* 4. EXPENSE SUMMARY */}
        {(activeTab === 'All' || activeTab === 'Finance & Profitability') && (
          <div className="border border-gray-200/80 rounded-xl p-5 hover:shadow-md transition duration-200 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expense Summary</span>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <DollarSign size={18} />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{summaries.expense.total}</span>
              <span className="text-[10px] text-gray-500 block mt-1">Opex: {summaries.expense.opex} | Capex: {summaries.expense.capex}</span>
            </div>
            <div className="border-t pt-3 space-y-2">
              {summaries.expense.data.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.label}</span>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <ArrowDownRight size={14} className="text-emerald-600" />
              <span>{summaries.expense.growth} decrease in operational wastes</span>
            </div>
          </div>
        )}

        {/* 5. CASH & BANK POSITION */}
        {(activeTab === 'All' || activeTab === 'Assets & Liquidity') && (
          <div className="border border-gray-200/80 rounded-xl p-5 hover:shadow-md transition duration-200 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cash & Bank Position</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Wallet size={18} />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{summaries.cashBank.total}</span>
              <span className="text-[10px] text-gray-500 block mt-1">Liquid Bank: {summaries.cashBank.bank} | Cash-in-hand: {summaries.cashBank.cash}</span>
            </div>
            <div className="border-t pt-3 space-y-2">
              {summaries.cashBank.data.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.label}</span>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-bold">
              <CheckCircle size={14} />
              <span>Fully reconciled to date</span>
            </div>
          </div>
        )}

        {/* 6. RECEIVABLE / PAYABLE */}
        {(activeTab === 'All' || activeTab === 'Assets & Liquidity') && (
          <div className="border border-gray-200/80 rounded-xl p-5 hover:shadow-md transition duration-200 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Receivables & Payables</span>
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                <Layers size={18} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-gray-500 block">Receivable</span>
                <span className="text-base font-extrabold text-slate-800">{summaries.receivablesPayables.receivable}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Payable</span>
                <span className="text-base font-extrabold text-slate-800">{summaries.receivablesPayables.payable}</span>
              </div>
            </div>
            <div className="border-t pt-3 space-y-2">
              {summaries.receivablesPayables.data.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.label}</span>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <CheckCircle size={14} />
              <span>Net surplus position active</span>
            </div>
          </div>
        )}

        {/* 7. STOCK POSITION */}
        {(activeTab === 'All' || activeTab === 'Sales & Purchases') && (
          <div className="border border-gray-200/80 rounded-xl p-5 hover:shadow-md transition duration-200 bg-white space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock / Inventory Position</span>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Package size={18} />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{summaries.stock.totalValue}</span>
              <span className="text-[10px] text-gray-500 block mt-1">Stock quantity: {summaries.stock.totalQty}</span>
            </div>
            <div className="border-t pt-3 space-y-2">
              {summaries.stock.data.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.label}</span>
                  <span>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
              <AlertTriangle size={14} />
              <span>{summaries.stock.alerts}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManagementDashboard;
