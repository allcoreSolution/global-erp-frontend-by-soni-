import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Save, X, Plus, Trash2, Award, User, Target, BarChart2, MessageSquare, ClipboardCheck, GraduationCap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';

const AddAppraisal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state?.editData;

  // 1. Basic Info
  const [basicInfo, setBasicInfo] = useState(editData?.basicInfo || {
    cycle: '',
    employee: '',
    department: 'IT Dept',
    designation: 'Software Engineer',
    manager: '',
    periodFrom: '2026-04-01',
    periodTo: '2027-03-31'
  });

  // Lookups & Modal State
  const [employees, setEmployees] = useState([]);
  const [cycles, setCycles] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalInput, setModalInput] = useState('');

  const fetchLookups = async () => {
    try {
      const [empRes, optRes] = await Promise.all([
        api.get('/employees').catch(() => ({ data: { data: [] } })),
        api.get('/master-options?category=appraisal_cycle').catch(() => ({ data: { data: [] } }))
      ]);
      
      if (empRes.data?.data) {
        setEmployees(empRes.data.data);
      }
      if (optRes.data?.data) {
        setCycles(optRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching lookups:", err);
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  const handleOpenModal = (type) => {
    setModalType(type);
    setModalInput('');
    setShowAddModal(true);
  };

  const handleQuickAddSubmit = async () => {
    if (!modalInput.trim()) return;
    try {
      if (modalType === 'employee' || modalType === 'manager') {
        const parts = modalInput.trim().split(' ');
        await api.post('/employees', {
          employeeName: modalInput,
          employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
          email: `${parts[0].toLowerCase()}@example.com`,
          status: 'Active'
        });
      } else if (modalType === 'cycle') {
        await api.post('/master-options', {
          category: 'appraisal_cycle',
          label: modalInput,
          value: modalInput
        });
      }
      setModalInput('');
      setShowAddModal(false);
      fetchLookups();
    } catch (err) {
      console.error("Error saving quick add:", err);
      alert('Failed to save. Please try again.');
    }
  };

  // 2. Performance Rating
  const [ratings, setRatings] = useState(editData?.ratings || [
    { id: 1, criteria: 'Quality of Work', weightage: 20, rating: 4 },
    { id: 2, criteria: 'Productivity', weightage: 20, rating: 5 },
    { id: 3, criteria: 'Communication', weightage: 10, rating: 4 },
    { id: 4, criteria: 'Teamwork', weightage: 10, rating: 4 },
    { id: 5, criteria: 'Problem Solving', weightage: 10, rating: 5 }
  ]);

  const handleRatingChange = (id, newRating) => {
    setRatings(ratings.map(r => r.id === id ? { ...r, rating: Number(newRating) } : r));
  };

  const totalScore = ratings.reduce((acc, curr) => acc + ((curr.weightage / 100) * curr.rating), 0).toFixed(2);
  const maxScore = ratings.reduce((acc, curr) => acc + ((curr.weightage / 100) * 5), 0).toFixed(2);

  // 3. KPI / Goals
  const [goals, setGoals] = useState(editData?.goals || [
    { id: 1, goal: 'Complete Phase 1 Launch', target: 'Q3', achieved: 'Yes', percentage: 100, rating: 5, score: 5 }
  ]);

  const addGoal = () => {
    setGoals([...goals, { id: Date.now(), goal: '', target: '', achieved: '', percentage: 0, rating: 0, score: 0 }]);
  };

  const removeGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const updateGoal = (id, field, value) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  // 4. Employee Self-Assessment
  const [selfAssessment, setSelfAssessment] = useState(editData?.selfAssessment || {
    achievements: '',
    challenges: '',
    futureGoals: ''
  });

  // 5. Manager Evaluation
  const [managerEvaluation, setManagerEvaluation] = useState(editData?.managerEvaluation || {
    strengths: '',
    improvementAreas: '',
    trainingRequired: ''
  });

  // 6. Final Appraisal
  const [finalAppraisal, setFinalAppraisal] = useState(editData?.finalAppraisal || {
    grade: 'Very Good',
    increment: 'Yes',
    incrementPercent: '15',
    promotion: 'Yes',
    remarks: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!basicInfo.employee || !basicInfo.cycle || !basicInfo.manager) {
      alert('Please fill out all required fields (Cycle, Employee, Reporting Manager).');
      return;
    }

    try {
      const payload = {
        basicInfo,
        ratings,
        goals,
        selfAssessment,
        managerEvaluation,
        finalAppraisal
      };
      
      let res;
      if (editData?._id) {
        res = await api.put(`/appraisals/${editData._id}`, payload);
      } else {
        res = await api.post('/appraisals', payload);
      }
      
      if (res.data?.success || res.status === 201 || res.status === 200) {
        alert(`Appraisal ${editData?._id ? 'Updated' : 'Submitted'} Successfully!`);
        navigate('/hrms/performance/appraisals');
      } else {
        alert(res.data?.message || `Failed to ${editData?._id ? 'update' : 'submit'} appraisal.`);
      }
    } catch (err) {
      console.error("Error saving appraisal:", err);
      alert(err.response?.data?.message || 'An error occurred while saving the appraisal.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/hrms/performance/appraisals')}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold transition-colors bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm"
        >
          <ArrowLeft size={18} /> Back to Appraisal Rating
        </button>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm hover:bg-indigo-700">
            <Plus size={16} /> {editData ? 'Edit Appraisal Rating' : 'New Appraisal Rating'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. BASIC INFORMATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-indigo-500" /> Basic Information
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Appraisal Cycle *</label>
                  <div className="flex gap-2">
                    <select 
                      value={basicInfo.cycle} onChange={(e) => setBasicInfo({...basicInfo, cycle: e.target.value})}
                      className="w-full flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                    >
                      <option value="">Select Cycle</option>
                      {cycles.length > 0 ? (
                        cycles.map(c => <option key={c._id} value={c.value}>{c.label}</option>)
                      ) : (
                        <>
                          <option>2026-2027</option>
                          <option>2025-2026</option>
                        </>
                      )}
                    </select>
                    <button type="button" onClick={() => handleOpenModal('cycle')} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors shrink-0" title="Add Cycle">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Employee *</label>
                  <div className="flex gap-2">
                    <select 
                      value={basicInfo.employee} 
                      onChange={(e) => {
                        const empId = e.target.value;
                        const selectedEmp = employees.find(emp => emp._id === empId);
                        setBasicInfo({
                          ...basicInfo, 
                          employee: empId,
                          department: selectedEmp?.department || '',
                          designation: selectedEmp?.designation || '',
                          manager: selectedEmp?.reportingManager || basicInfo.manager
                        });
                      }}
                      className="w-full flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleOpenModal('employee')} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors shrink-0" title="Add Employee">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Department</label>
                  <input type="text" value={basicInfo.department} onChange={(e) => setBasicInfo({...basicInfo, department: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Designation</label>
                  <input type="text" value={basicInfo.designation} onChange={(e) => setBasicInfo({...basicInfo, designation: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Reporting Manager *</label>
                  <div className="flex gap-2">
                    <select 
                      value={basicInfo.manager} onChange={(e) => setBasicInfo({...basicInfo, manager: e.target.value})}
                      className="w-full flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                    >
                      <option value="">Select Manager</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.employeeName}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => handleOpenModal('manager')} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors shrink-0" title="Add Manager">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Appraisal Period From</label>
                  <input type="date" value={basicInfo.periodFrom} onChange={(e) => setBasicInfo({...basicInfo, periodFrom: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Appraisal Period To</label>
                  <input type="date" value={basicInfo.periodTo} onChange={(e) => setBasicInfo({...basicInfo, periodTo: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            {/* 3. KPI / GOALS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex justify-between items-center">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Target size={14} className="text-emerald-500" /> KPI / Goals
                </h3>
              </div>
              <div className="p-5 overflow-x-auto">
                <table className="block w-full overflow-x-auto w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-2 text-[10px] font-bold text-slate-500 uppercase rounded-l-lg border-y border-l border-slate-200">Goal</th>
                      <th className="p-2 text-[10px] font-bold text-slate-500 uppercase border-y border-slate-200">Target</th>
                      <th className="p-2 text-[10px] font-bold text-slate-500 uppercase border-y border-slate-200">Achieved</th>
                      <th className="p-2 text-[10px] font-bold text-slate-500 uppercase border-y border-slate-200">%</th>
                      <th className="p-2 text-[10px] font-bold text-slate-500 uppercase border-y border-slate-200">Rating</th>
                      <th className="p-2 text-[10px] font-bold text-slate-500 uppercase border-y border-slate-200">Score</th>
                      <th className="p-2 w-10 rounded-r-lg border-y border-r border-slate-200"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {goals.map((goal) => (
                      <tr key={goal.id}>
                        <td className="p-2 border-b border-slate-100">
                          <input type="text" value={goal.goal} onChange={(e) => updateGoal(goal.id, 'goal', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm outline-none focus:border-indigo-500" placeholder="Goal Description" />
                        </td>
                        <td className="p-2 border-b border-slate-100 w-24">
                          <input type="text" value={goal.target} onChange={(e) => updateGoal(goal.id, 'target', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm outline-none focus:border-indigo-500" placeholder="e.g. 100" />
                        </td>
                        <td className="p-2 border-b border-slate-100 w-24">
                          <input type="text" value={goal.achieved} onChange={(e) => updateGoal(goal.id, 'achieved', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm outline-none focus:border-indigo-500" />
                        </td>
                        <td className="p-2 border-b border-slate-100 w-20">
                          <input type="number" value={goal.percentage} onChange={(e) => updateGoal(goal.id, 'percentage', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm outline-none focus:border-indigo-500 text-center" />
                        </td>
                        <td className="p-2 border-b border-slate-100 w-20">
                          <input type="number" min="1" max="5" value={goal.rating} onChange={(e) => updateGoal(goal.id, 'rating', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm outline-none focus:border-indigo-500 text-center" />
                        </td>
                        <td className="p-2 border-b border-slate-100 w-20">
                          <input type="number" value={goal.score} onChange={(e) => updateGoal(goal.id, 'score', e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm outline-none focus:border-indigo-500 text-center bg-slate-50 font-bold" />
                        </td>
                        <td className="p-2 border-b border-slate-100 text-center">
                          <button type="button" onClick={() => removeGoal(goal.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={addGoal} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg">
                  <Plus size={14} /> Add Goal
                </button>
              </div>
            </div>

            {/* 4. EMPLOYEE SELF-ASSESSMENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <MessageSquare size={14} className="text-amber-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Employee Self-Assessment</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Achievements</label>
                  <textarea rows="2" value={selfAssessment.achievements} onChange={e => setSelfAssessment({...selfAssessment, achievements: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Enter key achievements..."></textarea>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Challenges</label>
                  <textarea rows="2" value={selfAssessment.challenges} onChange={e => setSelfAssessment({...selfAssessment, challenges: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Enter challenges faced..."></textarea>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Future Goals</label>
                  <textarea rows="2" value={selfAssessment.futureGoals} onChange={e => setSelfAssessment({...selfAssessment, futureGoals: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Enter future goals..."></textarea>
                </div>
              </div>
            </div>

            {/* 5. MANAGER EVALUATION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <ClipboardCheck size={14} className="text-rose-500" />
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Manager Evaluation</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Strengths</label>
                  <textarea rows="2" value={managerEvaluation.strengths} onChange={e => setManagerEvaluation({...managerEvaluation, strengths: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Employee's core strengths..."></textarea>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Improvement Areas</label>
                  <textarea rows="2" value={managerEvaluation.improvementAreas} onChange={e => setManagerEvaluation({...managerEvaluation, improvementAreas: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Areas needing improvement..."></textarea>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Training Required</label>
                  <textarea rows="2" value={managerEvaluation.trainingRequired} onChange={e => setManagerEvaluation({...managerEvaluation, trainingRequired: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Recommended training..."></textarea>
                </div>
              </div>
            </div>

          </div>


          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 space-y-6">

            {/* 2. PERFORMANCE RATING */}
            <div className="bg-slate-800 rounded-2xl shadow-xl shadow-slate-200 overflow-hidden text-white border border-slate-700">
              <div className="bg-slate-900 border-b border-slate-700 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <BarChart2 size={14} className="text-yellow-400" /> Performance Rating
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 mb-2">
                    <div className="col-span-5 text-[10px] font-bold text-slate-400 uppercase">Criteria</div>
                    <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase text-center">Wt.</div>
                    <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase text-center">Rating</div>
                    <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase text-right">Score</div>
                  </div>
                  
                  {ratings.map(r => (
                    <div key={r.id} className="grid grid-cols-12 gap-2 items-center text-sm font-medium">
                      <div className="col-span-5 text-slate-200">{r.criteria}</div>
                      <div className="col-span-2 text-slate-400 text-center text-xs">{r.weightage}%</div>
                      <div className="col-span-3">
                        <select 
                          value={r.rating} onChange={(e) => handleRatingChange(r.id, e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-center outline-none focus:border-yellow-400 font-bold"
                        >
                          <option value="5">5</option>
                          <option value="4">4</option>
                          <option value="3">3</option>
                          <option value="2">2</option>
                          <option value="1">1</option>
                        </select>
                      </div>
                      <div className="col-span-2 text-right font-bold text-emerald-400">
                        {((r.weightage / 100) * r.rating).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-slate-600 pt-4 mt-2">
                    <div className="flex justify-between items-center text-sm text-slate-300 font-medium">
                      <span>Total Score</span>
                      <span className="text-2xl font-black text-white">{totalScore} <span className="text-sm font-bold text-slate-400">/ {maxScore}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. FINAL APPRAISAL */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Award size={14} className="text-blue-500" /> Final Appraisal
                </h3>
              </div>
              <div className="p-5 space-y-4">
                
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex justify-between items-center">
                   <div>
                     <div className="text-[10px] font-bold text-indigo-500 uppercase">Overall Rating</div>
                     <div className="text-xl font-black text-indigo-800">{totalScore} <span className="text-sm font-bold text-indigo-400">/ {maxScore}</span></div>
                   </div>
                   <Award size={32} className="text-indigo-200" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Grade</label>
                  <select value={finalAppraisal.grade} onChange={e => setFinalAppraisal({...finalAppraisal, grade: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:border-indigo-500 outline-none text-emerald-600">
                    <option>Outstanding</option>
                    <option>Very Good</option>
                    <option>Good</option>
                    <option>Average</option>
                    <option>Poor</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Increment</label>
                    <select value={finalAppraisal.increment} onChange={e => setFinalAppraisal({...finalAppraisal, increment: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">% Increase</label>
                    <input type="text" value={finalAppraisal.incrementPercent} onChange={e => setFinalAppraisal({...finalAppraisal, incrementPercent: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none" placeholder="e.g. 10" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Promotion</label>
                  <select value={finalAppraisal.promotion} onChange={e => setFinalAppraisal({...finalAppraisal, promotion: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none">
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Final Remarks</label>
                  <textarea rows="3" value={finalAppraisal.remarks} onChange={e => setFinalAppraisal({...finalAppraisal, remarks: e.target.value})} className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Enter final decision remarks..."></textarea>
                </div>

              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-12 flex justify-end items-center gap-3 mt-4 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/hrms/performance/appraisals')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button type="button" className="px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-900 flex items-center gap-2">
              <Save size={16} /> Save Draft
            </button>
            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              <CheckCircle size={16} /> {editData ? 'Update Appraisal' : 'Submit Appraisal'}
            </button>
          </div>

        </form>
      </div>

      {/* QUICK ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 capitalize">Quick Add {modalType}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16}/>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 capitalize">{modalType} Name *</label>
                <input 
                  type="text" 
                  value={modalInput}
                  onChange={e => setModalInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder={`Enter ${modalType} name...`}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 border rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={handleQuickAddSubmit} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Save {modalType}</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddAppraisal;
