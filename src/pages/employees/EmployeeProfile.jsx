import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, CheckCircle, UploadCloud, UserPlus, Image as ImageIcon, Trash2,
  Plus, Shield, ShieldCheck, CheckSquare, Square, Search, X, ChevronDown, ChevronUp,
  Layers, Lock, Sparkles, RefreshCw, Check
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import DynamicSelect from '../../components/DynamicSelect';
import Swal from 'sweetalert2';
import { PERMISSION_GROUPS, ALL_CORE_MODULES } from '../setup/UserMaster';

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

  // Role Master & Permission Full-Page Screen States
  const [rolesList, setRolesList] = useState([]);
  const [isRolesLoading, setIsRolesLoading] = useState(false);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    roleCode: '',
    status: 'Active'
  });
  const [selectedRolePerms, setSelectedRolePerms] = useState({});
  const [permSearch, setPermSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Fetch Roles from Backend API
  const fetchRoles = async () => {
    setIsRolesLoading(true);
    try {
      const res = await api.get('/roles');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setRolesList(data);
      return data;
    } catch (err) {
      console.error("Error fetching roles:", err);
      return [];
    } finally {
      setIsRolesLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Auto-generate strictly unique next Role Code (e.g. ROL-001, ROL-002, ...)
  const generateRoleCode = (existingRoles) => {
    const list = existingRoles || rolesList || [];
    const usedCodes = new Set(
      list
        .map(r => (r.roleCode || '').toUpperCase().trim())
        .filter(Boolean)
    );

    let maxNum = 0;
    list.forEach(r => {
      const match = (r.roleCode || '').match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });

    let nextNum = Math.max(maxNum, list.length) + 1;
    let nextCode = `ROL-${String(nextNum).padStart(3, '0')}`;

    // Loop until we find a code that has never been used
    while (usedCodes.has(nextCode.toUpperCase())) {
      nextNum++;
      nextCode = `ROL-${String(nextNum).padStart(3, '0')}`;
    }

    return nextCode;
  };

  // Fetch next role code from backend or fallback to calculation (never reusing existing codes)
  const handleRefreshRoleCode = async () => {
    try {
      const currentList = await fetchRoles();
      const usedCodes = new Set(
        (currentList || rolesList).map(r => (r.roleCode || '').toUpperCase().trim()).filter(Boolean)
      );

      const res = await api.get('/roles/next-code');
      if (res.data?.nextCode) {
        let code = res.data.nextCode;
        if (!usedCodes.has(code.toUpperCase())) {
          setNewRoleForm(prev => ({ ...prev, roleCode: code }));
          return;
        }
      }
      setNewRoleForm(prev => ({ ...prev, roleCode: generateRoleCode(currentList || rolesList) }));
    } catch {
      setNewRoleForm(prev => ({ ...prev, roleCode: generateRoleCode(rolesList) }));
    }
  };

  // Open User Master / Role Management Screen (http://localhost:5173/setup/user-master)
  const handleOpenAddRolePage = () => {
    navigate('/setup/user-master', { state: { openAddRoleModal: true } });
  };

  // Permissions Matrix Handlers
  const handleTogglePerm = (permKey) => {
    setSelectedRolePerms(prev => ({
      ...prev,
      [permKey]: !prev[permKey]
    }));
  };

  const handleToggleResource = (resource) => {
    const keys = Object.values(resource.actions);
    const allChecked = keys.every(k => !!selectedRolePerms[k]);
    const newState = !allChecked;
    setSelectedRolePerms(prev => {
      const next = { ...prev };
      keys.forEach(k => { next[k] = newState; });
      return next;
    });
  };

  const handleToggleGroup = (group) => {
    const keys = [];
    group.resources.forEach(r => {
      Object.values(r.actions).forEach(k => keys.push(k));
    });
    const allChecked = keys.every(k => !!selectedRolePerms[k]);
    const newState = !allChecked;
    setSelectedRolePerms(prev => {
      const next = { ...prev };
      keys.forEach(k => { next[k] = newState; });
      return next;
    });
  };

  const handleToggleAllPerms = (targetState) => {
    const next = {};
    if (targetState) {
      PERMISSION_GROUPS.forEach(g => {
        g.resources.forEach(r => {
          Object.values(r.actions).forEach(k => { next[k] = true; });
        });
      });
    }
    setSelectedRolePerms(next);
  };

  const handlePresetViewOnly = () => {
    const next = {};
    PERMISSION_GROUPS.forEach(g => {
      g.resources.forEach(r => {
        if (r.actions.view) next[r.actions.view] = true;
      });
    });
    setSelectedRolePerms(next);
  };

  const toggleCollapseGroup = (groupId) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Filter groups in search
  const filteredPermGroups = useMemo(() => {
    if (!permSearch.trim()) return PERMISSION_GROUPS;
    const query = permSearch.toLowerCase();
    return PERMISSION_GROUPS.map(group => {
      const groupMatches = group.name.toLowerCase().includes(query) || group.description.toLowerCase().includes(query);
      const filteredResources = group.resources.filter(r =>
        groupMatches ||
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        Object.values(r.actions).some(k => k.toLowerCase().includes(query))
      );
      if (filteredResources.length > 0) {
        return {
          ...group,
          resources: filteredResources
        };
      }
      return null;
    }).filter(Boolean);
  }, [permSearch]);

  const totalSelectedPermsCount = useMemo(() => {
    return Object.values(selectedRolePerms).filter(Boolean).length;
  }, [selectedRolePerms]);

  // Save Role API
  const handleSaveRole = async () => {
    if (!newRoleForm.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Role Name Required',
        text: 'कृपया Role का नाम दर्ज करें!',
        confirmButtonColor: '#4f46e5'
      });
      setRoleModalStep(1);
      return;
    }

    const trimmedCode = (newRoleForm.roleCode || '').trim();
    if (!trimmedCode) {
      const generated = generateRoleCode(rolesList);
      newRoleForm.roleCode = generated;
    } else {
      const isDuplicate = rolesList.some(
        r => (r.roleCode || '').toUpperCase().trim() === trimmedCode.toUpperCase()
      );
      if (isDuplicate) {
        Swal.fire({
          icon: 'warning',
          title: 'Duplicate Role Code',
          text: `Role Code "${trimmedCode}" already exists. Please generate or enter a unique code.`,
          confirmButtonColor: '#4f46e5'
        });
        return;
      }
    }

    setIsSavingRole(true);
    try {
      const permsSet = new Set();
      Object.entries(selectedRolePerms).forEach(([key, isChecked]) => {
        if (isChecked) permsSet.add(key);
      });

      ALL_CORE_MODULES.forEach(mod => {
        const modLower = mod.toLowerCase();
        const group = PERMISSION_GROUPS.find(g => g.module === mod);
        if (group) {
          const hasView = group.resources.some(r => !!selectedRolePerms[r.actions.view]);
          const hasCreate = group.resources.some(r => !!selectedRolePerms[r.actions.create]);
          const hasEdit = group.resources.some(r => !!selectedRolePerms[r.actions.edit]);
          const hasDelete = group.resources.some(r => !!selectedRolePerms[r.actions.delete]);

          if (hasView) permsSet.add(`view_${modLower}`);
          if (hasCreate) permsSet.add(`create_${modLower}`);
          if (hasEdit) permsSet.add(`edit_${modLower}`);
          if (hasDelete) permsSet.add(`delete_${modLower}`);
        }
      });

      const formattedModulePermissions = ALL_CORE_MODULES.map(modName => {
        const group = PERMISSION_GROUPS.find(g => g.module === modName);
        if (!group) {
          return { module: modName, view: false, create: false, edit: false, delete: false };
        }
        return {
          module: modName,
          view: group.resources.some(r => !!selectedRolePerms[r.actions.view]),
          create: group.resources.some(r => !!selectedRolePerms[r.actions.create]),
          edit: group.resources.some(r => !!selectedRolePerms[r.actions.edit]),
          delete: group.resources.some(r => !!selectedRolePerms[r.actions.delete])
        };
      });

      const payload = {
        name: newRoleForm.name.trim(),
        roleCode: (newRoleForm.roleCode || '').trim(),
        status: newRoleForm.status || 'Active',
        permissions: Array.from(permsSet),
        modulePermissions: formattedModulePermissions
      };

      const res = await api.post('/roles', payload);
      const createdRole = res.data;

      // Refresh list
      await fetchRoles();

      // Auto-assign new role to current employee form
      const assignedRoleName = createdRole.name || newRoleForm.name.trim();
      setForm(prev => ({
        ...prev,
        role: assignedRoleName
      }));

      setIsAddingRole(false);

      Swal.fire({
        icon: 'success',
        title: 'Role Created & Assigned!',
        text: `Role "${assignedRoleName}" successfully created and assigned to this employee!`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Failed to create role:", err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Create Role',
        text: err.response?.data?.message || err.message || 'Error occurred while saving role',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setIsSavingRole(false);
    }
  };


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

  // FULL-PAGE SCREEN VIEW FOR ADDING A ROLE & CONFIGURING PERMISSIONS
  if (isAddingRole) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 font-sans text-slate-800 space-y-6">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddingRole(false)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors"
              title="Back to Employee Form"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="text-indigo-600" size={24} /> Create New Role & Permissions Matrix
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {newRoleForm.roleCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Role का नाम दर्ज करें, अनुमतियाँ (Permissions) सेट करें और Save करके सीधे कर्मचारी फॉर्म पर लौटें।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsAddingRole(false)}
              className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 transition shadow-xs"
            >
              Cancel & Return
            </button>
            <button
              type="button"
              disabled={isSavingRole}
              onClick={handleSaveRole}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
            >
              {isSavingRole ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Saving Role...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Save Role & Assign to Employee
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 1: ROLE BASIC DETAILS */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                1. Role Information Master
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ✓ Auto Code Generated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Role Code *</span>
                <span className="text-[10px] text-slate-400 font-normal">Auto-Sequence</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newRoleForm.roleCode}
                  onChange={(e) => setNewRoleForm(prev => ({ ...prev, roleCode: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleRefreshRoleCode}
                  className="absolute right-2 top-2 text-slate-400 hover:text-indigo-600 p-1"
                  title="Regenerate Code"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Role Name *
              </label>
              <input
                type="text"
                value={newRoleForm.name}
                onChange={(e) => setNewRoleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Senior Accountant, Sales Manager, Store Keeper..."
                autoFocus
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={newRoleForm.status}
                onChange={(e) => setNewRoleForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white font-medium focus:border-indigo-500 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: GRANULAR PERMISSIONS MATRIX */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                  2. System Permissions & Access Matrix
                </h2>
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {totalSelectedPermsCount} Permissions Selected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                मॉड्यूल अनुसार View, Create, Edit, Delete चेकबॉक्स से अनुमतियाँ चुनें।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  placeholder="Search module or permission..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleToggleAllPerms(true)}
                className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handlePresetViewOnly}
                className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
              >
                View Only
              </button>
              <button
                type="button"
                onClick={() => handleToggleAllPerms(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="space-y-4">
            {filteredPermGroups.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Search size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold">No permissions match "{permSearch}"</p>
              </div>
            ) : (
              filteredPermGroups.map((group) => {
                const isCollapsed = !!collapsedGroups[group.groupId];
                const groupKeys = [];
                group.resources.forEach(r => {
                  Object.values(r.actions).forEach(k => groupKeys.push(k));
                });
                const groupSelectedCount = groupKeys.filter(k => !!selectedRolePerms[k]).length;
                const isGroupAllSelected = groupKeys.length > 0 && groupSelectedCount === groupKeys.length;

                return (
                  <div key={group.groupId} className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
                    {/* Header */}
                    <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                      <div
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                        onClick={() => toggleCollapseGroup(group.groupId)}
                      >
                        <span className={`w-3 h-3 rounded-full ${
                          group.color === 'emerald' ? 'bg-emerald-500' :
                          group.color === 'blue' ? 'bg-blue-500' :
                          group.color === 'amber' ? 'bg-amber-500' :
                          group.color === 'violet' ? 'bg-violet-500' :
                          group.color === 'teal' ? 'bg-teal-500' :
                          group.color === 'purple' ? 'bg-purple-500' :
                          group.color === 'orange' ? 'bg-orange-500' : 'bg-indigo-500'
                        }`} />
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                          {group.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-medium">
                          ({groupSelectedCount}/{groupKeys.length} selected)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleGroup(group)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded border transition ${
                            isGroupAllSelected
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {isGroupAllSelected ? 'Deselect Module' : 'Select Module'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCollapseGroup(group.groupId)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Table */}
                    {!isCollapsed && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/60 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-4 w-2/5">Feature / Resource</th>
                              <th className="py-2.5 px-2 text-center w-14">View</th>
                              <th className="py-2.5 px-2 text-center w-14">Create</th>
                              <th className="py-2.5 px-2 text-center w-14">Edit</th>
                              <th className="py-2.5 px-2 text-center w-14">Delete</th>
                              <th className="py-2.5 px-3 text-right">Quick</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.resources.map((resource) => {
                              const resKeys = Object.values(resource.actions);
                              const isRowAll = resKeys.every(k => !!selectedRolePerms[k]);

                              return (
                                <tr key={resource.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="py-2.5 px-4">
                                    <div className="font-semibold text-slate-800">{resource.name}</div>
                                    <div className="text-[11px] text-slate-400">{resource.description}</div>
                                  </td>

                                  <td className="py-2.5 px-2 text-center">
                                    {resource.actions.view ? (
                                      <input
                                        type="checkbox"
                                        checked={!!selectedRolePerms[resource.actions.view]}
                                        onChange={() => handleTogglePerm(resource.actions.view)}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer focus:ring-indigo-500"
                                      />
                                    ) : <span className="text-slate-300">—</span>}
                                  </td>

                                  <td className="py-2.5 px-2 text-center">
                                    {resource.actions.create ? (
                                      <input
                                        type="checkbox"
                                        checked={!!selectedRolePerms[resource.actions.create]}
                                        onChange={() => handleTogglePerm(resource.actions.create)}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer focus:ring-indigo-500"
                                      />
                                    ) : <span className="text-slate-300">—</span>}
                                  </td>

                                  <td className="py-2.5 px-2 text-center">
                                    {resource.actions.edit ? (
                                      <input
                                        type="checkbox"
                                        checked={!!selectedRolePerms[resource.actions.edit]}
                                        onChange={() => handleTogglePerm(resource.actions.edit)}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer focus:ring-indigo-500"
                                      />
                                    ) : <span className="text-slate-300">—</span>}
                                  </td>

                                  <td className="py-2.5 px-2 text-center">
                                    {resource.actions.delete ? (
                                      <input
                                        type="checkbox"
                                        checked={!!selectedRolePerms[resource.actions.delete]}
                                        onChange={() => handleTogglePerm(resource.actions.delete)}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer focus:ring-indigo-500"
                                      />
                                    ) : <span className="text-slate-300">—</span>}
                                  </td>

                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleResource(resource)}
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded transition ${
                                        isRowAll
                                          ? 'text-indigo-600 bg-indigo-50 border border-indigo-200'
                                          : 'text-slate-500 hover:text-slate-800'
                                      }`}
                                    >
                                      {isRowAll ? 'All ✓' : 'Select'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setIsAddingRole(false)}
            className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-700 transition"
          >
            ← Back to Employee Form
          </button>

          <button
            type="button"
            disabled={isSavingRole}
            onClick={handleSaveRole}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2"
          >
            {isSavingRole ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Saving Role...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Save Role & Assign to Employee
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

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
                    <div className="flex items-center gap-2">
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-violet-500 outline-none bg-white font-medium"
                      >
                        <option value="">Select Role ({rolesList.length})</option>
                        {form.role && !rolesList.some(r => r.name === form.role) && (
                          <option value={form.role}>{form.role}</option>
                        )}
                        {rolesList.map((r, idx) => (
                          <option key={r._id || idx} value={r.name}>
                            {r.name} {r.roleCode ? `(${r.roleCode})` : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleOpenAddRolePage}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shadow-sm"
                        title="Create New Role & Assign Permissions"
                      >
                        <Plus size={15} /> Add Role
                      </button>
                    </div>
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
