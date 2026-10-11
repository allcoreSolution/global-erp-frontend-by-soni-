import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Edit, X, Sun, Star, Info } from 'lucide-react';
import api from '../../api';
import { usePermissions } from '../../utils/permissionUtils';

const HolidayCalendar = () => {
  const { can } = usePermissions();
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState(null);
  
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: 'National Holiday',
    desc: ''
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const calculateDays = (start, end) => {
    if (!start) return 1;
    const s = new Date(start);
    const e = end ? new Date(end) : s;
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/holidays');
      if (res.data?.success) {
        // Map backend fields to frontend fields
        const fetched = res.data.data.map(h => {
          const s = h.startDate || h.holidayDate;
          const e = h.endDate || s;
          const duration = h.durationDays || calculateDays(s, e);
          return {
            id: h._id,
            name: h.eventName,
            startDate: s,
            endDate: e,
            durationDays: duration,
            day: getDayRangeText(s, e),
            type: h.classificationType || 'National Holiday',
            desc: h.description
          };
        });
        
        // Sort by startDate
        fetched.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
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

  const getDayRangeText = (startStr, endStr) => {
    if (!startStr) return '';
    const startDay = getDayName(startStr);
    if (!endStr || startStr === endStr) return startDay;
    const endDay = getDayName(endStr);
    return `${startDay} - ${endDay}`;
  };

  const formatDateDisplay = (startStr, endStr) => {
    if (!startStr) return '-';
    const sDate = new Date(startStr);
    const startFormatted = sDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    if (!endStr || startStr === endStr) return startFormatted;
    const eDate = new Date(endStr);
    const endFormatted = eDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startFormatted} → ${endFormatted}`;
  };

  const handleOpenAddModal = () => {
    setEditingHolidayId(null);
    setNewHoliday({ name: '', startDate: '', endDate: '', type: 'National Holiday', desc: '' });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (holiday) => {
    setEditingHolidayId(holiday.id);
    setNewHoliday({
      name: holiday.name,
      startDate: holiday.startDate,
      endDate: holiday.endDate || holiday.startDate,
      type: holiday.type,
      desc: holiday.desc
    });
    setShowAddModal(true);
  };

  const handleAddOrEditHoliday = async (e) => {
    e.preventDefault();
    if (!newHoliday.name || !newHoliday.startDate) {
      alert("Please fill in Name and Start Date!");
      return;
    }

    const start = newHoliday.startDate;
    const end = newHoliday.endDate || start;

    if (new Date(end) < new Date(start)) {
      alert("Ending date cannot be before starting date!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        eventName: newHoliday.name,
        startDate: start,
        endDate: end,
        holidayDate: start,
        durationDays: calculateDays(start, end),
        classificationType: newHoliday.type,
        description: newHoliday.desc
      };

      if (editingHolidayId) {
        // Edit existing holiday
        const res = await api.put(`/holidays/${editingHolidayId}`, payload);
        if (res.data?.success) {
          const h = res.data.data;
          const s = h.startDate || h.holidayDate;
          const ed = h.endDate || s;
          const updatedHoliday = {
            id: h._id,
            name: h.eventName,
            startDate: s,
            endDate: ed,
            durationDays: h.durationDays || calculateDays(s, ed),
            day: getDayRangeText(s, ed),
            type: h.classificationType,
            desc: h.description
          };
          
          const updatedHolidays = holidays.map(item => item.id === editingHolidayId ? updatedHoliday : item);
          updatedHolidays.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          setHolidays(updatedHolidays);
        }
      } else {
        // Add new holiday
        const res = await api.post('/holidays', payload);
        if (res.data?.success) {
          const h = res.data.data;
          const s = h.startDate || h.holidayDate;
          const ed = h.endDate || s;
          const addedHoliday = {
            id: h._id,
            name: h.eventName,
            startDate: s,
            endDate: ed,
            durationDays: h.durationDays || calculateDays(s, ed),
            day: getDayRangeText(s, ed),
            type: h.classificationType,
            desc: h.description
          };
  
          const updatedHolidays = [...holidays, addedHoliday].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          setHolidays(updatedHolidays);
        }
      }
      
      setShowAddModal(false);
      setEditingHolidayId(null);
      setNewHoliday({ name: '', startDate: '', endDate: '', type: 'National Holiday', desc: '' });
      
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

  const totalDaysCount = holidays.reduce((acc, curr) => acc + (Number(curr.durationDays) || 1), 0);

  const stats = {
    total: holidays.length,
    totalDays: totalDaysCount,
    national: holidays.filter(h => h.type === 'National Holiday').length,
    restricted: holidays.filter(h => h.type === 'Restricted Holiday').length,
    company: holidays.filter(h => h.type === 'Company Holiday').length
  };

  const currentDuration = calculateDays(newHoliday.startDate, newHoliday.endDate);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-indigo-600" size={24} /> Holiday Calendar Setup
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Configure annual gazetted, multi-day festivals, restricted, and corporate holiday events for payroll and shifts calculations.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 no-print">
          {can(['create_holidays', 'manage_hrms']) && (
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer"
            >
              <Plus size={15} /> Add New Holiday
            </button>
          )}
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Total Events</div>
            <div className="text-xl font-bold text-slate-800 mt-1">
              {stats.total} <span className="text-xs font-semibold text-indigo-600">({stats.totalDays} Days)</span>
            </div>
          </div>
          <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-lg">
            <Calendar size={18} />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase">National Gazetted</div>
            <div className="text-xl font-bold text-emerald-800 mt-1">{stats.national}</div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <Sun size={18} />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase">Restricted (RH)</div>
            <div className="text-xl font-bold text-amber-800 mt-1">{stats.restricted}</div>
          </div>
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
            <Star size={18} />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[10px] font-bold text-purple-700 uppercase">Company Declared</div>
            <div className="text-xl font-bold text-purple-800 mt-1">{stats.company}</div>
          </div>
          <div className="bg-purple-100 text-purple-600 p-2.5 rounded-lg">
            <Info size={18} />
          </div>
        </div>

      </div>

      {/* Holiday Calendar List */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="bg-slate-50/80 p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Official Calendar Holiday Matrix</h3>
          <span className="text-[11px] text-slate-500 font-medium">Scheduled leaves for attendance & payroll</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3">Holiday Name</th>
                <th className="p-3">Date Range</th>
                <th className="p-3 text-center">Duration</th>
                <th className="p-3">Day of Week</th>
                <th className="p-3">Classification Type</th>
                <th className="p-3">Short Notes / Description</th>
                <th className="p-3 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                 <tr><td colSpan="7" className="p-6 text-center text-gray-500">Loading holidays...</td></tr>
              ) : holidays.length === 0 ? (
                 <tr><td colSpan="7" className="p-6 text-center text-gray-500 italic">No holidays scheduled yet. Click 'Add New Holiday' to create one.</td></tr>
              ) : (
                holidays.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-bold text-slate-800">{h.name}</td>
                    <td className="p-3 text-indigo-600 font-semibold font-mono whitespace-nowrap">
                      {formatDateDisplay(h.startDate, h.endDate)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {h.durationDays} {h.durationDays > 1 ? 'Days' : 'Day'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-medium whitespace-nowrap">{h.day}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        h.type === 'National Holiday' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        h.type === 'Restricted Holiday' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-purple-50 text-purple-700 border border-purple-100'
                      }`}>
                        {h.type}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 max-w-xs truncate" title={h.desc}>{h.desc || '-'}</td>
                    <td className="p-3 text-right no-print whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {can(['edit_holidays', 'manage_hrms']) && (
                          <button 
                            onClick={() => handleOpenEditModal(h)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-indigo-600 border border-slate-200 transition"
                            title="Edit Holiday"
                          >
                            <Edit size={13} />
                          </button>
                        )}
                        {can(['delete_holidays', 'manage_hrms']) && (
                          <button 
                            onClick={() => handleDelete(h.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-600 border border-rose-100 transition"
                            title="Delete Holiday"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden text-xs transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 px-6 py-4.5 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-white">
                    {editingHolidayId ? 'Edit Holiday Details' : 'Add New Holiday'}
                  </h3>
                  <p className="text-[11px] text-indigo-100/80 font-normal">
                    {editingHolidayId ? 'Update event parameters and date span' : 'Schedule single or multi-day holidays'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddOrEditHoliday} className="p-6 space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Holiday Event Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={newHoliday.name}
                    onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium text-xs"
                    placeholder="e.g. Diwali Vacation, Durga Puja, Eid Holiday"
                    required
                  />
                </div>
              </div>

              {/* Start Date & End Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Starting Date <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <input 
                    type="date" 
                    value={newHoliday.startDate}
                    onChange={(e) => {
                      const s = e.target.value;
                      setNewHoliday(prev => ({
                        ...prev, 
                        startDate: s,
                        endDate: prev.endDate && new Date(prev.endDate) < new Date(s) ? s : (prev.endDate || s)
                      }));
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium text-xs cursor-pointer"
                    required
                  />
                  {newHoliday.startDate && (
                    <span className="text-[10px] text-indigo-600 font-semibold block mt-1">
                      {getDayName(newHoliday.startDate)}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Ending Date <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                  </div>
                  <input 
                    type="date" 
                    min={newHoliday.startDate}
                    value={newHoliday.endDate || newHoliday.startDate}
                    onChange={(e) => setNewHoliday({...newHoliday, endDate: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium text-xs cursor-pointer"
                  />
                  {newHoliday.endDate && (
                    <span className="text-[10px] text-indigo-600 font-semibold block mt-1">
                      {getDayName(newHoliday.endDate)}
                    </span>
                  )}
                </div>

                {/* Duration Badge */}
                {newHoliday.startDate && (
                  <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Calculated Holiday Duration:</span>
                    <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-bold border border-indigo-200">
                      ⏱️ {currentDuration} {currentDuration > 1 ? 'Days Vacation' : 'Single Day'}
                    </span>
                  </div>
                )}
              </div>

              {/* Classification Type */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Classification Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'National Holiday', icon: '🏛️' },
                    { label: 'Restricted Holiday', icon: '⭐' },
                    { label: 'Company Holiday', icon: '🏢' }
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.label}
                      onClick={() => setNewHoliday({...newHoliday, type: cat.label})}
                      className={`px-2.5 py-2 rounded-xl text-[10px] font-bold border transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                        newHoliday.type === cat.label 
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-700 ring-2 ring-indigo-200 shadow-xs' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span className="leading-tight">{cat.label.replace(' Holiday', '')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description / Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description / Remarks <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea 
                  value={newHoliday.desc}
                  onChange={(e) => setNewHoliday({...newHoliday, desc: e.target.value})}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none font-medium text-xs resize-none"
                  placeholder="Additional context, celebration plans, or shift applicability notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingHolidayId ? 'Update Holiday' : 'Save Holiday'}</span>
                  )}
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
