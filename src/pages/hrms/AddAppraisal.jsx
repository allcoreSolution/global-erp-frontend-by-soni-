import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Save, X, Plus, Trash2, Award, User, Target, BarChart2, MessageSquare, ClipboardCheck, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddAppraisal = () => {
  const navigate = useNavigate();

  // 1. Basic Info
  const [basicInfo, setBasicInfo] = useState({
    cycle: '2026-2027',
    employee: '',
    department: 'IT Dept',
    designation: 'Software Engineer',
    manager: '',
    periodFrom: '2026-04-01',
    periodTo: '2027-03-31'
  });

  // 2. Performance Rating
  const [ratings, setRatings] = useState([
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
  const [goals, setGoals] = useState([
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
  const [selfAssessment, setSelfAssessment] = useState({
    achievements: '',
    challenges: '',
    futureGoals: ''
  });

  // 5. Manager Evaluation
  const [managerEvaluation, setManagerEvaluation] = useState({
    strengths: '',
    improvementAreas: '',
    trainingRequired: ''
  });

  // 6. Final Appraisal
  const [finalAppraisal, setFinalAppraisal] = useState({
    grade: 'Very Good',
    increment: 'Yes',
    incrementPercent: '15',
    promotion: 'Yes',
    remarks: ''
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert('Appraisal Submitted Successfully!');
    navigate('/hrms/performance/appraisals');
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
            <Plus size={16} /> New Appraisal Rating
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
                  <select 
                    value={basicInfo.cycle} onChange={(e) => setBasicInfo({...basicInfo, cycle: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                  >
                    <option>2026-2027</option>
                    <option>2025-2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Employee *</label>
                  <select 
                    value={basicInfo.employee} onChange={(e) => setBasicInfo({...basicInfo, employee: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                  >
                    <option value="">Select Employee</option>
                    <option>Vikram Singh</option>
                    <option>Neha Gupta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Department</label>
                  <input type="text" value={basicInfo.department} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Designation</label>
                  <input type="text" value={basicInfo.designation} disabled className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Reporting Manager *</label>
                  <select 
                    value={basicInfo.manager} onChange={(e) => setBasicInfo({...basicInfo, manager: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                  >
                    <option value="">Select Manager</option>
                    <option>Rajesh Kumar</option>
                  </select>
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
                <table className="w-full text-left border-collapse">
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

                <div className="grid grid-cols-2 gap-4">
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
              <CheckCircle size={16} /> Submit Appraisal
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddAppraisal;
