import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const AddPurchase = () => {
  const navigate = useNavigate();

  // ── Dropdown data ──────────────────────────────
  const [warehousesList, setWarehousesList] = useState([]);
  const [suppliersList, setSuppliersList]   = useState([]);
  const [branchesList, setBranchesList]     = useState([]);
  const [brandsList, setBrandsList]         = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [whRes, supRes, brRes, brandRes, catRes] = await Promise.all([
          api.get('/catalogs/warehouses').catch(() => ({ data: { data: [] } })),
          api.get('/suppliers').catch(() => ({ data: { data: [] } })),
          api.get('/branches').catch(() => ({ data: { data: [] } })),
          api.get('/products/brands').catch(() => ({ data: { data: [] } })),
          api.get('/products/categories').catch(() => ({ data: { data: [] } })),
        ]);
        setWarehousesList(whRes.data?.data || []);
        setSuppliersList(supRes.data?.data || []);
        setBranchesList(brRes.data?.data || []);
        setBrandsList(brandRes.data?.data || []);
        setCategoriesList(catRes.data?.data || []);
      } catch (err) {
        console.error('Dropdown fetch error:', err);
      }
    };
    fetchDropdowns();
  }, []);

  // ── Purchase Header ────────────────────────────
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
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
    netUnitCost: 0, productPrice: 0,
    taxPercent: 0, discount: 0,
    // Product extra details
    hsnNumber: '', brand: '', category: '',
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
        // Auto-calculate sale price (25% margin) when cost changes
        if (field === 'netUnitCost') {
          const cost = parseFloat(value) || 0;
          updated.productPrice = parseFloat((cost * 1.25).toFixed(2));
        }
        return updated;
      })
    );

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
        referenceNo,
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
          quantity:       parseInt(item.quantity),
          netUnitCost:    parseFloat(item.netUnitCost),
          productPrice:   parseFloat(item.productPrice),
          discount:       parseFloat(item.discount)   || 0,
          taxPercent:     parseFloat(item.taxPercent)  || 0,
          // Product registration details
          hsnNumber:      item.hsnNumber      || '',
          brand:          item.brand          || '',
          category:       item.category       || '',
          warrantyValue:  item.warrantyValue  || '',
          warrantyUnit:   item.warrantyUnit   || 'Months',
          guaranteeValue: item.guaranteeValue || '',
          guaranteeUnit:  item.guaranteeUnit  || 'Months',
          alertQuantity:  item.alertQuantity  || '0',
        })),
      };

      const res = await api.post('/purchases', payload);
      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Purchase Saved! ✅',
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Purchase Date *</label>
              <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Reference No</label>
              <input type="text" value={referenceNo} onChange={e => setReferenceNo(e.target.value)} placeholder="e.g. PUR-001 (optional)"
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Branch</label>
              <select value={branch} onChange={e => { setBranch(e.target.value); setWarehouse(''); }}
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">Select Branch (optional)</option>
                {branchesList.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Warehouse *</label>
              <select 
                value={warehouse} 
                onChange={e => setWarehouse(e.target.value)} 
                required 
                disabled={!branch}
                className="w-full border border-blue-400 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <option value="">{branch ? "-- Select Warehouse --" : "-- Pehle Branch Select Karein --"}</option>
                {warehousesList
                  .filter(w => w.status !== false && (w.branch?._id === branch || w.branch === branch))
                  .map(w => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))
                }
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
              <Plus size={14} /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50 text-gray-600 text-xs uppercase whitespace-nowrap">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left min-w-36">Product Name *</th>
                  <th className="p-2 text-left min-w-24">Code *</th>
                  <th className="p-2 text-left min-w-24">HSN</th>
                  <th className="p-2 text-left min-w-32">Brand</th>
                  <th className="p-2 text-left min-w-32">Category</th>
                  <th className="p-2 text-center min-w-20">Alert Qty</th>
                  <th className="p-2 text-left min-w-32">Warranty</th>
                  <th className="p-2 text-left min-w-32">Guarantee</th>
                  <th className="p-2 text-center">Qty *</th>
                  <th className="p-2 text-right">Cost (₹) *</th>
                  <th className="p-2 text-right">Sale (₹)</th>
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
                    
                    {/* Name */}
                    <td className="p-2">
                      <input type="text" value={item.name} placeholder="e.g. Tata Namak" required
                        onChange={e => updateItem(idx, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400" />
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

                    {/* Brand */}
                    <td className="p-2 min-w-32">
                      <select value={item.brand} onChange={e => updateItem(idx, 'brand', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400">
                        <option value="">-- Brand --</option>
                        {brandsList.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        <option value="Other">Other</option>
                      </select>
                    </td>

                    {/* Category */}
                    <td className="p-2 min-w-32">
                      <select value={item.category} onChange={e => updateItem(idx, 'category', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-400">
                        <option value="">-- Category --</option>
                        {categoriesList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        <option value="Other">Other</option>
                      </select>
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

                    {/* Cost */}
                    <td className="p-2">
                      <input type="number" min="0" step="0.01" value={item.netUnitCost} required
                        onChange={e => updateItem(idx, 'netUnitCost', e.target.value)}
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-right outline-none focus:border-blue-400" />
                    </td>

                    {/* Sale Price */}
                    <td className="p-2">
                      <input type="number" min="0" step="0.01" value={item.productPrice}
                        onChange={e => updateItem(idx, 'productPrice', e.target.value)}
                        className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-right outline-none focus:border-blue-400" />
                    </td>

                    {/* Tax */}
                    <td className="p-2">
                      <input type="number" min="0" max="100" value={item.taxPercent}
                        onChange={e => updateItem(idx, 'taxPercent', e.target.value)}
                        className="w-14 border border-gray-300 rounded px-2 py-1 text-sm text-right outline-none focus:border-blue-400" />
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
            <Save size={16} /> Save Purchase
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddPurchase;
