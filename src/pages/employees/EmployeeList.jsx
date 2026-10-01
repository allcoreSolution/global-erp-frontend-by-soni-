import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, RefreshCw, Download, FileDown, Upload, 
  Plus, Edit, Trash2, Eye, MapPin, Briefcase 
} from 'lucide-react';
import api from '../../api';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees');
      if (res.data?.success) {
        setEmployees(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const res = await api.delete(`/employees/${id}`);
      if (res.data?.success) {
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Mobile', 'Department', 'Designation', 'Joining Date', 'Status'];
    const rows = employees.map(emp => [
      emp.employeeId || '',
      `"${emp.employeeName || ''}"`,
      emp.email || '',
      emp.mobile || '',
      `"${emp.department || ''}"`,
      `"${emp.designation || ''}"`,
      emp.joiningDate || '',
      emp.status || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `employees_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Mobile', 'Department', 'Designation', 'Joining Date', 'Status'];
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", 'employee_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      if (lines.length <= 1) {
        alert('CSV file is empty or only contains headers.');
        return;
      }

      const newEmployees = [];
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        if (columns.length < 2) continue; 

        newEmployees.push({
          employeeId: columns[0] || `EMP-${Date.now()}-${i}`,
          employeeName: columns[1] || 'Unknown Employee',
          email: columns[2] || '',
          mobile: columns[3] || '',
          department: columns[4] || '',
          designation: columns[5] || '',
          joiningDate: columns[6] || new Date().toISOString().split('T')[0],
          status: columns[7] || 'Active'
        });
      }

      try {
        const res = await api.post('/employees/import', newEmployees);
        if (res.data?.success) {
          fetchEmployees();
          alert(`Successfully imported ${res.data.count || res.data.data?.length} employees!`);
        }
      } catch (error) {
        console.error("Failed to import", error);
        alert('Failed to import employees. Please check data format.');
      }
      
      e.target.value = '';
    };

    reader.readAsText(file);
  };

  const filteredEmployees = employees.filter(emp => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (emp.employeeName?.toLowerCase().includes(s) || 
            emp.employeeId?.toLowerCase().includes(s) ||
            emp.department?.toLowerCase().includes(s));
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Users size={20} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-wide">Employee Directory</h1>
              <p className="text-slate-500 text-xs mt-0.5">Manage and view all company employees</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
             <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm">
               <Upload size={16} className="text-indigo-600" /> Import CSV
               <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
             </label>
             <button onClick={handleDownloadSample} className="flex items-center gap-2 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors shadow-sm">
               <FileDown size={16} className="text-blue-600" /> Sample File
             </button>
             <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors shadow-sm">
               <Download size={16} className="text-emerald-600" /> Export CSV
             </button>
             <button 
               onClick={() => navigate('/employees/profile')} 
               className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all ml-2"
             >
               <Plus size={18} />
               Add Employee
             </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by Name, ID or Dept..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded text-sm focus:border-indigo-500 outline-none bg-white transition-colors"
              />
            </div>
            <button onClick={fetchEmployees} className="p-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 rounded transition-colors" title="Refresh">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* List / Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-indigo-600">
              <RefreshCw size={32} className="animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Contact Info</th>
                  <th className="p-4 font-semibold">Department</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold overflow-hidden">
                            {emp.profilePhoto ? (
                               <img src={`http://localhost:5000/${emp.profilePhoto}`} alt={emp.employeeName} className="w-full h-full object-cover" />
                            ) : (
                               emp.employeeName?.charAt(0)?.toUpperCase() || 'E'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{emp.employeeName}</div>
                            <div className="text-xs text-slate-500">{emp.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-700">{emp.email || 'N/A'}</div>
                        <div className="text-xs text-slate-500 mt-1">{emp.mobile || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Briefcase size={14} className="text-slate-400" />
                          {emp.department || 'Not Assigned'}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 pl-5">{emp.designation || ''}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {emp.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => navigate(`/employees/view/${emp._id}`)} 
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => navigate(`/employees/profile/${emp._id}`)} 
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(emp._id)} 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-sm text-slate-500 font-medium">
             Total Records: {filteredEmployees.length}
           </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeList;
