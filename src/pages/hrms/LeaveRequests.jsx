import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, UserX, Clock, Check, X, Printer, Download, Plus, Trash2 } from 'lucide-react';
import api from '../../api';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeName: '',
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/leave-requests');
      if (res.data?.success) {
        setLeaves(res.data.data.reverse()); // Show latest first
      }
    } catch (error) {
      console.error("Failed to fetch leave requests", error);
      alert("Failed to load leave requests. " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    pending: leaves.filter(l => l.status === 'Pending').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length
  };

  const handleAction = async (id, newStatus) => {
    try {
      await api.put(`/leave-requests/${id}`, { status: newStatus });
      setLeaves(prev => prev.map(l => l._id === id ? { ...l, status: newStatus } : l));
    } catch (error) {
      console.error(`Failed to ${newStatus} leave request`, error);
      alert(`Failed to update status. ` + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;
    try {
      await api.delete(`/leave-requests/${id}`);
      setLeaves(prev => prev.filter(l => l._id !== id));
    } catch (error) {
      console.error("Failed to delete leave request", error);
      alert("Failed to delete leave request. " + (error.response?.data?.message || error.message));
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!newLeave.employeeName || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      alert("Please fill in all fields!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        employeeName: newLeave.employeeName,
        leaveType: newLeave.leaveType,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        reason: newLeave.reason,
        status: 'Pending'
      };

      const res = await api.post('/leave-requests', payload);
      if (res.data?.success) {
        setLeaves([res.data.data, ...leaves]);
        setShowApplyModal(false);
        setNewLeave({ employeeName: '', leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });
      }
    } catch (error) {
      console.error("Failed to apply leave", error);
      alert("Failed to apply leave. " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDays = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
              {isLoading ? (
                 <tr><td colSpan="8" className="p-4 text-center text-gray-500">Loading leave requests...</td></tr>
              ) : leaves.length === 0 ? (
                 <tr><td colSpan="8" className="p-4 text-center text-gray-500">No leave requests found.</td></tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/30">
                    <td className="p-3 font-semibold text-gray-800">
                      <span className="truncate w-16 inline-block" title={l._id}>{l._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="p-3 text-slate-800 font-semibold">{l.employeeName}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-650 px-2 py-0.5 rounded font-bold text-[10px] border dark:border-slate-200">
                        {l.leaveType}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{l.startDate} to {l.endDate}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{calculateDays(l.startDate, l.endDate)}</td>
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
                            onClick={() => handleAction(l._id, 'Approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded transition"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(l._id, 'Rejected')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded transition"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-400 font-bold text-[10px] italic">Processed</span>
                          <button 
                            onClick={() => handleDelete(l._id)}
                            className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded transition"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
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
                  value={newLeave.employeeName}
                  onChange={(e) => setNewLeave({...newLeave, employeeName: e.target.value})}
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
                  value={newLeave.leaveType}
                  onChange={(e) => setNewLeave({...newLeave, leaveType: e.target.value})}
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
                  disabled={isSubmitting}
                  className="px-3 py-1.5 border rounded text-gray-650 hover:bg-gray-50 font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
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
