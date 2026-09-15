import React, { useState } from 'react';
import { Calendar, UserCheck, UserX, Clock, Check, X, Printer, Download, Plus } from 'lucide-react';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([
    { id: 'LR-001', name: 'Vikram Singh', type: 'Medical Leave', duration: '18-Aug-2026 to 20-Aug-2026', days: 3, reason: 'Severe dental surgery', status: 'Pending' },
    { id: 'LR-002', name: 'Neha Gupta', type: 'Casual Leave', duration: '25-Aug-2026 to 26-Aug-2026', days: 2, reason: 'Family function at hometown', status: 'Approved' },
    { id: 'LR-003', name: 'Rajesh Kumar', type: 'Earned Leave', duration: '01-Sep-2026 to 05-Sep-2026', days: 5, reason: 'Pre-planned personal travel', status: 'Approved' },
    { id: 'LR-004', name: 'Priya Patel', type: 'Casual Leave', duration: '14-Aug-2026 to 14-Aug-2026', days: 1, reason: 'Urgent domestic chore', status: 'Rejected' }
  ]);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    name: '',
    type: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    pending: leaves.filter(l => l.status === 'Pending').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length
  };

  const handleAction = (id, newStatus) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!newLeave.name || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      alert("Please fill in all fields!");
      return;
    }
    const nextId = `LR-${String(leaves.length + 1).padStart(3, '0')}`;
    const start = new Date(newLeave.startDate);
    const end = new Date(newLeave.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leaveToAdd = {
      id: nextId,
      name: newLeave.name,
      type: newLeave.type,
      duration: `${newLeave.startDate} to ${newLeave.endDate}`,
      days: diffDays,
      reason: newLeave.reason,
      status: 'Pending'
    };

    setLeaves([leaveToAdd, ...leaves]);
    setShowApplyModal(false);
    setNewLeave({ name: '', type: 'Casual Leave', startDate: '', endDate: '', reason: '' });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-indigo-600" size={24} /> Leave Requests Management
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Monitor, approve, or reject employee leave applications and manage seasonal rosters.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Plus size={14} /> Apply Leave Request
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Total Applications</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-700 mt-1">{stats.total}</div>
          </div>
          <div className="bg-blue-100 text-indigo-600 p-2.5 rounded-lg">
            <Calendar size={18} />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase">Pending Approval</div>
            <div className="text-xl font-bold text-amber-800 dark:text-amber-400 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Approved Leaves</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-1">{stats.approved}</div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <UserCheck size={18} />
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-rose-700 uppercase">Rejected Claims</div>
            <div className="text-xl font-bold text-rose-800 dark:text-rose-400 mt-1">{stats.rejected}</div>
          </div>
          <div className="bg-rose-100 text-rose-600 p-2.5 rounded-lg">
            <UserX size={18} />
          </div>
        </div>

      </div>

      {/* Leaves Logs Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Leave Application Records Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="p-3">Req ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Leave Type</th>
                <th className="p-3">Duration (Dates)</th>
                <th className="p-3 text-center">Days</th>
                <th className="p-3">Reason / Description</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/30">
                  <td className="p-3 font-semibold text-gray-800">{l.id}</td>
                  <td className="p-3 text-slate-800 font-semibold">{l.name}</td>
                  <td className="p-3">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-650 px-2 py-0.5 rounded font-bold text-[10px] border dark:border-slate-200">
                      {l.type}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{l.duration}</td>
                  <td className="p-3 text-center font-bold text-slate-800">{l.days}</td>
                  <td className="p-3 text-gray-500 max-w-xs truncate" title={l.reason}>{l.reason}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      l.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5 no-print">
                    {l.status === 'Pending' ? (
                      <>
                        <button 
                          onClick={() => handleAction(l.id, 'Approved')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-750 text-slate-800 font-bold text-[10px] rounded transition"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(l.id, 'Rejected')}
                          className="px-2.5 py-1 bg-rose-650 hover:bg-rose-750 text-slate-800 font-bold text-[10px] rounded transition"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 font-bold text-[10px] italic">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-50/50 shadow-inner border border-slate-200/50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-md overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider">Apply Leave Application</span>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleApplyLeave} className="p-4 space-y-4 font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">Employee Full Name *</label>
                <input 
                  type="text" 
                  value={newLeave.name}
                  onChange={(e) => setNewLeave({...newLeave, name: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Vikram Singh"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Start Date *</label>
                  <input 
                    type="date" 
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">End Date *</label>
                  <input 
                    type="date" 
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Leave Type</label>
                <select 
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({...newLeave, type: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Reason for Leave *</label>
                <textarea 
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  className="w-full h-20 p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="Describe your reason for leave..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowApplyModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-650 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded font-bold shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LeaveRequests;
