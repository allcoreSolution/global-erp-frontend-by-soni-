import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Layers,
  Calendar,
  FolderMinus,
  BookOpen,
  TrendingUp,
  LineChart,
  Home,
  GitBranch,
  ArrowRight,
  TrendingDown,
  Percent
} from 'lucide-react';

const StockLedgerReports = () => {
  const navigate = useNavigate();

  const stockReportsList = [
    {
      title: 'Stock Summary',
      desc: 'Overall summaries of all inventory category units, current stock holdings, and asset valuation.',
      icon: Package,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Stock Summary',
      to: '/reports/stock/stock-summary'
    },
    {
      title: 'Current Stock',
      desc: 'Realtime lookup on inventory stocks, physical counts, and committed vs available stock.',
      icon: Layers,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Check Current Stock',
      to: '/reports/stock/current-stock'
    },
    {
      title: 'Opening Stock',
      desc: 'Statements of initial inventory levels uploaded at the beginning of the financial year cycle.',
      icon: Calendar,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Open Opening Stock Logs',
      to: '/reports/stock/opening-stock'
    },
    {
      title: 'Closing Stock',
      desc: 'Reconciled statements of remaining stocks left in warehouses after sales/purchases.',
      icon: FolderMinus,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      actionText: 'Track Closing Balance',
      to: '/reports/stock/closing-stock'
    },
    {
      title: 'Stock Ledger',
      desc: 'Detailed product ledger statements tracing individual incoming/outgoing transactions.',
      icon: BookOpen,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'View Stock Ledger Ledger',
      to: '/reports/stock/stock-ledger'
    },
    {
      title: 'Stock Movement',
      desc: 'Audit logs tracking dynamic stock transfer shifts from inventory sources to destinations.',
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      actionText: 'Open Movement Registers',
      to: '/reports/stock/stock-movement'
    },
    {
      title: 'Stock Valuation',
      desc: 'Evaluate stock worth indices using FIFO, LIFO, or Weighted Average Costing models.',
      icon: Percent,
      color: 'text-slate-600 bg-slate-50 border-slate-100',
      actionText: 'Verify Valuations',
      to: '/reports/stock/stock-valuation'
    },
    {
      title: 'Warehouse-wise Stock',
      desc: 'Breakdown reports of inventory stocks stored across specific local warehouses.',
      icon: Home,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      actionText: 'Audit Warehouse Balances',
      to: '/reports/stock/warehouse-wise-stock'
    },
    {
      title: 'Branch-wise Stock',
      desc: 'Track and compare regional branch stocks distributions and stock depletion indices.',
      icon: GitBranch,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      actionText: 'View Branch-wise Balance',
      to: '/reports/stock/branch-wise-stock'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-indigo-600" size={22} /> Stock & Inventory Statements Portal
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Monitor and track inventory summaries, opening/closing stocks ledger registers, and warehouse distributions.
        </p>
      </div>

      {/* Grid of Stock Reports Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {stockReportsList.map((rep, idx) => {
          const IconComponent = rep.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(rep.to)}
              className="border border-blue-200/60 rounded-xl p-4 bg-slate-50/40 hover:bg-blue-50/20 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className={`p-2 rounded-lg border ${rep.color}`}>
                    <IconComponent size={18} />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {rep.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-normal">
                    {rep.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-4 text-[10px] sm:text-xs font-bold text-indigo-600 group-hover:translate-x-1.5 transition-transform duration-200">
                {rep.actionText} <ArrowRight size={13} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StockLedgerReports;
