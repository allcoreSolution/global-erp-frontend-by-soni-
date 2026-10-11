import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Search } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

const ProductLedger = () => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    accountName: '',
    groupType: 'Asset',
    openingBalance: 0,
    balanceType: 'Dr',
    description: ''
  });

  const fetchLedgers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/account-ledgers');
      setLedgers(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch ledgers');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLedgers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/account-ledgers', {
        ...form,
        openingBalance: Number(form.openingBalance)
      });
      toast.success('Ledger created successfully!');
      setShowModal(false);
      setForm({ accountName: '', groupType: 'Asset', openingBalance: 0, balanceType: 'Dr', description: '' });
      fetchLedgers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create ledger');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this ledger?')) {
      try {
        await api.delete(`/account-ledgers/${id}`);
        toast.success('Ledger deleted successfully');
        fetchLedgers();
      } catch (error) {
        toast.error('Failed to delete ledger');
      }
    }
  }

  const filteredLedgers = ledgers.filter(l => l.accountName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-slate-50 p-6 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> Account Ledger Master
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage your Bank, Cash, and Expense accounts here.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all"
        >
          <Plus size={18} /> Add New Ledger
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <div className="relative w-72">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search ledgers..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
             />
           </div>
           <div className="text-sm font-semibold text-slate-500">
             Total Ledgers: {filteredLedgers.length}
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Account Name</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Group Type</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Opening Balance</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-500">Loading ledgers...</td></tr>
              ) : filteredLedgers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-500 italic">No ledgers found. Create your first "Cash Account"!</td></tr>
              ) : (
                filteredLedgers.map((ledger) => (
                  <tr key={ledger._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-indigo-900">{ledger.accountName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {ledger.groupType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      ₹{ledger.openingBalance} <span className="text-xs text-slate-400">({ledger.balanceType})</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Active</span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button onClick={() => handleDelete(ledger._id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create Ledger */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">Create New Ledger</h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-indigo-200 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Account Name *</label>
                <input 
                  type="text" 
                  name="accountName" 
                  value={form.accountName} 
                  onChange={handleChange} 
                  placeholder="e.g. Cash Account, HDFC Bank" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Group Type *</label>
                  <select 
                    name="groupType" 
                    value={form.groupType} 
                    onChange={handleChange} 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:border-indigo-500 outline-none"
                  >
                    <option value="Asset">Asset (Bank/Cash)</option>
                    <option value="Liability">Liability (Loans)</option>
                    <option value="Expense">Expense (Bills)</option>
                    <option value="Income">Income (Sales)</option>
                    <option value="Equity">Equity (Capital)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Opening Balance</label>
                  <div className="flex">
                    <input 
                      type="number" 
                      name="openingBalance" 
                      value={form.openingBalance} 
                      onChange={handleChange} 
                      className="w-full border border-slate-300 rounded-l-lg px-3 py-2 focus:border-indigo-500 outline-none" 
                    />
                    <select 
                      name="balanceType" 
                      value={form.balanceType} 
                      onChange={handleChange} 
                      className="border border-slate-300 border-l-0 rounded-r-lg px-2 bg-slate-50 focus:border-indigo-500 outline-none"
                    >
                      <option value="Dr">Dr</option>
                      <option value="Cr">Cr</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  placeholder="Optional notes about this account" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none h-20" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 rounded-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors"
                >
                  Save Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductLedger;
