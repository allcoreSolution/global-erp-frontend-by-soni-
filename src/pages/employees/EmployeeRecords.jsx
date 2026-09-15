import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

const EmployeeRecords = () => {
  const [employees, setEmployees] = useState([
    { id: 'EMP-001', name: 'Amit Sharma', leavesTaken: 4, leavesBalance: 14, attendanceRate: 98, payrollStatus: 'Disbursed (May 2024)', active: true },
    { id: 'EMP-002', name: 'Pooja Verma', leavesTaken: 2, leavesBalance: 16, attendanceRate: 96, payrollStatus: 'Disbursed (May 2024)', active: true }
  ]);

  const [selectedId, setSelectedId] = useState('EMP-001');

  const activeEmp = employees.find(e => e.id === selectedId) || employees[0];

  const handleToggleActive = (id) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, active: !e.active } : e));
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Employee Records Dashboard</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Track leaves balances, monthly attendance summaries, payslip disbursal status, and employee system access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar list */}
        <div className="border rounded-lg overflow-hidden h-[180px] lg:h-[450px] flex flex-col">
          <div className="bg-slate-100 p-2.5 border-b font-bold text-[11px] sm:text-xs text-slate-700">Employees Directory</div>
          <div className="divide-y overflow-y-auto flex-1 no-scrollbar text-[11px] sm:text-xs">
            {employees.map(e => (
              <div
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                className={`p-3 cursor-pointer transition-colors ${selectedId === e.id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold' : 'hover:bg-slate-50'}`}
              >
                <div>{e.name}</div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 font-mono mt-0.5">{e.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-2 space-y-4">
          {activeEmp ? (
            <div className="border rounded-lg p-4 sm:p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-[10px] sm:text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">{activeEmp.id}</span>
                <button
                  onClick={() => handleToggleActive(activeEmp.id)}
                  className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded transition-colors ${activeEmp.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                >
                  {activeEmp.active ? 'Active Profile' : 'Suspended / Inactive'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Leaves */}
                <div className="bg-slate-50 p-4 rounded border space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Calendar size={14} className="text-indigo-600" /> Leave Balance Directory</h4>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white p-2 rounded border">
                      <span className="text-[10px] text-gray-500">Leaves Taken</span>
                      <p className="font-bold text-sm text-gray-800 mt-0.5">{activeEmp.leavesTaken}</p>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-[10px] text-gray-500">Remaining</span>
                      <p className="font-bold text-sm text-emerald-600 mt-0.5">{activeEmp.leavesBalance}</p>
                    </div>
                  </div>
                </div>

                {/* Attendance */}
                <div className="bg-slate-50 p-4 rounded border space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Clock size={14} className="text-indigo-600" /> Attendance Roster Status</h4>
                  <div className="bg-white p-3 rounded border text-center">
                    <span className="text-[10px] text-gray-500">Monthly Attendance Rate</span>
                    <p className="font-bold text-lg text-indigo-600 mt-0.5">{activeEmp.attendanceRate}%</p>
                  </div>
                </div>
              </div>

              {/* Payroll */}
              <div className="bg-slate-50 p-4 rounded border space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><FileText size={14} className="text-emerald-600" /> Payroll & Disbursals</h4>
                <div className="bg-white p-3.5 rounded border flex justify-between items-center text-xs">
                  <span>Last Payroll Disbursal</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                    {activeEmp.payrollStatus}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 border rounded">Select an employee to see records.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeRecords;
