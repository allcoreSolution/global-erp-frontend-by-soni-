import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit, X, Sun, Star, Info } from 'lucide-react';
import api from '../../api';

const HolidayCalendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState(null);
  
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    type: 'National Holiday',
    desc: ''
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/holidays');
      if (res.data?.success) {
        // Map backend fields to frontend fields
        const fetched = res.data.data.map(h => ({
          id: h._id,
          name: h.eventName,
          date: h.holidayDate,
          day: getDayName(h.holidayDate),
          type: h.classificationType,
          desc: h.description
        }));
        
        // Sort by date
        fetched.sort((a, b) => new Date(a.date) - new Date(b.date));
        setHolidays(fetched);
      }
    } catch (error) {
      console.error("Failed to fetch holidays", error);
      alert("Failed to load holidays. " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : days[d.getDay()];
  };

  const handleOpenAddModal = () => {
    setEditingHolidayId(null);
    setNewHoliday({ name: '', date: '', type: 'National Holiday', desc: '' });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (holiday) => {
    setEditingHolidayId(holiday.id);
    setNewHoliday({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      desc: holiday.desc
    });
    setShowAddModal(true);
  };

  const handleAddOrEditHoliday = async (e) => {
    e.preventDefault();
    if (!newHoliday.name || !newHoliday.date) {
      alert("Please fill in Name and Date!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        eventName: newHoliday.name,
        holidayDate: newHoliday.date,
        classificationType: newHoliday.type,
        description: newHoliday.desc
      };

      if (editingHolidayId) {
        // Edit existing holiday
        const res = await api.put(`/holidays/${editingHolidayId}`, payload);
        if (res.data?.success) {
          const h = res.data.data;
          const updatedHoliday = {
            id: h._id,
            name: h.eventName,
            date: h.holidayDate,
            day: getDayName(h.holidayDate),
            type: h.classificationType,
            desc: h.description
          };
          
          const updatedHolidays = holidays.map(item => item.id === editingHolidayId ? updatedHoliday : item);
          updatedHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
          setHolidays(updatedHolidays);
        }
      } else {
        // Add new holiday
        const res = await api.post('/holidays', payload);
        if (res.data?.success) {
          const h = res.data.data;
          const addedHoliday = {
            id: h._id,
            name: h.eventName,
            date: h.holidayDate,
            day: getDayName(h.holidayDate),
            type: h.classificationType,
            desc: h.description
          };
  
          const updatedHolidays = [...holidays, addedHoliday].sort((a, b) => new Date(a.date) - new Date(b.date));
          setHolidays(updatedHolidays);
        }
      }
      
      setShowAddModal(false);
      setEditingHolidayId(null);
      setNewHoliday({ name: '', date: '', type: 'National Holiday', desc: '' });
      
    } catch (error) {
      console.error("Failed to save holiday", error);
      alert("Failed to save holiday. " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;
    
    try {
      await api.delete(`/holidays/${id}`);
      setHolidays(holidays.filter(h => h.id !== id));
    } catch (error) {
      console.error("Failed to delete holiday", error);
      alert("Failed to delete holiday. " + (error.response?.data?.message || error.message));
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
            onClick={handleOpenAddModal}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Plus size={14} /> Add New Holiday
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
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
          <table className="block w-full overflow-x-auto w-full text-left text-xs">
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
              {isLoading ? (
                 <tr><td colSpan="6" className="p-4 text-center text-gray-500">Loading holidays...</td></tr>
              ) : holidays.length === 0 ? (
                 <tr><td colSpan="6" className="p-4 text-center text-gray-500">No holidays added yet.</td></tr>
              ) : (
                holidays.map((h) => (
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
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleOpenEditModal(h)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded text-indigo-600 border border-slate-200 transition"
                          title="Edit Holiday"
                        >
                          <Edit size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(h.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded text-rose-600 border border-rose-100 transition"
                          title="Delete Holiday"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT HOLIDAY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-50/50 shadow-inner border border-slate-200/50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider">
                {editingHolidayId ? 'Edit Holiday Setup' : 'Add New Holiday Setup'}
              </span>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddOrEditHoliday} className="p-4 space-y-3.5 font-semibold">
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
                  disabled={isSubmitting}
                  className="px-3 py-1.5 border rounded text-gray-650 hover:bg-gray-50 font-bold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingHolidayId ? 'Update Holiday' : 'Save Holiday')}
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
