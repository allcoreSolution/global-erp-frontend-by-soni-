import React, { useState } from 'react';
import { Landmark, Printer, Download, FileText, Check, ChevronRight, X, User, Calendar, Settings, LayoutTemplate } from 'lucide-react';

const SalarySlips = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('EMP-001');
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedTemplate, setSelectedTemplate] = useState('6'); // Default to the new modern template

  const employees = [
    { id: 'EMP-001', name: 'Vikram Singh', role: 'Technical Lead', dept: 'IT Department', bank: 'HDFC Bank', acNo: '50100439281', basic: 60000, hra: 24000, da: 12000, allowance: 15000, pf: 7200, esi: 0, loan: 2000, workingDays: 31, paidDays: 30 },
    { id: 'EMP-002', name: 'Neha Gupta', role: 'Sales Lead', dept: 'Marketing Dept', bank: 'ICICI Bank', acNo: '00230156782', basic: 30000, hra: 12000, da: 6000, allowance: 8000, pf: 3600, esi: 350, loan: 0, workingDays: 31, paidDays: 31 },
    { id: 'EMP-003', name: 'Rajesh Kumar', role: 'Operator', dept: 'Production Dept', bank: 'SBI Bank', acNo: '31049281729', basic: 15000, hra: 6000, da: 3000, allowance: 4000, pf: 1800, esi: 250, loan: 500, workingDays: 31, paidDays: 28 },
    { id: 'EMP-004', name: 'Priya Patel', role: 'UI/UX Designer', dept: 'Creative Dept', bank: 'HDFC Bank', acNo: '50100782631', basic: 40000, hra: 16000, da: 8000, allowance: 10000, pf: 4800, esi: 0, loan: 0, workingDays: 31, paidDays: 31 },
    { id: 'EMP-005', name: 'Amit Sharma', role: 'Senior Accountant', dept: 'Accounts Dept', bank: 'AXIS Bank', acNo: '91202873619', basic: 35000, hra: 14000, da: 7000, allowance: 8000, pf: 4200, esi: 0, loan: 1500, workingDays: 31, paidDays: 30 }
  ];

  const templates = [
    { id: '6', name: 'Modern Elegant Pro' },
    { id: '1', name: 'Standard Corporate' },
    { id: '2', name: 'Classic Retro Simple' },
    { id: '3', name: 'Minimalist Modern' },
    { id: '4', name: 'Executive Premium' },
    { id: '5', name: 'Compact Pocket Slip' }
  ];

  const activeEmp = employees.find(e => e.id === selectedEmployeeId) || employees[0];

  // Calculations
  const getEarnings = () => activeEmp.basic + activeEmp.hra + activeEmp.da + activeEmp.allowance;
  const getDeductions = () => activeEmp.pf + activeEmp.esi + activeEmp.loan;
  const getNetPay = () => getEarnings() - getDeductions();

  // Number to words for the new template
  const numberToWords = (num) => {
    return `Rupees ${num.toLocaleString()} Only`; // Simplified for the demo
  };

  const handlePrint = () => {
    window.print();
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
            Generate and customize monthly salary slips with beautiful templates, print spooling, and PDF download support.
          </p>
        </div>
      </div>

      {/* Main Container splits into Side Selector & Template View */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side Controller Panel (MODERNIZED) */}
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
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} - {e.role}</option>
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
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button 
                onClick={handlePrint}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                <Printer size={18} /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Live Preview Panel */}
        <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/5 border border-slate-200/50 p-4 sm:p-8 rounded-2xl flex justify-center overflow-y-auto">
          
          <div id="print-area" className="bg-white text-slate-800 p-8 shadow-sm border border-slate-200 rounded-xl w-full max-w-[700px] font-sans text-xs leading-relaxed">
            
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
                       {selectedMonth.toUpperCase()} {selectedYear}
                     </div>
                  </div>
                </div>

                {/* Employee Details Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Employee Name:</span>
                      <span className="font-bold text-slate-800">{activeEmp.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Employee ID:</span>
                      <span className="font-bold text-slate-800">{activeEmp.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Designation:</span>
                      <span className="font-bold text-slate-800">{activeEmp.role}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-bold text-slate-800">{activeEmp.dept}</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Bank Details:</span>
                      <span className="font-bold text-slate-800">{activeEmp.bank}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Account No:</span>
                      <span className="font-bold text-slate-800">{activeEmp.acNo}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Working Days:</span>
                      <span className="font-bold text-slate-800">{activeEmp.workingDays}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-500">Loss of Pay (Days):</span>
                      <span className="font-bold text-rose-600">{activeEmp.workingDays - activeEmp.paidDays}</span>
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
                        <span className="font-bold text-slate-800">₹{activeEmp.basic.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">House Rent Allowance (HRA)</span>
                        <span className="font-bold text-slate-800">₹{activeEmp.hra.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Dearness Allowance (DA)</span>
                        <span className="font-bold text-slate-800">₹{activeEmp.da.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Special Allowances</span>
                        <span className="font-bold text-slate-800">₹{activeEmp.allowance.toLocaleString()}</span>
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
                        <span className="font-bold text-rose-600">₹{activeEmp.pf.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">ESI Contribution</span>
                        <span className="font-bold text-rose-600">₹{activeEmp.esi.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Loan / Advance</span>
                        <span className="font-bold text-rose-600">₹{activeEmp.loan.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Totals Row */}
                  <div className="bg-slate-50 border-t border-slate-200 p-3 font-bold text-xs flex justify-between border-r">
                    <span className="text-slate-600">Total Earnings</span>
                    <span className="text-slate-900 text-sm">₹{getEarnings().toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 border-t border-slate-200 p-3 font-bold text-xs flex justify-between">
                    <span className="text-slate-600">Total Deductions</span>
                    <span className="text-rose-600 text-sm">₹{getDeductions().toLocaleString()}</span>
                  </div>

                </div>

                {/* Net Pay Box */}
                <div className="bg-indigo-600 text-white p-5 rounded-xl flex items-center justify-between shadow-lg shadow-indigo-200">
                  <div>
                    <div className="text-indigo-200 font-medium text-xs tracking-wide uppercase mb-1">Net Pay for the month</div>
                    <div className="text-sm font-medium">{numberToWords(getNetPay())}</div>
                  </div>
                  <div className="text-3xl font-black tracking-tight">
                    ₹{getNetPay().toLocaleString()}
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
                  <h3 className="text-xs font-bold mt-2 bg-slate-100 px-3 py-1 rounded inline-block text-slate-700">SALARY SLIP FOR {selectedMonth.toUpperCase()} {selectedYear}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] border-b pb-3">
                  <div className="space-y-1">
                    <p><strong>Employee Name:</strong> {activeEmp.name}</p>
                    <p><strong>Employee ID:</strong> {activeEmp.id}</p>
                    <p><strong>Designation:</strong> {activeEmp.role}</p>
                    <p><strong>Department:</strong> {activeEmp.dept}</p>
                  </div>
                  <div className="space-y-1">
                    <p><strong>Bank Account:</strong> {activeEmp.bank} ({activeEmp.acNo})</p>
                    <p><strong>LOP / Paid Days:</strong> {activeEmp.workingDays - activeEmp.paidDays} / {activeEmp.paidDays} Days</p>
                    <p><strong>Working Days:</strong> {activeEmp.workingDays} Days</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 border border-gray-200 divide-x text-[10px]">
                  {/* Earnings Column */}
                  <div>
                    <div className="bg-slate-50 font-bold p-2 border-b">EARNINGS</div>
                    <div className="p-2 space-y-1.5">
                      <div className="flex justify-between"><span>Basic Salary:</span><span>₹{activeEmp.basic.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>HRA Allowance:</span><span>₹{activeEmp.hra.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>DA Allowance:</span><span>₹{activeEmp.da.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Special Allowances:</span><span>₹{activeEmp.allowance.toLocaleString()}</span></div>
                    </div>
                  </div>
                  {/* Deductions Column */}
                  <div>
                    <div className="bg-slate-50 font-bold p-2 border-b">DEDUCTIONS</div>
                    <div className="p-2 space-y-1.5">
                      <div className="flex justify-between"><span>PF Contribution:</span><span>₹{activeEmp.pf.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>ESI Contribution:</span><span>₹{activeEmp.esi.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Loan / Advance Deduction:</span><span>₹{activeEmp.loan.toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border border-t-0 border-gray-200 divide-x text-[10px] font-bold">
                  <div className="flex justify-between p-2"><span>Gross Earnings:</span><span>₹{getEarnings().toLocaleString()}</span></div>
                  <div className="flex justify-between p-2"><span>Total Deductions:</span><span>₹{getDeductions().toLocaleString()}</span></div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center text-xs font-bold text-blue-900 mt-4">
                  <span>NET TAKE-HOME PAYABLE:</span>
                  <span className="text-sm font-extrabold">₹{getNetPay().toLocaleString()}</span>
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
                  <p>PAY PERIOD: {selectedMonth} {selectedYear}</p>
                </div>
                <div className="border-b pb-2">
                  <p>EMP: {activeEmp.name} | ROLE: {activeEmp.role}</p>
                  <p>BANK: {activeEmp.bank} | AC: {activeEmp.acNo}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Basic Pay:</span><span>₹{activeEmp.basic}</span></div>
                  <div className="flex justify-between"><span>HRA:</span><span>₹{activeEmp.hra}</span></div>
                  <div className="flex justify-between"><span>DA:</span><span>₹{activeEmp.da}</span></div>
                  <div className="flex justify-between"><span>Allowances:</span><span>₹{activeEmp.allowance}</span></div>
                  <div className="flex justify-between border-t border-dashed pt-1 text-rose-600"><span>Deductions Total (PF/ESI/Loan):</span><span>-₹{getDeductions()}</span></div>
                  <div className="flex justify-between border-t font-bold text-xs pt-1"><span>NET PAY:</span><span>₹{getNetPay()}</span></div>
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
                    <strong className="text-gray-800 font-bold">{selectedMonth} {selectedYear}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-600 bg-slate-50 p-3 rounded-lg">
                  <div>
                    <span className="text-gray-400 font-bold block mb-0.5">EMPLOYEE</span>
                    <strong>{activeEmp.name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block mb-0.5">DESIGNATION</span>
                    <strong>{activeEmp.role}</strong>
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
                  <div className="flex justify-between"><span>Basic Salary</span><span>₹{activeEmp.basic}</span></div>
                  <div className="flex justify-between"><span>House Rent Allowance (HRA)</span><span>₹{activeEmp.hra}</span></div>
                  <div className="flex justify-between"><span>Dearness Allowance (DA)</span><span>₹{activeEmp.da}</span></div>
                  <div className="flex justify-between text-rose-500"><span>PF Deduction</span><span>-₹{activeEmp.pf}</span></div>
                  {activeEmp.esi > 0 && <div className="flex justify-between text-rose-500"><span>ESI Contribution</span><span>-₹{activeEmp.esi}</span></div>}
                  {activeEmp.loan > 0 && <div className="flex justify-between text-rose-500"><span>Loan installment</span><span>-₹{activeEmp.loan}</span></div>}
                </div>

                <div className="flex justify-between items-center pt-3 border-t font-bold">
                  <span className="text-slate-800">Net Take-Home Payable:</span>
                  <span className="text-base text-indigo-600 font-black">₹{getNetPay().toLocaleString()}</span>
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
                    <span className="text-[10px] font-bold bg-indigo-600 px-2 py-0.5 rounded text-slate-800">{selectedMonth} {selectedYear}</span>
                  </div>
                </div>

                <div className="p-4 border border-t-0 rounded-b-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-[10px] bg-slate-50 p-2.5 rounded">
                    <p><strong>Employee:</strong> {activeEmp.name} ({activeEmp.id})</p>
                    <p className="text-right"><strong>Role:</strong> {activeEmp.role}</p>
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
                        <td className="py-1.5 text-right font-mono">₹{activeEmp.basic}</td>
                        <td className="py-1.5 text-right">--</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1.5 font-semibold">HRA & DA Allowances</td>
                        <td className="py-1.5 text-right font-mono">₹{activeEmp.hra + activeEmp.da}</td>
                        <td className="py-1.5 text-right">--</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-1.5 font-semibold">PF & ESI Deductibles</td>
                        <td className="py-1.5 text-right">--</td>
                        <td className="py-1.5 text-right font-mono text-rose-600">₹{activeEmp.pf + activeEmp.esi}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex justify-between font-bold text-xs pt-2">
                    <span>Final Salary Disbursed (Net):</span>
                    <span className="text-slate-900 border-b-2 border-blue-600 pb-0.5">₹{getNetPay()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. COMPACT POCKET SLIP */}
            {selectedTemplate === '5' && (
              <div className="max-w-[210px] mx-auto text-center space-y-2 font-mono text-[9px] leading-tight">
                <div className="border-b border-dashed pb-1.5">
                  <h4 className="font-bold uppercase text-[10px]">ALLCORE PAY</h4>
                  <p>SLIP: {selectedMonth.slice(0, 3)}-{selectedYear}</p>
                </div>
                <div className="text-left space-y-0.5 border-b border-dashed pb-1.5">
                  <p>EMP: {activeEmp.name.split(' ')[0]}</p>
                  <p>DEPT: {activeEmp.dept.split(' ')[0]}</p>
                </div>
                <div className="text-left space-y-0.5">
                  <div className="flex justify-between"><span>BASIC:</span><span>₹{activeEmp.basic}</span></div>
                  <div className="flex justify-between"><span>ALLOWANCES:</span><span>₹{activeEmp.hra + activeEmp.da + activeEmp.allowance}</span></div>
                  <div className="flex justify-between text-slate-500"><span>DED:</span><span>-₹{getDeductions()}</span></div>
                  <div className="flex justify-between text-[10px] border-t border-dashed pt-0.5 font-black"><span>NET DISB:</span><span>₹{getNetPay()}</span></div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

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
