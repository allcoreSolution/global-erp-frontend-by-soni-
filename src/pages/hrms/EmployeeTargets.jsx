import React, { useState } from 'react';
import { Target, Plus, Trash2, X, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeTargets = () => {
  const navigate = useNavigate();
  const [targets, setTargets] = useState([
    { id: 'TGT-201', name: 'Neha Gupta', kpi: 'Sales Revenue Target', metric: '₹ 5,00,000 / mo', progress: 85, deadline: '2026-08-31', priority: 'High', status: 'In Progress' },
    { id: 'TGT-202', name: 'Vikram Singh', kpi: 'Core Migration Milestone', metric: '100% cloud migration', progress: 100, deadline: '2026-08-15', priority: 'High', status: 'Completed' },
    { id: 'TGT-203', name: 'Priya Patel', kpi: 'POS UI Refactoring', metric: '8 Design Templates Spools', progress: 95, deadline: '2026-08-20', priority: 'Medium', status: 'In Progress' },
    { id: 'TGT-204', name: 'Amit Sharma', kpi: 'Statutory Reconciliation', metric: 'All Q2 PF/TDS audits done', progress: 40, deadline: '2026-09-15', priority: 'Medium', status: 'Behind Schedule' },
    { id: 'TGT-205', name: 'Rajesh Kumar', kpi: 'Inventory Reconciliation', metric: 'Stock counts vs actuals matching', progress: 100, deadline: '2026-08-12', priority: 'Low', status: 'Completed' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTarget, setNewTarget] = useState({
    name: '',
    kpi: '',
    metric: '',
    progress: 0,
    deadline: '',
    priority: 'High',
    status: 'In Progress'
  });

  const handleAddTarget = (e) => {
    e.preventDefault();
    if (!newTarget.name || !newTarget.kpi || !newTarget.metric) {
      alert("Name, KPI and Target Metric are required!");
      return;
    }
    const nextId = `TGT-${String(targets.length + 201).padStart(3, '0')}`;
    const added = {
      id: nextId,
      name: newTarget.name,
      kpi: newTarget.kpi,
      metric: newTarget.metric,
      progress: Number(newTarget.progress) || 0,
      deadline: newTarget.deadline || new Date().toISOString().slice(0, 10),
      priority: newTarget.priority,
      status: Number(newTarget.progress) >= 100 ? 'Completed' : newTarget.status
    };

    setTargets([added, ...targets]);
    setShowAddModal(false);
    setNewTarget({ name: '', kpi: '', metric: '', progress: 0, deadline: '', priority: 'High', status: 'In Progress' });
  };

  const handleProgressChange = (id, amount) => {
    setTargets(prev => prev.map(t => {
      if (t.id === id) {
        const nextProgress = Math.min(100, Math.max(0, t.progress + amount));
        const status = nextProgress >= 100 ? 'Completed' : nextProgress < 50 ? 'Behind Schedule' : 'In Progress';
        return { ...t, progress: nextProgress, status };
      }
      return t;
    }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this target log?")) {
      setTargets(targets.filter(t => t.id !== id));
    }
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
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
          <table className="w-full text-left text-xs">
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
                  <td className="p-3 font-semibold text-gray-800">{t.id}</td>
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
                  
                  <td className="p-3 text-right space-x-1.5 no-print">
                    <button 
                      onClick={() => handleProgressChange(t.id, 10)}
                      className="px-1.5 py-0.5 text-[10px] bg-slate-100 border text-slate-700 hover:bg-slate-200 rounded font-bold"
                      title="Add 10% Progress"
                    >
                      +10%
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-1 hover:bg-slate-100 rounded text-rose-600 transition inline-block align-middle"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW TARGET ASSIGNMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-50/50 shadow-inner border border-slate-200/50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider">Assign KPI Goal Target</span>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddTarget} className="p-4 space-y-3.5 font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">Employee Name *</label>
                <input 
                  type="text" 
                  value={newTarget.name}
                  onChange={(e) => setNewTarget({...newTarget, name: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Neha Gupta"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">KPI Goal Title *</label>
                <input 
                  type="text" 
                  value={newTarget.kpi}
                  onChange={(e) => setNewTarget({...newTarget, kpi: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Sales Revenue Target"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Target Metric Description *</label>
                <input 
                  type="text" 
                  value={newTarget.metric}
                  onChange={(e) => setNewTarget({...newTarget, metric: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. ₹ 5,00,000 / mo"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">Initial Progress (%)</label>
                  <input 
                    type="number" 
                    value={newTarget.progress}
                    onChange={(e) => setNewTarget({...newTarget, progress: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Target Deadline *</label>
                  <input 
                    type="date" 
                    value={newTarget.deadline}
                    onChange={(e) => setNewTarget({...newTarget, deadline: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">Priority Scale</label>
                  <select 
                    value={newTarget.priority}
                    onChange={(e) => setNewTarget({...newTarget, priority: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Current Status</label>
                  <select 
                    value={newTarget.status}
                    onChange={(e) => setNewTarget({...newTarget, status: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Behind Schedule">Behind Schedule</option>
                  </select>
                </div>
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
                  Assign Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeTargets;
