import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, FileText, ArrowLeft, Truck, User, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const AddChallan = () => {
  const navigate = useNavigate();

  // Primary states
  const [salesList, setSalesList] = useState([]);
  const [packingSlips, setPackingSlips] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [couriers, setCouriers] = useState([]);

  const [form, setForm] = useState({
    challanNo: '', challanDate: new Date().toISOString().split('T')[0], challanType: 'Delivery',
    salesOrder: '', invoiceNo: '', packingSlip: '',
    customer: '', contactPerson: '', mobileNo: '', billingAddress: '', shippingAddress: '', sameAsBilling: false,
    items: [],
    transportMode: 'Road', transporter: '', vehicleNo: '', driverName: '', driverMobile: '', lrGrNo: '', ewayBillNo: '', dispatchDate: '', expectedDate: '',
    deliveryStatus: 'Pending', receivedBy: '', deliveryDate: '', deliveryRemarks: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, packingRes, custRes, prodRes, courierRes] = await Promise.all([
          api.get('/sales'),
          api.get('/packing-slips'),
          api.get('/customers'),
          api.get('/products'),
          api.get('/couriers')
        ]);
        setSalesList(salesRes.data?.data || salesRes.data || []);
        setPackingSlips(packingRes.data?.data || packingRes.data || []);
        setCustomers(custRes.data?.data || custRes.data || []);
        setProducts(prodRes.data?.data || prodRes.data || []);
        setCouriers(courierRes.data?.data || courierRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
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
    const courier = couriers.find(c => c.name === val);
    
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

  const handleReferenceSelect = (type, id) => {
    setForm(prev => ({ ...prev, [type]: id }));
    if (!id) return;

    if (type === 'invoiceNo') {
      const sale = salesList.find(s => s._id === id);
      if (sale) {
        const custId = sale.customer?._id || sale.customer;
        const cust = customers.find(c => c._id === custId) || sale.customer;
        
        setForm(prev => ({
          ...prev,
          packingSlip: '', // Clear packing slip since invoice changed
          customer: custId || '',
          contactPerson: cust?.name || '',
          mobileNo: cust?.phone || '',
          billingAddress: cust?.address || '',
          shippingAddress: prev.sameAsBilling ? (cust?.address || '') : prev.shippingAddress,
          items: sale.orderItems?.map(item => ({
            product: item.product?._id || item.product,
            productName: item.name || item.product?.productName || '',
            sku: item.code || '',
            batch: '',
            qty: item.quantity || 1,
            unit: 'PCS',
            rate: item.netUnitPrice || 0
          })) || []
        }));
      }
    } else if (type === 'packingSlip') {
      const slip = packingSlips.find(p => p._id === id);
      if (slip && slip.saleId) {
        const saleId = typeof slip.saleId === 'object' ? slip.saleId._id : slip.saleId;
        const sale = salesList.find(s => s._id === saleId) || slip.saleId;
        const custId = sale?.customer?._id || sale?.customer;
        const cust = customers.find(c => c._id === custId) || sale?.customer || {};
        
        setForm(prev => ({
          ...prev,
          invoiceNo: saleId || '', // Auto-select the corresponding invoice
          customer: custId || '',
          contactPerson: cust?.name || '',
          mobileNo: cust?.phone || '',
          billingAddress: cust?.address || '',
          shippingAddress: prev.sameAsBilling ? (cust?.address || '') : prev.shippingAddress,
          items: (slip.items || slip.products || []).map(item => ({
            product: item.productId?._id || item.productId || item.product,
            productName: item.productName || item.productId?.productName || '',
            sku: item.code || '',
            batch: '',
            qty: item.packQty || item.qty || 1,
            unit: 'PCS',
            rate: 0
          })) || []
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
        updatedItems[index].sku = prod.productCode;
        updatedItems[index].rate = prod.salesPrice || 0;
      }
    }
    setForm(prev => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { product: '', sku: '', batch: '', qty: 1, unit: 'PCS', rate: 0 }]
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

    // Custom Validations
    if (!form.customer) {
      return Swal.fire('Validation Error', 'Please select a Customer / Party.', 'warning');
    }
    if (!form.billingAddress && !form.shippingAddress) {
      return Swal.fire('Validation Error', 'Please provide at least a Billing or Shipping Address for delivery.', 'warning');
    }
    if (form.items.length === 0) {
      return Swal.fire('Validation Error', 'Please add at least one product/item to the challan.', 'warning');
    }
    const hasInvalidItem = form.items.some(item => !item.product || Number(item.qty) <= 0);
    if (hasInvalidItem) {
      return Swal.fire('Validation Error', 'All items must have a valid product selected and quantity greater than 0.', 'warning');
    }
    if (!form.transporter && !form.vehicleNo) {
      return Swal.fire('Validation Error', 'Please provide either Transporter Name or Vehicle No. for tracking.', 'warning');
    }

    try {
      const payload = {
        ...form,
        challanNo: form.challanNo || `CH-${Math.floor(100000 + Math.random() * 900000)}`,
        salesOrder: form.salesOrder || `ORD-${Math.floor(100000 + Math.random() * 900000)}`
      };
      await api.post('/challans', payload);
      await Swal.fire('Success', 'Challan created successfully', 'success');
      navigate('/sales/challan-list');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to create challan: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const totalQty = form.items.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0);
  const totalAmount = form.items.reduce((acc, curr) => acc + ((Number(curr.qty) || 0) * (Number(curr.rate) || 0)), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/sales/challan-list')} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
          <ArrowLeft size={18} /> Back to Challan List
        </button>
        <div className="flex gap-2">
           <button type="button" onClick={() => navigate('/sales/challan-list')} className="px-4 py-2 border border-slate-300 bg-white rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
             Cancel
           </button>
           <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
             <Save size={16} /> Save Challan
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-50/50 p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText size={26} className="text-indigo-600" />
            Create New Challan
          </h1>
          <p className="text-sm text-slate-500 mt-1">Generate a delivery challan or stock transfer document.</p>
        </div>

        <form className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50/30 p-4 border border-blue-100 rounded-lg">
              <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">Basic Info & Links</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Challan Date *</label>
                  <input type="date" name="challanDate" value={form.challanDate} onChange={handleChange} className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Challan Type *</label>
                  <select name="challanType" value={form.challanType} onChange={handleChange} className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450" required>
                    <option value="Delivery">Delivery</option>
                    <option value="Stock Transfer">Stock Transfer</option>
                    <option value="Returnable">Returnable</option>
                    <option value="Non-Returnable">Non-Returnable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select Invoice</label>
                  <select value={form.invoiceNo} onChange={(e) => handleReferenceSelect('invoiceNo', e.target.value)} className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450">
                    <option value="">-- Link Invoice --</option>
                    {salesList
                      .filter(sale => !form.customer || (sale.customer?._id || sale.customer) === form.customer)
                      .map(sale => (
                      <option key={sale._id} value={sale._id}>{sale.invoiceNo || sale.referenceNo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Link Packing Slip</label>
                  <select value={form.packingSlip} onChange={(e) => handleReferenceSelect('packingSlip', e.target.value)} className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450">
                    <option value="">-- Or link Slip --</option>
                    {packingSlips
                      .filter(slip => {
                        const slipSaleId = typeof slip.saleId === 'object' ? slip.saleId?._id : slip.saleId;
                        const slipSale = salesList.find(s => s._id === slipSaleId);
                        const custId = slipSale?.customer?._id || slipSale?.customer;
                        
                        if (form.invoiceNo && slipSaleId !== form.invoiceNo) return false;
                        if (form.customer && custId !== form.customer) return false;
                        return true;
                      })
                      .map(slip => (
                      <option key={slip._id} value={slip._id}>{slip.packingNo || slip.reference || `PS (${slip.saleId?.invoiceNo || '-'})`}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/30 p-4 border border-blue-100 rounded-lg">
              <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">Party Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Customer / Party *</label>
                  <select name="customer" value={form.customer} onChange={handleChange} className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450" required>
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name || c.customerName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Person</label>
                  <input type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange} className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile No.</label>
                  <input type="text" name="mobileNo" value={form.mobileNo} onChange={handleChange} className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Billing Address *</label>
                  <textarea name="billingAddress" value={form.billingAddress} onChange={handleChange} rows="1" className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450"></textarea>
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Shipping Address</label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer font-semibold">
                      <input type="checkbox" name="sameAsBilling" checked={form.sameAsBilling} onChange={handleSameAsBilling} className="rounded border-blue-500 text-indigo-600 focus:ring-indigo-500" />
                      Same as Billing
                    </label>
                  </div>
                  <textarea name="shippingAddress" value={form.shippingAddress} onChange={handleChange} rows="1" disabled={form.sameAsBilling} className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white outline-none focus:border-blue-450 disabled:bg-gray-100"></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* ITEM DETAILS */}
          <div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-800">Item Details</h2>
              <button type="button" onClick={handleAddItem} className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold border border-indigo-200 hover:border-indigo-300 bg-indigo-50 px-3 py-1.5 rounded transition-colors">
                + Add Row
              </button>
            </div>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left bg-white text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700 w-1/3">Product</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 w-32">SKU</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 w-24">Qty</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 w-24">Unit</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 w-32">Rate</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 w-32">Amount</th>
                    <th className="px-4 py-3 text-center w-16">Act</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {form.items.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                        No items added. Auto-fill from an invoice/slip or add manually.
                      </td>
                    </tr>
                  ) : (
                    form.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="p-2">
                          <select 
                            value={item.product} 
                            onChange={e => handleItemChange(index, 'product', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1.5 focus:border-indigo-500 outline-none"
                          >
                            <option value="">Select Product</option>
                            {products.map(p => (
                              <option key={p._id} value={p._id}>{p.productName}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2"><input type="text" value={item.sku} onChange={e => handleItemChange(index, 'sku', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5" placeholder="SKU" /></td>
                        <td className="p-2"><input type="number" min="1" value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5" /></td>
                        <td className="p-2">
                          <select value={item.unit} onChange={e => handleItemChange(index, 'unit', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5">
                            <option value="PCS">PCS</option>
                            <option value="BOX">BOX</option>
                            <option value="KG">KG</option>
                          </select>
                        </td>
                        <td className="p-2"><input type="number" min="0" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5" /></td>
                        <td className="p-2 font-bold text-slate-700 bg-slate-50/80">₹ {((Number(item.qty) || 0) * (Number(item.rate) || 0)).toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"><X size={16} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end mt-4 text-sm gap-6">
              <div className="flex items-center gap-2"><span className="text-slate-500">Total Qty:</span><span className="font-bold text-lg">{totalQty}</span></div>
              <div className="flex items-center gap-2"><span className="text-slate-500">Total Amount:</span><span className="font-bold text-lg text-indigo-700">₹ {totalAmount.toFixed(2)}</span></div>
            </div>
          </div>

          {/* TRANSPORT & DELIVERY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200 pt-8">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><Truck size={18} className="text-slate-400"/> Transport Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mode *</label>
                  <select name="transportMode" value={form.transportMode} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option value="Road">Road</option>
                    <option value="Rail">Rail</option>
                    <option value="Air">Air</option>
                    <option value="Sea">Sea</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transporter *</label>
                  <input list="transporters" type="text" name="transporter" value={form.transporter} onChange={handleTransporterChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" placeholder="Name" />
                  <datalist id="transporters">
                    {couriers.map(c => <option key={c._id} value={c.name} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle No. *</label>
                  <input type="text" name="vehicleNo" value={form.vehicleNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" placeholder="UP32AB1234" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">LR / GR No.</label>
                  <input type="text" name="lrGrNo" value={form.lrGrNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-Way Bill</label>
                  <input type="text" name="ewayBillNo" value={form.ewayBillNo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dispatch Date</label>
                  <input type="date" name="dispatchDate" value={form.dispatchDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><User size={18} className="text-slate-400"/> Delivery Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Status</label>
                  <select name="deliveryStatus" value={form.deliveryStatus} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Date</label>
                  <input type="date" name="expectedDate" value={form.expectedDate} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                  <textarea name="deliveryRemarks" value={form.deliveryRemarks} onChange={handleChange} rows="3" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" placeholder="Notes..."></textarea>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChallan;
