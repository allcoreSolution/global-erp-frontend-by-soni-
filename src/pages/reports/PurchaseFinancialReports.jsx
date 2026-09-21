import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Percent,
  Calculator,
  Briefcase,
  Clock,
  Scale,
  ArrowRight,
  TrendingUp,
  LineChart
} from 'lucide-react';

const PurchaseFinancialReports = () => {
  const navigate = useNavigate();

  const financialReportsList = [
    {
      title: 'Purchase Amount',
      desc: 'Verify gross procurement spendings, vendor invoicing tallies, and accounts clearance files.',
      icon: DollarSign,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Purchase Spend',
      to: '/reports/purchases/purchase-amount'
    },
    {
      title: 'Discount Report',
      desc: 'Track trade discounts obtained from suppliers, special vendor pricing reductions, and coupons credits.',
      icon: Percent,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Check Supplier Discounts',
      to: '/reports/purchases/discount-report'
    },
    {
      title: 'Tax / GST Paid',
      desc: 'Detailed input tax credit (ITC) reports mapping GST paid on raw materials and inventory purchases.',
      icon: Calculator,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Review GST Paid (ITC)',
      to: '/reports/purchases/tax-gst-paid'
    },
    {
      title: 'Purchase Cost',
      desc: 'Analyze final landing costs per product units including shipping freight and customs parameters.',
      icon: Briefcase,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      actionText: 'Track Purchase Costs',
      to: '/reports/purchases/purchase-cost'
    },
    {
      title: 'Supplier Outstanding',
      desc: 'Statements lists of accounts payables, pending vendor invoices, and outstanding credits due.',
      icon: Clock,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      actionText: 'Track Payables Outstanding',
      to: '/reports/purchases/supplier-outstanding'
    },
    {
      title: 'Paid vs Pending Purchase',
      desc: 'Summary displays mapping fully cleared procurement checks vs draft pending supplier balances.',
      icon: Scale,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'Compare Settlement Logs',
      to: '/reports/purchases/paid-vs-pending'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="text-indigo-600" size={22} /> Procurement Financial & Tax Reports Portal
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Verify supplier invoices, audit Input Tax Credits (GST Paid) registries, monitor product costing, and track payables outstanding.
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

export default PurchaseFinancialReports;
