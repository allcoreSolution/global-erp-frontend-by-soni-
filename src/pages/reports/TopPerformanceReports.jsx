import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  PackageCheck,
  UserCheck,
  Users,
  ArrowRight,
  TrendingUp,
  LineChart
} from 'lucide-react';

const TopPerformanceReports = () => {
  const navigate = useNavigate();

  const performanceReportsList = [
    {
      title: 'Top Selling Products',
      desc: 'Rank products by sales volume and net profits contributions to identify top SKU performance indices.',
      icon: PackageCheck,
      color: 'text-indigo-600 bg-blue-50 border-blue-100',
      actionText: 'View Top Selling Items',
      to: '/reports/sales/top-selling-items'
    },
    {
      title: 'Top Customers',
      desc: 'Review rankings of top purchasing customers based on invoice values, billing volumes and margins.',
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Review Top Clients',
      to: '/reports/sales/top-customers'
    },
    {
      title: 'Salesperson Performance',
      desc: 'Evaluate targets reached, revenue generated, client acquisitions, and commissions for sales reps.',
      icon: Users,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Check Sales Rep Ratings',
      to: '/reports/sales/salesperson-performance'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="text-blue-650 text-amber-500 animate-bounce" size={22} /> Top Performance & Leaderboards Portal
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Monitor highest selling items, track VIP customer invoice rankings, and audit salesperson targets achievements.
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

export default TopPerformanceReports;
