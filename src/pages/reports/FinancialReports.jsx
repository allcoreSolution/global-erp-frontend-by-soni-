import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Briefcase,
  DollarSign,
  PieChart,
  ArrowRight,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';

const FinancialReports = () => {
  const navigate = useNavigate();

  const financialReportsList = [
    {
      title: 'Trial Balance',
      desc: 'Verify the arithmetic accuracy of double entry ledgers, listing debits and credits.',
      icon: Scale,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Trial Balance',
      to: '/reports/financial/trial-balance'
    },
    {
      title: 'Profit & Loss',
      desc: 'Analyze net gross margins, revenue earnings streams, operating expenses, and net profit.',
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Review Income Statements',
      to: '/reports/financial/profit-and-loss'
    },
    {
      title: 'Balance Sheet',
      desc: 'Evaluate financial health matrices, liabilities, asset balances, and equity capital.',
      icon: FileText,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Audit Balance Sheet',
      to: '/reports/financial/balance-sheet'
    },
    {
      title: 'Outstanding Receivable',
      desc: 'Statements of unpaid invoices, aging status and pending collections from customers.',
      icon: ArrowUpRight,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      actionText: 'Track Receivables',
      to: '/reports/financial/outstanding-receivable'
    },
    {
      title: 'Outstanding Payable',
      desc: 'Registers of pending supplier payments, bills credits offsets, and payables outstanding.',
      icon: ArrowDownRight,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'Track Payables Balances',
      to: '/reports/financial/outstanding-payable'
    },
    {
      title: 'Receivable Aging',
      desc: 'Aging matrices analysis (0-30, 31-60, 61-90, 90+ days) for customer collections.',
      icon: Clock,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      actionText: 'View Aging Analysis',
      to: '/reports/financial/receivable-aging'
    },
    {
      title: 'Payable Aging',
      desc: 'Outstanding vendor bill days analysis to optimize accounts payables cashflows.',
      icon: Briefcase,
      color: 'text-slate-600 bg-slate-50 border-slate-100',
      actionText: 'Review Vendor Aging',
      to: '/reports/financial/payable-aging'
    },
    {
      title: 'Expense Report',
      desc: 'Detailed breakdown categories of operational cost heads, travel, salary, and overheads.',
      icon: TrendingDown,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      actionText: 'Audit Expense Registers',
      to: '/reports/financial/expense-report'
    },
    {
      title: 'Income Report',
      desc: 'Audit registers of non-operating revenue sources, services receipts, and product sales.',
      icon: DollarSign,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      actionText: 'Review Revenue Incomes',
      to: '/reports/financial/income-report'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <PieChart className="text-indigo-600" size={22} /> Financial & Accounts Statements Portal
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Monitor enterprise financial statements, balance sheets, receivable aging reports, and expenses registers.
        </p>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
        <div className="p-4 rounded-lg bg-blue-50/30 border border-blue-150 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Accounting Standard</span>
            <h3 className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
              <ShieldCheck size={14} className="text-blue-500" /> Ind AS Compliant
            </h3>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-emerald-50/30 border border-emerald-150 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Financial Year</span>
            <h3 className="text-sm font-extrabold text-slate-850 mt-1">FY 2026 - 2027</h3>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">System Reconciliation</span>
            <h3 className="text-xs font-bold text-emerald-700 mt-1 flex gap-1 items-center font-mono">
              ● 100% Balanced Ledgers
            </h3>
          </div>
        </div>
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

export default FinancialReports;
