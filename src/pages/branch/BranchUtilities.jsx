import React, { useState } from 'react';
import { Search, Download, Upload, Printer, CheckCircle } from 'lucide-react';

const BranchUtilities = () => {
  const [branches, setBranches] = useState([
    { id: 'BR-001', name: 'Jaipur HQ Office', code: 'JPHQ', type: 'Headquarters', active: true },
    { id: 'BR-002', name: 'Kota Regional Center', code: 'KT01', type: 'Regional Branch', active: true }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [log, setLog] = useState([]);

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleToggle = (id) => {
    setBranches(prev => prev.map(b => {
      if (b.id === id) {
        addLog(`Toggled active status of branch ${b.name} to ${!b.active ? 'Active' : 'Inactive'}`);
        return { ...b, active: !b.active };
      }
      return b;
    }));
  };

  const filtered = branches.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Real CSV Export
  const handleExportCSV = () => {
    addLog("Exporting branch master registry to CSV...");
    const headers = ['Branch ID', 'Branch Name', 'Branch Code', 'Branch Type', 'Active Status'];
    const rows = branches.map(b => [
      b.id,
      `"${b.name.replace(/"/g, '""')}"`,
      b.code,
      b.type,
      b.active ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `branches_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Success: Branch master registry CSV downloaded.");
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
        const newBranches = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 5) {
            newBranches.push({
              id: cols[0] || `BR-NEW-${Date.now()}-${i}`,
              name: cols[1] || 'Imported Branch',
              code: cols[2] || 'IMPT',
              type: cols[3] || 'Retail Store',
              active: cols[4] === 'Yes' ? true : false
            });
          }
        }
        if (newBranches.length > 0) {
          setBranches(prev => [...prev, ...newBranches]);
          addLog(`Success: Parsed ${newBranches.length} new branches!`);
          alert(`Successfully imported ${newBranches.length} branches!`);
        } else {
          addLog("Warning: No valid rows parsed from CSV file.");
          alert("Import failed. Headers should match: Branch ID, Branch Name, Branch Code, Branch Type, Active Status");
        }
      } catch (err) {
        addLog("Error: Failed to parse CSV correctly.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrintReport = () => {
    addLog("Spooling print system dialog...");
    window.print();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen space-y-6">
      <input
        type="file"
        id="branch-master-csv"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Branch Utilities & Operations</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Run search filter matrices, import bulk data logs, export directories, and print branch catalogs.</p>
      </div>

      {/* Control Actions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold no-print">
        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Download size={14} className="text-indigo-600" /> Export Registry</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Save your entire branch locations and active corporate offices to a local CSV.</p>
          </div>
          <button onClick={handleExportCSV} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs">
            Run Export CSV
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Upload size={14} className="text-emerald-600" /> Bulk Import Spreadsheet</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Upload a batch CSV file to import multiple branch locations instantly.</p>
          </div>
          <button onClick={() => document.getElementById('branch-master-csv').click()} className="w-full mt-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold transition-colors text-xs">
            Upload CSV File
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Printer size={14} className="text-indigo-600" /> Spool Print Summary</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Send the filtered branch list directories directly to the printer or save as PDF.</p>
          </div>
          <button onClick={handlePrintReport} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs">
            Print / PDF Page
          </button>
        </div>
      </div>

      {/* Search demonstration */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-bold text-[11px] sm:text-xs uppercase text-slate-700 tracking-wider">Search Filters Testing Matrix</h3>
        <div className="relative max-w-sm no-print">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Branch Name or Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Demo filtered list */}
        <div className="border rounded overflow-x-auto text-[10px] sm:text-[11px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-2 whitespace-nowrap">Branch ID</th>
                <th className="p-2 whitespace-nowrap">Branch Name</th>
                <th className="p-2 whitespace-nowrap font-mono">Code</th>
                <th className="p-2 whitespace-nowrap text-center no-print">Status Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{b.id}</td>
                  <td className="p-2 font-medium text-gray-900">{b.name}</td>
                  <td className="p-2 font-mono text-gray-650">{b.code}</td>
                  <td className="p-2 text-center no-print">
                    <button
                      onClick={() => handleToggle(b.id)}
                      className={`px-2 py-0.5 rounded font-bold text-[9px] sm:text-[10px] ${b.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {b.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Utility console logger */}
      <div className="bg-slate-50/50 shadow-inner border border-slate-200 rounded-lg p-4 border border-slate-200 no-print">
        <h4 className="font-mono text-xs font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1.5 flex items-center gap-1.5">
          <CheckCircle size={13} className="text-emerald-500" /> Utility Console Log
        </h4>
        <div className="font-mono text-[9px] sm:text-[10px] text-emerald-400 h-28 overflow-y-auto space-y-1">
          {log.length > 0 ? (
            log.map((line, i) => <div key={i}>{line}</div>)
          ) : (
            <div className="text-gray-500 italic">No operations recorded yet. Click one of the operations above.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchUtilities;
