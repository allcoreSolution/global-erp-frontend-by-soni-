import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, X, MapPin, Phone, Mail, Upload, FileDown, Download, Eye, Building2, User, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';
import { usePermissions } from '../../utils/permissionUtils';

const BranchInfo = () => {
  const { can } = usePermissions();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewBranch, setViewBranch] = useState(null);
  const [currentBranch, setCurrentBranch] = useState({
    id: '', code: '', name: '', company: '', manager: '', status: 'Active',
    contactPerson: '', mobile: '', email: '', phone: '',
    address1: '', address2: '', state: 'Uttar Pradesh', city: 'Lucknow', district: '', pincode: '',
    gstStatus: 'Registered', gstin: '', pan: '', tan: '', hsn: '', documentUrl: ''
  });

  useEffect(() => {
    fetchBranches();
    fetchMasterData();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/branches');
      const data = res.data?.data || res.data || [];
      const mapped = data.map(b => ({
        ...b,
        _id: b._id,
        id: b.id || b._id,
        address: `${b.address1 || ''} ${b.city || ''} ${b.state || ''}`.trim()
      }));
      setBranches(mapped);
    } catch (error) {
      console.error('Failed to fetch branches', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const empRes = await api.get('/employees').catch(() => ({ data: [] }));
      setEmployees(empRes.data?.data || empRes.data || []);
    } catch (err) {
      console.error('Failed to fetch master dropdowns', err);
    }
  };

  const getManagerName = (managerVal) => {
    if (!managerVal) return '-';
    const found = employees.find(e => String(e._id) === String(managerVal) || String(e.id) === String(managerVal));
    return found ? (found.employeeName || found.name || `${found.firstName || ''} ${found.lastName || ''}`.trim()) : managerVal;
  };

  const handleOpenView = (branch) => {
    setViewBranch(branch);
    setIsViewModalOpen(true);
  };

  const filtered = branches.filter(b =>
    (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEdit(false);
    const nextId = `BR-${String(branches.length + 1).padStart(4, '0')}`;
    setCurrentBranch({
      id: nextId, code: nextId, name: '', company: '', manager: '', status: 'Active',
      contactPerson: '', mobile: '', email: '', phone: '',
      address1: '', address2: '', state: 'Uttar Pradesh', city: 'Lucknow', district: '', pincode: '',
      gstStatus: 'Registered', gstin: '', pan: '', tan: '', hsn: '', documentUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setIsEdit(true);
    setCurrentBranch({ ...branch });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploading(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCurrentBranch({ ...currentBranch, documentUrl: res.data.url });
      Swal.fire('Success', 'Document uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading document:', error);
      Swal.fire('Error', 'Failed to upload document.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...currentBranch };
      if (payload.gstStatus === 'Unregistered') {
        payload.gstin = '';
        payload.tan = '';
        payload.hsn = '';
      }
      
      if (isEdit) {
        await api.put(`/branches/${payload._id || payload.id}`, payload);
        Swal.fire('Success', 'Branch updated successfully', 'success');
      } else {
        await api.post('/branches', payload);
        Swal.fire('Success', 'Branch added successfully', 'success');
      }
      fetchBranches();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving branch:', error);
      Swal.fire('Error', 'Failed to save branch: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = async (id, _id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this branch?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/branches/${_id || id}`);
        Swal.fire('Deleted!', 'Branch deleted successfully', 'success');
        fetchBranches();
      } catch (error) {
        console.error('Error deleting branch:', error);
        Swal.fire('Error', 'Failed to delete branch: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const handleDownloadSample = () => {
    const headers = [
      'Branch Code', 'Branch Name', 'Branch Manager', 'Status', 'Contact Person', 'Mobile', 'Email', 'Phone',
      'Address Line 1', 'Address Line 2', 'State', 'City', 'District', 'Pincode',
      'GST Status', 'GSTIN', 'PAN', 'TAN', 'HSN'
    ];
    const dummyData = [
      'BR-1001', 'Lucknow Branch', 'Manager Name', 'Active', 'Amit Kumar', '9876543210', 'lucknow@branch.com', '0522-1234567',
      '123 Main Street', 'Sector 4', 'Uttar Pradesh', 'Lucknow', 'Lucknow', '226001',
      'Registered', '09ABCDE1234F1Z5', 'ABCDE1234F', 'LKOA12345B', '9988'
    ];
    const csvContent = headers.join(',') + '\n' + dummyData.map(d => `"${d}"`).join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'branch_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    const headers = [
      'Branch Code', 'Branch Name', 'Branch Manager', 'Status', 'Contact Person', 'Mobile', 'Email', 'Phone',
      'Address Line 1', 'Address Line 2', 'State', 'City', 'District', 'Pincode',
      'GST Status', 'GSTIN', 'PAN', 'TAN', 'HSN'
    ];
    const rows = filtered.map(b => [
      `"${b.code || ''}"`,
      `"${b.name || ''}"`,
      `"${b.manager || ''}"`,
      `"${b.status || ''}"`,
      `"${b.contactPerson || ''}"`,
      `"${b.mobile || ''}"`,
      `"${b.email || ''}"`,
      `"${b.phone || ''}"`,
      `"${b.address1 || ''}"`,
      `"${b.address2 || ''}"`,
      `"${b.state || ''}"`,
      `"${b.city || ''}"`,
      `"${b.district || ''}"`,
      `"${b.pincode || ''}"`,
      `"${b.gstStatus || ''}"`,
      `"${b.gstin || ''}"`,
      `"${b.pan || ''}"`,
      `"${b.tan || ''}"`,
      `"${b.hsn || ''}"`
    ]);
    const dummyData = [
      'BR-1001', 'Lucknow Branch', 'Manager Name', 'Active', 'Amit Kumar', '9876543210', 'lucknow@branch.com', '0522-1234567',
      '123 Main Street', 'Sector 4', 'Uttar Pradesh', 'Lucknow', 'Lucknow', '226001',
      'Registered', '09ABCDE1234F1Z5', 'ABCDE1234F', 'LKOA12345B', '9988'
    ];
    const csvContent = [headers.join(','), dummyData.map(d => `"${d}"`).join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'branches_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Swal.fire('Import Success', 'File selected successfully. Backend import logic pending.', 'success');
    e.target.value = '';
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Branch Information</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Configure corporate branch listings, physical addresses coordinates, and contact details.</p>
        </div>
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 w-full md:w-auto pb-1 md:pb-0">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          {can(['create_branches', 'manage_settings']) && (
            <button onClick={() => fileInputRef.current.click()} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
              <Upload size={14} /> Import
            </button>
          )}
          {can(['create_branches', 'manage_settings']) && (
            <button onClick={handleDownloadSample} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
              <FileDown size={14} /> Sample
            </button>
          )}
          <button onClick={handleExportCSV} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded shadow-sm transition-colors">
            <Download size={14} /> CSV
          </button>
          {can(['create_branches', 'manage_settings']) && (
            <button
              onClick={handleOpenAdd}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow text-xs font-semibold transition-colors"
            >
              <Plus size={14} /> Add Branch
            </button>
          )}
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

      {/* Table responsive */}
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b font-semibold text-gray-700">
              <th className="p-2.5 sm:p-3">Code</th>
              <th className="p-2.5 sm:p-3">Branch Name</th>
              <th className="p-2.5 sm:p-3">Manager</th>
              <th className="p-2.5 sm:p-3">Contact Person</th>
              <th className="p-2.5 sm:p-3">Phone & Email</th>
              <th className="p-2.5 sm:p-3">Address / Location</th>
              <th className="p-2.5 sm:p-3 text-center">Document</th>
              <th className="p-2.5 sm:p-3 text-center">Status</th>
              <th className="p-2.5 sm:p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500">Loading branches...</td>
              </tr>
            ) : filtered.length > 0 ? filtered.map(b => (
              <tr key={b._id || b.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-2.5 sm:p-3 font-semibold text-indigo-600 font-mono whitespace-nowrap">{b.code || b.id}</td>
                <td className="p-2.5 sm:p-3">
                  <div className="font-semibold text-gray-900">{b.name}</div>
                  <div className="text-[10px] text-gray-400 font-mono">{b.city}, {b.state}</div>
                </td>
                <td className="p-2.5 sm:p-3 text-gray-700 font-medium whitespace-nowrap">
                  {getManagerName(b.manager)}
                </td>
                <td className="p-2.5 sm:p-3 text-gray-700 whitespace-nowrap">
                  {b.contactPerson || '-'}
                </td>
                <td className="p-2.5 sm:p-3">
                  <div className="font-medium text-gray-800">{b.mobile || b.phone || '-'}</div>
                  <div className="text-[10px] text-gray-400 break-all">{b.email || '-'}</div>
                </td>
                <td className="p-2.5 sm:p-3 min-w-[200px]">
                  <div className="text-gray-800 line-clamp-1">{b.address1}{b.address2 ? `, ${b.address2}` : ''}</div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="shrink-0 text-gray-400" />
                    <span>{b.city}, {b.state} {b.pincode ? `(${b.pincode})` : ''}</span>
                  </div>
                </td>
                <td className="p-2.5 sm:p-3 text-center whitespace-nowrap">
                  {b.documentUrl ? (
                    <a 
                      href={api.defaults.baseURL.replace('/api', '') + b.documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition-colors"
                      title="View Document"
                    >
                      <FileText size={11} /> File
                    </a>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className="p-2.5 sm:p-3 text-center whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${b.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {b.status || 'Active'}
                  </span>
                </td>
                <td className="p-2.5 sm:p-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => handleOpenView(b)} 
                      className="p-1 text-cyan-600 hover:bg-cyan-50 rounded transition-colors" 
                      title="View Full Details"
                    >
                      <Eye size={14} />
                    </button>
                    {can(['edit_branches', 'manage_settings']) && (
                      <button onClick={() => handleOpenEdit(b)} className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors" title="Edit">
                        <Edit size={14} />
                      </button>
                    )}
                    {can(['delete_branches', 'manage_settings']) && (
                      <button onClick={() => handleDelete(b.id, b._id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500">No branches found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border">
            <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur shadow-sm border-b border-slate-200 text-slate-800 p-4 flex justify-between items-center">
              <h3 className="font-bold text-base sm:text-lg">{isEdit ? 'Edit Branch' : 'Add New Branch'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs sm:text-sm">
              
              {/* BASIC INFORMATION */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Code</label>
                    <input type="text" disabled value={currentBranch.code} className="w-full bg-slate-50 border p-2 rounded text-gray-500 text-xs cursor-not-allowed font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Name *</label>
                    <input type="text" required placeholder="e.g. Lucknow Branch" value={currentBranch.name} onChange={(e) => setCurrentBranch({ ...currentBranch, name: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Manager</label>
                    <select value={currentBranch.manager} onChange={(e) => setCurrentBranch({ ...currentBranch, manager: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="">Select Employee</option>
                      {employees.map(e => (
                        <option key={e._id} value={e._id}>{e.employeeName || e.name || e.firstName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                    <select value={currentBranch.status} onChange={(e) => setCurrentBranch({ ...currentBranch, status: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CONTACT INFORMATION */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Person</label>
                    <input type="text" value={currentBranch.contactPerson} onChange={(e) => setCurrentBranch({ ...currentBranch, contactPerson: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile</label>
                    <input type="text" value={currentBranch.mobile} onChange={(e) => setCurrentBranch({ ...currentBranch, mobile: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" value={currentBranch.email} onChange={(e) => setCurrentBranch({ ...currentBranch, email: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                    <input type="text" value={currentBranch.phone} onChange={(e) => setCurrentBranch({ ...currentBranch, phone: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                </div>
              </div>

              {/* BRANCH ADDRESS */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Branch Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 1 *</label>
                    <input type="text" required value={currentBranch.address1} onChange={(e) => setCurrentBranch({ ...currentBranch, address1: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 2</label>
                    <input type="text" value={currentBranch.address2} onChange={(e) => setCurrentBranch({ ...currentBranch, address2: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
                    <input type="text" required placeholder="e.g. Uttar Pradesh" value={currentBranch.state} onChange={(e) => setCurrentBranch({ ...currentBranch, state: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                    <input type="text" required placeholder="e.g. Lucknow" value={currentBranch.city} onChange={(e) => setCurrentBranch({ ...currentBranch, city: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">District</label>
                    <input type="text" value={currentBranch.district} onChange={(e) => setCurrentBranch({ ...currentBranch, district: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode *</label>
                    <input type="text" required value={currentBranch.pincode} onChange={(e) => setCurrentBranch({ ...currentBranch, pincode: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                </div>
              </div>





              {/* DOCUMENTS */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Documents</h4>
                <div className="flex items-center gap-4">
                  <label className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <span className="inline-block text-indigo-600 border border-indigo-600 rounded px-3 py-1.5 text-xs font-semibold hover:bg-indigo-50 transition-colors">
                      {uploading ? 'Uploading...' : '+ Upload Document'}
                    </span>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                  {currentBranch.documentUrl && (
                    <a href={api.defaults.baseURL.replace('/api', '') + currentBranch.documentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      View Uploaded Document
                    </a>
                  )}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded font-semibold text-gray-600 hover:bg-slate-50 text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 text-sm shadow-sm transition-colors">Save Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && viewBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-slate-800">{viewBranch.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${viewBranch.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {viewBranch.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">Branch Code: {viewBranch.code || viewBranch.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs sm:text-sm">
              {/* Basic Information Card */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-3 flex items-center gap-1.5">
                  <User size={14} className="text-indigo-600" /> Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">Branch Code</span>
                    <span className="font-semibold text-indigo-600 font-mono">{viewBranch.code || viewBranch.id}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">Branch Name</span>
                    <span className="font-semibold text-gray-800">{viewBranch.name}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">Branch Manager</span>
                    <span className="font-semibold text-gray-800">{getManagerName(viewBranch.manager)}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${viewBranch.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {viewBranch.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-3 flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-600" /> Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">Contact Person</span>
                    <span className="font-semibold text-gray-800">{viewBranch.contactPerson || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">Primary Mobile</span>
                    <span className="font-semibold text-gray-800">{viewBranch.mobile || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">Phone (Landline)</span>
                    <span className="font-semibold text-gray-800">{viewBranch.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">Email Address</span>
                    <span className="font-semibold text-gray-800 break-all">{viewBranch.email || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Address Details Card */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-3 flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-600" /> Physical Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 md:col-span-3">
                    <span className="block text-[11px] text-gray-500 font-medium">Address Line 1</span>
                    <span className="font-semibold text-gray-800">{viewBranch.address1 || '-'}</span>
                  </div>
                  {viewBranch.address2 && (
                    <div className="sm:col-span-2 md:col-span-3">
                      <span className="block text-[11px] text-gray-500 font-medium">Address Line 2</span>
                      <span className="font-semibold text-gray-800">{viewBranch.address2}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">City</span>
                    <span className="font-semibold text-gray-800">{viewBranch.city || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">District</span>
                    <span className="font-semibold text-gray-800">{viewBranch.district || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">State</span>
                    <span className="font-semibold text-gray-800">{viewBranch.state || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-[11px] text-gray-500 font-medium">Pincode</span>
                    <span className="font-semibold text-gray-800 font-mono">{viewBranch.pincode || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Attached Document Card */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-3 flex items-center gap-1.5">
                  <FileText size={14} className="text-amber-600" /> Attached Documents
                </h4>
                {viewBranch.documentUrl ? (
                  <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md">
                    <div className="flex items-center gap-2 text-xs">
                      <FileText size={16} className="text-indigo-600" />
                      <span className="font-medium text-gray-700">Uploaded Branch Document</span>
                    </div>
                    <a
                      href={api.defaults.baseURL.replace('/api', '') + viewBranch.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-semibold transition-colors"
                    >
                      View / Download File
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-xs">No document uploaded for this branch.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end items-center gap-3 sticky bottom-0 bg-white px-6 py-4 border-t border-slate-200">
              {can(['edit_branches', 'manage_settings']) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEdit(viewBranch);
                  }}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Edit size={14} /> Edit Branch
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-gray-700 rounded-lg font-semibold hover:bg-slate-50 text-xs sm:text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchInfo;
