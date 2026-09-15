import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Calendar,
  FileText,
  RotateCcw,
  Percent,
  ArrowRight,
  TrendingDown,
  LineChart,
  Layers
} from 'lucide-react';

const PurchaseSummaryReports = () => {
  const navigate = useNavigate();

  const purchaseReportsList = [
    {
      title: 'Purchase Summary',
      desc: 'Overall summaries of total procurement volume, average vendor invoices, and asset expenses.',
      icon: Layers,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Purchase Summary',
      to: '/reports/purchases/general-summary'
    },
    {
      title: 'Daily Purchase',
      desc: 'Audit daily raw material transactions, stock entry clears, and cashier purchase vouchers.',
      icon: Calendar,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Check Daily Purchases',
      to: '/coming-soon'
    },
    {
      title: 'Monthly Purchase',
      desc: 'Comparative monthly procurement indexes matching budgeting constraints and supplier targets.',
      icon: LineChart,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Review Monthly Records',
      to: '/coming-soon'
    },
    {
      title: 'Yearly Purchase',
      desc: 'Annual purchase matrices and material expenses audits display registers.',
      icon: TrendingUp,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      actionText: 'Audit Yearly Reports',
      to: '/coming-soon'
    },
    {
      title: 'Purchase Invoice Register',
      desc: 'Chronological log registers of all supplier bills, purchase invoices, and vendor bills references.',
      icon: FileText,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'Open Bills Registers',
      to: '/coming-soon'
    },
    {
      title: 'Purchase Return Report',
      desc: 'Logs of return orders, debit notes, replacement tracking parameters, and vendor refunds.',
      icon: RotateCcw,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      actionText: 'Open Returns Logs',
      to: '/coming-soon'
    },
    {
      title: 'Net Purchase Report',
      desc: 'Calculated statements of net procurement expenses minus supplier refunds and early discounts.',
      icon: Percent,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      actionText: 'Audit Net Expenses',
      to: '/coming-soon'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Layers className="text-indigo-600" size={22} /> Purchase Summary & Procurement Reports
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Monitor daily/monthly/yearly vendor procurement summaries, audit supplier invoice lists, and track debit return notes.
        </p>
      </div>

      {/* Grid of Purchase Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {purchaseReportsList.map((rep, idx) => {
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

export default PurchaseSummaryReports;
