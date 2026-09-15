import React, { useState } from 'react';
import { CreditCard, Building, ShieldAlert, FileText, Edit2 } from 'lucide-react';

const FinancialDocs = () => {
  const [employees, setEmployees] = useState([
    { id: 'EMP-001', name: 'Amit Sharma', basicSalary: 45000, hra: 15000, allowance: 10000, bankName: 'ICICI Bank', bankAccount: '123400556677', bankIfsc: 'ICIC0000011', pan: 'AMITP1234S', aadhaar: '1234-5678-9012' },
    { id: 'EMP-002', name: 'Pooja Verma', basicSalary: 30000, hra: 10000, allowance: 5000, bankName: 'SBI Bank', bankAccount: '332211005566', bankIfsc: 'SBIN0000234', pan: 'POOJAP5678V', aadhaar: '9876-5432-1098' }
  ]);

  const [selectedId, setSelectedId] = useState('EMP-001');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ basicSalary: 0, hra: 0, allowance: 0, bankName: '', bankAccount: '', bankIfsc: '', pan: '', aadhaar: '' });

  const activeEmp = employees.find(e => e.id === selectedId) || employees[0];

  const handleEditClick = () => {
    setEditForm({
      basicSalary: activeEmp.basicSalary,
      hra: activeEmp.hra,
      allowance: activeEmp.allowance,
      bankName: activeEmp.bankName,
      bankAccount: activeEmp.bankAccount,
      bankIfsc: activeEmp.bankIfsc,
      pan: activeEmp.pan,
      aadhaar: activeEmp.aadhaar
    });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setEmployees(employees.map(emp => emp.id === selectedId ? { ...emp, ...editForm } : emp));
    setIsEditing(false);
  };

  const calculateCTC = (emp) => {
    return (emp.basicSalary + emp.hra + emp.allowance) * 12;
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Financials & Document Registers</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Edit payroll structure settings, bank routing profiles, and statutory identity numbers (PAN/Aadhaar).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar list */}
        <div className="border rounded-lg overflow-hidden h-[180px] lg:h-[450px] flex flex-col">
          <div className="bg-slate-100 p-2.5 border-b font-bold text-[11px] sm:text-xs text-slate-700">Employees Directory</div>
          <div className="divide-y overflow-y-auto flex-1 no-scrollbar text-[11px] sm:text-xs">
            {employees.map(e => (
              <div
                key={e.id}
                onClick={() => { setSelectedId(s => e.id); setIsEditing(false); }}
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
                    <Edit2 size={12} /> Edit Financials
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4 text-[11px] sm:text-xs">
                  <div className="bg-slate-50 p-3 sm:p-4 rounded border space-y-3">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wide">Salary Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-0.5">Basic Salary (₹)</label>
                        <input
                          type="number"
                          value={editForm.basicSalary}
                          onChange={(e) => setEditForm({ ...editForm, basicSalary: Number(e.target.value) })}
                          className="w-full border p-2 rounded bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-0.5">HRA Allowance (₹)</label>
                        <input
                          type="number"
                          value={editForm.hra}
                          onChange={(e) => setEditForm({ ...editForm, hra: Number(e.target.value) })}
                          className="w-full border p-2 rounded bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 uppercase mb-0.5">Other Allowances (₹)</label>
                        <input
                          type="number"
                          value={editForm.allowance}
                          onChange={(e) => setEditForm({ ...editForm, allowance: Number(e.target.value) })}
                          className="w-full border p-2 rounded bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 sm:p-4 rounded border space-y-3">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wide">Bank Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Bank Name"
                        value={editForm.bankName}
                        onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                        className="border p-2 rounded focus:outline-none bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={editForm.bankAccount}
                        onChange={(e) => setEditForm({ ...editForm, bankAccount: e.target.value })}
                        className="border p-2 rounded focus:outline-none bg-white"
                      />
                      <input
                        type="text"
                        placeholder="IFSC"
                        value={editForm.bankIfsc}
                        onChange={(e) => setEditForm({ ...editForm, bankIfsc: e.target.value })}
                        className="border p-2 rounded focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">PAN Number</label>
                      <input
                        type="text"
                        value={editForm.pan}
                        onChange={(e) => setEditForm({ ...editForm, pan: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Aadhaar Number</label>
                      <input
                        type="text"
                        value={editForm.aadhaar}
                        onChange={(e) => setEditForm({ ...editForm, aadhaar: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 border rounded hover:bg-slate-50">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700">Save Financials</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-[11px] sm:text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 sm:p-4 rounded border space-y-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><CreditCard size={14} className="text-indigo-600" /> Salary Configuration</h4>
                      <p><span className="text-gray-500">Basic Monthly:</span> <strong className="text-gray-900">₹ {activeEmp.basicSalary.toLocaleString()}</strong></p>
                      <p><span className="text-gray-500">HRA Allowance:</span> <strong className="text-gray-900">₹ {activeEmp.hra.toLocaleString()}</strong></p>
                      <p><span className="text-gray-500">Other Allowance:</span> <strong className="text-gray-900">₹ {activeEmp.allowance.toLocaleString()}</strong></p>
                      <div className="border-t pt-1.5 font-bold text-slate-700">
                        Annual CTC: ₹ {calculateCTC(activeEmp).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 sm:p-4 rounded border space-y-2">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Building size={14} className="text-indigo-600" /> Bank Clearing details</h4>
                      <p><span className="text-gray-500">Bank:</span> <strong className="text-gray-900">{activeEmp.bankName}</strong></p>
                      <p><span className="text-gray-500">Account:</span> <strong className="font-mono text-gray-900">{activeEmp.bankAccount}</strong></p>
                      <p><span className="text-gray-500">IFSC:</span> <strong className="font-mono text-gray-900">{activeEmp.bankIfsc}</strong></p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 sm:p-4 rounded border space-y-2">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><FileText size={14} className="text-emerald-600" /> Statutory KYC Documents</h4>
                    <p><span className="text-gray-500">PAN ID Number:</span> <strong className="font-mono text-gray-900">{activeEmp.pan}</strong></p>
                    <p><span className="text-gray-500">Aadhaar Card:</span> <strong className="font-mono text-gray-900">{activeEmp.aadhaar}</strong></p>
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

export default FinancialDocs;
