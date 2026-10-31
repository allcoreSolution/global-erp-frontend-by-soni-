import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CalendarX,
  FileText,
  Search,
  Printer,
  Download,
  Plus,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Package,
  Clock,
  Truck,
  User,
  Building,
  Trash2,
  Filter,
  Eye,
  Check
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-toastify';

const PharmaOperations = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const initialTab = (rawTab === 'traceability' || !rawTab) ? 'quarantine' : rawTab;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ==========================================
  // TAB 1: QUARANTINE & RETURN INSPECTION
  // ==========================================
  const [quarantineItems, setQuarantineItems] = useState([]);
  const [loadingQuarantine, setLoadingQuarantine] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectAction, setInspectAction] = useState('Pass');
  const [inspectorName, setInspectorName] = useState('Amit Sharma (Pharmacist)');
  const [inspectRemarks, setInspectRemarks] = useState('');

  const fetchQuarantine = async () => {
    setLoadingQuarantine(true);
    try {
      const res = await api.get('/pharma/quarantine');
      if (res.data?.success) {
        setQuarantineItems(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching quarantine list:', err);
    } finally {
      setLoadingQuarantine(false);
    }
  };

  const handleOpenInspect = (item, action) => {
    setSelectedInspection(item);
    setInspectAction(action);
    setInspectRemarks(
      action === 'Pass'
        ? 'Physical seal verified intact, strip blister undamaged, expiry verified. Passed quarantine inspection.'
        : 'Packaging broken / vials leaking. Rejected from saleable stock and quarantined for write-off.'
    );
    setInspectModalOpen(true);
  };

  const handleSaveInspection = async () => {
    if (!selectedInspection) return;
    try {
      const res = await api.post(`/pharma/quarantine/${selectedInspection.creditNoteId}/inspect`, {
        action: inspectAction,
        itemIndex: selectedInspection.itemIndex || 0,
        inspectorName,
        inspectionRemarks: inspectRemarks
      });
      if (res.data?.success) {
        toast.success(`Inspection status updated to: ${inspectAction === 'Pass' ? 'PASSED' : 'REJECTED'}`);
        setInspectModalOpen(false);
        fetchQuarantine();
      }
    } catch (err) {
      toast.error('Failed to update quarantine inspection.');
      console.error(err);
    }
  };


  // ==========================================
  // TAB 3: NEAR EXPIRY ALERTS
  // ==========================================
  const [nearExpiryData, setNearExpiryData] = useState({ summary: {}, data: [] });
  const [expiryFilterDays, setExpiryFilterDays] = useState(90);
  const [loadingExpiry, setLoadingExpiry] = useState(false);
  const [expirySearch, setExpirySearch] = useState('');

  const fetchNearExpiry = async () => {
    setLoadingExpiry(true);
    try {
      const res = await api.get(`/pharma/near-expiry?windowDays=${expiryFilterDays}`);
      if (res.data?.success) {
        setNearExpiryData(res.data);
      }
    } catch (err) {
      console.error('Error fetching near expiry items:', err);
    } finally {
      setLoadingExpiry(false);
    }
  };

  // ==========================================
  // TAB 4: DAMAGE & EXPIRY STOCK WRITE-OFF
  // ==========================================
  const [writeOffList, setWriteOffList] = useState([]);
  const [loadingWriteOffs, setLoadingWriteOffs] = useState(false);
  const [writeOffForm, setWriteOffForm] = useState({
    productName: 'Pharma Tablet A - Demo',
    productCode: 'PT-A',
    batchNo: 'PTA-001',
    warehouse: 'Main Pharma Godown',
    quantity: 1,
    cost: 1000,
    lossType: 'Damage Loss',
    reason: 'Breakage during storage and handling',
    note: ''
  });

  const fetchWriteOffs = async () => {
    setLoadingWriteOffs(true);
    try {
      const res = await api.get('/pharma/write-offs');
      if (res.data?.success) {
        setWriteOffList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching write offs:', err);
    } finally {
      setLoadingWriteOffs(false);
    }
  };

  const handleCreateWriteOff = async (e) => {
    e.preventDefault();
    if (!writeOffForm.quantity || Number(writeOffForm.quantity) <= 0) {
      toast.error('Please enter a valid write-off quantity.');
      return;
    }
    try {
      const res = await api.post('/pharma/write-off', writeOffForm);
      if (res.data?.success) {
        toast.success(`Write-off booked successfully (${writeOffForm.lossType}).`);
        fetchWriteOffs();
        // Reset form to defaults
        setWriteOffForm(prev => ({ ...prev, quantity: 1, note: '' }));
      }
    } catch (err) {
      toast.error('Failed to book stock write-off.');
      console.error(err);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchQuarantine();
    fetchNearExpiry();
    fetchWriteOffs();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 space-y-6 font-sans">
      {/* ── TOP HEADER ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                  <ShieldCheck size={20} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Pharma Operations & Compliance Hub
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                  Pharma Wholesale Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 pl-11">
                FDA & Drug Controller Compliance: Quarantine Return Holds, FEFO Near-Expiry Alerts, and Stock Write-Offs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchQuarantine();
                fetchNearExpiry();
                fetchWriteOffs();
                toast.info('Refreshed Pharma Operations data.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs"
            >
              <RotateCcw size={14} /> Refresh
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs"
            >
              <Printer size={14} /> Print Dossier
            </button>
          </div>
        </div>

        {/* ── KPI HIGHLIGHT STRIP ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-lg p-3">
            <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
              <Clock size={13} className="text-amber-600" /> Quarantined Returns
            </div>
            <div className="text-lg font-bold text-amber-900 mt-1">
              {quarantineItems.filter(q => q.status === 'Quarantined').length} Pending Inspection
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/70 rounded-lg p-3">
            <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
              <Package size={13} className="text-blue-600" /> Monitored Batches
            </div>
            <div className="text-lg font-bold text-blue-900 mt-1">
              {nearExpiryData.summary?.totalBatches || 2} Active Batches
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-200/70 rounded-lg p-3">
            <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
              <CalendarX size={13} className="text-rose-600" /> Expiring in 90 Days
            </div>
            <div className="text-lg font-bold text-rose-900 mt-1">
              {nearExpiryData.summary?.expiringIn90d || 0} Batches at Risk
            </div>
          </div>

          <div className="bg-slate-100/70 border border-slate-200/70 rounded-lg p-3">
            <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
              <Trash2 size={13} className="text-slate-600" /> Damaged & Written-Off
            </div>
            <div className="text-lg font-bold text-slate-800 mt-1">
              {writeOffList.length} Recorded Entries
            </div>
          </div>
        </div>
      </div>

      {/* ── MODULE NAVIGATION TABS ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => handleTabChange('quarantine')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'quarantine'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck size={16} />
          1. Quarantine & Return Inspection
          {quarantineItems.filter(q => q.status === 'Quarantined').length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'quarantine' ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800'
            }`}>
              {quarantineItems.filter(q => q.status === 'Quarantined').length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('near-expiry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'near-expiry'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <CalendarX size={16} />
          2. Near-Expiry Alert Screen
        </button>

        <button
          onClick={() => handleTabChange('write-off')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'write-off'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Trash2 size={16} />
          3. Damage & Expiry Stock Write-Off
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: QUARANTINE & RETURN INSPECTION SCREEN */}
      {/* ========================================================================= */}
      {activeTab === 'quarantine' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-amber-600" />
                Customer Return Quarantine Holding & Physical Inspection
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Returned medicines must not enter saleable stock directly. Inspect seal, temperature integrity, and batch authenticity before releasing.
              </p>
            </div>
            <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
              Total Quarantined Entries: <span className="font-bold text-slate-900">{quarantineItems.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Credit Note #</th>
                  <th className="p-3">Return Date</th>
                  <th className="p-3">Customer / Chemist</th>
                  <th className="p-3">Medicine & Batch</th>
                  <th className="p-3 text-right">Return Qty</th>
                  <th className="p-3 text-right">Value (₹)</th>
                  <th className="p-3 text-center">Quarantine Status</th>
                  <th className="p-3">Inspector Notes</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingQuarantine ? (
                  <tr>
                    <td colSpan="9" className="p-6 text-center text-slate-500 italic">
                      Loading quarantine records...
                    </td>
                  </tr>
                ) : quarantineItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-6 text-center text-slate-500 italic">
                      No customer return items in quarantine. All clear!
                    </td>
                  </tr>
                ) : (
                  quarantineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-semibold text-blue-600">{item.creditNoteNo}</td>
                      <td className="p-3 text-slate-600">{item.date}</td>
                      <td className="p-3 font-medium text-slate-800">{item.customer}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{item.product}</div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 mt-0.5">
                          Batch: {item.batch}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">{item.qty} BOX</td>
                      <td className="p-3 text-right font-semibold text-slate-800">
                        ₹ {Number(item.amount || item.qty * item.rate).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'Passed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : item.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                        }`}>
                          {item.status === 'Passed' ? <CheckCircle size={11} /> : item.status === 'Rejected' ? <XCircle size={11} /> : <AlertTriangle size={11} />}
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 max-w-[220px] truncate text-slate-600" title={item.inspectionRemarks}>
                        {item.inspectionRemarks || 'Awaiting quality inspection.'}
                        {item.inspectorName && (
                          <div className="text-[10px] text-slate-400 mt-0.5">By: {item.inspectorName}</div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenInspect(item, 'Pass')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                            title="Pass Inspection and release back to saleable stock"
                          >
                            <Check size={12} /> Pass
                          </button>
                          <button
                            onClick={() => handleOpenInspect(item, 'Reject')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                            title="Reject inspection and mark as damaged stock"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: INSPECT QUARANTINE ITEM ── */}
      {inspectModalOpen && selectedInspection && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className={inspectAction === 'Pass' ? 'text-emerald-600' : 'text-rose-600'} />
                Quality Inspection: {inspectAction === 'Pass' ? 'Pass & Release' : 'Reject Return'}
              </h3>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div><span className="font-semibold text-slate-700">Credit Note:</span> {selectedInspection.creditNoteNo}</div>
              <div><span className="font-semibold text-slate-700">Customer:</span> {selectedInspection.customer}</div>
              <div><span className="font-semibold text-slate-700">Medicine:</span> {selectedInspection.product} ({selectedInspection.qty} BOX)</div>
              <div><span className="font-semibold text-slate-700">Batch Number:</span> <code className="bg-white px-1 py-0.5 rounded border">{selectedInspection.batch}</code></div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inspector / Pharmacist Name</label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Inspection Findings & Remarks</label>
                <textarea
                  rows="3"
                  value={inspectRemarks}
                  onChange={(e) => setInspectRemarks(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInspection}
                className={`px-4 py-1.5 rounded text-xs font-bold text-white shadow-xs ${
                  inspectAction === 'Pass' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {inspectAction}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================================= */}
      {/* TAB 3: NEAR-EXPIRY ALERT SCREEN */}
      {/* ========================================================================= */}
      {activeTab === 'near-expiry' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarX size={18} className="text-rose-600" />
                Near-Expiry Alert & FEFO (First Expiry First Out) Dispatch Tracker
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Proactively monitor medicines nearing expiration. Issue prompt return-to-vendor or prioritize FEFO sales discount to mitigate losses.
              </p>
            </div>

            {/* Window Filter buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Alert Window:</span>
              {[30, 60, 90, 180, 720].map((days) => (
                <button
                  key={days}
                  onClick={() => setExpiryFilterDays(days)}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                    expiryFilterDays === days
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {days === 720 ? 'All' : `< ${days}d`}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by medicine name or batch..."
                value={expirySearch}
                onChange={(e) => setExpirySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b text-slate-600 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">Medicine Name</th>
                  <th className="p-3">Batch No</th>
                  <th className="p-3">Mfg Date</th>
                  <th className="p-3">Expiry Date</th>
                  <th className="p-3 text-center">Days Remaining</th>
                  <th className="p-3 text-right">Available Stock</th>
                  <th className="p-3 text-right">Stock Value at Risk</th>
                  <th className="p-3 text-center">Urgency Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingExpiry ? (
                  <tr><td colSpan="9" className="p-6 text-center text-slate-500 italic">Loading batch expiry records...</td></tr>
                ) : (
                  (nearExpiryData.data || [])
                    .filter(item =>
                      (item.productName || '').toLowerCase().includes(expirySearch.toLowerCase()) ||
                      (item.batchNo || '').toLowerCase().includes(expirySearch.toLowerCase())
                    )
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="p-3 font-semibold text-slate-900">{item.productName}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{item.batchNo}</td>
                        <td className="p-3 text-slate-500">{item.mfgDate}</td>
                        <td className="p-3 font-semibold text-slate-900">{item.expDate}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                            item.daysLeft <= 30
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : item.daysLeft <= 90
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {item.daysLeft > 0 ? `${item.daysLeft} days` : 'EXPIRED'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">{item.stockQty} BOX</td>
                        <td className="p-3 text-right font-semibold text-slate-900">
                          ₹ {Number(item.stockValue).toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {item.urgency}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setWriteOffForm(prev => ({
                                ...prev,
                                productName: item.productName,
                                productCode: item.productCode,
                                batchNo: item.batchNo,
                                cost: item.unitCost,
                                lossType: 'Expiry Loss',
                                reason: `Medicine expiring in ${item.daysLeft} days`
                              }));
                              handleTabChange('write-off');
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-bold"
                          >
                            Mark Write-Off
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DAMAGE & EXPIRY STOCK WRITE-OFF */}
      {/* ========================================================================= */}
      {activeTab === 'write-off' && (
        <div className="space-y-6">
          {/* Write-off Creation Form */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trash2 size={18} className="text-rose-600" />
                Book Damage & Expiry Stock Write-Off
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently removes physical stock from inventory and batches, debiting Damage Loss / Expiry Loss expense ledger.
              </p>
            </div>

            <form onSubmit={handleCreateWriteOff} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product / Medicine Name</label>
                <input
                  type="text"
                  value={writeOffForm.productName}
                  onChange={(e) => setWriteOffForm(prev => ({ ...prev, productName: e.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={writeOffForm.batchNo}
                  onChange={(e) => setWriteOffForm(prev => ({ ...prev, batchNo: e.target.value.toUpperCase() }))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loss Type</label>
                <select
                  value={writeOffForm.lossType}
                  onChange={(e) => setWriteOffForm(prev => ({ ...prev, lossType: e.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 bg-white font-medium"
                >
                  <option value="Damage Loss">Damage Loss (Broken / Leaking)</option>
                  <option value="Expiry Loss">Expiry Loss (Past Expiry Date)</option>
                  <option value="Quarantine Loss">Quarantine Inspection Failure</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse</label>
                <input
                  type="text"
                  value={writeOffForm.warehouse}
                  onChange={(e) => setWriteOffForm(prev => ({ ...prev, warehouse: e.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity to Write Off (BOX)</label>
                <input
                  type="number"
                  min="1"
                  value={writeOffForm.quantity}
                  onChange={(e) => setWriteOffForm(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Cost (₹)</label>
                <input
                  type="number"
                  value={writeOffForm.cost}
                  onChange={(e) => setWriteOffForm(prev => ({ ...prev, cost: e.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={writeOffForm.reason}
                  onChange={(e) => setWriteOffForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-500"
                  placeholder="e.g. Broken in handling / expired on shelf"
                  required
                />
              </div>

              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Book Stock Write-Off
                </button>
              </div>
            </form>
          </div>

          {/* Write-off Historical Records Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText size={16} className="text-slate-600" />
                Historical Write-Off & Damaged Goods Registry
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {writeOffList.length} Entries Logged
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b text-slate-600 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Doc #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Warehouse</th>
                    <th className="p-3">Medicine Name</th>
                    <th className="p-3">Batch No</th>
                    <th className="p-3">Loss Type</th>
                    <th className="p-3 text-right">Written-Off Qty</th>
                    <th className="p-3 text-right">Value Lost (₹)</th>
                    <th className="p-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingWriteOffs ? (
                    <tr><td colSpan="9" className="p-6 text-center text-slate-500 italic">Loading write-off records...</td></tr>
                  ) : writeOffList.length === 0 ? (
                    <tr><td colSpan="9" className="p-6 text-center text-slate-500 italic">No stock write-offs recorded.</td></tr>
                  ) : (
                    writeOffList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-semibold text-rose-600">{item.documentNo}</td>
                        <td className="p-3 text-slate-600">
                          {item.date ? new Date(item.date).toISOString().split('T')[0] : '2026-04-20'}
                        </td>
                        <td className="p-3 text-slate-700">{item.warehouse}</td>
                        <td className="p-3 font-semibold text-slate-900">{item.productName}</td>
                        <td className="p-3 font-mono font-bold text-slate-800">{item.batchNo}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.lossType?.includes('Expiry') ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.lossType}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-rose-700">-{item.quantity} BOX</td>
                        <td className="p-3 text-right font-semibold text-slate-900">
                          ₹ {Number(item.valueLost).toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-600 max-w-[200px] truncate" title={item.reason}>
                          {item.reason}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmaOperations;
