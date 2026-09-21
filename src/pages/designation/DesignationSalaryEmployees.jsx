import React, { useState } from 'react';
import { ShieldAlert, Users, Award, Edit } from 'lucide-react';

const DesignationSalaryEmployees = () => {
  const [designations, setDesignations] = useState([
    { id: 'DESG-01', name: 'Senior Developer', grade: 'Grade E4', minSal: 60000, maxSal: 120000, mappedEmps: 'Amit Sharma, Vikas Yadav' },
    { id: 'DESG-02', name: 'HR Executive', grade: 'Grade E2', minSal: 30000, maxSal: 60000, mappedEmps: 'Pooja Verma' }
  ]);

  const [selectedId, setSelectedId] = useState('DESG-01');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ grade: '', minSal: 0, maxSal: 0, mappedEmps: '' });

  const activeDesg = designations.find(d => d.id === selectedId) || designations[0];

  const handleEditClick = () => {
    setEditForm({
      grade: activeDesg.grade,
      minSal: activeDesg.minSal,
      maxSal: activeDesg.maxSal,
      mappedEmps: activeDesg.mappedEmps
    });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setDesignations(designations.map(d => d.id === selectedId ? { ...d, ...editForm } : d));
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Designation Salaries & Staff Mapping</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Configure salary grades structures, minimum-maximum pay bands, and mapped employee profiles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar roles */}
        <div className="border rounded-lg overflow-hidden h-[180px] lg:h-[450px] flex flex-col">
          <div className="bg-slate-100 p-2.5 border-b font-bold text-[11px] sm:text-xs text-slate-700">Designations</div>
          <div className="divide-y overflow-y-auto flex-1 no-scrollbar text-[11px] sm:text-xs">
            {designations.map(d => (
              <div
                key={d.id}
                onClick={() => { setSelectedId(d.id); setIsEditing(false); }}
                className={`p-3 cursor-pointer transition-colors ${selectedId === d.id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold' : 'hover:bg-slate-50'}`}
              >
                <div>{d.name}</div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 font-mono mt-0.5">{d.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-2 space-y-4 text-xs sm:text-sm">
          {activeDesg ? (
            <div className="border rounded-lg p-4 sm:p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-[10px] sm:text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">{activeDesg.id}</span>
                {!isEditing && (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-1 text-[10px] sm:text-xs text-indigo-600 font-semibold border px-2.5 py-1 rounded hover:bg-slate-50 transition-colors"
                  >
                    <Edit size={12} /> Edit Salary Bands
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4 text-[11px] sm:text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Salary Grade</label>
                      <input
                        type="text"
                        required
                        value={editForm.grade}
                        onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Mapped Employees</label>
                      <input
                        type="text"
                        required
                        value={editForm.mappedEmps}
                        onChange={(e) => setEditForm({ ...editForm, mappedEmps: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Minimum Base Salary (₹)</label>
                      <input
                        type="number"
                        required
                        value={editForm.minSal}
                        onChange={(e) => setEditForm({ ...editForm, minSal: Number(e.target.value) })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Maximum Base Salary (₹)</label>
                      <input
                        type="number"
                        required
                        value={editForm.maxSal}
                        onChange={(e) => setEditForm({ ...editForm, maxSal: Number(e.target.value) })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 border rounded hover:bg-slate-50">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700">Save Changes</button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] sm:text-xs">
                  <div className="bg-slate-50 p-4 rounded border space-y-2.5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Award size={14} className="text-indigo-600" /> Salary Band details</h4>
                    <p><span className="text-gray-500">Pay Grade Rank:</span> <strong className="text-gray-900">{activeDesg.grade}</strong></p>
                    <p><span className="text-gray-500">Min Base Pay:</span> <strong className="text-emerald-600">₹ {activeDesg.minSal.toLocaleString()}</strong></p>
                    <p><span className="text-gray-500">Max Base Pay:</span> <strong className="text-emerald-700">₹ {activeDesg.maxSal.toLocaleString()}</strong></p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded border space-y-2.5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Users size={14} className="text-indigo-600" /> Active Staff mappings</h4>
                    <p className="text-gray-700 leading-relaxed">{activeDesg.mappedEmps}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 border rounded">Select a role to view salary configurations.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignationSalaryEmployees;
