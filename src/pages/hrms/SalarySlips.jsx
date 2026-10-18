import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  Check, 
  Calendar, 
  Search, 
  Filter, 
  Sparkles, 
  Eye, 
  Trash2, 
  ArrowLeft, 
  RefreshCw,
  Building,
  User,
  CreditCard,
  Layers,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SalarySlips = () => {
  const today = new Date();
  const currentMonthName = MONTH_NAMES[today.getMonth()];
  const currentYearStr = today.getFullYear().toString();

  // View state: 'list' | 'view_slip'
  const [view, setView] = useState('list');

  // Filter State
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Data State
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSlip, setActiveSlip] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('6');

  // Fetch payslips for selected Month & Year
  useEffect(() => {
    fetchPayslips();
  }, [selectedMonth, selectedYear]);

  const fetchPayslips = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payslips', {
        params: { month: selectedMonth, year: selectedYear }
      });
      if (res.data?.success) {
        setPayslips(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch payslips", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. GENERATE MONTHLY BULK PAYROLL (ALL EMPLOYEES LINKED WITH ATTENDANCE & STRUCTURE)
  const handleGeneratePayroll = async () => {
    const result = await Swal.fire({
      title: `Generate Payroll for ${selectedMonth} ${selectedYear}?`,
      text: "This will calculate salary for all active staff based on their assigned salary structure and attendance payable days (Present + Sundays + Holidays + Leaves).",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Generate Payroll',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setIsGenerating(true);
    try {
      const res = await api.post('/payslips/bulk-generate', {
        month: selectedMonth,
        year: selectedYear
      });

      if (res.data?.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Payroll Generated!',
          text: res.data.message || 'Monthly payroll generated successfully.',
          timer: 2000,
          showConfirmButton: false
        });
        fetchPayslips();
      }
    } catch (err) {
      console.error("Bulk payroll error", err);
      Swal.fire({
        icon: 'error',
        title: 'Generation Failed',
        text: err.response?.data?.message || err.message,
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. MARK AS COMPLETED (TICK CHECKMARK ACTION)
  const handleToggleStatus = async (slipId, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Draft' : 'Completed';
    try {
      const res = await api.put(`/payslips/${slipId}/status`, { status: newStatus });
      if (res.data?.success) {
        setPayslips(payslips.map(p => p._id === slipId ? { ...p, status: newStatus } : p));
        Swal.fire({
          icon: 'success',
          title: newStatus === 'Completed' ? 'Payroll Completed! ✓' : 'Moved to Draft',
          text: `Salary record is now ${newStatus}.`,
          timer: 1400,
          showConfirmButton: false
        });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  // 3. COMPLETE ALL PAYSLIPS FOR THIS PERIOD
  const handleCompleteAll = async () => {
    if (payslips.length === 0) return;

    const result = await Swal.fire({
      title: `Finalize Payroll for ${selectedMonth} ${selectedYear}?`,
      text: "All draft salary slips in this period will be marked as Completed ✓.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Mark All Completed',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.put('/payslips/complete-all', {
        month: selectedMonth,
        year: selectedYear
      });
      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'All Completed ✓',
          text: 'Payroll finalized successfully!',
          timer: 1800,
          showConfirmButton: false
        });
        fetchPayslips();
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  // 4. DELETE PAYSLIP
  const handleDeleteSlip = async (id) => {
    const result = await Swal.fire({
      title: 'Delete this payslip?',
      text: 'This salary record will be permanently removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/payslips/${id}`);
      setPayslips(payslips.filter(p => p._id !== id));
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Payslip record deleted.',
        timer: 1400,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  // 5. EXPORT CSV
  const handleExportCSV = () => {
    if (payslips.length === 0) {
      alert("No payroll records to export");
      return;
    }

    const headers = ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Period', 'Working Days', 'Paid Days (Payable)', 'Gross Salary', 'Total Deductions', 'Net Pay', 'Status'];
    const rows = filteredPayslips.map(p => {
      const emp = p.employee || {};
      return [
        emp.employeeId || 'N/A',
        `"${emp.employeeName || emp.username || 'Unknown'}"`,
        `"${emp.department || 'Staff'}"`,
        `"${emp.designation || 'Staff'}"`,
        `"${p.month} ${p.year}"`,
        p.workingDays || 30,
        p.paidDays || 30,
        p.grossEarnings || 0,
        p.totalDeductions || 0,
        p.netPay || 0,
        p.status || 'Draft'
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Payroll_Summary_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered List
  const filteredPayslips = useMemo(() => {
    return payslips.filter(p => {
      const empName = (p.employee?.employeeName || p.employee?.username || '').toLowerCase();
      const empCode = (p.employee?.employeeId || '').toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || empName.includes(q) || empCode.includes(q);
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payslips, searchQuery, statusFilter]);

  // Totals Summary
  const payrollSummary = useMemo(() => {
    const totalGross = filteredPayslips.reduce((sum, p) => sum + (p.grossEarnings || 0), 0);
    const totalDeductions = filteredPayslips.reduce((sum, p) => sum + (p.totalDeductions || 0), 0);
    const totalNet = filteredPayslips.reduce((sum, p) => sum + (p.netPay || 0), 0);
    const completedCount = filteredPayslips.filter(p => p.status === 'Completed').length;
    const draftCount = filteredPayslips.filter(p => p.status === 'Draft').length;

    return { totalGross, totalDeductions, totalNet, completedCount, draftCount };
  }, [filteredPayslips]);

  const openSlipPreview = (slip) => {
    setActiveSlip(slip);
    setView('view_slip');
  };

  return (
    <div className="bg-slate-50/40 p-4 sm:p-6 rounded-2xl min-h-screen space-y-5 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              Monthly Payroll & Salary Slips
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Attendance-linked salary computation, draft approval, and payslip generation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {view === 'view_slip' ? (
            <button 
              onClick={() => setView('list')} 
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
            >
              <ArrowLeft size={14} /> Back to Payroll Register
            </button>
          ) : (
            <>
              <button 
                onClick={handleExportCSV} 
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 rounded-full text-xs font-bold shadow-xs transition"
              >
                <Download size={13} /> Export CSV
              </button>

              <button 
                onClick={handleGeneratePayroll}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full text-xs font-bold shadow-xs transition disabled:opacity-50"
              >
                <Sparkles size={14} /> {isGenerating ? 'Computing...' : 'Generate Payroll'}
              </button>
            </>
          )}
        </div>
      </div>

      {view === 'list' ? (
        // =========================================================================
        // VIEW 1: PAYROLL REGISTER TABLE (ALL EMPLOYEES AUTO-CALCULATED)
        // =========================================================================
        <div className="space-y-4">
          
          {/* Top Controls: Month, Year, Search, Status Filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
            
            {/* Left: Search */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative min-w-[220px] max-w-xs flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search staff by name / ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/60 rounded-full border border-slate-200/60 focus:outline-none focus:border-indigo-500 font-medium text-slate-700 placeholder-slate-400 shadow-xs"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter size={13} className="text-slate-400" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs py-1.5 px-3 bg-slate-50/60 rounded-full border border-slate-200/60 font-semibold text-slate-700 cursor-pointer shadow-xs outline-none"
                >
                  <option value="All">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed ✓</option>
                </select>
              </div>
            </div>

            {/* Right: Period Selectors (Month & Year) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-600" />
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs py-1.5 px-3 bg-white border border-slate-200/70 rounded-full font-bold text-slate-800 cursor-pointer shadow-xs outline-none focus:border-indigo-400"
                >
                  {MONTH_NAMES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="text-xs py-1.5 px-3 bg-white border border-slate-200/70 rounded-full font-bold text-slate-800 cursor-pointer shadow-xs outline-none focus:border-indigo-400"
                >
                  {['2024', '2025', '2026', '2027'].map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              {payslips.length > 0 && (
                <button 
                  onClick={handleCompleteAll}
                  title="Finalize all draft slips for this month"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-full shadow-xs transition"
                >
                  <CheckCircle2 size={13} /> Complete All
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Staff Payroll</div>
              <div className="text-lg font-extrabold text-slate-800 mt-0.5">{filteredPayslips.length} Staff</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Gross Disbursed</div>
              <div className="text-lg font-extrabold text-emerald-700 mt-0.5">₹{payrollSummary.totalGross.toLocaleString()}</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
              <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Total Deductions (PF/ESI)</div>
              <div className="text-lg font-extrabold text-rose-600 mt-0.5">- ₹{payrollSummary.totalDeductions.toLocaleString()}</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
              <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Net Take-Home Pay</div>
              <div className="text-lg font-extrabold text-indigo-700 mt-0.5">₹{payrollSummary.totalNet.toLocaleString()}</div>
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 pl-4">Staff Member</th>
                    <th className="p-3">Role & Dept</th>
                    <th className="p-3 text-center">Month Days</th>
                    <th className="p-3 text-center">Payable Days</th>
                    <th className="p-3">Gross Salary</th>
                    <th className="p-3">Deductions</th>
                    <th className="p-3">Net Salary</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-slate-400 text-xs">
                        Loading payroll records for {selectedMonth} {selectedYear}...
                      </td>
                    </tr>
                  ) : filteredPayslips.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-10 text-center text-slate-400">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FileSpreadsheet size={22} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700">No Payroll Generated Yet</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Click &quot;Generate Payroll&quot; to auto-calculate salary for all employees based on their attendance and salary structure.
                        </p>
                        <button 
                          onClick={handleGeneratePayroll}
                          disabled={isGenerating}
                          className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold shadow-xs transition"
                        >
                          Generate {selectedMonth} {selectedYear} Payroll
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredPayslips.map((slip) => {
                      const emp = slip.employee || {};
                      const isCompleted = slip.status === 'Completed';

                      return (
                        <tr key={slip._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 pl-4">
                            <div className="font-bold text-slate-800">{emp.employeeName || emp.username || 'Employee'}</div>
                            <div className="text-[10px] text-slate-400">{emp.employeeId || 'ID: Staff'}</div>
                          </td>
                          <td className="p-3 text-slate-600">
                            <div>{emp.designation || 'Staff'}</div>
                            <div className="text-[10px] text-slate-400">{emp.department || 'General'}</div>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-500">
                            {slip.workingDays || 30}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold text-[11px] border border-indigo-100/70">
                              {slip.paidDays || 0} Days
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-emerald-700">
                            ₹{slip.grossEarnings?.toLocaleString() || 0}
                          </td>
                          <td className="p-3 font-semibold text-rose-600">
                            - ₹{slip.totalDeductions?.toLocaleString() || 0}
                          </td>
                          <td className="p-3 font-extrabold text-indigo-700">
                            <span className="px-2.5 py-0.5 bg-indigo-50/80 rounded-full border border-indigo-100">
                              ₹{slip.netPay?.toLocaleString() || 0}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleToggleStatus(slip._id, slip.status)}
                              title={isCompleted ? "Click to revert to Draft" : "Click to Mark Completed"}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition shadow-xs ${
                                isCompleted 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              {isCompleted ? (
                                <>
                                  <Check size={12} className="stroke-[3]" /> Completed ✓
                                </>
                              ) : (
                                <>
                                  <RefreshCw size={11} /> Draft
                                </>
                              )}
                            </button>
                          </td>
                          <td className="p-3 text-right pr-4 space-x-1">
                            <button 
                              onClick={() => openSlipPreview(slip)}
                              title="View & Print Official Payslip"
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              onClick={() => handleDeleteSlip(slip._id)}
                              title="Delete Payslip"
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full transition"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // =========================================================================
        // VIEW 2: OFFICIAL PAYSLIP PREVIEW & PDF PRINT VIEW
        // =========================================================================
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Slip Template:</span>
              <select 
                value={selectedTemplate} 
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-full font-bold text-slate-700 outline-none"
              >
                <option value="6">Modern Elegant Pro</option>
                <option value="1">Standard Corporate</option>
                <option value="4">Executive Premium</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleToggleStatus(activeSlip._id, activeSlip.status)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition border ${
                  activeSlip.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <Check size={13} className="stroke-[3]" /> 
                {activeSlip.status === 'Completed' ? 'Status: Completed ✓' : 'Status: Draft'}
              </button>

              <button 
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full text-xs font-bold shadow-xs transition"
              >
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Printable Payslip Card */}
          <div className="bg-slate-100/60 p-4 sm:p-8 rounded-2xl flex justify-center">
            <div id="print-area" className="bg-white text-slate-800 p-8 shadow-sm border border-slate-200 rounded-2xl w-full max-w-[720px] font-sans text-xs leading-relaxed space-y-6">
              
              {/* Slip Header */}
              <div className="flex justify-between items-start pb-5 border-b-2 border-indigo-100">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-sm">
                     G
                   </div>
                   <div>
                     <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">GLOBAL ERP SERVICES LTD.</h2>
                     <p className="text-[10px] text-slate-400 mt-0.5">Corporate Headquarters | GSTIN: 27AAAAA0000A1Z2</p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase mb-1">PAYSLIP FOR</div>
                   <div className="text-base font-black text-slate-800 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 inline-block">
                     {activeSlip.month.toUpperCase()} {activeSlip.year}
                   </div>
                </div>
              </div>

              {/* Employee Summary Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-400">Employee Name:</span>
                    <span className="font-bold text-slate-800">{activeSlip.employee?.employeeName || activeSlip.employee?.username}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-400">Employee ID:</span>
                    <span className="font-bold text-slate-800">{activeSlip.employee?.employeeId || 'EMP-STAFF'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-bold text-slate-800">{activeSlip.employee?.department || 'General'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-400">Designation:</span>
                    <span className="font-bold text-slate-800">{activeSlip.employee?.designation || 'Staff'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-400">Total Month Days:</span>
                    <span className="font-bold text-slate-800">{activeSlip.workingDays || 30} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold text-indigo-600">Payable Attendance:</span>
                    <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 rounded-full border border-indigo-100">
                      {activeSlip.paidDays || 0} Days
                    </span>
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-2 gap-6">
                
                {/* Earnings */}
                <div className="border border-emerald-100 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50/70 px-3 py-2 border-b border-emerald-100 font-bold text-emerald-900 text-[11px] uppercase">
                    Earnings
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Basic Salary:</span>
                      <span className="font-semibold text-slate-800">₹{activeSlip.basicSalary?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>HRA Allowance:</span>
                      <span className="font-semibold text-slate-800">₹{activeSlip.hra?.toLocaleString() || 0}</span>
                    </div>
                    {activeSlip.da > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>DA Allowance:</span>
                        <span className="font-semibold text-slate-800">₹{activeSlip.da?.toLocaleString() || 0}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Special Allowances:</span>
                      <span className="font-semibold text-slate-800">₹{activeSlip.otherAllowances?.toLocaleString() || 0}</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-100 flex justify-between font-bold text-emerald-900">
                      <span>Gross Earnings:</span>
                      <span>₹{activeSlip.grossEarnings?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-rose-100 rounded-xl overflow-hidden">
                  <div className="bg-rose-50/70 px-3 py-2 border-b border-rose-100 font-bold text-rose-900 text-[11px] uppercase">
                    Deductions
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>PF Employee (12%):</span>
                      <span className="font-semibold text-slate-800">₹{activeSlip.pfDeduction?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>ESIC Employee (0.75%):</span>
                      <span className="font-semibold text-slate-800">₹{activeSlip.esiDeduction?.toLocaleString() || 0}</span>
                    </div>
                    {activeSlip.loanDeduction > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Loan / Advance Cut:</span>
                        <span className="font-semibold text-slate-800">₹{activeSlip.loanDeduction?.toLocaleString() || 0}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-rose-100 flex justify-between font-bold text-rose-900">
                      <span>Total Deductions:</span>
                      <span>₹{activeSlip.totalDeductions?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Net Salary Payable Box */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Net Take-Home Pay</span>
                  <span className="text-xs text-slate-500">Disbursed to employee bank account</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-700">
                    ₹{activeSlip.netPay?.toLocaleString() || 0}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">Official Monthly Compensation</div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-xs text-slate-500">
                <div className="text-center">
                  <div className="w-36 border-b border-slate-300 mb-1"></div>
                  <span>Employee Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-slate-300 mb-1"></div>
                  <span>Authorized Signatory</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}} />

    </div>
  );
};

export default SalarySlips;
