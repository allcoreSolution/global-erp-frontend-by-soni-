import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  User,
  Truck,
  DollarSign,
  Briefcase,
  FileText,
  Receipt,
  CreditCard,
  ArrowRight,
  TrendingUp,
  FileDown
} from 'lucide-react';

const LedgerVoucherReports = () => {
  const navigate = useNavigate();

  const reportsList = [
    {
      title: 'Account Ledger',
      desc: 'Detailed transactional statements for general account heads and expense categories.',
      icon: BookOpen,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Ledger Statements',
      to: '/reports/accounts/account-ledger'
    },
    {
      title: 'Customer Ledger',
      desc: 'Individual customer outstanding receivables accounts statements and log parameters.',
      icon: User,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Track Customer Ledgers',
      to: '/reports/accounts/customer-ledger'
    },
    {
      title: 'Supplier Ledger',
      desc: 'Purchase history statements, adjustments, and payables registers for supplier matrices.',
      icon: Truck,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Manage Supplier Balance',
      to: '/reports/accounts/supplier-ledger'
    },
    {
      title: 'Cash Book',
      desc: 'Daily cash transaction flows logs, closing balance, and physical cash assets check.',
      icon: DollarSign,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'Audit Cash Records',
      to: '/reports/accounts/cash-book'
    },
    {
      title: 'Bank Book',
      desc: 'Direct bank statement summaries, cleared entries registers, and multi-bank ledgers.',
      icon: Briefcase,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      actionText: 'Open Bank Ledgers',
      to: '/reports/accounts/bank-book'
    },
    {
      title: 'Day Book',
      desc: 'Daily accounts vouchers registry containing double-entry records and journals.',
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      actionText: 'Open Day Book Register',
      to: '/day-book',
      badge: 'Active'
    },
    {
      title: 'Journal Register',
      desc: 'Comprehensive logs of adjust vouchers and manual debit/credit transfer entries.',
      icon: FileText,
      color: 'text-slate-600 bg-slate-50 border-slate-100',
      actionText: 'Track General Journals',
      to: '/reports/accounts/journal-register'
    },
    {
      title: 'Receipt Register',
      desc: 'History of cash and bank voucher receipt logs collected from customers.',
      icon: Receipt,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      actionText: 'Review Receipts Logs',
      to: '/reports/accounts/receipt-register'
    },
    {
      title: 'Payment Register',
      desc: 'Voucher payment lists sent to vendors, salary heads, or operational expense matrix.',
      icon: CreditCard,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      actionText: 'Audit Payment Logs',
      to: '/reports/accounts/payment-register'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="text-indigo-600" size={22} /> Ledger & Voucher Reports Portal
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Open, analyze, and print statements for account ledgers, payment logs, daily books, and cash flow registers.
        </p>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
        <div className="p-4 rounded-lg bg-blue-50/30 border border-blue-150 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Active Ledgers</span>
            <h3 className="text-lg font-extrabold text-slate-800 mt-1">124 Accounts</h3>
          </div>
          <TrendingUp className="text-blue-500" size={24} />
        </div>
        <div className="p-4 rounded-lg bg-emerald-50/30 border border-emerald-150 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Today's Vouchers</span>
            <h3 className="text-lg font-extrabold text-slate-800 mt-1">45 Draft/Posted</h3>
          </div>
          <FileText className="text-emerald-500" size={24} />
        </div>
        <div className="p-4 rounded-lg bg-slate-50 border flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">Export formats</span>
            <h3 className="text-xs font-bold text-slate-800 mt-1.5 flex gap-1 items-center">
              <FileDown size={14} className="text-blue-650" /> PDF, CSV Spreadsheet
            </h3>
          </div>
        </div>
      </div>

      {/* Grid of Reports Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {reportsList.map((rep, idx) => {
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
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
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

export default LedgerVoucherReports;
