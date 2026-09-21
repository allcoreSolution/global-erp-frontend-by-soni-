import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, FileText, ToggleLeft, ToggleRight, Edit, Trash2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const EmployeeRecords = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/employees');
      if (data.success && data.data.length > 0) {
        setEmployees(data.data);
        if (!selectedId) setSelectedId(data.data[0]._id);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const activeEmp = employees.find(e => e._id === selectedId) || employees[0];

  const handleToggleActive = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/employees/${id}`, { status: newStatus });
      setEmployees(employees.map(e => e._id === id ? { ...e, status: newStatus } : e));
    } catch (error) {
      console.error("Error toggling status", error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        const updated = employees.filter(e => e._id !== id);
        setEmployees(updated);
        if (selectedId === id) setSelectedId(updated.length > 0 ? updated[0]._id : null);
        alert('Employee deleted successfully');
      } catch (error) {
        console.error("Error deleting employee", error);
      }
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Employee Records Dashboard</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Track leaves balances, monthly attendance summaries, payslip disbursal status, and employee system access.</p>
        </div>
        <button onClick={() => navigate('/employees/profile')} className="px-4 py-2 bg-indigo-600 text-white rounded font-semibold text-sm hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm">
           <UserPlus size={16} /> New Employee
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar list */}
        <div className="border rounded-lg overflow-hidden h-[180px] lg:h-[450px] flex flex-col">
          <div className="bg-slate-100 p-2.5 border-b font-bold text-[11px] sm:text-xs text-slate-700">Employees Directory</div>
          <div className="divide-y overflow-y-auto flex-1 no-scrollbar text-[11px] sm:text-xs">
            {loading ? (
              <div className="p-4 text-center text-slate-500">Loading...</div>
            ) : employees.map(e => (
              <div
                key={e._id}
                onClick={() => setSelectedId(e._id)}
                className={`p-3 cursor-pointer transition-colors ${selectedId === e._id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold' : 'hover:bg-slate-50'}`}
              >
                <div>{e.employeeName}</div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 font-mono mt-0.5">{e.employeeId} - {e.designation}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-2 space-y-4">
          {activeEmp ? (
            <div className="border rounded-lg p-4 sm:p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-[10px] sm:text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">{activeEmp.employeeId}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(activeEmp._id, activeEmp.status)}
                    className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded transition-colors ${activeEmp.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                  >
                    {activeEmp.status === 'Active' ? 'Active Profile' : 'Suspended / Inactive'}
                  </button>
                  <button onClick={() => navigate(`/employees/profile/${activeEmp._id}`)} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(activeEmp._id)} className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                {/* Leaves */}
                <div className="bg-slate-50 p-4 rounded border space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Calendar size={14} className="text-indigo-600" /> Leave Balance Directory</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-center">
                    <div className="bg-white p-2 rounded border">
                      <span className="text-[10px] text-gray-500">Leaves Taken</span>
                      <p className="font-bold text-sm text-gray-800 mt-0.5">{activeEmp.leavesTaken || 0}</p>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-[10px] text-gray-500">Remaining</span>
                      <p className="font-bold text-sm text-emerald-600 mt-0.5">{activeEmp.leavesBalance || 14}</p>
                    </div>
                  </div>
                </div>

                {/* Attendance */}
                <div className="bg-slate-50 p-4 rounded border space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Clock size={14} className="text-indigo-600" /> Attendance Roster Status</h4>
                  <div className="bg-white p-3 rounded border text-center">
                    <span className="text-[10px] text-gray-500">Monthly Attendance Rate</span>
                    <p className="font-bold text-lg text-indigo-600 mt-0.5">{activeEmp.attendanceRate || 95}%</p>
                  </div>
                </div>
              </div>

              {/* Payroll */}
              <div className="bg-slate-50 p-4 rounded border space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><FileText size={14} className="text-emerald-600" /> Payroll & Disbursals</h4>
                <div className="bg-white p-3.5 rounded border flex justify-between items-center text-xs">
                  <span>Last Payroll Disbursal</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                    {activeEmp.payrollStatus || 'Disbursed (May 2024)'}
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
