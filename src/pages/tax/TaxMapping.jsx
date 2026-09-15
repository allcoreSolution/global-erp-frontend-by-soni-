import React, { useState } from 'react';
import { Tag, ShieldAlert, Edit, Trash2, Search, Plus, X } from 'lucide-react';

const TaxMapping = () => {
  const [mappings, setMappings] = useState([
    { id: 'TM-001', hsn: '7214', category: 'Steel Items', salesTax: 'Standard GST 18%', purchaseTax: 'Standard GST 18%', exemption: 'No Exemption' },
    { id: 'TM-002', hsn: '7306', category: 'Pipes & Fittings', salesTax: 'Standard GST 18%', purchaseTax: 'Standard GST 18%', exemption: 'No Exemption' }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMap, setCurrentMap] = useState({
    id: '', hsnCode: '', hsnType: 'HSN', description: '',
    company: '', category: '', product: '', unit: '',
    taxConfig: 'GST 5%', gstRate: 5, cgst: 2.5, sgst: 2.5, igst: 5, cess: 0,
    effectiveFrom: '', effectiveTo: '', isActive: true
  });
  const [isEdit, setIsEdit] = useState(false);

  const handleOpenAdd = () => {
    setIsEdit(false);
    const nextId = `HSN-${String(mappings.length + 1).padStart(4, '0')}`;
    setCurrentMap({
      id: nextId, hsnCode: '', hsnType: 'HSN', description: '',
      company: '', category: '', product: '', unit: '',
      taxConfig: 'GST 5%', gstRate: 5, cgst: 2.5, sgst: 2.5, igst: 5, cess: 0,
      effectiveFrom: '', effectiveTo: '', isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (map) => {
    setIsEdit(true);
    setCurrentMap({ ...map });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      setMappings(mappings.map(m => m.id === currentMap.id ? { ...currentMap } : m));
    } else {
      setMappings([...mappings, { ...currentMap }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete tax mapping ${id}?`)) {
      setMappings(mappings.filter(m => m.id !== id));
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">HSN / SAC Tax Mapping</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Bind standard purchase/sales tax slabs with product HSN/SAC codes and tax exemption categories.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={14} /> Add HSN Map
        </button>
      </div>

      {/* Grid mappings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        {mappings.map(m => (
          <div key={m.id} className="bg-slate-50 border rounded-lg p-4 space-y-2 relative">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-indigo-600 font-mono">HSN Code: {m.hsn}</span>
              <div className="flex gap-1.5">
                <button onClick={() => handleOpenEdit(m)} className="p-1 hover:bg-slate-200 rounded text-amber-600">
                  <Edit size={13} />
                </button>
                <button onClick={() => handleDelete(m.id)} className="p-1 hover:bg-red-50 rounded text-red-600">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div className="space-y-1 text-[11px] sm:text-xs">
              <p><span className="text-gray-500">Mapping Code:</span> <strong className="text-gray-800">{m.id}</strong></p>
              <p><span className="text-gray-500">Tax Category:</span> <strong className="text-gray-800">{m.category}</strong></p>
              <p><span className="text-gray-500">Sales Tax:</span> <strong className="text-gray-900 text-indigo-600">{m.salesTax}</strong></p>
              <p><span className="text-gray-500">Purchase Tax:</span> <strong className="text-gray-900 text-emerald-600">{m.purchaseTax}</strong></p>
              <p><span className="text-gray-500">Exemption:</span> <strong className="text-gray-800">{m.exemption}</strong></p>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl border">
            <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur shadow-sm border-b border-slate-200 text-slate-800 p-4 flex justify-between items-center">
              <h3 className="font-bold text-base sm:text-lg">{isEdit ? 'Edit HSN Map' : 'Add HSN Map'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs sm:text-sm">
              
              {/* BASIC INFORMATION */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">HSN Map Code</label>
                    <input type="text" disabled value={currentMap.id} className="w-full bg-slate-50 border p-2 rounded text-gray-500 text-xs cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">HSN/SAC Code *</label>
                    <input type="text" required placeholder="e.g. 7214" value={currentMap.hsnCode} onChange={(e) => setCurrentMap({ ...currentMap, hsnCode: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">HSN Type *</label>
                    <select value={currentMap.hsnType} onChange={(e) => setCurrentMap({ ...currentMap, hsnType: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="HSN">HSN</option>
                      <option value="SAC">SAC</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
                    <input type="text" required placeholder="Enter description..." value={currentMap.description} onChange={(e) => setCurrentMap({ ...currentMap, description: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                </div>
              </div>

              {/* PRODUCT MAPPING */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Product Mapping</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Company *</label>
                    <select required value={currentMap.company} onChange={(e) => setCurrentMap({ ...currentMap, company: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="">Select Company</option>
                      <option value="Company A">Company A</option>
                      <option value="Company B">Company B</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                    <select required value={currentMap.category} onChange={(e) => setCurrentMap({ ...currentMap, category: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="">Select Category</option>
                      <option value="Steel Items">Steel Items</option>
                      <option value="Pipes & Fittings">Pipes & Fittings</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Product</label>
                    <select value={currentMap.product} onChange={(e) => setCurrentMap({ ...currentMap, product: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="">Select Product</option>
                      <option value="Product 1">Product 1</option>
                      <option value="Product 2">Product 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
                    <select value={currentMap.unit} onChange={(e) => setCurrentMap({ ...currentMap, unit: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="">Select Unit</option>
                      <option value="Kg">Kg</option>
                      <option value="Ton">Ton</option>
                      <option value="Meters">Meters</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TAX MAPPING */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Tax Mapping</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tax Configuration *</label>
                    <select required value={currentMap.taxConfig} onChange={(e) => {
                      const val = e.target.value;
                      let rate = 5;
                      if(val === 'GST 12%') rate = 12;
                      if(val === 'GST 18%') rate = 18;
                      if(val === 'GST 28%') rate = 28;
                      const half = rate / 2;
                      setCurrentMap({ ...currentMap, taxConfig: val, gstRate: rate, cgst: half, sgst: half, igst: rate });
                    }} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="GST 5%">GST 5%</option>
                      <option value="GST 12%">GST 12%</option>
                      <option value="GST 18%">GST 18%</option>
                      <option value="GST 28%">GST 28%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">GST Rate (%)</label>
                    <input type="number" value={currentMap.gstRate} readOnly className="w-full bg-slate-50 border p-2 rounded text-gray-600 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">CGST (%)</label>
                    <input type="number" value={currentMap.cgst} readOnly className="w-full bg-slate-50 border p-2 rounded text-gray-600 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">SGST (%)</label>
                    <input type="number" value={currentMap.sgst} readOnly className="w-full bg-slate-50 border p-2 rounded text-gray-600 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">IGST (%)</label>
                    <input type="number" value={currentMap.igst} readOnly className="w-full bg-slate-50 border p-2 rounded text-gray-600 text-xs" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Cess (%)</label>
                    <input type="number" value={currentMap.cess} onChange={(e) => setCurrentMap({ ...currentMap, cess: Number(e.target.value) })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                </div>
              </div>

              {/* VALIDITY */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Validity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Effective From *</label>
                      <input type="date" required value={currentMap.effectiveFrom} onChange={(e) => setCurrentMap({ ...currentMap, effectiveFrom: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Effective To</label>
                      <input type="date" value={currentMap.effectiveTo} onChange={(e) => setCurrentMap({ ...currentMap, effectiveTo: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                    </div>
                  </div>
                  <div className="flex items-center sm:pl-4">
                    <label className="flex items-center gap-2 cursor-pointer mt-5">
                      <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${currentMap.isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                        <input type="checkbox" className="sr-only" checked={currentMap.isActive} onChange={(e) => setCurrentMap({ ...currentMap, isActive: e.target.checked })} />
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${currentMap.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">Set as Active</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded font-semibold text-gray-600 hover:bg-slate-50 text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 text-sm shadow-sm transition-colors">Save HSN Map</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxMapping;
