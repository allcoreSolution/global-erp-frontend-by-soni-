import React, { useState } from 'react';
import { Database, Upload, Download, RefreshCw, Clock, HardDrive, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const BackupRestore = () => {
  const [log, setLog] = useState([]);
  const [backupHistory, setBackupHistory] = useState([
    { version: 'v3.4.12_auto', date: '2024-05-15 02:00 AM', size: '42.8 MB', storage: 'Cloud (AWS S3)', status: 'Success' },
    { version: 'v3.4.11_manual', date: '2024-05-10 11:30 AM', size: '41.5 MB', storage: 'Local Drive', status: 'Success' },
    { version: 'v3.4.10_auto', date: '2024-05-08 02:00 AM', size: '41.2 MB', storage: 'Cloud (AWS S3)', status: 'Success' }
  ]);

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleCreateBackup = () => {
    addLog("Initializing full system backup database dump...");
    setTimeout(() => {
      const newBackup = {
        version: `v3.4.13_manual_${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleString(),
        size: '43.2 MB',
        storage: 'Local Drive',
        status: 'Success'
      };
      setBackupHistory(prev => [newBackup, ...prev]);
      addLog("Success: Backup file generated and saved successfully.");
      alert("System database backup created successfully!");
    }, 1500);
  };

  const handleRestoreBackup = (version) => {
    if (window.confirm(`Are you sure you want to restore the system database to version ${version}? Current unsaved progress will be overwritten.`)) {
      addLog(`Initializing restoration process for version ${version}...`);
      setTimeout(() => {
        addLog(`Success: Database restored to version ${version} configuration.`);
        alert(`System successfully restored to version ${version}!`);
      }, 2000);
    }
  };

  return (
    <div className="bg-slate-50/50 p-4 sm:p-6 rounded-2xl border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-100">Setup & Maintenance</span>
          <h1 className="text-sm sm:text-lg font-black text-slate-800 flex items-center gap-2 mt-2">
            <Database className="text-indigo-500" size={22} /> Database Backup & Restoration Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Securely create local database dumps, sync system state to secure cloud buckets, and restore snapshots.
          </p>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Quick Backup Actions */}
        <div className="border border-slate-200/70 rounded-2xl p-5 bg-white space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Immediate Database Backup</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Creates a complete system dump including active sales registers, ledger books, inventory tables, and company master files.
            </p>
          </div>
          <button 
            onClick={handleCreateBackup}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all"
          >
            <HardDrive size={16} /> Create Backup Now
          </button>
        </div>

        {/* 2. Restore from File Dropzone */}
        <div className="border border-slate-200/70 rounded-2xl p-5 bg-white space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Restore from local file</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Upload a previously downloaded `.sql` or `.json` backup file to revert settings.
            </p>
          </div>
          <label className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer border border-dashed border-slate-300 transition-all">
            <Upload size={16} className="text-indigo-500" /> Upload Backup File
            <input type="file" className="hidden" accept=".sql,.json" onChange={(e) => {
              if (e.target.files[0]) {
                addLog(`Uploading local file "${e.target.files[0].name}"...`);
                setTimeout(() => {
                  handleRestoreBackup(e.target.files[0].name);
                }, 1000);
              }
            }} />
          </label>
        </div>

        {/* 3. Automatic Backup Settings Status */}
        <div className="border border-slate-200/70 rounded-2xl p-5 bg-white space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Cloud Sync & Security Status</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
              <ShieldCheck size={18} className="shrink-0 text-emerald-500" />
              <span>Auto Cloud Backups Active (Every 24h)</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 space-y-1.5 p-1 font-medium">
              <p className="flex justify-between"><span>S3 Storage Region:</span> <span className="font-bold text-slate-700">ap-south-1 (Mumbai)</span></p>
              <p className="flex justify-between"><span>Next Scheduled Backup:</span> <span className="font-bold text-slate-700">Tonight, 02:00 AM</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* History table and activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backup History Table */}
        <div className="border border-slate-200/70 rounded-2xl overflow-hidden bg-white shadow-sm lg:col-span-2">
          <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">System Backups Log History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-bold text-slate-600">Backup Version</th>
                  <th className="p-4 font-bold text-slate-600">Timestamp</th>
                  <th className="p-4 font-bold text-slate-600">File Size</th>
                  <th className="p-4 font-bold text-slate-600">Storage Destination</th>
                  <th className="p-4 font-bold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {backupHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="p-4 font-bold text-slate-800">{item.version}</td>
                    <td className="p-4 text-slate-500">{item.date}</td>
                    <td className="p-4 text-slate-700 font-medium">{item.size}</td>
                    <td className="p-4 text-slate-600">{item.storage}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleRestoreBackup(item.version)}
                        className="px-3 py-1.5 text-[10px] font-bold text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all shadow-sm group-hover:shadow"
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Execution Activity logs */}
        <div className="border border-slate-200/70 rounded-2xl p-5 bg-white space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Clock size={16} className="text-indigo-500" /> Backup System Live Logs
            </h3>
          </div>
          
          <div className="h-44 overflow-y-auto bg-slate-50/50 rounded-xl p-3 text-[10px] font-mono text-slate-600 space-y-1.5 my-2 border border-slate-200 shadow-inner">
            {log.length === 0 ? (
              <p className="text-slate-500 italic">No operations triggered yet. Logs will print here.</p>
            ) : (
              log.map((item, idx) => <div key={idx} className="flex gap-2"><span className="text-indigo-400 font-bold">{'>'}</span> <span>{item}</span></div>)
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setLog([]);
                addLog("Log database view cleared.");
              }}
              className="flex-1 py-2 text-center text-[10px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
            >
              Clear Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
