import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, MapPin, CreditCard, Phone, Mail, Edit } from 'lucide-react';
import api from '../../api';

const EmployeeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data } = await api.get(`/employees/${id}`);
        if (data.success) {
          setEmployee(data.data);
        }
      } catch (error) {
        console.error("Error fetching employee details", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
        <p className="text-xl font-semibold">Employee not found.</p>
        <button onClick={() => navigate('/employees/list')} className="mt-4 text-indigo-600 hover:underline">
          Go back to Employee List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/employees/list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Employee List
        </button>
        <button 
          onClick={() => navigate(`/employees/profile/${id}`)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all"
        >
          <Edit size={16} /> Edit Employee
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-24 h-24 rounded-full border-2 border-slate-200 bg-indigo-50 flex items-center justify-center text-2xl font-bold text-indigo-700 overflow-hidden">
                {employee.profilePhoto ? (
                   <img src={`http://localhost:5000/${employee.profilePhoto}`} alt={employee.employeeName} className="w-full h-full object-cover" />
                ) : (
                   employee.employeeName?.charAt(0)?.toUpperCase() || 'E'
                )}
              </div>
              <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
                <h1 className="text-xl font-bold text-slate-800">{employee.employeeName}</h1>
                <p className="text-indigo-600 font-medium text-sm mt-1">{employee.designation || 'No Designation'} • {employee.department || 'No Department'}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs text-slate-500 font-medium">
                   <div className="flex items-center gap-1.5"><Briefcase size={14} className="text-slate-400"/> EMP ID: {employee.employeeId}</div>
                   <div className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400"/> {employee.email || 'N/A'}</div>
                   <div className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400"/> {employee.mobile || 'N/A'}</div>
                </div>
              </div>
              <div className="mt-2 md:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  employee.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {employee.status || 'Active'}
                </span>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Employment Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                 <Briefcase size={20} className="text-indigo-500" /> Employment Details
               </h3>
               <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Company</span>
                    <span className="font-medium text-slate-800">{employee.company || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Branch</span>
                    <span className="font-medium text-slate-800">{employee.branch || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Employee Type</span>
                    <span className="font-medium text-slate-800">{employee.employeeType || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Joining Date</span>
                    <span className="font-medium text-slate-800">{employee.joiningDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Reporting Manager</span>
                    <span className="font-medium text-slate-800">{employee.reportingManager || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Shift</span>
                    <span className="font-medium text-slate-800">{employee.shift || 'N/A'}</span>
                  </div>
               </div>
            </div>

            {/* Address Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                 <MapPin size={20} className="text-indigo-500" /> Address Information
               </h3>
               <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Current Address</span>
                    <span className="font-medium text-slate-800">
                      {employee.currentAddress ? `${employee.currentAddress}, ${employee.currentCity}, ${employee.currentState} - ${employee.currentPincode}` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Permanent Address</span>
                    <span className="font-medium text-slate-800">{employee.permanentAddress || 'N/A'}</span>
                  </div>
               </div>
            </div>

            {/* Salary Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                 <CreditCard size={20} className="text-emerald-500" /> Salary Details
               </h3>
               <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Basic Salary</span>
                    <span className="font-medium text-slate-800">₹{employee.basicSalary?.toLocaleString() || '0'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">HRA</span>
                    <span className="font-medium text-slate-800">₹{employee.hra?.toLocaleString() || '0'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Allowance</span>
                    <span className="font-medium text-slate-800">₹{employee.allowance?.toLocaleString() || '0'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Salary Type</span>
                    <span className="font-medium text-slate-800">{employee.salaryType || 'N/A'}</span>
                  </div>
               </div>
               <div className="mt-4 flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <div>
                    <span className="block text-emerald-700 text-xs font-bold uppercase mb-1">Gross Salary</span>
                    <span className="text-xl font-bold text-emerald-900">₹{employee.grossSalary?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-emerald-700 text-xs font-bold uppercase mb-1">Net Salary</span>
                    <span className="text-2xl font-black text-emerald-700">₹{employee.netSalary?.toLocaleString() || '0'}</span>
                  </div>
               </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Personal Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                 <User size={20} className="text-indigo-500" /> Personal Details
               </h3>
               <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-semibold">DOB</span>
                    <span className="font-medium text-slate-800">{employee.dob || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-semibold">Gender</span>
                    <span className="font-medium text-slate-800">{employee.gender || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-semibold">Marital Status</span>
                    <span className="font-medium text-slate-800">{employee.maritalStatus || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-500 font-semibold">Emergency Contact</span>
                    <div className="text-right">
                      <span className="block font-medium text-slate-800">{employee.emergencyName || 'N/A'}</span>
                      <span className="text-xs text-slate-500">{employee.emergencyMobile || ''} {employee.emergencyRelationship ? `(${employee.emergencyRelationship})` : ''}</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* Identity & Compliance */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Identity & Compliance</h3>
               <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">PAN Number</span>
                    <span className="font-medium text-slate-800">{employee.pan || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">UAN</span>
                    <span className="font-medium text-slate-800">{employee.uan || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">PF No.</span>
                    <span className="font-medium text-slate-800">{employee.pfNo || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">ESIC No.</span>
                    <span className="font-medium text-slate-800">{employee.esicNo || 'N/A'}</span>
                  </div>
               </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Bank Information</h3>
               <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Bank Name</span>
                    <span className="font-medium text-slate-800">{employee.bank || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">Account Number</span>
                    <span className="font-medium text-slate-800">{employee.accountNo || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs font-semibold uppercase mb-1">IFSC Code</span>
                    <span className="font-medium text-slate-800">{employee.ifsc || 'N/A'}</span>
                  </div>
               </div>
            </div>

            {/* ERP Login */}
            {employee.createLogin === 'Yes' && (
              <div className="bg-slate-800 text-white rounded-xl shadow-sm p-6">
                 <h3 className="text-lg font-bold mb-4 border-b border-slate-700 pb-3">ERP Access</h3>
                 <div className="space-y-4 text-sm">
                    <div>
                      <span className="block text-slate-400 text-xs font-semibold uppercase mb-1">Username</span>
                      <span className="font-medium">{employee.username || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-xs font-semibold uppercase mb-1">Role</span>
                      <span className="font-medium">{employee.role || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-xs font-semibold uppercase mb-1">Access Status</span>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${employee.loginStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {employee.loginStatus || 'Active'}
                      </span>
                    </div>
                 </div>
              </div>
            )}

          </div>
        </div>
        
        {employee.remarks && (
           <div className="bg-amber-50 rounded-xl border border-amber-200 p-6 mt-6">
             <h3 className="text-sm font-bold text-amber-800 uppercase mb-2">Remarks / Notes</h3>
             <p className="text-amber-900 text-sm whitespace-pre-line">{employee.remarks}</p>
           </div>
        )}

      </div>
    </div>
  );
};

export default EmployeeView;
