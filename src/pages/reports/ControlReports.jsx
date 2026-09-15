import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  FolderMinus,
  Trash2,
  CalendarDays,
  Sliders,
  Move,
  ArrowRight,
  TrendingDown,
  LineChart
} from 'lucide-react';

const ControlReports = () => {
  const navigate = useNavigate();

  const controlReportsList = [
    {
      title: 'Low Stock Report',
      desc: 'Identify products dipping below threshold margins to trigger reorders and prevent stockouts.',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'View Low Stock Items',
      to: '/reports/stock/low-stock',
      badge: 'Attention'
    },
    {
      title: 'Reorder Report',
      desc: 'Generated inventory procurement schedules displaying dynamic quantities required for refill.',
      icon: RefreshCw,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'Check Reorder Lists',
      to: '/coming-soon'
    },
    {
      title: 'Overstock Report',
      desc: 'Locate products holding redundant capitals, stagnant turnovers, and dead inventories.',
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Review Overstocks',
      to: '/coming-soon'
    },
    {
      title: 'Out of Stock',
      desc: 'Alert sheets highlighting depleted units having zero balances in current holdings.',
      icon: FolderMinus,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      actionText: 'Check Out of Stock',
      to: '/coming-soon',
      badge: 'Critical'
    },
    {
      title: 'Damaged Stock',
      desc: 'Inventory write-offs registries cataloging damaged parts, transits breakage, or return rejects.',
      icon: Trash2,
      color: 'text-slate-600 bg-slate-50 border-slate-100',
      actionText: 'Audit Damaged Stock',
      to: '/coming-soon'
    },
    {
      title: 'Expired Stock',
      desc: 'Audit tables display list of batches exceeding expiry thresholds to initiate waste logs.',
      icon: CalendarDays,
      color: 'text-red-600 bg-red-50 border-red-100',
      actionText: 'Audit Expired Items',
      to: '/coming-soon'
    },
    {
      title: 'Stock Adjustment Report',
      desc: 'Discrepancy logs reconciliation reports matching physical verification audits vs server databases.',
      icon: Sliders,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      actionText: 'Track Adjustments Log',
      to: '/coming-soon'
    },
    {
      title: 'Stock Transfer Report',
      desc: 'Inter-warehouse dynamic stock shipping logs, transit status, and delivery schedules.',
      icon: Move,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      actionText: 'Audit Transfers Logs',
      to: '/coming-soon'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Sliders className="text-indigo-600" size={22} /> Inventory Control & Discrepancies Reports
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Monitor low stock triggers, reorder points, warehouse adjustments log matrices, and damaged/expired stocks registers.
        </p>
      </div>

      {/* Grid of Control Reports Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {controlReportsList.map((rep, idx) => {
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
                  {rep.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      rep.badge === 'Critical' ? 'bg-red-105 text-red-700 bg-red-50' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {rep.badge}
                    </span>
                  )}
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

export default ControlReports;
