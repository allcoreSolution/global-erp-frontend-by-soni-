import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Filter, 
  Download, 
  Printer, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle,
  ShoppingCart,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Layers,
  Package,
  Wallet,
  Landmark
} from 'lucide-react';
import api from '../../../api';

const KpiReports = () => {
  const [department, setDepartment] = useState('All');
  const [period, setPeriod] = useState('This Month');

  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);

  const iconMap = {
    ShoppingCart, ShoppingBag, TrendingUp, DollarSign, Layers, Package, Wallet, Landmark, ShieldCheck, CheckCircle
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/mis/kpi');
        if (response.data && response.data.success) {
          setKpiData(response.data.data.kpiList || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['KPI Name', 'Current Value', 'Target Limit', 'Fulfillment Score (%)', 'Status'];
    const rows = kpiData.map(k => [k.name, k.value, k.target, `${k.pct}%`, k.status]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KPI_Reports_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" size={22} /> Key Performance Indicator (KPI) Reports
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Real-time compliance scorecard tracking 10 core metrics against financial and operational targets.
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded transition"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition"
          >
            <Printer size={14} /> Print Scorecard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-50/50 p-3 rounded-lg border border-gray-200/60 flex flex-wrap gap-4 items-center no-print border-b pb-4">
        <div className="flex items-center gap-1 text-gray-600 text-xs font-semibold">
          <Filter size={14} className="text-blue-500" />
          <span>Select Scope:</span>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs border rounded p-1 focus:ring-1 focus:ring-blue-500"
          >
            <option value="This Month">This Month</option>
            <option value="Last Quarter">Last Quarter</option>
            <option value="Financial Year">Financial Year</option>
          </select>
        </div>
      </div>

      {/* 10 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 xl:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi, idx) => {
          const Icon = iconMap[kpi.iconName] || ShieldCheck;
          return (
            <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition flex flex-col justify-between space-y-4 bg-white relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">{kpi.name}</span>
                  <span className="text-xl font-extrabold text-slate-800 tracking-tight block">{kpi.value}</span>
                </div>
                <div className={`p-2 rounded-lg border ${kpi.color}`}>
                  <Icon size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-semibold text-gray-500">
                  <span>Target: {kpi.target}</span>
                  <span>Fulfillment: {kpi.pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      kpi.pct >= 100 ? 'bg-indigo-600' :
                      kpi.pct >= 90 ? 'bg-emerald-500' :
                      kpi.pct >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                    }`} 
                    style={{ width: `${Math.min(kpi.pct, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] pt-1">
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  kpi.status === 'Optimal' || kpi.status === 'On Track' || kpi.status === 'Controlled'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : kpi.status === 'Stable' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}>
                  {kpi.status}
                </span>
                <span className="text-gray-400 font-semibold flex items-center gap-0.5">
                  <CheckCircle size={10} className="text-emerald-500" /> Audit Ready
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KpiReports;
