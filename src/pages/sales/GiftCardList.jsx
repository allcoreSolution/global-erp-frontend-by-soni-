import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileText, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, X, CheckCircle 
} from 'lucide-react';

const GiftCardList = () => {
  const navigate = useNavigate();
  // Empty data table setup as requested: "No data available in table"
  const [giftCards, setGiftCards] = useState([]);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Form State for Add Gift Card
  const [form, setForm] = useState({
    cardNo: '',
    customer: 'Walk-in Customer',
    amount: '',
    expense: '0.00',
    createdBy: 'mummakidz',
    expiredDate: '2027-08-13'
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.cardNo || !form.amount) {
      alert("Card Number and Amount are required.");
      return;
    }
    const newRecord = {
      id: giftCards.length + 1,
      cardNo: form.cardNo,
      customer: form.customer,
      amount: Number(form.amount) || 0.00,
      expense: Number(form.expense) || 0.00,
      balance: (Number(form.amount) || 0.00) - (Number(form.expense) || 0.00),
      createdBy: form.createdBy,
      expiredDate: form.expiredDate
    };
    setGiftCards([...giftCards, newRecord]);
    setIsAddModalOpen(false);
    // Reset Form
    setForm({
      cardNo: '',
      customer: 'Walk-in Customer',
      amount: '',
      expense: '0.00',
      createdBy: 'mummakidz',
      expiredDate: '2027-08-13'
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Gift Card?")) {
      setGiftCards(giftCards.filter(c => c.id !== id));
    }
  };

  const handleOpenViewModal = (item) => {
    setSelectedCard(item);
    setIsViewModalOpen(true);
  };

  const handleExportCSV = () => {
    alert("Exporting Gift Cards list as CSV spreadsheet!");
  };

  const handleImportCSV = () => {
    const file = prompt("Import Gift Cards: Enter file name to mock import:");
    if (file) {
      alert(`Gift cards from "${file}" imported successfully!`);
    }
  };

  const handleDownloadPDF = () => {
    alert("Downloading Gift Cards list PDF document...");
  };

  // Search filter
  const filteredCards = giftCards.filter(c => 
    c.cardNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCards.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredCards.length / recordsPerPage) || 1;

  // Sums calculations
  const totalAmount = filteredCards.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = filteredCards.reduce((sum, item) => sum + item.expense, 0);
  const totalBalance = filteredCards.reduce((sum, item) => sum + item.balance, 0);

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Gift Cards</h1>
          <p className="text-sm text-gray-600">Overview of generated customer store credit gift cards registry logs.</p>
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
            onClick={() => navigate('/sales/add-gift-card')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Add Gift Card
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
            placeholder="Search Card No/Customer..."
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
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Card No</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Customer</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Amount</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Expense</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Balance</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Created By</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Expired Date</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{c.cardNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{c.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${c.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">${c.expense.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-700">${c.balance.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.createdBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{c.expiredDate}</td>
                  
                  {/* Action buttons (View, Edit, Delete) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenViewModal(c)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View gift card"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => {
                          alert(`Edit Gift Card details: ${c.cardNo}`);
                        }}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit details"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Card"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-sm text-gray-500 bg-white font-medium">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No data available in table</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Total Row */}
            <tr className="bg-gray-50/90 font-bold border-t border-blue-500 text-gray-900">
              <td colSpan="2" className="px-6 py-3.5 text-sm text-gray-800">Total</td>
              <td className="px-6 py-3.5 text-sm">${totalAmount.toFixed(2)}</td>
              <td className="px-6 py-3.5 text-sm text-red-700">${totalExpense.toFixed(2)}</td>
              <td className="px-6 py-3.5 text-sm text-emerald-800" colSpan="4">${totalBalance.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-xs font-semibold text-gray-600">
          Showing {filteredCards.length > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, filteredCards.length)} of {filteredCards.length} entries
        </div>

        {filteredCards.length > 0 && (
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

      {/* --- ADD GIFT CARD DIALOG MODAL --- */}
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
              Generate Gift Card
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Card Number *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. GC-90183829"
                  value={form.cardNo}
                  onChange={(e) => setForm({ ...form, cardNo: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Customer Registry</label>
                <select
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                >
                  <option value="Walk-in Customer">Walk-in Customer</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Jane Smith">Jane Smith</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Card Amount ($) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 100.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Expense Amount ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={form.expense}
                    onChange={(e) => setForm({ ...form, expense: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Expiry Date *</label>
                <input 
                  type="date"
                  required
                  value={form.expiredDate}
                  onChange={(e) => setForm({ ...form, expiredDate: e.target.value })}
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
                  Generate Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW CARD DETAILS DIALOG MODAL --- */}
      {isViewModalOpen && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Gift Card Summary Overview
            </h3>

            <div className="space-y-4 py-2 text-sm">
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Gift Card No:</span>
                <span className="font-bold text-gray-900">{selectedCard.cardNo}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Customer:</span>
                <span className="text-gray-900 font-semibold">{selectedCard.customer}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Initial Amount:</span>
                <span className="font-bold text-gray-900">${selectedCard.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Expense Claimed:</span>
                <span className="font-semibold text-red-700">${selectedCard.expense.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Remaining Balance:</span>
                <span className="font-bold text-emerald-700">${selectedCard.balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-blue-500 pb-2">
                <span className="font-semibold text-gray-600">Created By:</span>
                <span className="text-gray-900">{selectedCard.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-600">Expiration Date:</span>
                <span className="text-gray-900 font-semibold">{selectedCard.expiredDate}</span>
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

export default GiftCardList;
