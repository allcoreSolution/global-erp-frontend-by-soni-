import React, { useState } from 'react';
import { ArrowLeft, Upload, Save, UserPlus, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddDriver = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    driverCode: 'DRV-0001',
    driverName: '',
    mobile: '',
    altMobile: '',
    email: '',
    dob: '',
    gender: 'Select',
    status: 'Active',
    licenceNo: '',
    licenceType: 'Commercial',
    licenceCategory: 'HMV',
    issueDate: '',
    expiryDate: '',
    company: 'Select',
    branch: 'Select',
    employeeId: '',
    joiningDate: '',
    driverType: 'Permanent',
    salaryType: 'Monthly',
    vehicleNo: 'Select',
    vehicleType: '',
    assignmentDate: '',
    isPrimary: false,
    emergencyName: '',
    emergencyRelation: '',
    emergencyMobile: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    upiId: '',
    paymentMode: 'Bank Transfer',
    experience: '',
    skills: '',
    remarks: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Driver details saved successfully!');
    navigate('/sales/driver-list');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Top Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/sales/driver-list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Driver List
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-indigo-900 uppercase tracking-wide">Create New Driver</h2>
          <p className="text-sm text-slate-500 font-medium">Add driver information</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          {/* SECTION: BASIC INFORMATION */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Code</label>
                <input type="text" name="driverCode" value={form.driverCode} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Name *</label>
                <input type="text" name="driverName" value={form.driverName} onChange={handleChange} required placeholder="Enter Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div className="flex flex-col items-start">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Photo</label>
                <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer">
                  <Image size={16} /> Upload
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile *</label>
                <input type="text" name="mobile" value={form.mobile} onChange={handleChange} required placeholder="e.g. 9876543210" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alternate Mobile</label>
                <input type="text" name="altMobile" value={form.altMobile} onChange={handleChange} placeholder="Secondary number" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email address" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">DOB</label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-white">
                  <option>Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION: DRIVING LICENCE */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Driving Licence</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Licence No. *</label>
                <input type="text" name="licenceNo" value={form.licenceNo} onChange={handleChange} required placeholder="Licence Number" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Licence Type *</label>
                <select name="licenceType" value={form.licenceType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-white">
                  <option>Commercial</option>
                  <option>Private</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Licence Category</label>
                <select name="licenceCategory" value={form.licenceCategory} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-white">
                  <option>HMV</option>
                  <option>LMV</option>
                  <option>MCWG</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date</label>
                <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date *</label>
                <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing State</label>
                <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-white">
                  <option>Select</option>
                  <option>Delhi</option>
                  <option>Maharashtra</option>
                  <option>Haryana</option>
                  <option>UP</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Licence Document</label>
              <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-slate-400 rounded bg-slate-50 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer">
                <Upload size={16} /> Upload Licence
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>

          {/* SECTION: EMPLOYMENT DETAILS & VEHICLE ASSIGNMENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* EMPLOYMENT DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                  <select name="company" value={form.company} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>Allcore Solutions</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <select name="branch" value={form.branch} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>Head Office</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                  <input type="text" name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="e.g. EMP-001" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Joining Date</label>
                  <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Type</label>
                  <select name="driverType" value={form.driverType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Permanent</option>
                    <option>Contract</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Type</label>
                  <select name="salaryType" value={form.salaryType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Monthly</option>
                    <option>Trip Based</option>
                  </select>
                </div>
              </div>
            </div>

            {/* VEHICLE ASSIGNMENT */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Vehicle Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle No.</label>
                  <select name="vehicleNo" value={form.vehicleNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>DL 1C Z 9934</option>
                    <option>HR 26 AJ 8931</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                  <input type="text" name="vehicleType" value={form.vehicleType} onChange={handleChange} placeholder="Auto (Based on Vehicle)" readOnly className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-slate-50 text-slate-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Date</label>
                  <input type="date" name="assignmentDate" value={form.assignmentDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 mt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="isPrimary" checked={form.isPrimary} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    Primary Driver
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION: EMERGENCY CONTACT & DOCUMENTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* EMERGENCY CONTACT */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Emergency Contact</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                  <input type="text" name="emergencyName" value={form.emergencyName} onChange={handleChange} placeholder="Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                    <input type="text" name="emergencyRelation" value={form.emergencyRelation} onChange={handleChange} placeholder="Relation" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile</label>
                    <input type="text" name="emergencyMobile" value={form.emergencyMobile} onChange={handleChange} placeholder="Mobile" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* DOCUMENTS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Documents</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-semibold text-slate-700">Driving Licence</span>
                  <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded cursor-pointer">
                    Upload
                    <input type="file" className="hidden" />
                  </label>
                </div>
                <div className="flex items-center justify-between p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-semibold text-slate-700">ID Proof</span>
                  <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded cursor-pointer">
                    Upload
                    <input type="file" className="hidden" />
                  </label>
                </div>
                <div className="flex items-center justify-between p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-semibold text-slate-700">Address Proof</span>
                  <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded cursor-pointer">
                    Upload
                    <input type="file" className="hidden" />
                  </label>
                </div>
                <div className="flex items-center justify-between p-2 border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-semibold text-slate-700">Medical Certificate</span>
                  <label className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded cursor-pointer">
                    Upload
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION: BANK & ADDITIONAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* BANK DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Bank / Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                  <input type="text" name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. HDFC Bank" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                  <input type="text" name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Account No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC</label>
                  <input type="text" name="ifsc" value={form.ifsc} onChange={handleChange} placeholder="IFSC Code" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID</label>
                  <input type="text" name="upiId" value={form.upiId} onChange={handleChange} placeholder="UPI ID" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Cheque</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ADDITIONAL INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Additional Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
                    <input type="text" name="experience" value={form.experience} onChange={handleChange} placeholder="e.g. 5 Years" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Special Skills</label>
                    <input type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. Night Driving" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                  <textarea name="remarks" value={form.remarks} onChange={handleChange} rows="4" placeholder="Any additional remarks..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

          </div>

          {/* FORM ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/sales/driver-list')} className="px-6 py-2.5 border border-slate-300 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Cancel
            </button>
            <button type="button" className="px-6 py-2.5 border border-indigo-200 bg-indigo-50 rounded text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm">
              Save Draft
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
              <Save size={16} /> Add Driver
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddDriver;
