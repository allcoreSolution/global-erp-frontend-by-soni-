import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, X, MapPin, Phone, Mail, Upload, FileDown, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const BranchInfo = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [currentBranch, setCurrentBranch] = useState({
    id: '', code: '', name: '', company: '', manager: '', status: 'Active',
    contactPerson: '', mobile: '', email: '', phone: '',
    address1: '', address2: '', state: 'Uttar Pradesh', city: 'Lucknow', district: '', pincode: '',
    gstStatus: 'Registered', gstin: '', pan: '', tan: '', hsn: ''
  });

  useEffect(() => {
    fetchBranches();
    fetchCompanies();
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

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      setCompanies(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch companies', error);
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

  const filtered = branches.filter(b =>
    (b.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.code || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document.');
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
        alert('Branch updated successfully');
      } else {
        await api.post('/branches', payload);
        alert('Branch added successfully');
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
    const csvContent = "Code,Branch Name,Phone,Email,GSTIN\n";
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
    const csvContent = "Code,Branch Name,Phone,Email,GSTIN\n";
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
          <button onClick={() => fileInputRef.current.click()} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
            <Upload size={14} /> Import
          </button>
          <button onClick={handleDownloadSample} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
            <FileDown size={14} /> Sample
          </button>
          <button onClick={handleExportCSV} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded shadow-sm transition-colors">
            <Download size={14} /> CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow text-xs font-semibold transition-colors"
          >
            <Plus size={14} /> Add Branch
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

      {/* Table responsive */}
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b font-semibold text-gray-700">
              <th className="p-2.5 sm:p-3">Code</th>
              <th className="p-2.5 sm:p-3">Branch Name</th>
              <th className="p-2.5 sm:p-3">Contact</th>
              <th className="p-2.5 sm:p-3 font-mono">GSTIN</th>
              <th className="p-2.5 sm:p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">Loading branches...</td>
              </tr>
            ) : filtered.length > 0 ? filtered.map(b => (
              <tr key={b._id || b.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-2.5 sm:p-3 font-semibold text-indigo-600 font-mono">{b.code}</td>
                <td className="p-2.5 sm:p-3">
                  <div className="font-medium text-gray-900">{b.name}</div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10} />{b.address}</div>
                </td>
                <td className="p-2.5 sm:p-3">
                  <div>{b.phone}</div>
                  <div className="text-[10px] text-gray-400 break-all">{b.email}</div>
                </td>
                <td className="p-2.5 sm:p-3 font-mono text-gray-700">{b.gstin || '-'}</td>
                <td className="p-2.5 sm:p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => handleOpenEdit(b)} className="p-1 text-amber-600 hover:bg-amber-50 rounded">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(b.id, b._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">No branches found</td>
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

              {/* TAX & LEGAL */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Tax & Legal</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">GST Status</label>
                    <select value={currentBranch.gstStatus} onChange={(e) => setCurrentBranch({ ...currentBranch, gstStatus: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="Registered">Registered</option>
                      <option value="Unregistered">Unregistered</option>
                    </select>
                  </div>
                  {currentBranch.gstStatus !== 'Unregistered' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">GSTIN</label>
                      <input type="text" value={currentBranch.gstin} onChange={(e) => setCurrentBranch({ ...currentBranch, gstin: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs font-mono" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">PAN</label>
                    <input type="text" value={currentBranch.pan} onChange={(e) => setCurrentBranch({ ...currentBranch, pan: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs font-mono" />
                  </div>
                  {currentBranch.gstStatus !== 'Unregistered' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">TAN</label>
                        <input type="text" value={currentBranch.tan} onChange={(e) => setCurrentBranch({ ...currentBranch, tan: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">HSN</label>
                        <input type="text" value={currentBranch.hsn} onChange={(e) => setCurrentBranch({ ...currentBranch, hsn: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs font-mono" />
                      </div>
                    </>
                  )}
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
    </div>
  );
};

export default BranchInfo;
