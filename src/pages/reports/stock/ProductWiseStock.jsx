import React, { useState, useEffect } from 'react';
import { Package, Download, Printer, Filter, Search, ArrowUpDown } from 'lucide-react';
import api from '../../../api';

const ProductWiseStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock/product-wise');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching product-wise stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesWarehouse = warehouseFilter ? item.warehouse === warehouseFilter : true;
    return matchesSearch && matchesCategory && matchesWarehouse;
  });

  const totalProducts = data.length;
  const totalStockQty = data.reduce((acc, curr) => acc + curr.qty, 0);
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);
  const lowStockItems = data.filter(item => item.status === 'Low Stock' || item.status === 'Critical').length;

  const categories = [...new Set(data.map(item => item.category))];
  const warehouses = [...new Set(data.map(item => item.warehouse))];

  const getStatusStyle = (status) => {
    switch(status) {
      case 'In Stock': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Low Stock': return 'bg-amber-100 text-amber-700 border-amber-200';
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
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Package className="text-indigo-600" size={24} />
            </div>
            Product-wise Stock Report
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 pl-12">
            Detailed view of inventory holding mapped item-by-item across all warehouses and locations.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 hover:shadow-md transition-all shadow-sm">
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-indigo-50/40 p-4 border border-indigo-100 rounded-xl flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-indigo-800 font-semibold w-full sm:w-auto mb-2 sm:mb-0">
          <Filter size={18} /> Filters:
        </div>
        
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Product Name or SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm bg-white min-w-[150px] text-slate-700"
        >
          <option value="">All Categories</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm bg-white min-w-[150px] text-slate-700"
        >
          <option value="">All Warehouses</option>
          {warehouses.map((wh, idx) => (
            <option key={idx} value={wh}>{wh}</option>
          ))}
        </select>
        
        <button onClick={fetchData} className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', val: totalProducts.toLocaleString(), color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { label: 'Total Stock Qty', val: totalStockQty.toLocaleString(), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Total Value', val: `₹ ${(totalValue / 100000).toFixed(2)} Lacs`, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { label: 'Low/Critical Stock', val: lowStockItems.toString(), color: 'bg-rose-50 text-rose-700 border-rose-200' },
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
                <th className="p-4">Category</th>
                <th className="p-4">Warehouse</th>
                <th className="p-4 text-right">In Stock</th>
                <th className="p-4 text-right">Stock Value</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 italic">Fetching product-wise stock...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500 italic">No products found.</td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="p-4 font-mono text-indigo-600 font-medium">{item.sku}</td>
                    <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="p-4 text-slate-600">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs border border-slate-200">{item.category}</span>
                    </td>
                    <td className="p-4 text-slate-600">{item.warehouse}</td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-slate-700">{item.qty.toLocaleString()}</span>
                      <span className="text-slate-400 text-xs ml-1">{item.unit}</span>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-700">₹ {item.value.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-600">
          <div>Showing 1 to 5 of 1,248 entries</div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-200 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-indigo-600 bg-indigo-600 text-white rounded">1</button>
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

export default ProductWiseStock;
