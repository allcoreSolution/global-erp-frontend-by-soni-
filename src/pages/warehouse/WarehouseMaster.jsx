import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle, FileDown, Upload, Download } from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const WarehouseMaster = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', location: '', phone: '', email: '', status: true, branch: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchWarehouses();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      if (res.data?.success) setBranches(res.data.data);
      else if (Array.isArray(res.data)) setBranches(res.data);
      else if (Array.isArray(res.data?.data)) setBranches(res.data.data);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/catalogs/warehouses');
      if (res.data.success) setWarehouses(res.data.data);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openAddModal = () => {
    setFormData({ name: '', code: '', location: '', phone: '', email: '', status: true, branch: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (warehouse) => {
    setFormData({ ...warehouse });
    setEditingId(warehouse._id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/catalogs/warehouses/${editingId}`, formData);
      } else {
        await api.post('/catalogs/warehouses', formData);
      }
      setIsModalOpen(false);
      fetchWarehouses();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      Swal.fire('Error', 'Error saving warehouse', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const wh = warehouses.find(w => w._id === id);
    if (!wh) return;
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete warehouse ${wh.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/catalogs/warehouses/${id}`);
        Swal.fire('Deleted!', 'Warehouse has been deleted.', 'success');
        fetchWarehouses();
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        Swal.fire('Error', 'Failed to delete warehouse.', 'error');
      }
    }
  };

  const toggleStatus = async (warehouse) => {
    try {
      await api.put(`/catalogs/warehouses/${warehouse._id}`, { status: !warehouse.status });
      fetchWarehouses();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = "code,name,location,phone,email,status\nWH-001,Main Warehouse,Mumbai,9876543210,main@warehouse.com,true";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'warehouse_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    if (warehouses.length === 0) {
      Swal.fire('No Data', 'No warehouses to export.', 'warning');
      return;
    }
    const headers = ['Code', 'Name', 'Location', 'Branch', 'Phone', 'Email', 'Status'];
    const rows = warehouses.map(w => [
      w.code || '',
      w.name || '',
      w.location || '',
      w.branch ? w.branch.name || w.branch : '',
      w.phone || '',
      w.email || '',
      w.status ? 'Active' : 'Inactive'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'warehouses_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) {
        Swal.fire('Error', 'CSV file is empty or invalid.', 'error');
        return;
      }
      
      const headers = lines[0].split(',');
      const importedData = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const wData = {};
        headers.forEach((header, index) => {
          wData[header.trim()] = values[index] ? values[index].trim() : '';
        });
        
        const isDuplicate = warehouses.some(w => 
          (wData.code && w.code === wData.code) ||
          (wData.name && w.name === wData.name)
        );
        
        if (!isDuplicate) {
          importedData.push(wData);
        }
      }
      
      if (importedData.length === 0) {
        Swal.fire('Notice', 'No new warehouses found or all are duplicates.', 'info');
        e.target.value = '';
        return;
      }
      
      try {
        Swal.fire({ title: 'Importing...', text: 'Please wait', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        for (const data of importedData) {
          await api.post('/catalogs/warehouses', data);
        }
        Swal.fire('Success', `${importedData.length} Warehouses imported successfully!`, 'success');
        fetchWarehouses();
      } catch (err) {
        console.error('Import error:', err);
        Swal.fire('Error', 'Failed to import warehouses.', 'error');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Warehouse Master</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage your warehouse locations and details.</p>
        </div>
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 w-full md:w-auto pb-1 md:pb-0">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
            <Upload size={14} /> Import
          </button>
          <button onClick={handleDownloadSample} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
            <FileDown size={14} /> Sample
          </button>
          <button onClick={handleExportCSV} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded shadow-sm transition-colors">
            <Download size={14} /> CSV
          </button>
          <button onClick={openAddModal} className="whitespace-nowrap flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow transition-colors">
            <Plus size={14} /> Add Warehouse
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4 border-b">Code</th>
              <th className="p-4 border-b">Name</th>
              <th className="p-4 border-b">Location</th>
              <th className="p-4 border-b">Branch</th>
              <th className="p-4 border-b">Contact</th>
              <th className="p-4 border-b text-center">Status</th>
              <th className="p-4 border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.length > 0 ? warehouses.map((wh) => (
              <tr key={wh._id} className="border-b hover:bg-gray-50">
                <td className="p-4">{wh.code || '-'}</td>
                <td className="p-4 font-semibold">{wh.name}</td>
                <td className="p-4">{wh.location || '-'}</td>
                <td className="p-4">{wh.branch ? wh.branch.name || wh.branch : '-'}</td>
                <td className="p-4">
                  {wh.phone && <div>{wh.phone}</div>}
                  {wh.email && <div>{wh.email}</div>}
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => toggleStatus(wh)} className={`px-2 py-1 rounded text-xs font-semibold ${wh.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {wh.status ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEditModal(wh)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(wh._id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">No warehouses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Code</label>
                <input type="text" name="code" value={formData.code} onChange={handleInputChange} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
                <select name="branch" value={formData.branch} onChange={handleInputChange} className="w-full border rounded p-2 text-sm">
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b._id || b.id} value={b._id || b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded p-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border rounded p-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border rounded p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border rounded p-2 text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" name="status" checked={formData.status} onChange={handleInputChange} className="w-4 h-4" />
                <span className="text-sm font-semibold">Active Status</span>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  {loading ? 'Saving...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseMaster;
