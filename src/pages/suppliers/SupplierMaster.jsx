import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Edit, Trash2, CheckCircle, XCircle, FileDown, Upload, Download, Eye,
  X, User, MapPin, Building, FileText, Check
} from 'lucide-react';
import SupplierForm, { initialFormState } from './SupplierForm';
import api from '../../api';
import Swal from 'sweetalert2';
import { usePermissions } from '../../utils/permissionUtils';

const SupplierMaster = () => {
  const { can } = usePermissions();
  const [suppliers, setSuppliers] = useState([]);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const fileInputRef = useRef(null);
  
  // Page routing state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedViewSupplier, setSelectedViewSupplier] = useState(null);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    const nextNum = suppliers.length + 1;
    const autoId = `SUP-${String(nextNum).padStart(3, '0')}`;
    setSelectedSupplier({ ...initialFormState, id: autoId });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setIsEditMode(true);
    setSelectedSupplier({ ...sup });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    const supplier = suppliers.find(s => s.supplierCode === id || s._id === id);
    if (!supplier) return;
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete supplier ${supplier.supplierCode || id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/suppliers/${supplier._id}`);
        Swal.fire('Deleted!', 'Supplier has been deleted.', 'success');
        fetchSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        Swal.fire('Error', 'Failed to delete supplier.', 'error');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const supplier = suppliers.find(s => s.supplierCode === id || s._id === id);
    if (!supplier) return;
    try {
      await api.patch(`/suppliers/${supplier._id}`, { status: !supplier.status });
      fetchSuppliers();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFormSubmit = async (supplierData) => {
    try {
      const payload = { ...supplierData, supplierCode: supplierData.id || supplierData.supplierCode };
      if (!payload.branch) delete payload.branch;
      if (!payload.company) delete payload.company;
      if (isEditMode) {
        await api.put(`/suppliers/${supplierData._id}`, payload);
      } else {
        await api.post('/suppliers', payload);
      }
      fetchSuppliers();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving supplier:', error);
      Swal.fire('Error', 'Error saving supplier. Please check console.', 'error');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  const handleOpenView = (sup) => {
    setSelectedViewSupplier(sup);
  };

  const formatAddress = (addr) => {
    if (!addr) return <span className="text-gray-400">Not provided</span>;
    const parts = [
      addr.street1,
      addr.street2,
      addr.city,
      addr.state,
      addr.zip,
      addr.country
    ].filter(Boolean);
    if (parts.length === 0) return <span className="text-gray-400">Not provided</span>;
    return (
      <div className="space-y-0.5 text-xs text-gray-800">
        {(addr.street1 || addr.street2) && (
          <div className="font-semibold text-gray-900">
            {[addr.street1, addr.street2].filter(Boolean).join(', ')}
          </div>
        )}
        <div className="text-gray-700">
          {[addr.city, addr.state].filter(Boolean).join(', ')}
          {addr.zip && <span className="font-mono text-gray-500 ml-1">({addr.zip})</span>}
        </div>
        {addr.country && <div className="text-gray-500 text-[11px] font-medium">{addr.country}</div>}
      </div>
    );
  };


  // Download CSV Sample
  const handleDownloadSample = () => {
    const headers = ['Supplier ID', 'Company Name', 'Type', 'Category', 'Branch', 'Warehouse', 'Contact Person', 'Phone', 'Email', 'GST Status', 'GSTIN', 'PAN', 'Currency', 'Status'];
    const dummyData = ['SUP-001', 'ABC Supplies', 'Manufacturer', 'Raw Materials', 'Head Office', 'Main Warehouse', 'Raju', '9988776655', 'info@abc.com', 'Registered', '27AAAAA0000A1Z5', 'AAAAA0000A', 'INR', 'Active'];
    const csvContent = headers.join(',') + '\n' + dummyData.map(d => `"${d}"`).join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'supplier_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (suppliers.length === 0) {
      Swal.fire('No Data', 'There are no suppliers to export.', 'warning');
      return;
    }
    const headers = ['Supplier ID', 'Company Name', 'Type', 'Category', 'Branch', 'Warehouse', 'Contact Person', 'Phone', 'Email', 'GST Status', 'GSTIN', 'PAN', 'Currency', 'Status'];
    const rows = suppliers.map(s => [
      `"${s.supplierCode || s.id || s._id}"`,
      `"${s.companyName || ''}"`,
      `"${s.type || ''}"`,
      `"${s.category || ''}"`,
      `"${s.branch?.name || s.branch || ''}"`,
      `"${s.warehouse || ''}"`,
      `"${s.contactPerson || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.email || ''}"`,
      `"${s.gstStatus || ''}"`,
      `"${s.gstin || ''}"`,
      `"${s.pan || ''}"`,
      `"${s.currency || ''}"`,
      s.status ? 'Active' : 'Inactive'
    ]);
    const dummyData = ['SUP-001', 'ABC Supplies', 'Manufacturer', 'Raw Materials', 'Head Office', 'Main Warehouse', 'Raju', '9988776655', 'info@abc.com', 'Registered', '27AAAAA0000A1Z5', 'AAAAA0000A', 'INR', 'Active'];
    const csvContent = [headers.join(','), dummyData.map(d => `"${d}"`).join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'suppliers_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV
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
        const sData = {};
        headers.forEach((header, index) => {
          sData[header.trim()] = values[index] ? values[index].trim() : '';
        });
        
        // Deduplication check
        const isDuplicate = suppliers.some(s => 
          (sData.phone && s.phone === sData.phone) ||
          (sData.email && s.email === sData.email) ||
          (sData.supplierCode && s.supplierCode === sData.supplierCode)
        );
        
        if (!isDuplicate) {
          importedData.push(sData);
        }
      }
      
      if (importedData.length === 0) {
        Swal.fire('Notice', 'No new suppliers found or all are duplicates.', 'info');
        e.target.value = '';
        return;
      }
      
      try {
        Swal.fire({ title: 'Importing...', text: 'Please wait', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        for (const data of importedData) {
          const payload = { ...initialFormState, ...data };
          if (!payload.supplierCode) {
             const nextNum = suppliers.length + 1 + importedData.indexOf(data);
             payload.supplierCode = `SUP-${String(nextNum).padStart(3, '0')}`;
          }
          await api.post('/suppliers', payload);
        }
        Swal.fire('Success', `${importedData.length} Suppliers imported successfully!`, 'success');
        fetchSuppliers();
      } catch (err) {
        console.error('Import error:', err);
        Swal.fire('Error', 'Failed to import suppliers.', 'error');
      }
      e.target.value = ''; // reset
    };
    reader.readAsText(file);
  };

  // Pagination & Filtering
  const filteredSuppliers = suppliers.filter(sup => {
    const sTerm = searchTerm.toLowerCase();
    const supCode = String(sup.supplierCode || sup.id || '').toLowerCase();
    const compName = String(sup.companyName || '').toLowerCase();
    const contact = String(sup.contactPerson || '').toLowerCase();
    const phone = String(sup.phone || '').toLowerCase();
    const email = String(sup.email || '').toLowerCase();
    const gstin = String(sup.gstin || '').toLowerCase();
    const city = String(sup.billingAddress?.city || '').toLowerCase();
    
    const matchesSearch = supCode.includes(sTerm) || 
                          compName.includes(sTerm) || 
                          contact.includes(sTerm) || 
                          phone.includes(sTerm) || 
                          email.includes(sTerm) || 
                          gstin.includes(sTerm) || 
                          city.includes(sTerm);
    const matchesType = filterType ? sup.type === filterType : true;
    const matchesCategory = filterCategory ? sup.category === filterCategory : true;
    return matchesSearch && matchesType && matchesCategory;
  });
  
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSuppliers.slice(indexOfFirstRecord, indexOfLastRecord);

  if (isFormOpen) {
    return (
      <div className="p-2 sm:p-4 h-full">
        <SupplierForm 
          initialData={selectedSupplier} 
          isEditMode={isEditMode} 
          onSubmit={handleFormSubmit} 
          onCancel={handleFormCancel} 
        />
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-800">Supplier Master</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage complete supplier lifecycle, contacts, commercials, and performance.</p>
        </div>
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 w-full md:w-auto pb-1 md:pb-0">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          {can(['create_suppliers', 'manage_purchases']) && (
            <button onClick={() => fileInputRef.current.click()} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
              <Upload size={14} /> Import
            </button>
          )}
          {can(['create_suppliers', 'manage_purchases']) && (
            <button onClick={handleDownloadSample} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded shadow-sm transition-colors">
              <FileDown size={14} /> Sample
            </button>
          )}
          <button onClick={handleExportCSV} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded shadow-sm transition-colors">
            <Download size={14} /> CSV
          </button>
          {can(['create_suppliers', 'manage_purchases']) && (
            <button onClick={handleOpenAdd} className="whitespace-nowrap flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors">
              <Plus size={14} /> Add Supplier
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input type="text" placeholder="Search by name, ID, phone, email, GSTIN, city..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border border-slate-300 rounded pl-9 py-2 text-sm" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm bg-white">
          <option value="">All Types</option>
          <option value="Manufacturer">Manufacturer</option>
          <option value="Service Provider">Service Provider</option>
          <option value="Importer">Importer</option>
          <option value="Local Supplier">Local Supplier</option>
        </select>
      </div>

      {/* List / Table area */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 mb-4 shadow-sm">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-gray-700 whitespace-nowrap">
              <th className="p-3">Supplier ID</th>
              <th className="p-3">Company Name</th>
              <th className="p-3">Category & Type</th>
              <th className="p-3">Contact Person</th>
              <th className="p-3">Phone & Email</th>
              <th className="p-3">GST & Tax Info</th>
              <th className="p-3">Address & Location</th>
              <th className="p-3">Bank Details</th>
              <th className="p-3 text-right">Balance (₹)</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRecords.map((sup) => {
              const displayId = sup.supplierCode || sup.id || sup._id;
              const locationParts = [sup.billingAddress?.city, sup.billingAddress?.state].filter(Boolean);
              const primaryBank = sup.banks && sup.banks.length > 0 ? sup.banks[0] : null;
              return (
              <tr key={sup._id || displayId} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-semibold text-indigo-600 whitespace-nowrap">
                  <button 
                    onClick={() => handleOpenView(sup)}
                    className="hover:underline font-mono cursor-pointer font-bold flex items-center gap-1 text-xs"
                    title="Click to view all supplier details"
                  >
                    <Eye size={13} className="text-indigo-500" />
                    {displayId}
                  </button>
                </td>
                <td className="p-3 font-bold text-gray-900 min-w-40">{sup.companyName}</td>
                <td className="p-3 whitespace-nowrap">
                  <div className="font-semibold text-gray-800">{sup.category || '-'}</div>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold border border-slate-200 mt-0.5">
                    {sup.type || '-'}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="font-semibold text-gray-900">{sup.contactPerson || '-'}</div>
                  {sup.contactPersonDesignation && (
                    <div className="text-[11px] text-gray-500 font-medium">{sup.contactPersonDesignation}</div>
                  )}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{sup.phone || '-'}</div>
                  <div className="text-[11px] text-gray-500 truncate max-w-40" title={sup.email}>{sup.email || '-'}</div>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="font-mono text-xs font-semibold text-gray-800">{sup.gstin || '-'}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {sup.pan && <span className="text-[10px] text-gray-500 font-mono">PAN: {sup.pan}</span>}
                    {sup.gstStatus && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        {sup.gstStatus}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-gray-700 whitespace-nowrap">
                  <div className="font-semibold text-gray-900">
                    {locationParts.length > 0 ? locationParts.join(', ') : '-'}
                    {sup.billingAddress?.zip && <span className="text-gray-500 text-[11px] font-mono ml-1">({sup.billingAddress.zip})</span>}
                  </div>
                  {sup.billingAddress?.street1 && (
                    <div className="text-[11px] text-gray-500 truncate max-w-36" title={[sup.billingAddress.street1, sup.billingAddress.street2].filter(Boolean).join(', ')}>
                      {sup.billingAddress.street1}
                    </div>
                  )}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {primaryBank ? (
                    <div>
                      <div className="font-semibold text-gray-900 text-xs">{primaryBank.bankName || 'Bank'}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        A/C: {primaryBank.accountNumber ? `••••${String(primaryBank.accountNumber).slice(-4)}` : '-'}
                        {sup.banks.length > 1 && <span className="ml-1 text-indigo-600 font-bold">+{sup.banks.length - 1}</span>}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No bank</span>
                  )}
                </td>
                <td className="p-3 text-right font-extrabold text-rose-600 whitespace-nowrap">
                  ₹ {(sup.balance || 0).toLocaleString('en-IN')}
                </td>
                <td className="p-3 text-center whitespace-nowrap">
                  {can(['edit_suppliers', 'manage_purchases']) ? (
                    <button onClick={() => handleToggleStatus(sup._id)} className="focus:outline-none">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors ${sup.status ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                        {sup.status ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {sup.status ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold inline-flex items-center justify-center gap-1 ${sup.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sup.status ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {sup.status ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>
                <td className="p-3 text-center whitespace-nowrap">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleOpenView(sup)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors" title="View Full Details">
                      <Eye size={15} />
                    </button>
                    {can(['edit_suppliers', 'manage_purchases']) && (
                      <button onClick={() => handleOpenEdit({ ...sup, id: displayId })} className="text-amber-600 hover:bg-amber-50 p-1.5 rounded transition-colors" title="Edit">
                        <Edit size={15} />
                      </button>
                    )}
                    {can(['delete_suppliers', 'manage_purchases']) && (
                      <button onClick={() => handleDelete(sup._id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
            {currentRecords.length === 0 && (
              <tr><td colSpan="11" className="p-8 text-center text-gray-500 text-sm">No suppliers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- COMPREHENSIVE VIEW SUPPLIER DETAILS MODAL --- */}
      {selectedViewSupplier && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-blue-200 shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-4xl w-full p-6 md:p-8 relative text-black animate-in fade-in slide-in-from-bottom-8 duration-200 mt-6 mb-10">
            
            {/* Close button */}
            <button 
              onClick={() => setSelectedViewSupplier(null)} 
              className="absolute top-5 right-5 text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 p-2 rounded-full transition-all"
              title="Close"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-200 pb-4 mb-6 pr-10">
              <div>
                <h2 className="text-2xl font-extrabold text-blue-900">{selectedViewSupplier.companyName || 'Supplier Details'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ID: {selectedViewSupplier.supplierCode || selectedViewSupplier.id || selectedViewSupplier._id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedViewSupplier.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedViewSupplier.status ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-right">
                <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Outstanding Balance</div>
                <div className="text-xl font-black text-rose-600">₹ {(selectedViewSupplier.balance || 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Section 1: Basic & Contact Details */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b pb-1.5">
                <User size={16} className="text-blue-600" /> Basic & Contact Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Contact Person</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedViewSupplier.contactPerson || '-'}</span>
                  {selectedViewSupplier.contactPersonDesignation && (
                    <span className="text-[11px] text-gray-600 block mt-0.5 font-medium">({selectedViewSupplier.contactPersonDesignation})</span>
                  )}
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Phone / Mobile</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedViewSupplier.phone || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Email</span>
                  <span className="font-semibold text-gray-900 truncate block text-xs" title={selectedViewSupplier.email}>{selectedViewSupplier.email || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Type & Category</span>
                  <span className="font-bold text-indigo-700 block text-xs">{selectedViewSupplier.type || '-'}</span>
                  <span className="text-[11px] text-gray-600">{selectedViewSupplier.category || '-'}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Tax & Registration Details */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b pb-1.5">
                <FileText size={16} className="text-blue-600" /> Tax & Registration
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">GSTIN</span>
                  <span className="font-mono font-bold text-gray-900">{selectedViewSupplier.gstin || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">PAN Number</span>
                  <span className="font-mono font-bold text-gray-900">{selectedViewSupplier.pan || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">TAN Number</span>
                  <span className="font-mono font-bold text-gray-900">{selectedViewSupplier.tan || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">GST Status</span>
                  <span className="font-semibold text-gray-900">{selectedViewSupplier.gstStatus || 'Registered'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Tax Preference / TDS</span>
                  <span className="font-semibold text-gray-900">{selectedViewSupplier.taxPreference || 'Taxable'}</span>
                  <span className="text-[11px] text-gray-600 block">{selectedViewSupplier.tdsApplicable ? '• TDS Applicable' : '• No TDS'}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Addresses */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b pb-1.5">
                <MapPin size={16} className="text-blue-600" /> Addresses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-2 text-xs uppercase tracking-wider border-b pb-1">Billing Address</span>
                  {formatAddress(selectedViewSupplier.billingAddress)}
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-2 text-xs uppercase tracking-wider border-b pb-1">Shipping / Pickup Address</span>
                  {formatAddress(selectedViewSupplier.shippingAddress)}
                </div>
              </div>
            </div>

            {/* Section 4: Bank Details */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b pb-1.5">
                <Building size={16} className="text-blue-600" /> Bank Accounts
              </h3>
              {selectedViewSupplier.banks && selectedViewSupplier.banks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {selectedViewSupplier.banks.map((b, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-gray-900 text-sm">{b.bankName || 'Bank'}</div>
                        {b.type && <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-semibold">{b.type}</span>}
                      </div>
                      <div className="text-gray-600">A/C Holder: <strong className="text-gray-800">{b.holderName || '-'}</strong></div>
                      <div className="text-gray-600 font-mono">A/C No: <strong className="text-gray-900">{b.accountNumber || '-'}</strong></div>
                      <div className="text-gray-600 font-mono">IFSC: <strong className="text-gray-900">{b.ifsc || '-'}</strong></div>
                      {b.branch && <div className="text-gray-600">Branch: <strong className="text-gray-800">{b.branch}</strong></div>}
                      {b.upi && <div className="text-gray-600">UPI: <strong className="text-indigo-600">{b.upi}</strong></div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 bg-slate-50 p-3 rounded border border-slate-200">No bank accounts added for this supplier.</p>
              )}
            </div>

            {/* Section 5: Documents */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b pb-1.5">
                <FileText size={16} className="text-blue-600" /> Uploaded Documents
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {[
                  { label: 'GST Certificate', url: selectedViewSupplier.documents?.gstCert },
                  { label: 'PAN Card', url: selectedViewSupplier.documents?.panCard },
                  { label: 'Cancelled Cheque', url: selectedViewSupplier.documents?.cheque },
                  { label: 'HSN Code', url: selectedViewSupplier.documents?.hsnCode },
                  { label: 'Other Document', url: selectedViewSupplier.documents?.other }
                ].map((doc, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="font-semibold text-gray-700 block text-[11px] mb-1">{doc.label}</span>
                    {doc.url ? (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                        <Check size={12} className="text-green-600" /> View
                      </a>
                    ) : (
                      <span className="text-gray-400 text-[11px]">Not Uploaded</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button 
                onClick={() => setSelectedViewSupplier(null)} 
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierMaster;
