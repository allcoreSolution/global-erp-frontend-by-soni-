import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Search, X, Check, Upload, Download, Printer } from 'lucide-react';

const BasicInfo = () => {
  const [suppliers, setSuppliers] = useState([
    { id: 'SUP-001', name: 'Rathi Steel Traders', type: 'Manufacturer', category: 'Raw Materials', status: true },
    { id: 'SUP-002', name: 'Krishna Enterprises', type: 'Distributor', category: 'Packaging', status: true },
    { id: 'SUP-003', name: 'Vikas Logistics & Co', type: 'Service Provider', category: 'Logistics', status: false }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState({ id: '', name: '', type: 'Manufacturer', category: 'Raw Materials', status: true });

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, status: !s.status } : s));
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete supplier ${id}?`)) {
      setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    const nextId = `SUP-${String(suppliers.length + 1).padStart(3, '0')}`;
    setCurrentSupplier({ id: nextId, name: '', type: 'Manufacturer', category: 'Raw Materials', status: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setIsEditMode(true);
    setCurrentSupplier({ ...sup });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      setSuppliers(suppliers.map(s => s.id === currentSupplier.id ? { ...currentSupplier } : s));
    } else {
      setSuppliers([...suppliers, { ...currentSupplier }]);
    }
    setIsModalOpen(false);
  };

  // Real CSV Export
  const handleExportCSV = () => {
    const headers = ['Supplier Code', 'Supplier Name', 'Supplier Type', 'Category', 'Status'];
    const rows = suppliers.map(s => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      s.type,
      s.category,
      s.status ? 'Active' : 'Inactive'
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `suppliers_basic_info_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const newSuppliers = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 5) {
            newSuppliers.push({
              id: cols[0] || `SUP-NEW-${Date.now()}-${i}`,
              name: cols[1] || 'Imported Supplier',
              type: cols[2] || 'Manufacturer',
              category: cols[3] || 'Raw Materials',
              status: cols[4] === 'Active' ? true : false
            });
          }
        }
        if (newSuppliers.length > 0) {
          setSuppliers(prev => [...prev, ...newSuppliers]);
          alert(`Successfully imported ${newSuppliers.length} suppliers!`);
        } else {
          alert("Import failed. Headers should match: Supplier Code, Supplier Name, Supplier Type, Category, Status");
        }
      } catch (err) {
        alert("Failed to parse CSV correctly.");
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
        id="supplier-basic-csv"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Supplier Basic Information</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Manage basic credentials, types, categories and statuses of supply partners.</p>
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto no-print">
          <button
            onClick={() => document.getElementById('supplier-basic-csv').click()}
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
            <Plus size={13} /> Add Supplier
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative mb-4 w-full max-w-sm no-print">
        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by ID or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b font-semibold text-gray-700">
              <th className="p-2 sm:p-3 whitespace-nowrap">Supplier Code</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">Supplier Name</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">Supplier Type</th>
              <th className="p-2 sm:p-3 whitespace-nowrap">Category</th>
              <th className="p-2 sm:p-3 text-center whitespace-nowrap">Status</th>
              <th className="p-2 sm:p-3 text-center whitespace-nowrap no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map(sup => (
                <tr key={sup.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2 sm:p-3 font-semibold text-indigo-600 whitespace-nowrap font-mono">{sup.id}</td>
                  <td className="p-2 sm:p-3 font-medium text-gray-900">{sup.name}</td>
                  <td className="p-2 sm:p-3 text-gray-650 whitespace-nowrap">{sup.type}</td>
                  <td className="p-2 sm:p-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[9px] sm:text-[10px]">
                      {sup.category}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(sup.id)}
                      className={`px-2 py-0.5 rounded-full font-bold text-[9px] sm:text-[10px] ${
                        sup.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {sup.status ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-2 sm:p-3 text-center whitespace-nowrap no-print">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(sup)}
                        className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(sup.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">No suppliers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 overflow-y-auto no-print">
          <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl border my-auto">
            <div className="bg-slate-50/50 shadow-inner border border-slate-200 text-slate-800 p-3.5 flex justify-between items-center">
              <h3 className="font-bold text-xs sm:text-sm">{isEditMode ? 'Edit Supplier' : 'Add Supplier'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Supplier Code</label>
                <input type="text" disabled value={currentSupplier.id} className="w-full bg-slate-50 border p-2 rounded text-gray-500 cursor-not-allowed text-xs font-mono" />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={currentSupplier.name}
                  onChange={(e) => setCurrentSupplier({ ...currentSupplier, name: e.target.value })}
                  placeholder="e.g. Rathi Steel"
                  className="w-full border p-2 rounded focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Supplier Type</label>
                <select
                  value={currentSupplier.type}
                  onChange={(e) => setCurrentSupplier({ ...currentSupplier, type: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none bg-white text-xs"
                >
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Service Provider">Service Provider</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                <select
                  value={currentSupplier.category}
                  onChange={(e) => setCurrentSupplier({ ...currentSupplier, category: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none bg-white text-xs"
                >
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Logistics">Logistics</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={currentSupplier.status}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, status: e.target.checked })}
                    className="rounded h-4 w-4"
                  />
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Active Status</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3.5 py-1.5 border rounded hover:bg-slate-50 text-xs">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 text-xs">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicInfo;
