import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  Layers,
  Award,
  GitBranch,
  Home,
  ArrowRight,
  TrendingUp,
  LineChart
} from 'lucide-react';

const PurchaseAnalysisReports = () => {
  const navigate = useNavigate();

  const analysisReportsList = [
    {
      title: 'Product-wise Purchase',
      desc: 'Analyse procurement volumes, cost dynamics, and stocking indices for specific item parameters.',
      icon: Package,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Product Procurement',
      to: '/reports/purchases/product-wise-purchase'
    },
    {
      title: 'Supplier-wise Purchase',
      desc: 'Compare supplier order volumes, lead times, order delivery compliance, and cost audits.',
      icon: Truck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Track Supplier Purchases',
      to: '/reports/purchases/supplier-wise-purchase'
    },
    {
      title: 'Category-wise Purchase',
      desc: 'Verify purchase investments categorized under general items divisions (cables, relays, switch blocks).',
      icon: Layers,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Review Category Procurement',
      to: '/reports/purchases/category-wise-purchase'
    },
    {
      title: 'Brand-wise Purchase',
      desc: 'Procurement analysis matching cost margins grouped by manufacturing brand elements.',
      icon: Award,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      actionText: 'Audit Brand Purchases',
      to: '/reports/purchases/brand-wise-purchase'
    },
    {
      title: 'Branch-wise Purchase',
      desc: 'Compare regional branches cost allocations and purchase requisitions registers.',
      icon: GitBranch,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      actionText: 'Open Regional Analytics',
      to: '/reports/purchases/branch-wise-purchase'
    },
    {
      title: 'Warehouse-wise Purchase',
      desc: 'Track direct incoming stocks values received at specific storage warehouses.',
      icon: Home,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      actionText: 'View Warehouse Inflows',
      to: '/reports/purchases/warehouse-wise-purchase'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <LineChart className="text-indigo-600" size={22} /> Purchase Performance & Analysis Portal
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Reconcile procurement volumes sorted by supplier performance, category holdings, manufacturing brand, branches, or warehouse sources.
        </p>
      </div>

      {/* Grid of Purchase Analysis Reports Cards */}
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

export default PurchaseAnalysisReports;
