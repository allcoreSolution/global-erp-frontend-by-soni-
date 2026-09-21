import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Truck,
  PackageCheck,
  Scale,
  ArrowRight,
  TrendingUp,
  LineChart
} from 'lucide-react';

const PurchasePerformanceReports = () => {
  const navigate = useNavigate();

  const performanceReportsList = [
    {
      title: 'Top Suppliers',
      desc: 'Rank suppliers by procurement value, discount margins offered, and delivery turnaround efficiency indices.',
      icon: Truck,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Top Suppliers',
      to: '/reports/purchases/top-suppliers'
    },
    {
      title: 'Frequently Purchased Products',
      desc: 'Rank products by order frequency, reorder counts, and average warehouse stocking timelines.',
      icon: PackageCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Check Frequencies list',
      to: '/reports/purchases/frequently-purchased'
    },
    {
      title: 'Purchase Price Comparison',
      desc: 'Analyze historical procurement prices offered by multiple vendors to find cost optimization margins.',
      icon: Scale,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Compare Vendor Prices',
      to: '/reports/purchases/price-comparison'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="text-blue-650 text-amber-500 animate-bounce" size={22} /> Purchase Performance & Leaderboards Portal
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Analyze top performing suppliers, audit frequently ordered inventory SKU stocks, and compare purchase price quotes across vendors.
        </p>
      </div>

      {/* Grid of Performance Reports Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {performanceReportsList.map((rep, idx) => {
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
                  <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-650 transition-colors">
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

export default PurchasePerformanceReports;
