import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Download, Upload, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const DesignationList = () => {
  const navigate = useNavigate();
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentDesg, setCurrentDesg] = useState({
    _id: '', desigName: '', desigCode: '', department: 'IT & Systems', reportsTo: '', jobDescription: ''
  });

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/designations');
      if (res.data.success) {
        setDesignations(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch designations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const filtered = designations.filter(d =>
    (d.desigName && d.desigName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.desigCode && d.desigCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAdd = () => {
    navigate('/designation/add');
  };

  const handleOpenEdit = (desg) => {
    setIsEdit(true);
    setCurrentDesg({ ...desg });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      try {
        const res = await api.put(`/designations/${currentDesg._id}`, currentDesg);
        if (res.data.success) {
          fetchDesignations();
          setIsModalOpen(false);
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to update designation');
      }
    } else {
      alert('Adding is done on a separate page.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this designation?`)) {
      try {
        const res = await api.delete(`/designations/${id}`);
        if (res.data.success) {
          fetchDesignations();
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to delete designation');
      }
    }
  };

  // Real CSV Export
  const handleExport = () => {
    const headers = ['Designation Code', 'Designation Name', 'Department', 'Reporting Manager', 'Description'];
    const rows = designations.map(d => [
      d.desigCode,
      `"${(d.desigName || '').replace(/"/g, '""')}"`,
      d.department || '',
      `"${(d.reportsTo || '').replace(/"/g, '""')}"`,
      `"${(d.jobDescription || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `designations_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const newDesgs = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 5) {
            newDesgs.push({
              id: `DESG-NEW-${Date.now()}-${i}`,
              code: cols[0] || 'NEW',
              name: cols[1] || 'Imported Role',
              dept: cols[2] || 'General',
              manager: cols[3] || 'N/A',
              jd: cols[4] || ''
            });
          }
        }
        if (newDesgs.length > 0) {
          setDesignations(prev => [...prev, ...newDesgs]);
          alert(`Successfully imported ${newDesgs.length} designations!`);
        } else {
          alert("Import failed. Headers should match: Designation Code, Designation Name, Department, Reporting Manager, Description");
        }
      } catch (err) {
        alert("Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <input
        type="file"
        id="designation-csv-file"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Designation Master</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Configure corporate hierarchies, Job Descriptions (JDs), and reporting manager chains.</p>
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto no-print">
          <button
            onClick={() => document.getElementById('designation-csv-file').click()}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Upload size={13} /> Import CSV
          </button>
          <button
            onClick={handleExport}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
          >
            <Printer size={13} /> Print / PDF
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-[10px] sm:text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={13} /> Add Designation
          </button>
        </div>
      </div>

      {/* Filter search */}
      <div className="relative mb-4 w-full max-w-sm no-print">
        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Code or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Table responsive */}
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="block w-full overflow-x-auto w-full text-left text-[11px] sm:text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b font-semibold text-gray-700">
              <th className="p-2.5 sm:p-3">Code</th>
              <th className="p-2.5 sm:p-3">Designation Role</th>
              <th className="p-2.5 sm:p-3">Department</th>
              <th className="p-2.5 sm:p-3">Reporting Manager</th>
              <th className="p-2.5 sm:p-3">Job Description</th>
              <th className="p-2.5 sm:p-3 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-slate-500">Loading designations...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-slate-500">No designations found.</td>
              </tr>
            ) : (
              filtered.map(d => (
                <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 sm:p-3 font-semibold text-indigo-600 font-mono">{d.desigCode}</td>
                  <td className="p-2.5 sm:p-3 font-medium text-gray-900">{d.desigName}</td>
                  <td className="p-2.5 sm:p-3 text-gray-650">{d.department}</td>
                  <td className="p-2.5 sm:p-3 text-gray-800 font-medium">{d.reportsTo}</td>
                  <td className="p-2.5 sm:p-3 text-gray-500 max-w-[200px] truncate">{d.jobDescription}</td>
                  <td className="p-2.5 sm:p-3 text-center no-print">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => handleOpenEdit(d)} className="p-1 text-amber-600 hover:bg-amber-50 rounded">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(d._id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 overflow-y-auto no-print">
          <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden shadow-xl border my-auto">
            <div className="bg-slate-50/50 shadow-inner border border-slate-200 text-slate-800 p-3.5 flex justify-between items-center">
              <h3 className="font-bold text-xs sm:text-sm">{isEdit ? 'Edit Designation' : 'Add Designation'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Role Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SDEV"
                    value={currentDesg.desigCode || ''}
                    onChange={(e) => setCurrentDesg({ ...currentDesg, desigCode: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Designation Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Developer"
                    value={currentDesg.desigName || ''}
                    onChange={(e) => setCurrentDesg({ ...currentDesg, desigName: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Department</label>
                  <select
                    value={currentDesg.department || ''}
                    onChange={(e) => setCurrentDesg({ ...currentDesg, department: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none bg-white text-xs"
                  >
                    <option value="IT & Systems">IT & Systems</option>
                    <option value="HR & Admin">HR & Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Reporting Manager *</label>
                  <input
                    type="text"
                    required
                    value={currentDesg.reportsTo || ''}
                    onChange={(e) => setCurrentDesg({ ...currentDesg, reportsTo: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Job Description</label>
                <textarea
                  rows="3"
                  value={currentDesg.jobDescription || ''}
                  onChange={(e) => setCurrentDesg({ ...currentDesg, jobDescription: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3.5 py-1.5 border rounded hover:bg-slate-50 text-xs">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 text-xs">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignationList;
