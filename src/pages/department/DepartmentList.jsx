import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Download, Upload, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const DepartmentList = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentDept, setCurrentDept] = useState({
    _id: '', deptName: '', deptCode: '', deptHead: '', branch: 'Jaipur HQ Office', description: '', budget: 0
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filtered = departments.filter(d =>
    (d.deptName && d.deptName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.deptCode && d.deptCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAdd = () => {
    navigate('/department/add');
  };

  const handleOpenEdit = (dept) => {
    setIsEdit(true);
    setCurrentDept({ ...dept });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      try {
        const res = await api.put(`/departments/${currentDept._id}`, currentDept);
        if (res.data.success) {
          fetchDepartments();
          setIsModalOpen(false);
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to update department');
      }
    } else {
      // In this app, Add is handled in a separate page (AddDepartment.jsx)
      // but just in case this modal is ever used for add:
      alert('Adding is done on a separate page.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this department?`)) {
      try {
        const res = await api.delete(`/departments/${id}`);
        if (res.data.success) {
          fetchDepartments();
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  // Real CSV Export
  const handleExport = () => {
    const headers = ['Department Code', 'Department Name', 'Branch', 'Head', 'Employees', 'Budget (₹)'];
    const rows = departments.map(d => [
      d.deptCode,
      `"${(d.deptName || '').replace(/"/g, '""')}"`,
      d.branch || '',
      `"${(d.deptHead || '').replace(/"/g, '""')}"`,
      '0', // empCount not tracked in DB yet
      d.budget || 0
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `departments_export_${new Date().toISOString().slice(0, 10)}.csv`);
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
        const newDepts = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 6) {
            newDepts.push({
              id: `DEPT-NEW-${Date.now()}-${i}`,
              code: cols[0] || 'NEW',
              name: cols[1] || 'Imported Dept',
              branch: cols[2] || 'Jaipur HQ Office',
              head: cols[3] || 'N/A',
              empCount: Number(cols[4]) || 0,
              budget: Number(cols[5]) || 0,
              desc: ''
            });
          }
        }
        if (newDepts.length > 0) {
          setDepartments(prev => [...prev, ...newDepts]);
          alert(`Successfully imported ${newDepts.length} departments!`);
        } else {
          alert("Import failed. Headers should match: Department Code, Department Name, Branch, Head, Employees, Budget");
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
        id="department-csv-file"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Departments Directory</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Add corporate business channels, budget limits, department heads mapping, and staff counts.</p>
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto no-print">
          <button
            onClick={() => document.getElementById('department-csv-file').click()}
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
            <Plus size={13} /> Add Department
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
        <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b font-semibold text-gray-700">
              <th className="p-2.5 sm:p-3">Code</th>
              <th className="p-2.5 sm:p-3">Department Name</th>
              <th className="p-2.5 sm:p-3">Branch</th>
              <th className="p-2.5 sm:p-3">Manager Head</th>
              <th className="p-2.5 sm:p-3 text-right">Staff Count</th>
              <th className="p-2.5 sm:p-3 text-right">Budget (₹)</th>
              <th className="p-2.5 sm:p-3 text-center no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-slate-500">Loading departments...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-slate-500">No departments found.</td>
              </tr>
            ) : (
              filtered.map(d => (
                <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 sm:p-3 font-semibold text-indigo-600 font-mono">{d.deptCode}</td>
                  <td className="p-2.5 sm:p-3">
                    <div className="font-medium text-gray-900">{d.deptName}</div>
                    <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{d.description}</div>
                  </td>
                  <td className="p-2.5 sm:p-3 text-gray-650">{d.branch}</td>
                  <td className="p-2.5 sm:p-3 text-gray-800 font-medium">{d.deptHead}</td>
                  <td className="p-2.5 sm:p-3 text-right">0 Staff</td>
                  <td className="p-2.5 sm:p-3 text-right font-semibold">₹ {Number(d.budget || 0).toLocaleString()}</td>
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
              <h3 className="font-bold text-xs sm:text-sm">{isEdit ? 'Edit Department' : 'Add Department'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Dept Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ITS"
                    value={currentDept.deptCode || ''}
                    onChange={(e) => setCurrentDept({ ...currentDept, deptCode: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IT & Systems"
                    value={currentDept.deptName || ''}
                    onChange={(e) => setCurrentDept({ ...currentDept, deptName: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Dept Head *</label>
                  <input
                    type="text"
                    required
                    value={currentDept.deptHead || ''}
                    onChange={(e) => setCurrentDept({ ...currentDept, deptHead: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Branch</label>
                  <select
                    value={currentDept.branch}
                    onChange={(e) => setCurrentDept({ ...currentDept, branch: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none bg-white text-xs"
                  >
                    <option value="Jaipur HQ Office">Jaipur HQ Office</option>
                    <option value="Kota Regional Center">Kota Regional Center</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-3.5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Budget Allocation (₹)</label>
                  <input
                    type="number"
                    value={currentDept.budget || ''}
                    onChange={(e) => setCurrentDept({ ...currentDept, budget: Number(e.target.value) })}
                    className="w-full border p-2 rounded focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Employees Count</label>
                  <input
                    type="number"
                    value={0}
                    disabled
                    className="w-full border p-2 rounded focus:outline-none text-xs bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  value={currentDept.description || ''}
                  onChange={(e) => setCurrentDept({ ...currentDept, description: e.target.value })}
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

export default DepartmentList;
