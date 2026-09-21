import React, { useState, useEffect } from 'react';
import { 
  Calendar, Info, Plus, Search, Trash2, Upload, HelpCircle 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import DynamicSelect from '../../components/DynamicSelect';

const AddPurchase = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  // Mock Data lists
  const warehouses = ['Central Warehouse', 'North Branch Warehouse', 'East Side Storage'];
  const suppliers = ['Apple Global Corp', 'Dell Trading Co', 'Logitech Distribution Pvt Ltd', 'HP India Logistics'];
  const currencies = ['INR', 'USD', 'EUR', 'GBP'];
  const [productsCatalog, setProductsCatalog] = useState([]);

  // States
  const [purchaseDate, setPurchaseDate] = useState('2026-08-13');
  const [referenceNo, setReferenceNo] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [supplier, setSupplier] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('30');
  const [dueDate, setDueDate] = useState('2026-09-12');
  const [purchaseStatus, setPurchaseStatus] = useState('Received');
  const [currency, setCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState('1');
  const [documentFile, setDocumentFile] = useState(null);

  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  // Footer Calculation variables
  const [orderTax, setOrderTax] = useState('No Tax'); // e.g. 5%, 10%, 18%, No Tax
  const [discountValue, setDiscountValue] = useState('0');
  const [shippingCost, setShippingCost] = useState('0.00');
  const [paymentStatus, setPaymentStatus] = useState('Due');
  const [note, setNote] = useState('');

  // Handle Search Input
  const handleProductSearch = (e) => {
    const val = e.target.value;
    setProductSearch(val);
    if (val.trim() === '') {
      setSearchResults([]);
      return;
    }
    const filtered = productsCatalog.filter(p => 
      p.name.toLowerCase().includes(val.toLowerCase()) || 
      p.code.toLowerCase().includes(val.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // Add Item to Order Table
  const handleSelectItem = (prod) => {
    const exists = orderItems.find(item => item.code === prod.code);
    if (exists) {
      setOrderItems(orderItems.map(item => 
        item.code === prod.code ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setOrderItems([...orderItems, {
        name: prod.name,
        code: prod.code,
        quantity: 1,
        netUnitCost: prod.cost,
        profitMargin: 20, // 20% margin default
        profitMarginType: 'Percentage',
        productPrice: prod.price,
        discount: 0,
        taxPercent: prod.tax,
      }]);
    }
    setProductSearch('');
    setSearchResults([]);
  };

  // Live calculation updates
  const handleQtyChange = (code, val) => {
    const num = Math.max(1, Number(val));
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, quantity: num } : item
    ));
  };

  const handleCostChange = (code, val) => {
    const cost = Math.max(0, Number(val));
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, netUnitCost: cost } : item
    ));
  };

  const handleMarginChange = (code, val) => {
    const margin = Number(val);
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, profitMargin: margin } : item
    ));
  };

  const handleMarginTypeChange = (code, val) => {
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, profitMarginType: val } : item
    ));
  };

  const handlePriceChange = (code, val) => {
    const price = Math.max(0, Number(val));
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, productPrice: price } : item
    ));
  };

  const handleDiscountChange = (code, val) => {
    const disc = Math.max(0, Number(val));
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, discount: disc } : item
    ));
  };

  const handleTaxPercentChange = (code, val) => {
    const tx = Math.max(0, Number(val));
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, taxPercent: tx } : item
    ));
  };

  const handleDeleteItem = (code) => {
    setOrderItems(orderItems.filter(item => item.code !== code));
  };

  // Math conversions
  const getSubtotal = (item) => {
    // Net Cost after individual discount + tax
    const rawCost = item.netUnitCost - item.discount;
    const taxAmt = rawCost * (item.taxPercent / 100);
    return (rawCost + taxAmt) * item.quantity;
  };

  // Summaries Calculations
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsCount = orderItems.length;
  
  const rawSubTotal = orderItems.reduce((sum, item) => {
    return sum + (item.netUnitCost * item.quantity);
  }, 0);

  const totalCalculatedSubTotal = orderItems.reduce((sum, item) => sum + getSubtotal(item), 0);

  // Global Order Tax Calculation
  let orderTaxPercent = 0;
  if (orderTax === '5%') orderTaxPercent = 5;
  else if (orderTax === '10%') orderTaxPercent = 10;
  else if (orderTax === '18%') orderTaxPercent = 18;
  const calculatedGlobalTax = totalCalculatedSubTotal * (orderTaxPercent / 100);

  // Grand Total calculation
  const calculatedGrandTotal = totalCalculatedSubTotal + calculatedGlobalTax + Number(shippingCost) - Number(discountValue);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const prodRes = await api.get('/products');
        const pData = prodRes.data?.data || prodRes.data || [];
        setProductsCatalog(pData.map(p => ({
          id: p._id,
          name: p.productName || p.name,
          code: p.productCode || p.sku || p.code,
          cost: p.purchasePrice || p.productPrice || p.price || 0,
          tax: p.productTax || p.taxRate || 0,
          price: p.productPrice || p.salePrice || p.price || 0
        })));
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };
    fetchCatalogs();

    if (id) {
      const fetchPurchase = async () => {
        try {
          const { data } = await api.get(`/purchases/${id}`);
          if (data.success && data.data) {
            const p = data.data;
            setPurchaseDate(p.purchaseDate || '');
            setReferenceNo(p.referenceNo || '');
            setWarehouse(p.warehouse || '');
            setSupplier(p.supplier || '');
            setPaymentTerm(p.paymentTerm || '');
            setDueDate(p.dueDate || '');
            setPurchaseStatus(p.purchaseStatus || 'Received');
            setCurrency(p.currency || 'INR');
            setExchangeRate(p.exchangeRate || '1');
            setPaymentStatus(p.paymentStatus || 'Due');
            setOrderTax(p.orderTax || 'No Tax');
            setDiscountValue(p.discountValue || 0);
            setShippingCost(p.shippingCost || 0);
            setNote(p.note || '');
            if (p.orderItems && p.orderItems.length > 0) {
              setOrderItems(p.orderItems.map(item => ({
                name: item.name,
                code: item.code,
                quantity: item.quantity,
                netUnitCost: item.netUnitCost,
                profitMargin: item.profitMargin,
                profitMarginType: item.profitMarginType,
                productPrice: item.productPrice,
                discount: item.discount,
                taxPercent: item.taxPercent
              })));
            }
          }
        } catch (error) {
          console.error('Error fetching purchase', error);
        }
      };
      fetchPurchase();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!warehouse) {
      alert("Please select Warehouse.");
      return;
    }
    
    try {
      const payload = {
        purchaseDate,
        referenceNo,
        warehouse,
        supplier,
        paymentTerm,
        dueDate,
        purchaseStatus,
        paymentStatus,
        currency,
        exchangeRate,
        orderTax,
        discountValue: Number(discountValue) || 0,
        shippingCost: Number(shippingCost) || 0,
        note,
        orderItems: orderItems.map(item => ({
          name: item.name,
          code: item.code,
          quantity: Number(item.quantity) || 1,
          netUnitCost: Number(item.netUnitCost) || 0,
          profitMargin: Number(item.profitMargin) || 0,
          profitMarginType: item.profitMarginType,
          productPrice: Number(item.productPrice) || 0,
          discount: Number(item.discount) || 0,
          taxPercent: Number(item.taxPercent) || 0
        }))
      };

      if (id) {
        await api.put(`/purchases/${id}`, payload);
        alert('Purchase updated successfully!');
      } else {
        await api.post('/purchases', payload);
        alert(`Purchase Order Submited Successfully!\nGrand Total: INR ${calculatedGrandTotal.toFixed(2)}`);
      }
      navigate('/purchases/purchase-list');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error processing purchase');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header */}
      <div className="mb-6 border-b border-blue-500 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-black">Add Purchase</h1>
        <p className="text-sm text-gray-500 mt-1">The field labels marked with * are required input fields.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Purchase Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 pl-9 text-sm bg-white text-black outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Reference No */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Reference No</label>
            <input 
              type="text"
              placeholder="e.g. PR-1290382"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-400"
            />
          </div>

          {/* Warehouse Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Warehouse *</label>
            <DynamicSelect category="Warehouse" name="warehouse" value={warehouse} onChange={(e) => setWarehouse(e.target.value)} />
          </div>

          {/* Supplier Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Supplier</label>
            <DynamicSelect category="Supplier" name="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>

          {/* Payment Term */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Payment Term (Days)</label>
            <input 
              type="number"
              placeholder="e.g. 30"
              value={paymentTerm}
              onChange={(e) => setPaymentTerm(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-400"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Choose Due Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 pl-9 text-sm bg-white text-black outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Purchase Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Purchase Status</label>
            <DynamicSelect category="PurchaseStatus" name="purchaseStatus" value={purchaseStatus} onChange={(e) => setPurchaseStatus(e.target.value)} />
          </div>

          {/* Attach Document File Chooser */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Attach Document</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3.5 py-2 border border-blue-500 rounded cursor-pointer hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors">
                <Upload size={14} className="text-gray-500" />
                <span>Choose File</span>
                <input 
                  type="file" 
                  onChange={(e) => setDocumentFile(e.target.files[0])}
                  className="hidden" 
                />
              </label>
              <span className="text-xs text-gray-500 truncate max-w-[150px]">
                {documentFile ? documentFile.name : 'No file chosen'}
              </span>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Currency *</label>
            <DynamicSelect category="Currency" name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>

          {/* Exchange Rate */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1">
              <span>Exchange Rate *</span>
              <HelpCircle size={14} className="text-blue-500 cursor-pointer" title="Currency translation value rate calculation factor." />
            </label>
            <input 
              type="number"
              step="0.0001"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-400"
              required
            />
          </div>

        </div>

        {/* Product Autocomplete Lookup Search */}
        <div className="relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Select Product</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={handleProductSearch}
              placeholder="Please type product code and select..."
              className="w-full border border-blue-500 rounded pl-9 pr-3 py-2.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
            />
          </div>

          {/* Results lookup lists dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-blue-500 rounded shadow-lg max-h-60 overflow-y-auto divide-y divide-blue-500">
              {searchResults.map((prod, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectItem(prod)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold">{prod.name} ({prod.code})</span>
                  <span className="text-xs text-gray-500 font-mono">Cost: ${prod.cost} | Tax: {prod.tax}%</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order Items Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">Order Table *</h2>
          
          <div className="overflow-x-auto border border-blue-500 rounded-lg">
            <table className="block w-full overflow-x-auto w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-blue-500">
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700">Product</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-24 text-center">Quantity</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-32">Net Unit Cost</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-28">Profit Margin</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-36">Margin Type</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-32">Product Price</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-28">Discount</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-24">Tax (%)</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-32">SubTotal</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 text-right w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500 bg-white">
                {orderItems.length > 0 ? (
                  orderItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name & Code */}
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        <div>{item.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{item.code}</div>
                      </td>
                      {/* Quantity */}
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(item.code, e.target.value)}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-sm bg-white text-black text-center font-semibold"
                        />
                      </td>
                      {/* Net Cost */}
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          step="0.01"
                          value={item.netUnitCost}
                          onChange={(e) => handleCostChange(item.code, e.target.value)}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-sm bg-white text-black font-medium"
                        />
                      </td>
                      {/* Margin */}
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          step="0.01"
                          value={item.profitMargin}
                          onChange={(e) => handleMarginChange(item.code, e.target.value)}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-sm bg-white text-black font-medium"
                        />
                      </td>
                      {/* Margin Type dropdown */}
                      <td className="px-4 py-3">
                        <DynamicSelect category="MarginType" name="profitMarginType" value={item.profitMarginType} onChange={(e) => handleMarginTypeChange(item.code, e.target.value)} />
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          step="0.01"
                          value={item.productPrice}
                          onChange={(e) => handlePriceChange(item.code, e.target.value)}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-sm bg-white text-black font-semibold text-emerald-700"
                        />
                      </td>
                      {/* Discount */}
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) => handleDiscountChange(item.code, e.target.value)}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-sm bg-white text-black"
                        />
                      </td>
                      {/* Tax */}
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          value={item.taxPercent}
                          onChange={(e) => handleTaxPercentChange(item.code, e.target.value)}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-sm bg-white text-black text-center font-medium"
                        />
                      </td>
                      {/* Subtotal */}
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        INR {getSubtotal(item).toFixed(2)}
                      </td>
                      {/* Delete */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.code)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-xs text-gray-500 font-medium bg-white">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Info size={20} className="text-gray-400" />
                        <span>No products added to purchase invoice yet. Search above to add items.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Table Footer Total Summary */}
                <tr className="bg-gray-50/90 font-bold border-t border-blue-500">
                  <td className="px-4 py-3 text-xs text-gray-800">Total</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900">{totalQuantity}</td>
                  <td colSpan="3" className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-900">INR {rawSubTotal.toFixed(2)}</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                  <td colSpan="2" className="px-4 py-3 text-sm text-emerald-800 font-extrabold">
                    INR {totalCalculatedSubTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Footer parameters selectors */}
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* Global Order Tax */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Order Tax</label>
            <DynamicSelect category="TaxConfiguration" name="orderTax" value={orderTax} onChange={(e) => setOrderTax(e.target.value)} />
          </div>

          {/* Global Discount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Discount</label>
            <input 
              type="number"
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-400"
            />
          </div>

          {/* Shipping Cost */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Shipping Cost</label>
            <input 
              type="number"
              step="0.01"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-400"
            />
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Payment Status *</label>
            <DynamicSelect category="PaymentStatus" name="paymentStatus" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Note</label>
          <textarea
            rows="4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type purchase transaction note logs details here..."
            className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          ></textarea>
        </div>

        {/* Global Summary Ribbon indicators */}
        <div className="bg-gray-50 border border-blue-500 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 md:grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center font-semibold text-xs tracking-wider text-gray-700 uppercase">
          <div className="border-r border-blue-500/20 last:border-none">
            <div className="text-gray-500 mb-1">Items</div>
            <div className="text-sm font-bold text-gray-900">{totalItemsCount} ({totalQuantity})</div>
          </div>
          <div className="border-r border-blue-500/20 last:border-none">
            <div className="text-gray-500 mb-1">Total</div>
            <div className="text-sm font-bold text-gray-900">INR {rawSubTotal.toFixed(2)}</div>
          </div>
          <div className="border-r border-blue-500/20 last:border-none">
            <div className="text-gray-500 mb-1">Order Tax</div>
            <div className="text-sm font-bold text-gray-900">INR {calculatedGlobalTax.toFixed(2)}</div>
          </div>
          <div className="border-r border-blue-500/20 last:border-none">
            <div className="text-gray-500 mb-1">Order Discount</div>
            <div className="text-sm font-bold text-gray-900">INR {Number(discountValue).toFixed(2)}</div>
          </div>
          <div className="border-r border-blue-500/20 last:border-none">
            <div className="text-gray-500 mb-1">Shipping Cost</div>
            <div className="text-sm font-bold text-gray-900">INR {Number(shippingCost).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-indigo-600 mb-1">Grand Total</div>
            <div className="text-sm font-black text-indigo-600">INR {calculatedGrandTotal.toFixed(2)}</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setWarehouse('');
              setSupplier('');
              setOrderItems([]);
              setNote('');
              setDiscountValue('0');
              setShippingCost('0.00');
            }}
            className="px-5 py-2.5 border border-blue-500 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset Form
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-sm font-semibold shadow-md transition-colors"
          >
            Submit Purchase
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddPurchase;
