import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const NewContra = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Basic Information State
  const [form, setForm] = useState({
    contraNo: `CON-${Date.now().toString().slice(-5)}`,
    contraDate: new Date().toISOString().split('T')[0],
    fromAccount: '',
    toAccount: '',
    amount: 0,
    transferMode: 'Cash Withdrawal',
    referenceNo: '',
    transactionDate: new Date().toISOString().split('T')[0],
    bankCharges: 0,
    narration: ''
  });

  const [branch, setBranch] = useState('');
  const [warehouse, setWarehouse] = useState('');

  // Dropdown States
  const [branchesList, setBranchesList] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [accountLedgers, setAccountLedgers] = useState([]);

  // Derived filtered options
  const warehouses = allWarehouses.filter(w => !branch || w.branchName === branch).map(w => w.name);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [branchRes, whRes, accRes] = await Promise.all([
          api.get('/branches').catch(() => ({ data: { data: [] } })),
          api.get('/catalogs/warehouses').catch(() => ({ data: { data: [] } })),
          api.get('/account-ledgers').catch(() => ({ data: { data: [] } }))
        ]);
        
        setBranchesList((branchRes.data?.data || []).map(b => b.name));
        setAllWarehouses((whRes.data?.data || []).map(w => ({
          name: w.name,
          branchName: w.branch?.name || w.branch || ''
        })));
        
        const accData = accRes.data?.data || [];
        setAccountLedgers(accData.map(a => a.accountName || a.name || a));

      } catch (error) {
        console.error('Error fetching catalogs:', error);
      }
    };
    fetchCatalogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        branch,
        warehouse,
        amount: Number(form.amount) || 0,
        bankCharges: Number(form.bankCharges) || 0,
      };
      
      if (id) {
        await api.put(`/contras/${id}`, payload);
        alert('Contra Entry Updated successfully!');
      } else {
        await api.post('/contras', payload);
        alert('Contra Entry Posted successfully!');
      }
      navigate('/contra/list');
    } catch (error) {
      console.error('Error saving contra entry', error);
      alert('Failed to save contra entry. Please check the inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/contra/list')} className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors">
          <ArrowLeft size={18} /> Back to Contra List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/contra/list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button onClick={handleSave} type="button" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
             <CheckCircle size={16} /> Post Contra Entry
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-purple-900 uppercase tracking-wide">CREATE CONTRA ENTRY</h2>
          <p className="text-sm text-slate-500 font-medium">Record internal bank/cash transfers</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION: BASIC INFORMATION */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Location & Date</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contra No. *</label>
                  <input type="text" name="contraNo" value={form.contraNo} readOnly className="w-full border border-slate-300 rounded bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input type="date" name="contraDate" value={form.contraDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch *</label>
                  <select value={branch} onChange={(e) => { setBranch(e.target.value); setWarehouse(''); }} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none bg-white" required>
                    <option value="">Select branch...</option>
                    {branchesList.map((b, i) => <option key={i} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse *</label>
                  <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none bg-white" required>
                    <option value="">{branch ? "Select warehouse..." : "Select branch first"}</option>
                    {warehouses.map((w, i) => <option key={i} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: TRANSFER ACCOUNTS */}
            <div className="border border-slate-200 rounded-lg p-5 bg-purple-50/30">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Transfer Routing</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">From Account (Paid Out) *</label>
                  <select 
                    name="fromAccount" 
                    value={form.fromAccount} 
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none bg-white"
                    required
                  >
                    <option value="">Select From Account</option>
                    {accountLedgers.map((acc, i) => <option key={i} value={acc}>{acc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">To Account (Received In) *</label>
                  <select 
                    name="toAccount" 
                    value={form.toAccount} 
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none bg-white"
                    required
                  >
                    <option value="">Select To Account</option>
                    {accountLedgers.map((acc, i) => <option key={i} value={acc}>{acc}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* SECTION: FINANCIAL DETAILS */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Financial Details</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Transfered *</label>
                  <input type="number" name="amount" value={form.amount} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-lg font-bold text-purple-700 focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Mode *</label>
                  <select name="transferMode" value={form.transferMode} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none bg-white">
                    <option>Cash Withdrawal</option>
                    <option>Cash Deposit</option>
                    <option>Bank to Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Charges (₹)</label>
                  <input type="number" name="bankCharges" value={form.bankCharges} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ref / UTR No.</label>
                  <input type="text" name="referenceNo" value={form.referenceNo} onChange={handleChange} placeholder="Ref No" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Date</label>
                  <input type="date" name="transactionDate" value={form.transactionDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none" />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Narration / Remarks</label>
                  <input type="text" name="narration" value={form.narration} onChange={handleChange} placeholder="e.g. Cash withdrawn for petty expenses..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none" />
                </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewContra;
