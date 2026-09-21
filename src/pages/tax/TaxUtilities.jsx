import React, { useState, useEffect } from 'react';
import { Search, Download, Upload, Printer, CheckCircle } from 'lucide-react';
import api from '../../api';

const TaxUtilities = () => {
  const [taxes, setTaxes] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [log, setLog] = useState([]);

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const fetchTaxes = async () => {
    try {
      const res = await api.get('/tax-slabs');
      const data = res.data?.data || res.data || [];
      const mapped = data.map(t => ({
        ...t,
        _id: t._id,
        id: t.id || t._id,
        active: t.status === 'Active'
      }));
      setTaxes(mapped);
    } catch (error) {
      addLog('Error fetching tax slabs: ' + (error.response?.data?.message || error.message));
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleToggle = async (id, _id) => {
    try {
      addLog(`Toggling status for tax slab ${id}...`);
      const targetTax = taxes.find(t => t._id === _id);
      const newStatus = !targetTax.active ? 'Active' : 'Inactive';
      
      await api.patch(`/tax-slabs/${_id}`, { status: newStatus });
      
      setTaxes(prev => prev.map(t => {
        if (t._id === _id) {
          addLog(`Success: Toggled active state for tax slab ${id} to ${newStatus}`);
          return { ...t, active: newStatus === 'Active', status: newStatus };
        }
        return t;
      }));
    } catch (error) {
      addLog('Error toggling status: ' + (error.response?.data?.message || error.message));
      alert('Failed to toggle tax slab status. ' + (error.response?.data?.message || error.message));
    }
  };

  const filtered = taxes.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Real CSV Export
  const handleExportCSV = () => {
    addLog("Exporting corporate tax configuration registry to CSV...");
    const headers = ['Tax ID', 'Tax Slab Name', 'GST Rate %', 'Active Status'];
    const rows = taxes.map(t => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      t.rate,
      t.active ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tax_slabs_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Success: Tax registry CSV file downloaded successfully.");
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
        const newTaxes = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 4) {
            newTaxes.push({
              id: cols[0] || `TX-NEW-${Date.now()}-${i}`,
              name: cols[1] || 'Imported Slab',
              rate: Number(cols[2]) || 0,
              active: cols[3] === 'Yes' ? true : false
            });
          }
        }
        if (newTaxes.length > 0) {
          setTaxes(prev => [...prev, ...newTaxes]);
          addLog(`Success: Parsed ${newTaxes.length} new tax slabs!`);
          alert(`Successfully imported ${newTaxes.length} tax slabs!`);
        } else {
          addLog("Warning: No valid rows parsed from CSV file.");
          alert("Import failed. Headers should match: Tax ID, Tax Slab Name, GST Rate %, Active Status");
        }
      } catch (err) {
        addLog("Error: Failed to parse CSV correctly.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrintReport = () => {
    addLog("Spooling corporate tax sheet print spooler...");
    window.print();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen space-y-6">
      <input
        type="file"
        id="tax-master-csv"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Tax Utilities & Operations</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Run search filter matrices, import bulk data logs, export directories, and print corporate tax rate catalogs.</p>
      </div>

      {/* Control Actions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold no-print">
        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Download size={14} className="text-indigo-600" /> Export Registry</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Save your entire corporate tax configurations and SGST/CGST rules to a local CSV.</p>
          </div>
          <button onClick={handleExportCSV} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs">
            Run Export CSV
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Upload size={14} className="text-emerald-600" /> Bulk Import Spreadsheet</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Upload a batch CSV file to import multiple tax rules, base rates, and cess configurations instantly.</p>
          </div>
          <button onClick={() => document.getElementById('tax-master-csv').click()} className="w-full mt-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold transition-colors text-xs">
            Upload CSV File
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Printer size={14} className="text-indigo-600" /> Spool Print Summary</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Send the filtered tax active directory registers directly to the printer or save as PDF format.</p>
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
            placeholder="Search by Slab ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Demo filtered list */}
        <div className="border rounded overflow-x-auto text-[10px] sm:text-[11px]">
          <table className="block w-full overflow-x-auto w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-2 whitespace-nowrap">Tax ID</th>
                <th className="p-2 whitespace-nowrap">Tax Slab Name</th>
                <th className="p-2 whitespace-nowrap text-right">GST Rate</th>
                <th className="p-2 whitespace-nowrap text-center no-print">Status Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map(t => (
                <tr key={t._id} className="hover:bg-slate-50">
                  <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{t.id}</td>
                  <td className="p-2 font-medium text-gray-900">{t.name}</td>
                  <td className="p-2 text-right font-bold text-gray-800">{t.rate}%</td>
                  <td className="p-2 text-center no-print">
                    <button
                      onClick={() => handleToggle(t.id, t._id)}
                      className={`px-2 py-0.5 rounded font-bold text-[9px] sm:text-[10px] ${t.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {t.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">No tax slabs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Utility console logger */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 no-print">
        <h4 className="font-mono text-xs font-semibold text-slate-850 mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
          <CheckCircle size={13} className="text-emerald-600" /> Utility Console Log
        </h4>
        <div className="font-mono text-[9px] sm:text-[10px] text-slate-600 h-28 overflow-y-auto space-y-1">
          {log.length > 0 ? (
            log.map((line, i) => <div key={i} className="text-slate-700">{line}</div>)
          ) : (
            <div className="text-gray-500 italic">No operations recorded yet. Click one of the operations above.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxUtilities;
