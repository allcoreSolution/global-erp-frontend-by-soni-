import React, { useState, useEffect } from 'react';
import { Landmark, Printer, Download, FileText, Check, ArrowDownToLine, RefreshCw, Loader2 } from 'lucide-react';
import api from '../../api';

const PfEsiReports = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPayslips();
  }, [selectedMonth, selectedYear]);

  const fetchPayslips = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payslips');
      if (res.data?.success) {
        const allSlips = res.data.data || [];
        const filtered = allSlips.filter(slip => slip.month === selectedMonth && slip.year === selectedYear);
        
        const mappedRecords = filtered.map(slip => {
          return {
            id: slip.employee?.employeeId || slip.employee?._id?.substring(0, 8) || 'Unknown',
            name: slip.employee?.employeeName || slip.employee?.username || 'Unknown',
            basic: slip.earnings?.basicSalary || slip.basicSalary || 0,
            eePf: slip.deductions?.pfDeduction || slip.pfDeduction || 0,
            erPf: slip.deductions?.pfDeduction || slip.pfDeduction || 0, 
            eeEsi: slip.deductions?.esiDeduction || slip.esiDeduction || 0,
            erEsi: (slip.deductions?.esiDeduction || slip.esiDeduction) > 0 ? Math.round(((slip.deductions?.esiDeduction || slip.esiDeduction) / 0.75) * 3.25) : 0,
            uan: slip.employee?.uan || '--',
            ipNo: slip.employee?.esicNo || '--'
          };
        });
        setRecords(mappedRecords);
      }
    } catch (error) {
      console.error('Error fetching PF/ESI records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalPf: records.reduce((acc, r) => acc + r.eePf + r.erPf, 0),
    totalEsi: records.reduce((acc, r) => acc + r.eeEsi + r.erEsi, 0),
    enrolledEmployees: records.length,
    pfEnrolled: records.filter(r => r.eePf > 0).length,
    esiEnrolled: records.filter(r => r.eeEsi > 0).length
  };

  const handleExportECR = () => {
    const headers = ['UAN', 'Member Name', 'Gross Wages', 'EPF Wages', 'EPS Wages', 'EDLI Wages', 'EPF Share EE', 'EPS Share ER', 'EPF Share ER Diff', 'NCP Days', 'Refunds'];
    const rows = records.map(r => [r.uan, r.name, r.basic, r.basic, r.basic, r.basic, r.eePf, Math.round(r.basic * 0.0833), Math.round(r.eePf - (r.basic * 0.0833)), 0, 0]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PF_ECR_Challan_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Landmark className="text-indigo-600" size={24} /> PF & ESI Statutory Compliance Report
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Generate monthly Provident Fund (EPFO ECR) files, Employee State Insurance (ESIC) summaries, and statutory payroll logs.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 no-print">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs p-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-slate-800"
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="text-xs p-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-slate-800"
          >
            {['2025', '2026', '2027'].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button 
            onClick={handleExportECR}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded-lg transition"
          >
            <Download size={14} /> Download ECR
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Enrolled Members</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-700 mt-1">{stats.enrolledEmployees}</div>
          </div>
          <div className="bg-blue-100 text-indigo-600 p-2.5 rounded-lg">
            <RefreshCw size={18} />
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Total Monthly PF</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-1">₹{stats.totalPf.toLocaleString()}</div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <Landmark size={18} />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-purple-700 uppercase">Total Monthly ESI</div>
            <div className="text-xl font-bold text-purple-800 dark:text-purple-400 mt-1">₹{stats.totalEsi.toLocaleString()}</div>
          </div>
          <div className="bg-purple-100 text-purple-600 p-2.5 rounded-lg">
            <Landmark size={18} />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase">Filing Due Date</div>
            <div className="text-xs font-bold text-amber-800 dark:text-amber-400 mt-1.5">15-{selectedMonth.slice(0,3)}-{selectedYear}</div>
          </div>
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
            <FileText size={18} />
          </div>
        </div>

      </div>

      {/* PF & ESI Details Table Matrix */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">PF & ESI Monthly Sheet Ledger: {selectedMonth} {selectedYear}</h3>
        </div>
        <div className="overflow-x-auto min-h-[200px] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-indigo-600 mb-2" size={24} />
              <p className="text-xs text-indigo-600 font-medium">Fetching Records...</p>
            </div>
          )}
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3 text-right">Basic Wage (₹)</th>
                <th className="p-3">UAN Number</th>
                <th className="p-3 text-right text-emerald-600">EE PF Share (12%)</th>
                <th className="p-3 text-right text-indigo-600">ER PF Share (12%)</th>
                <th className="p-3">ESI IP Number</th>
                <th className="p-3 text-right text-purple-600">EE ESI (0.75%)</th>
                <th className="p-3 text-right text-indigo-600">ER ESI (3.25%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length > 0 ? records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/30 font-medium">
                  <td className="p-3 font-semibold text-gray-800">{r.id}</td>
                  <td className="p-3 text-slate-800 font-bold">{r.name}</td>
                  <td className="p-3 text-right font-mono">₹{r.basic.toLocaleString()}</td>
                  <td className="p-3 font-mono text-gray-600">{r.uan}</td>
                  <td className="p-3 text-right font-mono text-emerald-600">₹{r.eePf.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-indigo-600">₹{r.erPf.toLocaleString()}</td>
                  <td className="p-3 font-mono text-gray-600">{r.ipNo}</td>
                  <td className="p-3 text-right font-mono text-purple-600">₹{r.eeEsi.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-indigo-600">₹{r.erEsi.toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-400">
                    No PF/ESI data available for {selectedMonth} {selectedYear}. Please generate Salary Slips first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PfEsiReports;
