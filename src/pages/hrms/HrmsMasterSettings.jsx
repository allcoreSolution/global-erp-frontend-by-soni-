import React, { useState } from 'react';
import { Settings, Plus, Trash2, Tag, Flag } from 'lucide-react';

const HrmsMasterSettings = () => {
  const [priorities, setPriorities] = useState(['High', 'Medium', 'Low']);
  const [statuses, setStatuses] = useState(['In Progress', 'Completed', 'Behind Schedule']);

  const [newPriority, setNewPriority] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const handleAddPriority = (e) => {
    e.preventDefault();
    if (newPriority.trim() && !priorities.includes(newPriority.trim())) {
      setPriorities([...priorities, newPriority.trim()]);
      setNewPriority('');
    }
  };

  const handleDeletePriority = (val) => {
    setPriorities(priorities.filter(p => p !== val));
  };

  const handleAddStatus = (e) => {
    e.preventDefault();
    if (newStatus.trim() && !statuses.includes(newStatus.trim())) {
      setStatuses([...statuses, newStatus.trim()]);
      setNewStatus('');
    }
  };

  const handleDeleteStatus = (val) => {
    setStatuses(statuses.filter(s => s !== val));
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative font-sans">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="text-indigo-600" size={24} /> HRMS Master Settings
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
          Manage dynamic dropdown options like Priorities and Target Statuses for the HRMS module.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Priority Scale Settings */}
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-50 p-4 border-b flex items-center gap-2">
            <Flag size={18} className="text-blue-500" />
            <h3 className="text-sm font-bold text-slate-700">Priority Scales</h3>
          </div>
          
          <div className="p-4 space-y-4">
            <form onSubmit={handleAddPriority} className="flex gap-2">
              <input 
                type="text" 
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                placeholder="Add new priority (e.g. Urgent)"
                className="flex-1 p-2 border rounded focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <button 
                type="submit"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm flex items-center gap-1 transition-colors"
              >
                <Plus size={16} /> Add
              </button>
            </form>

            <div className="border rounded divide-y max-h-[300px] overflow-y-auto">
              {priorities.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                  <button 
                    onClick={() => handleDeletePriority(item)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {priorities.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">No priority options found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Target Status Settings */}
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-slate-50 p-4 border-b flex items-center gap-2">
            <Tag size={18} className="text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-700">Target Status Options</h3>
          </div>
          
          <div className="p-4 space-y-4">
            <form onSubmit={handleAddStatus} className="flex gap-2">
              <input 
                type="text" 
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="Add new status (e.g. On Hold)"
                className="flex-1 p-2 border rounded focus:ring-1 focus:ring-emerald-500 text-sm"
              />
              <button 
                type="submit"
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-sm flex items-center gap-1 transition-colors"
              >
                <Plus size={16} /> Add
              </button>
            </form>

            <div className="border rounded divide-y max-h-[300px] overflow-y-auto">
              {statuses.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 hover:bg-slate-50">
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                  <button 
                    onClick={() => handleDeleteStatus(item)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {statuses.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">No status options found.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HrmsMasterSettings;
