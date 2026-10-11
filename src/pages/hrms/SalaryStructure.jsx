import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Calculator, 
  Plus, 
  Trash2, 
  Edit, 
  List, 
  User, 
  Building, 
  Briefcase, 
  Search,
  Sparkles,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';

const SalaryStructure = () => {
  const navigate = useNavigate();

  const [view, setView] = useState('list'); // 'list' | 'form'
  const [structures, setStructures] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const initialFormState = {
    code: `SAL-STR-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    name: '',
    employee: '',
    employeeId: '',
    employeeName: '',
    company: '',
    branch: '',
    department: '',
    designation: '',
    employeeType: 'Permanent',
    currency: 'INR',
    effectiveFrom: todayStr,
    status: 'Active',
    workingDays: '30',
    overtime: 'No',
    lop: 'Yes',
    leaveDeduction: 'Yes',
    lateDeduction: 'No',
    bonus: 'No',
    pfApplicable: 'Yes',
    esicApplicable: 'Yes',
    ptApplicable: 'Yes',
    tdsApplicable: 'Yes'
  };

  const [form, setForm] = useState(initialFormState);

  const [earnings, setEarnings] = useState([
    { id: 1, component: 'Basic Salary', type: 'Fixed', amount: 25000, calculatedValue: 25000 },
    { id: 2, component: 'HRA', type: '% Basic', amount: 40, calculatedValue: 10000 },
    { id: 3, component: 'Special Allowance', type: 'Fixed', amount: 5000, calculatedValue: 5000 },
  ]);

  const [deductions, setDeductions] = useState([
    { id: 4, component: 'PF Employee (12%)', type: '% Basic', amount: 12, calculatedValue: 3000 },
    { id: 5, component: 'ESIC Employee (0.75%)', type: '% Gross', amount: 0.75, calculatedValue: 300 },
    { id: 6, component: 'Professional Tax (PT)', type: 'Fixed', amount: 200, calculatedValue: 200 },
  ]);

  const [totals, setTotals] = useState({
    basic: 25000,
    grossEarnings: 40000,
    totalDeductions: 3500,
    netSalary: 36500,
    employerCost: 43000,
    ctc: 516000
  });

  useEffect(() => {
    fetchEmployees();
    if (view === 'list') {
      fetchStructures();
    }
  }, [view]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      if (res.data?.success) {
        setEmployees(res.data.data || []);
      }
    } catch (err) {
      console.warn("Could not fetch employee list", err);
    }
  };

  const fetchStructures = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/salary-structures');
      if (res.data?.success) {
        setStructures(res.data.data.reverse());
      }
    } catch (error) {
      console.error("Failed to fetch salary structures", error);
    } finally {
      setIsLoading(false);
    }
  };

  // When an employee is selected, automatically populate company, branch, department, designation
  const handleEmployeeSelect = (empId) => {
    const selectedEmp = employees.find(e => e._id === empId || e.employeeId === empId);
    if (selectedEmp) {
      setForm(prev => ({
        ...prev,
        employee: selectedEmp._id,
        employeeId: selectedEmp.employeeId || '',
        employeeName: (selectedEmp.employeeName || '').trim(),
        name: prev.name || `${(selectedEmp.employeeName || '').trim()} - Salary Package`,
        company: selectedEmp.company || prev.company || '',
        branch: selectedEmp.branch || prev.branch || '',
        department: (selectedEmp.department || prev.department || '').trim(),
        designation: (selectedEmp.designation || selectedEmp.role || prev.designation || '').trim(),
        employeeType: selectedEmp.employeeType || 'Permanent'
      }));
    } else {
      setForm(prev => ({
        ...prev,
        employee: '',
        employeeId: '',
        employeeName: ''
      }));
    }
  };

  // Dynamic Calculations for Earnings & Deductions
  useEffect(() => {
    const basicEarn = earnings.find(e => 
      e.component === 'Basic Salary' || e.component.toLowerCase().includes('basic')
    )?.amount || 0;
    
    let calcEarnings = 0;
    const processedEarnings = earnings.map(earn => {
      let val = 0;
      if (earn.type === 'Fixed') {
        val = Number(earn.amount) || 0;
      } else if (earn.type.includes('% Basic') || earn.type === '%') {
        val = (Number(earn.amount) * Number(basicEarn)) / 100;
      }
      calcEarnings += val;
      return { ...earn, calculatedValue: Math.round(val) };
    });

    let calcDeductions = 0;
    const processedDeductions = deductions.map(ded => {
      let val = 0;
      if (ded.type === 'Fixed') {
        val = Number(ded.amount) || 0;
      } else if (ded.type.includes('% Basic') || ded.type === '%') {
        val = (Number(ded.amount) * Number(basicEarn)) / 100;
      } else if (ded.type.includes('% Gross')) {
        val = (Number(ded.amount) * Number(calcEarnings)) / 100;
      }
      calcDeductions += val;
      return { ...ded, calculatedValue: Math.round(val) };
    });

    const netSalary = Math.round(calcEarnings - calcDeductions);
    const employerPf = form.pfApplicable === 'Yes' ? Math.round((Number(basicEarn) * 12) / 100) : 0;
    const employerCost = Math.round(calcEarnings + employerPf);

    setTotals({
      basic: Number(basicEarn),
      grossEarnings: Math.round(calcEarnings),
      totalDeductions: Math.round(calcDeductions),
      netSalary,
      employerCost,
      ctc: employerCost * 12
    });
  }, [earnings, deductions, form.pfApplicable]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEarningChange = (id, field, value) => {
    setEarnings(earnings.map(earn => earn.id === id ? { ...earn, [field]: value } : earn));
  };

  const handleDeductionChange = (id, field, value) => {
    setDeductions(deductions.map(ded => ded.id === id ? { ...ded, [field]: value } : ded));
  };

  const addEarning = () => {
    setEarnings([...earnings, { id: Date.now(), component: '', type: 'Fixed', amount: 0, calculatedValue: 0 }]);
  };

  const addDeduction = () => {
    setDeductions([...deductions, { id: Date.now(), component: '', type: 'Fixed', amount: 0, calculatedValue: 0 }]);
  };

  const removeEarning = (id) => {
    setEarnings(earnings.filter(earn => earn.id !== id));
  };

  const removeDeduction = (id) => {
    setDeductions(deductions.filter(ded => ded.id !== id));
  };

  const handleAddNew = () => {
    setEditingId(null);
    setForm({ 
      ...initialFormState, 
      code: `SAL-STR-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}` 
    });
    setEarnings([
      { id: Date.now(), component: 'Basic Salary', type: 'Fixed', amount: 25000, calculatedValue: 25000 },
      { id: Date.now() + 1, component: 'HRA', type: '% Basic', amount: 40, calculatedValue: 10000 },
      { id: Date.now() + 2, component: 'Special Allowance', type: 'Fixed', amount: 5000, calculatedValue: 5000 }
    ]);
    setDeductions([
      { id: Date.now() + 3, component: 'PF Employee (12%)', type: '% Basic', amount: 12, calculatedValue: 3000 },
      { id: Date.now() + 4, component: 'ESIC Employee (0.75%)', type: '% Gross', amount: 0.75, calculatedValue: 300 },
      { id: Date.now() + 5, component: 'Professional Tax (PT)', type: 'Fixed', amount: 200, calculatedValue: 200 }
    ]);
    setView('form');
  };

  const handleEdit = (struct) => {
    setEditingId(struct._id);
    const empId = struct.employee?._id || struct.employee || '';
    setForm({
      code: struct.code || '',
      name: struct.name || '',
      employee: empId,
      employeeId: struct.employeeId || struct.employee?.employeeId || '',
      employeeName: struct.employeeName || struct.employee?.employeeName || '',
      company: struct.company || '',
      branch: struct.branch || '',
      department: struct.department || '',
      designation: struct.designation || '',
      employeeType: struct.employeeType || 'Permanent',
      currency: struct.currency || 'INR',
      effectiveFrom: struct.effectiveFrom || todayStr,
      status: struct.status || 'Active',
      workingDays: struct.workingDays || '30',
      overtime: struct.overtime || 'No',
      lop: struct.lop || 'Yes',
      leaveDeduction: struct.leaveDeduction || 'Yes',
      lateDeduction: struct.lateDeduction || 'No',
      bonus: struct.bonus || 'No',
      pfApplicable: struct.pfApplicable || 'Yes',
      esicApplicable: struct.esicApplicable || 'Yes',
      ptApplicable: struct.ptApplicable || 'Yes',
      tdsApplicable: struct.tdsApplicable || 'Yes'
    });

    if (struct.earnings && struct.earnings.length > 0) {
      setEarnings(struct.earnings.map(e => ({ ...e, id: e._id || Date.now() + Math.random() })));
    }
    if (struct.deductions && struct.deductions.length > 0) {
      setDeductions(struct.deductions.map(d => ({ ...d, id: d._id || Date.now() + Math.random() })));
    }
    setView('form');
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Salary Structure?',
      text: 'Are you sure you want to delete this salary structure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/salary-structures/${id}`);
      setStructures(structures.filter(s => s._id !== id));
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Salary structure deleted successfully.',
        timer: 1600,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Failed to delete", error);
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error.response?.data?.message || error.message
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.effectiveFrom) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Details',
        text: 'Please provide structure name and effective date.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        earnings: earnings.map(e => ({ 
          component: e.component, 
          type: e.type, 
          amount: Number(e.amount), 
          calculatedValue: e.calculatedValue 
        })),
        deductions: deductions.map(d => ({ 
          component: d.component, 
          type: d.type, 
          amount: Number(d.amount), 
          calculatedValue: d.calculatedValue 
        })),
        totals
      };

      if (editingId) {
        await api.put(`/salary-structures/${editingId}`, payload);
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Salary Structure updated successfully!',
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        await api.post('/salary-structures', payload);
        await Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Salary Structure created successfully!',
          timer: 1800,
          showConfirmButton: false
        });
      }
      setView('list');
    } catch (error) {
      console.error("Failed to save", error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Save',
        text: error.response?.data?.message || error.message,
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] text-slate-800 space-y-5">
      
      {/* Header Navigation */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <button 
          onClick={() => view === 'form' ? setView('list') : navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200/60 px-3.5 py-1.5 rounded-full shadow-xs transition"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center gap-2">
           {view === 'list' ? (
             <button 
               onClick={handleAddNew} 
               className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-full text-xs font-bold shadow-xs transition"
             >
               <Plus size={14} /> Assign Employee Salary
             </button>
           ) : (
             <>
               <button 
                 type="button" 
                 onClick={() => setView('list')} 
                 className="px-4 py-2 border border-slate-200 bg-white rounded-full text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-xs transition"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSave} 
                 disabled={isSubmitting} 
                 type="button" 
                 className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-full text-xs font-bold shadow-xs transition disabled:opacity-50"
               >
                 <CheckCircle size={15} /> {isSubmitting ? 'Saving...' : 'Save Salary Structure'}
               </button>
             </>
           )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        
        {/* Main Title Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
               {view === 'list' ? <List size={22} /> : <Calculator size={22} />}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800">
                {view === 'list' ? 'Employee Salary Structures' : (editingId ? 'Edit Employee Salary Structure' : 'Assign Employee Salary & PF Structure')}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                {view === 'list' 
                  ? 'Manage compensation and PF/ESI packages linked directly to staff employees.' 
                  : 'Select employee to auto-fill branch, department & designation, then customize salary components.'}
              </p>
            </div>
          </div>
          {view === 'list' && (
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50/70 border border-indigo-100/70 px-3 py-1 rounded-full">
              {structures.length} Assigned Structures
            </span>
          )}
        </div>

        {view === 'list' ? (
          // =========================================================================
          // LIST VIEW
          // =========================================================================
          <div className="p-4 sm:p-6">
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 pl-4">Code</th>
                    <th className="p-3">Employee Name</th>
                    <th className="p-3">Department & Designation</th>
                    <th className="p-3">Gross Salary</th>
                    <th className="p-3">Deductions</th>
                    <th className="p-3">Net Take-Home</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80 font-medium">
                  {isLoading ? (
                    <tr><td colSpan="8" className="p-6 text-center text-slate-400 text-xs">Loading salary structures...</td></tr>
                  ) : structures.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Calculator size={18} />
                        </div>
                        <p className="text-xs font-semibold text-slate-600">No employee salary structures found.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Click &quot;Assign Employee Salary&quot; above to set up compensation.</p>
                      </td>
                    </tr>
                  ) : (
                    structures.map((s) => {
                      const empName = s.employee?.employeeName || s.employeeName || s.name;
                      const empCode = s.employee?.employeeId || s.employeeId || '';
                      const dept = s.department || s.employee?.department || '-';
                      const desig = s.designation || s.employee?.designation || '-';

                      return (
                        <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 pl-4 font-bold text-slate-700">{s.code}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{empName}</div>
                            {empCode && <div className="text-[10px] text-slate-400">{empCode}</div>}
                          </td>
                          <td className="p-3 text-slate-600">
                            <div>{desig}</div>
                            <div className="text-[10px] text-slate-400">{dept}</div>
                          </td>
                          <td className="p-3 text-emerald-700 font-bold">
                            ₹{s.totals?.grossEarnings?.toLocaleString() || 0}
                          </td>
                          <td className="p-3 text-rose-600 font-bold">
                            - ₹{s.totals?.totalDeductions?.toLocaleString() || 0}
                          </td>
                          <td className="p-3 font-extrabold text-indigo-700">
                            <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100/70 rounded-full">
                              ₹{s.totals?.netSalary?.toLocaleString() || 0}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold border ${
                              s.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-4">
                            <button 
                              onClick={() => handleEdit(s)} 
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition mr-1" 
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(s._id)} 
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full transition" 
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // =========================================================================
          // FORM VIEW (Simplified: Select Employee -> Auto-fill details -> Customize Earnings/Deductions)
          // =========================================================================
          <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6">
            
            {/* STEP 1: CHOOSE EMPLOYEE (Auto-fills Company, Branch, Dept, Role) */}
            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Employee Selection & Auto-Fill</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Employee Selector Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Employee <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      name="employee" 
                      value={form.employee} 
                      onChange={(e) => handleEmployeeSelect(e.target.value)}
                      required 
                      className="w-full text-xs py-2 px-3 bg-white rounded-xl border border-slate-200/60 outline-none focus:border-indigo-500 font-semibold text-slate-800 shadow-xs cursor-pointer"
                    >
                      <option value="">-- Choose Employee From Directory --</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.employeeName} ({emp.employeeId || 'No ID'}) - {emp.department || 'General'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Select karte hi Branch, Department, Designation employee profile se automatic bhar jayenge.
                  </p>
                </div>

                {/* Structure Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Structure Code</label>
                  <input 
                    type="text" 
                    name="code" 
                    value={form.code} 
                    readOnly 
                    className="w-full text-xs py-2 px-3 bg-slate-100/70 border border-slate-200 rounded-xl font-bold text-slate-600 cursor-not-allowed" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Effective From *</label>
                  <input 
                    type="date" 
                    name="effectiveFrom" 
                    value={form.effectiveFrom} 
                    onChange={handleChange} 
                    required 
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-200/60 rounded-xl font-medium text-slate-700 outline-none focus:border-indigo-400 shadow-xs" 
                  />
                </div>

                {/* Auto-populated read-only / editable badges */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input 
                    type="text" 
                    name="department" 
                    value={form.department} 
                    onChange={handleChange}
                    placeholder="Auto-filled from employee"
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-200/60 rounded-xl font-medium text-slate-700 outline-none focus:border-indigo-400 shadow-xs" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Role</label>
                  <input 
                    type="text" 
                    name="designation" 
                    value={form.designation} 
                    onChange={handleChange}
                    placeholder="Auto-filled from employee"
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-200/60 rounded-xl font-medium text-slate-700 outline-none focus:border-indigo-400 shadow-xs" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                  <input 
                    type="text" 
                    name="branch" 
                    value={form.branch} 
                    onChange={handleChange}
                    placeholder="Auto-filled from employee"
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-200/60 rounded-xl font-medium text-slate-700 outline-none focus:border-indigo-400 shadow-xs" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select 
                    name="status" 
                    value={form.status} 
                    onChange={handleChange} 
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-200/60 rounded-xl font-semibold text-slate-700 outline-none focus:border-indigo-400 shadow-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>
            </div>

            {/* STEP 2: EARNINGS & DEDUCTIONS + SUMMARY */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
               
               {/* LEFT COLUMN: EARNINGS & DEDUCTIONS TABLES */}
               <div className="xl:col-span-2 space-y-6">
                  
                  {/* EARNINGS */}
                  <div className="border border-emerald-100 bg-emerald-50/20 rounded-2xl p-5 shadow-xs">
                     <div className="flex justify-between items-center mb-4 pb-2 border-b border-emerald-100">
                       <div className="flex items-center gap-2">
                         <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                         <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Salary Earnings (Gross)</h3>
                       </div>
                       <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
                         Total Gross: ₹{totals.grossEarnings.toLocaleString()}
                       </span>
                     </div>
                     
                     <div className="overflow-x-auto">
                       <table className="w-full text-left text-xs border-collapse">
                         <thead>
                           <tr className="border-b border-emerald-100 text-emerald-900/80 font-bold">
                             <th className="pb-2 w-1/2">Component Name</th>
                             <th className="pb-2 w-1/4">Type</th>
                             <th className="pb-2 w-1/4 text-right">Value</th>
                             <th className="pb-2 w-1/4 text-right">Monthly Amount</th>
                             <th className="pb-2 w-8"></th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-emerald-100/50">
                           {earnings.map((earn) => (
                             <tr key={earn.id}>
                               <td className="py-2.5 pr-2">
                                 <input 
                                   type="text" 
                                   value={earn.component} 
                                   onChange={(e) => handleEarningChange(earn.id, 'component', e.target.value)} 
                                   className="w-full border border-slate-200/70 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:border-emerald-500 outline-none font-semibold text-slate-800" 
                                   placeholder="e.g. Basic Salary" 
                                 />
                               </td>
                               <td className="py-2.5 pr-2">
                                 <select 
                                   value={earn.type} 
                                   onChange={(e) => handleEarningChange(earn.id, 'type', e.target.value)} 
                                   className="w-full border border-slate-200/70 rounded-lg px-2 py-1.5 text-xs bg-white focus:border-emerald-500 outline-none font-medium cursor-pointer"
                                 >
                                   <option value="Fixed">Fixed Amount</option>
                                   <option value="% Basic">% of Basic</option>
                                 </select>
                               </td>
                               <td className="py-2.5 pr-2 text-right">
                                 <input 
                                   type="number" 
                                   value={earn.amount} 
                                   onChange={(e) => handleEarningChange(earn.id, 'amount', e.target.value)} 
                                   className="w-24 border border-slate-200/70 rounded-lg px-2.5 py-1.5 text-xs bg-white text-right focus:border-emerald-500 outline-none font-bold text-slate-800" 
                                 />
                               </td>
                               <td className="py-2.5 text-right font-bold text-emerald-800">
                                 ₹{earn.calculatedValue?.toLocaleString() || 0}
                               </td>
                               <td className="py-2.5 text-center">
                                 <button 
                                   type="button" 
                                   onClick={() => removeEarning(earn.id)} 
                                   className="text-slate-300 hover:text-rose-600 transition p-1"
                                 >
                                   <Trash2 size={14} />
                                 </button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>

                     <button 
                       type="button" 
                       onClick={addEarning} 
                       className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white border border-emerald-200/80 px-3 py-1.5 rounded-full shadow-xs transition"
                     >
                       <Plus size={13} /> Add Earning Component
                     </button>
                  </div>

                  {/* DEDUCTIONS (PF / ESIC / PT) */}
                  <div className="border border-rose-100 bg-rose-50/20 rounded-2xl p-5 shadow-xs">
                     <div className="flex justify-between items-center mb-4 pb-2 border-b border-rose-100">
                       <div className="flex items-center gap-2">
                         <span className="w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                         <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Statutory Deductions (PF / ESIC / PT)</h3>
                       </div>
                       <span className="text-xs font-extrabold text-rose-700 bg-rose-100/70 px-3 py-1 rounded-full">
                         Total Deductions: - ₹{totals.totalDeductions.toLocaleString()}
                       </span>
                     </div>
                     
                     <div className="overflow-x-auto">
                       <table className="w-full text-left text-xs border-collapse">
                         <thead>
                           <tr className="border-b border-rose-100 text-rose-900/80 font-bold">
                             <th className="pb-2 w-1/2">Deduction Component</th>
                             <th className="pb-2 w-1/4">Type</th>
                             <th className="pb-2 w-1/4 text-right">Value</th>
                             <th className="pb-2 w-1/4 text-right">Monthly Cut</th>
                             <th className="pb-2 w-8"></th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-rose-100/50">
                           {deductions.map((ded) => (
                             <tr key={ded.id}>
                               <td className="py-2.5 pr-2">
                                 <input 
                                   type="text" 
                                   value={ded.component} 
                                   onChange={(e) => handleDeductionChange(ded.id, 'component', e.target.value)} 
                                   className="w-full border border-slate-200/70 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:border-rose-500 outline-none font-semibold text-slate-800" 
                                   placeholder="e.g. PF Employee" 
                                 />
                               </td>
                               <td className="py-2.5 pr-2">
                                 <select 
                                   value={ded.type} 
                                   onChange={(e) => handleDeductionChange(ded.id, 'type', e.target.value)} 
                                   className="w-full border border-slate-200/70 rounded-lg px-2 py-1.5 text-xs bg-white focus:border-rose-500 outline-none font-medium cursor-pointer"
                                 >
                                   <option value="% Basic">% of Basic</option>
                                   <option value="% Gross">% of Gross</option>
                                   <option value="Fixed">Fixed Amount</option>
                                 </select>
                               </td>
                               <td className="py-2.5 pr-2 text-right">
                                 <input 
                                   type="number" 
                                   value={ded.amount} 
                                   onChange={(e) => handleDeductionChange(ded.id, 'amount', e.target.value)} 
                                   className="w-24 border border-slate-200/70 rounded-lg px-2.5 py-1.5 text-xs bg-white text-right focus:border-rose-500 outline-none font-bold text-slate-800" 
                                 />
                               </td>
                               <td className="py-2.5 text-right font-bold text-rose-700">
                                 - ₹{ded.calculatedValue?.toLocaleString() || 0}
                               </td>
                               <td className="py-2.5 text-center">
                                 <button 
                                   type="button" 
                                   onClick={() => removeDeduction(ded.id)} 
                                   className="text-slate-300 hover:text-rose-600 transition p-1"
                                 >
                                   <Trash2 size={14} />
                                 </button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>

                     <button 
                       type="button" 
                       onClick={addDeduction} 
                       className="mt-3 flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-900 bg-white border border-rose-200/80 px-3 py-1.5 rounded-full shadow-xs transition"
                     >
                       <Plus size={13} /> Add Deduction Component
                     </button>
                  </div>

               </div>

               {/* RIGHT COLUMN: Real-time Salary Summary Card & Statutory Flags */}
               <div className="space-y-5">
                  
                  {/* REAL-TIME TAKE HOME SUMMARY */}
                  <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Pay Summary</h3>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                        Live Calculated
                      </span>
                    </div>

                    <div className="space-y-3 font-medium text-xs">
                       <div className="flex justify-between items-center text-slate-300">
                         <span>Basic Salary</span>
                         <span className="font-bold">₹{totals.basic.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center text-emerald-400">
                         <span>Gross Salary (Earnings)</span>
                         <span className="font-bold">₹{totals.grossEarnings.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center text-rose-400">
                         <span>Total Deductions (PF/ESIC/PT)</span>
                         <span className="font-bold">- ₹{totals.totalDeductions.toLocaleString()}</span>
                       </div>
                       
                       <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                         <span className="text-white">Net Take-Home Pay</span>
                         <span className="text-emerald-400 text-base font-extrabold">
                           ₹{totals.netSalary.toLocaleString()}
                         </span>
                       </div>

                       <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
                         <div className="flex justify-between items-center">
                           <span>Employer PF Cost (12%)</span>
                           <span>₹{Math.round((totals.basic * 12) / 100).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <span>Total CTC (Monthly)</span>
                           <span>₹{totals.employerCost.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center font-bold text-slate-200">
                           <span>Annual CTC</span>
                           <span>₹{totals.ctc.toLocaleString()}</span>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* STATUTORY RULES (PF & ESIC APPLICABILITY) */}
                  <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
                      Compliance & Rules
                    </h3>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">PF Applicable?</label>
                        <select 
                          name="pfApplicable" 
                          value={form.pfApplicable} 
                          onChange={handleChange} 
                          className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200/60 rounded-xl font-bold text-slate-700 outline-none"
                        >
                          <option value="Yes">Yes (12%)</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">ESIC Applicable?</label>
                        <select 
                          name="esicApplicable" 
                          value={form.esicApplicable} 
                          onChange={handleChange} 
                          className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200/60 rounded-xl font-bold text-slate-700 outline-none"
                        >
                          <option value="Yes">Yes (0.75%)</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Loss of Pay (LOP)</label>
                        <select 
                          name="lop" 
                          value={form.lop} 
                          onChange={handleChange} 
                          className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200/60 rounded-xl font-bold text-slate-700 outline-none"
                        >
                          <option value="Yes">Yes (Cut on Absent)</option>
                          <option value="No">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Working Days</label>
                        <input 
                          type="number" 
                          name="workingDays" 
                          value={form.workingDays} 
                          onChange={handleChange} 
                          className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200/60 rounded-xl font-bold text-slate-700 outline-none"
                        />
                      </div>
                    </div>
                  </div>

               </div>

            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SalaryStructure;
