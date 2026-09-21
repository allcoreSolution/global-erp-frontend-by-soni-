import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, UploadCloud, UserPlus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import DynamicSelect from '../../components/DynamicSelect';

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Form State
  const [form, setForm] = useState({
    // Personal Information
    employeeId: `EMP-${Date.now()}`,
    employeeName: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    mobile: '',
    email: '',
    
    // Employment Details
    company: '',
    branch: '',
    department: '',
    designation: '',
    employeeType: 'Permanent',
    joiningDate: '',
    status: 'Active',
    reportingManager: '',
    shift: '',

    // Address
    currentAddress: '',
    currentState: '',
    currentCity: '',
    currentPincode: '',
    sameAsCurrent: false,
    permanentAddress: '',
    
    // Identity & Compliance
    pan: '',
    uan: '',
    pfNo: '',
    esicNo: '',
    
    // Bank & Salary
    bank: '',
    accountNo: '',
    ifsc: '',
    salaryType: 'Monthly',
    basicSalary: 0,
    hra: 0,
    allowance: 0,
    grossSalary: 0,
    netSalary: 0, // In real world, Net Salary = Gross - Deductions (PF, ESIC, TDS), keeping it as input or simple calculation
    
    // Emergency Contact
    emergencyName: '',
    emergencyRelationship: '',
    emergencyMobile: '',

    // ERP Login
    createLogin: 'No',
    username: '',
    role: '',
    loginStatus: 'Active',
    
    // Profile Photo
    profilePhotoFile: null,

    // Remarks
    remarks: ''
  });

  // Fetch employee if id exists
  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        try {
          const { data } = await api.get(`/employees/${id}`);
          if (data.success) {
            setForm(data.data);
          }
        } catch (error) {
          console.error("Error fetching employee data", error);
        }
      };
      fetchEmployee();
    }
  }, [id]);

  // Calculate Gross Salary whenever salary components change
  useEffect(() => {
    const basic = Number(form.basicSalary) || 0;
    const hraAmount = Number(form.hra) || 0;
    const allow = Number(form.allowance) || 0;
    const gross = basic + hraAmount + allow;
    
    setForm(prev => ({
      ...prev,
      grossSalary: gross,
      // For demonstration, defaulting net to gross unless user manually edits
      netSalary: prev.netSalary === prev.grossSalary || prev.netSalary === 0 ? gross : prev.netSalary
    }));
  }, [form.basicSalary, form.hra, form.allowance]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setForm(prev => {
      let updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      
      // Handle "Same as Current Address" logic
      if (name === 'sameAsCurrent') {
        if (checked) {
          updated.permanentAddress = `${prev.currentAddress}, ${prev.currentCity}, ${prev.currentState} - ${prev.currentPincode}`;
        } else {
          updated.permanentAddress = '';
        }
      }
      
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        basicSalary: Number(form.basicSalary) || 0,
        hra: Number(form.hra) || 0,
        allowance: Number(form.allowance) || 0,
        grossSalary: Number(form.grossSalary) || 0,
        netSalary: Number(form.netSalary) || 0
      };

      // Remove File object before sending as JSON payload
      delete payload.profilePhotoFile;
      delete payload.documentFiles;
      
      if (id) {
        await api.put(`/employees/${id}`, payload);
        alert('Employee Profile Updated successfully!');
      } else {
        await api.post('/employees', payload);
        alert('Employee Profile Created successfully!');
      }
      navigate('/employees/records');
    } catch (error) {
      console.error('Error saving employee', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to save employee. Error: ' + errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/employees/records')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Employee List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/employees/records')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button type="button" className="px-4 py-2 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold hover:bg-indigo-200 transition-colors shadow-sm">
             Save Draft
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Save Employee
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-7xl mx-auto">
        
        {/* Main Title Header */}
        <div className="bg-gradient-to-r from-violet-50 to-white px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
             <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-violet-900 uppercase tracking-wide">CREATE EMPLOYEE</h2>
            <p className="text-sm text-slate-500 font-medium">Add new staff profile and HR details</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Personal, Employment, Address */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* SECTION: PERSONAL INFORMATION */}
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Personal Information</h3>
                
                <div className="flex flex-col md:flex-row gap-6">
                   {/* Photo Upload Area */}
                   <div className="flex flex-col gap-2">
                     <label className="w-32 h-32 flex-shrink-0 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-violet-400 hover:text-violet-500 transition-colors cursor-pointer relative overflow-hidden group">
                        <ImageIcon size={32} className="mb-2" />
                        <span className="text-xs font-medium px-2 text-center truncate w-full">
                          {form.profilePhotoFile ? form.profilePhotoFile.name : 'Upload Photo'}
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setForm(prev => ({...prev, profilePhotoFile: e.target.files[0]}))} />
                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-xs font-bold">
                           Click to Change
                        </div>
                     </label>
                     {form.profilePhotoFile && (
                       <button type="button" onClick={() => setForm(prev => ({...prev, profilePhotoFile: null}))} className="w-32 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-semibold flex items-center justify-center gap-1">
                         <Trash2 size={12} /> Remove
                       </button>
                     )}
                   </div>

                   <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                       <input type="text" name="employeeId" value={form.employeeId} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                     </div>
                     <div className="md:col-span-2">
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Name *</label>
                       <input type="text" name="employeeName" value={form.employeeName} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none transition-all" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">DOB</label>
                       <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                          <select name="gender" value={form.gender} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white">
                            <option value="">Select</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Marital</label>
                          <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white">
                            <option value="">Select</option>
                            <option>Single</option>
                            <option>Married</option>
                          </select>
                        </div>
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile *</label>
                       <input type="text" name="mobile" value={form.mobile} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                       <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                     </div>
                   </div>
                </div>
              </div>

              {/* SECTION: EMPLOYMENT DETAILS */}
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                    <input type="text" name="company" value={form.company} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white" placeholder="Enter Company" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                    <DynamicSelect
                      category="Branch"
                      name="branch"
                      value={form.branch}
                      onChange={handleChange}
                      defaultOptions={['HQ']}
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                    <DynamicSelect
                      category="Department"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      defaultOptions={['IT', 'Sales', 'HR']}
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
                    <DynamicSelect
                      category="Designation"
                      name="designation"
                      value={form.designation}
                      onChange={handleChange}
                      defaultOptions={['Manager', 'Developer']}
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Type</label>
                    <select name="employeeType" value={form.employeeType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white">
                      <option>Permanent</option>
                      <option>Contract</option>
                      <option>Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Joining Date *</label>
                    <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white">
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Manager</label>
                    <DynamicSelect
                      category="Manager"
                      name="reportingManager"
                      value={form.reportingManager}
                      onChange={handleChange}
                      defaultOptions={['John Doe']}
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Shift</label>
                    <DynamicSelect
                      category="Shift"
                      name="shift"
                      value={form.shift}
                      onChange={handleChange}
                      defaultOptions={['General', 'Night']}
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: ADDRESS */}
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="md:col-span-3">
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Current Address</label>
                     <input type="text" name="currentAddress" value={form.currentAddress} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                     <input type="text" name="currentState" value={form.currentState} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                     <input type="text" name="currentCity" value={form.currentCity} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                     <input type="text" name="currentPincode" value={form.currentPincode} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                   </div>
                   
                   <div className="md:col-span-3 mt-2 flex items-center gap-2">
                     <input type="checkbox" id="sameAsCurrent" name="sameAsCurrent" checked={form.sameAsCurrent} onChange={handleChange} className="w-4 h-4 text-violet-600 rounded border-slate-300" />
                     <label htmlFor="sameAsCurrent" className="text-sm font-semibold text-slate-700 cursor-pointer">Same as Current Address</label>
                   </div>
                   
                   <div className="md:col-span-3">
                     <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Address</label>
                     <input type="text" name="permanentAddress" value={form.permanentAddress} onChange={handleChange} className={`w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none ${form.sameAsCurrent ? 'bg-slate-100' : ''}`} readOnly={form.sameAsCurrent} />
                   </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Identity, Bank, Emergency, etc. */}
            <div className="space-y-6">
              
              {/* SECTION: IDENTITY & COMPLIANCE */}
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Identity & Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">PAN</label>
                    <input type="text" name="pan" value={form.pan} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">UAN</label>
                    <input type="text" name="uan" value={form.uan} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">PF No.</label>
                    <input type="text" name="pfNo" value={form.pfNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ESIC No.</label>
                    <input type="text" name="esicNo" value={form.esicNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION: BANK & SALARY */}
              <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-200">Bank & Salary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bank</label>
                    <input type="text" name="bank" value={form.bank} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account No.</label>
                    <input type="text" name="accountNo" value={form.accountNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC</label>
                    <input type="text" name="ifsc" value={form.ifsc} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Type</label>
                    <select name="salaryType" value={form.salaryType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white">
                      <option>Monthly</option>
                      <option>Daily Wage</option>
                      <option>Hourly</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2 border-t border-slate-200">
                   <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-600">Basic Salary</span>
                      <input type="number" name="basicSalary" value={form.basicSalary} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-violet-500 outline-none bg-white" />
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-600">HRA</span>
                      <input type="number" name="hra" value={form.hra} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-violet-500 outline-none bg-white" />
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-600">Allowance</span>
                      <input type="number" name="allowance" value={form.allowance} onChange={handleChange} className="w-24 border border-slate-300 rounded px-2 py-1 text-right focus:border-violet-500 outline-none bg-white" />
                   </div>
                   
                   <div className="pt-3 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800">Gross Salary</span>
                      <span className="text-lg font-bold text-violet-700">₹{form.grossSalary.toLocaleString()}</span>
                   </div>
                   
                   <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-800">Net Salary</span>
                      <input type="number" name="netSalary" value={form.netSalary} onChange={handleChange} className="w-32 border border-slate-300 rounded px-2 py-1 text-right focus:border-violet-500 outline-none font-bold text-green-700 bg-white" />
                   </div>
                </div>
              </div>

              {/* SECTION: EMERGENCY CONTACT */}
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                    <input type="text" name="emergencyName" value={form.emergencyName} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                    <input type="text" name="emergencyRelationship" value={form.emergencyRelationship} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile</label>
                    <input type="text" name="emergencyMobile" value={form.emergencyMobile} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* SECTION: ERP LOGIN */}
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">ERP Login</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Create Login</label>
                    <select name="createLogin" value={form.createLogin} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white">
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                  {form.createLogin === 'Yes' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                        <input type="text" name="username" value={form.username} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                        <select name="role" value={form.role} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white">
                          <option value="">Select</option>
                          <option>Admin</option>
                          <option>Manager</option>
                          <option>Staff</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                        <select name="loginStatus" value={form.loginStatus} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white">
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SECTION: DOCUMENTS & REMARKS */}
              <div className="border border-slate-200 rounded-lg p-5">
                 <div className="space-y-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Documents</label>
                       <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-300 rounded hover:bg-slate-50 hover:border-violet-400 hover:text-violet-600 transition-colors text-sm font-medium text-slate-500 cursor-pointer">
                          <UploadCloud size={18} /> Upload Documents (Aadhar, PAN, etc.)
                          <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,image/*" onChange={(e) => setForm(prev => ({ ...prev, documentFiles: [...(prev.documentFiles || []), ...Array.from(e.target.files)] }))} />
                       </label>
                       {(form.documentFiles?.length > 0) && (
                         <div className="mt-3 space-y-2">
                           {form.documentFiles.map((file, index) => (
                             <div key={index} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                               <span className="truncate max-w-[200px] text-slate-600 font-medium">{file.name}</span>
                               <button type="button" onClick={() => setForm(prev => ({ ...prev, documentFiles: prev.documentFiles.filter((_, i) => i !== index) }))} className="text-red-500 hover:text-red-700 p-1">
                                 <Trash2 size={14} />
                               </button>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks</label>
                      <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="2" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none resize-none" placeholder="Any additional notes..."></textarea>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeProfile;
