import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, X, Trophy, Sparkles, AlertCircle, CheckCircle, Award, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const Appraisals = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);

  const fetchAppraisals = async () => {
    try {
      const [appRes, empRes] = await Promise.all([
        api.get('/appraisals'),
        api.get('/employees').catch(() => ({ data: { data: [] } }))
      ]);
      const employees = empRes.data?.data || [];
      const empMap = employees.reduce((acc, emp) => {
        acc[emp._id] = emp.employeeName;
        return acc;
      }, {});

      if (appRes.data?.success) {
        const formatted = appRes.data.data.map(app => {
          const totalRating = app.ratings?.reduce((sum, r) => sum + r.rating, 0) || 0;
          const avgRating = app.ratings?.length ? Math.round(totalRating / app.ratings.length) : 0;
          
          return {
            id: app._id,
            refCode: `REV-${app._id.substring(0,6).toUpperCase()}`,
            name: empMap[app.basicInfo?.employee] || app.basicInfo?.employee || 'Unknown',
            role: app.basicInfo?.designation || 'N/A',
            dept: app.basicInfo?.department || 'N/A',
            period: app.basicInfo?.cycle || 'N/A',
            rating: avgRating,
            promotion: app.finalAppraisal?.promotion === 'Yes' ? 'Promoted' : 'Not Eligible',
            notes: app.finalAppraisal?.remarks || 'No remarks provided',
            rawData: app
          };
        });
        setReviews(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch appraisals", error);
    }
  };

  useEffect(() => {
    fetchAppraisals();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appraisal log?")) {
      try {
        await api.delete(`/appraisals/${id}`);
        fetchAppraisals();
      } catch (err) {
        console.error("Error deleting appraisal:", err);
        alert("Failed to delete appraisal.");
      }
    }
  };

  const handleEdit = (rawData) => {
    navigate('/hrms/performance/appraisals/add', { state: { editData: rawData } });
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
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
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
          <table className="block w-full overflow-x-auto w-full text-left text-xs">
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
                  <td className="p-3 font-semibold text-gray-800">{r.refCode}</td>
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
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(r.rawData)}
                        className="p-1 hover:bg-indigo-50 rounded text-indigo-600 transition"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="p-1 hover:bg-rose-50 rounded text-rose-600 transition"
                        title="Delete"
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

export default Appraisals;
