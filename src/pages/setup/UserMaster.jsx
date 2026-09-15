import React, { useState } from 'react';
import { Users, Search, Edit2, Trash2, CheckCircle2, XCircle, Download, Upload, Printer, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserMaster = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [log, setLog] = useState([]);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    roleId: '',
    branch: 'Mumbai HO',
    status: 'Active'
  });

  React.useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    try {
      // Import the api instance from src/api.js (adjust path as needed, assuming we have it available or we will import it at the top)
      const [usersRes, rolesRes] = await Promise.all([
        window.api.get('/users'),
        window.api.get('/roles')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      if (rolesRes.data.length > 0) {
        setNewUser(prev => ({ ...prev, roleId: rolesRes.data[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addLog = (msg) => {
    setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleToggleStatus = async (id) => {
    try {
      await window.api.put(`/users/${id}/toggle-status`);
      fetchUsersAndRoles();
      addLog(`Toggled status for user ${id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Error toggling user status');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add User Form Submit
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert("Please fill in Username, Email, and Password fields!");
      return;
    }
    
    try {
      await window.api.post('/users', {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        roleId: newUser.roleId,
        branch: newUser.branch
      });
      addLog(`Success: Created new user ${newUser.username}`);
      setShowAddModal(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        roleId: roles[0]?._id || '',
        branch: 'Mumbai HO',
        status: 'Active'
      });
      fetchUsersAndRoles();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    addLog("Exporting user records to CSV...");
    const headers = ['User ID', 'Full Name', 'Email Address', 'Role Assigned', 'Branch Location', 'Status'];
    const rows = users.map(u => [u.id, u.name, u.email, u.role, u.branch, u.status]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ERP_Users_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("Success: Users directory CSV downloaded.");
  };

  // CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    addLog(`Reading file "${file.name}"...`);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const newUsers = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length >= 5) {
            newUsers.push({
              id: cols[0] || `USR-NEW-${Date.now()}-${i}`,
              name: cols[1] || 'New User',
              email: cols[2] || 'user@allcore.com',
              role: cols[3] || 'Operator',
              branch: cols[4] || 'Mumbai HO',
              status: cols[5] || 'Active'
            });
          }
        }
        if (newUsers.length > 0) {
          setUsers(prev => [...prev, ...newUsers]);
          addLog(`Success: Parsed ${newUsers.length} new users!`);
          alert(`Successfully imported ${newUsers.length} users!`);
        } else {
          addLog("Warning: No valid rows parsed from CSV file.");
          alert("Import failed. Headers should match: User ID, Full Name, Email Address, Role Assigned, Branch Location, Status");
        }
      } catch (err) {
        addLog("Error: Failed to parse CSV correctly.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePrint = () => {
    addLog("Spooling print system dialog (Print/Save PDF)...");
    window.print();
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-indigo-600" size={22} /> User Master Directory
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500">
            Create, search, configure status, and manage security credentials for all administrative users.
          </p>
        </div>
        
        {/* Actions header group */}
        <div className="flex items-center flex-wrap gap-2 no-print">
          <label className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded cursor-pointer transition">
            <Upload size={14} /> Import CSV
            <input type="file" className="hidden" accept=".csv" onChange={handleImportCSV} />
          </label>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border rounded transition"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition"
          >
            <Printer size={14} /> Print / Save PDF
          </button>
          <button 
            onClick={() => navigate('/setup/user-master/add')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-750 rounded shadow-sm transition"
          >
            + Create New User
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md no-print">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Search by name, email, or role..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-9 pr-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Users Directory Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="bg-slate-50/50 p-4 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-semibold">Active ERP Users Database</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/50 border-b border-gray-200 text-gray-500 font-semibold">
              <tr>
                <th className="p-3">User ID</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Role Assigned</th>
                <th className="p-3">Branch Location</th>
                <th className="p-3">Login Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/30">
                  <td className="p-3 font-semibold text-gray-800">{user._id.substring(user._id.length - 6).toUpperCase()}</td>
                  <td className="p-3 text-slate-800 font-medium">{user.username}</td>
                  <td className="p-3 text-gray-500">{user.email}</td>
                  <td className="p-3 text-gray-700">{user.role?.name || 'No Role'}</td>
                  <td className="p-3 text-gray-600">{user.branch || 'HO'}</td>
                  <td className="p-3">
                    <button 
                      onClick={() => handleToggleStatus(user._id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        user.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}
                    >
                      {user.isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {user.isActive ? 'Active' : 'Blocked'}
                    </button>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    <button className="p-1 hover:bg-slate-100 rounded text-indigo-600 transition" title="Edit Profile">
                      <Edit2 size={13} />
                    </button>
                    <button className="p-1 hover:bg-slate-100 rounded text-rose-600 transition" title="Delete User">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-50/50 shadow-inner border border-slate-200/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Create New ERP User Credentials</span>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-4 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Username (Login ID)</label>
                  <input 
                    type="text" 
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. rahul_s"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Temporary Password</label>
                  <input 
                    type="text" 
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="password123"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. rahul@allcore.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Role Assigned</label>
                  <select 
                    value={newUser.roleId}
                    onChange={(e) => setNewUser({...newUser, roleId: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="" disabled>Select Role</option>
                    {roles.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Branch Location</label>
                  <input 
                    type="text" 
                    value={newUser.branch}
                    onChange={(e) => setNewUser({...newUser, branch: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Mumbai HO"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Login Status</label>
                <select 
                  value={newUser.status}
                  onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-600 hover:bg-gray-55 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-blue-750 text-slate-800 rounded font-bold shadow-xs"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMaster;
