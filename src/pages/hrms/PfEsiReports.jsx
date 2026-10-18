import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  Printer,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = ['2024', '2025', '2026', '2027', '2028'];

const PfEsiReports = () => {
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonthIndex]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [records, setRecords] = useState([]);
  const [backendStats, setBackendStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    fetchStatutoryData();
  }, [selectedMonth, selectedYear]);

  const fetchStatutoryData = async () => {
    setIsLoading(true);
    try {
      // 1. Try dedicated statutory endpoint
      const res = await api.get(`/statutory/pf-esi?month=${selectedMonth}&year=${selectedYear}`);
      if (res.data?.success && res.data.records) {
        setRecords(res.data.records);
        setBackendStats(res.data.stats || null);
      } else {
        // Fallback to payslips endpoint if statutory endpoint doesn't return records
        await fallbackFetchPayslips();
      }
    } catch (error) {
      console.warn('Statutory API fallback to payslips query:', error);
      await fallbackFetchPayslips();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackFetchPayslips = async () => {
    try {
      const res = await api.get(`/payslips?month=${selectedMonth}&year=${selectedYear}`);
      if (res.data?.success) {
        const slips = res.data.data || [];
        const mapped = slips.map(slip => {
          const emp = slip.employee || {};
          const basic = slip.basicSalary || 0;
          const gross = slip.grossEarnings || basic;
          const eePf = slip.pfDeduction || Math.round(basic * 0.12);
          const erPf = eePf;
          const eeEsi = slip.esiDeduction || (gross <= 21000 ? Math.round(gross * 0.0075) : 0);
          const erEsi = eeEsi > 0 ? Math.round(gross * 0.0325) : 0;
          return {
            id: emp.employeeId || emp._id?.toString()?.substring(0, 8) || 'EMP',
            name: emp.employeeName || emp.username || 'Employee',
            department: emp.department || 'General',
            role: emp.role || 'Staff',
            basic,
            gross,
            paidDays: slip.paidDays || 0,
            uan: emp.uan || 'N/A',
            pfNo: emp.pfNo || 'N/A',
            ipNo: emp.esicNo || 'N/A',
            eePf,
            erPf,
            eeEsi,
            erEsi,
            status: slip.status || 'Draft'
          };
        });
        setRecords(mapped);
      }
    } catch (err) {
      console.error('Error in fallback fetch:', err);
    }
  };

  // Filtered list
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch =
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.uan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ipNo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = departmentFilter === 'All' || r.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [records, searchTerm, departmentFilter]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set();
    records.forEach(r => { if (r.department) set.add(r.department); });
    return Array.from(set);
  }, [records]);

  // Aggregate stats
  const calculatedStats = useMemo(() => {
    const totalEePf = filteredRecords.reduce((acc, r) => acc + (r.eePf || 0), 0);
    const totalErPf = filteredRecords.reduce((acc, r) => acc + (r.erPf || 0), 0);
    const totalPf = totalEePf + totalErPf;

    const totalEeEsi = filteredRecords.reduce((acc, r) => acc + (r.eeEsi || 0), 0);
    const totalErEsi = filteredRecords.reduce((acc, r) => acc + (r.erEsi || 0), 0);
    const totalEsi = totalEeEsi + totalErEsi;

    const pfCount = filteredRecords.filter(r => (r.eePf || 0) > 0).length;
    const esiCount = filteredRecords.filter(r => (r.eeEsi || 0) > 0).length;

    return {
      totalEePf,
      totalErPf,
      totalPf,
      totalEeEsi,
      totalErEsi,
      totalEsi,
      grandTotal: totalPf + totalEsi,
      pfCount,
      esiCount,
      totalStaff: filteredRecords.length
    };
  }, [filteredRecords]);

  // Export EPFO ECR Challan Format (Govt CSV)
  const handleExportECR = () => {
    if (records.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data Available',
        text: `No payroll records found for ${selectedMonth} ${selectedYear}. Please generate payroll first.`,
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    const headers = [
      'UAN',
      'Member Name',
      'Gross Wages',
      'EPF Wages',
      'EPS Wages',
      'EDLI Wages',
      'EE Share (12%)',
      'EPS Share (8.33%)',
      'ER Share Diff (3.67%)',
      'NCP Days',
      'Refund of Advances'
    ];

    const rows = records.map(r => {
      const basic = r.basic || 0;
      const eePf = r.eePf || 0;
      const epsShare = Math.round(Math.min(basic, 15000) * 0.0833);
      const erDiff = Math.max(0, eePf - epsShare);
      return [
        `"${r.uan || ''}"`,
        `"${r.name || ''}"`,
        r.gross || basic,
        basic,
        Math.min(basic, 15000),
        Math.min(basic, 15000),
        eePf,
        epsShare,
        erDiff,
        0,
        0
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EPFO_ECR_Challan_${selectedMonth}_${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: 'ECR Challan Exported',
      text: `EPFO Electronic Challan for ${selectedMonth} ${selectedYear} downloaded successfully.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Export ESIC Return Format CSV
  const handleExportESIC = () => {
    if (records.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data Available',
        text: `No payroll records found for ${selectedMonth} ${selectedYear}.`,
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    const headers = [
      'IP Number (ESIC)',
      'IP Name',
      'No of Days Paid',
      'Total Monthly Wages',
      'EE Share (0.75%)',
      'ER Share (3.25%)',
      'Total ESI Deposit',
      'Reason Code'
    ];

    const rows = records.map(r => [
      `"${r.ipNo || ''}"`,
      `"${r.name || ''}"`,
      r.paidDays || 0,
      r.gross || r.basic || 0,
      r.eeEsi || 0,
      r.erEsi || 0,
      (r.eeEsi || 0) + (r.erEsi || 0),
      0
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ESIC_Return_Challan_${selectedMonth}_${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: 'ESIC Return Exported',
      text: `ESIC Challan data for ${selectedMonth} ${selectedYear} downloaded successfully.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <Landmark size={22} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  PF & ESI Statutory Compliance
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Monthly Compliance
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Generate EPFO ECR challans, ESIC returns, and audit statutory employer/employee liabilities.
                </p>
              </div>
            </div>
          </div>

          {/* Month / Year Selector & Top Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center bg-slate-100/80 border border-slate-200 rounded-xl p-1 gap-1">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m} className="text-slate-800 bg-white">{m}</option>
                ))}
              </select>
              <div className="w-[1px] h-4 bg-slate-300" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                {YEARS.map(y => (
                  <option key={y} value={y} className="text-slate-800 bg-white">{y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchStatutoryData}
              disabled={isLoading}
              title="Refresh Data"
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition shadow-sm"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={handleExportECR}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/60 rounded-xl transition shadow-sm"
            >
              <Download size={14} /> EPFO ECR
            </button>

            <button
              onClick={handleExportESIC}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60 rounded-xl transition shadow-sm"
            >
              <FileSpreadsheet size={14} /> ESIC Challan
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition shadow-sm"
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total PF Liability */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total PF Liability</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ₹{calculatedStats.totalPf.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 font-medium">
              <span>EE: ₹{calculatedStats.totalEePf.toLocaleString()}</span>
              <span>•</span>
              <span>ER: ₹{calculatedStats.totalErPf.toLocaleString()}</span>
              <span className="text-indigo-600 font-semibold">({calculatedStats.pfCount} Staff)</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
        </div>

        {/* Card 2: Total ESI Liability */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total ESI Liability</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              +
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ₹{calculatedStats.totalEsi.toLocaleString()}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 font-medium">
              <span>EE: ₹{calculatedStats.totalEeEsi.toLocaleString()}</span>
              <span>•</span>
              <span>ER: ₹{calculatedStats.totalErEsi.toLocaleString()}</span>
              <span className="text-purple-600 font-semibold">({calculatedStats.esiCount} Staff)</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
        </div>

        {/* Card 3: Combined Statutory Payout */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Combined Govt Dues</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
              ₹{calculatedStats.grandTotal.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              PF (₹{calculatedStats.totalPf.toLocaleString()}) + ESI (₹{calculatedStats.totalEsi.toLocaleString()})
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
        </div>

        {/* Card 4: Govt Filing Due Date */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">EPFO & ESIC Due Date</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-amber-700 tracking-tight">
              15 {selectedMonth.slice(0, 3)} {selectedYear}
            </div>
            <p className="text-[11px] text-amber-600 mt-1 font-medium">
              Mandatory submission deadline
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search by Employee, UAN, ESIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {departments.length > 0 && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none"
              >
                <option value="All">All Departments</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Users size={14} className="text-slate-400" />
            Showing <span className="text-slate-800 font-bold">{filteredRecords.length}</span> Employees
          </div>
        </div>

        {/* Table Matrix */}
        <div className="overflow-x-auto min-h-[250px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-20 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-indigo-600 mb-2" size={28} />
              <p className="text-xs text-indigo-600 font-semibold tracking-wide">Loading statutory records...</p>
            </div>
          )}

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-3">UAN & PF No</th>
                <th className="py-3 px-3">ESIC IP No</th>
                <th className="py-3 px-3 text-right">Basic Wage</th>
                <th className="py-3 px-3 text-right text-indigo-700">EE PF (12%)</th>
                <th className="py-3 px-3 text-right text-indigo-700">ER PF (12%)</th>
                <th className="py-3 px-3 text-right text-purple-700">EE ESI (0.75%)</th>
                <th className="py-3 px-3 text-right text-purple-700">ER ESI (3.25%)</th>
                <th className="py-3 px-4 text-right text-slate-900">Total Liability</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r, idx) => {
                  const empPfTotal = (r.eePf || 0) + (r.erPf || 0);
                  const empEsiTotal = (r.eeEsi || 0) + (r.erEsi || 0);
                  const totalLiability = empPfTotal + empEsiTotal;

                  return (
                    <tr key={r.id || idx} className="hover:bg-indigo-50/20 transition group">
                      {/* Employee Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-indigo-100">
                            {r.name?.charAt(0)?.toUpperCase() || 'E'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                              {r.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {r.id} • {r.department}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* UAN & PF No */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-800 font-semibold">{r.uan || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.pfNo !== 'N/A' ? r.pfNo : ''}</div>
                      </td>

                      {/* ESIC IP No */}
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-800 font-semibold">{r.ipNo || 'N/A'}</div>
                      </td>

                      {/* Basic Wage */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                        ₹{(r.basic || 0).toLocaleString()}
                      </td>

                      {/* EE PF Share */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700">
                        ₹{(r.eePf || 0).toLocaleString()}
                      </td>

                      {/* ER PF Share */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-900">
                        ₹{(r.erPf || 0).toLocaleString()}
                      </td>

                      {/* EE ESI Share */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-purple-700">
                        ₹{(r.eeEsi || 0).toLocaleString()}
                      </td>

                      {/* ER ESI Share */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-purple-900">
                        ₹{(r.erEsi || 0).toLocaleString()}
                      </td>

                      {/* Total Statutory Liability */}
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                        ₹{totalLiability.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {r.status === 'Completed' ? '✓ Completed' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <FileText size={24} />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">
                        No statutory records found for {selectedMonth} {selectedYear}
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Please generate monthly payroll in the{' '}
                        <a href="/hrms/payroll/slips" className="text-indigo-600 hover:underline font-bold">
                          Salary Slips
                        </a>{' '}
                        page to see statutory PF & ESI calculations.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table Footer with Summary */}
            {filteredRecords.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-slate-900">
                  <td colSpan="4" className="py-3 px-4 uppercase text-[11px] tracking-wider">
                    Total Compliance Liabilities ({filteredRecords.length} Staff)
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-700">
                    ₹{calculatedStats.totalEePf.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-indigo-900">
                    ₹{calculatedStats.totalErPf.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-purple-700">
                    ₹{calculatedStats.totalEeEsi.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-purple-900">
                    ₹{calculatedStats.totalErEsi.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                    ₹{calculatedStats.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default PfEsiReports;
