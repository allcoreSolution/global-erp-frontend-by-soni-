import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  UserCheck, 
  UserX, 
  Clock, 
  Check, 
  RefreshCw, 
  Printer, 
  Download, 
  Sparkles, 
  AlertCircle, 
  SunMedium, 
  CalendarDays, 
  FileSpreadsheet, 
  Layers, 
  Info,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Users
} from 'lucide-react';
import api from '../../api';
import { usePermissions } from '../../utils/permissionUtils';
import AttendancePunchWidget from '../../components/AttendancePunchWidget';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DailyAttendance = () => {
  const { can } = usePermissions();
  const hasViewPermission = can(['view_hrms', 'view_attendance', 'admin', 'SuperAdmin', 'manage_hrms']);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  
  // Tab State: 'daily' | 'monthly'
  const [activeTab, setActiveTab] = useState('daily');

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // --- DAILY VIEW STATE ---
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [dailyHolidays, setDailyHolidays] = useState([]);
  const [dailyLeaves, setDailyLeaves] = useState([]);
  const [isDailyLoading, setIsDailyLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- MONTHLY VIEW STATE ---
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1-12
  const [monthlyData, setMonthlyData] = useState({
    totalDays: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(),
    attendanceRecords: [],
    holidays: [],
    leaves: []
  });
  const [employeesList, setEmployeesList] = useState([]);
  const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);

  // ----------------------------------------------------
  // INITIAL & EFFECT FETCHING
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyData();
    } else {
      fetchMonthlyData();
    }

    const handleAttendanceChange = () => {
      if (activeTab === 'daily') fetchDailyData();
      else fetchMonthlyData();
    };

    window.addEventListener('attendanceChanged', handleAttendanceChange);
    return () => window.removeEventListener('attendanceChanged', handleAttendanceChange);
  }, [selectedDate, activeTab, selectedYear, selectedMonth]);

  // ----------------------------------------------------
  // 1. FETCH DAILY ATTENDANCE
  // ----------------------------------------------------
  const fetchDailyData = async () => {
    setIsDailyLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        api.get('/employees'),
        api.get(`/attendances?date=${selectedDate}`)
      ]);

      const activeEmployees = empRes.data?.data?.filter(e => e.status !== 'Inactive') || [];
      const attendanceRecords = attRes.data?.data || [];
      const holidays = attRes.data?.holidays || [];
      const leaves = attRes.data?.leaves || [];

      setDailyHolidays(holidays);
      setDailyLeaves(leaves);

      // Check if selectedDate is Sunday
      const dateObj = new Date(selectedDate + 'T00:00:00');
      const isSunday = dateObj.getDay() === 0;

      // Check if selectedDate matches any company holiday
      const activeHoliday = holidays.find(h => {
        const s = h.startDate || h.holidayDate;
        const e = h.endDate || s;
        return s && selectedDate >= s && selectedDate <= (e || s);
      });

      // Merge active employees with records, holidays, and approved leaves
      const merged = activeEmployees.map(emp => {
        // Match record by employee ID, code, or trimmed name
        const empNameTrimmed = (emp.employeeName || '').trim().toLowerCase();
        const empCodeTrimmed = (emp.employeeId || '').trim();

        const record = attendanceRecords.find(a => 
          (a.employee && (a.employee._id === emp._id || a.employee === emp._id)) ||
          (a.employeeId && a.employeeId.trim() === empCodeTrimmed) ||
          (a.employeeName && a.employeeName.trim().toLowerCase() === empNameTrimmed)
        );

        // Check if employee has an approved leave on this date
        const empLeave = leaves.find(l => 
          (l.employee && (l.employee._id === emp._id || l.employee === emp._id)) ||
          (l.employeeId && l.employeeId.trim() === empCodeTrimmed) ||
          (l.employeeName && l.employeeName.trim().toLowerCase() === empNameTrimmed)
        );

        let finalStatus = 'Absent';
        let markedBy = 'Admin';

        if (record) {
          finalStatus = record.status;
          markedBy = record.markedBy || 'Self';
        } else if (activeHoliday) {
          finalStatus = 'Holiday';
          markedBy = activeHoliday.eventName || 'Holiday';
        } else if (empLeave) {
          finalStatus = 'On Leave';
          markedBy = empLeave.leaveType || 'Approved Leave';
        } else if (isSunday) {
          finalStatus = 'Weekly Off';
          markedBy = 'Sunday Off';
        }

        const cleanDept = (emp.department || 'General').trim();

        return {
          id: emp._id,
          displayId: emp.employeeId || 'N/A',
          name: (emp.employeeName || 'Unknown').trim(),
          role: cleanDept || emp.designation || 'Staff',
          department: cleanDept,
          shift: emp.shift || record?.shift || 'General Shift',
          checkIn: record ? record.checkIn : '--',
          checkOut: record ? record.checkOut : '--',
          workingHours: record ? (record.workingHours || '-') : '-',
          markedBy,
          status: finalStatus
        };
      });

      // Include extra users with punch records not in employee directory
      attendanceRecords.forEach(rec => {
        const recNameTrimmed = (rec.employeeName || '').trim().toLowerCase();
        const recIdTrimmed = (rec.employeeId || '').trim();

        const exists = merged.some(m => 
          (rec.employee && (m.id === rec.employee._id || m.id === rec.employee)) ||
          (recIdTrimmed && m.displayId.trim() === recIdTrimmed) ||
          (recNameTrimmed && m.name.toLowerCase() === recNameTrimmed)
        );
        if (!exists) {
          merged.push({
            id: rec._id,
            displayId: rec.employeeId || 'USR',
            name: (rec.employeeName || rec.employee?.employeeName || 'Staff Member').trim(),
            role: 'User',
            department: 'Staff',
            shift: rec.shift || 'General Shift',
            checkIn: rec.checkIn || '--',
            checkOut: rec.checkOut || '--',
            workingHours: rec.workingHours || '-',
            markedBy: rec.markedBy || 'Self',
            status: rec.status || 'Present'
          });
        }
      });

      setDailyAttendance(merged);
    } catch (error) {
      console.error('Failed to fetch daily attendance data', error);
    } finally {
      setIsDailyLoading(false);
    }
  };

  // ----------------------------------------------------
  // 2. FETCH MONTHLY ATTENDANCE (MUSTER ROLL)
  // ----------------------------------------------------
  const fetchMonthlyData = async () => {
    setIsMonthlyLoading(true);
    try {
      const [empRes, monthlyRes] = await Promise.all([
        api.get('/employees'),
        api.get(`/attendances/monthly?year=${selectedYear}&month=${selectedMonth}`)
      ]);

      const activeEmployees = empRes.data?.data?.filter(e => e.status !== 'Inactive') || [];
      setEmployeesList(activeEmployees);

      if (monthlyRes.data?.success) {
        setMonthlyData(monthlyRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch monthly attendance data', error);
    } finally {
      setIsMonthlyLoading(false);
    }
  };

  // ----------------------------------------------------
  // DAILY STATS & HELPERS
  // ----------------------------------------------------
  const dailyDateObj = useMemo(() => new Date(selectedDate + 'T00:00:00'), [selectedDate]);
  const isSelectedDateSunday = dailyDateObj.getDay() === 0;
  const selectedDateHoliday = dailyHolidays.find(h => {
    const s = h.startDate || h.holidayDate;
    const e = h.endDate || s;
    return s && selectedDate >= s && selectedDate <= (e || s);
  });

  const filteredDailyAttendance = useMemo(() => {
    return dailyAttendance.filter(item => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
                            item.name.toLowerCase().includes(q) ||
                            item.displayId.toLowerCase().includes(q) ||
                            item.role.toLowerCase().includes(q);
      const matchesDept = departmentFilter === 'All' || item.department.trim().toLowerCase() === departmentFilter.trim().toLowerCase();
      return matchesSearch && matchesDept;
    });
  }, [dailyAttendance, searchQuery, departmentFilter]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(dailyAttendance.map(a => (a.department || '').trim()).filter(Boolean));
    return ['All', ...Array.from(depts)];
  }, [dailyAttendance]);

  const dailyStats = {
    total: dailyAttendance.length,
    present: dailyAttendance.filter(a => a.status === 'Present').length,
    late: dailyAttendance.filter(a => a.status === 'Late').length,
    halfDay: dailyAttendance.filter(a => a.status === 'Half Day').length,
    weeklyOff: dailyAttendance.filter(a => a.status === 'Weekly Off' || a.status === 'Holiday').length,
    onLeave: dailyAttendance.filter(a => a.status === 'On Leave').length,
    absent: dailyAttendance.filter(a => a.status === 'Absent').length
  };

  // ----------------------------------------------------
  // MONTHLY DYNAMIC DAYS & MATRIX CALCULATOR
  // ----------------------------------------------------
  const dynamicTotalDays = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate(); // 28, 29, 30, 31
  }, [selectedYear, selectedMonth]);

  const daysArray = useMemo(() => {
    const arr = [];
    for (let d = 1; d <= dynamicTotalDays; d++) {
      const padM = String(selectedMonth).padStart(2, '0');
      const padD = String(d).padStart(2, '0');
      const dateStr = `${selectedYear}-${padM}-${padD}`;
      const dObj = new Date(dateStr + 'T00:00:00');
      const dayOfWeek = dObj.getDay();
      const isSun = dayOfWeek === 0;

      // Check holiday
      const isHol = (monthlyData.holidays || []).some(h => {
        const s = h.startDate || h.holidayDate;
        const e = h.endDate || s;
        return s && dateStr >= s && dateStr <= (e || s);
      });

      arr.push({
        dayNumber: d,
        dateStr,
        dayAbbr: DAY_ABBR[dayOfWeek],
        isSunday: isSun,
        isHoliday: isHol,
        isFuture: dateStr > todayStr
      });
    }
    return arr;
  }, [selectedYear, selectedMonth, dynamicTotalDays, monthlyData.holidays, todayStr]);

  // Compute Employee Monthly Matrix
  const monthlyMatrix = useMemo(() => {
    const records = monthlyData.attendanceRecords || [];
    const holidays = monthlyData.holidays || [];
    const leaves = monthlyData.leaves || [];

    const filteredEmps = employeesList.filter(emp => {
      const matchesSearch = (emp.employeeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (emp.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (emp.department || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;
      return matchesSearch && matchesDept;
    });

    return filteredEmps.map(emp => {
      let pCount = 0;
      let lateCount = 0;
      let hdCount = 0;
      let woCount = 0;
      let hCount = 0;
      let leaveCount = 0;
      let aCount = 0;

      const dayCells = daysArray.map(day => {
        const { dateStr, isSunday, isHoliday, isFuture } = day;

        // Find punch record
        const rec = records.find(r => 
          r.date === dateStr &&
          ((r.employee && (r.employee._id === emp._id || r.employee === emp._id)) ||
           (r.employeeId && r.employeeId === emp.employeeId) ||
           (r.employeeName && r.employeeName.toLowerCase() === (emp.employeeName || '').toLowerCase()))
        );

        // Find approved leave
        const hasLeave = leaves.some(l => 
          ((l.employee && (l.employee._id === emp._id || l.employee === emp._id)) ||
           (l.employeeId && l.employeeId === emp.employeeId) ||
           (l.employeeName && l.employeeName.toLowerCase() === (emp.employeeName || '').toLowerCase())) &&
          l.startDate <= dateStr && l.endDate >= dateStr
        );

        let code = '-';
        let bgClass = 'text-slate-300 bg-slate-50/50';

        if (rec) {
          if (rec.status === 'Present') {
            code = 'P';
            bgClass = 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100/80';
            pCount++;
          } else if (rec.status === 'Late') {
            code = 'L';
            bgClass = 'bg-amber-50 text-amber-700 font-bold border border-amber-100/80';
            lateCount++;
            pCount++;
          } else if (rec.status === 'Half Day') {
            code = 'HD';
            bgClass = 'bg-purple-50 text-purple-700 font-bold border border-purple-100/80';
            hdCount++;
          } else if (rec.status === 'On Leave') {
            code = 'LV';
            bgClass = 'bg-blue-50 text-blue-700 font-bold border border-blue-100/80';
            leaveCount++;
          } else {
            code = 'A';
            bgClass = 'bg-rose-50 text-rose-700 font-bold border border-rose-100/80';
            aCount++;
          }
        } else if (hasLeave) {
          code = 'LV';
          bgClass = 'bg-blue-50 text-blue-700 font-bold border border-blue-100/80';
          leaveCount++;
        } else if (isHoliday) {
          code = 'H';
          bgClass = 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/80';
          hCount++;
        } else if (isSunday) {
          code = 'WO';
          bgClass = 'bg-slate-100 text-slate-600 font-bold border border-slate-200/50';
          woCount++;
        } else if (isFuture) {
          code = '-';
          bgClass = 'text-slate-300 bg-slate-50/40';
        } else {
          // Past working day without punch
          code = 'A';
          bgClass = 'bg-rose-50 text-rose-600 font-medium border border-rose-100/60';
          aCount++;
        }

        return {
          dayNumber: day.dayNumber,
          dateStr,
          code,
          bgClass,
          isSunday,
          isHoliday
        };
      });

      // Total Payable Days formula:
      // Present + (0.5 * HalfDay) + WeeklyOffs + Declared Holidays + Approved Leaves
      const payableDays = pCount + (hdCount * 0.5) + woCount + hCount + leaveCount;

      return {
        empId: emp.employeeId || 'EMP',
        name: emp.employeeName || 'Unknown',
        dept: emp.department || emp.designation || 'Staff',
        shift: emp.shift || 'General Shift',
        dayCells,
        summary: {
          present: pCount,
          late: lateCount,
          halfDay: hdCount,
          weeklyOff: woCount,
          holidays: hCount,
          leaves: leaveCount,
          absent: aCount,
          payableDays: Number(payableDays.toFixed(1))
        }
      };
    });
  }, [employeesList, monthlyData, daysArray, searchQuery, departmentFilter]);

  // Monthly Overview Stats
  const monthSundaysCount = useMemo(() => daysArray.filter(d => d.isSunday).length, [daysArray]);
  const monthHolidaysCount = useMemo(() => daysArray.filter(d => d.isHoliday && !d.isSunday).length, [daysArray]);
  const workingDaysCount = dynamicTotalDays - (monthSundaysCount + monthHolidaysCount);

  // ----------------------------------------------------
  // DAILY ACTIONS: QUICK STATUS CHANGE & BULK PRESENT
  // ----------------------------------------------------
  const handleStatusChange = async (id, newStatus) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      let checkIn = '--';
      let checkOut = '--';

      if (newStatus === 'Present') {
        checkIn = '09:30 AM';
        checkOut = '06:00 PM';
      } else if (newStatus === 'Late') {
        checkIn = '10:00 AM';
        checkOut = '06:00 PM';
      } else if (newStatus === 'Half Day') {
        checkIn = '01:30 PM';
        checkOut = '06:00 PM';
      }

      await api.post('/attendances', {
        employeeId: id,
        date: selectedDate,
        status: newStatus,
        checkIn,
        checkOut
      });

      // Update locally
      setDailyAttendance(prev => prev.map(emp => {
        if (emp.id === id) {
          return { ...emp, status: newStatus, checkIn, checkOut, markedBy: 'Admin' };
        }
        return emp;
      }));
    } catch (error) {
      console.error('Failed to mark attendance', error);
      alert('Failed to mark attendance: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAllPresent = async () => {
    if (isUpdating) return;
    if (!window.confirm(`Mark all ${dailyAttendance.length} employees as Present for ${selectedDate}?`)) return;

    setIsUpdating(true);
    try {
      const recordsToUpdate = dailyAttendance.map(emp => ({
        employeeId: emp.id,
        date: selectedDate,
        status: 'Present',
        checkIn: '09:30 AM',
        checkOut: '06:00 PM'
      }));

      await api.post('/attendances/bulk', { records: recordsToUpdate });

      setDailyAttendance(prev => prev.map(emp => ({
        ...emp,
        status: 'Present',
        checkIn: '09:30 AM',
        checkOut: '06:00 PM',
        markedBy: 'Admin'
      })));
    } catch (error) {
      console.error('Failed to bulk mark attendance', error);
      alert('Failed to mark all as present: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  // ----------------------------------------------------
  // EXPORT CSV HANDLERS
  // ----------------------------------------------------
  const handleExportDailyCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Department / Role', 'Clock In', 'Clock Out', 'Hours', 'Status', 'Marked By'];
    const rows = dailyAttendance.map(a => [a.displayId, a.name, a.role, a.checkIn, a.checkOut, a.workingHours, a.status, a.markedBy]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_Log_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMonthlyCSV = () => {
    const dayHeaders = daysArray.map(d => `${d.dayNumber}-${d.dayAbbr}`);
    const headers = ['Emp ID', 'Employee Name', 'Department', 'Shift', ...dayHeaders, 'Present(P)', 'HalfDay(HD)', 'WeeklyOff(WO)', 'Holiday(H)', 'Leave(LV)', 'Absent(A)', 'Payable Days'];
    
    const rows = monthlyMatrix.map(m => {
      const cellCodes = m.dayCells.map(c => c.code);
      return [
        m.empId,
        `"${m.name}"`,
        `"${m.dept}"`,
        `"${m.shift}"`,
        ...cellCodes,
        m.summary.present,
        m.summary.halfDay,
        m.summary.weeklyOff,
        m.summary.holidays,
        m.summary.leaves,
        m.summary.absent,
        m.summary.payableDays
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Monthly_Muster_Roll_${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-50/40 p-3 sm:p-5 rounded-2xl min-h-screen space-y-5 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. SELF PUNCH WIDGET (Top live real-time attendance widget) */}
      <AttendancePunchWidget onAttendanceUpdated={() => {
        if (activeTab === 'daily') fetchDailyData();
        else fetchMonthlyData();
      }} />

      {/* 2. MAIN CARD WRAPPER WITH ULTRA-DELICATE BORDERS */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] space-y-5">
        
        {/* Info Banner: Shown when user does not have permission to view all employees (Self View Mode) */}
        {!hasViewPermission && (
          <div className="bg-indigo-50/50 border border-indigo-100/80 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-900 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <UserCheck size={15} />
              </div>
              <div>
                <span className="font-bold text-indigo-800">Personal Attendance Record:</span>{' '}
                <span className="text-slate-600">Aapka apna attendance record dikhaya ja raha hai. Company-wide muster roll dekhne ke liye manager rights required hain.</span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-white px-2.5 py-1 rounded-full border border-indigo-200/60 shadow-xs">
              Self Attendance View
            </span>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100/90 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-2 bg-indigo-50/70 text-indigo-600 rounded-xl">
                <UserCheck size={22} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
                  Attendance Center
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">
                  {activeTab === 'daily'
                    ? `Live attendance logs for ${selectedDate} &bull; Sundays, Holidays & Leaves auto-detected.`
                    : `Monthly muster roll matrix for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} (${dynamicTotalDays} Days).`}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tab Pills & Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5 no-print">
            
            {/* Pill Tab Switcher */}
            <div className="flex bg-slate-100/70 p-1 rounded-full border border-slate-200/40 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('daily')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition text-xs ${
                  activeTab === 'daily'
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar size={13} /> Daily Register
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition text-xs ${
                  activeTab === 'monthly'
                    ? 'bg-white text-indigo-600 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileSpreadsheet size={13} /> Monthly Muster Roll
              </button>
            </div>

            {/* Quick Export / Print */}
            {activeTab === 'daily' ? (
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handleExportDailyCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full transition"
                >
                  <Download size={13} /> Export CSV
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-full shadow-xs transition"
                >
                  <Printer size={13} /> Print
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handleExportMonthlyCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full transition"
                >
                  <Download size={13} /> Export CSV
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-full shadow-xs transition"
                >
                  <Printer size={13} /> Print
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search, Filter & Date Selectors Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/60 p-3 rounded-xl border border-slate-100/80">
          
          {/* Left: Search & Dept Filter */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff by name / ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-full border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 font-medium placeholder-slate-400 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-slate-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="text-xs py-1.5 px-3 bg-white rounded-full border border-slate-200/50 outline-none focus:border-indigo-400 text-slate-700 font-medium cursor-pointer shadow-xs transition hover:border-slate-300"
              >
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Date / Month Controls */}
          <div className="flex items-center gap-2">
            {activeTab === 'daily' ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date:</span>
                <input 
                  type="date" 
                  value={selectedDate}
                  max={todayStr}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val > todayStr) {
                      alert("Future date cannot be selected for daily attendance!");
                      return;
                    }
                    setSelectedDate(val || todayStr);
                  }}
                  className="text-xs px-3 py-1.5 border border-slate-200/50 rounded-full outline-none focus:border-indigo-400 font-semibold text-slate-700 bg-white shadow-xs transition hover:border-slate-300"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Month Dropdown */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="text-xs px-3 py-1.5 border border-slate-200/50 rounded-full font-semibold text-slate-700 bg-white shadow-xs outline-none focus:border-indigo-400 cursor-pointer transition hover:border-slate-300"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx + 1}>{name}</option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-xs px-3 py-1.5 border border-slate-200/50 rounded-full font-semibold text-slate-700 bg-white shadow-xs outline-none focus:border-indigo-400 cursor-pointer transition hover:border-slate-300"
                >
                  {[2024, 2025, 2026, 2027].map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: DAILY ATTENDANCE REGISTER */}
        {/* ========================================================================= */}
        {activeTab === 'daily' && (
          <div className="space-y-4">

            {/* Sunday / Holiday Announcement Banners */}
            {isSelectedDateSunday && (
              <div className="bg-slate-100/80 border border-slate-200/60 text-slate-800 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-700 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px]">
                    Weekly Off
                  </span>
                  <span><strong>{selectedDate}</strong> is a <strong>Sunday</strong>. Staff without punch are automatically marked as <strong>Weekly Off (WO)</strong>, not Absent.</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Normal Payroll rules apply</span>
              </div>
            )}

            {selectedDateHoliday && (
              <div className="bg-indigo-50/60 border border-indigo-100 text-indigo-900 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px]">
                    Holiday
                  </span>
                  <span>Company Holiday: <strong>{selectedDateHoliday.eventName}</strong> ({selectedDateHoliday.classificationType || 'Holiday'}). Marked as <strong>Holiday (H)</strong>.</span>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 hidden sm:inline">100% Paid Day</span>
              </div>
            )}

            {/* Daily Stat Cards (Thin Borders, Soft Shadows, Rounded Corners) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Strength</div>
                  <div className="text-xl font-bold text-slate-800 mt-0.5">{dailyStats.total}</div>
                </div>
                <button onClick={fetchDailyData} className="bg-slate-50 text-slate-600 p-2 rounded-full hover:bg-slate-100 transition">
                  <RefreshCw size={13} className={isDailyLoading ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="bg-emerald-50/30 border border-emerald-100/60 rounded-xl p-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Present Today</div>
                  <div className="text-xl font-bold text-emerald-800 mt-0.5">{dailyStats.present}</div>
                </div>
                <div className="bg-emerald-100/60 text-emerald-600 p-2 rounded-full">
                  <UserCheck size={14} />
                </div>
              </div>

              <div className="bg-amber-50/30 border border-amber-100/60 rounded-xl p-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Late Entries</div>
                  <div className="text-xl font-bold text-amber-800 mt-0.5">{dailyStats.late}</div>
                </div>
                <div className="bg-amber-100/60 text-amber-600 p-2 rounded-full">
                  <Clock size={14} />
                </div>
              </div>

              <div className="bg-purple-50/30 border border-purple-100/60 rounded-xl p-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">Half Day</div>
                  <div className="text-xl font-bold text-purple-800 mt-0.5">{dailyStats.halfDay}</div>
                </div>
                <div className="bg-purple-100/60 text-purple-600 p-2 rounded-full">
                  <SunMedium size={14} />
                </div>
              </div>

              <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Off / Holiday</div>
                  <div className="text-xl font-bold text-slate-700 mt-0.5">{dailyStats.weeklyOff}</div>
                </div>
                <div className="bg-slate-200/60 text-slate-600 p-2 rounded-full">
                  <CalendarDays size={14} />
                </div>
              </div>

              <div className="bg-rose-50/30 border border-rose-100/60 rounded-xl p-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">Absent Today</div>
                  <div className="text-xl font-bold text-rose-800 mt-0.5">{dailyStats.absent}</div>
                </div>
                <div className="bg-rose-100/60 text-rose-600 p-2 rounded-full">
                  <UserX size={14} />
                </div>
              </div>
            </div>

            {/* Daily Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500">Muster Date:</span>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-100/80">
                    {selectedDate} ({dailyDateObj.toLocaleDateString('en-US', { weekday: 'long' })})
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium ml-1">
                    {hasViewPermission ? `Showing ${filteredDailyAttendance.length} staff` : 'Showing your attendance'}
                  </span>
                </div>

                {can(['edit_hrms', 'manage_hrms', 'admin']) && (
                  <button 
                    onClick={handleMarkAllPresent}
                    disabled={isUpdating || filteredDailyAttendance.length === 0}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs rounded-full shadow-xs transition no-print disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Mark All Present'}
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3 pl-4">Emp ID</th>
                      <th className="p-3">Employee Name</th>
                      <th className="p-3">Role & Dept</th>
                      <th className="p-3">Shift Timing</th>
                      <th className="p-3">Clock In</th>
                      <th className="p-3">Clock Out</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Remarks</th>
                      {can(['edit_hrms', 'manage_hrms', 'admin']) && (
                        <th className="p-3 text-right pr-4 no-print">Quick Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/70">
                    {isDailyLoading ? (
                      <tr>
                        <td colSpan="10" className="p-10 text-center text-slate-400 font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="animate-spin text-indigo-500" size={15} />
                            Loading attendance records...
                          </div>
                        </td>
                      </tr>
                    ) : filteredDailyAttendance.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="p-10 text-center text-slate-400 font-medium">
                          No matching employee records found.
                        </td>
                      </tr>
                    ) : (
                      filteredDailyAttendance.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3 pl-4 font-semibold text-slate-600">
                            <span className="bg-slate-100/80 px-2 py-0.5 rounded-full font-mono text-[10px] text-slate-700 border border-slate-200/40">
                              {emp.displayId}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-800">{emp.name}</td>
                          <td className="p-3 text-slate-500">
                            <div>{emp.role}</div>
                            <div className="text-[10px] text-slate-400">{emp.department}</div>
                          </td>
                          <td className="p-3">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50/70 text-indigo-700 border border-indigo-100/70">
                              {emp.shift || 'General Shift'}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-indigo-700">{emp.checkIn}</td>
                          <td className="p-3 font-mono font-semibold text-slate-600">{emp.checkOut}</td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{emp.workingHours}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              emp.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/80' :
                              emp.status === 'Late' ? 'bg-amber-50 text-amber-700 border border-amber-100/80' :
                              emp.status === 'Half Day' ? 'bg-purple-50 text-purple-700 border border-purple-100/80' :
                              emp.status === 'Weekly Off' ? 'bg-slate-100 text-slate-700 border border-slate-200/50' :
                              emp.status === 'Holiday' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/80' :
                              emp.status === 'On Leave' ? 'bg-blue-50 text-blue-700 border border-blue-100/80' :
                              'bg-rose-50 text-rose-700 border border-rose-100/80'
                            }`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {emp.markedBy}
                            </span>
                          </td>
                          {can(['edit_hrms', 'manage_hrms', 'admin']) && (
                            <td className="p-3 text-right pr-4 space-x-1 no-print">
                              <button 
                                onClick={() => handleStatusChange(emp.id, 'Present')}
                                disabled={isUpdating}
                                title="Mark Present (09:30 AM - 06:00 PM)"
                                className={`w-6 h-6 inline-flex items-center justify-center text-[9px] font-bold rounded-full transition border disabled:opacity-50 ${
                                  emp.status === 'Present' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white hover:bg-slate-50 border-slate-200/60 text-slate-600'
                                }`}
                              >
                                P
                              </button>
                              <button 
                                onClick={() => handleStatusChange(emp.id, 'Late')}
                                disabled={isUpdating}
                                title="Mark Late (10:00 AM - 06:00 PM)"
                                className={`w-6 h-6 inline-flex items-center justify-center text-[9px] font-bold rounded-full transition border disabled:opacity-50 ${
                                  emp.status === 'Late' ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'bg-white hover:bg-slate-50 border-slate-200/60 text-slate-600'
                                }`}
                              >
                                L
                              </button>
                              <button 
                                onClick={() => handleStatusChange(emp.id, 'Half Day')}
                                disabled={isUpdating}
                                title="Mark Half Day (01:30 PM - 06:00 PM)"
                                className={`w-6 h-6 inline-flex items-center justify-center text-[9px] font-bold rounded-full transition border disabled:opacity-50 ${
                                  emp.status === 'Half Day' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white hover:bg-slate-50 border-slate-200/60 text-slate-600'
                                }`}
                              >
                                HD
                              </button>
                              <button 
                                onClick={() => handleStatusChange(emp.id, 'Absent')}
                                disabled={isUpdating}
                                title="Mark Absent"
                                className={`w-6 h-6 inline-flex items-center justify-center text-[9px] font-bold rounded-full transition border disabled:opacity-50 ${
                                  emp.status === 'Absent' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-white hover:bg-slate-50 border-slate-200/60 text-slate-600'
                                }`}
                              >
                                A
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: MONTHLY ATTENDANCE MUSTER ROLL (FULL MONTH MATRIX) */}
        {/* ========================================================================= */}
        {activeTab === 'monthly' && (
          <div className="space-y-4">

            {/* Month Summary Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Days in Month</div>
                <div className="text-xl font-bold text-slate-800 mt-1">
                  {dynamicTotalDays} <span className="text-xs font-semibold text-slate-400">Days</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Dynamic calendar logic</div>
              </div>

              <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Sundays / Offs</div>
                <div className="text-xl font-bold text-slate-700 mt-1">
                  {monthSundaysCount} <span className="text-xs font-semibold text-slate-400">Days</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Marked as WO (Paid)</div>
              </div>

              <div className="bg-indigo-50/30 border border-indigo-100/60 rounded-xl p-3.5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]">
                <div className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Company Holidays</div>
                <div className="text-xl font-bold text-indigo-800 mt-1">
                  {monthHolidaysCount} <span className="text-xs font-semibold text-indigo-500">Days</span>
                </div>
                <div className="text-[10px] text-indigo-400 mt-0.5">Marked as H (Paid)</div>
              </div>

              <div className="bg-emerald-50/30 border border-emerald-100/60 rounded-xl p-3.5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]">
                <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Active Working Days</div>
                <div className="text-xl font-bold text-emerald-800 mt-1">
                  {workingDaysCount} <span className="text-xs font-semibold text-emerald-500">Days</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Total - (Offs + Holidays)</div>
              </div>

              <div className="bg-purple-50/30 border border-purple-100/60 rounded-xl p-3.5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] col-span-2 sm:col-span-1">
                <div className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">Staff Count</div>
                <div className="text-xl font-bold text-purple-800 mt-1">
                  {employeesList.length} <span className="text-xs font-semibold text-purple-500">Staff</span>
                </div>
                <div className="text-[10px] text-purple-400 mt-0.5">Tracked in Register</div>
              </div>
            </div>

            {/* Legend Bar */}
            <div className="flex flex-wrap items-center gap-2.5 p-2.5 bg-slate-50/60 rounded-xl border border-slate-100 text-xs">
              <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">Legend:</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/80 text-[9px] font-bold">P</span>
                <span className="text-slate-500 text-[11px]">Present</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-50 text-amber-700 border border-amber-100/80 text-[9px] font-bold">L</span>
                <span className="text-slate-500 text-[11px]">Late</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-50 text-purple-700 border border-purple-100/80 text-[9px] font-bold">HD</span>
                <span className="text-slate-500 text-[11px]">Half Day</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200/50 text-[9px] font-bold">WO</span>
                <span className="text-slate-500 text-[11px]">Weekly Off</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/80 text-[9px] font-bold">H</span>
                <span className="text-slate-500 text-[11px]">Holiday</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-50 text-blue-700 border border-blue-100/80 text-[9px] font-bold">LV</span>
                <span className="text-slate-500 text-[11px]">Leave</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-rose-50 text-rose-700 border border-rose-100/80 text-[9px] font-bold">A</span>
                <span className="text-slate-500 text-[11px]">Absent</span>
              </span>
            </div>

            {/* Monthly Muster Roll Table */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-600 font-bold">
                      {/* Fixed Left Columns */}
                      <th className="p-2.5 min-w-[75px] sticky left-0 bg-slate-50/90 backdrop-blur-xs z-10 border-r border-slate-100">
                        Emp ID
                      </th>
                      <th className="p-2.5 min-w-[130px] sticky left-[75px] bg-slate-50/90 backdrop-blur-xs z-10 border-r border-slate-100 shadow-xs">
                        Employee Name
                      </th>
                      
                      {/* Dynamic Days Columns 1 to 28/29/30/31 */}
                      {daysArray.map(day => (
                        <th 
                          key={day.dayNumber} 
                          className={`p-1 text-center min-w-[28px] border-r border-slate-100/60 ${
                            day.isSunday ? 'bg-slate-100/70 text-slate-700' :
                            day.isHoliday ? 'bg-indigo-50/70 text-indigo-800' :
                            'text-slate-500'
                          }`}
                          title={day.dateStr}
                        >
                          <div className="text-[10px] leading-tight font-bold">{day.dayNumber}</div>
                          <div className={`text-[8px] uppercase tracking-tighter ${day.isSunday ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                            {day.dayAbbr}
                          </div>
                        </th>
                      ))}

                      {/* Summary Total Columns */}
                      <th className="p-1.5 text-center bg-emerald-50/40 text-emerald-800 font-bold border-r border-slate-100 min-w-[32px]" title="Total Present">
                        P
                      </th>
                      <th className="p-1.5 text-center bg-purple-50/40 text-purple-800 font-bold border-r border-slate-100 min-w-[32px]" title="Total Half Days">
                        HD
                      </th>
                      <th className="p-1.5 text-center bg-slate-50 text-slate-700 font-bold border-r border-slate-100 min-w-[32px]" title="Weekly Offs">
                        WO
                      </th>
                      <th className="p-1.5 text-center bg-indigo-50/40 text-indigo-800 font-bold border-r border-slate-100 min-w-[32px]" title="Holidays">
                        H
                      </th>
                      <th className="p-1.5 text-center bg-blue-50/40 text-blue-800 font-bold border-r border-slate-100 min-w-[32px]" title="Approved Leaves">
                        LV
                      </th>
                      <th className="p-1.5 text-center bg-rose-50/40 text-rose-800 font-bold border-r border-slate-100 min-w-[32px]" title="Total Absents">
                        A
                      </th>
                      <th className="p-2 text-center bg-indigo-600 text-white font-bold min-w-[65px] rounded-tl-lg" title="Total Payable Days (Salary Basis)">
                        Payable
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {isMonthlyLoading ? (
                      <tr>
                        <td colSpan={dynamicTotalDays + 9} className="p-12 text-center text-slate-400 font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="animate-spin text-indigo-500" size={16} />
                            Generating monthly attendance muster roll...
                          </div>
                        </td>
                      </tr>
                    ) : monthlyMatrix.length === 0 ? (
                      <tr>
                        <td colSpan={dynamicTotalDays + 9} className="p-12 text-center text-slate-400 font-medium">
                          No matching active staff found.
                        </td>
                      </tr>
                    ) : (
                      monthlyMatrix.map((emp) => (
                        <tr key={emp.empId} className="hover:bg-slate-50/40 transition">
                          {/* Sticky Columns */}
                          <td className="p-2 pl-3 font-mono font-semibold text-slate-600 sticky left-0 bg-white z-10 border-r border-slate-100">
                            <span className="bg-slate-100/80 px-1.5 py-0.5 rounded-full text-[10px] text-slate-600">
                              {emp.empId}
                            </span>
                          </td>
                          <td className="p-2 font-bold text-slate-800 sticky left-[75px] bg-white z-10 border-r border-slate-100 shadow-xs whitespace-nowrap">
                            {emp.name}
                            <span className="block text-[9px] font-normal text-slate-400">{emp.dept}</span>
                          </td>

                          {/* 1..N Day Badges */}
                          {emp.dayCells.map(cell => (
                            <td 
                              key={cell.dayNumber} 
                              className={`p-0.5 text-center border-r border-slate-100/50 ${cell.isSunday ? 'bg-slate-50/30' : ''}`}
                            >
                              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[8.5px] ${cell.bgClass}`}>
                                {cell.code}
                              </span>
                            </td>
                          ))}

                          {/* Summary Badges */}
                          <td className="p-1.5 text-center font-bold text-emerald-700 bg-emerald-50/20 border-r border-slate-100">
                            {emp.summary.present}
                          </td>
                          <td className="p-1.5 text-center font-bold text-purple-700 bg-purple-50/20 border-r border-slate-100">
                            {emp.summary.halfDay}
                          </td>
                          <td className="p-1.5 text-center font-bold text-slate-600 bg-slate-50/40 border-r border-slate-100">
                            {emp.summary.weeklyOff}
                          </td>
                          <td className="p-1.5 text-center font-bold text-indigo-700 bg-indigo-50/20 border-r border-slate-100">
                            {emp.summary.holidays}
                          </td>
                          <td className="p-1.5 text-center font-bold text-blue-700 bg-blue-50/20 border-r border-slate-100">
                            {emp.summary.leaves}
                          </td>
                          <td className="p-1.5 text-center font-bold text-rose-700 bg-rose-50/20 border-r border-slate-100">
                            {emp.summary.absent}
                          </td>
                          <td className="p-1.5 text-center font-black text-indigo-700 bg-indigo-50/50">
                            <span className="inline-block px-2 py-0.5 bg-indigo-100/70 text-indigo-800 rounded-full text-[10px]">
                              {emp.summary.payableDays}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DailyAttendance;
