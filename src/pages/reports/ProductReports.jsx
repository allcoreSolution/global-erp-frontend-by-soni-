import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Layers,
  Award,
  Hash,
  Barcode,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  LineChart
} from 'lucide-react';

const ProductReports = () => {
  const navigate = useNavigate();

  const productReportsList = [
    {
      title: 'Product-wise Stock',
      desc: 'Look up specific unit levels and balances mapped item-by-item across current inventory.',
      icon: Package,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Product Stocks',
      to: '/reports/stock/product-wise-stock'
    },
    {
      title: 'Category-wise Stock',
      desc: 'Stock grouping reports sorted by custom categories like Electronics, Wires, Switches, etc.',
      icon: Layers,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Filter by Category',
      to: '/coming-soon'
    },
    {
      title: 'Brand-wise Stock',
      desc: 'Reconciled statements displaying current inventories categorized by manufacturing brands.',
      icon: Award,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Check Brand Stocks',
      to: '/coming-soon'
    },
    {
      title: 'Batch-wise Stock',
      desc: 'Verify batch numbers, manufacturing runs, and serial stock holdings for production audits.',
      icon: Hash,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      actionText: 'Audit Batch Stock',
      to: '/coming-soon'
    },
    {
      title: 'Serial Number-wise Stock',
      desc: 'Track high-value unique serialized assets and locate serial numbers in warehouses.',
      icon: Barcode,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'Locate Serial Numbers',
      to: '/coming-soon'
    },
    {
      title: 'Expiry Report',
      desc: 'Critical alert registers highlighting stock batches approaching or past their expiry date.',
      icon: CalendarDays,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      actionText: 'Review Expiry Alerts',
      to: '/coming-soon',
      badge: 'Alerts Active'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Barcode className="text-indigo-600" size={22} /> Product & Item-wise Stock Reports
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Inspect granular stocks summaries, filter categories, verify manufacturing brand blocks, and audit expiry alert parameters.
        </p>
      </div>

      {/* Grid of Product Reports Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {productReportsList.map((rep, idx) => {
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
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-700">
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

export default ProductReports;
