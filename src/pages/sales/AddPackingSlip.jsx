import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Trash2, ArrowLeft, Truck, PackageCheck, RefreshCw,
  Building, User, Phone, MapPin, CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const AddPackingSlip = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for fetched data
  const [salesList, setSalesList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auto-generate clean Packing Slip Number
  const generatePackingNo = () => {
    const today = new Date();
    const yy = today.getFullYear().toString().slice(-2);
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PS-${yy}${mm}${dd}-${rand}`;
  };

  // Form State
  const [packingNo, setPackingNo] = useState(generatePackingNo());
  const [packingDate, setPackingDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Draft');

  // Selected Invoice State
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [selectedSaleData, setSelectedSaleData] = useState(null);

  // Transport & Verification (Optional)
  const [transporter, setTransporter] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [packedBy, setPackedBy] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');
  const [remarks, setRemarks] = useState('');

  // Products from Invoice to pack
  const [productsToPack, setProductsToPack] = useState([]);

  // Fetch initial data (Invoices and Employees)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesRes, empRes] = await Promise.all([
          api.get('/sales').catch(() => ({ data: { data: [] } })),
          api.get('/employees').catch(() => ({ data: { data: [] } }))
        ]);

        const sData = salesRes.data?.data || salesRes.data || [];
        setSalesList(sData);

        const eData = empRes.data?.data || empRes.data || [];
        setEmployees(eData);

        // If navigated with a pre-selected sale
        if (location.state?.saleId) {
          handleSaleSelect(location.state.saleId, sData);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.state]);

  // Handle Invoice Selection (Auto-fill products & customer details)
  const handleSaleSelect = (saleId, customList = null) => {
    setSelectedSaleId(saleId);
    if (!saleId) {
      setSelectedSaleData(null);
      setProductsToPack([]);
      return;
    }

    const list = customList || salesList;
    const sale = list.find(s => s._id === saleId);
    if (sale) {
      setSelectedSaleData(sale);

      const items = (sale.orderItems || sale.items || []).map((item, idx) => ({
        rowId: `pack-${idx}-${Date.now()}`,
        productName: item.name || item.productName || 'Medicine Item',
        productCode: item.code || item.productCode || 'N/A',
        productId: item.product || item.productId || item._id,
        orderedQty: Number(item.quantity) || 1,
        packQty: Number(item.quantity) || 1, // default to full ordered quantity
        batchNo: item.batch || item.batchNo || '-',
        billNo: item.billNo || '-',
        expDate: item.expDate || '-',
        mrp: Number(item.mrp) || 0,
        netUnitPrice: Number(item.netUnitPrice || item.price || item.unitPrice) || 0,
        packagesCount: 1,
        weight: 0
      }));

      setProductsToPack(items);
    }
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...productsToPack];
    updated[index][field] = value;
    setProductsToPack(updated);
  };

  const handleRemoveProduct = (index) => {
    setProductsToPack(productsToPack.filter((_, i) => i !== index));
  };

  // Calculations
  const totalOrderedQty = productsToPack.reduce((sum, p) => sum + (Number(p.orderedQty) || 0), 0);
  const totalPackQty = productsToPack.reduce((sum, p) => sum + (Number(p.packQty) || 0), 0);
  const totalPackages = productsToPack.reduce((sum, p) => sum + (Number(p.packagesCount) || 0), 0);
  const totalWeight = productsToPack.reduce((sum, p) => sum + (Number(p.weight) || 0), 0);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSaleId) {
      Swal.fire('Invoice Required', 'Kripya pehle koi Sale Invoice select karein.', 'warning');
      return;
    }
    if (productsToPack.length === 0) {
      Swal.fire('No Products', 'Packing slip me pack karne ke liye kam se kam ek product hona chahiye.', 'warning');
      return;
    }

    const payload = {
      packingNo: packingNo.trim() || generatePackingNo(),
      packingDate,
      status,
      saleId: selectedSaleId,
      transporter: transporter.trim(),
      vehicleNo: vehicleNo.trim(),
      packedBy: packedBy || undefined,
      verifiedBy: verifiedBy || undefined,
      remarks: remarks.trim(),
      items: productsToPack.map(p => ({
        productName: p.productName,
        productCode: p.productCode,
        productId: p.productId,
        orderedQty: Number(p.orderedQty) || 0,
        packQty: Number(p.packQty) || 0,
        batchNo: p.batchNo || '',
        billNo: p.billNo || '',
        expDate: p.expDate || '',
        packagesCount: Number(p.packagesCount) || 1,
        weight: Number(p.weight) || 0
      }))
    };

    try {
      await api.post('/packing-slips', payload);
      Swal.fire({
        icon: 'success',
        title: 'Packing Slip Created!',
        text: `Packing Slip #${payload.packingNo} successfully create ho gaya hai.`,
        timer: 1800,
        showConfirmButton: false
      });
      navigate('/sales/packing-slip-list');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to save packing slip.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-blue-500 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales/packing-slip-list')}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            title="Back to Packing Slip List"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
              <PackageCheck size={26} className="text-indigo-600" />
              <span>Add Packing Slip</span>
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Invoice select karte hi sabhi products aur unke batch details automatic load ho jayenge.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* PRIMARY DETAILS CARD */}
        <div className="bg-slate-50 p-4 border border-blue-500 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-blue-200 pb-2">
            <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={15} /> Primary Slip Details
            </h2>
            {selectedSaleData && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                <CheckCircle size={12} /> Invoice Loaded: {selectedSaleData.invoiceNo || selectedSaleData.referenceNo}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Select Invoice */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Select Sale Invoice <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSaleId}
                onChange={(e) => handleSaleSelect(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black font-semibold outline-none focus:border-indigo-600"
                required
              >
                <option value="">-- Choose Invoice to Pack --</option>
                {salesList.map(sale => {
                  const invNum = sale.invoiceNo || sale.referenceNo || 'N/A';
                  const custName = sale.customer?.name || (typeof sale.customer === 'string' ? sale.customer : 'Walk-in');
                  const amt = Number(sale.grandTotal || 0).toFixed(2);
                  return (
                    <option key={sale._id} value={sale._id}>
                      {invNum} - {custName} (₹{amt})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Packing Date */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Packing Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="date"
                  value={packingDate}
                  onChange={e => setPackingDate(e.target.value)}
                  className="w-full border border-blue-500 rounded pl-9 pr-3 py-2 text-sm bg-white text-black font-semibold outline-none focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            {/* Packing Slip Number */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-800">
                  Packing Slip No. <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPackingNo(generatePackingNo())}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold"
                >
                  <RefreshCw size={10} /> Auto Gen
                </button>
              </div>
              <input
                type="text"
                value={packingNo}
                onChange={e => setPackingNo(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black font-bold outline-none focus:border-indigo-600"
                placeholder="e.g. PS-261029-1001"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">Packing Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black font-semibold outline-none focus:border-indigo-600"
              >
                <option value="Draft">Draft (Being Packed)</option>
                <option value="Packed">Packed (Ready for Dispatch)</option>
                <option value="Shipped">Shipped (Dispatched)</option>
              </select>
            </div>

          </div>
        </div>

        {/* AUTO-FILLED CUSTOMER & GODOWN BANNER */}
        {selectedSaleData && (
          <div className="bg-indigo-50/50 border border-indigo-200 rounded-lg p-4 animate-in fade-in duration-200">
            <h2 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-indigo-600" /> Invoice & Customer Details (Auto-Loaded)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-2.5 rounded border border-indigo-100 shadow-sm">
                <span className="text-gray-500 font-medium block">Customer</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">
                  {selectedSaleData.customer?.name || (typeof selectedSaleData.customer === 'string' ? selectedSaleData.customer : 'Walk-in Customer')}
                </span>
                <span className="text-gray-500 text-[11px] block mt-0.5">
                  Phone: {selectedSaleData.customer?.phone || selectedSaleData.customerMobile || 'N/A'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded border border-indigo-100 shadow-sm">
                <span className="text-gray-500 font-medium block">Godown / Warehouse</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">
                  {selectedSaleData.warehouse?.name || (typeof selectedSaleData.warehouse === 'string' ? selectedSaleData.warehouse : 'Main Godown')}
                </span>
                <span className="text-gray-500 text-[11px] block mt-0.5">
                  Dispatch Origin Warehouse
                </span>
              </div>

              <div className="bg-white p-2.5 rounded border border-indigo-100 shadow-sm">
                <span className="text-gray-500 font-medium block">Invoice Date</span>
                <span className="font-bold text-gray-900 text-sm block mt-0.5">
                  {selectedSaleData.saleDate || 'N/A'}
                </span>
                <span className="text-indigo-600 font-semibold text-[11px] block mt-0.5">
                  Invoice: {selectedSaleData.invoiceNo || selectedSaleData.referenceNo}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded border border-indigo-100 shadow-sm">
                <span className="text-gray-500 font-medium block">Invoice Total</span>
                <span className="font-black text-gray-900 text-sm block mt-0.5 text-emerald-700">
                  ₹{Number(selectedSaleData.grandTotal || 0).toFixed(2)}
                </span>
                <span className="text-gray-500 text-[11px] block mt-0.5">
                  Payment: <strong className="text-indigo-700">{selectedSaleData.paymentStatus || 'Paid'}</strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TO PACK (AUTO POPULATED FROM INVOICE) */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-blue-500 pb-2">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <PackageCheck size={18} className="text-indigo-600" />
                <span>Products to Pack</span>
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                  {productsToPack.length} Items Loaded
                </span>
              </h2>
            </div>
            {productsToPack.length > 0 && (
              <span className="text-xs text-gray-500 italic">
                * Pack Qty aur Number of Cartons zaroorat ke hisaab se adjust kar sakte hain.
              </span>
            )}
          </div>

          <div className="overflow-x-auto border border-blue-500 rounded-lg shadow-sm">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-100 border-b border-blue-500 text-gray-800">
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-10 text-center">#</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase">Product Details</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-48">Batch & Inward Bill</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-28 text-center">Exp Date</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-24 text-center">Invoiced Qty</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-28 text-center text-indigo-700">Pack Qty *</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-28 text-center">Cartons / Pkgs</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-28 text-center">Weight (kg)</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-14 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500 bg-white">
                {productsToPack.length > 0 ? (
                  productsToPack.map((prod, index) => (
                    <tr key={prod.rowId || index} className="hover:bg-slate-50/80 transition-colors">
                      {/* Index */}
                      <td className="px-3 py-3 text-xs text-center font-bold text-gray-500">
                        {index + 1}
                      </td>

                      {/* Product Name & Code */}
                      <td className="px-3 py-3">
                        <div className="text-sm font-bold text-gray-900">{prod.productName}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          Code: {prod.productCode}
                          {prod.mrp > 0 && <span className="ml-2 font-sans text-gray-600">| MRP: ₹{prod.mrp.toFixed(2)}</span>}
                        </div>
                      </td>

                      {/* Batch & Inward Bill No */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="inline-block bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 text-xs font-bold">
                            Batch: {prod.batchNo || 'N/A'}
                          </span>
                          {prod.billNo && prod.billNo !== '-' && (
                            <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 text-[10px] font-semibold">
                              Inward Bill: {prod.billNo}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="px-3 py-3 text-center text-xs font-semibold text-gray-700">
                        {prod.expDate || '-'}
                      </td>

                      {/* Invoiced Qty */}
                      <td className="px-3 py-3 text-center text-xs text-gray-700 bg-gray-50 font-black">
                        {prod.orderedQty}
                      </td>

                      {/* Pack Qty (Editable) */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number"
                          min="1"
                          max={prod.orderedQty}
                          value={prod.packQty}
                          onChange={e => handleProductChange(index, 'packQty', e.target.value)}
                          className="w-24 border border-blue-500 rounded px-2 py-1 text-sm bg-white text-black text-center outline-none font-black text-indigo-700 focus:border-indigo-600"
                        />
                      </td>

                      {/* Packages / Cartons Count */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={prod.packagesCount}
                          onChange={e => handleProductChange(index, 'packagesCount', e.target.value)}
                          className="w-20 border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black text-center font-bold outline-none focus:border-indigo-600"
                        />
                      </td>

                      {/* Weight (kg) */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={prod.weight}
                          onChange={e => handleProductChange(index, 'weight', e.target.value)}
                          className="w-20 border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black text-center font-bold outline-none focus:border-indigo-600"
                          placeholder="0.00"
                        />
                      </td>

                      {/* Action */}
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Is item ko packing slip se hatayein"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 py-10 text-center text-sm text-gray-500 bg-white">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle size={24} className="text-gray-400" />
                        <span>Kripya upar se koi <strong>Sale Invoice</strong> chunein. Uske sabhi products apne-aap yahan dikhenge.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sub Summary Row */}
          {productsToPack.length > 0 && (
            <div className="flex flex-wrap justify-between items-center gap-4 mt-3 bg-slate-100 p-3 rounded border border-blue-500 text-xs font-bold text-gray-800">
              <div className="text-gray-600">
                Total Products: <span className="text-indigo-700 font-black">{productsToPack.length} items</span>
              </div>
              <div className="flex items-center gap-6">
                <div>Total Invoiced Qty: <span className="text-gray-900 font-black">{totalOrderedQty}</span></div>
                <div>Total Pack Qty: <span className="text-indigo-700 font-black">{totalPackQty}</span></div>
                <div>Total Cartons: <span className="text-indigo-700 font-black">{totalPackages} Boxes</span></div>
                <div>Total Weight: <span className="text-indigo-700 font-black">{totalWeight.toFixed(2)} kg</span></div>
              </div>
            </div>
          )}
        </div>

        {/* LOGISTICS & VERIFICATION (OPTIONAL) */}
        <div className="bg-slate-50 p-4 border border-blue-500 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-blue-200 pb-2">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Truck size={16} className="text-indigo-600" />
              <span>Transport & Verification</span>
              <span className="text-[11px] text-gray-500 font-normal lowercase">(optional - zaroorat ho to bharein)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Transporter Name (Optional)</label>
              <input
                type="text"
                value={transporter}
                onChange={e => setTransporter(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-600"
                placeholder="e.g. DTDC, Blue Dart, Local Tempo"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Vehicle No. (Optional)</label>
              <input
                type="text"
                value={vehicleNo}
                onChange={e => setVehicleNo(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-600"
                placeholder="e.g. UP-32-AB-1234"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Packed By (Optional)</label>
              <select
                value={packedBy}
                onChange={e => setPackedBy(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-600"
              >
                <option value="">Select Employee...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name || emp.employeeName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Verified By (Optional)</label>
              <select
                value={verifiedBy}
                onChange={e => setVerifiedBy(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-600"
              >
                <option value="">Select Supervisor...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name || emp.employeeName}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Remarks / Packing Instructions (Optional)</label>
              <textarea
                rows="2"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-600"
                placeholder="e.g. Fragile glass bottles, 2 cartons total, keep dry..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* SUBMIT ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t border-blue-500 bg-white sticky bottom-0 pb-2">
          <button
            type="button"
            onClick={() => navigate('/sales/packing-slip-list')}
            className="px-6 py-2 border border-blue-500 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow transition-colors flex items-center gap-1.5"
          >
            <PackageCheck size={16} /> Save Packing Slip
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddPackingSlip;
