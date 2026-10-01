import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Search, Edit3, X, Building2, Eye, Plus, CheckCircle, Info } from 'lucide-react';

const ContactAddress = () => {
  const [suppliers, setSuppliers] = useState([
    { id: 'SUP-001', name: 'Rathi Steel Traders', contactPerson: 'Sanjay Rathi', phone: '9414012345', email: 'sanjay@rathisteel.com', address: 'Plot No. 12, Industrial Area, Phase-I, Alwar, Rajasthan - 301001', status: 'Active', category: 'Raw Materials' },
    { id: 'SUP-002', name: 'Krishna Enterprises', contactPerson: 'Krishna Murari', phone: '9928011223', email: 'krishna.murari@enterprise.com', address: 'Shop 5, Subhash Marg, C-Scheme, Jaipur, Rajasthan - 302001', status: 'Active', category: 'Packaging' },
    { id: 'SUP-003', name: 'Vikas Logistics & Co', contactPerson: 'Vikas Yadav', phone: '9829098765', email: 'vikas@vikaslogistics.com', address: '22, Transport Nagar, Jaipur, Rajasthan - 302003', status: 'Inactive', category: 'Logistics' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState({ id: '', name: '', contactPerson: '', phone: '', email: '', address: '', status: 'Active', category: 'Raw Materials' });

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (sup) => {
    setCurrentSupplier({ ...sup });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (id) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuppliers(suppliers.map(s => s.id === currentSupplier.id ? { ...currentSupplier } : s));
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#f1f5f9] p-4 sm:p-6 rounded-3xl min-h-screen space-y-6">
      {/* Neo-CRM Header Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <span className="text-[10px] bg-slate-100 text-slate-600 border px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">CRM Directory</span>
          <h1 className="text-sm sm:text-lg font-black text-slate-800 tracking-tight mt-2 flex items-center gap-2">
            <Building2 className="text-indigo-600 animate-pulse" size={22} /> Logistics & Supply Hub Contacts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Monitor supplier communication channels, physical warehouse mapping, and active representative directories.</p>
        </div>

        {/* Search Matrix */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search representative or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
      </div>

      {/* Grid of Business Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(s => {
          const initials = s.name.split(' ').map(n => n[0]).join('').slice(0, 2);
          return (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1">
              <div className="p-5 space-y-4">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-slate-800 font-extrabold text-sm flex items-center justify-center uppercase shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors">{s.name}</h3>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{s.id}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-extrabold tracking-wide uppercase border ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.1)]' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {s.category}
                  </span>
                </div>

                {/* Details Section */}
                <div className="space-y-2.5 text-xs border-t pt-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-100 text-slate-600 rounded">
                      <User size={12} />
                    </div>
                    <span className="text-slate-500">Rep:</span>
                    <strong className="text-slate-800">{s.contactPerson}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-100 text-slate-600 rounded">
                      <Phone size={12} />
                    </div>
                    <span className="text-slate-500">Phone:</span>
                    <strong className="text-slate-800 font-mono">{s.phone}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-slate-100 text-slate-600 rounded">
                      <Mail size={12} />
                    </div>
                    <span className="text-slate-500">Email:</span>
                    <strong className="text-slate-800 truncate font-mono max-w-[180px]" title={s.email}>{s.email}</strong>
                  </div>

                  <div className="flex items-start gap-2 border-t pt-2.5">
                    <div className="p-1 bg-rose-50 text-rose-600 rounded mt-0.5">
                      <MapPin size={12} />
                    </div>
                    <p className="text-slate-600 leading-relaxed font-semibold text-[11px] sm:text-xs">
                      {s.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-slate-50 px-5 py-3.5 border-t flex items-center justify-between">
                <button
                  onClick={() => handleToggleStatus(s.id)}
                  className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-lg border transition-all ${s.status === 'Active' ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600' : 'bg-slate-200 text-slate-700 border-slate-350 hover:bg-slate-300'}`}
                >
                  {s.status === 'Active' ? 'Active' : 'Inactive'}
                </button>
                
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-white font-extrabold uppercase border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-indigo-600 hover:border-blue-600 transition-all shadow-sm"
                >
                  <Edit3 size={11} /> Edit Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border my-auto">
            <div className="bg-slate-50/50 shadow-inner border border-slate-200 text-slate-800 p-4 flex justify-between items-center">
              <h3 className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5"><Info size={16} /> Edit Contact Coordinates</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Supplier Company</label>
                <input type="text" disabled value={currentSupplier.name} className="w-full bg-slate-50 border p-2.5 rounded-xl text-gray-500 cursor-not-allowed text-xs font-bold" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={currentSupplier.contactPerson}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, contactPerson: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={currentSupplier.phone}
                    onChange={(e) => setCurrentSupplier({ ...currentSupplier, phone: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={currentSupplier.email}
                  onChange={(e) => setCurrentSupplier({ ...currentSupplier, email: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Warehouse Physical Address</label>
                <textarea
                  rows="3"
                  value={currentSupplier.address}
                  onChange={(e) => setCurrentSupplier({ ...currentSupplier, address: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 border-t pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-xs font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors text-xs shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactAddress;
