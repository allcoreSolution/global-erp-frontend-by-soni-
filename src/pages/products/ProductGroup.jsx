import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FolderTree, Search } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

const ProductGroup = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    groupName: '',
    parentGroup: 'Asset',
    description: ''
  });

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/account-groups');
      setGroups(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch account groups');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/account-groups', form);
      toast.success('Dynamic Group created successfully!');
      setShowModal(false);
      setForm({ groupName: '', parentGroup: 'Asset', description: '' });
      fetchGroups();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create group');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this dynamic group?')) {
      try {
        await api.delete(`/account-groups/${id}`);
        toast.success('Group deleted successfully');
        fetchGroups();
      } catch (error) {
        toast.error('Failed to delete group');
      }
    }
  }

  const filteredGroups = groups.filter(g => g.groupName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-slate-50 p-6 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderTree className="text-indigo-600" /> Dynamic Account Groups
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create unlimited custom groups (e.g. Indirect Expenses, Sundry Debtors) under the 5 main pillars.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all"
        >
          <Plus size={18} /> Add Dynamic Group
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <div className="relative w-72">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search dynamic groups..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
             />
           </div>
           <div className="text-sm font-semibold text-slate-500">
             Total Dynamic Groups: {filteredGroups.length}
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Dynamic Group Name</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Parent Pillar (Root)</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8 text-slate-500">Loading groups...</td></tr>
              ) : filteredGroups.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-slate-500 italic">No dynamic groups found. Create your first one (e.g. "Indirect Expenses")!</td></tr>
              ) : (
                filteredGroups.map((group) => (
                  <tr key={group._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-indigo-900">{group.groupName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {group.parentGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {group.description || '-'}
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button onClick={() => handleDelete(group._id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
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

      {/* Modal for Create Group */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-bold">Create Dynamic Group</h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-indigo-200 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Dynamic Group Name *</label>
                <input 
                  type="text" 
                  name="groupName" 
                  value={form.groupName} 
                  onChange={handleChange} 
                  placeholder="e.g. Indirect Expenses, Sundry Debtors" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Parent Pillar (Root) *</label>
                <select 
                  name="parentGroup" 
                  value={form.parentGroup} 
                  onChange={handleChange} 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:border-indigo-500 outline-none"
                >
                  <option value="Asset">Asset (Property/Receivables)</option>
                  <option value="Liability">Liability (Loans/Payables)</option>
                  <option value="Expense">Expense (Bills/Salaries)</option>
                  <option value="Income">Income (Sales/Revenue)</option>
                  <option value="Equity">Equity (Capital)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">This dynamic group will be linked under this main pillar.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  placeholder="Optional notes about this group" 
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
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGroup;
