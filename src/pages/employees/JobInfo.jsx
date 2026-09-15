import React, { useState } from 'react';
import { Briefcase, Calendar, Users, Layers, Shield, Clock, Edit2 } from 'lucide-react';

const JobInfo = () => {
  const [employees, setEmployees] = useState([
    { id: 'EMP-001', name: 'Amit Sharma', dept: 'IT & Systems', designation: 'Senior Developer', doj: '2022-06-01', empType: 'Full-Time', manager: 'Vikram Malhotra', branch: 'Jaipur HQ', shift: 'Day Shift (09:00 - 18:00)' },
    { id: 'EMP-002', name: 'Pooja Verma', dept: 'HR & Admin', designation: 'HR Executive', doj: '2023-01-15', empType: 'Full-Time', manager: 'Anjali Desai', branch: 'Jaipur HQ', shift: 'Day Shift (09:00 - 18:00)' }
  ]);

  const [selectedId, setSelectedId] = useState('EMP-001');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ dept: '', designation: '', doj: '', empType: 'Full-Time', manager: '', branch: '', shift: '' });

  const activeEmp = employees.find(e => e.id === selectedId) || employees[0];

  const handleEditClick = () => {
    setEditForm({
      dept: activeEmp.dept,
      designation: activeEmp.designation,
      doj: activeEmp.doj,
      empType: activeEmp.empType,
      manager: activeEmp.manager,
      branch: activeEmp.branch,
      shift: activeEmp.shift
    });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setEmployees(employees.map(emp => emp.id === selectedId ? { ...emp, ...editForm } : emp));
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Job & Employment Information</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">View and update designations, reporting hierarchies, department channels, and shifts schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar list */}
        <div className="border rounded-lg overflow-hidden h-[180px] lg:h-[450px] flex flex-col">
          <div className="bg-slate-100 p-2.5 border-b font-bold text-[11px] sm:text-xs text-slate-700">Employees Directory</div>
          <div className="divide-y overflow-y-auto flex-1 no-scrollbar text-[11px] sm:text-xs">
            {employees.map(e => (
              <div
                key={e.id}
                onClick={() => { setSelectedId(e.id); setIsEditing(false); }}
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
                {!isEditing && (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-1 text-[10px] sm:text-xs text-indigo-600 font-semibold border px-2.5 py-1 rounded hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 size={12} /> Edit Job Info
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4 text-[11px] sm:text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Department</label>
                      <input
                        type="text"
                        required
                        value={editForm.dept}
                        onChange={(e) => setEditForm({ ...editForm, dept: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Designation</label>
                      <input
                        type="text"
                        required
                        value={editForm.designation}
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Date of Joining</label>
                      <input
                        type="date"
                        required
                        value={editForm.doj}
                        onChange={(e) => setEditForm({ ...editForm, doj: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Employment Type</label>
                      <select
                        value={editForm.empType}
                        onChange={(e) => setEditForm({ ...editForm, empType: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none bg-white"
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Reporting Manager</label>
                      <input
                        type="text"
                        value={editForm.manager}
                        onChange={(e) => setEditForm({ ...editForm, manager: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Branch</label>
                      <input
                        type="text"
                        value={editForm.branch}
                        onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Shift Timing</label>
                    <select
                      value={editForm.shift}
                      onChange={(e) => setEditForm({ ...editForm, shift: e.target.value })}
                      className="w-full border p-2 rounded focus:outline-none bg-white"
                    >
                      <option value="Day Shift (09:00 - 18:00)">Day Shift (09:00 - 18:00)</option>
                      <option value="Evening Shift (14:00 - 22:00)">Evening Shift (14:00 - 22:00)</option>
                      <option value="Night Shift (22:00 - 06:00)">Night Shift (22:00 - 06:00)</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end pt-2 border-t">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 border rounded hover:bg-slate-50">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700">Save Changes</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-[11px] sm:text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 sm:p-4 rounded border space-y-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Briefcase size={14} className="text-indigo-600" /> Designation & Role</h4>
                      <p><span className="text-gray-500">Designation:</span> <strong className="text-gray-900">{activeEmp.designation}</strong></p>
                      <p><span className="text-gray-500">Department:</span> <strong className="text-gray-900">{activeEmp.dept}</strong></p>
                      <p><span className="text-gray-500">Employment Type:</span> <strong className="text-gray-900">{activeEmp.empType}</strong></p>
                    </div>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded border space-y-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Calendar size={14} className="text-indigo-600" /> Chronology & Location</h4>
                      <p><span className="text-gray-500">Joining Date:</span> <strong className="text-gray-900">{activeEmp.doj}</strong></p>
                      <p><span className="text-gray-500">Office Branch:</span> <strong className="text-gray-900">{activeEmp.branch}</strong></p>
                      <p><span className="text-gray-500">Reporting to:</span> <strong className="text-gray-900 text-indigo-600">{activeEmp.manager}</strong></p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 sm:p-4 rounded border space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Clock size={14} className="text-emerald-600" /> Active Roster Shift</h4>
                    <p><span className="text-gray-500">Assigned Shift:</span> <strong className="text-gray-900">{activeEmp.shift}</strong></p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 border rounded">Select an employee to see details.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobInfo;
