import React from 'react';
import { Package, Save } from 'lucide-react';

const InventorySettings = () => {
  const handleSave = (e) => { e.preventDefault(); alert('Inventory settings saved!'); };
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-amber-600" size={22} /> Inventory & Stock Rules
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Define low stock thresholds and item categorization.</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded" onClick={handleSave}><Save size={14} /> Save</button>
      </div>
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase text-slate-700">Stock Policies</h3>
        <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Global Low Stock Alert Threshold</label><input type="number" className="w-full text-xs border rounded p-2" defaultValue="10" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Default Warehouse</label><select className="w-full text-xs border rounded p-2"><option>Main Warehouse</option></select></div>
        </div>
      </div>
    </div>
  );
};
export default InventorySettings;
