import React from 'react';
import { AlertTriangle, Download, Printer, Filter, Search, ArrowUpDown, Bell } from 'lucide-react';

const LowStockReport = () => {
  const data = [
    { sku: 'PRD-ELC-015', name: 'Wireless Headphones', category: 'Electronics', warehouse: 'Retail Outlet West', current: 3, reorderLevel: 10, deficit: 7, status: 'Critical' },
    { sku: 'PRD-FUR-088', name: 'Office Desk Wooden', category: 'Furniture', warehouse: 'Main Hub (WH-01)', current: 15, reorderLevel: 25, deficit: 10, status: 'Reorder' },
    { sku: 'RAW-PLST-01', name: 'Plastic Granules (kg)', category: 'Raw Material', warehouse: 'Factory Yard', current: 120, reorderLevel: 500, deficit: 380, status: 'Critical' },
    { sku: 'PRD-ELC-002', name: 'Air Conditioner 1.5T', category: 'Electronics', warehouse: 'Retail Outlet East', current: 12, reorderLevel: 15, deficit: 3, status: 'Reorder' },
    { sku: 'PRD-SFT-045', name: 'Cloud Backup Drive 1TB', category: 'Hardware', warehouse: 'Digital Vault', current: 2, reorderLevel: 20, deficit: 18, status: 'Critical' },
  ];

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Reorder': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm min-h-screen space-y-6 font-sans">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertTriangle className="text-amber-600" size={24} />
            </div>
            Low Stock & Reorder Report
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Identify products dipping below threshold margins to trigger reorders and prevent stockouts.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 hover:shadow-md transition-all shadow-sm">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-amber-50/40 p-4 border border-amber-100 rounded-xl flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-amber-800 font-semibold w-full sm:w-auto mb-2 sm:mb-0">
          <Filter size={18} /> Alerts Filter:
        </div>
        
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Product Name or SKU..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
          />
        </div>

        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm bg-white min-w-[150px] text-slate-700">
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="raw-material">Raw Material</option>
        </select>

        <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm bg-white min-w-[150px] text-slate-700">
          <option value="">All Statuses</option>
          <option value="critical">Critical Stock</option>
          <option value="reorder">Reorder Required</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', val: '42', color: 'bg-rose-50 text-rose-700 border-rose-200' },
          { label: 'Critical Items (0-10%)', val: '18', color: 'bg-red-50 text-red-700 border-red-200' },
          { label: 'Reorder Items', val: '24', color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Est. Restock Value', val: '₹ 8.2 L', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        ].map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.color} flex flex-col justify-center items-start shadow-sm`}>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{stat.label}</span>
            <span className="text-lg sm:text-2xl font-bold mt-1">{stat.val}</span>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-1">SKU Code <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-1">Product Name <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="p-4">Warehouse</th>
                <th className="p-4 text-center">Current Qty</th>
                <th className="p-4 text-center">Reorder Level</th>
                <th className="p-4 text-center">Deficit</th>
                <th className="p-4 text-center">Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                  <td className="p-4 font-mono text-amber-700 font-medium">{item.sku}</td>
                  <td className="p-4 font-semibold text-slate-800 flex flex-col">
                    {item.name}
                    <span className="text-xs font-normal text-slate-500 mt-0.5">{item.category}</span>
                  </td>
                  <td className="p-4 text-slate-600">{item.warehouse}</td>
                  <td className="p-4 text-center">
                    <span className={`font-bold ${item.current < (item.reorderLevel / 2) ? 'text-rose-600' : 'text-amber-600'}`}>{item.current}</span>
                  </td>
                  <td className="p-4 text-center font-medium text-slate-700 bg-slate-50/50">{item.reorderLevel}</td>
                  <td className="p-4 text-center font-bold text-rose-500">-{item.deficit}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border flex items-center justify-center gap-1 w-fit mx-auto ${getStatusStyle(item.status)}`}>
                      <Bell size={12} /> {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
          <div>Showing 1 to 5 of 42 entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-200 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-amber-600 bg-amber-600 text-white rounded">1</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-100 text-slate-700">2</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-100 text-slate-700">3</button>
            <span className="px-2 py-1">...</span>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-200">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockReport;
