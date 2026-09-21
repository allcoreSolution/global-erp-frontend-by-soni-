import React, { useState } from 'react';
import { Building, CreditCard, ShieldCheck, Edit2, DollarSign, X, Check, Award, Percent, Calendar } from 'lucide-react';

const TaxFinancial = () => {
  const [suppliers, setSuppliers] = useState([
    {
      id: 'SUP-001',
      name: 'Rathi Steel Traders',
      gstin: '08RATHI1234A1Z0',
      pan: 'RATHI1234A',
      bankName: 'Punjab National Bank',
      bankAccount: '01234567890123',
      bankIfsc: 'PUNB0012300',
      openingBalance: 75000,
      balanceType: 'Cr',
      creditPeriod: 60,
      paymentTerms: 'Net 60'
    },
    {
      id: 'SUP-002',
      name: 'Krishna Enterprises',
      gstin: '08KRISH5566B2Z9',
      pan: 'KRISH5566B',
      bankName: 'HDFC Bank',
      bankAccount: '50200012345678',
      bankIfsc: 'HDFC0000012',
      openingBalance: 15000,
      balanceType: 'Cr',
      creditPeriod: 30,
      paymentTerms: 'Net 30'
    },
    {
      id: 'SUP-003',
      name: 'Vikas Logistics & Co',
      gstin: '08VIKAS9999C3Z1',
      pan: 'VIKAS9999C',
      bankName: 'Bank of Baroda',
      bankAccount: '112233445566',
      bankIfsc: 'BARB0TRANSP',
      openingBalance: 0,
      balanceType: 'Dr',
      creditPeriod: 15,
      paymentTerms: 'Due on Receipt'
    }
  ]);

  const [selectedId, setSelectedId] = useState('SUP-001');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    gstin: '', pan: '', bankName: '', bankAccount: '', bankIfsc: '',
    openingBalance: 0, balanceType: 'Cr', creditPeriod: 30, paymentTerms: 'Net 30'
  });

  const activeSupplier = suppliers.find(s => s.id === selectedId) || suppliers[0];

  const handleEditClick = () => {
    setEditForm({
      gstin: activeSupplier.gstin,
      pan: activeSupplier.pan,
      bankName: activeSupplier.bankName,
      bankAccount: activeSupplier.bankAccount,
      bankIfsc: activeSupplier.bankIfsc,
      openingBalance: activeSupplier.openingBalance,
      balanceType: activeSupplier.balanceType,
      creditPeriod: activeSupplier.creditPeriod,
      paymentTerms: activeSupplier.paymentTerms
    });
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSuppliers(suppliers.map(s => s.id === selectedId ? { ...s, ...editForm } : s));
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-50/50 p-4 sm:p-6 rounded-2xl min-h-screen space-y-6 font-sans">
      {/* Financial Master Header Banner */}
      <div className="relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="z-10">
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-100">Accounting Center</span>
          <h1 className="text-sm sm:text-lg font-black text-slate-800 tracking-tight mt-2 flex items-center gap-2">
            <CreditCard className="text-indigo-500" size={22} /> Tax & Credit Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">Configure legal GSTIN codes, verify bank clearance channels, and control supplier credit parameters.</p>
        </div>
        <div className="z-10 bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-mono shadow-sm">
          Selected Code: <span className="font-bold text-indigo-600">{activeSupplier.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Modern Financial Directory */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col h-[220px] lg:h-[500px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-bold text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider flex justify-between items-center">
            <span>Financial Directory</span>
            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm text-slate-500">{suppliers.length}</span>
          </div>
          <div className="divide-y divide-slate-100/80 overflow-y-auto flex-1 no-scrollbar text-xs">
            {suppliers.map(s => (
              <div
                key={s.id}
                onClick={() => { setSelectedId(s.id); setIsEditing(false); }}
                className={`p-4 cursor-pointer transition-all flex items-center justify-between group ${selectedId === s.id ? 'bg-indigo-50/30 font-bold border-l-4 border-indigo-500' : 'hover:bg-slate-50 text-slate-600 border-l-4 border-transparent'}`}
              >
                <div>
                  <div className={`font-semibold ${selectedId === s.id ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'}`}>{s.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">{s.id}</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${selectedId === s.id ? 'text-indigo-700' : 'text-slate-600'}`}>₹{s.openingBalance.toLocaleString()}</div>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${s.balanceType === 'Cr' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{s.balanceType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Professional Details Panel */}
        <div className="lg:col-span-8">
          {activeSupplier ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-6 relative overflow-hidden transition-all duration-300">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                    <Building className="text-indigo-500" size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-800 truncate max-w-[200px] sm:max-w-none">{activeSupplier.name}</h2>
                    <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">{activeSupplier.id}</span>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 font-bold border border-slate-200 hover:border-indigo-200 bg-white px-4 py-2 rounded-xl hover:bg-indigo-50/50 transition-all duration-300 shadow-sm"
                  >
                    <Edit2 size={13} /> Edit Details
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-5 text-xs sm:text-sm animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GSTIN Registration</label>
                      <input
                        type="text"
                        value={editForm.gstin}
                        onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value })}
                        className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 text-xs font-mono transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PAN Card Number</label>
                      <input
                        type="text"
                        value={editForm.pan}
                        onChange={(e) => setEditForm({ ...editForm, pan: e.target.value })}
                        className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 text-xs font-mono transition-all"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
                    <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Building size={14} className="text-slate-500" /> Banking Coordinates
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bank Name</label>
                        <input
                          type="text"
                          value={editForm.bankName}
                          onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                          className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 text-xs transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Number</label>
                        <input
                          type="text"
                          value={editForm.bankAccount}
                          onChange={(e) => setEditForm({ ...editForm, bankAccount: e.target.value })}
                          className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 text-xs font-mono transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IFSC Code</label>
                        <input
                          type="text"
                          value={editForm.bankIfsc}
                          onChange={(e) => setEditForm({ ...editForm, bankIfsc: e.target.value })}
                          className="w-full border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 text-xs font-mono transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opening Bal (₹)</label>
                      <input
                        type="number"
                        value={editForm.openingBalance}
                        onChange={(e) => setEditForm({ ...editForm, openingBalance: Number(e.target.value) })}
                        className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 text-xs transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Balance Type</label>
                      <select
                        value={editForm.balanceType}
                        onChange={(e) => setEditForm({ ...editForm, balanceType: e.target.value })}
                        className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 text-xs transition-all"
                      >
                        <option value="Cr">Cr (Payable)</option>
                        <option value="Dr">Dr (Advance)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Credit Period</label>
                      <input
                        type="number"
                        value={editForm.creditPeriod}
                        onChange={(e) => setEditForm({ ...editForm, creditPeriod: Number(e.target.value) })}
                        className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 text-xs transition-all"
                        placeholder="Days"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Protocol</label>
                      <select
                        value={editForm.paymentTerms}
                        onChange={(e) => setEditForm({ ...editForm, paymentTerms: e.target.value })}
                        className="w-full border border-slate-200 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-slate-50 text-xs transition-all"
                      >
                        <option value="Due on Receipt">Due on Receipt</option>
                        <option value="Net 15">Net 15</option>
                        <option value="Net 30">Net 30</option>
                        <option value="Net 45">Net 45</option>
                        <option value="Net 60">Net 60</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-5 border-t border-slate-100">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors text-xs shadow-md hover:shadow-lg">Save Parameters</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 text-xs sm:text-sm animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Tax Passport block */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-4 group hover:border-indigo-200 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-extrabold text-[11px] sm:text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck size={16} className="text-emerald-500" /> Tax Registrations
                        </h4>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                          <Check size={14} className="text-emerald-600" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 font-mono">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-[10px] text-slate-500 mb-1 font-sans font-bold">GSTIN</div>
                          <div className="font-bold text-slate-800 text-xs sm:text-sm tracking-wider">{activeSupplier.gstin || 'N/A'}</div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-[10px] text-slate-500 mb-1 font-sans font-bold">PAN CARD</div>
                          <div className="font-bold text-slate-800 text-xs sm:text-sm tracking-wider">{activeSupplier.pan || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Bank Card block */}
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-4 group hover:border-indigo-200 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-extrabold text-[11px] sm:text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Building size={16} className="text-blue-500" /> Bank Credentials
                        </h4>
                        <span className="text-[10px] bg-blue-50 text-indigo-600 border border-blue-100 px-2.5 py-1 rounded-lg font-bold">{activeSupplier.bankName.split(' ')[0]}</span>
                      </div>
                      <div className="space-y-3 font-mono">
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-500 font-sans font-bold">A/C Number</span>
                          <span className="font-bold text-slate-800 text-xs tracking-wider">{activeSupplier.bankAccount ? `•••• •••• ${activeSupplier.bankAccount.slice(-4)}` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-500 font-sans font-bold">IFSC Code</span>
                          <span className="font-bold text-slate-800 text-xs tracking-wider">{activeSupplier.bankIfsc || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Credit Protocol Parameters */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                      <CreditCard size={15} className="text-indigo-500" /> Credit Terms & Ledger
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div className="flex items-start gap-3">
                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 border border-emerald-100">
                          <DollarSign size={16} />
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Opening Balance</span>
                          <div className="font-black text-slate-800 text-sm mt-0.5">
                            ₹ {activeSupplier.openingBalance.toLocaleString()} 
                            <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${activeSupplier.balanceType === 'Cr' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {activeSupplier.balanceType}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-amber-50 p-2 rounded-lg text-amber-600 border border-amber-100">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Credit Period</span>
                          <div className="font-black text-slate-800 text-sm mt-0.5">{activeSupplier.creditPeriod} Days</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-indigo-600 border border-blue-100">
                          <Percent size={16} />
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Payment Protocol</span>
                          <div className="font-black text-slate-800 text-sm mt-0.5">{activeSupplier.paymentTerms}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50/50 shadow-inner">
              <Building size={32} className="text-slate-300 mb-3" />
              <h3 className="text-slate-700 font-bold mb-1">No Supplier Selected</h3>
              <p className="text-slate-500 text-xs">Select a supplier from the directory to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxFinancial;
