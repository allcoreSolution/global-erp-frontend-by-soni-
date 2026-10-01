import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Upload, Download, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
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
      Swal.fire('Error', 'Failed to fetch tax slabs', 'error');
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
      Swal.fire('Error', 'Failed to save tax slab. ' + (err.response?.data?.message || ''), 'error');
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
        Swal.fire('Error', 'Failed to delete tax slab. ' + (err.response?.data?.message || ''), 'error');
      }
    }
  };

  const handleExportCSV = () => {
    if (taxes.length === 0) {
      Swal.fire('No Data', 'No data available to export.', 'warning');
      return;
    }
    const headers = ['Code', 'Tax Slab Name', 'GST %', 'CGST / SGST / IGST', 'Cess %', 'Pricing Type'];
    const rows = taxes.map(t => [
      `"${t.id || ''}"`,
      `"${t.name || ''}"`,
      `"${t.rate || 0}%"`,
      `"C: ${t.cgst || 0}% | S: ${t.sgst || 0}% | I: ${t.igst || 0}%"`,
      `"${t.cess || 0}%"`,
      `"${t.inclusive ? 'Inclusive' : 'Exclusive'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'TaxConfig.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const headers = ['Code', 'Tax Slab Name', 'GST %', 'CGST / SGST / IGST', 'Cess %', 'Pricing Type'];
    const csvContent = headers.join('\n'); // Just headers
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'TaxConfig_Sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length > 1) {
        Swal.fire('Success', 'Tax configuration records imported successfully!', 'success');
      } else {
        Swal.fire('Error', 'File contains no data.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Tax Configurations</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Configure corporate SGST, CGST, IGST ratios, cess percentages, and inclusive/exclusive parameter flags.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Hidden file input for import */}
          <input 
            type="file" 
            accept=".csv" 
            id="import-csv" 
            className="hidden" 
            onChange={handleImportCSV} 
          />
          <label 
            htmlFor="import-csv"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Upload size={13} /> Import
          </label>
          <button 
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <FileText size={13} /> Sample
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Download size={13} /> Export
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus size={14} /> Add Tax Slab
          </button>
        </div>
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
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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

              {/* VALIDITY */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Validity (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Effective From</label>
                    <input type="date" value={currentTax.effectiveFrom} onChange={(e) => setCurrentTax({ ...currentTax, effectiveFrom: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Effective To</label>
                    <input type="date" value={currentTax.effectiveTo} onChange={(e) => setCurrentTax({ ...currentTax, effectiveTo: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
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
