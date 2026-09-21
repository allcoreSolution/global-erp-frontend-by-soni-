import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Search, X, Download, Upload, Printer } from 'lucide-react';
import api from '../../api';

const PriceList = () => {
  const [priceLists, setPriceLists] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPL, setCurrentPL] = useState({ id: '', name: '', customerType: 'Retailer', status: true, productPricing: [], quantityPricing: [] });

  useEffect(() => {
    fetchPriceLists();
  }, []);

  const fetchPriceLists = async () => {
    try {
      setLoading(true);
      const res = await api.get('/price-lists');
      setPriceLists(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch price lists', error);
      alert('Failed to load price lists');
    } finally {
      setLoading(false);
    }
  };

  const filtered = priceLists.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.customerType || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id, _id) => {
    if (window.confirm(`Are you sure you want to delete price list ${id}?`)) {
      try {
        await api.delete(`/price-lists/${_id}`);
        setPriceLists(priceLists.filter(p => p._id !== _id));
      } catch (error) {
        console.error('Failed to delete price list', error);
        alert('Failed to delete price list');
      }
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    const nextId = `PL-${String(priceLists.length + 1).padStart(3, '0')}`;
    setCurrentPL({ id: nextId, name: '', customerType: 'Retailer', status: true, productPricing: [], quantityPricing: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pl) => {
    setIsEditMode(true);
    setCurrentPL({ ...pl });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...currentPL };
      // Remove empty string references to prevent mongoose casting issues if any, although here they are mostly strings.
      if (payload.company === '') delete payload.company;
      if (payload.branch === '') delete payload.branch;

      if (isEditMode) {
        const res = await api.put(`/price-lists/${currentPL._id}`, payload);
        setPriceLists(priceLists.map(p => p._id === currentPL._id ? res.data.data : p));
      } else {
        const res = await api.post('/price-lists', payload);
        setPriceLists([...priceLists, res.data.data]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save price list', error);
      alert('Failed to save price list. ' + (error.response?.data?.message || ''));
    }
  };

  // Real CSV Export
  const handleExportCSV = () => {
    const headers = ['Price List Code', 'Price List Name', 'Customer Type', 'Active'];
    const rows = priceLists.map(pl => [
      pl.id,
      `"${(pl.name || '').replace(/"/g, '""')}"`,
      pl.customerType,
      pl.status ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pricelists_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real CSV Import
  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let successCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 3) {
            const payload = {
              id: cols[0] || `PL-NEW-${Date.now()}-${i}`,
              name: cols[1] || 'Imported Slab',
              customerType: cols[2] || 'Retailer',
              status: cols[3] === 'Yes' ? true : false,
              productPricing: [],
              quantityPricing: []
            };
            try {
              await api.post('/price-lists', payload);
              successCount++;
            } catch(e) { console.error('Failed to import row', i, e); }
          }
        }
        if (successCount > 0) {
          fetchPriceLists();
          alert(`Successfully imported ${successCount} price lists!`);
        } else {
          alert("Import failed. Headers should match: Price List Code, Price List Name, Customer Type, Active");
        }
      } catch (err) {
        alert("Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <input
        type="file"
        id="pricelist-csv-file"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Price List Master</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Create pricing levels, set up standard discount slabs, and configure wholesales catalogs.</p>
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto no-print">
          <button
            onClick={() => document.getElementById('pricelist-csv-file').click()}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Upload size={13} /> Import CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
          >
            <Printer size={13} /> Print / PDF
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-[10px] sm:text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={13} /> Add Price List
          </button>
        </div>
      </div>

      {/* Filter search */}
      <div className="relative mb-4 w-full max-w-sm no-print">
        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by ID, Name or Customer Type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Table responsive */}
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="block w-full overflow-x-auto w-full text-left text-[11px] sm:text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b font-semibold text-gray-700">
              <th className="p-2.5 sm:p-3">Price List Code</th>
              <th className="p-2.5 sm:p-3">Price List Name</th>
              <th className="p-2.5 sm:p-3">Customer Type</th>
              <th className="p-2.5 sm:p-3 text-center no-print">Status</th>
              <th className="p-2.5 sm:p-3 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(pl => (
              <tr key={pl.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-2.5 sm:p-3 font-semibold text-indigo-600 font-mono">{pl.id}</td>
                <td className="p-2.5 sm:p-3 font-medium text-gray-900">{pl.name}</td>
                <td className="p-2.5 sm:p-3 text-gray-600">{pl.customerType}</td>
                <td className="p-2.5 sm:p-3 text-center no-print">
                  <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${pl.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {pl.status ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-2.5 sm:p-3 text-center no-print">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => handleOpenEdit(pl)} className="p-1 text-amber-600 hover:bg-amber-50 rounded">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(pl.id, pl._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
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
          <div className="bg-white rounded-lg w-full max-w-4xl shadow-xl border my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 text-black">
            <div className="border-b border-blue-500 p-4 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h3 className="font-bold text-lg text-gray-800">{isEditMode ? 'Edit Price List' : 'Create Price List'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Price List Code *</label>
                  <input type="text" disabled value={currentPL.id} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Price List Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Retailer Price List"
                    value={currentPL.name}
                    onChange={(e) => setCurrentPL({ ...currentPL, name: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none focus:border-blue-450"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Price Type *</label>
                  <select
                    value={currentPL.priceType || 'Sales'}
                    onChange={(e) => setCurrentPL({ ...currentPL, priceType: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Purchase">Purchase</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Applicable For *</label>
                  <select
                    value={currentPL.applicableFor || currentPL.customerType || 'Retailer'}
                    onChange={(e) => setCurrentPL({ ...currentPL, applicableFor: e.target.value, customerType: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                  >
                    <option value="Retailer">Retailer</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Currency *</label>
                  <select
                    value={currentPL.currency || 'INR'}
                    onChange={(e) => setCurrentPL({ ...currentPL, currency: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Company *</label>
                  <select
                    value={currentPL.company || ''}
                    onChange={(e) => setCurrentPL({ ...currentPL, company: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                  >
                    <option value="">Select Company</option>
                    <option value="CompA">Main Company</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Branch</label>
                  <select
                    value={currentPL.branch || ''}
                    onChange={(e) => setCurrentPL({ ...currentPL, branch: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                  >
                    <option value="">Select Branch</option>
                    <option value="BranchA">Head Office</option>
                  </select>
                </div>
              </div>

              {/* Validity */}
              <div>
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">VALIDITY</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Effective From *</label>
                    <input
                      type="date"
                      required
                      value={currentPL.effectiveFrom || ''}
                      onChange={(e) => setCurrentPL({ ...currentPL, effectiveFrom: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Effective To</label>
                    <input
                      type="date"
                      value={currentPL.effectiveTo || ''}
                      onChange={(e) => setCurrentPL({ ...currentPL, effectiveTo: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentPL.defaultPriceList !== false}
                        onChange={(e) => setCurrentPL({ ...currentPL, defaultPriceList: e.target.checked })}
                        className="rounded text-indigo-600 h-4 w-4"
                      />
                      <span className="text-xs font-semibold text-gray-700 uppercase">Default Price List</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase">Status</span>
                      <select
                        value={currentPL.status ? 'Active' : 'Inactive'}
                        onChange={(e) => setCurrentPL({ ...currentPL, status: e.target.value === 'Active' })}
                        className="border border-blue-500 rounded px-2 py-1 text-sm outline-none bg-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Pricing */}
              <div>
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">PRODUCT PRICING</h4>
                <div className="mb-2">
                  <button type="button" onClick={() => setCurrentPL({ ...currentPL, productPricing: [...(currentPL.productPricing || []), { product: '', sku: '', unit: '', basePrice: '', discount: '', tax: '' }] })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition-colors">
                    <Plus size={14} /> Add Product
                  </button>
                </div>
                <div className="overflow-x-auto border border-blue-500 rounded">
                  <table className="block w-full overflow-x-auto w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 border-b border-blue-500 text-gray-700">
                      <tr>
                        <th className="p-2 font-semibold">Product</th>
                        <th className="p-2 font-semibold">SKU</th>
                        <th className="p-2 font-semibold">Unit</th>
                        <th className="p-2 font-semibold">Base Price</th>
                        <th className="p-2 font-semibold">Discount</th>
                        <th className="p-2 font-semibold">Tax</th>
                        <th className="p-2 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-500 bg-white">
                      {(currentPL.productPricing || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-1"><input type="text" value={item.product || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].product = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" /></td>
                          <td className="p-1"><input type="text" value={item.sku || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].sku = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" /></td>
                          <td className="p-1"><input type="text" value={item.unit || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].unit = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" /></td>
                          <td className="p-1"><input type="text" value={item.basePrice || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].basePrice = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" /></td>
                          <td className="p-1"><input type="text" value={item.discount || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].discount = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" /></td>
                          <td className="p-1"><input type="text" value={item.tax || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].tax = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" /></td>
                          <td className="p-1 text-center">
                            <button type="button" onClick={() => { const newArr = currentPL.productPricing.filter((_, i) => i !== idx); setCurrentPL({...currentPL, productPricing: newArr}); }} className="text-red-500 hover:text-red-700 p-1"><X size={14}/></button>
                          </td>
                        </tr>
                      ))}
                      {(!currentPL.productPricing || currentPL.productPricing.length === 0) && (
                        <tr><td colSpan="7" className="p-3 text-center text-gray-500 font-medium">No products added. Click 'Add Product' to start.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quantity Pricing */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-indigo-600 mb-0 pb-0">QUANTITY PRICING</h4>
                  <button type="button" onClick={() => setCurrentPL({ ...currentPL, quantityPricing: [...(currentPL.quantityPricing || []), { minQty: '', maxQty: '', price: '' }] })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition-colors">
                    <Plus size={14} /> Add Tier
                  </button>
                </div>
                <div className="overflow-x-auto border border-blue-500 rounded max-w-lg">
                  <table className="block w-full overflow-x-auto w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 border-b border-blue-500 text-gray-700">
                      <tr>
                        <th className="p-2 font-semibold">Min Qty</th>
                        <th className="p-2 font-semibold">Max Qty</th>
                        <th className="p-2 font-semibold">Price</th>
                        <th className="p-2 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-500 bg-white">
                      {(currentPL.quantityPricing || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-1"><input type="number" value={item.minQty || ''} onChange={(e) => { const newArr = [...currentPL.quantityPricing]; newArr[idx].minQty = e.target.value; setCurrentPL({...currentPL, quantityPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" /></td>
                          <td className="p-1"><input type="number" value={item.maxQty || ''} onChange={(e) => { const newArr = [...currentPL.quantityPricing]; newArr[idx].maxQty = e.target.value; setCurrentPL({...currentPL, quantityPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" /></td>
                          <td className="p-1"><input type="text" value={item.price || ''} onChange={(e) => { const newArr = [...currentPL.quantityPricing]; newArr[idx].price = e.target.value; setCurrentPL({...currentPL, quantityPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" /></td>
                          <td className="p-1 text-center">
                            <button type="button" onClick={() => { const newArr = currentPL.quantityPricing.filter((_, i) => i !== idx); setCurrentPL({...currentPL, quantityPricing: newArr}); }} className="text-red-500 hover:text-red-700 p-1"><X size={14}/></button>
                          </td>
                        </tr>
                      ))}
                      {(!currentPL.quantityPricing || currentPL.quantityPricing.length === 0) && (
                        <tr><td colSpan="4" className="p-3 text-center text-gray-500 font-medium">No tiers added. Click 'Add Tier' to start.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={currentPL.notes || ''}
                  onChange={(e) => setCurrentPL({ ...currentPL, notes: e.target.value })}
                  placeholder="Enter notes..."
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 border-t border-blue-500 pt-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-blue-500 rounded text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded text-sm font-semibold shadow hover:bg-indigo-700">Save Price List</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceList;
