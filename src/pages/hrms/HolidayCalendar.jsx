import React, { useState } from 'react';
import { Calendar, Plus, Trash2, X, Sun, Star, Info } from 'lucide-react';

const HolidayCalendar = () => {
  const [holidays, setHolidays] = useState([
    { id: 1, name: 'New Year\'s Day', date: '2026-01-01', day: 'Thursday', type: 'National Holiday', desc: 'First day of the Gregorian calendar' },
    { id: 2, name: 'Republic Day', date: '2026-01-26', day: 'Monday', type: 'National Holiday', desc: 'Commemorating the adoption of India\'s constitution' },
    { id: 3, name: 'Holi Festival', date: '2026-03-04', day: 'Wednesday', type: 'Restricted Holiday', desc: 'Spring festival of colors' },
    { id: 4, name: 'Good Friday', date: '2026-04-03', day: 'Friday', type: 'National Holiday', desc: 'Christian religious holiday commemorating the crucifixion' },
    { id: 5, name: 'Independence Day', date: '2026-08-15', day: 'Saturday', type: 'National Holiday', desc: 'Celebrating nation\'s independence' },
    { id: 6, name: 'Diwali Festival', date: '2026-11-08', day: 'Sunday', type: 'Company Holiday', desc: 'Festival of lights celebration' },
    { id: 7, name: 'Christmas Day', date: '2026-12-25', day: 'Friday', type: 'National Holiday', desc: 'Birth of Jesus Christ celebration' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    type: 'National Holiday',
    desc: ''
  });

  const getDayName = (dateStr) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(dateStr);
    return days[d.getDay()];
  };

  const handleAddHoliday = (e) => {
    e.preventDefault();
    if (!newHoliday.name || !newHoliday.date) {
      alert("Please fill in Name and Date!");
      return;
    }
    const day = getDayName(newHoliday.date);
    const addedHoliday = {
      id: Date.now(),
      name: newHoliday.name,
      date: newHoliday.date,
      day,
      type: newHoliday.type,
      desc: newHoliday.desc || 'No description provided'
    };

    setHolidays([...holidays, addedHoliday].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setShowAddModal(false);
    setNewHoliday({ name: '', date: '', type: 'National Holiday', desc: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      setHolidays(holidays.filter(h => h.id !== id));
    }
  };

  const stats = {
    total: holidays.length,
    national: holidays.filter(h => h.type === 'National Holiday').length,
    restricted: holidays.filter(h => h.type === 'Restricted Holiday').length,
    company: holidays.filter(h => h.type === 'Company Holiday').length
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-indigo-600" size={24} /> Holiday Calendar Setup
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Configure annual gazetted, restricted, and corporate holiday events for payroll and shifts calculations.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Plus size={14} /> Add New Holiday
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Total Holidays</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-700 mt-1">{stats.total}</div>
          </div>
          <div className="bg-blue-100 text-indigo-600 p-2.5 rounded-lg">
            <Calendar size={18} />
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase">National Gazetted</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-1">{stats.national}</div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <Sun size={18} />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase">Restricted (RH)</div>
            <div className="text-xl font-bold text-amber-800 dark:text-amber-400 mt-1">{stats.restricted}</div>
          </div>
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
            <Star size={18} />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-purple-700 uppercase">Company declared</div>
            <div className="text-xl font-bold text-purple-800 dark:text-purple-400 mt-1">{stats.company}</div>
          </div>
          <div className="bg-purple-100 text-purple-600 p-2.5 rounded-lg">
            <Info size={18} />
          </div>
        </div>

      </div>

      {/* Holiday Calendar List */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Official Calendar Holiday Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="p-3">Holiday Name</th>
                <th className="p-3">Calendar Date</th>
                <th className="p-3">Day of Week</th>
                <th className="p-3">Classification Type</th>
                <th className="p-3">Short Notes / Description</th>
                <th className="p-3 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {holidays.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/30">
                  <td className="p-3 font-bold text-slate-800">{h.name}</td>
                  <td className="p-3 text-indigo-600 font-semibold font-mono">
                    {new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-3 text-gray-650 font-medium">{h.day}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      h.type === 'National Holiday' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      h.type === 'Restricted Holiday' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-purple-50 text-purple-700 border border-purple-100'
                    }`}>
                      {h.type}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 max-w-xs truncate" title={h.desc}>{h.desc}</td>
                  <td className="p-3 text-right no-print">
                    <button 
                      onClick={() => handleDelete(h.id)}
                      className="p-1 hover:bg-slate-100 rounded text-rose-600 transition"
                      title="Delete Holiday"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD HOLIDAY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-50/50 shadow-inner border border-slate-200/50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider">Add New Holiday Setup</span>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddHoliday} className="p-4 space-y-3.5 font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">Holiday Event Name *</label>
                <input 
                  type="text" 
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Maha Shivratri"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Holiday Date *</label>
                <input 
                  type="date" 
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Classification Type</label>
                <select 
                  value={newHoliday.type}
                  onChange={(e) => setNewHoliday({...newHoliday, type: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="National Holiday">National Holiday</option>
                  <option value="Restricted Holiday">Restricted Holiday</option>
                  <option value="Company Holiday">Company Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Description / Notes</label>
                <textarea 
                  value={newHoliday.desc}
                  onChange={(e) => setNewHoliday({...newHoliday, desc: e.target.value})}
                  className="w-full h-16 p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="Notes about the holiday event..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-650 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded font-bold shadow-xs"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HolidayCalendar;
