import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Upload, Printer, CheckCircle } from 'lucide-react';
import api from '../../api';

const Utilities = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [log, setLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    addLog("Fetching employee registry from database...");
    try {
      const res = await api.get('/employees');
      if (res.data?.success) {
        setEmployees(res.data.data);
        addLog(`Success: Loaded ${res.data.data.length} active employee records.`);
      }
    } catch (error) {
      console.error("Failed to fetch employees", error);
      addLog(`Error: Failed to fetch employees. ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = employees.filter(e =>
    (e.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Real CSV Export
  const handleExportCSV = () => {
    if (employees.length === 0) {
       alert("No employees to export!");
       return;
    }
    addLog("Exporting Employee registries to CSV spreadsheet format...");
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Joining Date'];
    const rows = employees.map(emp => [
      emp.employeeId || '-',
      `"${(emp.employeeName || '-').replace(/"/g, '""')}"`,
      emp.department || '-',
      emp.designation || '-',
      emp.joiningDate || '-'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `employees_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Success: EmployeeRegistry.csv generated & downloaded successfully.");
  };

  // Real CSV Import to Backend
  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    addLog(`Parsing import spreadsheet file: "${file.name}"...`);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const newEmployees = [];
        
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 4) {
            newEmployees.push({
              employeeId: cols[0] || `EMP-NEW-${Date.now()}-${i}`,
              employeeName: cols[1] || 'Imported Employee',
              department: cols[2] || 'General',
              designation: cols[3] || 'Staff',
              status: 'Active'
            });
          }
        }

        if (newEmployees.length > 0) {
          addLog(`Uploading ${newEmployees.length} profiles to the database. Please wait...`);
          
          let successCount = 0;
          let failCount = 0;

          // Sequentially post to backend
          for (const emp of newEmployees) {
             try {
                await api.post('/employees', emp);
                successCount++;
             } catch (err) {
                console.error("Failed to insert row", err);
                failCount++;
             }
          }

          if (successCount > 0) {
             addLog(`Success: Uploaded ${successCount} new employee profiles to database.`);
             alert(`Successfully imported ${successCount} employees!`);
             fetchEmployees(); // Refresh the list from the database
          }
          if (failCount > 0) {
             addLog(`Warning: Failed to upload ${failCount} profiles. Possible duplicates or errors.`);
             alert(`Completed with errors. ${successCount} succeeded, ${failCount} failed.`);
          }

        } else {
          addLog("Warning: No valid records parsed from uploaded CSV.");
          alert("Import failed. Headers should match: Employee ID, Employee Name, Department, Designation");
        }
      } catch (err) {
        addLog("Error: CSV parsing crashed.");
        alert("Failed to parse the CSV file. Check format.");
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handlePrintReport = () => {
    addLog("Composing print roster page...");
    window.print();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen space-y-6">
      <input
        type="file"
        id="employee-csv-import"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImportCSV}
      />

      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Employee Utilities & Operations</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Run search filter matrices, import bulk data logs, export directories, and print employee payroll summary reports.</p>
      </div>

      {/* Control Actions Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold no-print">
        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Download size={14} className="text-indigo-600" /> Export Registry</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Save your entire employee roster directories, bank routing structures, and departments logs to a local CSV.</p>
          </div>
          <button onClick={handleExportCSV} disabled={isLoading} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs disabled:opacity-50">
            {isLoading ? 'Loading...' : 'Run Export CSV'}
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Upload size={14} className="text-emerald-600" /> Bulk Import Spreadsheet</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Upload a batch CSV file to import multiple employee credentials, roles, and salary configurations instantly.</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="w-full mt-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-semibold transition-colors text-xs">
            Upload CSV File
          </button>
        </div>

        <div className="bg-slate-50 p-4 border rounded-lg space-y-2 flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div>
            <h3 className="font-bold text-slate-800 text-[12px] sm:text-[13px] flex items-center gap-1.5"><Printer size={14} className="text-indigo-600" /> Spool Print Summary</h3>
            <p className="text-gray-500 font-normal mt-1 leading-relaxed text-[11px] sm:text-xs">Send the filtered employee active directory registers directly to the printer or save as PDF format.</p>
          </div>
          <button onClick={handlePrintReport} className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold transition-colors text-xs">
            Print / PDF Page
          </button>
        </div>
      </div>

      {/* Search demonstration */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-bold text-[11px] sm:text-xs uppercase text-slate-700 tracking-wider">Search Filters Testing Matrix</h3>
        <div className="relative max-w-sm no-print">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Name or Department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Demo filtered list */}
        <div className="border rounded overflow-x-auto text-[10px] sm:text-[11px]">
          <table className="block w-full overflow-x-auto w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-2 whitespace-nowrap">ID</th>
                <th className="p-2 whitespace-nowrap">Employee Name</th>
                <th className="p-2 whitespace-nowrap">Department</th>
                <th className="p-2 whitespace-nowrap">Designation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                 <tr><td colSpan="4" className="p-4 text-center text-gray-500">Loading data...</td></tr>
              ) : filtered.length === 0 ? (
                 <tr><td colSpan="4" className="p-4 text-center text-gray-500">No records found.</td></tr>
              ) : (
                filtered.map(emp => (
                  <tr key={emp._id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{emp.employeeId || '-'}</td>
                    <td className="p-2 font-medium text-gray-900">{emp.employeeName || '-'}</td>
                    <td className="p-2 text-gray-600 whitespace-nowrap">{emp.department || '-'}</td>
                    <td className="p-2 text-gray-500 whitespace-nowrap">{emp.designation || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Utility console logger */}
      <div className="bg-slate-800 shadow-inner border border-slate-700 rounded-lg p-4 no-print">
        <h4 className="font-mono text-xs font-semibold text-gray-300 mb-2 border-b border-gray-600 pb-1.5 flex items-center gap-1.5">
          <CheckCircle size={13} className="text-emerald-500" /> Utility Console Log
        </h4>
        <div className="font-mono text-[9px] sm:text-[10px] text-emerald-400 h-28 overflow-y-auto space-y-1">
          {log.length > 0 ? (
            log.map((line, i) => <div key={i} className={line.includes('Error') ? 'text-red-400' : line.includes('Warning') ? 'text-yellow-400' : ''}>{line}</div>)
          ) : (
            <div className="text-gray-500 italic">No operations recorded yet. Click one of the operations above.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Utilities;
