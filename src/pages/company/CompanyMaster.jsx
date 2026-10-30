import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Search, 
  CheckCircle2, 
  ArrowRightLeft, 
  Edit3, 
  MapPin, 
  Building,
  Loader2,
  RefreshCw,
  QrCode,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import api from '../../api';

const CompanyMaster = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCompanyId, setActiveCompanyId] = useState(() => localStorage.getItem('active_company_id') || '');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies/switch-options');
      if (res.data?.success) {
        setCompanies(res.data.companies || []);
        // If no active company set in localStorage, default to first
        if (!localStorage.getItem('active_company_id') && res.data.companies?.length > 0) {
          const first = res.data.companies[0];
          localStorage.setItem('active_company_id', first._id);
          localStorage.setItem('companyName', first.name);
          setActiveCompanyId(first._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    const handleSwitched = () => {
      setActiveCompanyId(localStorage.getItem('active_company_id') || '');
    };
    window.addEventListener('companySwitched', handleSwitched);
    return () => window.removeEventListener('companySwitched', handleSwitched);
  }, []);

  const handleSwitchCompany = (comp) => {
    localStorage.setItem('active_company_id', comp._id);
    localStorage.setItem('companyName', comp.name);
    localStorage.setItem('erp_company', comp.name);

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.company = {
          ...(userObj.company || {}),
          _id: comp._id,
          name: comp.name,
          logoUrl: comp.logoUrl || '',
          themeColor: comp.themeColor || '#0a192f'
        };
        localStorage.setItem('user', JSON.stringify(userObj));
      }
    } catch (_) {}

    setActiveCompanyId(comp._id);
    window.dispatchEvent(new Event('companySwitched'));
    window.dispatchEvent(new Event('userUpdated'));
    window.dispatchEvent(new Event('erp_config_changed'));

    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  const filteredCompanies = companies.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.code || '').toLowerCase().includes(term) ||
      (c.gstin || '').toLowerCase().includes(term) ||
      (c.city || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Section (Clean White Background) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="text-indigo-600 dark:text-indigo-400" size={20} />
              Company Master
            </h1>
            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={11} /> Multi-Company Architecture
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-2xl">
            Manage multiple pharmaceutical firms, wholesale drug licences (DL 20B/21B), GST billing prefixes, and bank accounts. Switch between firms in 1-click.
          </p>
        </div>

        {/* Dedicated Page Button: Navigates to Add Page */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchCompanies()}
            className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Refresh Companies"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => navigate('/company/company-master/add')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus size={17} />
            <span>Add New Company</span>
          </button>
        </div>
      </div>

      {/* Search and Overview Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company by name, code, GST..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span>Registered Companies:</span>
          <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full font-bold text-indigo-600 dark:text-indigo-400">
            {companies.length}
          </span>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 size={32} className="animate-spin text-indigo-600 mb-2" />
          <span className="text-xs font-semibold">Loading registered companies...</span>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <Building2 size={40} className="mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Companies Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Get started by adding your pharmaceutical distribution or healthcare firm.
          </p>
          <button
            onClick={() => navigate('/company/company-master/add')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
          >
            + Add New Company
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((comp) => {
            const isActive = comp._id === activeCompanyId;
            return (
              <div
                key={comp._id}
                className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:ring-indigo-500/40'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Card Top */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                        {comp.logoUrl ? (
                          <img src={comp.logoUrl} alt={comp.name} className="w-full h-full object-contain" />
                        ) : (
                          <Building size={20} className="text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                            {comp.code || 'CO'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Prefix: {comp.invoicePrefix || 'INV/'}
                          </span>
                        </div>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight mt-1 truncate max-w-[200px]" title={comp.name}>
                          {comp.name}
                        </h2>
                      </div>
                    </div>

                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 size={11} /> Active
                      </span>
                    )}
                  </div>

                  {/* Badges / Tax Info */}
                  <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] text-slate-400 font-medium">GSTIN:</span>
                      <span className="font-mono font-bold text-[11px] bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {comp.gstin || 'Not Configured'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] text-slate-400 font-medium">Drug Licences:</span>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[170px]" title={`20B: ${comp.dl20b || 'N/A'}, 21B: ${comp.dl21b || 'N/A'}`}>
                        {comp.dl20b ? `20B: ${comp.dl20b}` : (comp.drugLicenceNo || 'DL Configured')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] text-slate-400 font-medium">Location:</span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{comp.city || 'Lucknow'}, {comp.state || 'UP'}</span>
                      </span>
                    </div>

                    {comp.upiId && (
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-[11px] text-slate-400 font-medium">UPI QR Pay:</span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded truncate max-w-[160px]">
                          {comp.upiId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Bottom */}
                <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {/* Dedicated Page Button: Navigates to Edit Page */}
                  <button
                    onClick={() => navigate(`/company/company-master/edit/${comp._id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit Profile</span>
                  </button>

                  {isActive ? (
                    <div className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/80 rounded-lg border border-emerald-300 dark:border-emerald-800">
                      Active Workspace
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSwitchCompany(comp)}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer"
                    >
                      <ArrowRightLeft size={13} />
                      <span>Switch to Firm</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyMaster;
