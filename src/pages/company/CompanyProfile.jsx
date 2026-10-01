import React, { useState, useEffect } from 'react';
import { Building, Mail, Phone, Globe, MapPin, Edit, CheckCircle } from 'lucide-react';
import api from '../../api';

const CompanyProfile = () => {
  const [activeCo, setActiveCo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', code: '', address: '', phone: '', email: '', website: '' });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/companies/profile');
      if (res.data) {
        setActiveCo({
          name: res.data.name || '',
          code: res.data.code || '',
          address: res.data.address || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          website: res.data.website || '',
          logo: '🏢'
        });
      }
    } catch (err) {
      console.error('Failed to fetch company profile', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setEditForm({
      name: activeCo.name || '',
      code: activeCo.code || '',
      address: activeCo.address || '',
      phone: activeCo.phone || '',
      email: activeCo.email || '',
      website: activeCo.website || ''
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/companies/profile', editForm);
      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      alert('Failed to save profile. ' + (err.response?.data?.message || ''));
    }
  };

  if (!activeCo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-indigo-500 font-semibold">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-white font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200">
        
        {/* Banner Section */}
        <div className="relative h-28 sm:h-36 bg-slate-100 border-b border-slate-200">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          
          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="absolute top-6 right-6 z-10 bg-white border border-slate-200 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 transition-all shadow hover:bg-slate-50"
            >
              <Edit size={14} /> EDIT PROFILE
            </button>
          )}
        </div>

        {/* Profile Content */}
        <div className="px-5 sm:px-8 pb-8">
          
          {/* Avatar and Header Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-14 mb-8 relative z-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-white text-4xl shadow-indigo-100">
              {activeCo.logo}
            </div>
            <div className="flex-1 text-center sm:text-left pb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{activeCo.name || 'Company Name'}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                <span className="bg-indigo-50 text-indigo-600 text-xs px-3 py-1 rounded-full font-bold tracking-wider uppercase border border-indigo-100 shadow-sm">
                  {activeCo.code || 'NO-CODE'}
                </span>
                {activeCo.address && (
                  <span className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                    <MapPin size={16} className="text-indigo-400" />
                    {activeCo.address.split(',')[0]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                <Edit size={16} className="text-indigo-600" /> Update Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Company Name</label>
                  <input
                    type="text" required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Registration Code</label>
                  <input
                    type="text" required
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Website URL</label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Office Address</label>
                  <textarea
                    rows="2"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 p-2 text-sm rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none font-semibold text-slate-800 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)} 
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg font-bold hover:bg-indigo-700 shadow shadow-indigo-200 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle size={15} /> Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Identity Card */}
              <div className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                    <Building size={18} strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800">Identity Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Legal Name</p>
                    <p className="text-sm font-bold text-slate-800">{activeCo.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Registration Code</p>
                    <p className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-mono font-bold rounded border border-indigo-100">{activeCo.code}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Registered Address</p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{activeCo.address || 'Address not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Digital Card */}
              <div className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-pink-200 transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                    <Globe size={18} strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800">Digital Contact</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg text-slate-500 flex items-center justify-center">
                      <Phone size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Phone Support</p>
                      <p className="text-xs font-bold text-slate-800">{activeCo.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg text-slate-500 flex items-center justify-center">
                      <Mail size={14} />
                    </div>
                    <div className="break-all">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Email Address</p>
                      <p className="text-xs font-bold text-slate-800">{activeCo.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg text-indigo-500 flex items-center justify-center">
                      <Globe size={14} />
                    </div>
                    <div className="break-all">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Website</p>
                      {activeCo.website ? (
                        <a 
                          href={activeCo.website.startsWith('http') ? activeCo.website : `https://${activeCo.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                        >
                          {activeCo.website}
                        </a>
                      ) : (
                        <p className="text-xs font-bold text-slate-800">N/A</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
