import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronDown, Loader2 } from 'lucide-react';
import { usePermissions } from '../utils/permissionUtils';

export const DashboardCharts = ({ data, loading }) => {
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin, hasPerm } = usePermissions();

  const canSales = isSuperAdmin || isAdmin || hasPerm('view_sales');
  const canPurchases = isSuperAdmin || isAdmin || hasPerm('view_purchases');
  const canExpenses = isSuperAdmin || isAdmin || hasPerm('view_accounts') || hasPerm('view_purchases');
  const canOutstanding = isSuperAdmin || isAdmin || hasPerm('view_accounts') || hasPerm('view_sales') || hasPerm('view_purchases');

  const lineData = data?.lineData || [];
  const pieData = data?.pieData || [];
  const outstanding = data?.outstanding || {
    debtors: 0,
    creditors: 0,
    othersReceivable: 0,
    othersPayable: 0,
    net: 0
  };

  const isLoading = loading;
  const totalExpenses = pieData.reduce((acc, curr) => acc + curr.value, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-lg">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span className="text-gray-500">Loading Analytics...</span>
      </div>
    );
  }

  // Count active chart panels to calculate responsive grid column sizes
  const showOverview = (canSales || canPurchases) && lineData.length > 0;
  const showExpenses = canExpenses && pieData.length > 0;
  const showOutstanding = canOutstanding && outstanding.net !== undefined;

  if (!showOverview && !showExpenses && !showOutstanding) {
    return null;
  }

  // Dynamic column layout: exactly 50% - 50% half-half when both are present
  const cardColSpan = showOverview && showOutstanding
    ? 'col-span-12 md:col-span-6 lg:col-span-6'
    : 'col-span-12';

  // Prepare Outstanding Donut / Circle Chart Data
  const debtorsVal = Math.max(0, Number(outstanding.debtors) || 0);
  const creditorsVal = Math.max(0, Number(outstanding.creditors) || 0);
  const othersRecVal = Math.max(0, Number(outstanding.othersReceivable) || 0);
  const othersPayVal = Math.max(0, Number(outstanding.othersPayable) || 0);

  const outstandingPieData = [
    ...(debtorsVal > 0 ? [{ name: 'Sundry Debtors', value: debtorsVal, color: '#16a34a', type: 'Dr' }] : []),
    ...(creditorsVal > 0 ? [{ name: 'Sundry Creditors', value: creditorsVal, color: '#ef4444', type: 'Cr' }] : []),
    ...(othersRecVal > 0 ? [{ name: 'Others Receivable', value: othersRecVal, color: '#06b6d4', type: 'Dr' }] : []),
    ...(othersPayVal > 0 ? [{ name: 'Others Payable', value: othersPayVal, color: '#f97316', type: 'Cr' }] : [])
  ];

  const displayOutstandingPie = outstandingPieData.length > 0
    ? outstandingPieData
    : [{ name: 'All Cleared', value: 1, color: '#94a3b8', type: 'Clear' }];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
      {/* 1. Left Card (50%): Business Overview Line Chart */}
      {showOverview && (
        <div
          onClick={() => navigate('/reports/mis/performance-analysis')}
          className={`${cardColSpan} h-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-lg shadow-sm p-4 transition-colors cursor-pointer hover:shadow-md flex flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-blue-900 dark:text-slate-100 tracking-wide uppercase">
                Business Overview <span className="text-gray-400 dark:text-gray-500 font-normal normal-case">(This Year)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-4 mr-4 text-xs font-medium dark:text-slate-300">
                  {canSales && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>Sales
                    </div>
                  )}
                  {canPurchases && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>Purchase
                    </div>
                  )}
                </div>
                <div className="text-xs border dark:border-slate-800 dark:text-slate-300 rounded px-2 py-1 flex items-center gap-1 cursor-pointer">
                  This Year <ChevronDown size={14} />
                </div>
              </div>
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">(In Lakh)</div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} tickFormatter={(val) => `${val}L`} />
                  <RechartsTooltip contentStyle={{ fontSize: '12px', backgroundColor: '#1e293b', border: 'none', color: '#f1f5f9' }} />
                  {canSales && (
                    <Line type="linear" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  )}
                  {canPurchases && (
                    <Line type="linear" dataKey="purchase" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. Right Card (50%): Outstanding Details Donut / Circle Chart */}
      {showOutstanding && (
        <div
          className={`${cardColSpan} h-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-lg shadow-sm p-4 flex flex-col justify-between transition-colors`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-blue-900 dark:text-slate-100 tracking-wide uppercase">
                Outstanding Details <span className="text-gray-400 dark:text-gray-500 font-normal normal-case">(Debtors & Creditors)</span>
              </div>
              <div className="text-xs border dark:border-slate-800 dark:text-slate-300 rounded px-2 py-1 flex items-center gap-1 cursor-pointer">
                This Year <ChevronDown size={14} />
              </div>
            </div>
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">(In Lakh)</div>

            <div className="h-64 flex flex-col sm:flex-row items-center gap-2">
              {/* Donut Circle Chart */}
              <div className="w-full sm:w-1/2 h-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayOutstandingPie}
                      innerRadius={48}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {displayOutstandingPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                  <span
                    className={`text-sm md:text-base font-extrabold tracking-tight ${
                      Number(outstanding.net) < 0
                        ? 'text-red-600 dark:text-red-400'
                        : Number(outstanding.net) > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-blue-900 dark:text-slate-100'
                    }`}
                  >
                    ₹ {outstanding.net} L
                  </span>
                  <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Net Outstanding
                  </span>
                </div>
              </div>

              {/* Outstanding Breakdown Legend & Details */}
              <div className="w-full sm:w-1/2 flex flex-col justify-between h-full pl-0 sm:pl-3">
                <div className="space-y-2.5">
                  {/* Sundry Debtors */}
                  <div className="flex items-center justify-between text-xs p-1 rounded hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-600 flex-shrink-0 shadow-sm"></div>
                      <span className="font-medium text-gray-700 dark:text-slate-300">Sundry Debtors</span>
                    </div>
                    <span className="font-bold text-green-600 dark:text-green-400">₹ {outstanding.debtors} L Dr</span>
                  </div>

                  {/* Sundry Creditors */}
                  <div className="flex items-center justify-between text-xs p-1 rounded hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 shadow-sm"></div>
                      <span className="font-medium text-gray-700 dark:text-slate-300">Sundry Creditors</span>
                    </div>
                    <span className="font-bold text-red-500 dark:text-red-400">₹ {outstanding.creditors} L Cr</span>
                  </div>

                  {/* Others Receivable */}
                  <div className="flex items-center justify-between text-xs p-1 rounded hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 flex-shrink-0 shadow-sm"></div>
                      <span className="text-gray-600 dark:text-slate-400">Others Receivable</span>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ₹ {outstanding.othersReceivable || 0} L Dr
                    </span>
                  </div>

                  {/* Others Payable */}
                  <div className="flex items-center justify-between text-xs p-1 rounded hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0 shadow-sm"></div>
                      <span className="text-gray-600 dark:text-slate-400">Others Payable</span>
                    </div>
                    <span className="font-semibold text-red-500 dark:text-red-400">
                      ₹ {outstanding.othersPayable || 0} L Cr
                    </span>
                  </div>
                </div>

                {/* View All Button */}
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <button
                    onClick={() => navigate('/reports/recent-outstanding-details')}
                    className="w-full bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-semibold py-2 rounded-md border border-blue-200 dark:border-blue-900/40 transition-all text-center"
                  >
                    View All Outstanding
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
