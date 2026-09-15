import React, { useState } from 'react';
import { Calendar, Plus, Trash2, X, Wallet, Check, Ban, DollarSign, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExpenseClaims = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([
    { id: 'EXP-101', name: 'Vikram Singh', type: 'Travel Expense', date: '2026-08-10', amount: 3500, desc: 'Client onsite visit travel tickets', status: 'Pending' },
    { id: 'EXP-102', name: 'Neha Gupta', type: 'Client Meeting', date: '2026-08-08', amount: 2400, desc: 'Dinner with Delhi key accounts client', status: 'Approved' },
    { id: 'EXP-103', name: 'Priya Patel', type: 'Office Stationery', date: '2026-08-05', amount: 850, desc: 'Notebooks and whiteboard markers', status: 'Approved' },
    { id: 'EXP-104', name: 'Amit Sharma', type: 'Miscellaneous', date: '2026-08-04', amount: 1500, desc: 'Office team monthly refreshment tea/snacks', status: 'Approved' },
    { id: 'EXP-105', name: 'Rajesh Kumar', type: 'Travel Expense', date: '2026-08-02', amount: 1200, desc: 'Local conveyance auto charges', status: 'Rejected' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newClaim, setNewClaim] = useState({
    name: '',
    type: 'Travel Expense',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    desc: ''
  });

  const handleAddClaim = (e) => {
    e.preventDefault();
    if (!newClaim.name || !newClaim.amount) {
      alert("Name and Amount are required!");
      return;
    }
    const nextId = `EXP-${String(claims.length + 101).padStart(3, '0')}`;
    const added = {
      id: nextId,
      name: newClaim.name,
      type: newClaim.type,
      date: newClaim.date,
      amount: Number(newClaim.amount),
      desc: newClaim.desc || 'No description',
      status: 'Pending'
    };

    setClaims([added, ...claims]);
    setShowAddModal(false);
    setNewClaim({
      name: '',
      type: 'Travel Expense',
      date: new Date().toISOString().slice(0, 10),
      amount: '',
      desc: ''
    });
  };

  const handleStatusChange = (id, newStatus) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this claim log?")) {
      setClaims(claims.filter(c => c.id !== id));
    }
  };

  const stats = {
    totalCount: claims.length,
    approvedAmt: claims.filter(c => c.status === 'Approved').reduce((acc, c) => acc + c.amount, 0),
    pendingAmt: claims.filter(c => c.status === 'Pending').reduce((acc, c) => acc + c.amount, 0),
    rejectedCount: claims.filter(c => c.status === 'Rejected').length
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-indigo-600" size={24} /> Employee Expense Reimbursements
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Log employee reimbursement claims (travel, food, supplies), track approval status, and adjust payroll balances.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={() => navigate('/hrms/expenses/claims/add')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Plus size={14} /> New Expense Claim
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Total Claims Submitted</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-700 mt-1">{stats.totalCount}</div>
          </div>
          <div className="bg-blue-100 text-indigo-600 p-2.5 rounded-lg">
            <FileText size={18} />
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Reimbursed Amount</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-1">₹{stats.approvedAmt.toLocaleString()}</div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <DollarSign size={18} />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase">Pending Approval</div>
            <div className="text-xl font-bold text-amber-800 dark:text-amber-400 mt-1">₹{stats.pendingAmt.toLocaleString()}</div>
          </div>
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
            <Wallet size={18} />
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-rose-700 uppercase">Rejected Claims</div>
            <div className="text-xl font-bold text-rose-800 dark:text-rose-400 mt-1">{stats.rejectedCount}</div>
          </div>
          <div className="bg-rose-100 text-rose-600 p-2.5 rounded-lg">
            <Ban size={18} />
          </div>
        </div>

      </div>

      {/* Claims Records Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Reimbursement Ledger Roster</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="p-3">Claim ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Category Type</th>
                <th className="p-3">Sub Date</th>
                <th className="p-3 text-right">Claim Amount (₹)</th>
                <th className="p-3">Description / Remarks</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/30 font-medium">
                  <td className="p-3 font-semibold text-gray-800">{c.id}</td>
                  <td className="p-3 text-slate-800 font-bold">{c.name}</td>
                  <td className="p-3">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-650 px-2.5 py-0.5 rounded font-bold text-[10px] border dark:border-slate-200">
                      {c.type}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600 font-mono">{c.date}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-850">₹{c.amount.toLocaleString()}</td>
                  <td className="p-3 text-gray-500 max-w-xs truncate" title={c.desc}>{c.desc}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      c.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5 no-print">
                    {c.status === 'Pending' ? (
                      <>
                        <button 
                          onClick={() => handleStatusChange(c.id, 'Approved')}
                          className="px-2 py-0.5 text-[9px] font-bold bg-emerald-600 hover:bg-emerald-700 text-slate-800 rounded transition"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusChange(c.id, 'Rejected')}
                          className="px-2 py-0.5 text-[9px] font-bold bg-rose-650 hover:bg-rose-750 text-slate-800 rounded transition"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-1 hover:bg-slate-100 rounded text-rose-600 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW CLAIM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-50/50 shadow-inner border border-slate-200/50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider">Submit Expense Claim</span>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddClaim} className="p-4 space-y-3.5 font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">Employee Full Name *</label>
                <input 
                  type="text" 
                  value={newClaim.name}
                  onChange={(e) => setNewClaim({...newClaim, name: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Vikram Singh"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">Claim Date *</label>
                  <input 
                    type="date" 
                    value={newClaim.date}
                    onChange={(e) => setNewClaim({...newClaim, date: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Claim Amount (₹) *</label>
                  <input 
                    type="number" 
                    value={newClaim.amount}
                    onChange={(e) => setNewClaim({...newClaim, amount: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. 1500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Expense Category</label>
                <select 
                  value={newClaim.type}
                  onChange={(e) => setNewClaim({...newClaim, type: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Travel Expense">Travel Expense</option>
                  <option value="Food & Meals">Food & Meals</option>
                  <option value="Client Meeting">Client Meeting</option>
                  <option value="Office Stationery">Office Stationery</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Short Description / Remarks</label>
                <textarea 
                  value={newClaim.desc}
                  onChange={(e) => setNewClaim({...newClaim, desc: e.target.value})}
                  className="w-full h-16 p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="e.g. Flight ticket invoices attached..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-650 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded font-bold shadow-xs"
                >
                  Save Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpenseClaims;
