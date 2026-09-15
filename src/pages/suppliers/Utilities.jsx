import React, { useState } from 'react';
import { Search, Download, Upload, Printer, CheckCircle } from 'lucide-react';

const Utilities = () => {
  const [suppliers, setSuppliers] = useState([
    { id: 'SUP-001', name: 'Rathi Steel Traders', type: 'Manufacturer', category: 'Raw Materials', contact: 'Sanjay Rathi' },
    { id: 'SUP-002', name: 'Krishna Enterprises', type: 'Distributor', category: 'Packaging', contact: 'Krishna Murari' },
    { id: 'SUP-003', name: 'Vikas Logistics & Co', type: 'Service Provider', category: 'Logistics', contact: 'Vikas Yadav' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [log, setLog] = useState([]);

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const filtered = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? s.type === filterType : true;
    const matchesCategory = filterCategory ? s.category === filterCategory : true;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Real CSV Export
  const handleExportCSV = () => {
    addLog("Exporting Supplier directory to CSV file...");
    const headers = ['Supplier Code', 'Supplier Name', 'Type', 'Category', 'SPOC Contact'];
    const rows = suppliers.map(s => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      s.type,
      s.category,
      `"${s.contact.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `suppliers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Success: Suppliers directory CSV generated and downloaded.");
  };

  // Real CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    addLog(`Reading file "${file.name}"...`);
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
              contact: cols[4] || ''
            });
          }
        }
        if (newSuppliers.length > 0) {
          setSuppliers(prev => [...prev, ...newSuppliers]);
          addLog(`Success: Imported ${newSuppliers.length} new supplier records!`);
          alert(`Successfully imported ${newSuppliers.length} suppliers!`);
        } else {
          addLog("Warning: No valid rows parsed from CSV file.");
          alert("Could not parse CSV. Make sure headers are: Supplier Code, Supplier Name, Type, Category, SPOC Contact");
        }
      } catch (err) {
        addLog("Error: Failed to parse CSV correctly.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrintReport = () => {
    addLog("Initiating print layout configurations...");
    window.print();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen space-y-6">
      <input
        type="file"
        id="supplier-csv-import"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Supplier Utilities & Operations</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Run search filter profiles, import spreadsheet catalogs, export registries, and print summary statements.</p>
      </div>

      {/* Control Actions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold no-print">
        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Download size={14} className="text-indigo-600" /> Export Registry</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Save your entire supplier contacts, credit terms, and bank routing directories to a local Excel/CSV format.</p>
          </div>
          <button onClick={handleExportCSV} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs">
            Run Export CSV
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Upload size={14} className="text-emerald-600" /> Bulk Import Spreadsheet</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Upload a batch CSV file to import multiple raw material manufacturers and logistics partners instantly.</p>
          </div>
          <button onClick={() => document.getElementById('supplier-csv-import').click()} className="w-full mt-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold transition-colors text-xs">
            Upload CSV File
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Printer size={14} className="text-indigo-600" /> Spool Print Summary</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Send the filtered active suppliers directories directly to the browser print engine or save as PDF.</p>
          </div>
          <button onClick={handlePrintReport} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs">
            Print / PDF Page
          </button>
        </div>
      </div>

      {/* Advanced Search Filter Demonstration */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-bold text-[11px] sm:text-xs uppercase text-slate-700 tracking-wider">Search Filters Testing Matrix</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs no-print">
          <input
            type="text"
            placeholder="Search by ID, Name or Contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border p-2 rounded focus:outline-none bg-white text-xs">
            <option value="">All Types</option>
            <option value="Manufacturer">Manufacturer</option>
            <option value="Distributor">Distributor</option>
            <option value="Service Provider">Service Provider</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border p-2 rounded focus:outline-none bg-white text-xs">
            <option value="">All Categories</option>
            <option value="Raw Materials">Raw Materials</option>
            <option value="Packaging">Packaging</option>
            <option value="Logistics">Logistics</option>
          </select>
        </div>

        {/* Demo filtered list */}
        <div className="border rounded overflow-x-auto text-[10px] sm:text-[11px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-2 whitespace-nowrap">Code</th>
                <th className="p-2 whitespace-nowrap">Supplier Name</th>
                <th className="p-2 whitespace-nowrap">Type</th>
                <th className="p-2 whitespace-nowrap">Category</th>
                <th className="p-2 whitespace-nowrap">SPOC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{s.id}</td>
                  <td className="p-2 font-medium text-gray-900">{s.name}</td>
                  <td className="p-2 text-gray-600 whitespace-nowrap">{s.type}</td>
                  <td className="p-2 text-gray-500 whitespace-nowrap">{s.category}</td>
                  <td className="p-2 text-gray-800 whitespace-nowrap">{s.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Utility console logger */}
      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200 shadow-inner no-print">
        <h4 className="font-mono text-xs font-bold text-slate-700 mb-2 border-b border-slate-200 pb-2 flex items-center gap-1.5">
          <CheckCircle size={14} className="text-indigo-500" /> Utility Console Log
        </h4>
        <div className="font-mono text-[9px] sm:text-[10px] text-slate-600 h-28 overflow-y-auto space-y-1.5 mt-1">
          {log.length > 0 ? (
            log.map((line, i) => <div key={i} className="flex gap-2"><span className="text-indigo-400 font-bold">{'>'}</span> <span>{line}</span></div>)
          ) : (
            <div className="text-black italic font-medium">No operations recorded yet. Click one of the operations above.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Utilities;
