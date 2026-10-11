import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, RefreshCw, Download, FileDown, Upload, 
  Plus, Edit, Trash2, Eye, MapPin, Briefcase, ShieldCheck, Clock
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';
import { usePermissions } from '../../utils/permissionUtils';

const EmployeeList = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();
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

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Employee?',
      text: `Are you sure you want to delete ${name || 'this employee'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.delete(`/employees/${id}`);
      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Employee deleted successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error.response?.data?.message || 'Failed to delete employee.'
      });
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Employee ID', 'Name', 'DOB', 'Gender', 'Marital Status', 'Mobile', 'Email', 
      'Company', 'Branch', 'Department', 'Role', 'Employee Type', 'Joining Date', 'Status',
      'Reporting Manager', 'Shift', 'Current Address', 'Current State', 'Current City', 'Current Pincode', 'Permanent Address',
      'PAN', 'UAN', 'PF No', 'ESIC No',
      'Bank', 'Account No', 'IFSC', 'Salary Type', 'Basic Salary', 'HRA', 'Allowance', 'Gross Salary', 'Net Salary',
      'Allow ERP Login', 'Remarks'
    ];

    const rows = employees.map(emp => [
      `"${emp.employeeId || ''}"`,
      `"${emp.employeeName || ''}"`,
      `"${emp.dob || ''}"`,
      `"${emp.gender || ''}"`,
      `"${emp.maritalStatus || ''}"`,
      `"${emp.mobile || ''}"`,
      `"${emp.email || ''}"`,
      `"${emp.company || ''}"`,
      `"${emp.branch || ''}"`,
      `"${emp.department || ''}"`,
      `"${emp.role || ''}"`,
      `"${emp.employeeType || ''}"`,
      `"${emp.joiningDate || ''}"`,
      `"${emp.status || ''}"`,
      `"${emp.reportingManager || ''}"`,
      `"${emp.shift || ''}"`,
      `"${emp.currentAddress || ''}"`,
      `"${emp.currentState || ''}"`,
      `"${emp.currentCity || ''}"`,
      `"${emp.currentPincode || ''}"`,
      `"${emp.permanentAddress || ''}"`,
      `"${emp.pan || ''}"`,
      `"${emp.uan || ''}"`,
      `"${emp.pfNo || ''}"`,
      `"${emp.esicNo || ''}"`,
      `"${emp.bank || ''}"`,
      `"${emp.accountNo || ''}"`,
      `"${emp.ifsc || ''}"`,
      `"${emp.salaryType || ''}"`,
      `"${emp.basicSalary || 0}"`,
      `"${emp.hra || 0}"`,
      `"${emp.allowance || 0}"`,
      `"${emp.grossSalary || 0}"`,
      `"${emp.netSalary || 0}"`,
      `"${emp.createLogin || 'Yes'}"`,
      `"${emp.remarks || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `employees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const headers = [
      'Employee ID', 'Name', 'DOB', 'Gender', 'Marital Status', 'Mobile', 'Email', 
      'Company', 'Branch', 'Department', 'Role', 'Employee Type', 'Joining Date', 'Status',
      'Reporting Manager', 'Shift', 'Current Address', 'Current State', 'Current City', 'Current Pincode', 'Permanent Address',
      'PAN', 'UAN', 'PF No', 'ESIC No',
      'Bank', 'Account No', 'IFSC', 'Salary Type', 'Basic Salary', 'HRA', 'Allowance', 'Gross Salary', 'Net Salary',
      'Allow ERP Login', 'Remarks'
    ];

    const sampleData = [
      'EMP-1001', 'Rahul Sharma', '1995-05-15', 'Male', 'Single', '9876543210', 'rahul@example.com',
      'GLOBAL ERP', 'HEAD OFFICE', 'Sales', 'Manager', 'Permanent', '2024-04-01', 'Active',
      'Amit Kumar', 'General Shift', '123 Main Street', 'Delhi', 'New Delhi', '110001', '123 Main Street, New Delhi',
      'ABCDE1234F', '100987654321', 'DL/12345/678', '1122334455',
      'HDFC Bank', '50100234567890', 'HDFC0001234', 'Monthly', '25000', '10000', '5000', '40000', '38000',
      'Yes', 'Sample employee'
    ];

    const csvContent = headers.join(',') + '\n' + sampleData.map(d => `"${d}"`).join(',');
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
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        let values = [];
        let curVal = '';
        let inQuotes = false;
        for(let j=0; j<line.length; j++) {
            if(line[j] === '"') inQuotes = !inQuotes;
            else if(line[j] === ',' && !inQuotes) { values.push(curVal); curVal = ''; }
            else curVal += line[j];
        }
        values.push(curVal);

        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] ? values[idx].trim() : '';
        });

        if (Object.keys(row).length < 5) continue; 

          newEmployees.push({
            employeeId: row['Employee ID'] || `EMP-${Date.now()}-${i}`,
            employeeName: row['Name'] || 'Unknown Employee',
            dob: row['DOB'] || '',
            gender: row['Gender'] || '',
            maritalStatus: row['Marital Status'] || '',
            mobile: row['Mobile'] || '',
            email: row['Email'] || '',
            company: row['Company'] || '',
            branch: row['Branch'] || '',
            department: row['Department'] || '',
            role: row['Role'] || '',
            employeeType: row['Employee Type'] || 'Permanent',
            joiningDate: row['Joining Date'] || new Date().toISOString().split('T')[0],
            status: row['Status'] || 'Active',
            reportingManager: row['Reporting Manager'] || '',
            shift: row['Shift'] || '',
            currentAddress: row['Current Address'] || '',
            currentState: row['Current State'] || '',
            currentCity: row['Current City'] || '',
            currentPincode: row['Current Pincode'] || '',
            permanentAddress: row['Permanent Address'] || '',
            pan: row['PAN'] || '',
            uan: row['UAN'] || '',
            pfNo: row['PF No'] || '',
            esicNo: row['ESIC No'] || '',
            bank: row['Bank'] || '',
            accountNo: row['Account No'] || '',
            ifsc: row['IFSC'] || '',
            salaryType: row['Salary Type'] || 'Monthly',
            basicSalary: Number(row['Basic Salary']) || 0,
            hra: Number(row['HRA']) || 0,
            allowance: Number(row['Allowance']) || 0,
            grossSalary: Number(row['Gross Salary']) || 0,
            netSalary: Number(row['Net Salary']) || 0,
            createLogin: row['Allow ERP Login'] || 'Yes',
            remarks: row['Remarks'] || ''
          });
        }

        try {
          const res = await api.post('/employees/import', newEmployees);
          if (res.data?.success) {
            fetchEmployees();
            Swal.fire({
              icon: 'success',
              title: 'Import Successful',
              text: `Successfully imported ${res.data.count || res.data.data?.length || newEmployees.length} employees!`
            });
          }
        } catch (error) {
          console.error("Failed to import", error);
          Swal.fire({
            icon: 'error',
            title: 'Import Failed',
            text: error.response?.data?.message || 'Failed to import employees. Please check data format.'
          });
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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800 w-full">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden w-full">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl">
              <Users size={22} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-wide">Employee Directory</h1>
              <p className="text-slate-500 text-xs mt-0.5">Manage staff profiles, roles, and company team records</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
             {can('create_employees') && (
               <label className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-xs">
                 <Upload size={16} className="text-indigo-600" /> Import CSV
                 <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
               </label>
             )}
             {can('create_employees') && (
               <button onClick={handleDownloadSample} className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors shadow-xs">
                 <FileDown size={16} className="text-blue-600" /> Sample File
               </button>
             )}
             {can('view_employees') && (
               <button onClick={handleExportCSV} className="flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors shadow-xs">
                 <Download size={16} className="text-emerald-600" /> Export CSV
               </button>
             )}
             {can('create_employees') && (
               <button 
                 onClick={() => navigate('/employees/profile')} 
                 className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all"
               >
                 <Plus size={18} />
                 Add Employee
               </button>
             )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by Name, ID, Dept or Role..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white transition-all shadow-xs"
              />
            </div>
            <button onClick={fetchEmployees} className="p-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-600 rounded-lg transition-colors shadow-xs" title="Refresh">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* List / Table */}
        <div className="overflow-x-auto min-h-[420px]">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-indigo-600">
              <RefreshCw size={32} className="animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Department & Role</th>
                  <th className="p-4">Branch & Shift</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400 font-medium">
                      No employees found. Click "Add Employee" or "Import CSV" to get started.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold overflow-hidden shadow-xs border border-indigo-200 flex-shrink-0">
                            {emp.profilePhoto ? (
                               <img src={emp.profilePhoto.startsWith('http') ? emp.profilePhoto : `http://localhost:5000${emp.profilePhoto}`} alt={emp.employeeName} className="w-full h-full object-cover" />
                            ) : (
                               emp.employeeName?.charAt(0)?.toUpperCase() || 'E'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{emp.employeeName}</div>
                            <div className="text-xs font-semibold text-indigo-600">{emp.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-700 font-medium">{emp.email || '—'}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{emp.mobile || '—'}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                          <Briefcase size={14} className="text-indigo-500" />
                          {emp.department || 'Not Assigned'}
                        </div>
                        {emp.role && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded text-xs font-bold">
                              <ShieldCheck size={12} /> {emp.role}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <MapPin size={13} className="text-slate-400" />
                          {emp.branch || 'Head Office'}
                        </div>
                        {emp.shift && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Clock size={12} className="text-amber-500" />
                            {emp.shift}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {emp.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {can('view_employees') && (
                            <button 
                              onClick={() => navigate(`/employees/view/${emp._id}`)} 
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          {can('edit_employees') && (
                            <button 
                              onClick={() => navigate(`/employees/profile/${emp._id}`)} 
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Employee"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {can('delete_employees') && (
                            <button 
                              onClick={() => handleDelete(emp._id, emp.employeeName)} 
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Employee"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
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
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="text-xs sm:text-sm text-slate-500 font-semibold">
             Showing {filteredEmployees.length} of {employees.length} Employee Records
           </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeList;
