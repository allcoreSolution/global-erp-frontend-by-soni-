import React, { useState } from 'react';
import { Building, Mail, Phone, Globe, MapPin, Edit, Plus, X } from 'lucide-react';

const CompanyProfile = () => {
  const [companies, setCompanies] = useState([
    { id: 'CO-001', name: 'ERP Global Corporation', code: 'ERPGLB', logo: '🌐', address: 'IT Park, Phase 1, Jaipur, Rajasthan, 302022', phone: '0141-2233445', email: 'corporate@erpglobal.com', website: 'www.erpglobal.com' }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', code: '', address: '', phone: '', email: '', website: '' });

  const activeCo = companies[0];

  const handleEditClick = () => {
    setEditForm({
      name: activeCo.name,
      code: activeCo.code,
      address: activeCo.address,
      phone: activeCo.phone,
      email: activeCo.email,
      website: activeCo.website
    });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setCompanies([{ ...activeCo, ...editForm }]);
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Company profile</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Configure base contact registers, corporate identity codes, logo brand systems, and websites.</p>
      </div>

      {activeCo ? (
        <div className="max-w-3xl border rounded-lg p-4 sm:p-5 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{activeCo.logo}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{activeCo.name}</h3>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">{activeCo.code}</span>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-1 text-[10px] sm:text-xs text-indigo-600 font-semibold border px-2.5 py-1 rounded hover:bg-slate-50 transition-colors"
              >
                <Edit size={12} /> Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 text-[11px] sm:text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Company Code</label>
                  <input
                    type="text"
                    required
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Email ID</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Website URL</label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 uppercase mb-1">Office Address</label>
                  <textarea
                    rows="3"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full border p-2 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t">
                <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 border rounded hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700">Save Changes</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] sm:text-xs">
              <div className="bg-slate-50 p-4 rounded border space-y-2.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Building size={14} className="text-indigo-600" /> Identity Info</h4>
                <p><span className="text-gray-500">Corporate Name:</span> <strong className="text-gray-900">{activeCo.name}</strong></p>
                <p><span className="text-gray-500">Identity Code:</span> <strong className="text-gray-900 font-mono">{activeCo.code}</strong></p>
                <p className="flex items-start gap-1"><MapPin size={13} className="text-gray-400 mt-0.5" /> <span className="text-gray-600">{activeCo.address}</span></p>
              </div>
              <div className="bg-slate-50 p-4 rounded border space-y-2.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs"><Globe size={14} className="text-indigo-600" /> Digital Contact</h4>
                <p className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" /> <span className="text-gray-800 font-medium">{activeCo.phone}</span></p>
                <p className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400" /> <span className="text-gray-800 font-medium break-all">{activeCo.email}</span></p>
                <p className="flex items-center gap-1.5"><Globe size={13} className="text-gray-400" /> <span className="text-indigo-600 font-medium">{activeCo.website}</span></p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 border rounded">No company profiles created.</div>
      )}
    </div>
  );
};

export default CompanyProfile;
