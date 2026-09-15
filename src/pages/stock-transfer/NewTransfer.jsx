import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Trash2, CheckCircle2, AlertCircle, 
  Info, Save, ArrowRightLeft, Database
} from 'lucide-react';

const PRODUCTS_LIST = [
  { name: 'Logitech Wireless Mouse', unit: 'Nos' },
  { name: 'Dell 24" Monitor', unit: 'Nos' },
  { name: 'HDMI Cables 1.5m', unit: 'Nos' },
  { name: 'Keyboards USB', unit: 'Nos' },
  { name: 'USB Hub 4-Port', unit: 'Nos' },
  { name: 'Wireless Keyboard', unit: 'Nos' },
  { name: 'Laptop Stand Metal', unit: 'Nos' },
  { name: 'CAT6 Ethernet Cable 10m', unit: 'Pcs' }
];

const WAREHOUSES_LIST = [
  'Central Warehouse',
  'North Branch Warehouse',
  'East Side Storage'
];

const TRANSFER_REASONS = [
  'Stock Rebalancing',
  'Store Branch Requisition',
  'Temporary Event Setup',
  'Defective Goods Consolidation',
  'Promotional Display Stock'
];

const NewTransfer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Form Fields
  const [transferNo, setTransferNo] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('Pending');

  // Dynamic Product items
  const [items, setItems] = useState([
    { product: '', qty: '', unit: 'Nos', batch: '', serial: '' }
  ]);

  // Load Transfer on Edit
  useEffect(() => {
    const saved = localStorage.getItem('stock_transfers');
    let currentTransfers = saved ? JSON.parse(saved) : [];

    if (isEditMode) {
      const existing = currentTransfers.find(st => st.id === id);
      if (existing) {
        setTransferNo(existing.id);
        setDate(existing.date);
        setFromWarehouse(existing.fromWarehouse);
        setToWarehouse(existing.toWarehouse);
        setReference(existing.reference);
        setReason(existing.reason);
        setRemarks(existing.remarks);
        setStatus(existing.status);
        // Map items back
        setItems(existing.items.map(item => ({
          product: item.product,
          qty: String(item.qty),
          unit: item.unit,
          batch: item.batch || '',
          serial: item.serial || ''
        })));
      } else {
        alert('Stock transfer voucher not found!');
        navigate('/stock-transfer/list');
      }
    } else {
      const nextNum = currentTransfers.length + 1;
      setTransferNo(`ST-2024-${String(nextNum).padStart(3, '0')}`);
    }
  }, [id, isEditMode, navigate]);

  // Calculations
  const totalQty = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);

  // Validations
  const isSameWarehouse = fromWarehouse && toWarehouse && fromWarehouse === toWarehouse;
  const hasEmptyFields = !fromWarehouse || !toWarehouse || !reason || items.some(item => !item.product || !item.qty);
  const isValid = !hasEmptyFields && !isSameWarehouse && totalQty > 0;

  const handleAddRow = () => {
    setItems([...items, { product: '', qty: '', unit: 'Nos', batch: '', serial: '' }]);
  };

  const handleRemoveRow = (idx) => {
    if (items.length <= 1) {
      alert('A stock transfer must contain at least 1 product adjustment.');
      return;
    }
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleRowChange = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    
    // Auto fill default unit if product selected
    if (field === 'product') {
      const prod = PRODUCTS_LIST.find(p => p.name === value);
      if (prod) {
        updated[idx].unit = prod.unit;
      }
    }

    setItems(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!isValid) return;

    const saved = localStorage.getItem('stock_transfers');
    let currentTransfers = saved ? JSON.parse(saved) : [];

    const newTransfer = {
      id: transferNo,
      date,
      fromWarehouse,
      toWarehouse,
      reference,
      reason,
      status,
      items: items.map(item => ({
        product: item.product,
        qty: Number(item.qty),
        unit: item.unit,
        batch: item.batch,
        serial: item.serial
      })),
      totalQty,
      remarks
    };

    if (isEditMode) {
      currentTransfers = currentTransfers.map(st => st.id === transferNo ? newTransfer : st);
    } else {
      currentTransfers.push(newTransfer);
    }

    localStorage.setItem('stock_transfers', JSON.stringify(currentTransfers));
    navigate('/stock-transfer/list');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Go back */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-4 rounded-lg border border-gray-100 dark:border-slate-200 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/stock-transfer/list')}
            className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-850 rounded-full transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-blue-900 dark:text-slate-700 tracking-wide uppercase">
              {isEditMode ? 'Edit Stock Transfer' : 'New Stock Transfer'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Shift warehouse items, check delivery schedules, and generate logistics challans
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Inputs panel */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-6 rounded-lg border border-gray-100 dark:border-slate-200 shadow-sm space-y-4 transition-colors">
            
            {/* Metadata and Warehouses */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Transfer No</label>
                <input 
                  type="text" 
                  value={transferNo}
                  readOnly
                  className="w-full py-2 px-3 bg-gray-100 dark:bg-slate-850 border border-gray-200 dark:border-slate-200 rounded text-xs font-bold text-gray-700 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Transfer Date *</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">From Warehouse *</label>
                <select
                  value={fromWarehouse}
                  onChange={(e) => setFromWarehouse(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Source Warehouse --</option>
                  {WAREHOUSES_LIST.map((wh, wIdx) => (
                    <option key={wIdx} value={wh}>{wh}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">To Warehouse *</label>
                <select
                  value={toWarehouse}
                  onChange={(e) => setToWarehouse(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Destination --</option>
                  {WAREHOUSES_LIST.map((wh, wIdx) => (
                    <option key={wIdx} value={wh}>{wh}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reference & Reason */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Shipping reference</label>
                <input 
                  type="text" 
                  placeholder="Enter logistics tracking or invoice reference..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Transfer Reason *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Choose Reason --</option>
                  {TRANSFER_REASONS.map((r, rIdx) => (
                    <option key={rIdx} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Remarks & Dispatch Comments</label>
              <textarea 
                rows="2"
                placeholder="Enter driver details, vehicle registration details, or packing guidelines..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs text-gray-700 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Products grid */}
            <div className="pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-800 dark:text-slate-700 uppercase tracking-wider">Transfer Items Grid</span>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center gap-1 bg-blue-50 dark:bg-blue-955/30 text-indigo-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-900/40 text-xs font-semibold px-3 py-1.5 rounded transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  Add Product
                </button>
              </div>

              <div className="overflow-x-auto border dark:border-slate-200 rounded">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-855 border-b border-gray-200 dark:border-slate-850 text-gray-700 dark:text-slate-350 font-bold uppercase">
                      <th className="py-2.5 px-3">Product / Item *</th>
                      <th className="py-2.5 px-3 w-32 text-right">Quantity *</th>
                      <th className="py-2.5 px-3 w-24">Unit</th>
                      <th className="py-2.5 px-3 w-32">Batch No</th>
                      <th className="py-2.5 px-3 w-40">Serial Number</th>
                      <th className="py-2.5 px-3 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-150 dark:border-slate-200 hover:bg-gray-50/50 dark:hover:bg-slate-850/30 transition-colors">
                        {/* Product */}
                        <td className="py-2 px-3">
                          <select
                            value={item.product}
                            onChange={(e) => handleRowChange(idx, 'product', e.target.value)}
                            required
                            className="w-full p-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs text-gray-700 dark:text-slate-200 font-medium"
                          >
                            <option value="">-- Choose Product --</option>
                            {PRODUCTS_LIST.map((prod, pIdx) => (
                              <option key={pIdx} value={prod.name}>{prod.name}</option>
                            ))}
                          </select>
                        </td>

                        {/* Quantity */}
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            placeholder="0"
                            value={item.qty}
                            onChange={(e) => handleRowChange(idx, 'qty', e.target.value)}
                            required
                            className="w-full p-1 text-right bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs font-mono text-gray-700 dark:text-slate-200"
                          />
                        </td>

                        {/* Unit */}
                        <td className="py-2 px-3">
                          <select
                            value={item.unit}
                            onChange={(e) => handleRowChange(idx, 'unit', e.target.value)}
                            className="w-full p-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs text-gray-750 dark:text-slate-200"
                          >
                            <option value="Nos">Nos</option>
                            <option value="Pcs">Pcs</option>
                            <option value="Kgs">Kgs</option>
                            <option value="Mtrs">Mtrs</option>
                          </select>
                        </td>

                        {/* Batch Number */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Batch No..."
                            value={item.batch}
                            onChange={(e) => handleRowChange(idx, 'batch', e.target.value)}
                            className="w-full p-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs text-gray-700 dark:text-slate-200 font-mono"
                          />
                        </td>

                        {/* Serial Number */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Serial No..."
                            value={item.serial}
                            onChange={(e) => handleRowChange(idx, 'serial', e.target.value)}
                            className="w-full p-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs text-gray-700 dark:text-slate-200 font-mono"
                          />
                        </td>

                        {/* Delete row */}
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Totals row */}
                    <tr className="bg-slate-50 dark:bg-slate-850 font-bold border-t border-gray-300 dark:border-slate-200 text-gray-800 dark:text-slate-250">
                      <td className="py-3 px-3 text-right uppercase tracking-wider">Total Quantity:</td>
                      <td className="py-3 px-3 text-right font-mono text-indigo-600 dark:text-blue-400">{totalQty}</td>
                      <td colSpan="4" className="py-3 px-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        {/* Validation and Preview panel (Right Column) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Validity Status */}
          <div className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-4 rounded-lg border border-gray-100 dark:border-slate-200 shadow-sm transition-colors">
            <h3 className="text-xs font-bold text-gray-800 dark:text-slate-200 uppercase mb-3 tracking-wider">Validation Checks</h3>
            
            <div className="space-y-3">
              {/* Product and quantity checks */}
              <div className="flex items-start gap-2.5">
                {totalQty > 0 && !hasEmptyFields && !isSameWarehouse ? (
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <div className="text-[11px] font-bold text-gray-700 dark:text-slate-350">Voucher Configuration</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {isSameWarehouse 
                      ? 'Source and Destination warehouses cannot be the same.' 
                      : totalQty > 0 && !hasEmptyFields 
                        ? 'All fields and item configurations are valid.' 
                        : 'Choose source/target warehouses, reason, products, and quantities.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-gray-200 dark:bg-slate-800 my-4"></div>

            {/* Transfer Status options */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Transfer Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full py-2 px-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-200 rounded text-xs text-gray-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="Pending">Pending Dispatch</option>
                <option value="Sent">Dispatched / In Transit</option>
                <option value="Received">Received & Closed</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {/* Error badge for same warehouse */}
            {isSameWarehouse && (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-2.5 rounded border border-red-200 dark:border-red-950/40 text-[11px] mb-4 font-semibold">
                Invalid Route: From and To warehouses must be different locations.
              </div>
            )}

            {/* Save Buttons */}
            <button
              type="submit"
              disabled={!isValid}
              className={`w-full flex items-center justify-center gap-2 text-slate-800 text-xs font-semibold py-2.5 rounded shadow transition-all cursor-pointer
                ${isValid 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-300 dark:bg-slate-800 text-gray-500 dark:text-gray-400 cursor-not-allowed'}`}
            >
              <Save size={14} />
              Save Voucher
            </button>
          </div>

          {/* Stock Ledger Preview (Dual update preview) */}
          <div className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-4 rounded-lg border border-gray-100 dark:border-slate-200 shadow-sm transition-colors">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
              <Database size={14} className="text-blue-500" />
              Stock Ledger Preview
            </div>
            
            <p className="text-[9px] text-gray-400 dark:text-gray-500 mb-3">
              Preview of the dual inter-warehouse stock ledger updates:
            </p>

            <div className="space-y-3">
              {items.map((item, rIdx) => {
                if (!item.product || !item.qty) return null;
                return (
                  <div key={rIdx} className="p-2.5 bg-gray-50 dark:bg-slate-850/50 rounded border dark:border-slate-200 text-[10px] space-y-1.5">
                    <div className="font-bold text-gray-700 dark:text-slate-350 truncate">{item.product}</div>
                    <div className="flex justify-between items-center text-[9px] border-b dark:border-slate-200 pb-1">
                      <span className="text-gray-400">From: {fromWarehouse || '(Choose Source)'}</span>
                      <span className="font-bold text-red-500">- {item.qty} {item.unit}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px]">
                      <span className="text-gray-400">To: {toWarehouse || '(Choose Target)'}</span>
                      <span className="font-bold text-green-600">+ {item.qty} {item.unit}</span>
                    </div>
                  </div>
                );
              })}
              {items.filter(item => item.product).length === 0 && (
                <div className="text-[10px] text-gray-400 text-center py-4">
                  Select products to see simulated ledger adjustments.
                </div>
              )}
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default NewTransfer;
