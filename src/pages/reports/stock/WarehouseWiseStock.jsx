import React, { useState, useEffect } from 'react';
import { Home, Download, Printer } from 'lucide-react';
import api from '../../../api';

const WarehouseWiseStock = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock/warehouse-wise');
      if (res.data && res.data.success) {
        setData(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching warehouse wise stock:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="text-rose-600" size={22} /> Warehouse-wise Stock
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Breakdown reports of inventory stocks stored across specific local warehouses.</p>
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

      <div className="flex justify-end">
        <button onClick={fetchData} className="px-3 py-1.5 bg-rose-600 text-white rounded hover:bg-rose-700 text-xs transition-colors">
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {loading ? (
          <div className="col-span-full p-4 text-center text-gray-500 italic">Fetching warehouse-wise stock...</div>
        ) : data.length === 0 ? (
          <div className="col-span-full p-4 text-center text-gray-500 italic">No stock found in any warehouse.</div>
        ) : (
          data.map((wh, idx) => (
            <div key={idx} className="border border-rose-100 rounded-xl p-4 shadow-sm bg-rose-50/20 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Home size={18} className="text-rose-600" />
                <h3 className="font-bold text-gray-800">{wh.warehouse || 'Unassigned'}</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Unique Items:</span>
                  <span className="font-semibold text-gray-800">{wh.itemCount} SKUs</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total Quantity:</span>
                  <span className="font-semibold text-gray-800">{wh.totalQty.toLocaleString()} Units</span>
                </div>
                <div className="pt-2 mt-2 border-t flex justify-between items-center">
                  <span className="font-bold text-gray-700">Stock Value:</span>
                  <span className="font-extrabold text-rose-700 text-sm">₹ {wh.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WarehouseWiseStock;
