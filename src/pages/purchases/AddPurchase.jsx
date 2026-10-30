import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const AddPurchase = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // ── Dropdown data ──────────────────────────────
  const [warehousesList, setWarehousesList] = useState([]);
  const [suppliersList, setSuppliersList]   = useState([]);
  const [branchesList, setBranchesList]     = useState([]);
  const [brandsList, setBrandsList]         = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [taxSlabs, setTaxSlabs]             = useState([]);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [whRes, supRes, brRes, brandRes, catRes, prodRes, taxRes] = await Promise.all([
          api.get('/catalogs/warehouses').catch(() => ({ data: { data: [] } })),
          api.get('/suppliers').catch(() => ({ data: { data: [] } })),
          api.get('/branches').catch(() => ({ data: { data: [] } })),
          api.get('/products/brands').catch(() => ({ data: { data: [] } })),
          api.get('/products/categories').catch(() => ({ data: { data: [] } })),
          api.get('/products').catch(() => ({ data: { data: [] } })),
          api.get('/tax-slabs').catch(() => ({ data: { data: [] } })),
        ]);
        setWarehousesList(whRes.data?.data || []);
        setSuppliersList(supRes.data?.data || []);
        setBranchesList(brRes.data?.data || []);
        setBrandsList(brandRes.data?.data || []);
        setCategoriesList(catRes.data?.data || []);
        setTaxSlabs(taxRes.data?.data || []);

        const pData = prodRes.data?.data || prodRes.data || [];
        setProductsCatalog(pData.map(p => ({
          id: p._id,
          name: p.productName || p.name,
          code: p.productCode || p.sku || p.code,
          cost: p.productCost || 0,
          price: p.productPrice || p.salePrice || 0,
          mrp: p.mrp || 0,
          profitMargin: p.profitMargin || 0,
          tax: p.productTax || p.taxRate || 0,
          hsnNumber: p.hsnNumber || '',
          brand: typeof p.brand === 'object' ? p.brand?._id : p.brand,
          category: typeof p.category === 'object' ? p.category?._id : p.category,
          batch: p.batchNo || '',
          mfgDate: p.mfgDate ? new Date(p.mfgDate).toISOString().split('T')[0] : '',
          expDate: p.expDate ? new Date(p.expDate).toISOString().split('T')[0] : '',
        })));
      } catch (err) {
        console.error('Dropdown fetch error:', err);
      }
    };
    fetchDropdowns();
  }, []);

  // Auto-select default warehouse & linked branch on load (if not in edit mode)
  useEffect(() => {
    if (!id && warehousesList.length > 0 && !warehouse) {
      const activeWh = warehousesList.find(w => w.status !== false) || warehousesList[0];
      if (activeWh) {
        setWarehouse(activeWh._id);
        const bId = typeof activeWh.branch === 'object' ? activeWh.branch?._id : activeWh.branch;
        if (bId && !branch) {
          setBranch(bId);
        }
      }
    }
  }, [warehousesList, id]);

  // Fetch Purchase if Edit Mode
  useEffect(() => {
    if (id) {
      const fetchPurchase = async () => {
        try {
          const res = await api.get(`/purchases/${id}`);
          if (res.data.success) {
            const data = res.data.data;
            setPurchaseDate(data.purchaseDate || new Date().toISOString().split('T')[0]);
            setPurchaseType(data.purchaseType || 'Trading Goods');
            setReferenceNo(data.referenceNo || '');
            setInvoiceNo(data.invoiceNo || data.purchaseNo || data.referenceNo || '');
            setBillNo(data.billNo || '');
            setBranch(data.branch?._id || data.branch || '');
            setWarehouse(data.warehouse?._id || data.warehouse || '');
            setSupplier(data.supplier?._id || data.supplier || '');
            setPurchaseStatus(data.purchaseStatus || 'Received');
            setPaymentStatus(data.paymentStatus || 'Due');
            setNote(data.note || '');

            if (data.orderItems && data.orderItems.length > 0) {
              setOrderItems(data.orderItems.map(item => ({
                name: item.name || '',
                code: item.code || '',
                quantity: item.quantity || 1,
                mrp: item.mrp || 0,
                netUnitCost: item.netUnitCost || 0,
                profitMargin: item.profitMargin || (item.netUnitCost > 0 && item.productPrice > 0 ? (((item.productPrice - item.netUnitCost) / item.netUnitCost) * 100).toFixed(1) : 0),
                productPrice: item.productPrice || 0,
                discount: item.discount || 0,
                taxPercent: item.taxPercent || 0,
                batch: item.batch || '',
                freeQty: item.freeQty || 0,
                mfgDate: item.mfgDate ? new Date(item.mfgDate).toISOString().split('T')[0] : '',
                expDate: item.expDate ? new Date(item.expDate).toISOString().split('T')[0] : '',
                hsnNumber: item.hsnNumber || '',
                brand: item.brand || '',
                category: item.category || '',
                customBrand: '',
                customCategory: '',
                warrantyValue: item.warrantyValue || '',
                warrantyUnit: item.warrantyUnit || 'Months',
                guaranteeValue: item.guaranteeValue || '',
                guaranteeUnit: item.guaranteeUnit || 'Months',
                alertQuantity: item.alertQuantity || '0'
              })));
            }
          }
        } catch (err) {
          console.error('Error fetching purchase:', err);
          Swal.fire('Error', 'Failed to fetch purchase details.', 'error');
        }
      };
      fetchPurchase();
    }
  }, [id]);

  // ── Purchase Header ────────────────────────────
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseType, setPurchaseType] = useState('Trading Goods');
  const [invoiceNo, setInvoiceNo]       = useState('');
  const [billNo, setBillNo]             = useState('');
  const [referenceNo, setReferenceNo]   = useState('');
  const [branch, setBranch]             = useState('');
  const [warehouse, setWarehouse]       = useState('');
  const [supplier, setSupplier]         = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState('Received');
  const [paymentStatus, setPaymentStatus]   = useState('Due');
  const [note, setNote]                 = useState('');

  // ── Order Items ────────────────────────────────
  const emptyItem = () => ({
    name: '', code: '', quantity: 1,
    mrp: 0,
    netUnitCost: 0,
    profitMargin: 0,
    productPrice: 0,
    taxPercent: 0, discount: 0,
    batch: '', freeQty: 0, mfgDate: '', expDate: '',
    // Product extra details
    hsnNumber: '', brand: '', category: '',
    customBrand: '', customCategory: '',
    warrantyValue: '', warrantyUnit: 'Months',
    guaranteeValue: '', guaranteeUnit: 'Months',
    alertQuantity: ''
  });

  const [orderItems, setOrderItems] = useState([emptyItem()]);

  const addItem = () => {
    setOrderItems(prev => [...prev, emptyItem()]);
  };

  const removeItem = (idx) =>
    setOrderItems(prev => prev.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) =>
    setOrderItems(prev =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value };

        const cost = parseFloat(field === 'netUnitCost' ? value : updated.netUnitCost) || 0;
        const price = parseFloat(field === 'productPrice' ? value : updated.productPrice) || 0;
        const margin = parseFloat(field === 'profitMargin' ? value : updated.profitMargin) || 0;

        if (field === 'netUnitCost') {
          if (cost > 0 && price > 0) {
            updated.profitMargin = (((price - cost) / cost) * 100).toFixed(1);
          } else if (cost > 0 && margin > 0) {
            updated.productPrice = (cost + (cost * margin / 100)).toFixed(2);
          }
        } else if (field === 'productPrice') {
          if (cost > 0) {
            updated.profitMargin = (((price - cost) / cost) * 100).toFixed(1);
          }
        } else if (field === 'profitMargin') {
          if (cost > 0) {
            updated.productPrice = (cost + (cost * margin / 100)).toFixed(2);
          }
        }

        return updated;
      })
    );

  const handleProductNameSelect = (idx, selectedName) => {
    const existing = productsCatalog.find(p => p.name.toLowerCase() === selectedName.trim().toLowerCase());
    if (existing) {
      setOrderItems(prev => prev.map((item, i) => {
        if (i !== idx) return item;
        const cost = parseFloat(existing.cost) || 0;
        const price = parseFloat(existing.price) || 0;
        const margin = cost > 0 && price > 0 ? (((price - cost) / cost) * 100).toFixed(1) : (existing.profitMargin || 0);
        return {
          ...item,
          name: existing.name,
          code: existing.code || item.code,
          mrp: existing.mrp || 0,
          netUnitCost: cost,
          productPrice: price,
          profitMargin: margin,
          taxPercent: existing.tax || item.taxPercent,
          hsnNumber: existing.hsnNumber || item.hsnNumber,
          brand: existing.brand || item.brand,
          category: existing.category || item.category,
          batch: existing.batch || item.batch,
          mfgDate: existing.mfgDate || item.mfgDate,
          expDate: existing.expDate || item.expDate
        };
      }));
    } else {
      updateItem(idx, 'name', selectedName);
    }
  };

  // ── Totals ─────────────────────────────────────
  const getItemTotal = (item) => {
    const cost = parseFloat(item.netUnitCost) || 0;
    const qty  = parseInt(item.quantity) || 0;
    const disc = parseFloat(item.discount) || 0;
    const tax  = parseFloat(item.taxPercent) || 0;
    const afterDisc = cost - disc;
    return (afterDisc + afterDisc * (tax / 100)) * qty;
  };

  const subTotal   = orderItems.reduce((sum, i) => sum + getItemTotal(i), 0);
  const grandTotal = subTotal;

  // ── Submit ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!warehouse) { Swal.fire('Error', 'Warehouse select karo!', 'error'); return; }
    if (!orderItems[0].name) { Swal.fire('Error', 'Kam se kam ek item add karo!', 'error'); return; }

    try {
      const payload = {
        purchaseDate,
        purchaseType,
        invoiceNo:     invoiceNo.trim(),
        billNo:        billNo.trim(),
        referenceNo:   referenceNo.trim(),
        purchaseNo:    invoiceNo.trim() || billNo.trim() || referenceNo.trim(),
        branch:        branch    || null,
        warehouse:     warehouse || null,
        supplier:      supplier  || null,
        purchaseStatus,
        paymentStatus,
        note,
        grandTotal,
        subTotal,
        orderItems: orderItems.map(item => ({
          name:           item.name,
          code:           item.code,
          quantity:       parseInt(item.quantity)     || 1,
          mrp:            parseFloat(item.mrp)         || 0,
          netUnitCost:    parseFloat(item.netUnitCost) || 0,
          profitMargin:   parseFloat(item.profitMargin) || 0,
          productPrice:   parseFloat(item.productPrice) || 0,
          discount:       parseFloat(item.discount)   || 0,
          taxPercent:     parseFloat(item.taxPercent)  || 0,
          batch:          item.batch          || '',
          freeQty:        parseInt(item.freeQty)      || 0,
          mfgDate:        item.mfgDate        || null,
          expDate:        item.expDate        || null,
          // Product registration details
          hsnNumber:      item.hsnNumber      || '',
          brand:          item.brand === 'Other' ? (item.customBrand || '') : (item.brand || ''),
          category:       item.category === 'Other' ? (item.customCategory || '') : (item.category || ''),
          warrantyValue:  item.warrantyValue  || '',
          warrantyUnit:   item.warrantyUnit   || 'Months',
          guaranteeValue: item.guaranteeValue || '',
          guaranteeUnit:  item.guaranteeUnit  || 'Months',
          alertQuantity:  item.alertQuantity  || '0',
        })),
      };

      let res;
      if (isEditMode) {
        res = await api.put(`/purchases/${id}`, payload);
      } else {
        res = await api.post('/purchases', payload);
      }
      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Purchase Updated! ✅' : 'Purchase Saved! ✅',
          text: res.data.message || 'Maal aagaya, stock update ho gaya!',
          timer: 2500,
          showConfirmButton: false,
        });
        navigate('/purchases/purchase-list');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.message || 'Purchase save nahi hui!', 'error');
    }
  };

  // ── UI ─────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6 text-black">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Add Purchase</h1>
          <p className="text-sm text-gray-500 mt-1">
            Supplier se maal aaya? Record karo — Product automatically register ho jaayega ✅
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/purchases/purchase-list')}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Purchase Details Panel */}
        <div className="bg-white border border-blue-400 rounded-xl p-6 shadow space-y-4">
          <h2 className="text-base font-semibold text-blue-700 border-b border-blue-200 pb-2">
            📋 Purchase Details
          </h2>

          {/* Purchase Type Selector */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3.5">
            <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
              Purchase Classification *
            </label>
            <div className="flex flex-wrap items-center gap-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="radio"
                  name="purchaseType"
                  value="Trading Goods"
                  checked={purchaseType === 'Trading Goods'}
                  onChange={e => setPurchaseType(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                📦 Trading Goods (Inventory Stock)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="radio"
                  name="purchaseType"
                  value="Fixed Asset"
                  checked={purchaseType === 'Fixed Asset'}
                  onChange={e => setPurchaseType(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                🏢 Fixed Asset (Furniture, Computer, Equipment - No Stock Inflation)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="radio"
                  name="purchaseType"
                  value="Expense"
                  checked={purchaseType === 'Expense'}
                  onChange={e => setPurchaseType(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                🧾 Operating Expense / Consumables
              </label>
            </div>
            {purchaseType === 'Fixed Asset' && (
              <p className="mt-2 text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 font-semibold">
                ⚠️ Fixed Asset Mode Active: This purchase will be booked directly to Balance Sheet Fixed Assets and will NOT inflate saleable product stock.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Purchase Date *</label>
              <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Invoice No</label>
              <input type="text" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="e.g. INV-2024-001 (Supplier Bill No)"
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Bill No</label>
              <input type="text" value={billNo} onChange={e => setBillNo(e.target.value)} placeholder="e.g. BILL-001"
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Branch</label>
              <select 
                value={branch} 
                onChange={e => { 
                  const bId = e.target.value;
                  setBranch(bId);
                  if (bId) {
                    const validWh = warehousesList.find(w => w.status !== false && (w.branch?._id === bId || w.branch === bId));
                    if (validWh) {
                      setWarehouse(validWh._id);
                    } else {
                      setWarehouse('');
                    }
                  }
                }}
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">-- All Branches / Select Branch --</option>
                {branchesList.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Warehouse *</label>
              <select 
                value={warehouse} 
                onChange={e => {
                  const whId = e.target.value;
                  setWarehouse(whId);
                  const selWh = warehousesList.find(w => w._id === whId);
                  if (selWh && selWh.branch) {
                    const bId = typeof selWh.branch === 'object' ? selWh.branch._id : selWh.branch;
                    if (bId) setBranch(bId);
                  }
                }} 
                required 
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              >
                <option value="">-- Select Warehouse --</option>
                {(branch 
                  ? warehousesList.filter(w => w.status !== false && (w.branch?._id === branch || w.branch === branch))
                  : warehousesList.filter(w => w.status !== false)
                ).map(w => {
                  const bName = typeof w.branch === 'object' ? w.branch?.name : branchesList.find(b => b._id === w.branch)?.name;
                  return (
                    <option key={w._id} value={w._id}>
                      {w.name} {bName ? `(${bName})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Supplier</label>
              <select value={supplier} onChange={e => setSupplier(e.target.value)}
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">Select Supplier (optional)</option>
                {suppliersList.map(s => <option key={s._id} value={s._id}>{s.companyName || s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Purchase Status</label>
              <select value={purchaseStatus} onChange={e => setPurchaseStatus(e.target.value)}
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300">
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
                <option value="Ordered">Ordered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Payment Status</label>
              <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300">
                <option value="Due">Due (Udhaar)</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

          </div>
        </div>

        {/* Order Items Panel */}
        <div className="bg-white border border-blue-400 rounded-xl p-6 shadow space-y-4">
          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
            <h2 className="text-base font-semibold text-blue-700">📦 Purchase Items</h2>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              <Plus size={14} /> Add New Item Row
            </button>
          </div>

          {/* Datalist for fast product autocomplete */}
          <datalist id="products-catalog-list">
            {productsCatalog.map(p => (
              <option key={p.id || p.code} value={p.name}>
                {p.code} (Cost: ₹{p.cost} | Sale: ₹{p.price})
              </option>
            ))}
          </datalist>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50 text-gray-600 text-xs uppercase whitespace-nowrap">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left min-w-36">Product Name *</th>
                  <th className="p-2 text-left min-w-24">Code *</th>
                  <th className="p-2 text-left min-w-24">HSN</th>
                  <th className="p-2 text-left min-w-28">Batch No</th>
                  <th className="p-2 text-left min-w-28">Exp Date</th>
                  <th className="p-2 text-left min-w-32">Brand</th>
                  <th className="p-2 text-left min-w-32">Category</th>
                  <th className="p-2 text-center min-w-20">Alert Qty</th>
                  <th className="p-2 text-left min-w-32">Warranty</th>
                  <th className="p-2 text-left min-w-32">Guarantee</th>
                  <th className="p-2 text-center">Qty *</th>
                  <th className="p-2 text-center min-w-16">Free Qty</th>
                  <th className="p-2 text-right">MRP (₹)</th>
                  <th className="p-2 text-right bg-indigo-50 text-indigo-700 font-semibold">Cost (₹) *</th>
                  <th className="p-2 text-center bg-emerald-50 text-emerald-700 font-semibold">Margin %</th>
                  <th className="p-2 text-right bg-blue-50 text-blue-700 font-semibold">Sale Price (₹)</th>
                  <th className="p-2 text-right">Tax %</th>
                  <th className="p-2 text-right">Disc (₹)</th>
                  <th className="p-2 text-right">Total (₹)</th>
                  <th className="p-2 text-center">Del</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-2 text-gray-400 text-xs">{idx + 1}</td>
                    
                    {/* Name with autocomplete */}
                    <td className="p-2">
                      <input 
                        type="text" 
                        list="products-catalog-list"
                        value={item.name} 
                        placeholder="e.g. Paracetamol 650mg" 
                        required
                        onChange={e => handleProductNameSelect(idx, e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400 font-medium" />
                    </td>

                    {/* Code */}
                    <td className="p-2">
                      <input type="text" value={item.code} placeholder="e.g. TN001" required
                        onChange={e => updateItem(idx, 'code', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400" />
                    </td>

                    {/* HSN */}
                    <td className="p-2">
                      <input type="text" value={item.hsnNumber} placeholder="e.g. 0101"
                        onChange={e => updateItem(idx, 'hsnNumber', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400" />
                    </td>

                    {/* Batch No */}
                    <td className="p-2 min-w-28">
                      <input type="text" value={item.batch} placeholder="e.g. B-0426-01"
                        onChange={e => updateItem(idx, 'batch', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400" />
                    </td>

                    {/* Exp Date */}
                    <td className="p-2 min-w-28">
                      <input type="date" value={item.expDate}
                        onChange={e => updateItem(idx, 'expDate', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400" />
                    </td>

                    {/* Brand */}
                    <td className="p-2 min-w-32">
                      {item.brand === 'Other' ? (
                        <div className="flex items-center gap-1">
                          <input type="text" value={item.customBrand || ''} onChange={e => updateItem(idx, 'customBrand', e.target.value)} placeholder="New Brand" className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400" required />
                          <button type="button" onClick={() => { updateItem(idx, 'brand', ''); updateItem(idx, 'customBrand', ''); }} className="text-red-500 text-xs px-1 font-bold">X</button>
                        </div>
                      ) : (
                        <select value={item.brand} onChange={e => updateItem(idx, 'brand', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400">
                          <option value="">-- Brand --</option>
                          {brandsList.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                          <option value="Other">Other</option>
                        </select>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-2 min-w-32">
                      {item.category === 'Other' ? (
                        <div className="flex items-center gap-1">
                          <input type="text" value={item.customCategory || ''} onChange={e => updateItem(idx, 'customCategory', e.target.value)} placeholder="New Category" className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400" required />
                          <button type="button" onClick={() => { updateItem(idx, 'category', ''); updateItem(idx, 'customCategory', ''); }} className="text-red-500 text-xs px-1 font-bold">X</button>
                        </div>
                      ) : (
                        <select value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400">
                          <option value="">-- Category --</option>
                          {categoriesList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                          <option value="Other">Other</option>
                        </select>
                      )}
                    </td>

                    {/* Alert Qty */}
                    <td className="p-2">
                      <input type="number" min="0" value={item.alertQuantity} placeholder="e.g. 10"
                        onChange={e => updateItem(idx, 'alertQuantity', e.target.value)}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center outline-none focus:border-blue-400" />
                    </td>

                    {/* Warranty */}
                    <td className="p-2">
                      <div className="flex gap-1">
                        <input type="number" min="0" value={item.warrantyValue} placeholder="12"
                          onChange={e => updateItem(idx, 'warrantyValue', e.target.value)}
                          className="w-14 border border-gray-300 rounded px-1 py-1 text-sm text-center outline-none focus:border-blue-400" />
                        <select value={item.warrantyUnit} onChange={e => updateItem(idx, 'warrantyUnit', e.target.value)}
                          className="w-20 border border-gray-300 rounded px-1 py-1 text-xs outline-none focus:border-blue-400">
                          <option>Months</option><option>Years</option><option>Days</option>
                        </select>
                      </div>
                    </td>

                    {/* Guarantee */}
                    <td className="p-2">
                      <div className="flex gap-1">
                        <input type="number" min="0" value={item.guaranteeValue} placeholder="6"
                          onChange={e => updateItem(idx, 'guaranteeValue', e.target.value)}
                          className="w-14 border border-gray-300 rounded px-1 py-1 text-sm text-center outline-none focus:border-blue-400" />
                        <select value={item.guaranteeUnit} onChange={e => updateItem(idx, 'guaranteeUnit', e.target.value)}
                          className="w-20 border border-gray-300 rounded px-1 py-1 text-xs outline-none focus:border-blue-400">
                          <option>Months</option><option>Years</option><option>Days</option>
                        </select>
                      </div>
                    </td>

                    {/* Qty */}
                    <td className="p-2">
                      <input type="number" min="1" value={item.quantity} required
                        onChange={e => updateItem(idx, 'quantity', e.target.value)}
                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center outline-none focus:border-blue-400" />
                    </td>

                    {/* Free Qty */}
                    <td className="p-2">
                      <input type="number" min="0" value={item.freeQty || 0} placeholder="0"
                        onChange={e => updateItem(idx, 'freeQty', e.target.value)}
                        className="w-16 border border-gray-300 rounded px-1.5 py-1 text-sm text-center outline-none focus:border-blue-400" />
                    </td>

                    {/* MRP */}
                    <td className="p-2">
                      <input type="number" min="0" step="0.01" value={item.mrp || ''} placeholder="MRP"
                        onChange={e => updateItem(idx, 'mrp', e.target.value)}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right outline-none focus:border-blue-400 font-mono" />
                    </td>

                    {/* Purchase Cost */}
                    <td className="p-2 bg-indigo-50/40">
                      <input type="number" min="0" step="0.01" value={item.netUnitCost} required placeholder="Cost"
                        onChange={e => updateItem(idx, 'netUnitCost', e.target.value)}
                        className="w-24 border border-indigo-300 rounded px-2 py-1 text-sm text-right outline-none focus:border-indigo-500 font-semibold text-indigo-900" />
                    </td>

                    {/* Margin % */}
                    <td className="p-2 bg-emerald-50/40">
                      <div className="flex items-center gap-1 justify-center">
                        <input type="number" step="0.1" value={item.profitMargin || ''} placeholder="0"
                          onChange={e => updateItem(idx, 'profitMargin', e.target.value)}
                          className={`w-16 border rounded px-1.5 py-1 text-xs text-center font-bold outline-none ${
                            Number(item.profitMargin) > 0 
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700' 
                              : Number(item.profitMargin) < 0 
                                ? 'border-red-300 bg-red-50 text-red-600' 
                                : 'border-gray-200 text-gray-500'
                          }`} />
                        <span className="text-[10px] text-gray-400 font-semibold">%</span>
                      </div>
                    </td>

                    {/* Sale Price */}
                    <td className="p-2 bg-blue-50/40">
                      <input type="number" min="0" step="0.01" value={item.productPrice || ''} placeholder="Sale Price"
                        onChange={e => updateItem(idx, 'productPrice', e.target.value)}
                        className="w-24 border border-blue-300 rounded px-2 py-1 text-sm text-right outline-none focus:border-blue-500 font-semibold text-blue-900" />
                    </td>

                    {/* Tax */}
                    <td className="p-2 min-w-24">
                      <select value={item.taxPercent}
                        onChange={e => updateItem(idx, 'taxPercent', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400">
                        <option value={0}>0%</option>
                        {taxSlabs.map(tax => (
                          <option key={tax._id} value={tax.rate}>{tax.name} ({tax.rate}%)</option>
                        ))}
                      </select>
                    </td>

                    {/* Discount */}
                    <td className="p-2">
                      <input type="number" min="0" step="0.01" value={item.discount}
                        onChange={e => updateItem(idx, 'discount', e.target.value)}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right outline-none focus:border-blue-400" />
                    </td>

                    {/* Total */}
                    <td className="p-2 text-right font-semibold text-green-700 whitespace-nowrap">
                      ₹{getItemTotal(item).toFixed(2)}
                    </td>

                    {/* Delete */}
                    <td className="p-2 text-center">
                      {orderItems.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4 border-t border-blue-100">
            <div className="w-56 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sub Total:</span>
                <span className="font-medium">₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span className="text-blue-700">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-white border border-blue-400 rounded-xl p-4 shadow">
          <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Note (Optional)</label>
          <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Koi note likhna ho toh..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-400" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pb-6">
          <button type="button" onClick={() => navigate('/purchases/purchase-list')}
            className="px-5 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Save size={16} /> {isEditMode ? 'Update Purchase' : 'Save Purchase'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddPurchase;
