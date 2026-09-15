import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  User,
  Layers,
  Award,
  Users,
  GitBranch,
  Home,
  ArrowRight,
  TrendingUp,
  LineChart
} from 'lucide-react';

const SalesAnalysisReports = () => {
  const navigate = useNavigate();

  const analysisReportsList = [
    {
      title: 'Product-wise Sales',
      desc: 'Deep analytical report tracking revenue, margins and units sold for each individual product.',
      icon: Package,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Product Sales Analysis',
      to: '/reports/sales/product-wise-sales'
    },
    {
      title: 'Customer-wise Sales',
      desc: 'Monitor purchasing trends, top buyers, average basket sizes, and customer value scores.',
      icon: User,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Track Customer Purchasing',
      to: '/coming-soon'
    },
    {
      title: 'Category-wise Sales',
      desc: 'Consolidated category charts displaying performance index of switches, boxes, cables, etc.',
      icon: Layers,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Review Category Sales',
      to: '/coming-soon'
    },
    {
      title: 'Brand-wise Sales',
      desc: 'Sales performance index categorized by brand assets to study brand turnover shares.',
      icon: Award,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      actionText: 'Audit Brand Performance',
      to: '/coming-soon'
    },
    {
      title: 'Salesperson-wise Sales',
      desc: 'Sales commission calculations, targets vs achievements, and sales rep performance ratings.',
      icon: Users,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'Review Sales Staff Targets',
      to: '/coming-soon'
    },
    {
      title: 'Branch-wise Sales',
      desc: 'Study geographic sales data comparing Delhi H.O, Mumbai branches, and local franchises.',
      icon: GitBranch,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      actionText: 'Open Regional Analytics',
      to: '/coming-soon'
    },
    {
      title: 'Warehouse-wise Sales',
      desc: 'Reconciled invoice values grouped by warehouse distribution sources.',
      icon: Home,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      actionText: 'View Warehouse Sales',
      to: '/coming-soon'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <LineChart className="text-indigo-600" size={22} /> Sales Performance Analysis Portal
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Analyze sales margins sorted by items, brand parameters, regional branches, warehouses, or salespersons.
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

export default SalesAnalysisReports;
