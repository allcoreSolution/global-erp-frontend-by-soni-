import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, X, FileText, ArrowLeft, Truck, User, Calendar, RefreshCw,
  CheckCircle, AlertCircle, Plus, Trash2, PackageCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const AddChallan = () => {
  const navigate = useNavigate();

  // Primary lists
  const [salesList, setSalesList] = useState([]);
  const [packingSlips, setPackingSlips] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to generate clean Challan No
  const generateChallanNo = () => {
    const today = new Date();
    const yy = today.getFullYear().toString().slice(-2);
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CH-${yy}${mm}${dd}-${rand}`;
  };

  const [form, setForm] = useState({
    challanNo: generateChallanNo(),
    challanDate: new Date().toISOString().split('T')[0],
    challanType: 'Delivery',
    salesOrder: '',
    invoiceNo: '',
    packingSlip: '',
    customer: '',
    customerName: '',
    contactPerson: '',
    mobileNo: '',
    billingAddress: '',
    shippingAddress: '',
    sameAsBilling: true,
    items: [],
    transportMode: 'Road',
    transporter: '',
    vehicleNo: '',
    driverName: '',
    driverMobile: '',
    lrGrNo: '',
    ewayBillNo: '',
    dispatchDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    deliveryStatus: 'Pending',
    receivedBy: '',
    deliveryDate: '',
    deliveryRemarks: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesRes, packingRes, custRes, prodRes, courierRes] = await Promise.all([
          api.get('/sales').catch(() => ({ data: { data: [] } })),
          api.get('/packing-slips').catch(() => ({ data: { data: [] } })),
          api.get('/customers').catch(() => ({ data: { data: [] } })),
          api.get('/products').catch(() => ({ data: { data: [] } })),
          api.get('/couriers').catch(() => ({ data: { data: [] } }))
        ]);
        setSalesList(salesRes.data?.data || salesRes.data || []);
        setPackingSlips(packingRes.data?.data || packingRes.data || []);
        setCustomers(custRes.data?.data || custRes.data || []);
        setProducts(prodRes.data?.data || prodRes.data || []);
        setCouriers(courierRes.data?.data || courierRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTransporterChange = (e) => {
    const val = e.target.value;
    const courier = couriers.find(c => c.name === val || c.courierName === val);
    
    if (courier) {
      setForm(prev => ({
        ...prev,
        transporter: val,
        transportMode: courier.deliveryMode || prev.transportMode,
        vehicleNo: courier.defaultVehicleNo || prev.vehicleNo,
        driverName: courier.defaultDriverName || prev.driverName,
        driverMobile: courier.defaultDriverMobile || prev.driverMobile,
      }));
    } else {
      setForm(prev => ({ ...prev, transporter: val }));
    }
  };

  // Handle Invoice / Packing Slip Selection (Full Auto-populate trigger)
  const handleReferenceSelect = (type, id) => {
    setForm(prev => ({ ...prev, [type]: id }));
    if (!id) return;

    if (type === 'invoiceNo') {
      const sale = salesList.find(s => s._id === id);
      if (sale) {
        const custId = sale.customer?._id || (typeof sale.customer === 'string' ? sale.customer : '');
        const cust = customers.find(c => c._id === custId) || (typeof sale.customer === 'object' ? sale.customer : {});
        const custName = cust?.name || cust?.customerName || (typeof sale.customer === 'string' ? sale.customer : 'Walk-in Customer');
        const custMobile = cust?.phone || cust?.mobileNumber || sale.customerMobile || '';
        const custAddress = cust?.address || cust?.billingAddress?.street || (cust?.city ? `${cust.city}, ${cust.state || ''}` : '') || 'Counter / Local Delivery';

        const autoItems = (sale.orderItems || sale.items || []).map((item, idx) => ({
          rowId: `item-${idx}-${Date.now()}`,
          product: item.product?._id || item.product || item._id,
          productName: item.name || item.productName || 'Medicine Item',
          sku: item.code || item.productCode || item.sku || 'N/A',
          batch: item.batch || item.batchNo || '-',
          billNo: item.billNo || '-',
          expDate: item.expDate || '-',
          qty: Number(item.quantity) || 1,
          unit: item.unit || 'PCS',
          rate: Number(item.netUnitPrice || item.price || item.unitPrice) || 0
        }));

        setForm(prev => ({
          ...prev,
          invoiceNo: id,
          salesOrder: sale.referenceNo || sale.invoiceNo || prev.salesOrder,
          customer: custId || prev.customer,
          customerName: custName,
          contactPerson: custName,
          mobileNo: custMobile,
          billingAddress: custAddress,
          shippingAddress: custAddress,
          sameAsBilling: true,
          items: autoItems
        }));
      }
    } else if (type === 'packingSlip') {
      const slip = packingSlips.find(p => p._id === id);
      if (slip) {
        const saleId = typeof slip.saleId === 'object' ? slip.saleId._id : slip.saleId;
        const sale = salesList.find(s => s._id === saleId) || (typeof slip.saleId === 'object' ? slip.saleId : null);
        const custId = sale?.customer?._id || (typeof sale?.customer === 'string' ? sale.customer : '');
        const cust = customers.find(c => c._id === custId) || (typeof sale?.customer === 'object' ? sale.customer : {});
        const custName = cust?.name || cust?.customerName || (typeof sale?.customer === 'string' ? sale.customer : 'Walk-in Customer');
        const custMobile = cust?.phone || sale?.customerMobile || '';
        const custAddress = cust?.address || cust?.billingAddress?.street || (cust?.city ? `${cust.city}, ${cust.state || ''}` : '') || 'Counter / Local Delivery';

        const autoItems = (slip.items || slip.products || []).map((item, idx) => ({
          rowId: `slip-item-${idx}-${Date.now()}`,
          product: item.productId?._id || item.productId || item.product,
          productName: item.productName || item.productId?.productName || 'Medicine Item',
          sku: item.productCode || item.code || item.sku || 'N/A',
          batch: item.batchNo || item.batch || '-',
          billNo: item.billNo || '-',
          expDate: item.expDate || '-',
          qty: Number(item.packQty || item.quantity || item.qty) || 1,
          unit: item.unit || 'PCS',
          rate: Number(item.rate || item.netUnitPrice || item.price) || 0
        }));

        setForm(prev => ({
          ...prev,
          packingSlip: id,
          invoiceNo: saleId || prev.invoiceNo,
          salesOrder: sale?.invoiceNo || slip.packingNo || prev.salesOrder,
          transporter: slip.transporter || prev.transporter,
          vehicleNo: slip.vehicleNo || prev.vehicleNo,
          customer: custId || prev.customer,
          customerName: custName,
          contactPerson: custName,
          mobileNo: custMobile,
          billingAddress: custAddress,
          shippingAddress: custAddress,
          sameAsBilling: true,
          items: autoItems.length > 0 ? autoItems : prev.items
        }));
      }
    }
  };

  const handleSameAsBilling = (e) => {
    const checked = e.target.checked;
    setForm(prev => ({
      ...prev,
      sameAsBilling: checked,
      shippingAddress: checked ? prev.billingAddress : prev.shippingAddress
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];
    updatedItems[index][field] = value;
    if (field === 'product') {
      const prod = products.find(p => p._id === value);
      if (prod) {
        updatedItems[index].productName = prod.productName;
        updatedItems[index].sku = prod.productCode || prod.sku || 'N/A';
        updatedItems[index].rate = prod.salesPrice || prod.price || 0;
        updatedItems[index].unit = prod.unit || 'PCS';
      }
    }
    setForm(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          rowId: `custom-${Date.now()}`,
          product: '',
          productName: '',
          sku: '',
          batch: '',
          billNo: '',
          expDate: '',
          qty: 1,
          unit: 'PCS',
          rate: 0
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customer && !form.customerName) {
      return Swal.fire('Customer Required', 'Kripya Customer / Party chunein ya Invoice link karein.', 'warning');
    }
    if (form.items.length === 0) {
      return Swal.fire('No Items', 'Challan me kam se kam ek product hona chahiye.', 'warning');
    }

    try {
      const payload = {
        ...form,
        challanNo: form.challanNo.trim() || generateChallanNo(),
        salesOrder: form.salesOrder || `SO-${Date.now().toString().slice(-6)}`,
        billingAddress: form.billingAddress || 'Counter / Store Pickup',
        shippingAddress: form.shippingAddress || form.billingAddress || 'Counter / Store Pickup',
        transporter: form.transporter || 'Self / Local Road',
        vehicleNo: form.vehicleNo || '-'
      };

      await api.post('/challans', payload);
      await Swal.fire({
        icon: 'success',
        title: 'Challan Created!',
        text: `Delivery Challan #${payload.challanNo} successfully create ho gaya hai.`,
        timer: 1800,
        showConfirmButton: false
      });
      navigate('/sales/challan-list');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to create challan: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const totalQty = form.items.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
  const totalAmount = form.items.reduce((acc, curr) => acc + ((Number(curr.qty) || 0) * (Number(curr.rate) || 0)), 0);

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-blue-500 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales/challan-list')}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            title="Back to Challan List"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
              <FileText size={26} className="text-indigo-600" />
              <span>Create Delivery Challan</span>
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Invoice select karte hi customer details, products, batch, aur rate automatic load ho jayenge.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/sales/challan-list')}
            className="px-4 py-1.5 border border-blue-500 bg-white rounded text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 transition-colors shadow flex items-center gap-1.5"
          >
            <Save size={15} /> Save Challan
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* TOP SECTION: BASIC INFO & INVOICE / PACKING SLIP LINK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Card 1: Reference & Challan Details */}
          <div className="bg-slate-50 p-4 border border-blue-500 rounded-lg shadow-sm">
            <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 border-b border-blue-200 pb-1.5 flex items-center justify-between">
              <span>Primary Challan Details</span>
              {form.invoiceNo && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                  <CheckCircle size={10} /> Invoice Linked
                </span>
              )}
            </h2>

            <div className="grid grid-cols-2 gap-4">

              {/* Select Invoice */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Select Sale Invoice <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.invoiceNo}
                  onChange={(e) => handleReferenceSelect('invoiceNo', e.target.value)}
                  className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black font-semibold outline-none focus:border-indigo-600"
                >
                  <option value="">-- Link Sale Invoice --</option>
                  {salesList.map(sale => {
                    const invNo = sale.invoiceNo || sale.referenceNo;
                    const cName = sale.customer?.name || (typeof sale.customer === 'string' ? sale.customer : 'Walk-in');
                    const amt = Number(sale.grandTotal || 0).toFixed(2);
                    return (
                      <option key={sale._id} value={sale._id}>
                        {invNo} - {cName} (₹{amt})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Link Packing Slip (Optional) */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Link Packing Slip (Optional)
                </label>
                <select
                  value={form.packingSlip}
                  onChange={(e) => handleReferenceSelect('packingSlip', e.target.value)}
                  className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-indigo-600"
                >
                  <option value="">-- Or Link Packing Slip --</option>
                  {packingSlips.map(slip => (
                    <option key={slip._id} value={slip._id}>
                      {slip.packingNo || slip.reference || 'Packing Slip'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Challan No */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-800">
                    Challan No. <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, challanNo: generateChallanNo() }))}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold"
                  >
                    <RefreshCw size={10} /> Auto Gen
                  </button>
                </div>
                <input
                  type="text"
                  name="challanNo"
                  value={form.challanNo}
                  onChange={handleChange}
                  className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black font-bold outline-none focus:border-indigo-600"
                  required
                />
              </div>

              {/* Challan Date */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Challan Date *</label>
                <input
                  type="date"
                  name="challanDate"
                  value={form.challanDate}
                  onChange={handleChange}
                  className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black font-semibold outline-none focus:border-indigo-600"
                  required
                />
              </div>

              {/* Challan Type */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Challan Type</label>
                <select
                  name="challanType"
                  value={form.challanType}
                  onChange={handleChange}
                  className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-indigo-600"
                >
                  <option value="Delivery">Delivery (Normal Maal Dispatch)</option>
                  <option value="Stock Transfer">Stock Transfer (Branch / Godown Transfer)</option>
                  <option value="Returnable">Returnable (Demo / Testing Maal)</option>
                  <option value="Non-Returnable">Non-Returnable</option>
                </select>
              </div>

            </div>
          </div>

          {/* Card 2: Party & Customer Details (Auto-filled) */}
          <div className="bg-slate-50 p-4 border border-blue-500 rounded-lg shadow-sm">
            <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3 border-b border-blue-200 pb-1.5 flex items-center gap-1.5">
              <User size={14} className="text-indigo-600" />
              <span>Customer & Delivery Address</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-800 mb-1">Customer / Party Name *</label>
                <select
                  name="customer"
                  value={form.customer}
                  onChange={(e) => {
                    const custId = e.target.value;
                    const cust = customers.find(c => c._id === custId);
                    setForm(prev => ({
                      ...prev,
                      customer: custId,
                      customerName: cust?.name || cust?.customerName || '',
                      contactPerson: cust?.contactPerson || cust?.name || '',
                      mobileNo: cust?.phone || cust?.mobileNumber || prev.mobileNo,
                      billingAddress: cust?.address || cust?.billingAddress?.street || prev.billingAddress,
                      shippingAddress: prev.sameAsBilling ? (cust?.address || prev.billingAddress) : prev.shippingAddress
                    }));
                  }}
                  className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black font-semibold outline-none focus:border-indigo-600"
                  required
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c._id} value={c._id}>{c.name || c.customerName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-indigo-600"
                  placeholder="Person Name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile No.</label>
                <input
                  type="text"
                  name="mobileNo"
                  value={form.mobileNo}
                  onChange={handleChange}
                  className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-indigo-600"
                  placeholder="+91..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Billing Address</label>
                <textarea
                  name="billingAddress"
                  value={form.billingAddress}
                  onChange={handleChange}
                  rows="1"
                  className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-indigo-600"
                  placeholder="Billing address..."
                ></textarea>
              </div>

              <div className="col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-gray-700">Shipping / Delivery Address</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-gray-600 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      name="sameAsBilling"
                      checked={form.sameAsBilling}
                      onChange={handleSameAsBilling}
                      className="rounded border-blue-500 text-indigo-600"
                    />
                    Same as Billing
                  </label>
                </div>
                <textarea
                  name="shippingAddress"
                  value={form.shippingAddress}
                  onChange={handleChange}
                  rows="1"
                  disabled={form.sameAsBilling}
                  className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-indigo-600 disabled:bg-gray-100"
                  placeholder="Delivery address..."
                ></textarea>
              </div>
            </div>
          </div>

        </div>

        {/* ITEM DETAILS TABLE (AUTO-FILLED FROM INVOICE) */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-blue-500 pb-2">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <PackageCheck size={18} className="text-indigo-600" />
                <span>Challan Item Details</span>
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                  {form.items.length} Items Loaded
                </span>
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold border border-blue-500 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add Extra Row
            </button>
          </div>

          <div className="overflow-x-auto border border-blue-500 rounded-lg shadow-sm">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-100 border-b border-blue-500 text-gray-800">
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-10 text-center">#</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase">Product Name & SKU</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-48">Batch & Inward Bill</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-24 text-center">Exp Date</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-24 text-center">Qty</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-24 text-center">Unit</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-28 text-right">Rate (₹)</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-32 text-right">Amount (₹)</th>
                  <th className="px-3 py-2.5 text-xs font-bold uppercase w-14 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500 bg-white">
                {form.items.length > 0 ? (
                  form.items.map((item, index) => {
                    const rowAmount = (Number(item.qty) || 0) * (Number(item.rate) || 0);

                    return (
                      <tr key={item.rowId || index} className="hover:bg-slate-50/80 transition-colors">
                        {/* Index */}
                        <td className="px-3 py-3 text-xs text-center font-bold text-gray-500">
                          {index + 1}
                        </td>

                        {/* Product Name & SKU */}
                        <td className="px-3 py-3">
                          <div className="text-sm font-bold text-gray-900">{item.productName || 'Select Product'}</div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            SKU / Code: {item.sku || 'N/A'}
                          </div>
                        </td>

                        {/* Batch & Inward Bill No */}
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="inline-block bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 text-xs font-bold">
                              Batch: {item.batch || 'N/A'}
                            </span>
                            {item.billNo && item.billNo !== '-' && (
                              <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 text-[10px] font-semibold">
                                Bill No: {item.billNo}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Exp Date */}
                        <td className="px-3 py-3 text-center text-xs font-semibold text-gray-700">
                          {item.expDate || '-'}
                        </td>

                        {/* Qty */}
                        <td className="px-3 py-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => handleItemChange(index, 'qty', e.target.value)}
                            className="w-20 border border-blue-500 rounded px-2 py-1 text-sm bg-white text-black text-center font-black text-indigo-700 outline-none focus:border-indigo-600"
                          />
                        </td>

                        {/* Unit */}
                        <td className="px-3 py-3 text-center">
                          <select
                            value={item.unit}
                            onChange={e => handleItemChange(index, 'unit', e.target.value)}
                            className="border border-blue-500 rounded px-1.5 py-1 text-xs bg-white text-black font-semibold outline-none focus:border-indigo-600"
                          >
                            <option value="PCS">PCS</option>
                            <option value="BOX">BOX</option>
                            <option value="STRIP">STRIP</option>
                            <option value="BTL">BTL</option>
                            <option value="KG">KG</option>
                          </select>
                        </td>

                        {/* Rate */}
                        <td className="px-3 py-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.rate}
                            onChange={e => handleItemChange(index, 'rate', e.target.value)}
                            className="w-24 border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black text-right font-semibold outline-none focus:border-indigo-600"
                          />
                        </td>

                        {/* Amount */}
                        <td className="px-3 py-3 text-right text-sm font-black text-gray-900 bg-slate-50/50">
                          ₹{rowAmount.toFixed(2)}
                        </td>

                        {/* Action */}
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 py-10 text-center text-sm text-gray-500 bg-white">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle size={24} className="text-gray-400" />
                        <span>Kripya upar se koi <strong>Sale Invoice</strong> chunein. Uske sabhi products apne-aap yahan load ho jayenge.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sub Summary Row */}
          {form.items.length > 0 && (
            <div className="flex flex-wrap justify-between items-center gap-4 mt-3 bg-slate-100 p-3 rounded border border-blue-500 text-xs font-bold text-gray-800">
              <div className="text-gray-600">
                Total Line Items: <span className="text-indigo-700 font-black">{form.items.length} products</span>
              </div>
              <div className="flex items-center gap-6">
                <div>Total Challan Qty: <span className="text-indigo-700 font-black text-sm">{totalQty}</span></div>
                <div>Total Challan Value: <span className="text-emerald-700 font-black text-sm">₹{totalAmount.toFixed(2)}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* TRANSPORT & DELIVERY DETAILS (CLEAN & OPTIONAL) */}
        <div className="bg-slate-50 p-4 border border-blue-500 rounded-lg shadow-sm">
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 border-b border-blue-200 pb-1.5 flex items-center gap-2">
            <Truck size={16} className="text-indigo-600" />
            <span>Transport & Logistics Details (गाड़ी व ट्रांसपोर्टर की जानकारी)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Transport Mode */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Transport Mode</label>
              <select
                name="transportMode"
                value={form.transportMode}
                onChange={handleChange}
                className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black font-semibold outline-none focus:border-indigo-600"
              >
                <option value="Road">Road (सड़क मार्ग - Tempo / Van)</option>
                <option value="Rail">Rail (रेल मार्ग)</option>
                <option value="Air">Air (हवाई जहाज / Courier)</option>
                <option value="Sea">Sea (जल मार्ग)</option>
              </select>
            </div>

            {/* Transporter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Transporter / Courier</label>
              <input
                list="transporters-list"
                type="text"
                name="transporter"
                value={form.transporter}
                onChange={handleTransporterChange}
                className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-indigo-600"
                placeholder="e.g. DTDC, Blue Dart, Local Tempo"
              />
              <datalist id="transporters-list">
                {couriers.map(c => (
                  <option key={c._id} value={c.name || c.courierName} />
                ))}
              </datalist>
            </div>

            {/* Vehicle No */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Vehicle No. (गाड़ी नंबर)
              </label>
              <input
                type="text"
                name="vehicleNo"
                value={form.vehicleNo}
                onChange={handleChange}
                className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black font-bold outline-none focus:border-indigo-600"
                placeholder="e.g. UP32AB1234"
              />
            </div>

            {/* LR / GR No */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                LR / GR No. (बिल्टी नंबर)
              </label>
              <input
                type="text"
                name="lrGrNo"
                value={form.lrGrNo}
                onChange={handleChange}
                className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black font-bold outline-none focus:border-indigo-600"
                placeholder="e.g. LR-90901"
              />
            </div>

            {/* Driver Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Driver Name</label>
              <input
                type="text"
                name="driverName"
                value={form.driverName}
                onChange={handleChange}
                className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-indigo-600"
                placeholder="Driver Name"
              />
            </div>

            {/* Driver Mobile */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Driver Mobile</label>
              <input
                type="text"
                name="driverMobile"
                value={form.driverMobile}
                onChange={handleChange}
                className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-indigo-600"
                placeholder="+91..."
              />
            </div>

            {/* E-way Bill No */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">E-Way Bill No.</label>
              <input
                type="text"
                name="ewayBillNo"
                value={form.ewayBillNo}
                onChange={handleChange}
                className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-indigo-600"
                placeholder="e.g. EWB-101010"
              />
            </div>

            {/* Delivery Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Status</label>
              <select
                name="deliveryStatus"
                value={form.deliveryStatus}
                onChange={handleChange}
                className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black font-semibold outline-none focus:border-indigo-600"
              >
                <option value="Pending">Pending (Not Dispatched)</option>
                <option value="In-Transit">In-Transit (गाड़ी रास्ते में है)</option>
                <option value="Delivered">Delivered (पहुँच गया)</option>
                <option value="Returned">Returned (वापस आ गया)</option>
              </select>
            </div>

            {/* Delivery Remarks */}
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Instructions / Remarks</label>
              <textarea
                name="deliveryRemarks"
                rows="2"
                value={form.deliveryRemarks}
                onChange={handleChange}
                className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-indigo-600"
                placeholder="e.g. Deliver before 5 PM, Handle with care, Cold chain..."
              ></textarea>
            </div>

          </div>
        </div>

        {/* SUBMIT ACTIONS FOOTER */}
        <div className="flex justify-end gap-3 pt-4 border-t border-blue-500 bg-white sticky bottom-0 pb-2">
          <button
            type="button"
            onClick={() => navigate('/sales/challan-list')}
            className="px-6 py-2 border border-blue-500 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow transition-colors flex items-center gap-1.5"
          >
            <Save size={16} /> Save Challan
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddChallan;
