import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  Download,
  RefreshCw,
  Clock,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FileText,
  RotateCcw,
  Loader2,
  Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const BackupRestore = () => {
  const [log, setLog] = useState([]);
  const [backupHistory, setBackupHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setIsRefreshing(true);
    try {
      const { data } = await api.get('/backups');
      setBackupHistory(Array.isArray(data) ? data : []);
      addLog('Fetched latest backup snapshot catalog.');
    } catch (error) {
      console.error('Error fetching backups:', error);
      addLog('Error: Failed to fetch backup history.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  // 1. Create Backup Now
  // 1. Create Backup Now & Auto Download to PC
  const handleCreateBackup = async () => {
    if (isLoading) return;

    const result = await Swal.fire({
      title: 'Create System Backup?',
      text: 'This will export a full database snapshot and automatically download the JSON backup file to your computer.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Create & Download'
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    addLog('Initializing full system backup database dump...');
    try {
      const { data } = await api.post('/backups/create');
      setBackupHistory(prev => [data, ...prev]);
      addLog(`Success: Backup snapshot ${data.version} (${data.size}) generated on server.`);

      // Automatically trigger file download to local Downloads folder
      addLog(`Initiating automatic download to your local PC for ${data.version}...`);
      try {
        const response = await api.get(`/backups/download/${data.version}`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ERP_Backup_${data.version}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        addLog(`Downloaded: ${data.version} successfully saved to your local Downloads folder.`);
      } catch (dlErr) {
        console.error('Auto download error:', dlErr);
        addLog(`Warning: Snapshot created on server, but auto-download failed. You can click "Download" manually.`);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Backup Created & Downloaded!',
        html: `
          <div style="font-size: 13px; color: #475569; text-align: left; line-height: 1.6;">
            Backup snapshot <strong>${data.version}</strong> (${data.size}) generate ho gaya hai aur <strong>aapke local computer (Downloads folder) me save ho gaya hai!</strong>
            <br/><br/>
            <span style="display:inline-block; padding: 4px 10px; background:#f1f5f9; border-radius: 6px; font-size: 12px; color: #0284c7; font-weight: 600;">
              📁 File: ERP_Backup_${data.version}.json
            </span>
          </div>
        `,
        confirmButtonColor: '#4f46e5'
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      addLog('Failed to create backup.');
      Swal.fire({
        icon: 'error',
        title: 'Backup Failed',
        text: error.response?.data?.message || 'Could not generate backup file.',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Restore Backup from existing version
  const handleRestoreBackup = async (version) => {
    const result = await Swal.fire({
      title: '⚠️ Confirm System Restoration',
      html: `
        <div style="font-size: 13px; color: #475569; text-align: left; line-height: 1.6;">
          Are you sure you want to restore the database to <strong>${version}</strong>?
          <br/><br/>
          <span style="color: #e11d48; font-weight: bold;">
            Warning: All data added after this snapshot was created will be overwritten!
          </span>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Restore Database',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    addLog(`Initializing restoration process for snapshot ${version}...`);
    try {
      const res = await api.post(`/backups/restore/${version}`);
      addLog(`Success: Database restored to snapshot ${version}.`);
      
      Swal.fire({
        icon: 'success',
        title: 'Restoration Complete!',
        text: res.data?.message || `System database restored to version ${version}.`,
        confirmButtonColor: '#4f46e5'
      });
    } catch (error) {
      console.error('Error restoring backup:', error);
      addLog(`Failed to restore backup snapshot ${version}.`);
      Swal.fire({
        icon: 'error',
        title: 'Restoration Failed',
        text: error.response?.data?.message || 'Could not restore database.',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Download Backup JSON File
  const handleDownloadBackup = async (version) => {
    try {
      addLog(`Initiating download for snapshot ${version}...`);
      const response = await api.get(`/backups/download/${version}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ERP_Backup_${version}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addLog(`Success: Snapshot file ${version} downloaded to browser.`);
    } catch (error) {
      console.error('Download error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Could not download backup file from server disk.',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // 4. Delete Backup from History & Disk
  const handleDeleteBackup = async (id, version) => {
    const result = await Swal.fire({
      title: 'Delete Snapshot?',
      text: `Are you sure you want to permanently delete snapshot ${version}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete'
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/backups/${id}`);
      setBackupHistory(prev => prev.filter(b => b._id !== id));
      addLog(`Snapshot ${version} removed from disk.`);
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Backup snapshot file deleted.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Could not delete backup snapshot.',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // 5. Restore from Uploaded JSON file
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const result = await Swal.fire({
      title: 'Upload & Restore File?',
      html: `
        <div style="font-size: 13px; color: #475569; text-align: left;">
          You selected: <strong>${file.name}</strong> (${(file.size / (1024 * 1024)).toFixed(2)} MB)
          <br/><br/>
          <span style="color: #e11d48; font-weight: bold;">
            Are you sure you want to restore the entire ERP database from this file? Current data will be replaced.
          </span>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Upload & Restore'
    });

    if (!result.isConfirmed) {
      e.target.value = null;
      return;
    }

    addLog(`Uploading local file "${file.name}"...`);
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const { data } = await api.post('/backups/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.backup) {
        setBackupHistory(prev => [data.backup, ...prev]);
      }
      addLog(`Success: Uploaded and restored database from ${file.name}.`);
      Swal.fire({
        icon: 'success',
        title: 'Upload & Restore Successful!',
        text: 'System database has been restored from your file.',
        confirmButtonColor: '#4f46e5'
      });
    } catch (error) {
      console.error('Error uploading backup:', error);
      addLog(`Failed to upload and restore from ${file.name}.`);
      Swal.fire({
        icon: 'error',
        title: 'Upload Restoration Failed',
        text: error.response?.data?.message || 'File structure does not match ERP schema.',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsLoading(false);
      e.target.value = null;
    }
  };

  return (
    <div className="bg-slate-50/50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-100">
            System Maintenance & Disaster Recovery
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 mt-2">
            <Database className="text-indigo-600" size={24} /> Database Backup & Restoration Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Securely generate full database snapshots, download disk copies to local PC, and restore point-in-time system states.
          </p>
        </div>

        <button
          onClick={fetchBackups}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-sm"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Refresh History
        </button>
      </div>

      {/* Grid Controls: 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Quick Backup Action */}
        <div className="border border-slate-200/70 rounded-2xl p-6 bg-white space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <HardDrive size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Generate & Download Backup</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dumps all database records and automatically downloads the JSON snapshot file directly to your local computer.
            </p>
          </div>
          <button 
            onClick={handleCreateBackup}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <HardDrive size={16} />}
            {isLoading ? 'Processing Dump...' : 'Create & Download Backup'}
          </button>
        </div>

        {/* 2. Restore from File Dropzone */}
        <div className="border border-slate-200/70 rounded-2xl p-6 bg-white space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Upload size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Restore from JSON File</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a previously downloaded `.json` database file from your local computer to restore all system configurations.
            </p>
          </div>
          <label className={`flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs cursor-pointer border border-dashed border-emerald-300 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Upload size={16} className="text-emerald-600" /> {isLoading ? 'Restoring...' : 'Upload & Restore File'}
            <input 
              type="file" 
              className="hidden" 
              accept=".json" 
              disabled={isLoading} 
              onChange={handleFileUpload} 
            />
          </label>
        </div>

        {/* 3. Automatic Security Status */}
        <div className="border border-slate-200/70 rounded-2xl p-6 bg-white space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Storage & Disaster Recovery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All backups are isolated per company tenant and stored in secure local server storage with point-in-time recovery.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>Local Storage Active & Ready</span>
          </div>
        </div>
      </div>

      {/* History table and live logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backup History Table */}
        <div className="border border-slate-200/70 rounded-2xl overflow-hidden bg-white shadow-sm lg:col-span-2">
          <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText size={15} className="text-indigo-600" /> System Backups Catalog ({backupHistory.length} Snapshots)
            </h3>
          </div>
          <div className="overflow-x-auto min-h-[220px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Version</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">File Size</th>
                  <th className="p-3.5">Storage</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {backupHistory.length > 0 ? (
                  backupHistory.map((item) => (
                    <tr key={item._id || item.version} className="hover:bg-slate-50/60 transition group">
                      <td className="p-3.5 font-bold font-mono text-indigo-700">{item.version}</td>
                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                      <td className="p-3.5 text-slate-800 font-mono">{item.size}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          {item.storage || 'Local Drive'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleDownloadBackup(item.version)}
                            title="Download JSON Snapshot to PC"
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition shadow-xs"
                          >
                            <Download size={14} />
                          </button>
                          <button 
                            onClick={() => handleRestoreBackup(item.version)}
                            disabled={isLoading}
                            title="Restore Database to this version"
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition shadow-xs disabled:opacity-50"
                          >
                            <RotateCcw size={12} /> Restore
                          </button>
                          <button 
                            onClick={() => handleDeleteBackup(item._id, item.version)}
                            title="Delete Snapshot"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition shadow-xs"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      No backups generated yet. Click "Create Backup Now" to create your first system snapshot.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Execution Activity Logs */}
        <div className="border border-slate-200/70 rounded-2xl p-5 bg-white space-y-4 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Clock size={16} className="text-indigo-500" /> Backup Live Terminal Logs
            </h3>
          </div>
          
          <div className="h-56 overflow-y-auto bg-slate-900 rounded-xl p-3 text-[11px] font-mono text-emerald-400 space-y-1 my-1 shadow-inner">
            {log.length === 0 ? (
              <p className="text-slate-500 italic">Ready. No operations triggered yet.</p>
            ) : (
              log.map((item, idx) => (
                <div key={idx} className="flex gap-2 leading-relaxed">
                  <span className="text-emerald-500 font-bold">$</span>
                  <span className="text-slate-200">{item}</span>
                </div>
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setLog([]);
                addLog('Terminal view cleared.');
              }}
              className="flex-1 py-2 text-center text-[10px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors"
            >
              Clear Terminal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
