import React, { useState } from 'react';
import { ShoppingCart, Package, DollarSign, Users, BarChart } from 'lucide-react';

const BranchData = () => {
  const [branches] = useState([
    { id: 'BR-001', name: 'Jaipur HQ Office', users: 18, sales: 850000, purchase: 450000, stock: 12000, expenses: 75000 },
    { id: 'BR-002', name: 'Kota Regional Center', users: 6, sales: 240000, purchase: 180000, stock: 4500, expenses: 22000 }
  ]);

  const [selectedId, setSelectedId] = useState('BR-001');

  const activeBranch = branches.find(b => b.id === selectedId) || branches[0];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Branch Ledger & Transaction Summaries</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Track branch-wise active users counts, sales revenue, raw material purchases, stock levels, and expenses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch sidebar */}
        <div className="border rounded-lg overflow-hidden h-[180px] lg:h-[450px] flex flex-col">
          <div className="bg-slate-100 p-2.5 border-b font-bold text-[11px] sm:text-xs text-slate-700">Active Branches</div>
          <div className="divide-y overflow-y-auto flex-1 no-scrollbar text-[11px] sm:text-xs">
            {branches.map(b => (
              <div
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={`p-3 cursor-pointer transition-colors ${selectedId === b.id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold' : 'hover:bg-slate-50'}`}
              >
                <div>{b.name}</div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 font-mono mt-0.5">{b.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded border border-slate-200 text-xs sm:text-sm font-semibold flex justify-between items-center">
            <span className="text-gray-700">Active Branch Profile:</span>
            <span className="text-indigo-600 font-bold">{activeBranch.name}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
            {/* Sales */}
            <div className="bg-white p-4 border rounded-lg space-y-2">
              <span className="text-slate-500 flex items-center gap-1.5 text-[11px] uppercase font-bold"><ShoppingCart size={13} className="text-indigo-600" /> Sales Revenue</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">₹ {activeBranch.sales.toLocaleString()}</p>
            </div>

            {/* Purchases */}
            <div className="bg-white p-4 border rounded-lg space-y-2">
              <span className="text-slate-500 flex items-center gap-1.5 text-[11px] uppercase font-bold"><Package size={13} className="text-emerald-600" /> Purchases</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">₹ {activeBranch.purchase.toLocaleString()}</p>
            </div>

            {/* Stocks */}
            <div className="bg-white p-4 border rounded-lg space-y-2">
              <span className="text-slate-500 flex items-center gap-1.5 text-[11px] uppercase font-bold"><BarChart size={13} className="text-indigo-600" /> Stock Level</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{activeBranch.stock.toLocaleString()} Items</p>
            </div>

            {/* Expenses */}
            <div className="bg-white p-4 border rounded-lg space-y-2">
              <span className="text-slate-500 flex items-center gap-1.5 text-[11px] uppercase font-bold"><DollarSign size={13} className="text-rose-600" /> Local Expenses</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">₹ {activeBranch.expenses.toLocaleString()}</p>
            </div>

            {/* Users */}
            <div className="bg-white p-4 border rounded-lg space-y-2">
              <span className="text-slate-500 flex items-center gap-1.5 text-[11px] uppercase font-bold"><Users size={13} className="text-amber-600" /> Branch Users</span>
              <p className="font-bold text-gray-900 text-sm sm:text-base">{activeBranch.users} Active Users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchData;
