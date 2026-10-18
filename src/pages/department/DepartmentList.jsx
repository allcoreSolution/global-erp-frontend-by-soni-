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
    const headers = ['Department Code', 'Department Name', 'Description', 'Status'];
    const rows = departments.map(d => [
      d.deptCode,
      `"${(d.deptName || '').replace(/"/g, '""')}"`,
      `"${(d.description || '').replace(/"/g, '""')}"`,
      d.status || 'Active'
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
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let successCount = 0;
        
        // Loop through lines (skipping header)
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          // Expecting: Dept Code, Dept Name, Description, Status
          if (cols.length >= 2) { // Minimum required is Code and Name, but backend auto-generates code if missing
            const deptData = {
              deptCode: cols[0] || `DPT-${Math.floor(Math.random() * 1000)}`,
              deptName: cols[1],
              description: cols[2] || '',
              status: cols[3] || 'Active'
            };
            
            // Call API to save to DB
            if (deptData.deptName) {
              await api.post('/departments', deptData);
              successCount++;
            }
          }
        }
        
        if (successCount > 0) {
          alert(`Successfully imported ${successCount} departments!`);
          fetchDepartments(); // Refresh list from DB
        } else {
          alert("Import failed. Headers should match: Department Code, Department Name, Description, Status");
        }
      } catch (err) {
        alert("Failed to parse CSV file or upload to server.");
        console.error(err);
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
              <th className="p-2.5 sm:p-3">Description</th>
              <th className="p-2.5 sm:p-3 text-center">Status</th>
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
                  </td>
                  <td className="p-2.5 sm:p-3 text-gray-500 text-xs">{d.description || '-'}</td>
                  <td className="p-2.5 sm:p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${d.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {d.status || 'Active'}
                    </span>
                  </td>
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
                  <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={currentDept.status || 'Active'}
                    onChange={(e) => setCurrentDept({ ...currentDept, status: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none bg-white text-xs text-emerald-600 font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  value={currentDept.description || ''}
                  onChange={(e) => setCurrentDept({ ...currentDept, description: e.target.value })}
                  className="w-full border p-2 rounded focus:outline-none text-xs resize-none"
                ></textarea>
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
