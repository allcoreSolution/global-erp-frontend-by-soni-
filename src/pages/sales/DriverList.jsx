import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, FileText, User, Phone, MapPin, 
  Trash2, Edit, ChevronLeft, ChevronRight, AlertCircle, X, CheckCircle 
} from 'lucide-react';
import api from '../../api';
import DynamicSelect from '../../components/DynamicSelect';

const DriverList = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const initialFormState = {
    driverName: '', driverCode: '', mobile: '', email: '', dob: '', gender: 'Select', bloodGroup: '', profilePhoto: '',
    address: '', city: '', district: '', state: '', pincode: '',
    licenceNo: '', licenceType: 'Commercial', issueDate: '', expiryDate: '', issuingAuthority: '', licenseDocument: '',
    joiningDate: '', driverType: 'Permanent', department: '', branch: 'Select', salaryWage: '', paymentMode: 'Bank Transfer',
    vehicleNo: '', vehicleType: '', assignmentDate: '', isPrimary: false,
    emergencyName: '', emergencyRelation: '', emergencyMobile: '', emergencyAddress: '', status: 'Active'
  };
  const [form, setForm] = useState(initialFormState);

  const [editingId, setEditingId] = useState(null);

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      const data = res.data?.data || res.data || [];
      const mappedData = data.map((item) => ({
        id: item._id,
        name: item.driverName || '-',
        phone: item.mobile || '-',
        email: item.email || '-',
        licenseNo: item.licenceNo || '-',
        vehicleNo: item.vehicleNo || '-',
        status: item.status || 'Active'
      }));
      setDrivers(mappedData);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.driverName || !form.mobile) {
      alert("Driver Name and Mobile Number are required.");
      return;
    }
    
    try {
      const payload = {
        ...form,
        driverCode: form.driverCode || `DRV-${Date.now()}` // auto generate if empty
      };

      if (editingId) {
        await api.put(`/drivers/${editingId}`, payload);
        alert('Driver updated successfully');
      } else {
        await api.post('/drivers', payload);
        alert('Driver added successfully');
      }
      
      fetchDrivers();
      setIsAddModalOpen(false);
      setEditingId(null);
      setForm(initialFormState);
    } catch (err) {
      console.error(err);
      alert('Failed to save driver: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = async (driver) => {
    try {
      const res = await api.get(`/drivers/${driver.id}`);
      const full = res.data?.data || res.data;
      setForm({
        ...initialFormState,
        ...full
      });
      setEditingId(driver.id);
      setIsAddModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch driver details');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await api.delete(`/drivers/${id}`);
        setDrivers(drivers.filter(d => d.id !== id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete driver');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/drivers/${id}`, { status: newStatus });
      setDrivers(drivers.map(d => d.id === id ? { ...d, status: newStatus } : d));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const handleExportCSV = () => {
    alert("Exporting Drivers List as CSV Successfully!");
  };

  const handleDownloadPDF = () => {
    alert("Downloading Drivers List PDF document...");
  };

  // Search filter
  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm) ||
    d.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredDrivers.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredDrivers.length / recordsPerPage) || 1;

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Driver Registry</h1>
          <p className="text-sm text-gray-600">Overview of logistics drivers, delivery vehicles, and transport status.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors bg-white"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            <FileText size={14} /> Download PDF
          </button>
          <button 
            onClick={() => {
              setEditingId(null);
              setForm(initialFormState);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Add Driver
          </button>
        </div>
      </div>

      {/* Filter and Limit Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Records per page:</span>
          <select 
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-blue-450 font-semibold"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Name/Phone/Vehicle..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Drivers Table Grid */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Driver Name</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Phone</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Email Address</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">License No</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Vehicle No</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Status</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span>{driver.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{driver.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{driver.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{driver.licenseNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-800">{driver.vehicleNo}</td>
                  
                  {/* Status Toggle Toggle Option */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleToggleStatus(driver.id, driver.status)}
                      className={`inline-flex px-2.5 py-0.5 rounded text-xs font-extrabold transition-colors border ${
                        driver.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {driver.status}
                    </button>
                  </td>

                  {/* Actions VIEW, EDIT, DELETE */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(driver)}
                        className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit profile"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Remove driver"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500 bg-white font-medium">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No drivers found matching criteria.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-xs font-semibold text-gray-600">
          Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredDrivers.length)} of {filteredDrivers.length} drivers
        </div>

        <div className="inline-flex items-center border border-blue-500 rounded divide-x divide-blue-500 shadow-sm bg-white">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 text-gray-600 transition-colors ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3.5 py-1.5 text-xs font-bold transition-colors ${
                currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 text-gray-600 transition-colors ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* --- ADD DRIVER DIALOG MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Register New Driver
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-6 h-[75vh] overflow-y-auto px-1 pb-4 custom-scrollbar">
              
              {/* --- ADD NEW DRIVER (Basic Info) --- */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 border-b border-indigo-100 pb-1">Basic Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Driver Name *</label>
                    <input type="text" required placeholder="e.g. Ramesh Kumar"
                      value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Driver Code</label>
                    <input type="text" placeholder="Auto-generated if empty"
                      value={form.driverCode} onChange={(e) => setForm({ ...form, driverCode: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Mobile Number *</label>
                    <input type="text" required placeholder="e.g. +91 98765..."
                      value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Email Address</label>
                    <input type="email" placeholder="e.g. email@..."
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">DOB</label>
                    <input type="date"
                      value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Gender</label>
                    <DynamicSelect
                      category="Gender"
                      name="gender"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      defaultOptions={["Select", "Male", "Female", "Other"]}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Blood Group</label>
                    <input type="text" placeholder="e.g. O+"
                      value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Profile Photo</label>
                    <input type="file"
                      className="w-full border border-blue-500 rounded px-3 py-1.5 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                </div>
              </div>

              {/* --- ADDRESS DETAILS --- */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 border-b border-indigo-100 pb-1">Address Details</h4>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Address</label>
                    <input type="text" placeholder="e.g. 123 Main St..."
                      value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">City</label>
                    <input type="text"
                      value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">District</label>
                    <input type="text"
                      value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">State</label>
                    <input type="text"
                      value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">PIN Code</label>
                    <input type="text"
                      value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                </div>
              </div>

              {/* --- DRIVING LICENSE DETAILS --- */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 border-b border-indigo-100 pb-1">Driving License Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">License Number *</label>
                    <input type="text" required placeholder="e.g. DL-IND1293..."
                      value={form.licenceNo} onChange={(e) => setForm({ ...form, licenceNo: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">License Type</label>
                    <input type="text" placeholder="e.g. Commercial"
                      value={form.licenceType} onChange={(e) => setForm({ ...form, licenceType: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Issue Date</label>
                    <input type="date"
                      value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Expiry Date *</label>
                    <input type="date" required
                      value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Issuing Authority</label>
                    <input type="text"
                      value={form.issuingAuthority} onChange={(e) => setForm({ ...form, issuingAuthority: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">License Document</label>
                    <input type="file"
                      className="w-full border border-blue-500 rounded px-3 py-1.5 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                </div>
              </div>

              {/* --- EMPLOYMENT DETAILS --- */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 border-b border-indigo-100 pb-1">Employment Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Joining Date</label>
                    <input type="date"
                      value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Driver Type</label>
                    <DynamicSelect
                      category="DriverType"
                      name="driverType"
                      value={form.driverType}
                      onChange={(e) => setForm({ ...form, driverType: e.target.value })}
                      defaultOptions={["Permanent", "Contract"]}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Department</label>
                    <input type="text"
                      value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Branch</label>
                    <input type="text"
                      value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Salary/Wage</label>
                    <input type="number" placeholder="0.00"
                      value={form.salaryWage} onChange={(e) => setForm({ ...form, salaryWage: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Payment Type</label>
                    <DynamicSelect
                      category="PaymentMode"
                      name="paymentMode"
                      value={form.paymentMode}
                      onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                      defaultOptions={["Bank Transfer", "Cash", "Cheque"]}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                </div>
              </div>

              {/* --- VEHICLE ASSIGNMENT --- */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 border-b border-indigo-100 pb-1">Vehicle Assignment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Vehicle Number</label>
                    <input type="text" placeholder="e.g. DL 3C AM 1204"
                      value={form.vehicleNo} onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Vehicle Type</label>
                    <input type="text"
                      value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Assignment Date</label>
                    <input type="date"
                      value={form.assignmentDate} onChange={(e) => setForm({ ...form, assignmentDate: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                      <input type="checkbox"
                        checked={form.isPrimary} onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      Primary Driver
                    </label>
                  </div>
                </div>
              </div>

              {/* --- EMERGENCY CONTACT --- */}
              <div>
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 border-b border-indigo-100 pb-1">Emergency Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Contact Name</label>
                    <input type="text"
                      value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Relationship</label>
                    <input type="text"
                      value={form.emergencyRelation} onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Mobile Number</label>
                    <input type="text"
                      value={form.emergencyMobile} onChange={(e) => setForm({ ...form, emergencyMobile: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Address</label>
                    <input type="text"
                      value={form.emergencyAddress} onChange={(e) => setForm({ ...form, emergencyAddress: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                    />
                  </div>
                </div>
              </div>

              {/* --- FOOTER --- */}
              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-blue-500 sticky bottom-0 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2 border border-blue-500 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-sm font-semibold shadow transition-colors"
                >
                  Save Driver
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DriverList;
