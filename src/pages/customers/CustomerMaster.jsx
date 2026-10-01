import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2,
  Check, X, ChevronLeft, ChevronRight, Printer, User, Phone,
  Mail, MapPin, Building, CreditCard, DollarSign, History
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CustomerMaster = () => {
  const [customers, setCustomers] = useState([]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Form Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeFormTab, setActiveFormTab] = useState('basic');

  // Detail Modal / Drawer
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [activeViewTab, setActiveViewTab] = useState('general');

  // Form State
  const initialFormState = {
    customerCode: '',
    name: '',
    ownerName: '',
    businessName: '',
    type: 'Retailer',
    category: 'Regular',
    status: true,
    phone: '',
    email: '',
    gstin: '',
    pan: '',
    gstCertificate: '',
    panCard: '',
    shopLicense: '',
    otherDocuments: '',
    billingAddress: { street: '', city: '', state: '', zip: '' },
    shippingAddress: { street: '', city: '', state: '', zip: '' },
    salesRep: '',
    paymentTerms: 'Due on Receipt',
    creditLimit: 0,
    creditPeriod: 0,
    openingBalance: 0,
    balanceType: 'Dr',
    priceList: '',
    discount: 0,
    taxType: '',
    territory: '',
    warehouseName: '',
    warehouseAddress: '',
    warehouseCapacity: '',
    stockLocation: '',
    assignedRegion: '',
    commission: 0,
    logisticsWarehouse: '',
    deliveryVehicle: '',
    deliveryPerson: '',
    transporter: '',
    deliveryCharges: 0,
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    salesHistory: [],
    paymentHistory: [],
    salesReturnHistory: []
  };
  const [customerForm, setCustomerForm] = useState(initialFormState);

  const [copyAddress, setCopyAddress] = useState(false);

  const handleCopyAddress = (e) => {
    const checked = e.target.checked;
    setCopyAddress(checked);
    if (checked) {
      setCustomerForm(prev => ({
        ...prev,
        shippingAddress: { ...prev.billingAddress }
      }));
    }
  };

  // Filter Logic
  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust.customerCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust.phone || '').includes(searchTerm);
    const matchesType = filterType ? cust.type === filterType : true;
    const matchesCategory = filterCategory ? cust.category === filterCategory : true;
    const matchesStatus = filterStatus ? (filterStatus === 'Active' ? cust.status === true : cust.status === false) : true;
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCustomers.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredCustomers.length / recordsPerPage);

  const handleToggleStatus = async (id) => {
    const customer = customers.find(c => c._id === id);
    if (!customer) return;
    try {
      await api.patch(`/customers/${id}`, { status: !customer.status });
      fetchCustomers();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteCustomer = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this customer?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
        Swal.fire('Deleted!', 'Customer has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting customer:', error);
        Swal.fire('Error!', 'Failed to delete customer.', 'error');
      }
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setCustomerForm({ ...initialFormState });
    setCopyAddress(false);
    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setIsEditMode(true);
    setSelectedCustomer(cust);
    setCustomerForm({ ...cust });
    setCopyAddress(JSON.stringify(cust.billingAddress) === JSON.stringify(cust.shippingAddress));
    setActiveFormTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenView = (cust) => {
    setViewCustomer(cust);
    setActiveViewTab('general');
    setIsViewOpen(true);
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setCustomerForm({ ...customerForm, [field]: response.data.url });
        Swal.fire('Success', `${field} uploaded successfully!`, 'success');
      }
    } catch (error) {
      console.error(`Error uploading ${field}:`, error);
      Swal.fire('Error', 'Upload failed. Please check server logs.', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!customerForm.name.trim()) return;

    try {
      if (isEditMode) {
        await api.put(`/customers/${selectedCustomer._id}`, customerForm);
      } else {
        await api.post('/customers', customerForm);
      }
      fetchCustomers();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  // Real CSV Export
  const handleExport = () => {
    const headers = ['Customer ID', 'Customer Name', 'Type', 'Category', 'Phone', 'Email', 'Active'];
    const rows = customers.map(c => [
      c.customerCode,
      `"${c.name.replace(/"/g, '""')}"`,
      c.type,
      c.category,
      c.phone,
      c.email,
      c.status ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const newCustomers = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 6) {
            newCustomers.push({
              customerCode: cols[0] || `CUST-NEW-${Date.now()}-${i}`,
              name: cols[1] || 'Imported Customer',
              type: cols[2] || 'Retailer',
              category: cols[3] || 'Regular',
              status: cols[6] === 'Yes' ? true : false,
              phone: cols[4] || '',
              email: cols[5] || '',
              billingAddress: { street: 'Imported', city: 'Imported', state: 'Imported', zip: '' },
              shippingAddress: { street: 'Imported', city: 'Imported', state: 'Imported', zip: '' },
              gstin: '',
              pan: '',
              bankName: '',
              bankAccount: '',
              bankIfsc: '',
              openingBalance: 0,
              balanceType: 'Dr',
              creditLimit: 100000,
              creditPeriod: 30,
              paymentTerms: 'Net 30',
              salesHistory: [],
              paymentHistory: [],
              salesReturnHistory: []
            });
          }
        }
        if (newCustomers.length > 0) {
          let successCount = 0;
          let duplicateCount = 0;
          for (let c of newCustomers) {
            // Check for duplicates
            const isDuplicate = customers.some(
              (existing) => 
                (existing.phone && existing.phone === c.phone) || 
                (existing.email && existing.email === c.email) ||
                (existing.customerCode && existing.customerCode === c.customerCode)
            );

            if (isDuplicate) {
              duplicateCount++;
              continue; // Skip existing customer
            }

            try {
              await api.post('/customers', c);
              successCount++;
            } catch (err) {
              console.error("Error importing customer", c, err);
            }
          }
          fetchCustomers();
          Swal.fire('Import Complete', `Successfully imported ${successCount} customers. Skipped ${duplicateCount} duplicates.`, 'success');
        } else {
          Swal.fire('Warning', 'No valid data found in CSV. Headers should match: Customer ID, Customer Name, Type, Category, Phone, Email, Active', 'warning');
        }
      } catch (err) {
        Swal.fire('Error', 'Error parsing CSV file.', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input value so onChange triggers again for same file name
    e.target.value = '';
  };

  const handleDownloadSample = () => {
    const headers = ['Customer ID', 'Customer Name', 'Type', 'Category', 'Phone', 'Email', 'Active'];
    const csvContent = headers.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "customer_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Customer Master List', 14, 15);
    
    const tableColumn = ["Customer ID", "Name", "Type", "Category", "Contact", "Status", "Balance"];
    const tableRows = [];

    filteredCustomers.forEach(cust => {
      const balance = calculateDue(cust);
      const balanceStr = `Rs ${Math.abs(balance).toLocaleString()} ${balance >= 0 ? 'Dr' : 'Cr'}`;
      
      const customerData = [
        cust.customerCode,
        cust.name,
        cust.type,
        cust.category,
        cust.phone,
        cust.status ? 'Active' : 'Inactive',
        balanceStr
      ];
      tableRows.push(customerData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    doc.save(`customers_list_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const calculateDue = (cust) => {
    const totalSales = cust.salesHistory?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const totalPaid = cust.paymentHistory?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const totalReturned = cust.salesReturnHistory?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const openingBal = cust.balanceType === 'Dr' ? cust.openingBalance : -cust.openingBalance;
    return openingBal + totalSales - totalPaid - totalReturned;
  };

  return (
    <div className="bg-white text-gray-900 p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 min-h-screen">
      {/* Hidden File Input for CSV Import */}
      <input
        type="file"
        id="customer-csv-import"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-800">Customer Master</h1>
          <p className="text-xs sm:text-sm text-gray-500">Add, edit, view, delete and manage financial transactions of clients.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-nowrap items-center gap-2 w-full md:w-auto no-print overflow-x-auto whitespace-nowrap no-scrollbar">
          <button
            onClick={() => document.getElementById('customer-csv-import').click()}
            className="flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Upload size={13} /> Import CSV
          </button>
          <button
            onClick={handleExport}
            className="flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={handleDownloadSample}
            className="flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold border border-emerald-300 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors"
          >
            <FileText size={13} /> Sample Sheet
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
          >
            <Printer size={13} /> Download PDF
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-[10px] sm:text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={13} /> Add Customer
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 mb-6 bg-slate-50 p-3 sm:p-4 rounded-lg no-print">
        <div className="relative col-span-1 sm:col-span-2 md:col-span-2">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Name or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full border border-slate-300 rounded-md text-xs py-2 px-2 bg-white focus:outline-none"
          >
            <option value="">All Customer Types</option>
            <option value="Retailer">Retailer</option>
            <option value="Wholesaler">Wholesaler</option>
            <option value="Distributor">Distributor</option>
          </select>
        </div>
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full border border-slate-300 rounded-md text-xs py-2 px-2 bg-white focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Regular">Regular</option>
            <option value="VIP">VIP</option>
            <option value="Corporate">Corporate</option>
          </select>
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full border border-slate-300 rounded-md text-xs py-2 px-2 bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 mb-4">
        <table className="w-full text-left border-collapse text-[10px] sm:text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 font-semibold text-gray-700">
              <th className="p-2 sm:p-3">Customer ID</th>
              <th className="p-2 sm:p-3">Name</th>
              <th className="p-2 sm:p-3">Type</th>
              <th className="p-2 sm:p-3">Category</th>
              <th className="p-2 sm:p-3">Contact</th>
              <th className="p-2 sm:p-3 text-right">Balance (₹)</th>
              <th className="p-2 sm:p-3 text-center no-print">Status</th>
              <th className="p-2 sm:p-3 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentRecords.length > 0 ? (
              currentRecords.map((cust) => {
                const balance = calculateDue(cust);
                return (
                  <tr key={cust._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2 sm:p-3 font-semibold text-indigo-600">{cust.customerCode}</td>
                    <td className="p-2 sm:p-3">
                      <div className="font-medium text-gray-900">{cust.name}</div>
                      <div className="text-[9px] sm:text-[10px] text-gray-500 break-all">{cust.email}</div>
                    </td>
                    <td className="p-2 sm:p-3">
                      <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-slate-100 text-slate-700">
                        {cust.type}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium ${cust.category === 'VIP' ? 'bg-amber-100 text-amber-800' :
                          cust.category === 'Corporate' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {cust.category}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3">
                      <div className="text-[10px] sm:text-xs text-gray-800">{cust.phone}</div>
                      <div className="text-[9px] sm:text-[10px] text-gray-500">{cust.billingAddress.city}, {cust.billingAddress.state}</div>
                    </td>
                    <td className={`p-2 sm:p-3 text-right font-medium ${balance >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₹ {Math.abs(balance).toLocaleString()} {balance >= 0 ? 'Dr' : 'Cr'}
                    </td>
                    <td className="p-2 sm:p-3 text-center no-print">
                      <button
                        onClick={() => handleToggleStatus(cust._id)}
                        className={`px-2 py-0.5 rounded-full font-semibold text-[9px] sm:text-[10px] transition-colors ${cust.status ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                      >
                        {cust.status ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-2 sm:p-3 text-center no-print">
                      <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                        <button
                          onClick={() => handleOpenView(cust)}
                          className="p-1 text-indigo-600 hover:bg-blue-50 rounded"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(cust)}
                          className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(cust._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500 text-xs sm:text-sm">
                  No customers found. Click "Add Customer" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-600 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 gap-2 no-print">
          <div>
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredCustomers.length)} of {filteredCustomers.length} records
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="py-1 px-3 bg-white border border-slate-300 rounded font-semibold">{currentPage}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col my-auto">
            {/* Modal Header */}
            <div className="p-3 sm:p-4 bg-slate-50/50 shadow-inner border border-slate-200 text-slate-800 flex justify-between items-center">
              <h2 className="text-sm sm:text-base font-bold">
                {isEditMode ? `Edit Customer (${customerForm.customerCode})` : 'Add New Customer'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-slate-100 border-b border-slate-200 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar">
              {[
                { id: 'basic', label: 'Basic Info', icon: User },
                { id: 'address', label: 'Address', icon: MapPin },
                { id: 'business', label: 'Business Details', icon: DollarSign },
                { id: 'specific', label: customerForm.type === 'Retailer' ? 'Documents' : customerForm.type === 'Wholesaler' ? 'Warehouse' : 'Logistics', icon: FileText }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id)}
                  className={`flex items-center gap-1.5 py-2.5 px-4 sm:px-6 border-b-2 transition-colors whitespace-nowrap ${activeFormTab === tab.id
                      ? 'border-blue-600 text-indigo-600 bg-white'
                      : 'border-transparent text-gray-600 hover:bg-slate-50'
                    }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 text-xs sm:text-sm">
              {activeFormTab === 'basic' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Customer Name *</label>
                      <input type="text" required placeholder="e.g. Ramesh Kumar" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Owner / Contact Person</label>
                      <input type="text" placeholder="Owner Name" value={customerForm.ownerName} onChange={(e) => setCustomerForm({ ...customerForm, ownerName: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Business / Company Name</label>
                      <input type="text" placeholder="Shop or Company Name" value={customerForm.businessName} onChange={(e) => setCustomerForm({ ...customerForm, businessName: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Business Type *</label>
                      <select value={customerForm.type} onChange={(e) => setCustomerForm({ ...customerForm, type: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm bg-white focus:outline-none">
                        <option value="Retailer">Retailer</option>
                        <option value="Wholesaler">Wholesaler</option>
                        <option value="Distributor">Distributor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Mobile Number *</label>
                      <input type="tel" required placeholder="e.g. 9876543210" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
                      <input type="email" placeholder="e.g. contact@client.com" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">GSTIN Number</label>
                      <input type="text" placeholder="e.g. 08AAAAA1111A1Z1" value={customerForm.gstin} onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">PAN Number</label>
                      <input type="text" placeholder="e.g. AAAAA1111A" value={customerForm.pan} onChange={(e) => setCustomerForm({ ...customerForm, pan: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer mt-1">
                        <input type="checkbox" checked={customerForm.status} onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.checked })} className="rounded text-indigo-600 h-4 w-4" />
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-700 uppercase">Customer Active Status</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'address' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-800 mb-2 sm:mb-3 flex items-center gap-1.5"><MapPin size={14} className="text-indigo-600" /> Billing Address</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <textarea placeholder="Street Address" rows="2" value={customerForm.billingAddress.street} onChange={(e) => setCustomerForm({ ...customerForm, billingAddress: { ...customerForm.billingAddress, street: e.target.value } })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="State" value={customerForm.billingAddress.state} onChange={(e) => setCustomerForm({ ...customerForm, billingAddress: { ...customerForm.billingAddress, state: e.target.value } })} className="border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                          <input type="text" placeholder="City" value={customerForm.billingAddress.city} onChange={(e) => setCustomerForm({ ...customerForm, billingAddress: { ...customerForm.billingAddress, city: e.target.value } })} className="border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                        </div>
                        <input type="text" placeholder="Pincode" value={customerForm.billingAddress.zip} onChange={(e) => setCustomerForm({ ...customerForm, billingAddress: { ...customerForm.billingAddress, zip: e.target.value } })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-2 sm:mb-3">
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5"><MapPin size={14} className="text-emerald-600" /> {customerForm.type === 'Wholesaler' ? 'Shipping / Warehouse Address' : 'Shipping Address'}</h4>
                        <label className="flex items-center gap-1 cursor-pointer text-[10px] sm:text-xs text-indigo-600 font-medium">
                          <input type="checkbox" checked={copyAddress} onChange={handleCopyAddress} className="rounded h-3 w-3" /> Copy Billing
                        </label>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <textarea placeholder="Street Address" rows="2" disabled={copyAddress} value={copyAddress ? customerForm.billingAddress.street : customerForm.shippingAddress.street} onChange={(e) => setCustomerForm({ ...customerForm, shippingAddress: { ...customerForm.shippingAddress, street: e.target.value } })} className={`w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none ${copyAddress ? 'bg-slate-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`} />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="State" disabled={copyAddress} value={copyAddress ? customerForm.billingAddress.state : customerForm.shippingAddress.state} onChange={(e) => setCustomerForm({ ...customerForm, shippingAddress: { ...customerForm.shippingAddress, state: e.target.value } })} className={`border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none ${copyAddress ? 'bg-slate-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`} />
                          <input type="text" placeholder="City" disabled={copyAddress} value={copyAddress ? customerForm.billingAddress.city : customerForm.shippingAddress.city} onChange={(e) => setCustomerForm({ ...customerForm, shippingAddress: { ...customerForm.shippingAddress, city: e.target.value } })} className={`border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none ${copyAddress ? 'bg-slate-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`} />
                        </div>
                        <input type="text" placeholder="Pincode" disabled={copyAddress} value={copyAddress ? customerForm.billingAddress.zip : customerForm.shippingAddress.zip} onChange={(e) => setCustomerForm({ ...customerForm, shippingAddress: { ...customerForm.shippingAddress, zip: e.target.value } })} className={`w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none ${copyAddress ? 'bg-slate-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === 'business' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">{customerForm.type} Code / ID *</label>
                      <input type="text" disabled value={customerForm.customerCode || 'Auto Generated'} className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs sm:text-sm text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Sales Representative</label>
                      <input type="text" placeholder="Sales Rep Name" value={customerForm.salesRep} onChange={(e) => setCustomerForm({ ...customerForm, salesRep: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Payment Terms</label>
                      <select value={customerForm.paymentTerms} onChange={(e) => setCustomerForm({ ...customerForm, paymentTerms: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm bg-white focus:outline-none">
                        <option value="Due on Receipt">Due on Receipt</option>
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 45">Net 45</option>
                        <option value="Net 60">Net 60</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Credit Limit (₹)</label>
                      <input type="number" value={customerForm.creditLimit} onChange={(e) => setCustomerForm({ ...customerForm, creditLimit: Number(e.target.value) })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Opening Balance (₹)</label>
                        <input type="number" value={customerForm.openingBalance} onChange={(e) => setCustomerForm({ ...customerForm, openingBalance: Number(e.target.value) })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                      </div>
                      <div className="w-24">
                        <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Type</label>
                        <select value={customerForm.balanceType} onChange={(e) => setCustomerForm({ ...customerForm, balanceType: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm bg-white focus:outline-none">
                          <option value="Dr">Dr</option>
                          <option value="Cr">Cr</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">{customerForm.type} Price List</label>
                      <select value={customerForm.priceList} onChange={(e) => setCustomerForm({ ...customerForm, priceList: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm bg-white focus:outline-none">
                        <option value="">Select Price List</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                        <option value="Wholesale">Wholesale</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Discount %</label>
                      <input type="number" value={customerForm.discount} onChange={(e) => setCustomerForm({ ...customerForm, discount: Number(e.target.value) })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Tax Type / Settings</label>
                      <select value={customerForm.taxType} onChange={(e) => setCustomerForm({ ...customerForm, taxType: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm bg-white focus:outline-none">
                        <option value="">Select Tax Type</option>
                        <option value="GST Regular">GST Regular</option>
                        <option value="GST Composition">GST Composition</option>
                        <option value="Exempt">Exempt</option>
                      </select>
                    </div>

                    {/* Conditional Business Fields */}
                    {(customerForm.type === 'Wholesaler' || customerForm.type === 'Distributor') && (
                      <div>
                        <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">{customerForm.type === 'Wholesaler' ? 'Territory / Area' : 'Distribution Area / Territory'}</label>
                        <input type="text" placeholder="Area Name" value={customerForm.territory} onChange={(e) => setCustomerForm({ ...customerForm, territory: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                      </div>
                    )}

                    {customerForm.type === 'Distributor' && (
                      <>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Assigned Region</label>
                          <input type="text" placeholder="Region" value={customerForm.assignedRegion} onChange={(e) => setCustomerForm({ ...customerForm, assignedRegion: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Commission %</label>
                          <input type="number" value={customerForm.commission} onChange={(e) => setCustomerForm({ ...customerForm, commission: Number(e.target.value) })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeFormTab === 'specific' && (
                <div className="space-y-4 sm:space-y-6">
                  {customerForm.type === 'Retailer' && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-800 mb-4 flex items-center gap-1.5"><FileText size={14} className="text-indigo-600" /> Documents Upload</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="border border-dashed border-slate-300 p-4 text-center rounded bg-white hover:bg-slate-50 transition-colors cursor-pointer block">
                          <p className="text-xs font-medium text-slate-700 mb-1">GST Certificate</p>
                          {customerForm.gstCertificate ? <p className="text-[10px] text-green-600 font-semibold"><Check size={12} className="inline mr-1"/>Uploaded</p> : <p className="text-[10px] text-slate-500">Click to upload (PDF, JPG)</p>}
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'gstCertificate')} />
                        </label>
                        <label className="border border-dashed border-slate-300 p-4 text-center rounded bg-white hover:bg-slate-50 transition-colors cursor-pointer block">
                          <p className="text-xs font-medium text-slate-700 mb-1">PAN Card</p>
                          {customerForm.panCard ? <p className="text-[10px] text-green-600 font-semibold"><Check size={12} className="inline mr-1"/>Uploaded</p> : <p className="text-[10px] text-slate-500">Click to upload (PDF, JPG)</p>}
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'panCard')} />
                        </label>
                        <label className="border border-dashed border-slate-300 p-4 text-center rounded bg-white hover:bg-slate-50 transition-colors cursor-pointer block">
                          <p className="text-xs font-medium text-slate-700 mb-1">Shop License</p>
                          {customerForm.shopLicense ? <p className="text-[10px] text-green-600 font-semibold"><Check size={12} className="inline mr-1"/>Uploaded</p> : <p className="text-[10px] text-slate-500">Click to upload (PDF, JPG)</p>}
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'shopLicense')} />
                        </label>
                        <label className="border border-dashed border-slate-300 p-4 text-center rounded bg-white hover:bg-slate-50 transition-colors cursor-pointer block">
                          <p className="text-xs font-medium text-slate-700 mb-1">Other Documents</p>
                          {customerForm.otherDocuments ? <p className="text-[10px] text-green-600 font-semibold"><Check size={12} className="inline mr-1"/>Uploaded</p> : <p className="text-[10px] text-slate-500">Click to upload (PDF, JPG)</p>}
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'otherDocuments')} />
                        </label>
                      </div>
                    </div>
                  )}

                  {customerForm.type === 'Wholesaler' && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-800 mb-4 flex items-center gap-1.5"><Building size={14} className="text-indigo-600" /> Warehouse Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Warehouse Name</label>
                          <input type="text" placeholder="Main Warehouse" value={customerForm.warehouseName} onChange={(e) => setCustomerForm({ ...customerForm, warehouseName: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Warehouse Capacity</label>
                          <input type="text" placeholder="e.g. 5000 sq ft" value={customerForm.warehouseCapacity} onChange={(e) => setCustomerForm({ ...customerForm, warehouseCapacity: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Warehouse Address</label>
                          <textarea rows="2" placeholder="Full address" value={customerForm.warehouseAddress} onChange={(e) => setCustomerForm({ ...customerForm, warehouseAddress: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Stock Location</label>
                          <input type="text" placeholder="Zone A, Rack 2" value={customerForm.stockLocation} onChange={(e) => setCustomerForm({ ...customerForm, stockLocation: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                        </div>
                      </div>
                    </div>
                  )}

                  {customerForm.type === 'Distributor' && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-800 mb-4 flex items-center gap-1.5"><MapPin size={14} className="text-indigo-600" /> Logistics Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Linked Warehouse</label>
                          <input type="text" placeholder="Warehouse Name" value={customerForm.logisticsWarehouse} onChange={(e) => setCustomerForm({ ...customerForm, logisticsWarehouse: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Transporter Name</label>
                          <input type="text" placeholder="XYZ Transports" value={customerForm.transporter} onChange={(e) => setCustomerForm({ ...customerForm, transporter: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Delivery Vehicle</label>
                          <input type="text" placeholder="Truck / Van Number" value={customerForm.deliveryVehicle} onChange={(e) => setCustomerForm({ ...customerForm, deliveryVehicle: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Delivery Person</label>
                          <input type="text" placeholder="Driver Name / Contact" value={customerForm.deliveryPerson} onChange={(e) => setCustomerForm({ ...customerForm, deliveryPerson: e.target.value })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Delivery Charges (₹)</label>
                          <input type="number" value={customerForm.deliveryCharges} onChange={(e) => setCustomerForm({ ...customerForm, deliveryCharges: Number(e.target.value) })} className="w-full border border-slate-300 rounded p-2 text-xs sm:text-sm focus:outline-none bg-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded text-xs sm:text-sm hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              {activeFormTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeFormTab === 'address') setActiveFormTab('basic');
                    else if (activeFormTab === 'business') setActiveFormTab('address');
                    else if (activeFormTab === 'specific') setActiveFormTab('business');
                  }}
                  className="px-4 py-2 border border-slate-300 rounded text-xs sm:text-sm hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
              )}
              {activeFormTab === 'specific' ? (
                <button
                  onClick={handleFormSubmit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs sm:text-sm font-semibold transition-colors"
                >
                  Save Customer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (activeFormTab === 'basic') setActiveFormTab('address');
                    else if (activeFormTab === 'address') setActiveFormTab('business');
                    else if (activeFormTab === 'business') setActiveFormTab('specific');
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs sm:text-sm font-semibold transition-colors"
                >
                  Save & Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS DRAWER */}
      {isViewOpen && viewCustomer && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-slate-900/70 p-4 sm:p-6 backdrop-blur-sm no-print">
          <div className="bg-white w-full max-w-4xl h-[95vh] flex flex-col rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] animate-fade-in relative border border-slate-200 overflow-hidden">
            
            {/* Certificate Header Banner */}
            <div className="flex-none bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 px-6 py-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              
              <button onClick={() => setIsViewOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-black/20 p-2 rounded-full hover:bg-black/40 z-20">
                <X size={20} />
              </button>
              
              <div className="relative z-10">
                <p className="text-indigo-200 text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2">Official Customer Profile</p>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3">{viewCustomer.name}</h2>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <span className="px-3 py-1 bg-indigo-700/50 border border-indigo-500 rounded-full text-indigo-100 text-xs font-medium backdrop-blur-sm">
                    ID: {viewCustomer.customerCode}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${viewCustomer.status ? 'bg-green-500/20 border-green-500 text-green-100' : 'bg-red-500/20 border-red-500 text-red-100'}`}>
                    {viewCustomer.status ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
              
              {/* Top Meta Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                    <Building size={18} className="text-indigo-600" />
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Business Type</p>
                  <p className="font-bold text-gray-800 text-xs sm:text-sm">{viewCustomer.type}</p>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                    <Check size={18} className="text-emerald-600" />
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Category</p>
                  <p className="font-bold text-gray-800 text-xs sm:text-sm">{viewCustomer.category}</p>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2">
                    <Phone size={18} className="text-blue-600" />
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Contact</p>
                  <p className="font-bold text-gray-800 text-xs sm:text-sm">{viewCustomer.phone}</p>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 text-center overflow-hidden transform hover:-translate-y-1 transition-transform">
                  <div className="w-10 h-10 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-2">
                    <Mail size={18} className="text-rose-600" />
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Email</p>
                  <p className="font-bold text-gray-800 text-[10px] sm:text-xs truncate" title={viewCustomer.email}>{viewCustomer.email || 'N/A'}</p>
                </div>
              </div>

              {/* Main Info Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
                
                {/* Left Column: Financials & Tax */}
                <div className="space-y-6 sm:space-y-8">
                  
                  {/* Financials block */}
                  <div>
                    <h3 className="text-sm font-bold text-indigo-900 border-b-2 border-indigo-100 pb-2 mb-4 flex items-center gap-2">
                      <DollarSign size={16} /> Financial Overview
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">Credit Limit</span>
                        <span className="text-sm font-bold text-gray-800">₹ {viewCustomer.creditLimit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">Credit Period</span>
                        <span className="text-sm font-bold text-gray-800">{viewCustomer.creditPeriod} Days</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">Payment Terms</span>
                        <span className="text-sm font-bold text-gray-800">{viewCustomer.paymentTerms}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">Current Balance</span>
                        <span className={`text-base sm:text-lg font-black ${calculateDue(viewCustomer) >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          ₹ {Math.abs(calculateDue(viewCustomer)).toLocaleString()} {calculateDue(viewCustomer) >= 0 ? 'Dr' : 'Cr'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tax & Bank block */}
                  <div>
                    <h3 className="text-sm font-bold text-indigo-900 border-b-2 border-indigo-100 pb-2 mb-4 flex items-center gap-2">
                      <FileText size={16} /> Registration Details
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">GSTIN</span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-gray-800">{viewCustomer.gstin || 'Not Provided'}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">PAN</span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-gray-800">{viewCustomer.pan || 'Not Provided'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs sm:text-sm text-gray-500 font-medium">Bank A/c</span>
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-800 text-right w-1/2 break-words">
                          {viewCustomer.bankAccount ? `${viewCustomer.bankName} - ${viewCustomer.bankAccount}` : 'Not Provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                </div>

                {/* Right Column: Address & Documents */}
                <div className="space-y-6 sm:space-y-8">
                  
                  {/* Address block */}
                  <div>
                    <h3 className="text-sm font-bold text-indigo-900 border-b-2 border-indigo-100 pb-2 mb-4 flex items-center gap-2">
                      <MapPin size={16} /> Location Details
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-4 sm:p-5 border-b border-slate-100">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 mb-2 block flex items-center gap-1.5"><Building size={12}/> Billing Address</span>
                        <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">{viewCustomer.billingAddress.street}, {viewCustomer.billingAddress.city}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{viewCustomer.billingAddress.state} - {viewCustomer.billingAddress.zip}</p>
                      </div>
                      <div className="p-4 sm:p-5 bg-slate-50">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 mb-2 block flex items-center gap-1.5"><MapPin size={12}/> Shipping Address</span>
                        <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">{viewCustomer.shippingAddress.street}, {viewCustomer.shippingAddress.city}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{viewCustomer.shippingAddress.state} - {viewCustomer.shippingAddress.zip}</p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Documents block */}
                  <div>
                    <h3 className="text-sm font-bold text-indigo-900 border-b-2 border-indigo-100 pb-2 mb-4 flex items-center gap-2">
                      <FileText size={16} /> Official Certificates
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {viewCustomer.gstCertificate ? (
                        <a href={viewCustomer.gstCertificate} target="_blank" rel="noreferrer" className="group bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-4 rounded-xl text-center transition-all shadow-sm">
                          <Check size={20} className="mx-auto text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] sm:text-xs font-bold text-gray-800 block">GST Certificate</span>
                        </a>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed p-4 rounded-xl text-center opacity-60 grayscale">
                          <X size={20} className="mx-auto text-slate-400 mb-2" />
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block">No GST Cert</span>
                        </div>
                      )}
                      
                      {viewCustomer.panCard ? (
                        <a href={viewCustomer.panCard} target="_blank" rel="noreferrer" className="group bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-4 rounded-xl text-center transition-all shadow-sm">
                          <Check size={20} className="mx-auto text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] sm:text-xs font-bold text-gray-800 block">PAN Card</span>
                        </a>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed p-4 rounded-xl text-center opacity-60 grayscale">
                          <X size={20} className="mx-auto text-slate-400 mb-2" />
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block">No PAN Card</span>
                        </div>
                      )}
                      
                      {viewCustomer.shopLicense ? (
                        <a href={viewCustomer.shopLicense} target="_blank" rel="noreferrer" className="group bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-4 rounded-xl text-center transition-all shadow-sm">
                          <Check size={20} className="mx-auto text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] sm:text-xs font-bold text-gray-800 block">Shop License</span>
                        </a>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed p-4 rounded-xl text-center opacity-60 grayscale">
                          <X size={20} className="mx-auto text-slate-400 mb-2" />
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block">No Shop License</span>
                        </div>
                      )}

                      {viewCustomer.otherDocuments ? (
                        <a href={viewCustomer.otherDocuments} target="_blank" rel="noreferrer" className="group bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-4 rounded-xl text-center transition-all shadow-sm">
                          <Check size={20} className="mx-auto text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] sm:text-xs font-bold text-gray-800 block">Other Docs</span>
                        </a>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed p-4 rounded-xl text-center opacity-60 grayscale">
                          <X size={20} className="mx-auto text-slate-400 mb-2" />
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 block">No Other Docs</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Certificate Footer Stamp */}
              <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-300 flex justify-between items-center opacity-50">
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-600 font-semibold">
                  ISSUED: {new Date().toLocaleString()}
                </div>
                <div className="text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-widest">
                  ACS ERP SYSTEM
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMaster;
