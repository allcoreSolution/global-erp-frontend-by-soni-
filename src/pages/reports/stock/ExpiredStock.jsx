import React, { useState } from 'react';
import { CalendarX, Search, Download, Printer, Filter } from 'lucide-react';

const ExpiredStock = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const expiryItems = [
    { id: 'ITM-001', name: 'Organic Green Tea', batch: 'BT-2026-A1', mfgDate: '10-05-2025', expDate: '31-10-2026', qty: 25, unit: 'Boxes', value: 3750, supplier: 'Green Naturals' },
    { id: 'ITM-002', name: 'Roasted Almonds pack', batch: 'BT-2026-A2', mfgDate: '15-06-2025', expDate: '15-12-2026', qty: 18, unit: 'Pkts', value: 4500, supplier: 'Nutri Farms' },
    { id: 'ITM-003', name: 'Premium Green Coffee', batch: 'BT-2026-A3', mfgDate: '20-07-2025', expDate: '20-01-2027', qty: 30, unit: 'Jars', value: 8400, supplier: 'Coffee Co.' },
    { id: 'ITM-004', name: 'Chia Seeds organic', batch: 'BT-2026-A4', mfgDate: '01-08-2025', expDate: '30-03-2027', qty: 22, unit: 'Pkts', value: 3300, supplier: 'Nutri Farms' },
    { id: 'ITM-005', name: 'Flax Seeds premium', batch: 'BT-2026-A5', mfgDate: '05-09-2025', expDate: '05-04-2027', qty: 15, unit: 'Pkts', value: 2250, supplier: 'Seed Traders' },
    { id: 'ITM-006', name: 'Vitamin C Tablets', batch: 'B-8812', mfgDate: '10-01-2024', expDate: '15-09-2026', qty: 50, unit: 'Strips', value: 2500, supplier: 'Pharma Plus' },
  ];

  const filteredItems = expiryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = filteredItems.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarX className="text-rose-600" size={24} /> Expired & Near Expiry Stock
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Track inventory items that have expired or are nearing their expiration date.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-50 p-4 border border-rose-200 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-rose-600" />
            <span className="text-xs font-semibold text-gray-700">Filter By:</span>
          </div>
          <select className="border p-1.5 rounded text-xs text-gray-700 bg-white">
            <option>All Items</option>
            <option>Already Expired</option>
            <option>Expires in 30 Days</option>
            <option>Expires in 90 Days</option>
          </select>
          <div className="text-xs font-bold text-rose-800 ml-4 hidden md:block">
            Total Value at Risk: ₹ {totalValue.toLocaleString()}
          </div>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search item, ID or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      <div className="md:hidden text-xs font-bold text-rose-800 text-center">
        Total Value at Risk: ₹ {totalValue.toLocaleString()}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3 font-semibold text-gray-600">Item Code</th>
              <th className="p-3 font-semibold text-gray-600">Item Name</th>
              <th className="p-3 font-semibold text-gray-600">Batch No</th>
              <th className="p-3 font-semibold text-gray-600">Exp. Date</th>
              <th className="p-3 font-semibold text-gray-600 text-center">Qty</th>
              <th className="p-3 font-semibold text-gray-600">Supplier</th>
              <th className="p-3 font-semibold text-gray-600 text-right">Value (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                // Check if already expired (basic check based on today being ~Sep 2026)
                const isExpired = new Date(item.expDate.split('-').reverse().join('-')) < new Date('2026-09-09');
                
                return (
                  <tr key={idx} className="hover:bg-rose-50/30">
                    <td className="p-3 font-mono text-gray-500">{item.id}</td>
                    <td className="p-3 font-medium text-gray-800">{item.name}</td>
                    <td className="p-3 text-gray-600 text-xs">{item.batch}</td>
                    <td className="p-3">
                      <span className={`font-semibold px-2 py-1 rounded text-xs ${isExpired ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.expDate}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-gray-700">{item.qty} <span className="text-xs font-normal text-gray-500">{item.unit}</span></td>
                    <td className="p-3 text-gray-600 text-xs">{item.supplier}</td>
                    <td className="p-3 text-right font-bold text-rose-700">₹ {item.value.toLocaleString()}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500 italic">No expiry items found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpiredStock;
