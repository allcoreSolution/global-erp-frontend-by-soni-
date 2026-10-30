import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  ArrowLeft, 
  Save, 
  Briefcase, 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  Building,
  QrCode
} from 'lucide-react';
import api from '../../api';

const AddCompanyMaster = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState('legal');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  const initialFormState = {
    // Part A: Legal & Basic Identity
    name: '',
    code: '',
    businessType: 'Pharmaceutical Wholesale and Distribution',
    constitution: 'Proprietorship',
    ownerName: '',

    // Part B: Tax & Wholesale Drug Licences
    gstin: '',
    panNumber: '',
    drugLicenceNo: '',
    dl20b: '',
    dl21b: '',
    fssaiNo: '',
    drugLicenceValidity: '',

    // Part C: Address & Contact Details
    address: '',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',

    // Part D: Banking & Invoice Printing
    logoUrl: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    upiId: '',
    invoicePrefix: '',
    terms: '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond credit period.',
    signature: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch company details if editing
  useEffect(() => {
    if (isEditMode) {
      const fetchCompanyData = async () => {
        try {
          setFetching(true);
          const res = await api.get('/companies/profile', {
            headers: { 'x-company-id': id }
          });
          const comp = res.data;
          if (comp) {
            setFormData({
              name: comp.name || '',
              code: comp.code || '',
              businessType: comp.businessType || 'Pharmaceutical Wholesale and Distribution',
              constitution: comp.constitution || 'Proprietorship',
              ownerName: comp.ownerName || '',

              gstin: comp.gstin || '',
              panNumber: comp.panNumber || '',
              drugLicenceNo: comp.drugLicenceNo || comp.dl20b || '',
              dl20b: comp.dl20b || '',
              dl21b: comp.dl21b || '',
              fssaiNo: comp.fssaiNo || '',
              drugLicenceValidity: comp.drugLicenceValidity ? comp.drugLicenceValidity.split('T')[0] : '',

              address: comp.address || '',
              city: comp.city || '',
              state: comp.state || '',
              pincode: comp.pincode || '',
              phone: comp.phone || '',
              whatsapp: comp.whatsapp || '',
              email: comp.email || '',
              website: comp.website || '',

              logoUrl: comp.logoUrl || '',
              bankName: comp.bankName || '',
              accountNumber: comp.accountNumber || '',
              ifscCode: comp.ifscCode || '',
              branchName: comp.branchName || '',
              upiId: comp.upiId || '',
              invoicePrefix: comp.invoicePrefix || '',
              terms: comp.terms || '1. Goods once sold will not be taken back.',
              signature: comp.signature || `For ${comp.name} - Authorized Signatory`
            });
          }
        } catch (err) {
          console.error('Failed to load company:', err);
          alert('Could not fetch company details.');
          navigate('/company/company-master');
        } finally {
          setFetching(false);
        }
      };
      fetchCompanyData();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Step tabs with clean names
  const tabs = [
    { id: 'legal', label: 'Legal & Identity', icon: Briefcase, step: 1 },
    { id: 'tax', label: 'Tax & Drug Licences', icon: ShieldCheck, step: 2 },
    { id: 'contact', label: 'Address & Contact', icon: MapPin, step: 3 },
    { id: 'bank', label: 'Bank & Billing', icon: CreditCard, step: 4 }
  ];

  // Save & Next logic
  const handleSaveAndNext = () => {
    if (activeTab === 'legal') {
      if (!formData.name.trim()) {
        alert('Please enter Company Legal Name before proceeding.');
        return;
      }
      setActiveTab('tax');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeTab === 'tax') {
      setActiveTab('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeTab === 'contact') {
      setActiveTab('bank');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final submit handler for Part D (Last step)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter Company Legal Name');
      setActiveTab('legal');
      return;
    }

    try {
      setLoading(true);
      if (isEditMode) {
        await api.put('/companies/profile', formData, {
          headers: { 'x-company-id': id }
        });
        alert('Company details updated successfully!');
      } else {
        const res = await api.post('/companies/create-master', formData);
        alert(res.data?.message || 'New company registered successfully with automated Godown and Cash accounts!');
        
        // Auto-switch to newly created company
        if (res.data?.company?._id) {
          localStorage.setItem('active_company_id', res.data.company._id);
          localStorage.setItem('companyName', res.data.company.name);
          localStorage.setItem('erp_company', res.data.company.name);
          window.dispatchEvent(new Event('companySwitched'));
          window.dispatchEvent(new Event('userUpdated'));
          window.dispatchEvent(new Event('erp_config_changed'));
        }
      }

      navigate('/company/company-master');
    } catch (err) {
      console.error('Save company error:', err);
      alert(err.response?.data?.message || 'Failed to save company information.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-500">
        <Loader2 size={36} className="animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold">Loading company profile details...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-0.5">
            <Link to="/company/company-master" className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
              Company Master
            </Link>
            <ChevronRight size={11} />
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {isEditMode ? 'Edit Company' : 'Add New Company'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/company/company-master"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Back to Company Master"
            >
              <ArrowLeft size={17} />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
                {isEditMode ? `Edit Company: ${formData.name || 'Profile'}` : 'Register New Company'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEditMode 
                  ? 'Update business identity, wholesale drug licences, GSTIN, and banking information.'
                  : 'Add a new firm to your workspace. Default Godown and Cash ledger will be auto-generated.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Navigation Tabs in 100% English */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-xl px-2 sm:px-4 overflow-x-auto no-scrollbar shadow-xs">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3.5 px-4 sm:px-5 border-b-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-slate-900 rounded-b-xl border-x border-b border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
          
          {/* ========================================================================= */}
          {/* TAB 1: PART A (LEGAL & BASIC IDENTITY) */}
          {/* ========================================================================= */}
          {activeTab === 'legal' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Briefcase size={18} className="text-indigo-600" />
                  Legal & Basic Identity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enter constitutional and registered company details as recorded with government authorities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Legal Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Apex Pharma Distributors"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Full registered legal trade name printed on tax bills.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Short Company Code (2 to 5 Letters)
                  </label>
                  <input
                    type="text"
                    name="code"
                    maxLength={6}
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. APD or SHPL"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Used in top navigation badge and invoice series prefix.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Business Constitution
                  </label>
                  <select
                    name="constitution"
                    value={formData.constitution}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  >
                    <option value="Proprietorship">Proprietorship Firm</option>
                    <option value="Partnership">Partnership Firm</option>
                    <option value="Private Limited">Private Limited Company (Pvt Ltd)</option>
                    <option value="Limited Liability Partnership">Limited Liability Partnership (LLP)</option>
                    <option value="Public Limited">Public Limited Company</option>
                    <option value="One Person Company">One Person Company (OPC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Proprietor / Managing Director Name
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="e.g. Rajesh Kumar Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nature of Business & Operations
                  </label>
                  <input
                    type="text"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    placeholder="e.g. Pharmaceutical wholesale, surgical supply, and medicine C&F distribution"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PART B (TAX & PHARMA DRUG LICENCES) */}
          {/* ========================================================================= */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  Tax & Wholesale Drug Licences
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pharma wholesale licences (DL 20B/21B) and GSTIN will be dynamically rendered on all sales bills and tax reports.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    GSTIN (15-Digit GST Number)
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
                    placeholder="e.g. 09AABCA1234D1Z5"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Income Tax PAN Number
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    maxLength={10}
                    value={formData.panNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
                    placeholder="e.g. AABCA1234D"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
                  <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    Wholesale Drug Licence: Form 20B
                  </label>
                  <input
                    type="text"
                    name="dl20b"
                    value={formData.dl20b}
                    onChange={handleChange}
                    placeholder="e.g. UP/LKO/20B/2024/0981"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 block">
                    Allopathic medicines wholesale distribution licence.
                  </span>
                </div>

                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
                  <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    Wholesale Drug Licence: Form 21B
                  </label>
                  <input
                    type="text"
                    name="dl21b"
                    value={formData.dl21b}
                    onChange={handleChange}
                    placeholder="e.g. UP/LKO/21B/2024/0982"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 block">
                    Schedule C & C(1) biological and special products licence.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    FSSAI Registration Number (Nutraceuticals / Food)
                  </label>
                  <input
                    type="text"
                    name="fssaiNo"
                    value={formData.fssaiNo}
                    onChange={handleChange}
                    placeholder="e.g. 12724001000543"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Drug Licence Validity / Renewal Date
                  </label>
                  <input
                    type="date"
                    name="drugLicenceValidity"
                    value={formData.drugLicenceValidity}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Enables automated warning prior to licence expiry.</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PART C (ADDRESS & CONTACT) */}
          {/* ========================================================================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MapPin size={18} className="text-blue-600" />
                  Address & Contact Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official shop and communication details for bill dispatch and WhatsApp integration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered Business / Shop Address
                  </label>
                  <textarea
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. Shop No. 12-14, Medicine Market, Aminabad"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    City / District
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Lucknow"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Uttar Pradesh"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 226001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Landline / Mobile
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 94150 12345"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    WhatsApp Alert Number (for PDF Sharing)
                  </label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. billing@apexpharma.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PART D (BANKING & INVOICE PRINT) */}
          {/* ========================================================================= */}
          {activeTab === 'bank' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CreditCard size={18} className="text-purple-600" />
                  Bank Accounts & Invoice Printing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure bank details, Dynamic UPI QR Code, invoice prefix, and terms for printed sale bills.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="e.g. State Bank of India or HDFC Bank"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="e.g. 50200088991122"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SBIN0001234"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold uppercase focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Bank Branch Name
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    placeholder="e.g. Main Branch, Hazratganj"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200/60 dark:border-purple-800/60 md:col-span-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <QrCode size={16} className="text-purple-600" />
                    <label className="text-xs font-bold text-purple-900 dark:text-purple-300">
                      UPI ID for Dynamic QR Payment (NPCI Compliant)
                    </label>
                  </div>
                  <input
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleChange}
                    placeholder="e.g. apexpharma@sbi or sunrisehealth@hdfcbank"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-purple-300 dark:border-purple-700 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 dark:text-slate-100"
                  />
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 mt-1 block">
                    When set, a Scan & Pay QR code with the exact bill amount will automatically print on the bottom of customer invoices.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Sales Invoice Prefix
                  </label>
                  <input
                    type="text"
                    name="invoicePrefix"
                    value={formData.invoicePrefix}
                    onChange={handleChange}
                    placeholder="e.g. APD-2425/ or SHPL/"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Company Logo URL
                  </label>
                  <input
                    type="text"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="https://.../logo.png"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Invoice Terms & Conditions
                  </label>
                  <textarea
                    rows={2}
                    name="terms"
                    value={formData.terms}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Authorized Signatory Note
                  </label>
                  <input
                    type="text"
                    name="signature"
                    value={formData.signature}
                    onChange={handleChange}
                    placeholder="e.g. For Apex Pharma Distributors - Authorized Signatory"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer with Previous and Save & Next / Save Company */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/company/company-master')}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              {activeTab !== 'legal' && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* If on Part A, B, or C: Show Save & Next Button */}
              {activeTab !== 'bank' ? (
                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <span>Save & Next</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                /* On Part D (Last step): Show Save Company Button */
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{isEditMode ? 'Save Changes' : 'Save Company'}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default AddCompanyMaster;
