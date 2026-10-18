import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, UserCheck, UserX, Clock, Check, X, Plus, Trash2, Filter, Search, User, ShieldCheck, FileText, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../api';
import { usePermissions } from '../../utils/permissionUtils';

const LeaveRequests = () => {
  const { can } = usePermissions();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Logged-in user
  const currentUser = useMemo(() => {
    try {
      const uStr = localStorage.getItem('user');
      const u = uStr ? JSON.parse(uStr) : {};
      const name = u.name || u.fullName || u.username || localStorage.getItem('userName') || localStorage.getItem('erp_user') || 'Current User';
      const employeeId = u.employeeId || u.personalDetails?.employeeId || '';
      return { ...u, name, employeeId };
    } catch {
      const name = localStorage.getItem('userName') || localStorage.getItem('erp_user') || 'Current User';
      return { name, employeeId: '' };
    }
  }, []);

  // Filters for viewing table records
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State - Apply only for self (logged-in user)
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        setEmployees(list);
      }
    } catch (error) {
      console.warn("Could not load employees for filter", error);
    }
  };

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/leave-requests');
      if (res.data?.success) {
        setLeaves(res.data.data.reverse()); // Show latest first
      }
    } catch (error) {
      console.error("Failed to fetch leave requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDays = (startStr, endStr) => {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = end - start;
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleAction = async (id, newStatus) => {
    try {
      const res = await api.put(`/leave-requests/${id}`, { 
        status: newStatus 
      });
      if (res.data?.success) {
        const updated = res.data.data;
        setLeaves(prev => prev.map(l => l._id === id ? { ...l, ...updated } : l));
      }
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
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      alert("Please fill in start date, end date, and reason!");
      return;
    }

    const durationDays = calculateDays(newLeave.startDate, newLeave.endDate);
    if (durationDays <= 0) {
      alert("End Date must be on or after Start Date!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const applicantName = currentUser?.name || 'Current User';
      const applicantCode = currentUser?.employeeId || '';

      const payload = {
        employeeName: applicantName,
        employeeId: applicantCode || undefined,
        leaveType: newLeave.leaveType,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        durationDays,
        reason: newLeave.reason,
        status: 'Pending'
      };

      const res = await api.post('/leave-requests', payload);
      if (res.data?.success) {
        setLeaves([res.data.data, ...leaves]);
        setShowApplyModal(false);
        setNewLeave({ 
          leaveType: 'Casual Leave', 
          startDate: '', 
          endDate: '', 
          reason: '' 
        });
      }
    } catch (error) {
      console.error("Failed to apply leave", error);
      alert("Failed to apply leave. " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered leaves
  const filteredLeaves = leaves.filter(l => {
    const matchesEmployee = selectedEmployeeFilter === '' || 
      (l.employee === selectedEmployeeFilter) || 
      (l.employee?._id === selectedEmployeeFilter) ||
      (l.employeeName?.toLowerCase().includes(selectedEmployeeFilter.toLowerCase()));
      
    const matchesStatus = selectedStatusFilter === 'ALL' || l.status === selectedStatusFilter;
    
    const matchesSearch = !searchQuery || 
      l.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.leaveType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.approverName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesEmployee && matchesStatus && matchesSearch;
  });

  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    pending: leaves.filter(l => l.status === 'Pending').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length
  };

  const previewDays = calculateDays(newLeave.startDate, newLeave.endDate);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200/80 shadow-sm min-h-screen space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="text-indigo-600" size={24} /> Leave Management System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Apply for leave, track application status, and review approvals.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {can(['create_leave', 'manage_hrms', 'admin']) && (
            <button 
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm transition"
            >
              <Plus size={15} /> Apply Leave
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Requests</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</div>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg">
            <Calendar size={20} />
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pending Approval</div>
            <div className="text-2xl font-bold text-amber-800 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Approved Leaves</div>
            <div className="text-2xl font-bold text-emerald-800 mt-1">{stats.approved}</div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="bg-rose-50/60 border border-rose-200/70 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Rejected Requests</div>
            <div className="text-2xl font-bold text-rose-800 mt-1">{stats.rejected}</div>
          </div>
          <div className="bg-rose-100 text-rose-600 p-2.5 rounded-lg">
            <UserX size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Search by name, reason, approver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filter by Employee */}
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-slate-400" />
            <select
              value={selectedEmployeeFilter}
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
              className="bg-white text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
            >
              <option value="">All Employees</option>
              {employees.map(emp => {
                const name = `${emp.personalDetails?.firstName || ''} ${emp.personalDetails?.lastName || ''}`.trim() || emp.name;
                return (
                  <option key={emp._id} value={emp._id}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-white text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-700">{filteredLeaves.length}</span> of {leaves.length} records
        </div>
      </div>

      {/* Leaves Logs Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3">Req ID</th>
                <th className="p-3">Employee</th>
                <th className="p-3">Leave Type</th>
                <th className="p-3">Duration (Dates)</th>
                <th className="p-3 text-center">Days</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Approved By</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="animate-spin text-indigo-500" size={16} />
                      Loading leave applications...
                    </div>
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400 font-medium">
                    No leave requests found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => {
                  const days = l.durationDays || calculateDays(l.startDate, l.endDate);
                  return (
                    <tr key={l._id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-semibold text-slate-600">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[10px]" title={l._id}>
                          #{l._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{l.employeeName}</div>
                        {l.employeeId && (
                          <div className="text-[10px] text-slate-400 font-mono">ID: {l.employeeId}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold text-[10px] border border-indigo-100">
                          {l.leaveType}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div className="font-medium">{l.startDate} &rarr; {l.endDate}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {days} {days === 1 ? 'day' : 'days'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-[200px]">
                        <div className="truncate font-normal" title={l.reason}>{l.reason}</div>
                        {l.adminRemarks && (
                          <div className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 border border-amber-100 inline-block truncate max-w-full" title={`Remarks: ${l.adminRemarks}`}>
                            Note: {l.adminRemarks}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {l.approverName ? (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                            <div>
                              <div className="font-semibold text-[11px] leading-tight">{l.approverName}</div>
                              {l.approvedAt && (
                                <div className="text-[9px] text-slate-400">
                                  {new Date(l.approvedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not yet approved</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          l.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {l.status === 'Approved' && <CheckCircle2 size={11} />}
                          {l.status === 'Rejected' && <XCircle size={11} />}
                          {l.status === 'Pending' && <Clock size={11} />}
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {l.status === 'Pending' && can(['edit_leave', 'manage_hrms', 'admin']) && (
                          <>
                            <button 
                              onClick={() => handleAction(l._id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded shadow-xs transition"
                              title="Approve Leave"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleAction(l._id, 'Rejected')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded shadow-xs transition"
                              title="Reject Leave"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {can(['delete_leave', 'manage_hrms', 'admin']) && (
                          <button 
                            onClick={() => handleDelete(l._id)}
                            className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded transition inline-block ml-1"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL - FOR LOGGED IN USER */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Apply for Leave</h3>
                  <p className="text-[10px] text-slate-500">Fill your leave dates and reason to submit</p>
                </div>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleApplyLeave} className="p-5 space-y-4">
              {/* Applicant Card (Auto-filled logged in user) */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                    {currentUser?.name ? currentUser.name.slice(0, 2) : 'ME'}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Applicant</div>
                    <div className="font-bold text-slate-800 text-xs">{currentUser?.name || 'Current User'}</div>
                  </div>
                </div>
                {currentUser?.employeeId && (
                  <span className="font-mono text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-semibold">
                    ID: {currentUser.employeeId}
                  </span>
                )}
              </div>

              {/* Leave Type */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Leave Type *</label>
                <select 
                  value={newLeave.leaveType}
                  onChange={(e) => setNewLeave({...newLeave, leaveType: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-700 font-medium"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Maternity / Paternity Leave">Maternity / Paternity Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
                  <input 
                    type="date" 
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-700 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Date *</label>
                  <input 
                    type="date" 
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-700 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Live Duration Calculation Badge */}
              {previewDays > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 flex items-center justify-between text-indigo-700">
                  <span className="font-medium">Calculated Leave Duration:</span>
                  <span className="font-bold text-sm bg-white px-2.5 py-0.5 rounded shadow-xs border border-indigo-100">
                    {previewDays} {previewDays === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Leave *</label>
                <textarea 
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  className="w-full h-24 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none text-slate-700"
                  placeholder="Describe your reason for leave..."
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setShowApplyModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="animate-spin" size={14} /> Submitting...
                    </>
                  ) : (
                    'Submit Leave Application'
                  )}
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
