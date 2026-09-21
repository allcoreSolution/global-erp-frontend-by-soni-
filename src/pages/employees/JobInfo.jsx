import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Users, Layers, Shield, Clock, Edit2 } from 'lucide-react';
import api from '../../api';
import DynamicSelect from '../../components/DynamicSelect';

const JobInfo = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editForm, setEditForm] = useState({ 
    department: '', 
    designation: '', 
    joiningDate: '', 
    employeeType: 'Permanent', 
    reportingManager: '', 
    branch: '', 
    shift: '' 
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/employees');
      if (res.data?.success) {
        setEmployees(res.data.data);
        if (res.data.data.length > 0 && !selectedId) {
          setSelectedId(res.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeEmp = employees.find(e => e._id === selectedId) || null;

  const handleEditClick = () => {
    if (!activeEmp) return;
    setEditForm({
      department: activeEmp.department || '',
      designation: activeEmp.designation || '',
      joiningDate: activeEmp.joiningDate || '',
      employeeType: activeEmp.employeeType || 'Permanent',
      reportingManager: activeEmp.reportingManager || '',
      branch: activeEmp.branch || '',
      shift: activeEmp.shift || ''
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Create a payload that merges the existing employee data with the updated job info
      const payload = {
        ...activeEmp,
        department: editForm.department,
        designation: editForm.designation,
        joiningDate: editForm.joiningDate,
        employeeType: editForm.employeeType,
        reportingManager: editForm.reportingManager,
        branch: editForm.branch,
        shift: editForm.shift
      };

      // Ensure _id and __v are not in the payload
      delete payload._id;
      delete payload.__v;

      const res = await api.put(`/employees/${selectedId}`, payload);
      
      if (res.data?.success) {
        // Update local state
        setEmployees(employees.map(emp => emp._id === selectedId ? res.data.data : emp));
        setIsEditing(false);
        alert('Job Info updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update job info', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to update Job Info. Error: ' + errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Job & Employment Information</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">View and update designations, reporting hierarchies, department channels, and shifts schedules.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar list */}
        <div className="border rounded-lg overflow-hidden h-[180px] lg:h-[450px] flex flex-col">
          <div className="bg-slate-100 p-2.5 border-b font-bold text-[11px] sm:text-xs text-slate-700">Employees Directory</div>
          <div className="divide-y overflow-y-auto flex-1 no-scrollbar text-[11px] sm:text-xs">
            {isLoading ? (
               <div className="p-4 text-center text-slate-500">Loading...</div>
            ) : employees.length === 0 ? (
               <div className="p-4 text-center text-slate-500">No employees found.</div>
            ) : (
              employees.map(e => (
                <div
                  key={e._id}
                  onClick={() => { setSelectedId(e._id); setIsEditing(false); }}
                  className={`p-3 cursor-pointer transition-colors ${selectedId === e._id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold' : 'hover:bg-slate-50'}`}
                >
                  <div>{e.employeeName}</div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400 font-mono mt-0.5">{e.employeeId}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-2 space-y-4">
          {activeEmp ? (
            <div className="border rounded-lg p-4 sm:p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-[10px] sm:text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">{activeEmp.employeeId}</span>
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
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Department</label>
                      <DynamicSelect category="Department" name="department" value={editForm.department} onChange={handleChange} defaultOptions={['IT', 'HR', 'Finance', 'Sales', 'Operations']} className="w-full text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Designation</label>
                      <DynamicSelect category="Designation" name="designation" value={editForm.designation} onChange={handleChange} defaultOptions={['Software Engineer', 'Manager', 'Analyst', 'HR Executive']} className="w-full text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Date of Joining</label>
                      <input
                        type="date"
                        required
                        name="joiningDate"
                        value={editForm.joiningDate}
                        onChange={handleChange}
                        className="w-full border border-slate-300 p-2 rounded focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Employment Type</label>
                      <select
                        name="employeeType"
                        value={editForm.employeeType}
                        onChange={handleChange}
                        className="w-full border border-slate-300 p-2 rounded focus:outline-none focus:border-indigo-500 bg-white"
                      >
                        <option value="Permanent">Permanent</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Reporting Manager</label>
                      <DynamicSelect category="Manager" name="reportingManager" value={editForm.reportingManager} onChange={handleChange} defaultOptions={['Not Assigned']} className="w-full text-sm bg-white" />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Branch</label>
                      <DynamicSelect category="Branch" name="branch" value={editForm.branch} onChange={handleChange} defaultOptions={['Head Office', 'Branch 1']} className="w-full text-sm bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 uppercase mb-1">Shift Timing</label>
                    <DynamicSelect category="Shift" name="shift" value={editForm.shift} onChange={handleChange} defaultOptions={['General Shift (09:00 AM - 06:00 PM)']} className="w-full text-sm bg-white" />
                  </div>
                  <div className="flex gap-2 justify-end pt-2 border-t mt-4">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                       {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-[11px] sm:text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 sm:p-4 rounded border space-y-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Briefcase size={14} className="text-indigo-600" /> Designation & Role</h4>
                      <p><span className="text-gray-500">Designation:</span> <strong className="text-gray-900">{activeEmp.designation || '-'}</strong></p>
                      <p><span className="text-gray-500">Department:</span> <strong className="text-gray-900">{activeEmp.department || '-'}</strong></p>
                      <p><span className="text-gray-500">Employment Type:</span> <strong className="text-gray-900">{activeEmp.employeeType || '-'}</strong></p>
                    </div>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded border space-y-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Calendar size={14} className="text-indigo-600" /> Chronology & Location</h4>
                      <p><span className="text-gray-500">Joining Date:</span> <strong className="text-gray-900">{activeEmp.joiningDate || '-'}</strong></p>
                      <p><span className="text-gray-500">Office Branch:</span> <strong className="text-gray-900">{activeEmp.branch || '-'}</strong></p>
                      <p><span className="text-gray-500">Reporting to:</span> <strong className="text-gray-900 text-indigo-600">{activeEmp.reportingManager || '-'}</strong></p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 sm:p-4 rounded border space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Clock size={14} className="text-emerald-600" /> Active Roster Shift</h4>
                    <p><span className="text-gray-500">Assigned Shift:</span> <strong className="text-gray-900">{activeEmp.shift || '-'}</strong></p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 border rounded flex flex-col items-center justify-center">
              <Users size={32} className="text-slate-300 mb-2" />
              <p>{isLoading ? 'Loading...' : 'Select an employee to see details.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobInfo;

