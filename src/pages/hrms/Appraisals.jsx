import React, { useState } from 'react';
import { Star, Plus, Trash2, X, Trophy, Sparkles, AlertCircle, CheckCircle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Appraisals = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([
    { id: 'REV-01', name: 'Vikram Singh', role: 'Technical Lead', dept: 'IT Dept', period: 'Annual 2025-26', rating: 5, promotion: 'Promoted', notes: 'Excellent technical leadership, delivered the cloud infrastructure on time.' },
    { id: 'REV-02', name: 'Neha Gupta', role: 'Sales Lead', dept: 'Marketing Dept', period: 'Annual 2025-26', rating: 4, promotion: 'Eligible', notes: 'Exceeded sales targets by 15%. Great client relationship skills.' },
    { id: 'REV-03', name: 'Priya Patel', role: 'UI/UX Designer', dept: 'Creative Dept', period: 'Mid-Year 2026', rating: 4, promotion: 'Under Watch', notes: 'Strong visual design skills. Needs minor improvement in deadline management.' },
    { id: 'REV-04', name: 'Amit Sharma', role: 'Senior Accountant', dept: 'Accounts Dept', period: 'Annual 2025-26', rating: 3, promotion: 'Not Eligible', notes: 'Consistent work quality. Maintains ledger reconciliations efficiently.' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    dept: 'IT Dept',
    period: 'Annual 2025-26',
    rating: 5,
    promotion: 'Eligible',
    notes: ''
  });

  const handleAddAppraisal = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.role) {
      alert("Name and Role are required!");
      return;
    }
    const nextId = `REV-${String(reviews.length + 1).padStart(2, '0')}`;
    const added = {
      id: nextId,
      name: newReview.name,
      role: newReview.role,
      dept: newReview.dept,
      period: newReview.period,
      rating: Number(newReview.rating),
      promotion: newReview.promotion,
      notes: newReview.notes || 'No remarks provided'
    };

    setReviews([added, ...reviews]);
    setShowAddModal(false);
    setNewReview({ name: '', role: '', dept: 'IT Dept', period: 'Annual 2025-26', rating: 5, promotion: 'Eligible', notes: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this appraisal log?")) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const stats = {
    total: reviews.length,
    avg: (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1),
    promoted: reviews.filter(r => r.promotion === 'Promoted' || r.promotion === 'Eligible').length,
    critical: reviews.filter(r => r.rating <= 3).length
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="text-indigo-600" size={24} /> Performance Appraisal Ratings
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Log employee performance appraisals, define rating scorecards, and determine promotion & increments eligibility.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={() => navigate('/hrms/performance/appraisals/add')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Plus size={14} /> New Appraisal Rating
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-50 dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Reviews Logged</div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-700 mt-1">{stats.total}</div>
          </div>
          <div className="bg-blue-100 text-indigo-600 p-2.5 rounded-lg">
            <Award size={18} />
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-700 uppercase">Average Rating Score</div>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-1 flex items-center gap-1">
              {stats.avg} <span className="text-xs text-emerald-600 font-normal">/ 5.0</span>
            </div>
          </div>
          <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-lg">
            <Sparkles size={18} />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-purple-700 uppercase">Promotion Eligible</div>
            <div className="text-xl font-bold text-purple-800 dark:text-purple-400 mt-1">{stats.promoted}</div>
          </div>
          <div className="bg-purple-100 text-purple-600 p-2.5 rounded-lg">
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase">Needs Mentorship (≤ 3★)</div>
            <div className="text-xl font-bold text-amber-800 dark:text-amber-400 mt-1">{stats.critical}</div>
          </div>
          <div className="bg-amber-100 text-amber-600 p-2.5 rounded-lg">
            <AlertCircle size={18} />
          </div>
        </div>

      </div>

      {/* Appraisals Grid Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Appraisal Audit Ledger Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="p-3">Ref Code</th>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Department & Role</th>
                <th className="p-3">Evaluation Cycle</th>
                <th className="p-3">Score Rating</th>
                <th className="p-3">Status Eligibility</th>
                <th className="p-3">Evaluation Remarks</th>
                <th className="p-3 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/30 font-medium">
                  <td className="p-3 font-semibold text-gray-800">{r.id}</td>
                  <td className="p-3 text-slate-800 font-bold">{r.name}</td>
                  <td className="p-3">
                    <div className="font-semibold text-gray-850">{r.role}</div>
                    <div className="text-[10px] text-gray-400">{r.dept}</div>
                  </td>
                  <td className="p-3 text-gray-600 font-semibold">{r.period}</td>
                  <td className="p-3">
                    <div className="flex gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < r.rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.promotion === 'Promoted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      r.promotion === 'Eligible' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      r.promotion === 'Under Watch' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-slate-50 text-slate-700 border border-gray-200'
                    }`}>
                      {r.promotion}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 max-w-xs truncate" title={r.notes}>{r.notes}</td>
                  <td className="p-3 text-right no-print">
                    <button 
                      onClick={() => handleDelete(r.id)}
                      className="p-1 hover:bg-slate-100 rounded text-rose-600 transition"
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

      {/* NEW APPRAISAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-50/50 shadow-inner border border-slate-200/50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider">Log Performance Evaluation</span>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddAppraisal} className="p-4 space-y-3.5 font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">Employee Name *</label>
                <input 
                  type="text" 
                  value={newReview.name}
                  onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Vikram Singh"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">Job Role *</label>
                  <input 
                    type="text" 
                    value={newReview.role}
                    onChange={(e) => setNewReview({...newReview, role: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Developer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Department</label>
                  <select 
                    value={newReview.dept}
                    onChange={(e) => setNewReview({...newReview, dept: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="IT Dept">IT Dept</option>
                    <option value="Marketing Dept">Marketing Dept</option>
                    <option value="Creative Dept">Creative Dept</option>
                    <option value="Accounts Dept">Accounts Dept</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">Rating Score (1-5★)</label>
                  <select 
                    value={newReview.rating}
                    onChange={(e) => setNewReview({...newReview, rating: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="5">5 Stars (Outstanding)</option>
                    <option value="4">4 Stars (Exceeds Target)</option>
                    <option value="3">3 Stars (Meets Target)</option>
                    <option value="2">2 Stars (Below Target)</option>
                    <option value="1">1 Star (Needs Improvement)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Eligibility Status</label>
                  <select 
                    value={newReview.promotion}
                    onChange={(e) => setNewReview({...newReview, promotion: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Eligible">Promotion Eligible</option>
                    <option value="Promoted">Already Promoted</option>
                    <option value="Under Watch">Under Watch</option>
                    <option value="Not Eligible">Not Eligible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Evaluation Cycle Period</label>
                <input 
                  type="text" 
                  value={newReview.period}
                  onChange={(e) => setNewReview({...newReview, period: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Annual 2025-26"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">Evaluation Remarks / Feedback</label>
                <textarea 
                  value={newReview.notes}
                  onChange={(e) => setNewReview({...newReview, notes: e.target.value})}
                  className="w-full h-16 p-2 border rounded focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Enter detailed strengths and training requirements..."
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
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Appraisals;
