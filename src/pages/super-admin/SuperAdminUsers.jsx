import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  UserCheck,
  UserX,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Shield,
  ShieldCheck,
  Lock,
  Plus,
  X,
  CreditCard,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import api from '../../api';

// Curated avatar gradient generator based on name
const getAvatarGradient = (name = '') => {
  const gradients = [
    'from-purple-500 to-indigo-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
  ];
  const charCode = name.charCodeAt(0) || 0;
  return gradients[charCode % gradients.length];
};

const SuperAdminUsers = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal for Viewing Full Employee Details
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch all employees across all companies from real backend API: GET /api/employees
  const fetchEmployees = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/employees');
      let data = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res.data.data)) {
          data = res.data.data;
        }
      }
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees for Super Admin:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Helper to guarantee clean Company Name is always shown instead of raw MongoDB ObjectId
  const getCompanyName = (emp) => {
    let raw = (emp?.companyName || emp?.company || '').toString().trim();
    if (!raw || raw.toLowerCase() === 'unassigned') return 'Unassigned';
    if (/^[0-9a-fA-F]{24}$/.test(raw)) {
      return 'Company';
    }
    return raw;
  };

  // Unique companies list for filtering
  const availableCompanies = useMemo(() => {
    const set = new Set();
    employees.forEach(e => {
      const name = getCompanyName(e);
      if (name && name !== 'Unassigned' && name !== 'Company') set.add(name);
    });
    return Array.from(set).sort();
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const compName = getCompanyName(emp);

      // 1. Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = (emp.employeeName || '').toLowerCase().includes(q);
        const matchesEmail = (emp.email || '').toLowerCase().includes(q);
        const matchesMobile = (emp.mobile || '').toLowerCase().includes(q);
        const matchesId = (emp.employeeId || '').toLowerCase().includes(q);
        const matchesCompany = compName.toLowerCase().includes(q);
        const matchesDept = (emp.department || '').toLowerCase().includes(q);
        const matchesRole = (emp.role || '').toLowerCase().includes(q);

        if (!matchesName && !matchesEmail && !matchesMobile && !matchesId && !matchesCompany && !matchesDept && !matchesRole) {
          return false;
        }
      }

      // 2. Company Filter
      if (companyFilter !== 'All') {
        if (compName !== companyFilter) return false;
      }

      // 3. Status Filter
      if (statusFilter !== 'All') {
        if ((emp.status || 'Active').toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [employees, searchTerm, companyFilter, statusFilter]);

  // Statistics for KPI Cards
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => (e.status || 'Active') === 'Active').length;
    const totalCompanies = availableCompanies.length;
    const erpLogins = employees.filter(e => e.createLogin === 'Yes' || e.username).length;

    return { total, active, totalCompanies, erpLogins };
  }, [employees, availableCompanies]);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-[#070f24] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20 shadow-xs">
            <Users size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                All Employees
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                {employees.length} Total Records
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Super Admin Directory: Comprehensive view of employees, contact details, dates, and tenant companies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchEmployees}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#14234b] transition-all cursor-pointer shadow-xs"
            title="Refresh Data from API"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-purple-600' : ''} />
          </button>
        </div>
      </div>

      {/* ── 4 KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Employees */}
        <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Employees</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</h3>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Across All Tenants</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        {/* Active Staff */}
        <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Staff</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.active}</h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Currently Employed</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck size={22} />
          </div>
        </div>

        {/* Total Companies */}
        <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Registered Companies</p>
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.totalCompanies}</h3>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Companies with Staff</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Building2 size={22} />
          </div>
        </div>

        {/* ERP Login Users */}
        <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ERP Login Access</p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.erpLogins}</h3>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">System Portal Users</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lock size={22} />
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: SEARCH & FILTERS ── */}
      <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl p-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Employee Name, Email, Mobile, Company, ID, Dept, or Role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Company Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-xl px-2.5 py-1.5 text-xs">
              <Building2 size={14} className="text-purple-500" />
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 font-semibold cursor-pointer pr-1"
              >
                <option value="All">All Companies ({availableCompanies.length})</option>
                {availableCompanies.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b] rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>

            {(searchTerm || companyFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCompanyFilter('All');
                  setStatusFilter('All');
                }}
                className="px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                title="Reset Filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── EMPLOYEES TABLE ── */}
      <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#14234b] bg-slate-50/70 dark:bg-[#070f24] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4">ERP Login</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#14234b]/60 text-xs text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <RefreshCw size={28} className="mx-auto mb-2 animate-spin text-purple-600" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Loading employees data...</p>
                    <p className="text-xs text-slate-400 mt-0.5">Fetching from /api/employees</p>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <Users size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No employees found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchTerm || companyFilter !== 'All' ? 'Try adjusting your search query or filters.' : 'No employee records exist in the database.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const name = emp.employeeName || 'Unnamed Staff';
                  const initial = name.trim().charAt(0)?.toUpperCase() || 'E';
                  const compName = getCompanyName(emp);

                  return (
                    <tr
                      key={emp._id || emp.employeeId}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#14234b]/30 transition-colors group"
                    >
                      {/* 1: Employee Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(name)} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}>
                            {initial}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setSelectedEmployee(emp)}
                              className="font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-left block text-sm"
                            >
                              {name}
                            </button>
                            <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-medium">
                              {emp.employeeId || 'No ID'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2: Company */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold text-xs shadow-2xs">
                          <Building2 size={13} className="text-indigo-500 shrink-0" />
                          <span className="truncate max-w-[140px]">{compName}</span>
                        </span>
                      </td>

                      {/* 3: Contact Details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {emp.email ? (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                              <Mail size={12} className="text-purple-500 shrink-0" />
                              <span className="truncate max-w-[170px]">{emp.email}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No email provided</span>
                          )}
                          {emp.mobile ? (
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                              <Phone size={11} className="text-emerald-500 shrink-0" />
                              <span>{emp.mobile}</span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* 4: Dept & Role */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            {emp.role || 'Staff / Employee'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Briefcase size={11} className="text-slate-400" />
                            {emp.department || 'General'}
                          </p>
                        </div>
                      </td>

                      {/* 5: Joining Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>
                            {emp.joiningDate ? emp.joiningDate : emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* 6: ERP Login */}
                      <td className="py-3.5 px-4">
                        {emp.createLogin === 'Yes' || emp.username ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Lock size={10} className="text-emerald-600" />
                            {emp.username || 'Active'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            No Login
                          </span>
                        )}
                      </td>

                      {/* 7: Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          (emp.status || 'Active') === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (emp.status || 'Active') === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`} />
                          {emp.status || 'Active'}
                        </span>
                      </td>

                      {/* 8: Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-[#14234b] dark:hover:bg-[#1b2f66] text-purple-600 dark:text-purple-300 font-semibold text-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                          title="View Full Profile Details"
                        >
                          <Eye size={13} />
                          <span>View</span>
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

      {/* ════════ EMPLOYEE FULL DETAILS MODAL ════════ */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0b142c] border border-slate-200 dark:border-[#14234b] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#14234b]">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(selectedEmployee.employeeName)} text-white flex items-center justify-center font-bold text-lg shadow-xs`}>
                  {(selectedEmployee.employeeName || 'E').trim().charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedEmployee.employeeName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {selectedEmployee.employeeId}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <Building2 size={12} />
                      {getCompanyName(selectedEmployee)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-[#14234b] transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-4 text-xs">
              
              {/* SECTION 1: Personal & Employment */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b]">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Employment & Role Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Department</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedEmployee.department || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Designation / Role</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedEmployee.role || 'Staff'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Employment Type</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedEmployee.employeeType || 'Permanent'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Joining Date</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedEmployee.joiningDate || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Shift</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedEmployee.shift || 'General Shift'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Account Status</span>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {selectedEmployee.status || 'Active'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Contact & Personal Details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b]">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Contact & Personal Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                      <Mail size={13} className="text-purple-500" />
                      {selectedEmployee.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Mobile Phone</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                      <Phone size={13} className="text-emerald-500" />
                      {selectedEmployee.mobile || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gender / Marital Status</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedEmployee.gender || 'Not specified'} {selectedEmployee.maritalStatus ? `• ${selectedEmployee.maritalStatus}` : ''}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedEmployee.dob || 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedEmployee.currentAddress && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Address</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 flex items-start gap-1">
                      <MapPin size={12} className="text-rose-500 mt-0.5 shrink-0" />
                      {[
                        selectedEmployee.currentAddress,
                        selectedEmployee.currentCity,
                        selectedEmployee.currentState,
                        selectedEmployee.currentPincode
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 3: Identity & Bank */}
              {(selectedEmployee.pan || selectedEmployee.aadhaar || selectedEmployee.bank || selectedEmployee.accountNo) && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070f24] border border-slate-200 dark:border-[#14234b]">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Statutory & Bank Records
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedEmployee.pan && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">PAN Number</span>
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 uppercase">
                          {selectedEmployee.pan}
                        </p>
                      </div>
                    )}
                    {selectedEmployee.aadhaar && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Aadhaar No.</span>
                        <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {selectedEmployee.aadhaar}
                        </p>
                      </div>
                    )}
                    {selectedEmployee.bank && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Bank Name</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {selectedEmployee.bank}
                        </p>
                      </div>
                    )}
                    {selectedEmployee.accountNo && (
                      <div>
                        <span className="text-slate-400 block text-[10px]">Account No</span>
                        <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {selectedEmployee.accountNo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 4: ERP Portal Login Info */}
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <Lock size={13} className="text-purple-600" />
                    ERP Login Account
                  </h4>
                  <p className="text-[11px] text-purple-700/80 dark:text-purple-400 mt-0.5">
                    Username: <span className="font-mono font-bold">{selectedEmployee.username || selectedEmployee.email || 'None'}</span>
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  selectedEmployee.createLogin === 'Yes' || selectedEmployee.username
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {selectedEmployee.createLogin === 'Yes' || selectedEmployee.username ? 'Portal Enabled' : 'No Access'}
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#14234b] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-[#14234b] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminUsers;
