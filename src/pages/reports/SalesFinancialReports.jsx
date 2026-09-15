import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Percent,
  Calculator,
  TrendingUp,
  Scale,
  Clock,
  ArrowRight,
  TrendingDown,
  LineChart
} from 'lucide-react';

const SalesFinancialReports = () => {
  const navigate = useNavigate();

  const financialReportsList = [
    {
      title: 'Sales Amount',
      desc: 'Audit statements display gross sale revenues, cash margins flow, and direct payments.',
      icon: DollarSign,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Sales Revenue',
      to: '/reports/sales/sales-amount'
    },
    {
      title: 'Discount Report',
      desc: 'Verify customer trade discounts, coupons deducted, and retail promotional pricing margins.',
      icon: Percent,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Check Discounts Issued',
      to: '/coming-soon'
    },
    {
      title: 'Tax / GST Collected',
      desc: 'Detailed GST report listing CGST, SGST, IGST taxes mapped invoice-by-invoice.',
      icon: Calculator,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Review GST Taxes',
      to: '/coming-soon'
    },
    {
      title: 'Profit / Margin Report',
      desc: 'Net margin profit statements matching cost of goods sold vs final retail values.',
      icon: TrendingUp,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      actionText: 'Check Profit Margins',
      to: '/coming-soon'
    },
    {
      title: 'Paid vs Pending Sales',
      desc: 'Audit comparative status displays of unpaid sales, advance balances, and cleared payments.',
      icon: Scale,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'Track Clearances Status',
      to: '/coming-soon'
    },
    {
      title: 'Customer Outstanding',
      desc: 'Statements lists of customers unpaid balances, aging matrices, and collection summaries.',
      icon: Clock,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      actionText: 'Track Customer Receivables',
      to: '/coming-soon'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="text-indigo-600" size={22} /> Sales Financial & Tax Reports Portal
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Verify invoice revenues, audit GST taxes collected, monitor profit margins, and track customer receivable balances.
        </p>
      </div>

      {/* Grid of Financial Reports Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {financialReportsList.map((rep, idx) => {
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

export default SalesFinancialReports;
