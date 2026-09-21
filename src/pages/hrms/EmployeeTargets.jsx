import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, X, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const EmployeeTargets = () => {
  const navigate = useNavigate();
  const [targets, setTargets] = useState([]);

  const fetchTargets = async () => {
    try {
      const [tgtRes, empRes] = await Promise.all([
        api.get('/employee-targets'),
        api.get('/employees').catch(() => ({ data: { data: [] } }))
      ]);
      
      const employees = empRes.data?.data || [];
      const empMap = employees.reduce((acc, emp) => {
        acc[emp._id] = emp.employeeName;
        return acc;
      }, {});

      if (tgtRes.data?.success) {
        const formatted = tgtRes.data.data.map(t => {
          const targetVal = Number(t.targetValue) || 0;
          const achievedVal = Number(t.achieved) || 0;
          const baselineVal = Number(t.baseline) || 0;
          
          let progress = 0;
          if (targetVal - baselineVal > 0) {
            progress = ((achievedVal - baselineVal) / (targetVal - baselineVal)) * 100;
          }
          progress = Math.min(100, Math.max(0, Math.round(progress)));
          
          const status = progress >= 100 ? 'Completed' : progress < 50 ? 'Behind Schedule' : 'In Progress';

          return {
            id: t._id,
            refCode: t.targetNo || `TGT-${t._id.substring(0, 5).toUpperCase()}`,
            name: empMap[t.employee] || t.employee || 'Unknown',
            kpi: t.targetTitle || t.kpi || 'No KPI Set',
            metric: `${t.targetValue} ${t.unit}`,
            progress: progress,
            deadline: t.endDate || 'No Deadline',
            priority: t.priority || 'Medium',
            status: status,
            rawData: t
          };
        });
        setTargets(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch targets", err);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this target log?")) {
      try {
        await api.delete(`/employee-targets/${id}`);
        fetchTargets();
      } catch (err) {
        console.error("Failed to delete target", err);
        alert("Failed to delete target.");
      }
    }
  };

  const handleEdit = (rawData) => {
    navigate('/hrms/performance/targets/add', { state: { editData: rawData } });
  };

  const stats = {
    total: targets.length,
    completed: targets.filter(t => t.status === 'Completed').length,
    inProgress: targets.filter(t => t.status === 'In Progress').length,
    behind: targets.filter(t => t.status === 'Behind Schedule').length
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Target className="text-indigo-600" size={24} /> Employee Performance Targets
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Define key performance indicators (KPIs), track milestones, and view interactive progress completion bars.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={() => navigate('/hrms/performance/targets/add')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Plus size={14} /> Assign New Target
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Targets Assigned</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-700 mt-1">{stats.total}</div>
          </div>
          <div className="bg-blue-100 text-indigo-600 p-2.5 rounded-lg">
            <RefreshCw size={18} />
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Goals Completed</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-1">{stats.completed}</div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-purple-700 uppercase">On Track (In Progress)</div>
            <div className="text-xl font-bold text-purple-800 dark:text-purple-400 mt-1">{stats.inProgress}</div>
          </div>
          <div className="bg-purple-100 text-purple-600 p-2.5 rounded-lg">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-rose-700 uppercase">Behind Schedule</div>
            <div className="text-xl font-bold text-rose-800 dark:text-rose-400 mt-1">{stats.behind}</div>
          </div>
          <div className="bg-rose-100 text-rose-600 p-2.5 rounded-lg">
            <AlertTriangle size={18} />
          </div>
        </div>

      </div>

      {/* Targets Table Matrix */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">KPI Targets and Achievements Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="block w-full overflow-x-auto w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="p-3">Ref ID</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">KPI Goal Description</th>
                <th className="p-3">Target Metric</th>
                <th className="p-3">Completion Progress</th>
                <th className="p-3">Target Deadline</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Target Status</th>
                <th className="p-3 text-right no-print">Quick Track</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {targets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/30 font-medium">
                  <td className="p-3 font-semibold text-gray-800">{t.refCode}</td>
                  <td className="p-3 text-slate-800 font-bold">{t.name}</td>
                  <td className="p-3 text-gray-700 font-semibold">{t.kpi}</td>
                  <td className="p-3 text-gray-500">{t.metric}</td>
                  
                  {/* Progress bar */}
                  <td className="p-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            t.progress >= 100 ? 'bg-emerald-600' : t.progress < 50 ? 'bg-rose-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${t.progress}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-[10px] text-gray-600">{t.progress}%</span>
                    </div>
                  </td>
                  
                  <td className="p-3 text-gray-650 font-mono">{t.deadline}</td>
                  
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      t.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                      t.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-slate-50 text-slate-700 border-gray-200'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      t.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  
                  <td className="p-3 text-right no-print">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(t.rawData)}
                        className="p-1 hover:bg-indigo-50 rounded text-indigo-600 transition"
                        title="Edit Target"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="p-1 hover:bg-rose-50 rounded text-rose-600 transition"
                        title="Delete Target"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



    </div>
  );
};

export default EmployeeTargets;
