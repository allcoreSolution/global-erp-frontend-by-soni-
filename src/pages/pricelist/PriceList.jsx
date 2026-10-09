import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Search, X, Download, Upload, Printer, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const PriceList = () => {
  const [priceLists, setPriceLists] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPL, setCurrentPL] = useState({ id: '', name: '', customerType: 'Retailer', status: true, productPricing: [], quantityPricing: [] });

  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [brRes, prRes, cuRes, suRes, unRes] = await Promise.all([
          api.get('/branches').catch(() => ({ data: { data: [] } })),
          api.get('/products').catch(() => ({ data: { data: [] } })),
          api.get('/customers').catch(() => ({ data: { data: [] } })),
          api.get('/suppliers').catch(() => ({ data: { data: [] } })),
          api.get('/units').catch(() => ({ data: { data: [] } }))
        ]);
        if (brRes.data?.data) setBranches(brRes.data.data);
        if (prRes.data?.data) setProducts(prRes.data.data);
        if (cuRes.data?.data) setCustomers(cuRes.data.data);
        if (suRes.data?.data) setSuppliers(suRes.data.data);
        if (unRes.data?.data) setUnits(unRes.data.data);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    };
    fetchDropdowns();
  }, []);

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
      Swal.fire('Error', 'Failed to load price lists', 'error');
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
        Swal.fire('Error', 'Failed to delete price list', 'error');
      }
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    let nextNum = priceLists.length + 1;
    if (priceLists.length > 0) {
      const ids = priceLists.map(p => {
        const match = p.id?.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      });
      nextNum = Math.max(...ids) + 1;
    }
    const nextId = `PL-${String(nextNum).padStart(3, '0')}`;
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
      Swal.fire('Error', 'Failed to save price list. ' + (error.response?.data?.message || ''), 'error');
    }
  };

  // Real CSV Export
  const handleExportCSV = () => {
    if (priceLists.length === 0) {
      Swal.fire('No Data', 'No data available to export.', 'warning');
      return;
    }
    const headers = ['Price List Code', 'Price List Name', 'Customer Type', 'Active'];
    const rows = priceLists.map(pl => [
      pl.id,
      `"${(pl.name || '').replace(/"/g, '""')}"`,
      pl.customerType,
      pl.status ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(',') + '\n' + '1001,Sample Name,Standard,Yes', ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pricelists_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const headers = ['Price List Code', 'Price List Name', 'Customer Type', 'Active'];
    const dummyData = [
      'PL-001', 'Summer Sale Prices', 'Retailer', 'Yes'
    ];
    const csvContent = headers.join(',') + '\n' + dummyData.map(d => `"${d}"`).join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pricelist_sample.csv`);
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
          Swal.fire('Success', `Successfully imported ${successCount} price lists!`, 'success');
        } else {
          Swal.fire('Warning', "Import failed. Headers should match: Price List Code, Price List Name, Customer Type, Active", 'warning');
        }
      } catch (err) {
        Swal.fire('Error', "Failed to parse CSV file.", 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
            <Upload size={13} /> Import
          </button>
          <button
            onClick={handleDownloadSample}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <FileText size={13} /> Sample
          </button>
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Download size={13} /> Export
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
        <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
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
              
              {/* BASIC INFORMATION */}
              <div>
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">BASIC INFORMATION</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Price List Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Retailer Price List"
                      value={currentPL.name}
                      onChange={(e) => setCurrentPL({ ...currentPL, name: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Price List Code *</label>
                    <input type="text" disabled value={currentPL.id} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Price Type *</label>
                    <select
                      value={currentPL.priceType || 'Sales'}
                      onChange={(e) => setCurrentPL({ ...currentPL, priceType: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Purchase">Purchase</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Currency *</label>
                    <select
                      value={currentPL.currency || 'INR'}
                      onChange={(e) => setCurrentPL({ ...currentPL, currency: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Status *</label>
                    <select
                      value={currentPL.status ? 'Active' : 'Inactive'}
                      onChange={(e) => setCurrentPL({ ...currentPL, status: e.target.value === 'Active' })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Valid From *</label>
                    <input
                      type="date"
                      required
                      value={currentPL.effectiveFrom || ''}
                      onChange={(e) => setCurrentPL({ ...currentPL, effectiveFrom: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Valid To</label>
                    <input
                      type="date"
                      value={currentPL.effectiveTo || ''}
                      onChange={(e) => setCurrentPL({ ...currentPL, effectiveTo: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>



              {/* PRODUCT PRICING */}
              <div>
                <div className="flex justify-between items-center mb-3 border-b pb-1">
                  <h4 className="text-sm font-bold text-indigo-600">PRODUCT PRICING</h4>
                  <button type="button" onClick={() => setCurrentPL({ ...currentPL, productPricing: [...(currentPL.productPricing || []), { product: '', unit: '', retailRate: '', wholesaleRate: '', effectiveFrom: '', effectiveTo: '' }] })} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition-colors">
                    <Plus size={14} /> Add Product
                  </button>
                </div>
                <div className="overflow-x-auto border border-gray-300 rounded">
                  <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                    <thead className="bg-gray-50 border-b border-gray-300 text-gray-700">
                      <tr>
                        <th className="p-2 font-semibold">Product *</th>
                        <th className="p-2 font-semibold">Unit</th>
                        <th className="p-2 font-semibold whitespace-nowrap">Retail Rate *</th>
                        <th className="p-2 font-semibold whitespace-nowrap">Wholesale Rate *</th>
                        <th className="p-2 font-semibold">Effective From</th>
                        <th className="p-2 font-semibold">Effective To</th>
                        <th className="p-2 font-semibold text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {(currentPL.productPricing || []).map((item, idx) => {
                        return (
                          <tr key={idx}>
                            <td className="p-1">
                              <select value={item.product || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].product = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500 bg-white">
                                <option value="">Select Product</option>
                                {products.map(p => <option key={p._id} value={p._id}>{p.productName || p.name}</option>)}
                              </select>
                            </td>
                            <td className="p-1">
                              <select value={item.unit || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].unit = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500 bg-white">
                                <option value="">Select Unit</option>
                                {units.map(u => <option key={u._id} value={u.unitName || u.name}>{u.unitName || u.name}</option>)}
                              </select>
                            </td>
                            <td className="p-1"><input type="number" min="0" step="0.01" value={item.retailRate || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].retailRate = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" placeholder="0.00" /></td>
                            <td className="p-1"><input type="number" min="0" step="0.01" value={item.wholesaleRate || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].wholesaleRate = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" placeholder="0.00" /></td>
                            <td className="p-1"><input type="date" value={item.effectiveFrom || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].effectiveFrom = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" /></td>
                            <td className="p-1"><input type="date" value={item.effectiveTo || ''} onChange={(e) => { const newArr = [...currentPL.productPricing]; newArr[idx].effectiveTo = e.target.value; setCurrentPL({...currentPL, productPricing: newArr}); }} className="w-full border border-gray-300 rounded px-1.5 py-1 focus:outline-none focus:border-blue-500" /></td>
                            <td className="p-1 text-center">
                              <button type="button" onClick={() => { const newArr = currentPL.productPricing.filter((_, i) => i !== idx); setCurrentPL({...currentPL, productPricing: newArr}); }} className="text-red-500 hover:text-red-700 p-1"><X size={14}/></button>
                            </td>
                          </tr>
                        );
                      })}
                      {(!currentPL.productPricing || currentPL.productPricing.length === 0) && (
                        <tr><td colSpan="11" className="p-4 text-center text-gray-500 font-medium">No product pricing rules added. Click 'Add Product' to start.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-gray-300 rounded text-sm font-semibold hover:bg-gray-50">Cancel</button>
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
