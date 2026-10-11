import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle, Sparkles, Coffee } from 'lucide-react';
import api from '../api';

const AttendancePunchWidget = ({ onAttendanceUpdated }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [myAttendance, setMyAttendance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPunching, setIsPunching] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's status
  useEffect(() => {
    fetchMyStatus();
  }, []);

  const fetchMyStatus = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/attendances/my-today');
      if (res.data?.success) {
        setMyAttendance(res.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch my today attendance", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePunchIn = async () => {
    if (isPunching) return;
    setIsPunching(true);
    setFeedback(null);
    try {
      const res = await api.post('/attendances/punch-in');
      if (res.data?.success) {
        setFeedback({ type: 'success', text: res.data.message });
        await fetchMyStatus();
        if (onAttendanceUpdated) onAttendanceUpdated();
        window.dispatchEvent(new Event('attendanceChanged'));
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setIsPunching(false);
    }
  };

  const handlePunchOut = async () => {
    if (isPunching) return;
    if (!window.confirm("Are you sure you want to Punch Out for the day?")) return;

    setIsPunching(true);
    setFeedback(null);
    try {
      const res = await api.post('/attendances/punch-out');
      if (res.data?.success) {
        setFeedback({ type: 'success', text: res.data.message });
        await fetchMyStatus();
        if (onAttendanceUpdated) onAttendanceUpdated();
        window.dispatchEvent(new Event('attendanceChanged'));
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setIsPunching(false);
    }
  };

  // Preview status if user punches right now
  const getExpectedStatus = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes <= 570) return { label: 'On Time (Present)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (totalMinutes <= 780) return { label: 'Late Entry', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Half Day', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const expected = getExpectedStatus();
  const hasIn = myAttendance?.hasPunchedIn;
  const hasOut = myAttendance?.hasPunchedOut;
  const record = myAttendance?.attendance;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-sm border border-slate-800/60 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Live Clock & Date */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner shrink-0">
            <Clock size={28} className="text-indigo-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/10 uppercase tracking-widest">
                LIVE
              </span>
            </div>
            <div className="text-xs text-indigo-200/80 font-medium mt-0.5">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Center: Shift status / Punch Info */}
        <div className="flex-1 md:px-6">
          {isLoading ? (
            <div className="text-xs text-indigo-200 animate-pulse">Syncing your attendance...</div>
          ) : hasOut ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-white flex flex-wrap items-center gap-1.5">
                    <span>Shift:</span>
                    <span className="text-indigo-200 font-semibold bg-white/10 px-2 py-0.5 rounded text-[11px] border border-white/10">
                      {record?.shift || myAttendance?.shift?.name || 'Morning General Shift'}
                    </span>
                    {myAttendance?.shift?.timingText && (
                      <span className="text-[11px] font-mono text-indigo-300">
                        ({myAttendance.shift.timingText})
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-indigo-200 mt-1 flex items-center gap-2">
                    <span>Punch In: <strong className="font-mono text-white">{record?.checkIn}</strong></span>
                    <span>&bull;</span>
                    <span>Punch Out: <strong className="font-mono text-white">{record?.checkOut}</strong></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  {record?.status}
                </span>
                <span className="text-xs font-mono font-bold text-white bg-black/20 px-2 py-0.5 rounded">
                  {record?.workingHours}
                </span>
              </div>
            </div>
          ) : hasIn ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <div className="text-xs font-bold text-white flex flex-wrap items-center gap-1.5">
                    <span>Active Shift:</span>
                    <span className="text-emerald-300 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded text-[11px] border border-emerald-500/30">
                      {record?.shift || myAttendance?.shift?.name || 'Morning General Shift'}
                    </span>
                    {myAttendance?.shift?.timingText && (
                      <span className="text-[11px] font-mono text-emerald-200">
                        ({myAttendance.shift.timingText})
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-indigo-200 mt-1">
                    Punched In at: <span className="font-mono font-bold text-emerald-300">{record?.checkIn}</span>
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${
                record?.status === 'Late' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                record?.status === 'Half Day' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                Status: {record?.status}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-indigo-200">
              <Sparkles size={14} className="text-amber-400" />
              <span>
                Shift: <strong>{myAttendance?.shift?.name || 'Morning General Shift'}</strong> ({myAttendance?.shift?.timingText || '10:00 AM - 06:00 PM'}) &bull; Expected: 
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                myAttendance?.shift?.expectedStatusNow === 'Present' ? 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30' :
                myAttendance?.shift?.expectedStatusNow === 'Late' ? 'text-amber-300 bg-amber-500/20 border-amber-500/30' :
                'text-rose-300 bg-rose-500/20 border-rose-500/30'
              }`}>
                {myAttendance?.shift?.expectedStatusNow || expected.label}
              </span>
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {!hasIn ? (
            <button
              onClick={handlePunchIn}
              disabled={isPunching}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-full shadow-xs transition disabled:opacity-50"
            >
              <LogIn size={15} />
              {isPunching ? 'Punching In...' : 'Punch In'}
            </button>
          ) : !hasOut ? (
            <button
              onClick={handlePunchOut}
              disabled={isPunching}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs rounded-full shadow-xs transition disabled:opacity-50"
            >
              <LogOut size={15} />
              {isPunching ? 'Punching Out...' : 'Punch Out'}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 text-emerald-300 text-xs font-semibold rounded-full border border-white/10">
              <Coffee size={14} /> Completed Today
            </div>
          )}
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-white/60 hover:text-white text-[10px] font-bold">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendancePunchWidget;
