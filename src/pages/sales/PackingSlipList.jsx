import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Download, FileText, Printer, Eye, Trash2, Edit,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle, EyeOff, LayoutGrid, X
} from 'lucide-react';
import api from '../../api';

const PackingSlipList = () => {
  const [packingSlips, setPackingSlips] = useState([]);
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch Packing Slips
  const fetchPackingSlips = async () => {
    try {
      const res = await api.get('/packing-slips');
      const data = res.data?.data || res.data || [];
      const mappedData = data.map((item, index) => ({
        id: item._id, 
        reference: item.packingNo || `PS-${index}`,
        saleReference: item.salesOrder || '-',
        deliveryReference: item.deliveryChallan || '-',
        productList: item.products?.[0]?.product || '-',
        amount: 0.00, 
        status: item.status || 'Pending'
      }));
      setPackingSlips(mappedData);
    } catch (err) {
      console.error("Failed to fetch packing slips:", err);
    }
  };

  useEffect(() => {
    fetchPackingSlips();
  }, []);

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    reference: true,
    saleReference: true,
    deliveryReference: true,
    productList: true,
    amount: true,
    status: true,
  });

  const [isColMenuOpen, setIsColMenuOpen] = useState(false);

  // Form State for create packing slip
  const [form, setForm] = useState({
    packingNo: '', packingDate: '', status: 'Pending', company: '', branch: '', warehouse: '',
    salesOrder: '', deliveryChallan: '', invoice: '', customer: '', customerType: '', salesperson: '',
    billingAddress: '', shippingAddress: '', contact: '', mobile: '', transporter: '', vehicleNo: '',
    products: [{ product: '', batch: '', qty: '', package: '', weight: '' }],
    packedBy: '', verifiedBy: '', remarks: ''
  });

  // Handle create/update challan/packing slip submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        packingNo: form.packingNo || `PS-${Math.floor(100000 + Math.random() * 900000)}`,
        salesOrder: form.salesOrder || `SL-${Math.floor(100000 + Math.random() * 900000)}`,
        deliveryChallan: form.deliveryChallan || `DL-${Math.floor(100000 + Math.random() * 900000)}`
      };
      
      if (editingId) {
        await api.put(`/packing-slips/${editingId}`, payload);
        alert('Packing slip updated successfully');
      } else {
        await api.post('/packing-slips', payload);
        alert('Packing slip created successfully');
      }
      
      // Refresh list
      fetchPackingSlips();
      
      setIsAddModalOpen(false);
      setEditingId(null);
      // Reset Form
      setForm({
        packingNo: '', packingDate: '', status: 'Pending', company: '', branch: '', warehouse: '',
        salesOrder: '', deliveryChallan: '', invoice: '', customer: '', customerType: '', salesperson: '',
        billingAddress: '', shippingAddress: '', contact: '', mobile: '', transporter: '', vehicleNo: '',
        products: [{ product: '', batch: '', qty: '', package: '', weight: '' }],
        packedBy: '', verifiedBy: '', remarks: ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to save packing slip: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = async (slip) => {
    try {
      const res = await api.get(`/packing-slips/${slip.id}`);
      const fullSlip = res.data?.data || res.data;
      setForm({
        ...fullSlip,
        products: fullSlip.products?.length > 0 ? fullSlip.products : [{ product: '', batch: '', qty: '', package: '', weight: '' }]
      });
      setEditingId(slip.id);
      setIsAddModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch packing slip details for edit');
    }
  };

  const handleAddProduct = () => {
    setForm({ ...form, products: [...form.products, { product: '', batch: '', qty: '', package: '', weight: '' }] });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...form.products];
    updatedProducts[index][field] = value;
    setForm({ ...form, products: updatedProducts });
  };
  
  const handleRemoveProduct = (index) => {
    if (form.products.length > 1) {
      const updatedProducts = form.products.filter((_, i) => i !== index);
      setForm({ ...form, products: updatedProducts });
    }
  };

  // Helper properties for package summary
  const totalQty = form.products.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
  const totalPackages = form.products.reduce((acc, curr) => acc + (Number(curr.package) || 0), 0);
  const totalWeight = form.products.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this packing slip?")) {
      try {
        await api.delete(`/packing-slips/${id}`);
        setPackingSlips(packingSlips.filter(p => p.id !== id));
        alert('Deleted successfully');
      } catch (err) {
        console.error(err);
        alert('Failed to delete packing slip: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleExportCSV = () => {
    alert("Exporting Packing Slips list as CSV spreadsheet file!");
  };

  const handleDownloadPDF = () => {
    alert("Generating and downloading Packing Slips list PDF document...");
  };

  const handlePrint = () => {
    alert("Triggering browser print command layout for packing slips...");
  };

  // Filter
  const filteredSlips = packingSlips.filter(p => 
    p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.saleReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productList.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSlips.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredSlips.length / recordsPerPage) || 1;

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Packing Slips</h1>
          <p className="text-sm text-gray-600">Overview of generated packing slips and challan references.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Column Visibility Dropdown toggle */}
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
                packingNo: '', packingDate: '', status: 'Pending', company: '', branch: '', warehouse: '',
                salesOrder: '', deliveryChallan: '', invoice: '', customer: '', customerType: '', salesperson: '',
                billingAddress: '', shippingAddress: '', contact: '', mobile: '', transporter: '', vehicleNo: '',
                products: [{ product: '', batch: '', qty: '', package: '', weight: '' }],
                packedBy: '', verifiedBy: '', remarks: ''
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Create Challan
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

      {/* Table view grids */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="block w-full overflow-x-auto w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              {visibleColumns.reference && <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Reference</th>}
              {visibleColumns.saleReference && <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Sale Reference</th>}
              {visibleColumns.deliveryReference && <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Delivery Reference</th>}
              {visibleColumns.productList && <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Product List</th>}
              {visibleColumns.amount && <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Amount</th>}
              {visibleColumns.status && <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Status</th>}
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right w-24">Option</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((slip) => (
                <tr key={slip.id} className="hover:bg-gray-50/70 transition-colors">
                  {visibleColumns.reference && <td className="px-6 py-4 text-sm font-semibold text-gray-900">{slip.reference}</td>}
                  {visibleColumns.saleReference && <td className="px-6 py-4 text-sm text-gray-600">{slip.saleReference}</td>}
                  {visibleColumns.deliveryReference && <td className="px-6 py-4 text-sm text-gray-600">{slip.deliveryReference}</td>}
                  {visibleColumns.productList && <td className="px-6 py-4 text-sm text-gray-800 font-medium">{slip.productList}</td>}
                  {visibleColumns.amount && <td className="px-6 py-4 text-sm font-bold text-gray-900">${slip.amount.toFixed(2)}</td>}
                  {visibleColumns.status && (
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        {slip.status}
                      </span>
                    </td>
                  )}
                  {/* Actions options */}
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => alert(`View challan packing details: ${slip.reference}`)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleEdit(slip)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Record"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(slip.id)}
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
                <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500 bg-white font-medium">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No data available in table</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-xs font-semibold text-gray-600">
          Showing {filteredSlips.length > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, filteredSlips.length)} of {filteredSlips.length} entries
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
            
            <div className="sticky top-0 bg-white z-10 border-b border-blue-500 p-6 pb-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                CREATE PACKING SLIP
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              
              {/* TOP SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Packing No.</label>
                  <input type="text" value={form.packingNo} onChange={e => setForm({...form, packingNo: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm bg-gray-50 outline-none" placeholder="Auto-generated" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Packing Date</label>
                  <input type="date" value={form.packingDate} onChange={e => setForm({...form, packingDate: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Packed">Packed</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Company</label>
                  <select value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                    <option value="">Select Company</option>
                    <option value="Company A">Company A</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Branch</label>
                  <select value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                    <option value="">Select Branch</option>
                    <option value="HQ">HQ</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Warehouse</label>
                  <select value={form.warehouse} onChange={e => setForm({...form, warehouse: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                    <option value="">Select Warehouse</option>
                    <option value="Main WH">Main WH</option>
                  </select>
                </div>
              </div>

              {/* REFERENCE DETAILS */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase border-b pb-2 mb-3 tracking-wide">Reference Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Sales Order</label>
                    <input type="text" value={form.salesOrder} onChange={e => setForm({...form, salesOrder: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Challan</label>
                    <input type="text" value={form.deliveryChallan} onChange={e => setForm({...form, deliveryChallan: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Invoice</label>
                    <input type="text" value={form.invoice} onChange={e => setForm({...form, invoice: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Customer</label>
                    <select value={form.customer} onChange={e => setForm({...form, customer: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                      <option value="">Select Customer</option>
                      <option value="Cust1">Customer 1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Type</label>
                    <input type="text" value={form.customerType} onChange={e => setForm({...form, customerType: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm bg-gray-50 outline-none" disabled />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Salesperson</label>
                    <input type="text" value={form.salesperson} onChange={e => setForm({...form, salesperson: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                  </div>
                </div>
              </div>

              {/* SHIPPING DETAILS */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase border-b pb-2 mb-3 tracking-wide">Shipping Details</h4>
                <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Billing Address</label>
                    <textarea rows="2" value={form.billingAddress} onChange={e => setForm({...form, billingAddress: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450"></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Shipping Address</label>
                    <textarea rows="2" value={form.shippingAddress} onChange={e => setForm({...form, shippingAddress: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450"></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Person</label>
                      <input type="text" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile</label>
                      <input type="text" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Transporter</label>
                      <input type="text" value={form.transporter} onChange={e => setForm({...form, transporter: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle No.</label>
                      <input type="text" value={form.vehicleNo} onChange={e => setForm({...form, vehicleNo: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" />
                    </div>
                  </div>
                </div>
              </div>

              {/* PACKAGE / PRODUCT DETAILS */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase border-b pb-2 mb-3 tracking-wide">Package / Product Details</h4>
                <div className="overflow-x-auto">
                  <table className="block w-full overflow-x-auto w-full text-left border-collapse border border-blue-500">
                    <thead className="bg-gray-50 border-b border-blue-500">
                      <tr>
                        <th className="p-2 text-xs font-bold text-gray-700 border-r border-blue-500">Product</th>
                        <th className="p-2 text-xs font-bold text-gray-700 border-r border-blue-500 w-32">Batch</th>
                        <th className="p-2 text-xs font-bold text-gray-700 border-r border-blue-500 w-24">Qty</th>
                        <th className="p-2 text-xs font-bold text-gray-700 border-r border-blue-500 w-24">Package</th>
                        <th className="p-2 text-xs font-bold text-gray-700 border-r border-blue-500 w-24">Weight</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.products.map((prod, index) => (
                        <tr key={index} className="border-b border-blue-500 last:border-b-0">
                          <td className="p-1 border-r border-blue-500">
                            <input type="text" value={prod.product} onChange={e => handleProductChange(index, 'product', e.target.value)} className="w-full p-1.5 text-sm outline-none" placeholder="Search Product..." />
                          </td>
                          <td className="p-1 border-r border-blue-500">
                            <input type="text" value={prod.batch} onChange={e => handleProductChange(index, 'batch', e.target.value)} className="w-full p-1.5 text-sm outline-none" placeholder="Batch No" />
                          </td>
                          <td className="p-1 border-r border-blue-500">
                            <input type="number" value={prod.qty} onChange={e => handleProductChange(index, 'qty', e.target.value)} className="w-full p-1.5 text-sm outline-none" placeholder="0" />
                          </td>
                          <td className="p-1 border-r border-blue-500">
                            <input type="number" value={prod.package} onChange={e => handleProductChange(index, 'package', e.target.value)} className="w-full p-1.5 text-sm outline-none" placeholder="0" />
                          </td>
                          <td className="p-1 border-r border-blue-500">
                            <input type="number" value={prod.weight} onChange={e => handleProductChange(index, 'weight', e.target.value)} className="w-full p-1.5 text-sm outline-none" placeholder="0.00" />
                          </td>
                          <td className="p-1 text-center">
                            <button type="button" onClick={() => handleRemoveProduct(index)} className="text-red-500 hover:text-red-700 p-1 rounded">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3">
                  <button type="button" onClick={handleAddProduct} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded border border-indigo-100">
                    <Plus size={14} /> Add Product
                  </button>
                </div>
              </div>

              {/* PACKAGE SUMMARY */}
              <div className="bg-gray-50 border border-blue-500 rounded p-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase mb-3 tracking-wide">Package Summary</h4>
                <div className="flex flex-wrap gap-8 text-sm">
                  <div><span className="text-gray-500 mr-2">Products:</span><span className="font-bold text-gray-800">{form.products.length}</span></div>
                  <div><span className="text-gray-500 mr-2">Total Qty:</span><span className="font-bold text-gray-800">{totalQty}</span></div>
                  <div><span className="text-gray-500 mr-2">Total Packages:</span><span className="font-bold text-gray-800">{totalPackages}</span></div>
                  <div><span className="text-gray-500 mr-2">Net Weight:</span><span className="font-bold text-gray-800">{totalWeight}</span></div>
                  <div><span className="text-gray-500 mr-2">Gross Weight:</span><span className="font-bold text-gray-800">{totalWeight}</span></div>
                </div>
              </div>

              {/* VERIFICATION */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase border-b pb-2 mb-3 tracking-wide">Verification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Packed By</label>
                    <select value={form.packedBy} onChange={e => setForm({...form, packedBy: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                      <option value="">Select Employee</option>
                      <option value="Emp1">Employee 1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Verified By</label>
                    <select value={form.verifiedBy} onChange={e => setForm({...form, verifiedBy: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450">
                      <option value="">Select Manager</option>
                      <option value="Mgr1">Manager 1</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
                    <textarea rows="1" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} className="w-full border border-blue-500 rounded p-2 text-sm outline-none focus:border-blue-450" placeholder="Optional notes..."></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-blue-500 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2 border border-blue-500 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold shadow-md transition-colors"
                >
                  Save Packing Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PackingSlipList;
