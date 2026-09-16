import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import api from '../../api';

const TaxConfig = () => {
  const [taxes, setTaxes] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentTax, setCurrentTax] = useState({
    id: '', name: '', type: 'GST', rate: 18, status: 'Active',
    gstType: 'CGST + SGST', cgst: 9, sgst: 9, igst: 18, cess: 0,
    transactionSales: true, transactionPurchase: true, transactionReturn: false,
    applyOn: 'Product', hsnSac: '', category: '',
    calculation: 'On Discounted Price', inclusive: false,
    placeState: 'Uttar Pradesh', taxTreatment: 'Intra-State',
    inputLedger: '', outputLedger: '',
    effectiveFrom: '', effectiveTo: '',
    reverseCharge: false, taxExempt: false, zeroRated: false
  });

  const fetchTaxes = async () => {
    try {
      const res = await api.get('/tax-slabs');
      setTaxes(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch tax slabs:', err);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const filtered = taxes.filter(t =>
    (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEdit(false);
    const nextId = `TAX-${String(taxes.length + 1).padStart(4, '0')}`;
    setCurrentTax({
      id: nextId, name: '', type: 'GST', rate: 18, status: 'Active',
      gstType: 'CGST + SGST', cgst: 9, sgst: 9, igst: 18, cess: 0,
      transactionSales: true, transactionPurchase: true, transactionReturn: false,
      applyOn: 'Product', hsnSac: '', category: '',
      calculation: 'On Discounted Price', inclusive: false,
      placeState: 'Uttar Pradesh', taxTreatment: 'Intra-State',
      inputLedger: '', outputLedger: '',
      effectiveFrom: '', effectiveTo: '',
      reverseCharge: false, taxExempt: false, zeroRated: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tax) => {
    setIsEdit(true);
    setCurrentTax({ ...tax });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...currentTax };

      // Deep Checks
      if (payload.hsnSac === '') delete payload.hsnSac;
      if (payload.category === '') delete payload.category;
      if (payload.inputLedger === '') delete payload.inputLedger;
      if (payload.outputLedger === '') delete payload.outputLedger;
      if (payload.effectiveFrom === '') delete payload.effectiveFrom;
      if (payload.effectiveTo === '') delete payload.effectiveTo;
      if (payload.company === '') delete payload.company;

      payload.rate = Number(payload.rate) || 0;
      payload.cgst = Number(payload.cgst) || 0;
      payload.sgst = Number(payload.sgst) || 0;
      payload.igst = Number(payload.igst) || 0;
      payload.cess = Number(payload.cess) || 0;

      if (isEdit) {
        const idToUpdate = payload._id || payload.id;
        await api.put(`/tax-slabs/${idToUpdate}`, payload);
      } else {
        await api.post('/tax-slabs', payload);
      }
      fetchTaxes();
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to save tax slab. ' + (err.response?.data?.message || ''));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete tax slab ${id}?`)) {
      try {
        const tax = taxes.find(t => t.id === id);
        const idToDelete = tax?._id || id;
        await api.delete(`/tax-slabs/${idToDelete}`);
        fetchTaxes();
      } catch (err) {
        alert('Failed to delete tax slab. ' + (err.response?.data?.message || ''));
      }
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Tax Configurations</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Configure corporate SGST, CGST, IGST ratios, cess percentages, and inclusive/exclusive parameter flags.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={14} /> Add Tax Slab
        </button>
      </div>

      <div className="relative mb-4 w-full max-w-sm">
        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Code or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Responsive table */}
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b font-semibold text-gray-700">
              <th className="p-2.5 sm:p-3">Code</th>
              <th className="p-2.5 sm:p-3">Tax Slab Name</th>
              <th className="p-2.5 sm:p-3">GST %</th>
              <th className="p-2.5 sm:p-3">CGST / SGST / IGST</th>
              <th className="p-2.5 sm:p-3">Cess %</th>
              <th className="p-2.5 sm:p-3">Pricing Type</th>
              <th className="p-2.5 sm:p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(tax => (
              <tr key={tax.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-2.5 sm:p-3 font-semibold text-indigo-600 font-mono">{tax.id}</td>
                <td className="p-2.5 sm:p-3 font-medium text-gray-900">{tax.name}</td>
                <td className="p-2.5 sm:p-3 font-semibold">{tax.rate}%</td>
                <td className="p-2.5 sm:p-3 text-gray-500">C: {tax.cgst}% | S: {tax.sgst}% | I: {tax.igst}%</td>
                <td className="p-2.5 sm:p-3 text-gray-600">{tax.cess}%</td>
                <td className="p-2.5 sm:p-3 text-gray-600">{tax.inclusive ? 'Inclusive' : 'Exclusive'}</td>
                <td className="p-2.5 sm:p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => handleOpenEdit(tax)} className="p-1 text-amber-600 hover:bg-amber-50 rounded">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(tax.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border">
            <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur shadow-sm border-b border-slate-200 text-slate-800 p-4 flex justify-between items-center">
              <h3 className="font-bold text-base sm:text-lg">{isEdit ? 'Edit Tax Configuration' : 'Create Tax Configuration'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs sm:text-sm">
              
              {/* BASIC INFORMATION */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tax Code *</label>
                    <input type="text" disabled value={currentTax.id} className="w-full bg-slate-50 border p-2 rounded text-gray-500 text-xs cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tax Name *</label>
                    <input type="text" required placeholder="e.g. GST 18%" value={currentTax.name} onChange={(e) => setCurrentTax({ ...currentTax, name: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tax Type *</label>
                    <select value={currentTax.type} onChange={(e) => setCurrentTax({ ...currentTax, type: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="GST">GST</option>
                      <option value="VAT">VAT</option>
                      <option value="TDS">TDS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tax Rate * (%)</label>
                    <input type="number" required value={currentTax.rate} onChange={(e) => {
                      const r = Number(e.target.value);
                      const half = r / 2;
                      setCurrentTax({ ...currentTax, rate: r, cgst: half, sgst: half, igst: r });
                    }} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                    <select value={currentTax.status} onChange={(e) => setCurrentTax({ ...currentTax, status: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* GST CONFIGURATION */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">GST Configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">GST Type</label>
                    <select value={currentTax.gstType} onChange={(e) => setCurrentTax({ ...currentTax, gstType: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="CGST + SGST">CGST + SGST</option>
                      <option value="IGST">IGST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">CGST (%)</label>
                    <input type="number" value={currentTax.cgst} readOnly className="w-full bg-slate-50 border p-2 rounded text-gray-600 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">SGST (%)</label>
                    <input type="number" value={currentTax.sgst} readOnly className="w-full bg-slate-50 border p-2 rounded text-gray-600 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">IGST (%)</label>
                    <input type="number" value={currentTax.igst} readOnly className="w-full bg-slate-50 border p-2 rounded text-gray-600 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Cess (%)</label>
                    <input type="number" value={currentTax.cess} onChange={(e) => setCurrentTax({ ...currentTax, cess: Number(e.target.value) })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                </div>
              </div>

              {/* APPLICABILITY */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Applicability</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Transaction Type</label>
                    <div className="flex gap-4 items-center">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                        <input type="checkbox" checked={currentTax.transactionSales} onChange={(e) => setCurrentTax({ ...currentTax, transactionSales: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" /> Sales
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                        <input type="checkbox" checked={currentTax.transactionPurchase} onChange={(e) => setCurrentTax({ ...currentTax, transactionPurchase: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" /> Purchase
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                        <input type="checkbox" checked={currentTax.transactionReturn} onChange={(e) => setCurrentTax({ ...currentTax, transactionReturn: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500" /> Return
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Apply On</label>
                      <select value={currentTax.applyOn} onChange={(e) => setCurrentTax({ ...currentTax, applyOn: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="Product">Product</option>
                        <option value="Service">Service</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">HSN/SAC</label>
                      <input type="text" value={currentTax.hsnSac} onChange={(e) => setCurrentTax({ ...currentTax, hsnSac: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                      <select value={currentTax.category} onChange={(e) => setCurrentTax({ ...currentTax, category: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="">Select Category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Food">Food</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TAX CALCULATION */}
                <div>
                  <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Tax Calculation</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Calculation</label>
                      <select value={currentTax.calculation} onChange={(e) => setCurrentTax({ ...currentTax, calculation: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="On Discounted Price">On Discounted Price</option>
                        <option value="On MRP">On MRP</option>
                        <option value="Fixed Amount">Fixed Amount</option>
                      </select>
                    </div>
                    <div className="flex items-center mt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${currentTax.inclusive ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                          <input type="checkbox" className="sr-only" checked={currentTax.inclusive} onChange={(e) => setCurrentTax({ ...currentTax, inclusive: e.target.checked })} />
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${currentTax.inclusive ? 'translate-x-4' : 'translate-x-1'}`} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">Tax Inclusive</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* PLACE OF SUPPLY */}
                <div>
                  <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Place of Supply</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                      <select value={currentTax.placeState} onChange={(e) => setCurrentTax({ ...currentTax, placeState: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Karnataka">Karnataka</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Tax Treatment</label>
                      <select value={currentTax.taxTreatment} onChange={(e) => setCurrentTax({ ...currentTax, taxTreatment: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="Intra-State">Intra-State (CGST/SGST)</option>
                        <option value="Inter-State">Inter-State (IGST)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCOUNTING */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Accounting</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Input Tax Ledger</label>
                    <select value={currentTax.inputLedger} onChange={(e) => setCurrentTax({ ...currentTax, inputLedger: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="">Select Ledger</option>
                      <option value="CGST Input A/c">CGST Input A/c</option>
                      <option value="SGST Input A/c">SGST Input A/c</option>
                      <option value="IGST Input A/c">IGST Input A/c</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Output Tax Ledger</label>
                    <select value={currentTax.outputLedger} onChange={(e) => setCurrentTax({ ...currentTax, outputLedger: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="">Select Ledger</option>
                      <option value="CGST Output A/c">CGST Output A/c</option>
                      <option value="SGST Output A/c">SGST Output A/c</option>
                      <option value="IGST Output A/c">IGST Output A/c</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* VALIDITY */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Validity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Effective From</label>
                      <input type="date" value={currentTax.effectiveFrom} onChange={(e) => setCurrentTax({ ...currentTax, effectiveFrom: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Effective To</label>
                      <input type="date" value={currentTax.effectiveTo} onChange={(e) => setCurrentTax({ ...currentTax, effectiveTo: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 justify-center sm:pl-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${currentTax.reverseCharge ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                        <input type="checkbox" className="sr-only" checked={currentTax.reverseCharge} onChange={(e) => setCurrentTax({ ...currentTax, reverseCharge: e.target.checked })} />
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${currentTax.reverseCharge ? 'translate-x-4' : 'translate-x-1'}`} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">Reverse Charge</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${currentTax.taxExempt ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                        <input type="checkbox" className="sr-only" checked={currentTax.taxExempt} onChange={(e) => setCurrentTax({ ...currentTax, taxExempt: e.target.checked })} />
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${currentTax.taxExempt ? 'translate-x-4' : 'translate-x-1'}`} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">Tax Exempt</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${currentTax.zeroRated ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                        <input type="checkbox" className="sr-only" checked={currentTax.zeroRated} onChange={(e) => setCurrentTax({ ...currentTax, zeroRated: e.target.checked })} />
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${currentTax.zeroRated ? 'translate-x-4' : 'translate-x-1'}`} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">Zero Rated</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded font-semibold text-gray-600 hover:bg-slate-50 text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 text-sm shadow-sm transition-colors">Save Tax</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxConfig;
