import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Scale,
  RefreshCw,
  Award,
  Wallet,
  Briefcase,
  DollarSign,
  ArrowRight,
  TrendingDown,
  LineChart
} from 'lucide-react';

const AnalysisReports = () => {
  const navigate = useNavigate();

  const analysisReportsList = [
    {
      title: 'Account-wise Summary',
      desc: 'Comparative evaluation summaries of individual accounting categories and ledger heads.',
      icon: Briefcase,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Account Summaries',
      to: '/reports/analysis/account-wise-summary'
    },
    {
      title: 'Debit / Credit Summary',
      desc: 'Analysis matrices matching total debit transfers and credit balances across transactions.',
      icon: Scale,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Track Debit/Credit Balance',
      to: '/reports/analysis/debit-credit-summary'
    },
    {
      title: 'Cash Flow',
      desc: 'Visualize dynamic cash inflows, liquidity index, operating payments, and capital structures.',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Audit Cash Flows',
      to: '/reports/analysis/cash-flow'
    },
    {
      title: 'Bank Balance',
      desc: 'Live reconciled bank books balance registers and bank statement cashflow indicators.',
      icon: Wallet,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      actionText: 'Check Bank Balances',
      to: '/reports/analysis/bank-balance'
    },
    {
      title: 'Opening / Closing Balance',
      desc: 'Opening credit ledger margins and closing balances summaries for seasonal cycle audits.',
      icon: RefreshCw,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'Verify Closing Margins',
      to: '/reports/analysis/opening-closing-balance'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <LineChart className="text-indigo-600" size={22} /> Accounts Analysis & Summaries Portal
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Analyze double-entry ledgers, verify debit/credit indexes, cash flows, and bank balance fluctuations.
        </p>
      </div>

      {/* Grid of Analysis Reports Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {analysisReportsList.map((rep, idx) => {
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

export default AnalysisReports;
