import React, { useState, useEffect } from 'react';
import { 
  Calendar, Search, Download, FileText, Printer, Eye, Trash2, Edit,
  ChevronLeft, ChevronRight, AlertCircle, LayoutGrid, X, Filter, Plus 
} from 'lucide-react';
import api from '../../api';

const ChallanList = () => {
  // Empty data table setup as requested: "No data available in table"
  const [challans, setChallans] = useState([]);

  // States
  const [selectedCourier, setSelectedCourier] = useState('All Courier');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch Challans
  const fetchChallans = async () => {
    try {
      const res = await api.get('/challans');
      const data = res.data?.data || res.data || [];
      const mappedData = data.map((item, index) => ({
        id: item._id,
        date: item.challanDate || '-',
        referenceNo: item.challanNo || `CH-${index}`,
        orderNo: item.salesOrder || '-',
        courier: item.transporter || 'Self/Road',
        status: item.deliveryStatus || 'Pending',
        closingDate: item.deliveryDate || '-',
        totalAmount: item.items?.reduce((acc, curr) => acc + ((Number(curr.qty) || 0) * (Number(curr.rate) || 0)), 0) || 0,
        createdBy: item.preparedBy || 'System',
        closedBy: item.approvedBy || '-'
      }));
      setChallans(mappedData);
    } catch (err) {
      console.error("Failed to fetch challans:", err);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    referenceNo: true,
    orderNo: true,
    courier: true,
    status: true,
    closingDate: true,
    totalAmount: true,
    createdBy: true,
    closedBy: true,
  });

  const [isColMenuOpen, setIsColMenuOpen] = useState(false);

  // Form State for Add Challan
  const [form, setForm] = useState({
    challanNo: '', challanDate: '2026-09-10', challanType: 'Delivery',
    company: '', branch: '', warehouse: '',
    salesOrder: '', invoiceNo: '', packingSlip: '',
    customer: '', contactPerson: '', mobileNo: '', billingAddress: '', shippingAddress: '', sameAsBilling: false,
    items: [{ product: '', sku: '', batch: '', qty: '', unit: '', rate: '' }],
    transportMode: 'Road', transporter: '', vehicleNo: '', driverName: '', driverMobile: '', lrGrNo: '', ewayBillNo: '', dispatchDate: '', expectedDate: '',
    deliveryStatus: 'Pending', receivedBy: '', deliveryDate: '', deliveryRemarks: '',
    preparedBy: '', approvedBy: '', notes: ''
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        challanNo: form.challanNo || `CH-${Math.floor(100000 + Math.random() * 900000)}`,
        salesOrder: form.salesOrder || `ORD-${Math.floor(100000 + Math.random() * 900000)}`
      };
      
      if (editingId) {
        await api.put(`/challans/${editingId}`, payload);
        alert('Challan updated successfully');
      } else {
        await api.post('/challans', payload);
        alert('Challan created successfully');
      }
      
      fetchChallans();
      setIsAddModalOpen(false);
      setEditingId(null);
      // Reset Form
      setForm({
        challanNo: '', challanDate: '2026-09-10', challanType: 'Delivery',
        company: '', branch: '', warehouse: '',
        salesOrder: '', invoiceNo: '', packingSlip: '',
        customer: '', contactPerson: '', mobileNo: '', billingAddress: '', shippingAddress: '', sameAsBilling: false,
        items: [{ product: '', sku: '', batch: '', qty: '', unit: '', rate: '' }],
        transportMode: 'Road', transporter: '', vehicleNo: '', driverName: '', driverMobile: '', lrGrNo: '', ewayBillNo: '', dispatchDate: '', expectedDate: '',
        deliveryStatus: 'Pending', receivedBy: '', deliveryDate: '', deliveryRemarks: '',
        preparedBy: '', approvedBy: '', notes: ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to save challan: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = async (challan) => {
    try {
      const res = await api.get(`/challans/${challan.id}`);
      const fullChallan = res.data?.data || res.data;
      setForm({
        ...fullChallan,
        items: fullChallan.items?.length > 0 ? fullChallan.items : [{ product: '', sku: '', batch: '', qty: '', unit: '', rate: '' }]
      });
      setEditingId(challan.id);
      setIsAddModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch challan details for edit');
    }
  };

  const handleAddItem = () => {
    setForm({ ...form, items: [...form.items, { product: '', sku: '', batch: '', qty: '', unit: '', rate: '' }] });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = value;
    setForm({ ...form, items: updatedItems });
  };
  
  const handleRemoveItem = (index) => {
    if (form.items.length > 1) {
      const updatedItems = form.items.filter((_, i) => i !== index);
      setForm({ ...form, items: updatedItems });
    }
  };

  const totalQty = form.items.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
  const totalAmount = form.items.reduce((acc, curr) => acc + ((Number(curr.qty) || 0) * (Number(curr.rate) || 0)), 0);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Challan record?")) {
      try {
        await api.delete(`/challans/${id}`);
        setChallans(challans.filter(c => c.id !== id));
        alert('Deleted successfully');
      } catch (err) {
        console.error(err);
        alert('Failed to delete challan: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleExportCSV = () => {
    alert("Exporting Challan list as CSV spreadsheet!");
  };

  const handleDownloadPDF = () => {
    alert("Generating and downloading Challans list PDF file...");
  };

  const handlePrint = () => {
    alert("Triggering browser print commands layout for Challans...");
  };

  // Search and status filters
  const filteredChallans = challans.filter(c => {
    const matchesSearch = c.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.courier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourier = selectedCourier === 'All Courier' || c.courier === selectedCourier;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    
    return matchesSearch && matchesCourier && matchesStatus;
  });

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredChallans.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredChallans.length / recordsPerPage) || 1;

  const totalAmountSum = filteredChallans.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Challan List</h1>
          <p className="text-sm text-gray-600">Track and manage inventory courier delivery challans logs.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Column Visibility Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsColMenuOpen(!isColMenuOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 bg-white transition-colors"
            >
              <LayoutGrid size={14} /> Column Visibility
            </button>
            
            {isColMenuOpen && (
              <div className="absolute right-0 z-15 mt-1.5 w-52 bg-white border border-blue-500 rounded shadow-xl p-2.5 space-y-1.5 text-xs text-gray-800">
                <p className="font-bold border-b border-blue-500/20 pb-1 text-gray-500 uppercase tracking-wider text-[9px]">Toggle Columns</p>
                {Object.keys(visibleColumns).map((col) => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded font-medium">
                    <input 
                      type="checkbox" 
                      checked={visibleColumns[col]} 
                      onChange={() => toggleColumn(col)}
                      className="rounded text-indigo-600 border-blue-500 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> CSV
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <FileText size={14} /> PDF
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Printer size={14} /> Print
          </button>
          <button 
            onClick={() => {
              setEditingId(null);
              setForm({
                challanNo: '', challanDate: '2026-09-10', challanType: 'Delivery',
                company: '', branch: '', warehouse: '',
                salesOrder: '', invoiceNo: '', packingSlip: '',
                customer: '', contactPerson: '', mobileNo: '', billingAddress: '', shippingAddress: '', sameAsBilling: false,
                items: [{ product: '', sku: '', batch: '', qty: '', unit: '', rate: '' }],
                transportMode: 'Road', transporter: '', vehicleNo: '', driverName: '', driverMobile: '', lrGrNo: '', ewayBillNo: '', dispatchDate: '', expectedDate: '',
                deliveryStatus: 'Pending', receivedBy: '', deliveryDate: '', deliveryRemarks: '',
                preparedBy: '', approvedBy: '', notes: ''
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Create Challan
          </button>
        </div>
      </div>

      {/* Filter Options Controls Form Header */}
      <div className="bg-gray-50 border border-blue-500 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Courier Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Courier</label>
          <select 
            value={selectedCourier}
            onChange={(e) => setSelectedCourier(e.target.value)}
            className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-blue-400"
          >
            <option value="All Courier">All Courier</option>
            <option value="DHL Logistics">DHL Logistics</option>
            <option value="FedEx Express">FedEx Express</option>
            <option value="Blue Dart">Blue Dart</option>
          </select>
        </div>

        {/* Status Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Status</label>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-blue-400"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Submit query */}
        <div>
          <button 
            type="button"
            onClick={() => alert(`Filtering Challans for ${selectedCourier} and status ${selectedStatus}`)}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-xs font-bold transition-colors shadow"
          >
            Submit Filter
          </button>
        </div>
      </div>

      {/* Filter and Limit Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <select 
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-blue-450 font-bold"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
          </select>
          <span className="text-sm text-gray-700">entries</span>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-500">Search:</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-16 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 font-medium"
          />
        </div>
      </div>

      {/* Table view log grid */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              {visibleColumns.date && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Date</th>}
              {visibleColumns.referenceNo && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Reference No</th>}
              {visibleColumns.orderNo && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Order No</th>}
              {visibleColumns.courier && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Courier</th>}
              {visibleColumns.status && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Status</th>}
              {visibleColumns.closingDate && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Closing Date</th>}
              {visibleColumns.totalAmount && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Total Amount</th>}
              {visibleColumns.createdBy && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Created By</th>}
              {visibleColumns.closedBy && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Closed By</th>}
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 text-right w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                  {visibleColumns.date && <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">{c.date}</td>}
                  {visibleColumns.referenceNo && <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{c.referenceNo}</td>}
                  {visibleColumns.orderNo && <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{c.orderNo}</td>}
                  {visibleColumns.courier && <td className="px-4 py-3 text-sm text-gray-800">{c.courier}</td>}
                  
                  {visibleColumns.status && (
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <span className="inline-flex px-2.5 py-0.5 rounded font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        {c.status}
                      </span>
                    </td>
                  )}

                  {visibleColumns.closingDate && <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">{c.closingDate}</td>}
                  {visibleColumns.totalAmount && <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">${c.totalAmount.toFixed(2)}</td>}
                  {visibleColumns.createdBy && <td className="px-4 py-3 text-sm text-gray-600">{c.createdBy}</td>}
                  {visibleColumns.closedBy && <td className="px-4 py-3 text-sm text-gray-600 text-center">{c.closedBy}</td>}
                  
                  {/* Action buttons */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => alert(`View details: ${c.referenceNo}`)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Challan details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Record"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="px-4 py-12 text-center text-sm text-gray-500 bg-white font-medium">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No data available in table</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Total Row */}
            <tr className="bg-gray-50/90 font-bold border-t border-blue-500">
              <td colSpan={visibleColumns.date ? 1 : 0}>Total</td>
              {visibleColumns.referenceNo && <td></td>}
              {visibleColumns.orderNo && <td></td>}
              {visibleColumns.courier && <td></td>}
              {visibleColumns.status && <td></td>}
              {visibleColumns.closingDate && <td></td>}
              {visibleColumns.totalAmount && <td className="px-4 py-3.5 text-sm font-black text-gray-900">${totalAmountSum.toFixed(2)}</td>}
              {visibleColumns.createdBy && <td></td>}
              {visibleColumns.closedBy && <td></td>}
              <td className="px-4 py-3.5"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-xs font-semibold text-gray-600">
          Showing {filteredChallans.length > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, filteredChallans.length)} of {filteredChallans.length} entries
        </div>

        <div className="inline-flex items-center border border-blue-500 rounded divide-x divide-blue-500 shadow-sm bg-white">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 text-gray-600 transition-colors ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 text-gray-600 transition-colors ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Next
          </button>
        </div>
      </div>

      {/* --- CREATE CHALLAN MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 bg-white z-10 border-b border-blue-500 p-6 pb-4 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">CREATE NEW CHALLAN</h3>
                <p className="text-sm text-gray-500">Create a new delivery / stock movement challan</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-8">
              
              {/* BASIC INFORMATION */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase border-b pb-2 mb-4 tracking-wide text-indigo-700">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Challan No. *</label>
                    <input type="text" value={form.challanNo} onChange={e => setForm({...form, challanNo: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm bg-gray-50 outline-none focus:border-blue-450" placeholder="e.g. CH-00001" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Challan Date *</label>
                    <input type="date" value={form.challanDate} onChange={e => setForm({...form, challanDate: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Challan Type *</label>
                    <select value={form.challanType} onChange={e => setForm({...form, challanType: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" required>
                      <option value="Delivery">Delivery</option>
                      <option value="Stock Transfer">Stock Transfer</option>
                      <option value="Returnable">Returnable</option>
                      <option value="Non-Returnable">Non-Returnable</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Company *</label>
                    <select value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" required>
                      <option value="">Select Company</option>
                      <option value="HQ Corp">HQ Corp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Branch *</label>
                    <select value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" required>
                      <option value="">Select Branch</option>
                      <option value="Main Branch">Main Branch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Warehouse *</label>
                    <select value={form.warehouse} onChange={e => setForm({...form, warehouse: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" required>
                      <option value="">Select Warehouse</option>
                      <option value="Central WH">Central WH</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* REFERENCE DETAILS */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase border-b pb-2 mb-4 tracking-wide text-indigo-700">Reference Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Sales Order</label>
                    <select value={form.salesOrder} onChange={e => setForm({...form, salesOrder: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                      <option value="">Select Order</option>
                      <option value="SO-1234">SO-1234</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Invoice No.</label>
                    <select value={form.invoiceNo} onChange={e => setForm({...form, invoiceNo: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                      <option value="">Select Invoice</option>
                      <option value="INV-998">INV-998</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Packing Slip</label>
                    <select value={form.packingSlip} onChange={e => setForm({...form, packingSlip: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                      <option value="">Select Slip</option>
                      <option value="PS-556">PS-556</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* PARTY DETAILS */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase border-b pb-2 mb-4 tracking-wide text-indigo-700">Party Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Customer / Supplier *</label>
                      <select value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" required>
                        <option value="">Search Customer/Supplier</option>
                        <option value="Cust1">Acme Corp</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Person</label>
                        <input type="text" value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="Enter name" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile No.</label>
                        <input type="text" value={form.mobileNo} onChange={e => setForm({...form, mobileNo: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="Enter mobile" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Billing Address</label>
                      <textarea rows="2" value={form.billingAddress} onChange={e => setForm({...form, billingAddress: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="Address..."></textarea>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-gray-700">Shipping / Delivery Address</label>
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                          <input type="checkbox" checked={form.sameAsBilling} onChange={e => {
                            setForm({...form, sameAsBilling: e.target.checked, shippingAddress: e.target.checked ? form.billingAddress : form.shippingAddress});
                          }} className="rounded border-blue-500 focus:ring-blue-500" />
                          Same as Billing
                        </label>
                      </div>
                      <textarea rows="2" value={form.shippingAddress} onChange={e => setForm({...form, shippingAddress: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="Address..." disabled={form.sameAsBilling}></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* ITEM DETAILS */}
              <div>
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide text-indigo-700">Item Details</h4>
                  <button type="button" onClick={handleAddItem} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded border border-indigo-100">
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                <div className="overflow-x-auto rounded border border-blue-500">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-gray-50 border-b border-blue-500">
                      <tr>
                        <th className="p-2 text-xs font-bold text-gray-700 border-r border-blue-500">Product</th>
                        <th className="p-2 text-xs font-bold text-gray-700 border-r border-blue-500 w-24">SKU</th>
                        <th className="p-2 text-xs font-bold text-gray-700 border-r border-blue-500 w-24">Batch</th>
                        <th className="p-2 text-xs font-bold text-gray-700 border-r border-blue-500 w-20">Qty</th>
                        <th className="p-2 text-xs font-bold text-gray-700 border-r border-blue-500 w-20">Unit</th>
                        <th className="p-2 text-xs font-bold text-gray-700 border-r border-blue-500 w-24">Rate</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((item, index) => (
                        <tr key={index} className="border-b border-blue-500 last:border-b-0">
                          <td className="p-1 border-r border-blue-500">
                            <select value={item.product} onChange={e => handleItemChange(index, 'product', e.target.value)} className="w-full p-1.5 text-sm outline-none">
                              <option value="">Select</option>
                              <option value="Item A">Item A</option>
                              <option value="Item B">Item B</option>
                            </select>
                          </td>
                          <td className="p-1 border-r border-blue-500">
                            <input type="text" value={item.sku} onChange={e => handleItemChange(index, 'sku', e.target.value)} className="w-full p-1.5 text-sm outline-none" placeholder="---" />
                          </td>
                          <td className="p-1 border-r border-blue-500">
                            <input type="text" value={item.batch} onChange={e => handleItemChange(index, 'batch', e.target.value)} className="w-full p-1.5 text-sm outline-none" placeholder="---" />
                          </td>
                          <td className="p-1 border-r border-blue-500">
                            <input type="number" value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)} className="w-full p-1.5 text-sm outline-none" placeholder="0" />
                          </td>
                          <td className="p-1 border-r border-blue-500">
                            <select value={item.unit} onChange={e => handleItemChange(index, 'unit', e.target.value)} className="w-full p-1.5 text-sm outline-none">
                              <option value="PCS">PCS</option>
                              <option value="BOX">BOX</option>
                              <option value="KG">KG</option>
                            </select>
                          </td>
                          <td className="p-1 border-r border-blue-500">
                            <input type="number" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className="w-full p-1.5 text-sm outline-none" placeholder="0" />
                          </td>
                          <td className="p-1 text-center">
                            <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-1 rounded">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end mt-4 text-sm gap-8">
                  <div className="bg-gray-50 px-4 py-2 border border-blue-500 rounded"><span className="text-gray-600 mr-2">Total Qty:</span><span className="font-bold text-gray-900">{totalQty}</span></div>
                  <div className="bg-gray-50 px-4 py-2 border border-blue-500 rounded"><span className="text-gray-600 mr-2">Total Amount:</span><span className="font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span></div>
                </div>
              </div>

              {/* TRANSPORT DETAILS */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase border-b pb-2 mb-4 tracking-wide text-indigo-700">Transport Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Transport Mode *</label>
                    <select value={form.transportMode} onChange={e => setForm({...form, transportMode: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" required>
                      <option value="Road">Road</option>
                      <option value="Rail">Rail</option>
                      <option value="Air">Air</option>
                      <option value="Sea">Sea</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Transporter</label>
                    <select value={form.transporter} onChange={e => setForm({...form, transporter: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                      <option value="">Select</option>
                      <option value="Blue Dart">Blue Dart</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle No.</label>
                    <input type="text" value={form.vehicleNo} onChange={e => setForm({...form, vehicleNo: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="UP32AB1234" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Driver Name</label>
                    <input type="text" value={form.driverName} onChange={e => setForm({...form, driverName: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="Enter" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Driver Mobile</label>
                    <input type="text" value={form.driverMobile} onChange={e => setForm({...form, driverMobile: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="Enter" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">LR / GR No.</label>
                    <input type="text" value={form.lrGrNo} onChange={e => setForm({...form, lrGrNo: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="Enter" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">E-Way Bill No.</label>
                    <input type="text" value={form.ewayBillNo} onChange={e => setForm({...form, ewayBillNo: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="Enter" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Dispatch Date</label>
                    <input type="date" value={form.dispatchDate} onChange={e => setForm({...form, dispatchDate: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Date</label>
                    <input type="date" value={form.expectedDate} onChange={e => setForm({...form, expectedDate: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                  </div>
                </div>
              </div>

              {/* DELIVERY DETAILS */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase border-b pb-2 mb-4 tracking-wide text-indigo-700">Delivery Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Status</label>
                    <select value={form.deliveryStatus} onChange={e => setForm({...form, deliveryStatus: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                      <option value="Pending">Pending</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Received By</label>
                    <input type="text" value={form.receivedBy} onChange={e => setForm({...form, receivedBy: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="Enter name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Date</label>
                    <input type="date" value={form.deliveryDate} onChange={e => setForm({...form, deliveryDate: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Remarks</label>
                    <input type="text" value={form.deliveryRemarks} onChange={e => setForm({...form, deliveryRemarks: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="..." />
                  </div>
                </div>
              </div>

              {/* ADDITIONAL INFORMATION */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase border-b pb-2 mb-4 tracking-wide text-indigo-700">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Prepared By</label>
                    <select value={form.preparedBy} onChange={e => setForm({...form, preparedBy: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                      <option value="">Select User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Approved By</label>
                    <select value={form.approvedBy} onChange={e => setForm({...form, approvedBy: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                      <option value="">Select User</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Remarks</label>
                    <textarea rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="..."></textarea>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-blue-500 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2 border border-blue-500 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => alert("Draft saved!")}
                  className="px-6 py-2 border border-indigo-500 text-indigo-600 rounded text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold shadow-md transition-colors"
                >
                  Create Challan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChallanList;
