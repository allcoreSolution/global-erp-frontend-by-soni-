import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, UploadCloud, UserPlus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import DynamicSelect from '../../components/DynamicSelect';
import Swal from 'sweetalert2';

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Form State
  const [form, setForm] = useState(() => {
    let defaultCompany = '';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        defaultCompany = u.company?.name || (typeof u.company === 'string' ? u.company : '');
      }
    } catch {
      defaultCompany = '';
    }
    if (!defaultCompany) {
      defaultCompany = localStorage.getItem('companyName') || localStorage.getItem('erp_company') || '';
    }

    return {
      // Personal Information
      employeeId: `EMP-${Date.now()}`,
      employeeName: '',
      dob: '',
      gender: '',
      maritalStatus: '',
      mobile: '',
      email: '',
      
      // Employment Details
      company: defaultCompany,
      branch: '',
      department: '',
      role: '',
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
      netSalary: 0,
      
      // Emergency Contact (optional)
      emergencyName: '',
      emergencyRelationship: '',
      emergencyMobile: '',

      // ERP Login
      createLogin: 'Yes',
      username: '',
      password: '',
      role: '',
      loginStatus: 'Active',
      
      // Profile Photo
      profilePhotoFile: null,

      // Remarks
      remarks: ''
    };
  });

  // Fetch company profile from API if company name is still empty
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const { data } = await api.get('/companies/profile');
        if (data && data.name) {
          setForm(prev => ({
            ...prev,
            company: prev.company || data.name
          }));
        }
      } catch (err) {
        // Fallback silently if not available
      }
    };
    if (!form.company) {
      fetchCompanyInfo();
    }
  }, []);

  // Fetch employee if id exists
  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        try {
          const { data } = await api.get(`/employees/${id}`);
          if (data.success) {
            setForm(prev => ({
              ...prev,
              ...data.data
            }));
          }
        } catch (error) {
          console.error("Error fetching employee data", error);
        }
      };
      fetchEmployee();
    }
  }, [id]);


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
    if (!form.employeeName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter Employee Name!',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    try {
      // Build FormData for multipart upload including local profile photo
      const formData = new FormData();
      
      const payload = {
        ...form,
        basicSalary: Number(form.basicSalary) || 0,
        hra: Number(form.hra) || 0,
        allowance: Number(form.allowance) || 0,
        grossSalary: Number(form.grossSalary) || 0,
        netSalary: Number(form.netSalary) || 0
      };

      // Exclude files from text loop
      delete payload.profilePhotoFile;
      delete payload.documentFiles;

      // Append all text/number fields to FormData
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // Append profile photo if selected
      if (form.profilePhotoFile) {
        formData.append('profilePhoto', form.profilePhotoFile);
      }

      if (id) {
        await api.put(`/employees/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Employee profile updated successfully!',
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        await api.post('/employees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Employee profile created successfully with photo!',
          timer: 1800,
          showConfirmButton: false
        });
      }
      navigate('/employees/list');
    } catch (error) {
      console.error('Error saving employee', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      Swal.fire({
        icon: 'error',
        title: 'Failed to Save',
        text: errorMessage,
        confirmButtonColor: '#e11d48'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/employees/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Employee List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/employees/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
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
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Personal, Employment, Address */}
            <div className="xl:col-span-2 space-y-6">
              
              {/* SECTION: PERSONAL INFORMATION */}
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Personal Information</h3>
                
                <div className="flex flex-col md:flex-row gap-6">
                   {/* Photo Upload Area */}
                   <div className="flex flex-col gap-2">
                     <label className="w-32 h-32 flex-shrink-0 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-violet-400 hover:text-violet-500 transition-colors cursor-pointer relative overflow-hidden group">
                        {form.profilePhotoFile ? (
                          <img 
                            src={URL.createObjectURL(form.profilePhotoFile)} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                        ) : form.profilePhoto ? (
                          <img 
                            src={form.profilePhoto.startsWith('http') ? form.profilePhoto : `http://localhost:5000${form.profilePhoto}`} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <>
                            <ImageIcon size={32} className="mb-2" />
                            <span className="text-xs font-medium px-2 text-center truncate w-full">
                              Upload Photo
                            </span>
                          </>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setForm(prev => ({...prev, profilePhotoFile: e.target.files[0]}));
                          }
                        }} />
                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-xs font-bold">
                           Click to Change
                        </div>
                     </label>
                     {(form.profilePhotoFile || form.profilePhoto) && (
                       <button type="button" onClick={() => setForm(prev => ({...prev, profilePhotoFile: null, profilePhoto: ''}))} className="w-32 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-semibold flex items-center justify-center gap-1">
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
                     <div className="grid grid-cols-2 gap-2">
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
                    <input 
                      type="text" 
                      name="company" 
                      value={form.company || 'Loading...'} 
                      readOnly 
                      title="Company is automatically assigned based on your active organization"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-slate-100 font-semibold text-slate-700 cursor-not-allowed outline-none select-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                    <DynamicSelect
                      category="Branch"
                      name="branch"
                      value={form.branch}
                      onChange={handleChange}
                      hideAddButton={true}
                      defaultOptions={[]}
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
                      hideAddButton={true}
                      defaultOptions={[]}
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                    <DynamicSelect
                      category="Role"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      hideAddButton={true}
                      defaultOptions={[]}
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
                      category="Employee"
                      label="Reporting Manager"
                      name="reportingManager"
                      value={form.reportingManager}
                      onChange={handleChange}
                      hideAddButton={true}
                      defaultOptions={[]}
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
                      hideAddButton={true}
                      defaultOptions={[]}
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Allow ERP Login Access?</label>
                    <select 
                      name="createLogin" 
                      value={form.createLogin} 
                      onChange={handleChange} 
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white font-medium"
                    >
                      <option value="Yes">Yes (Can Login to ERP)</option>
                      <option value="No">No (HR Record Only)</option>
                    </select>
                  </div>
                  {form.createLogin === 'Yes' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Login Password (Default: Mobile No. or Emp@123)</label>
                      <input 
                        type="text" 
                        name="password" 
                        value={form.password} 
                        onChange={handleChange} 
                        placeholder={form.mobile || 'Emp@123'} 
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white placeholder-slate-400 font-medium"
                      />
                    </div>
                  )}
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
              
              {/* SECTION: IDENTITY & BANK DETAILS */}
              <div className="border border-slate-200 rounded-lg p-5 bg-white">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Identity & Bank Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Number</label>
                    <input type="text" name="pan" value={form.pan} onChange={handleChange} placeholder="e.g. ABCDE1234F" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none uppercase" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                    <input type="text" name="bank" value={form.bank} onChange={handleChange} placeholder="e.g. HDFC Bank" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Account No.</label>
                    <input type="text" name="accountNo" value={form.accountNo} onChange={handleChange} placeholder="Account Number" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                    <input type="text" name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="e.g. HDFC0001234" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white uppercase" />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg flex items-center justify-between text-xs text-indigo-900">
                  <div>
                    <span className="font-bold text-indigo-800">💡 Salary & PF/ESI Management:</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      कर्मचारी की सैलरी और PF/ESI कटौतियाँ सीधे <strong>HRMS &gt; Payroll &gt; Salary Structure</strong> से मैनेज की जाती हैं।
                    </p>
                  </div>
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
