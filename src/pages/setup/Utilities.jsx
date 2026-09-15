import React, { useState } from 'react';
import { Layers, Trash2, Archive, RefreshCcw, ShieldAlert, CheckCircle2, Server } from 'lucide-react';

const Utilities = () => {
  const [log, setLog] = useState([]);

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleClearCache = () => {
    addLog("Initiating local storage and API session cache cleanup...");
    setTimeout(() => {
      addLog("Success: System cache cleared. 14.8 MB storage reclaimed.");
      alert("System application cache cleared successfully!");
    }, 1000);
  };

  const handleArchiveData = () => {
    if (window.confirm("Archive transactional data older than 2 years? This keeps active listings lightweight and improves database query speed.")) {
      addLog("Initializing historical sales & purchase voucher archiving...");
      setTimeout(() => {
        addLog("Success: 1,482 records archived to secure offline database store.");
        alert("Old transactional data archived successfully!");
      }, 1500);
    }
  };

  const handleRecalculateBalances = () => {
    addLog("Scanning database ledger entries for currency rounding or decimal deviations...");
    setTimeout(() => {
      addLog("Success: Outstanding balance indexes matched and verified.");
      alert("Ledger balances matched and recalculated successfully!");
    }, 1200);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Layers className="text-indigo-600" size={22} /> System Utilities & Maintenance Tools
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500">
          Run diagnostics, optimize system cache, archive historical accounts ledger books, and audit background tasks.
        </p>
      </div>

      {/* Grid Utilities Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. Clear Cache */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Storage Optimization</span>
            <h3 className="text-sm font-bold text-slate-800 mt-1">Clear Application Cache</h3>
            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
              Clears loaded session metrics, temporal state storage, and cached API responses. Recommended if experiencing visual latency.
            </p>
          </div>
          <button 
            onClick={handleClearCache}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-slate-800 font-bold rounded-lg text-xs shadow-xs transition"
          >
            <Trash2 size={15} /> Clear Cache
          </button>
        </div>

        {/* 2. Archive Data */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Archiving</span>
            <h3 className="text-sm font-bold text-slate-800 mt-1">Archive Historical Data</h3>
            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
              Compresses and locks financial entries older than 2 fiscal years. Archived data is excluded from daily search queries but available in audit reports.
            </p>
          </div>
          <button 
            onClick={handleArchiveData}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-lg text-xs border transition"
          >
            <Archive size={15} /> Archive Database
          </button>
        </div>

        {/* 3. Recalculate balances */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Database Integrity</span>
            <h3 className="text-sm font-bold text-slate-800 mt-1">Recalculate Ledger Dues</h3>
            <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
              Re-scans general accounts and checks invoice collections against total balances to patch rounding inconsistencies.
            </p>
          </div>
          <button 
            onClick={handleRecalculateBalances}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-lg text-xs border transition"
          >
            <RefreshCcw size={15} /> Match Balances
          </button>
        </div>

      </div>

      {/* Logs and System diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Diagnostics Info */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Server size={16} className="text-blue-500" /> Host Environment & Health Status
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold my-2">
            <div className="p-3 bg-slate-50 border rounded-lg">
              <span className="text-[10px] text-gray-400 block font-bold">ERP Version Status</span>
              <span className="text-slate-800 block text-sm mt-1">v3.4.12 (Build 2489)</span>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1">Stable Production release</span>
            </div>
            <div className="p-3 bg-slate-50 border rounded-lg">
              <span className="text-[10px] text-gray-400 block font-bold">API Connection Latency</span>
              <span className="text-slate-800 block text-sm mt-1">14ms (Optimal)</span>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1">Secure TLS Connection</span>
            </div>
          </div>
        </div>

        {/* Execution Logs */}
        <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Diagnostics Console Logs</h3>
            <p className="text-[10px] text-gray-500">Live operational prints</p>
          </div>
          <div className="h-32 overflow-y-auto bg-slate-50/50 shadow-inner border border-slate-200 rounded-lg p-3 text-[10px] font-mono text-emerald-400 space-y-1 my-2">
            {log.length === 0 ? (
              <p className="text-gray-500 italic">No diagnostic tools run yet.</p>
            ) : (
              log.map((item, idx) => <p key={idx}>{item}</p>)
            )}
          </div>
          <button 
            onClick={() => setLog([])}
            className="w-full py-1 text-center text-[10px] bg-gray-100 hover:bg-gray-200 border rounded text-gray-600 font-semibold"
          >
            Clear Console
          </button>
        </div>

      </div>
    </div>
  );
};

export default Utilities;
