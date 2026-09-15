import React, { useState } from 'react';
import { Shield, FileCheck, Edit2 } from 'lucide-react';

const TaxLegal = () => {
  const [taxDetails, setTaxDetails] = useState({
    gstin: '08AAAAA1111A1Z1',
    pan: 'AAAAA1111A',
    cin: 'L72200RJ2015PLC048999',
    tan: 'JPRT01234F'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ gstin: '', pan: '', cin: '', tan: '' });

  const handleEdit = () => {
    setForm({ ...taxDetails });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setTaxDetails({ ...form });
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Tax & Legal Credentials</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Edit company legal certificates, registration codes, GSTIN and tax deduction accounts (TAN).</p>
      </div>

      <div className="max-w-2xl border rounded-lg p-4 sm:p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-[10px] sm:text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
            <Shield size={12} className="text-indigo-600" /> Legal Compliance Verify
          </span>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 text-[10px] sm:text-xs text-indigo-600 font-semibold border px-2.5 py-1 rounded hover:bg-slate-50 transition-colors"
            >
              <Edit2 size={12} /> Edit Legal Details
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-[11px] sm:text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">GSTIN Number</label>
                <input
                  type="text"
                  required
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">PAN Number</label>
                <input
                  type="text"
                  required
                  value={form.pan}
                  onChange={(e) => setForm({ ...form, pan: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">CIN (Corp Registration ID)</label>
                <input
                  type="text"
                  required
                  value={form.cin}
                  onChange={(e) => setForm({ ...form, cin: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">TAN Number</label>
                <input
                  type="text"
                  required
                  value={form.tan}
                  onChange={(e) => setForm({ ...form, tan: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 border rounded hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700">Save Credentials</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] sm:text-xs">
            <div className="bg-slate-50 p-4 rounded border space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><FileCheck size={14} className="text-emerald-600" /> Direct Taxation</h4>
              <p><span className="text-gray-500">GSTIN:</span> <strong className="text-gray-900 font-mono">{taxDetails.gstin}</strong></p>
              <p><span className="text-gray-500">Permanent Account (PAN):</span> <strong className="text-gray-900 font-mono">{taxDetails.pan}</strong></p>
            </div>
            <div className="bg-slate-50 p-4 rounded border space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Shield size={14} className="text-indigo-600" /> Corporate Legalities</h4>
              <p><span className="text-gray-500">CIN (Company ID):</span> <strong className="text-gray-900 font-mono text-[10px] break-all">{taxDetails.cin}</strong></p>
              <p><span className="text-gray-500">Tax Deduction A/C (TAN):</span> <strong className="text-gray-900 font-mono">{taxDetails.tan}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxLegal;
