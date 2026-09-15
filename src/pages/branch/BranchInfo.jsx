import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, X, MapPin, Phone, Mail } from 'lucide-react';

const BranchInfo = () => {
  const [branches, setBranches] = useState([
    { id: 'BR-001', name: 'Jaipur HQ Office', code: 'JPHQ', type: 'Headquarters', address: 'IT Park, Phase 1, Jaipur, Rajasthan', phone: '0141-2233445', email: 'jaipur@company.com', gstin: '08AAAAA1111A1Z1' },
    { id: 'BR-002', name: 'Kota Regional Center', code: 'KT01', type: 'Regional Branch', address: 'Station Road, Kota, Rajasthan', phone: '0744-2244668', email: 'kota@company.com', gstin: '08BBBBB2222B2Z2' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentBranch, setCurrentBranch] = useState({
    id: '', code: '', name: '', type: 'Regional Office', company: '', manager: '', status: 'Active',
    contactPerson: '', mobile: '', email: '', phone: '',
    address1: '', address2: '', country: 'India', state: 'Uttar Pradesh', city: 'Lucknow', district: '', pincode: '',
    gstStatus: 'Registered', gstin: '', pan: '', tan: '',
    warehouse: '', priceList: '', currency: 'INR', timezone: 'Asia/Kolkata',
    costCenter: '', profitCenter: '', ledger: ''
  });

  const filtered = branches.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEdit(false);
    const nextId = `BR-${String(branches.length + 1).padStart(4, '0')}`;
    setCurrentBranch({
      id: nextId, code: nextId, name: '', type: 'Regional Office', company: '', manager: '', status: 'Active',
      contactPerson: '', mobile: '', email: '', phone: '',
      address1: '', address2: '', country: 'India', state: 'Uttar Pradesh', city: 'Lucknow', district: '', pincode: '',
      gstStatus: 'Registered', gstin: '', pan: '', tan: '',
      warehouse: '', priceList: '', currency: 'INR', timezone: 'Asia/Kolkata',
      costCenter: '', profitCenter: '', ledger: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setIsEdit(true);
    setCurrentBranch({ ...branch });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      setBranches(branches.map(b => b.id === currentBranch.id ? { ...currentBranch } : b));
    } else {
      setBranches([...branches, { ...currentBranch }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete branch ${id}?`)) {
      setBranches(branches.filter(b => b.id !== id));
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Branch Information</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Configure corporate branch listings, physical addresses coordinates, and contact details.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={14} /> Add Branch
        </button>
      </div>

      <div className="relative mb-4 w-full max-w-sm">
        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by Code or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Table responsive */}
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b font-semibold text-gray-700">
              <th className="p-2.5 sm:p-3">Code</th>
              <th className="p-2.5 sm:p-3">Branch Name</th>
              <th className="p-2.5 sm:p-3">Branch Type</th>
              <th className="p-2.5 sm:p-3">Contact</th>
              <th className="p-2.5 sm:p-3 font-mono">GSTIN</th>
              <th className="p-2.5 sm:p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(b => (
              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-2.5 sm:p-3 font-semibold text-indigo-600 font-mono">{b.code}</td>
                <td className="p-2.5 sm:p-3">
                  <div className="font-medium text-gray-900">{b.name}</div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10} />{b.address}</div>
                </td>
                <td className="p-2.5 sm:p-3 text-gray-650">{b.type}</td>
                <td className="p-2.5 sm:p-3">
                  <div>{b.phone}</div>
                  <div className="text-[10px] text-gray-400 break-all">{b.email}</div>
                </td>
                <td className="p-2.5 sm:p-3 font-mono text-gray-700">{b.gstin || '-'}</td>
                <td className="p-2.5 sm:p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button onClick={() => handleOpenEdit(b)} className="p-1 text-amber-600 hover:bg-amber-50 rounded">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl border">
            <div className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur shadow-sm border-b border-slate-200 text-slate-800 p-4 flex justify-between items-center">
              <h3 className="font-bold text-base sm:text-lg">{isEdit ? 'Edit Branch' : 'Add New Branch'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs sm:text-sm">
              
              {/* BASIC INFORMATION */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Code</label>
                    <input type="text" disabled value={currentBranch.code} className="w-full bg-slate-50 border p-2 rounded text-gray-500 text-xs cursor-not-allowed font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Name *</label>
                    <input type="text" required placeholder="e.g. Lucknow Branch" value={currentBranch.name} onChange={(e) => setCurrentBranch({ ...currentBranch, name: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Type *</label>
                    <select value={currentBranch.type} onChange={(e) => setCurrentBranch({ ...currentBranch, type: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="Regional Office">Regional Office</option>
                      <option value="Headquarters">Headquarters</option>
                      <option value="Warehouse Store">Warehouse Store</option>
                      <option value="Retail Store">Retail Store</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Company *</label>
                    <select required value={currentBranch.company} onChange={(e) => setCurrentBranch({ ...currentBranch, company: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="">Select Company</option>
                      <option value="Company A">Company A</option>
                      <option value="Company B">Company B</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Manager</label>
                    <select value={currentBranch.manager} onChange={(e) => setCurrentBranch({ ...currentBranch, manager: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="">Select Employee</option>
                      <option value="Emp 1">Emp 1</option>
                      <option value="Emp 2">Emp 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                    <select value={currentBranch.status} onChange={(e) => setCurrentBranch({ ...currentBranch, status: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CONTACT INFORMATION */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Person</label>
                    <input type="text" value={currentBranch.contactPerson} onChange={(e) => setCurrentBranch({ ...currentBranch, contactPerson: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile</label>
                    <input type="text" value={currentBranch.mobile} onChange={(e) => setCurrentBranch({ ...currentBranch, mobile: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" value={currentBranch.email} onChange={(e) => setCurrentBranch({ ...currentBranch, email: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                    <input type="text" value={currentBranch.phone} onChange={(e) => setCurrentBranch({ ...currentBranch, phone: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                </div>
              </div>

              {/* BRANCH ADDRESS */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Branch Address</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 1 *</label>
                    <input type="text" required value={currentBranch.address1} onChange={(e) => setCurrentBranch({ ...currentBranch, address1: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Address Line 2</label>
                    <input type="text" value={currentBranch.address2} onChange={(e) => setCurrentBranch({ ...currentBranch, address2: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Country *</label>
                    <select required value={currentBranch.country} onChange={(e) => setCurrentBranch({ ...currentBranch, country: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
                    <select required value={currentBranch.state} onChange={(e) => setCurrentBranch({ ...currentBranch, state: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                    <select required value={currentBranch.city} onChange={(e) => setCurrentBranch({ ...currentBranch, city: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="Lucknow">Lucknow</option>
                      <option value="Kanpur">Kanpur</option>
                      <option value="Mumbai">Mumbai</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">District</label>
                    <input type="text" value={currentBranch.district} onChange={(e) => setCurrentBranch({ ...currentBranch, district: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode *</label>
                    <input type="text" required value={currentBranch.pincode} onChange={(e) => setCurrentBranch({ ...currentBranch, pincode: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs" />
                  </div>
                </div>
              </div>

              {/* TAX & LEGAL */}
              <div>
                <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Tax & Legal</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">GST Status</label>
                    <select value={currentBranch.gstStatus} onChange={(e) => setCurrentBranch({ ...currentBranch, gstStatus: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                      <option value="Registered">Registered</option>
                      <option value="Unregistered">Unregistered</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">GSTIN</label>
                    <input type="text" value={currentBranch.gstin} onChange={(e) => setCurrentBranch({ ...currentBranch, gstin: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">PAN</label>
                    <input type="text" value={currentBranch.pan} onChange={(e) => setCurrentBranch({ ...currentBranch, pan: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">TAN</label>
                    <input type="text" value={currentBranch.tan} onChange={(e) => setCurrentBranch({ ...currentBranch, tan: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs font-mono" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* OPERATIONS */}
                <div>
                  <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Operations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Default Warehouse</label>
                      <select value={currentBranch.warehouse} onChange={(e) => setCurrentBranch({ ...currentBranch, warehouse: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="">Select Warehouse</option>
                        <option value="WH1">Main Warehouse</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Default Price List</label>
                      <select value={currentBranch.priceList} onChange={(e) => setCurrentBranch({ ...currentBranch, priceList: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="">Select Price List</option>
                        <option value="Retail">Retail Price List</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Currency</label>
                      <select value={currentBranch.currency} onChange={(e) => setCurrentBranch({ ...currentBranch, currency: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Time Zone</label>
                      <select value={currentBranch.timezone} onChange={(e) => setCurrentBranch({ ...currentBranch, timezone: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="Asia/Kolkata">Asia/Kolkata</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ACCOUNTING */}
                <div>
                  <h4 className="font-semibold text-gray-700 border-b pb-2 mb-4 uppercase text-xs">Accounting</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Cost Center</label>
                      <select value={currentBranch.costCenter} onChange={(e) => setCurrentBranch({ ...currentBranch, costCenter: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="">Select</option>
                        <option value="CC1">Main Cost Center</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Profit Center</label>
                      <select value={currentBranch.profitCenter} onChange={(e) => setCurrentBranch({ ...currentBranch, profitCenter: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="">Select</option>
                        <option value="PC1">Main Profit Center</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Ledger</label>
                      <select value={currentBranch.ledger} onChange={(e) => setCurrentBranch({ ...currentBranch, ledger: e.target.value })} className="w-full border p-2 rounded focus:outline-none focus:border-indigo-500 text-xs">
                        <option value="">Select Ledger</option>
                        <option value="L1">Branch Cash A/C</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOCUMENTS */}
              <div>
                <button type="button" className="text-indigo-600 border border-indigo-600 rounded px-3 py-1.5 text-xs font-semibold hover:bg-indigo-50 transition-colors">+ Upload Document</button>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded font-semibold text-gray-600 hover:bg-slate-50 text-sm transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 text-sm shadow-sm transition-colors">Save Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchInfo;
