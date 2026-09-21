import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Search, Download, Upload, FileText, Plus, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, X, CheckCircle 
} from 'lucide-react';
import api from '../../api';

const SaleExchangeList = () => {
  const navigate = useNavigate();
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  // States
  const [startDate, setStartDate] = useState('2025-08-13');
  const [endDate, setEndDate] = useState('2026-08-13');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All Warehouse');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);

  // Form State for Add Exchange
  const [form, setForm] = useState({
    date: '2026-08-13',
    reference: '',
    saleReference: '',
    warehouse: 'Test Shop',
    biller: 'Test Biller (Test Company)',
    customer: 'John Doe',
    paymentType: 'Cash',
    grandTotal: ''
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.saleReference || !form.grandTotal) {
      alert("Sale Reference and Grand Total are required.");
      return;
    }
    const newRecord = {
      id: exchanges.length + 1,
      date: form.date,
      reference: form.reference || `EX-${Math.floor(100000 + Math.random() * 900000)}`,
      saleReference: form.saleReference,
      warehouse: form.warehouse,
      biller: form.biller,
      customer: form.customer,
      paymentType: form.paymentType,
      grandTotal: Number(form.grandTotal) || 0.00
    };
    setExchanges([...exchanges, newRecord]);
    setIsAddModalOpen(false);
    // Reset Form
    setForm({
      date: '2026-08-13',
      reference: '',
      saleReference: '',
      warehouse: 'Test Shop',
      biller: 'Test Biller (Test Company)',
      customer: 'John Doe',
      paymentType: 'Cash',
      grandTotal: ''
    });
  };

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/sale-exchanges');
      if (data.success) {
        setExchanges(data.data);
      }
    } catch (error) {
      console.error('Error fetching exchanges', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this exchange record?")) {
      try {
        await api.delete(`/sale-exchanges/${id}`);
        setExchanges(exchanges.filter(e => e._id !== id));
      } catch (error) {
        console.error('Error deleting exchange', error);
        alert('Failed to delete exchange record');
      }
    }
  };

  const handleOpenViewModal = (item) => {
    setSelectedExchange(item);
    setIsViewModalOpen(true);
  };

  const handleExportCSV = () => {
    alert("Exporting Sales Exchanges list as CSV spreadsheet!");
  };

  const handleImportCSV = () => {
    const file = prompt("Import Sales Exchanges: Enter file name to mock import:");
    if (file) {
      alert(`Sales exchanges from "${file}" imported successfully!`);
    }
  };

  const handleDownloadPDF = () => {
    alert("Downloading Sales Exchanges list PDF document...");
  };

  const filteredExchanges = exchanges.filter(e => {
    const refMatch = e.exchangeNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const invoiceMatch = e.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const customerMatch = e.customer?.toLowerCase().includes(searchTerm.toLowerCase());
    return refMatch || invoiceMatch || customerMatch;
  });

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredExchanges.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredExchanges.length / recordsPerPage) || 1;

  const totalGrandAmount = filteredExchanges.reduce((sum, item) => sum + item.grandTotal, 0);

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Sales Exchange List</h1>
          <p className="text-sm text-gray-600">Track and manage customer product exchanges, returns, and replacement invoices.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleImportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 bg-white transition-colors"
          >
            <Upload size={14} /> Import CSV
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 bg-white transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <FileText size={14} /> PDF
          </button>
          <button 
            onClick={() => navigate('/sales/add-sale-exchange')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Add Exchange
          </button>
        </div>
      </div>

      {/* Filter Options Controls Form Header */}
      <div className="bg-gray-50 border border-blue-500 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Start Date</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-blue-500 rounded px-2 py-1.5 pl-8 text-xs bg-white text-black outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">End Date</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-blue-500 rounded px-2 py-1.5 pl-8 text-xs bg-white text-black outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Warehouse Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Warehouse</label>
          <select 
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="w-full border border-blue-500 rounded px-2 py-1.5 text-xs bg-white text-black outline-none focus:border-blue-400"
          >
            <option value="All Warehouse">All Warehouse</option>
            <option value="Test Shop">Test Shop</option>
            <option value="Central Warehouse">Central Warehouse</option>
            <option value="East Side Storage">East Side Storage</option>
          </select>
        </div>

        {/* Submit query */}
        <div>
          <button 
            type="button"
            onClick={() => alert(`Filtering Exchange invoices from ${startDate} to ${endDate} for ${selectedWarehouse}`)}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-xs font-bold transition-colors shadow"
          >
            Submit Filter
          </button>
        </div>
      </div>

      {/* Filter and Limit Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Records per page:</span>
          <select 
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-blue-450 font-semibold"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Reference/Customer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Table view log grid */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="block w-full overflow-x-auto w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Date</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Reference</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Sale Reference</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Warehouse</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Biller</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Customer</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Payment Type</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Grand Total</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((e) => (
                <tr key={e._id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{e.exchangeDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{e.exchangeNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{e.invoiceNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{e.warehouse}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{e.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{e.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{e.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{e.totals?.additionalPayable?.toFixed(2) || '0.00'}</td>
                  
                  {/* Action buttons (View, Edit, Delete) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenViewModal(e)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/sales/edit-sale-exchange/${e._id}`)}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit details"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(e._id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center text-sm text-gray-500 bg-white font-medium">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No data available in table</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Total Row */}
            <tr className="bg-gray-50/90 font-bold border-t border-blue-500 text-gray-900">
              <td colSpan="7" className="px-6 py-3.5 text-sm text-gray-800">Total</td>
              <td colSpan="2" className="px-6 py-3.5 text-sm text-emerald-800">${totalGrandAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-xs font-semibold text-gray-600">
          Showing {filteredExchanges.length > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, filteredExchanges.length)} of {filteredExchanges.length} entries
        </div>

        {filteredExchanges.length > 0 && (
          <div className="inline-flex items-center border border-blue-500 rounded divide-x divide-blue-500 shadow-sm bg-white">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 text-gray-600 transition-colors ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 text-gray-600 transition-colors ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* --- ADD EXCHANGE DIALOG MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Log Sales Exchange
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Exchange Date *</label>
                <input 
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Original Sale Reference *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. SL-20260813-902"
                  value={form.saleReference}
                  onChange={(e) => setForm({ ...form, saleReference: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Warehouse *</label>
                  <select
                    value={form.warehouse}
                    onChange={(e) => setForm({ ...form, warehouse: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  >
                    <option value="Test Shop">Test Shop</option>
                    <option value="Central Warehouse">Central Warehouse</option>
                    <option value="East Side Storage">East Side Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Biller *</label>
                  <select
                    value={form.biller}
                    onChange={(e) => setForm({ ...form, biller: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  >
                    <option value="Test Biller (Test Company)">Test Biller (Test Company)</option>
                    <option value="Admin Biller">Admin Biller</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Customer *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Customer Name"
                    value={form.customer}
                    onChange={(e) => setForm({ ...form, customer: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Payment Type *</label>
                  <select
                    value={form.paymentType}
                    onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Exchange Grand Total ($) *</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 150.00"
                  value={form.grandTotal}
                  onChange={(e) => setForm({ ...form, grandTotal: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-blue-500">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-blue-500 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-sm font-semibold shadow transition-colors"
                >
                  Save Exchange
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW EXCHANGE DETAILS DIALOG MODAL --- */}
      {isViewModalOpen && selectedExchange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Exchange Invoice Detail
            </h3>

            <div className="space-y-4 py-2 text-sm">
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Exchange Ref:</span>
                <span className="font-bold text-gray-900">{selectedExchange.reference}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Original Sale Ref:</span>
                <span className="text-gray-900 font-semibold">{selectedExchange.saleReference}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Date:</span>
                <span className="text-gray-900">{selectedExchange.date}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Warehouse:</span>
                <span className="text-gray-900 font-semibold">{selectedExchange.warehouse}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Biller:</span>
                <span className="text-gray-900">{selectedExchange.biller}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Customer:</span>
                <span className="text-gray-900 font-bold">{selectedExchange.customer}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Payment Type:</span>
                <span className="text-gray-900 font-semibold">{selectedExchange.paymentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Grand Total:</span>
                <span className="font-bold text-emerald-800">${selectedExchange.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-blue-500 mt-4">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-slate-800 rounded text-sm font-semibold transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SaleExchangeList;
