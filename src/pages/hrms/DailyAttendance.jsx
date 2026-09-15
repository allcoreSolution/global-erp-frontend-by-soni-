import React, { useState } from 'react';
import { Calendar, UserCheck, UserX, Clock, Check, RefreshCw, Printer, Download } from 'lucide-react';

const DailyAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState([
    { id: 'EMP-001', name: 'Amit Sharma', role: 'Accountant', checkIn: '09:15 AM', checkOut: '06:05 PM', status: 'Present', shift: 'General Shift (09AM-06PM)' },
    { id: 'EMP-002', name: 'Neha Gupta', role: 'Sales Lead', checkIn: '09:35 AM', checkOut: '06:10 PM', status: 'Late', shift: 'General Shift (09AM-06PM)' },
    { id: 'EMP-003', name: 'Rajesh Kumar', role: 'Operator', checkIn: '09:05 AM', checkOut: '06:00 PM', status: 'Present', shift: 'General Shift (09AM-06PM)' },
    { id: 'EMP-004', name: 'Vikram Singh', role: 'Developer', checkIn: '--', checkOut: '--', status: 'Absent', shift: 'General Shift (09AM-06PM)' },
    { id: 'EMP-005', name: 'Priya Patel', role: 'Designer', checkIn: '09:10 AM', checkOut: '06:00 PM', status: 'Present', shift: 'General Shift (09AM-06PM)' }
  ]);

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'Present').length,
    absent: attendance.filter(a => a.status === 'Absent').length,
    late: attendance.filter(a => a.status === 'Late').length
  };

  const handleStatusChange = (id, newStatus) => {
    setAttendance(prev => prev.map(emp => {
      if (emp.id === id) {
        let checkIn = emp.checkIn;
        let checkOut = emp.checkOut;
        if (newStatus === 'Present') {
          checkIn = '09:00 AM';
          checkOut = '06:00 PM';
        } else if (newStatus === 'Late') {
          checkIn = '09:30 AM';
          checkOut = '06:00 PM';
        } else {
          checkIn = '--';
          checkOut = '--';
        }
        return { ...emp, status: newStatus, checkIn, checkOut };
      }
      return emp;
    }));
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Role', 'Clock In', 'Clock Out', 'Status', 'Shift'];
    const rows = attendance.map(a => [a.id, a.name, a.role, a.checkIn, a.checkOut, a.status, a.shift]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_Log_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="text-indigo-600" size={24} /> Daily Attendance Register
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Log employee clock-in/out times, approve attendance codes, and download log sheets.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 no-print">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs p-1.5 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded-lg transition"
          >
            <Download size={14} /> Export
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Printer size={14} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Interactive Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Total Strength</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-700 mt-1">{stats.total}</div>
          </div>
          <div className="bg-blue-100 text-indigo-600 p-2.5 rounded-lg">
            <RefreshCw size={18} />
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Present Today</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-1">{stats.present}</div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <UserCheck size={18} />
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-rose-700 uppercase">Absent Today</div>
            <div className="text-xl font-bold text-rose-800 dark:text-rose-400 mt-1">{stats.absent}</div>
          </div>
          <div className="bg-rose-100 text-rose-600 p-2.5 rounded-lg">
            <UserX size={18} />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase">Late Entries</div>
            <div className="text-xl font-bold text-amber-800 dark:text-amber-400 mt-1">{stats.late}</div>
          </div>
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
            <Clock size={18} />
          </div>
        </div>

      </div>

      {/* Attendance Log Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Daily Roster Sheets: {selectedDate}</h3>
          <button 
            onClick={() => setAttendance(prev => prev.map(emp => emp.status === 'Absent' ? { ...emp, status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM' } : emp))}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 font-bold text-[10px] rounded shadow-xs transition no-print"
          >
            Mark All Present
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Job Role</th>
                <th className="p-3">Shift Details</th>
                <th className="p-3">Clock In</th>
                <th className="p-3">Clock Out</th>
                <th className="p-3">Attendance Status</th>
                <th className="p-3 text-right no-print">Quick Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/30">
                  <td className="p-3 font-semibold text-gray-800">{emp.id}</td>
                  <td className="p-3 text-slate-800 font-medium">{emp.name}</td>
                  <td className="p-3 text-gray-500">{emp.role}</td>
                  <td className="p-3 text-gray-600">{emp.shift}</td>
                  <td className="p-3 font-mono font-bold text-indigo-600">{emp.checkIn}</td>
                  <td className="p-3 font-mono font-bold text-slate-600">{emp.checkOut}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      emp.status === 'Late' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1 no-print">
                    <button 
                      onClick={() => handleStatusChange(emp.id, 'Present')}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition border ${
                        emp.status === 'Present' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-50 border-gray-250 text-gray-700'
                      }`}
                    >
                      P
                    </button>
                    <button 
                      onClick={() => handleStatusChange(emp.id, 'Late')}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition border ${
                        emp.status === 'Late' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white hover:bg-slate-50 border-gray-250 text-gray-700'
                      }`}
                    >
                      L
                    </button>
                    <button 
                      onClick={() => handleStatusChange(emp.id, 'Absent')}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition border ${
                        emp.status === 'Absent' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white hover:bg-slate-50 border-gray-250 text-gray-700'
                      }`}
                    >
                      A
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyAttendance;
