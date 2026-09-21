import React, { useState, useEffect } from 'react';
import { Percent, Download, Printer, Filter, Search, ArrowUpDown, TrendingUp } from 'lucide-react';
import api from '../../../api';

const DiscountReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/reports/sales/financial/discount');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching discount report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value) => `₹ ${value.toLocaleString('en-IN')}`;

  const getStatusStyle = (type) => {
    switch(type) {
      case 'Trade': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Volume': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Coupon': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Festive': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Percent className="text-emerald-600" size={24} />
            </div>
            Discount Report
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Verify customer trade discounts, coupons deducted, and promotional pricing.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 hover:shadow-md transition-all shadow-sm">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-xl flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-emerald-800 font-semibold w-full sm:w-auto mb-2 sm:mb-0">
          <Filter size={18} /> Filters:
        </div>
        
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Invoice or Customer..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm"
          />
        </div>

        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm bg-white min-w-[150px] text-slate-700">
          <option value="">All Discount Types</option>
          <option value="trade">Trade</option>
          <option value="volume">Volume</option>
          <option value="coupon">Coupon</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices with Discount', val: '124', color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Avg Discount Applied', val: '8.5%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Highest Discount Type', val: 'Volume', color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Total Discount Value', val: '₹ 1.4 L', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: <TrendingUp size={16} className="ml-1 inline-block opacity-70" /> },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.color} flex flex-col justify-center items-start shadow-sm`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stat.label}</span>
            <span className="text-lg sm:text-2xl font-bold mt-1 flex items-center">
              {stat.val} {stat.icon && stat.icon}
            </span>
          </div>
        ))}
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="block w-full overflow-x-auto w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Invoice No</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4 text-right">Gross Amount</th>
                <th className="p-4 text-center">Discount Type</th>
                <th className="p-4 text-right">Discount %</th>
                <th className="p-4 text-right">Discount Amount</th>
                <th className="p-4 text-right">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-slate-500">Loading data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-slate-500">No data available</td>
                </tr>
              ) : data.map((item, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="p-4 text-slate-600 font-medium">{item.date}</td>
                  <td className="p-4 font-mono text-emerald-700 font-medium">{item.invoiceNo}</td>
                  <td className="p-4 font-semibold text-slate-800">{item.customer}</td>
                  <td className="p-4 text-right text-slate-500">{formatCurrency(item.grossAmount)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusStyle(item.discountType)}`}>
                      {item.discountType}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium text-slate-700">{item.discountPercent}</td>
                  <td className="p-4 text-right font-bold text-rose-600">-{formatCurrency(item.discountAmount)}</td>
                  <td className="p-4 text-right font-bold text-emerald-700">{formatCurrency(item.netAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DiscountReport;
