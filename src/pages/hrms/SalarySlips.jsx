import React, { useState, useEffect } from 'react';
import { Landmark, Printer, Download, FileText, Check, ChevronRight, X, User, Calendar, Settings, LayoutTemplate, Plus, Trash2, Eye, List } from 'lucide-react';
import api from '../../api';

const SalarySlips = () => {
  const [view, setView] = useState('list'); // 'list' | 'generate'
  
  // Data State
  const [employees, setEmployees] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedTemplate, setSelectedTemplate] = useState('6');
  
  // Active Payslip Preview
  const [previewData, setPreviewData] = useState(null);

  const templates = [
    { id: '6', name: 'Modern Elegant Pro' },
    { id: '1', name: 'Standard Corporate' },
    { id: '2', name: 'Classic Retro Simple' },
    { id: '3', name: 'Minimalist Modern' },
    { id: '4', name: 'Executive Premium' },
    { id: '5', name: 'Compact Pocket Slip' }
  ];

  useEffect(() => {
    if (view === 'list') {
      fetchPayslips();
    } else if (view === 'generate' && employees.length === 0) {
      fetchEmployees();
    }
  }, [view]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees'); // Adjust endpoint if needed (e.g., /users?role=employee)
      if (res.data?.success) {
        setEmployees(res.data.data || []);
        if (res.data.data?.length > 0) setSelectedEmployeeId(res.data.data[0]._id);
      } else {
        // Fallback for Users api if /employees doesn't exist
        const usersRes = await api.get('/users');
        if (usersRes.data?.success) {
          setEmployees(usersRes.data.data || []);
          if (usersRes.data.data?.length > 0) setSelectedEmployeeId(usersRes.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const fetchPayslips = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payslips');
      if (res.data?.success) {
        setPayslips(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch payslips", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePreview = async () => {
    if (!selectedEmployeeId) {
      alert("Please select an employee first");
      return;
    }
    
    setIsPreviewLoading(true);
    try {
      const res = await api.get('/payslips/preview', {
        params: { employeeId: selectedEmployeeId, month: selectedMonth, year: selectedYear }
      });
      if (res.data?.success) {
        setPreviewData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to generate preview", error);
      alert("Failed to generate preview. " + (error.response?.data?.message || error.message));
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSavePayslip = async () => {
    if (!previewData) return;
    
    try {
      const payload = {
        employee: previewData.employee.id,
        month: previewData.month,
        year: previewData.year,
        workingDays: previewData.workingDays,
        paidDays: previewData.paidDays,
        basicSalary: previewData.earnings.basicSalary,
        hra: previewData.earnings.hra,
        da: previewData.earnings.da,
        otherAllowances: previewData.earnings.otherAllowances,
        pfDeduction: previewData.deductions.pfDeduction,
        esiDeduction: previewData.deductions.esiDeduction,
        loanDeduction: previewData.deductions.loanDeduction,
        grossEarnings: previewData.totals.grossEarnings,
        totalDeductions: previewData.totals.totalDeductions,
        netPay: previewData.totals.netPay,
        status: 'Generated'
      };
      
      await api.post('/payslips', payload);
      alert("Payslip generated and saved successfully!");
      setView('list');
    } catch (error) {
      console.error("Failed to save payslip", error);
      alert("Failed to save payslip. " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payslip?")) return;
    try {
      await api.delete(`/payslips/${id}`);
      setPayslips(payslips.filter(p => p._id !== id));
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete payslip.");
    }
  };

  const viewPayslip = (slip) => {
    setPreviewData({
      employee: {
        id: slip.employee?._id,
        name: slip.employee?.employeeName || slip.employee?.username || 'Unknown',
        email: slip.employee?.email || '',
        department: slip.employee?.department?.name || 'N/A',
        designation: slip.employee?.designation?.title || 'N/A'
      },
      month: slip.month,
      year: slip.year,
      workingDays: slip.workingDays || 30,
      paidDays: slip.paidDays || 30,
      earnings: {
        basicSalary: slip.basicSalary || 0,
        hra: slip.hra || 0,
        da: slip.da || 0,
        otherAllowances: slip.otherAllowances || 0
      },
      deductions: {
        pfDeduction: slip.pfDeduction || 0,
        esiDeduction: slip.esiDeduction || 0,
        loanDeduction: slip.loanDeduction || 0
      },
      totals: {
        grossEarnings: slip.grossEarnings || 0,
        totalDeductions: slip.totalDeductions || 0,
        netPay: slip.netPay || 0
      }
    });
    setSelectedMonth(slip.month);
    setSelectedYear(slip.year);
    if (slip.employee?._id) setSelectedEmployeeId(slip.employee._id);
    setView('generate');
  };

  const numberToWords = (num) => {
    return `Rupees ${num.toLocaleString('en-IN')} Only`; // Simplified for the demo
  };

  const handlePrint = () => {
    window.print();
  };

  // Create a dummy fallback if previewData is null so templates always show
  const activeSlip = previewData || {
    employee: {
      id: selectedEmployeeId || 'EMP-001',
      name: employees.find(e => e._id === selectedEmployeeId)?.username || 'Employee Name',
      department: 'Department',
      designation: 'Designation'
    },
    month: selectedMonth,
    year: selectedYear,
    workingDays: 30,
    paidDays: 30,
    earnings: { basicSalary: 15000, hra: 5000, da: 2000, otherAllowances: 3000 },
    deductions: { pfDeduction: 1800, esiDeduction: 200, loanDeduction: 0 },
    totals: { grossEarnings: 25000, totalDeductions: 2000, netPay: 23000 }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-indigo-600" size={28} /> Salary Pay Slip Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate and customize monthly salary slips, print spooling, and PDF download support.
          </p>
        </div>
        <div className="flex gap-2">
           {view === 'generate' ? (
             <button onClick={() => setView('list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
               Back to List
             </button>
           ) : (
             <button onClick={() => { setPreviewData(null); setView('generate'); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md">
               <Plus size={16} /> Generate New Payslip
             </button>
           )}
        </div>
      </div>

      {view === 'list' ? (
        // LIST VIEW
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b text-slate-600 font-semibold">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Period</th>
                <th className="p-3">Gross Salary</th>
                <th className="p-3">Net Pay</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-500">Loading payslips...</td></tr>
              ) : payslips.length === 0 ? (
                <tr><td colSpan="6" className="p-4 text-center text-slate-500">No payslips found.</td></tr>
              ) : (
                payslips.map((slip) => (
                  <tr key={slip._id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-700">
                      {slip.employee?.employeeName || slip.employee?.username || 'Unknown'}
                      <div className="text-[10px] text-slate-500">{slip.employee?.email}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-800">{slip.month} {slip.year}</td>
                    <td className="p-3 text-slate-600 font-semibold">₹{slip.grossEarnings?.toLocaleString('en-IN') || 0}</td>
                    <td className="p-3 text-indigo-600 font-bold">₹{slip.netPay?.toLocaleString('en-IN') || 0}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-[10px] rounded font-bold ${slip.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {slip.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => viewPayslip(slip)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded mr-1" title="View & Print">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDelete(slip._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // GENERATE VIEW
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Side Controller Panel */}
          <div className="w-full lg:w-96 bg-white shadow-xl shadow-indigo-100/40 border border-indigo-100/60 p-6 rounded-2xl shrink-0 space-y-6 no-print">
            
            <div className="flex items-center gap-2 text-indigo-900 border-b border-indigo-50 pb-3">
               <Settings className="text-indigo-600" size={20} />
               <h3 className="text-sm font-bold uppercase tracking-wider">Selection & Config</h3>
            </div>

            <div className="space-y-5 text-sm font-semibold text-slate-700">
              {/* Choose Employee */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-slate-500 text-xs uppercase tracking-wide"><User size={14}/> Select Employee</label>
                <div className="relative">
                  <select 
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all"
                  >
                    <option value="">-- Select Employee --</option>
                    {employees.map(e => (
                      <option key={e._id} value={e._id}>{e.username || e.name}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-3 top-3 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Choose Period */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-slate-500 text-xs uppercase tracking-wide"><Calendar size={14}/> Payroll Period</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-3 top-3 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                  <div className="relative w-28">
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none transition-all"
                    >
                      {['2025', '2026', '2027'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <ChevronRight size={16} className="absolute right-3 top-3 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Choose Template Grade */}
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-slate-500 text-xs uppercase tracking-wide"><LayoutTemplate size={14}/> Payslip Template</label>
                <div className="grid grid-cols-1 gap-2">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all text-sm font-bold ${
                        selectedTemplate === t.id 
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm shadow-indigo-100' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedTemplate === t.id ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                        {t.name}
                      </div>
                      {selectedTemplate === t.id && <Check size={16} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-3">
                <button 
                  onClick={handleGeneratePreview}
                  disabled={isPreviewLoading}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow transition-all disabled:opacity-50"
                >
                  {isPreviewLoading ? 'Calculating...' : 'Calculate & Preview'}
                </button>

                {previewData && (
                  <>
                    <button 
                      onClick={handleSavePayslip}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={18} /> Save Payslip
                    </button>
                    <button 
                      onClick={handlePrint}
                      className="w-full py-2.5 border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Printer size={18} /> Print / Download PDF
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Live Preview Panel */}
          <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/5 border border-slate-200/50 p-4 sm:p-8 rounded-2xl flex justify-center overflow-y-auto min-h-[600px]">
            
            <div id="print-area" className="bg-white text-slate-800 p-8 shadow-sm border border-slate-200 rounded-xl w-full max-w-[700px] font-sans text-xs leading-relaxed h-max relative">
              
              {!previewData && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
                  <div className="bg-white p-4 rounded-lg shadow-lg text-center border border-slate-200">
                    <p className="font-bold text-slate-700">Preview Mode</p>
                    <p className="text-xs text-slate-500">Click "Calculate & Preview" for real values</p>
                  </div>
                </div>
              )}
              
              {/* 6. MODERN ELEGANT PRO TEMPLATE */}
              {selectedTemplate === '6' && (
                <div className="space-y-6">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start pb-6 border-b-2 border-indigo-100">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-md">
                         A
                       </div>
                       <div>
                         <h2 className="text-xl font-black text-slate-900 tracking-tight">ALLCORE SOLUTION</h2>
                         <p className="text-[10px] text-slate-500 mt-0.5">Corporate HQ: Mumbai | GSTIN: 27AAAAA0000A1Z2</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-[10px] font-bold text-indigo-500 tracking-widest uppercase mb-1">Pay Slip For</div>
                       <div className="text-lg font-black text-slate-800 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 inline-block">
                         {activeSlip.month.toUpperCase()} {activeSlip.year}
                       </div>
                    </div>
                  </div>

                  {/* Employee Details Grid */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Employee Name:</span>
                        <span className="font-bold text-slate-800">{activeSlip.employee?.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Employee ID:</span>
                        <span className="font-bold text-slate-800">{activeSlip.employee?.id || activeSlip.employee?._id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Designation:</span>
                        <span className="font-bold text-slate-800">{activeSlip.employee?.designation}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-bold text-slate-800">{activeSlip.employee?.department}</span>
                      </div>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Bank Details:</span>
                        <span className="font-bold text-slate-800">Primary Account</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Account No:</span>
                        <span className="font-bold text-slate-800">XXXX XXXX</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Working Days:</span>
                        <span className="font-bold text-slate-800">{activeSlip.workingDays}</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-slate-500">Loss of Pay (Days):</span>
                        <span className="font-bold text-rose-600">{Math.max(0, activeSlip.workingDays - activeSlip.paidDays)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Earnings & Deductions Tables */}
                  <div className="grid grid-cols-2 gap-0 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    
                    {/* Earnings */}
                    <div className="border-r border-slate-200">
                      <div className="bg-indigo-50/50 p-3 border-b border-slate-200 font-bold text-indigo-900 tracking-wider text-[11px] uppercase">
                        Earnings
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Basic Salary</span>
                          <span className="font-bold text-slate-800">₹{activeSlip.earnings.basicSalary?.toLocaleString('en-IN') || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">House Rent Allowance (HRA)</span>
                          <span className="font-bold text-slate-800">₹{activeSlip.earnings.hra?.toLocaleString('en-IN') || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Dearness Allowance (DA)</span>
                          <span className="font-bold text-slate-800">₹{activeSlip.earnings.da?.toLocaleString('en-IN') || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Special Allowances</span>
                          <span className="font-bold text-slate-800">₹{activeSlip.earnings.otherAllowances?.toLocaleString('en-IN') || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div>
                      <div className="bg-rose-50/50 p-3 border-b border-slate-200 font-bold text-rose-900 tracking-wider text-[11px] uppercase">
                        Deductions
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Provident Fund (PF)</span>
                          <span className="font-bold text-rose-600">₹{activeSlip.deductions.pfDeduction?.toLocaleString('en-IN') || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">ESI Contribution</span>
                          <span className="font-bold text-rose-600">₹{activeSlip.deductions.esiDeduction?.toLocaleString('en-IN') || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Loan / Advance</span>
                          <span className="font-bold text-rose-600">₹{activeSlip.deductions.loanDeduction?.toLocaleString('en-IN') || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Totals Row */}
                    <div className="bg-slate-50 border-t border-slate-200 p-3 font-bold text-xs flex justify-between border-r">
                      <span className="text-slate-600">Total Earnings</span>
                      <span className="text-slate-900 text-sm">₹{activeSlip.totals.grossEarnings?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="bg-slate-50 border-t border-slate-200 p-3 font-bold text-xs flex justify-between">
                      <span className="text-slate-600">Total Deductions</span>
                      <span className="text-rose-600 text-sm">₹{activeSlip.totals.totalDeductions?.toLocaleString('en-IN') || 0}</span>
                    </div>

                  </div>

                  {/* Net Pay Box */}
                  <div className="bg-indigo-600 text-white p-5 rounded-xl flex items-center justify-between shadow-lg shadow-indigo-200">
                    <div>
                      <div className="text-indigo-200 font-medium text-xs tracking-wide uppercase mb-1">Net Pay for the month</div>
                      <div className="text-sm font-medium">{numberToWords(activeSlip.totals.netPay || 0)}</div>
                    </div>
                    <div className="text-3xl font-black tracking-tight">
                      ₹{(activeSlip.totals.netPay || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between pt-16 px-4">
                    <div className="text-center w-40">
                      <div className="border-t-2 border-slate-200 pt-2 text-xs font-bold text-slate-500 uppercase tracking-wide">Employer Signature</div>
                    </div>
                    <div className="text-center w-40">
                      <div className="border-t-2 border-slate-200 pt-2 text-xs font-bold text-slate-500 uppercase tracking-wide">Employee Signature</div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-8 text-[9px] text-slate-400">
                    This is a system generated payslip and does not require a physical signature.
                  </div>

                </div>
              )}


              {/* 1. STANDARD CORPORATE TEMPLATE */}
              {selectedTemplate === '1' && (
                <div className="space-y-4">
                  <div className="text-center border-b-2 pb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider">ALLCORE SOLUTION PVT. LTD.</h2>
                    <p className="text-[10px] text-gray-500">Corporate HQ: Mumbai, Maharashtra | GSTIN: 27AAAAA0000A1Z2</p>
                    <h3 className="text-xs font-bold mt-2 bg-slate-100 px-3 py-1 rounded inline-block text-slate-700">SALARY SLIP FOR {activeSlip.month.toUpperCase()} {activeSlip.year}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[10px] border-b pb-3">
                    <div className="space-y-1">
                      <p><strong>Employee Name:</strong> {activeSlip.employee?.name}</p>
                      <p><strong>Employee ID:</strong> {activeSlip.employee?.id}</p>
                      <p><strong>Designation:</strong> {activeSlip.employee?.designation}</p>
                      <p><strong>Department:</strong> {activeSlip.employee?.department}</p>
                    </div>
                    <div className="space-y-1">
                      <p><strong>Bank Account:</strong> Primary Account</p>
                      <p><strong>LOP / Paid Days:</strong> {Math.max(0, activeSlip.workingDays - activeSlip.paidDays)} / {activeSlip.paidDays} Days</p>
                      <p><strong>Working Days:</strong> {activeSlip.workingDays} Days</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border border-gray-200 divide-x text-[10px]">
                    {/* Earnings Column */}
                    <div>
                      <div className="bg-slate-50 font-bold p-2 border-b">EARNINGS</div>
                      <div className="p-2 space-y-1.5">
                        <div className="flex justify-between"><span>Basic Salary:</span><span>₹{activeSlip.earnings.basicSalary?.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between"><span>HRA Allowance:</span><span>₹{activeSlip.earnings.hra?.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between"><span>DA Allowance:</span><span>₹{activeSlip.earnings.da?.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between"><span>Special Allowances:</span><span>₹{activeSlip.earnings.otherAllowances?.toLocaleString('en-IN')}</span></div>
                      </div>
                    </div>
                    {/* Deductions Column */}
                    <div>
                      <div className="bg-slate-50 font-bold p-2 border-b">DEDUCTIONS</div>
                      <div className="p-2 space-y-1.5">
                        <div className="flex justify-between"><span>PF Contribution:</span><span>₹{activeSlip.deductions.pfDeduction?.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between"><span>ESI Contribution:</span><span>₹{activeSlip.deductions.esiDeduction?.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between"><span>Loan / Advance Deduction:</span><span>₹{activeSlip.deductions.loanDeduction?.toLocaleString('en-IN')}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border border-t-0 border-gray-200 divide-x text-[10px] font-bold">
                    <div className="flex justify-between p-2"><span>Gross Earnings:</span><span>₹{activeSlip.totals.grossEarnings?.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between p-2"><span>Total Deductions:</span><span>₹{activeSlip.totals.totalDeductions?.toLocaleString('en-IN')}</span></div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center text-xs font-bold text-blue-900 mt-4">
                    <span>NET TAKE-HOME PAYABLE:</span>
                    <span className="text-sm font-extrabold">₹{activeSlip.totals.netPay?.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between pt-12 text-[9px] text-gray-500">
                    <div className="text-center border-t border-dashed w-32 pt-1">Employee Signature</div>
                    <div className="text-center border-t border-dashed w-32 pt-1">Authorised Signatory</div>
                  </div>
                </div>
              )}

              {/* 2. CLASSIC RETRO SIMPLE */}
              {selectedTemplate === '2' && (
                <div className="border-4 double border-double border-slate-200 p-4 space-y-3 font-mono text-[10px]">
                  <div className="text-center border-b pb-2">
                    <h2 className="text-xs font-bold">ALLCORE SOLUTION SALARY SHEET</h2>
                    <p>PAY PERIOD: {activeSlip.month} {activeSlip.year}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p>EMP: {activeSlip.employee?.name} | ROLE: {activeSlip.employee?.designation}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>Basic Pay:</span><span>₹{activeSlip.earnings.basicSalary}</span></div>
                    <div className="flex justify-between"><span>HRA:</span><span>₹{activeSlip.earnings.hra}</span></div>
                    <div className="flex justify-between"><span>DA:</span><span>₹{activeSlip.earnings.da}</span></div>
                    <div className="flex justify-between"><span>Allowances:</span><span>₹{activeSlip.earnings.otherAllowances}</span></div>
                    <div className="flex justify-between border-t border-dashed pt-1 text-rose-600"><span>Deductions Total (PF/ESI/Loan):</span><span>-₹{activeSlip.totals.totalDeductions}</span></div>
                    <div className="flex justify-between border-t font-bold text-xs pt-1"><span>NET PAY:</span><span>₹{activeSlip.totals.netPay}</span></div>
                  </div>
                </div>
              )}

              {/* 3. MINIMALIST MODERN */}
              {selectedTemplate === '3' && (
                <div className="space-y-6 font-sans text-xs">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h2 className="text-sm font-extrabold text-indigo-600 uppercase">Allcore Solution</h2>
                      <span className="text-[10px] text-gray-400">Payroll Division</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">SALARY SLIP</span>
                      <strong className="text-gray-800 font-bold">{activeSlip.month} {activeSlip.year}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-600 bg-slate-50 p-3 rounded-lg">
                    <div>
                      <span className="text-gray-400 font-bold block mb-0.5">EMPLOYEE</span>
                      <strong>{activeSlip.employee?.name}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block mb-0.5">DESIGNATION</span>
                      <strong>{activeSlip.employee?.designation}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 font-bold block mb-0.5">PAYMENT MODE</span>
                      <strong>Bank Transfer</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-1 font-bold text-gray-400 text-[10px]">
                      <span>PARTICULARS</span>
                      <span>AMOUNT (₹)</span>
                    </div>
                    <div className="flex justify-between"><span>Basic Salary</span><span>₹{activeSlip.earnings.basicSalary}</span></div>
                    <div className="flex justify-between"><span>House Rent Allowance (HRA)</span><span>₹{activeSlip.earnings.hra}</span></div>
                    <div className="flex justify-between"><span>Dearness Allowance (DA)</span><span>₹{activeSlip.earnings.da}</span></div>
                    <div className="flex justify-between text-rose-500"><span>PF Deduction</span><span>-₹{activeSlip.deductions.pfDeduction}</span></div>
                    {activeSlip.deductions.esiDeduction > 0 && <div className="flex justify-between text-rose-500"><span>ESI Contribution</span><span>-₹{activeSlip.deductions.esiDeduction}</span></div>}
                    {activeSlip.deductions.loanDeduction > 0 && <div className="flex justify-between text-rose-500"><span>Loan installment</span><span>-₹{activeSlip.deductions.loanDeduction}</span></div>}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t font-bold">
                    <span className="text-slate-800">Net Take-Home Payable:</span>
                    <span className="text-base text-indigo-600 font-black">₹{activeSlip.totals.netPay?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* 4. EXECUTIVE PREMIUM (DARK THEME TITLE) */}
              {selectedTemplate === '4' && (
                <div className="space-y-4 font-sans text-xs">
                  <div className="bg-slate-50/50 shadow-inner border border-slate-200 text-slate-800 p-4 rounded-t-lg flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-blue-400">Allcore Executive Slip</h2>
                      <p className="text-[9px] text-gray-300">Confidential Salary Statement</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold bg-indigo-600 px-2 py-0.5 rounded text-slate-800">{activeSlip.month} {activeSlip.year}</span>
                    </div>
                  </div>

                  <div className="p-4 border border-t-0 rounded-b-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-[10px] bg-slate-50 p-2.5 rounded">
                      <p><strong>Employee:</strong> {activeSlip.employee?.name} ({activeSlip.employee?.id})</p>
                      <p className="text-right"><strong>Role:</strong> {activeSlip.employee?.designation}</p>
                    </div>

                    <table className="w-full text-left text-[10px]">
                      <thead>
                        <tr className="border-b font-bold text-gray-500">
                          <th className="py-1">Salary Heads</th>
                          <th className="py-1 text-right">Earnings</th>
                          <th className="py-1 text-right text-rose-600">Deductions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-1.5 font-semibold">Basic Pay Structure</td>
                          <td className="py-1.5 text-right font-mono">₹{activeSlip.earnings.basicSalary}</td>
                          <td className="py-1.5 text-right">--</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1.5 font-semibold">HRA & DA Allowances</td>
                          <td className="py-1.5 text-right font-mono">₹{activeSlip.earnings.hra + activeSlip.earnings.da}</td>
                          <td className="py-1.5 text-right">--</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-1.5 font-semibold">PF & ESI Deductibles</td>
                          <td className="py-1.5 text-right">--</td>
                          <td className="py-1.5 text-right font-mono text-rose-600">₹{activeSlip.deductions.pfDeduction + activeSlip.deductions.esiDeduction}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-between font-bold text-xs pt-2">
                      <span>Final Salary Disbursed (Net):</span>
                      <span className="text-slate-900 border-b-2 border-blue-600 pb-0.5">₹{activeSlip.totals.netPay}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. COMPACT POCKET SLIP */}
              {selectedTemplate === '5' && (
                <div className="max-w-[210px] mx-auto text-center space-y-2 font-mono text-[9px] leading-tight">
                  <div className="border-b border-dashed pb-1.5">
                    <h4 className="font-bold uppercase text-[10px]">ALLCORE PAY</h4>
                    <p>SLIP: {activeSlip.month.slice(0, 3)}-{activeSlip.year}</p>
                  </div>
                  <div className="text-left space-y-0.5 border-b border-dashed pb-1.5">
                    <p>EMP: {activeSlip.employee?.name?.split(' ')[0]}</p>
                    <p>DEPT: {activeSlip.employee?.department?.split(' ')[0]}</p>
                  </div>
                  <div className="text-left space-y-0.5">
                    <div className="flex justify-between"><span>BASIC:</span><span>₹{activeSlip.earnings.basicSalary}</span></div>
                    <div className="flex justify-between"><span>ALLOWANCES:</span><span>₹{activeSlip.earnings.hra + activeSlip.earnings.da + activeSlip.earnings.otherAllowances}</span></div>
                    <div className="flex justify-between text-slate-500"><span>DED:</span><span>-₹{activeSlip.totals.totalDeductions}</span></div>
                    <div className="flex justify-between text-[10px] border-t border-dashed pt-0.5 font-black"><span>NET DISB:</span><span>₹{activeSlip.totals.netPay}</span></div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* PRINT SCALED ONLY INJECTOR */}
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
