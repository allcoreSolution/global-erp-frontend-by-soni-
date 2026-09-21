import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit, Trash2, CheckCircle, XCircle
} from 'lucide-react';
import SupplierForm, { initialFormState } from './SupplierForm';
import api from '../../api';

const SupplierMaster = () => {
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
  
  // Page routing state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

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
    if (window.confirm(`Are you sure you want to delete supplier ${supplier.supplierCode || id}?`)) {
      try {
        await api.delete(`/suppliers/${supplier._id}`);
        fetchSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
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
      if (isEditMode) {
        await api.put(`/suppliers/${supplierData._id}`, payload);
      } else {
        await api.post('/suppliers', payload);
      }
      fetchSuppliers();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Error saving supplier. Please check console.');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  // Pagination & Filtering
  const filteredSuppliers = suppliers.filter(sup => {
    const matchesSearch = sup.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || sup.id.toLowerCase().includes(searchTerm.toLowerCase());
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
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={handleOpenAdd} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow">
            <Plus size={13} /> Add Supplier
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input type="text" placeholder="Search suppliers..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full border border-slate-300 rounded pl-9 py-2 text-sm" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm bg-white">
          <option value="">All Types</option>
          <option value="Manufacturer">Manufacturer</option>
          <option value="Distributor">Distributor</option>
          <option value="Wholesaler">Wholesaler</option>
        </select>
      </div>

      {/* List / Table area */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 mb-4">
        <table className="block w-full overflow-x-auto w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-gray-700">
              <th className="p-3">Supplier ID</th>
              <th className="p-3">Company Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Contact Person</th>
              <th className="p-3">Phone</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRecords.map((sup) => {
              const displayId = sup.supplierCode || sup.id || sup._id;
              return (
              <tr key={sup._id || displayId} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-indigo-600">{displayId}</td>
                <td className="p-3 font-medium">{sup.companyName}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] bg-slate-100">{sup.type}</span></td>
                <td className="p-3">{sup.contactPerson}</td>
                <td className="p-3">{sup.phone}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleToggleStatus(sup._id)} className="focus:outline-none">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors ${sup.status ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                      {sup.status ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {sup.status ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleOpenEdit({ ...sup, id: displayId })} className="text-amber-600"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(sup._id)} className="text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
              );
            })}
            {currentRecords.length === 0 && (
              <tr><td colSpan="7" className="p-6 text-center text-gray-500 text-sm">No suppliers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierMaster;
