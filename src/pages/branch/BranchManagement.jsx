import React, { useState, useEffect } from 'react';
import { User, Layers, Landmark, Shield, Edit } from 'lucide-react';
import api from '../../api';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ manager: '', depts: '', warehouse: '', bank: '', financialSetting: '' });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/branches');
      const data = res.data?.data || res.data || [];
      const mapped = data.map(b => ({
        ...b,
        _id: b._id,
        id: b.id || b._id,
        manager: b.manager || '',
        depts: b.depts || '',
        warehouse: b.warehouse || '',
        bank: b.bank || '',
        financialSetting: b.financialSetting || ''
      }));
      setBranches(mapped);
      if (mapped.length > 0 && !selectedId) {
        setSelectedId(mapped[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch branches', error);
    } finally {
      setLoading(false);
    }
  };

  const activeBranch = branches.find(b => b._id === selectedId) || null;

  const handleEditClick = () => {
    setEditForm({
      manager: activeBranch.manager,
      depts: activeBranch.depts,
      warehouse: activeBranch.warehouse,
      bank: activeBranch.bank,
      financialSetting: activeBranch.financialSetting
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!activeBranch || !activeBranch._id) return;
      await api.patch(`/branches/${activeBranch._id}`, editForm);
      setBranches(branches.map(b => b._id === activeBranch._id ? { ...b, ...editForm } : b));
      setIsEditing(false);
      alert('Management mappings updated successfully!');
    } catch (error) {
      console.error('Error saving mappings:', error);
      alert('Failed to update mappings: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Branch Management & Mappings</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Configure branch managers hierarchy, local warehouse inventories, bank account clearings, and tax definitions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-6">
        {/* Branch selector sidebar */}
        <div className="border rounded-lg overflow-hidden h-[180px] lg:h-[450px] flex flex-col">
          <div className="bg-slate-100 p-2.5 border-b font-bold text-[11px] sm:text-xs text-slate-700">Active Branches</div>
          <div className="divide-y overflow-y-auto flex-1 no-scrollbar text-[11px] sm:text-xs">
            {loading ? (
              <div className="p-4 text-gray-500 text-center">Loading...</div>
            ) : branches.map(b => (
              <div
                key={b._id}
                onClick={() => { setSelectedId(b._id); setIsEditing(false); }}
                className={`p-3 cursor-pointer transition-colors ${selectedId === b._id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold' : 'hover:bg-slate-50'}`}
              >
                <div>{b.name}</div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 font-mono mt-0.5">{b.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Info detail block */}
        <div className="lg:col-span-2 space-y-4 text-xs sm:text-sm">
          {activeBranch ? (
            <div className="border rounded-lg p-4 sm:p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-[10px] sm:text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">{activeBranch.id}</span>
                {!isEditing && (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-1 text-[10px] sm:text-xs text-indigo-600 font-semibold border px-2.5 py-1 rounded hover:bg-slate-50 transition-colors"
                  >
                    <Edit size={12} /> Edit Management Mappings
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4 text-[11px] sm:text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Branch Manager</label>
                      <input
                        type="text"
                        required
                        value={editForm.manager}
                        onChange={(e) => setEditForm({ ...editForm, manager: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Mapped Departments</label>
                      <input
                        type="text"
                        required
                        value={editForm.depts}
                        onChange={(e) => setEditForm({ ...editForm, depts: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Local Warehouse</label>
                      <input
                        type="text"
                        required
                        value={editForm.warehouse}
                        onChange={(e) => setEditForm({ ...editForm, warehouse: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Bank Clearing Account</label>
                      <input
                        type="text"
                        required
                        value={editForm.bank}
                        onChange={(e) => setEditForm({ ...editForm, bank: e.target.value })}
                        className="w-full border p-2 rounded focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-gray-700 uppercase mb-1">Financial Settings Profile</label>
                      <input
                        type="text"
                        required
                        value={editForm.financialSetting}
                        onChange={(e) => setEditForm({ ...editForm, financialSetting: e.target.value })}
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
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 text-[11px] sm:text-xs">
                  <div className="bg-slate-50 p-4 rounded border space-y-2.5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><User size={14} className="text-indigo-600" /> Administrative Head</h4>
                    <p><span className="text-gray-500">Branch Manager:</span> <strong className="text-gray-900 text-indigo-600">{activeBranch.manager}</strong></p>
                    <p><span className="text-gray-500">Mappped Departments:</span> <strong className="text-gray-800">{activeBranch.depts}</strong></p>
                    <p><span className="text-gray-500">Warehouse Site:</span> <strong className="text-gray-800">{activeBranch.warehouse}</strong></p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded border space-y-2.5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Landmark size={14} className="text-indigo-600" /> Bank & Finance</h4>
                    <p><span className="text-gray-500">Clearing Bank:</span> <strong className="text-gray-900 font-mono">{activeBranch.bank}</strong></p>
                    <p><span className="text-gray-500">Financial Parameters:</span> <strong className="text-gray-800">{activeBranch.financialSetting}</strong></p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 border rounded">Select a branch to see management mappings.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchManagement;
