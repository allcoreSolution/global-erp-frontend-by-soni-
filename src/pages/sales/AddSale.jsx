import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Search, Trash2, Upload, HelpCircle, Info 
} from 'lucide-react';
import api from '../../api';

const AddSale = () => {
  const navigate = useNavigate();
  // Fetch dynamic catalogs
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [customers, setCustomers] = useState(['Walk-in Customer']);
  
  const [warehousesList, setWarehousesList] = useState([]);
  const [billersList, setBillersList] = useState([]);
  const [currenciesList, setCurrenciesList] = useState([]);

  // Modals state
  const [isBillerModalOpen, setIsBillerModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

  // New Item states
  const [newBiller, setNewBiller] = useState({ name: '', companyName: '', email: '' });
  const [newWarehouse, setNewWarehouse] = useState({ name: '', location: '' });
  const [newCurrency, setNewCurrency] = useState({ code: '', name: '', symbol: '' });

  // Real data fetch on mount
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [prodRes, custRes, whRes, bilRes, curRes] = await Promise.all([
          api.get('/products'),
          api.get('/customers').catch(() => ({ data: { data: [] } })),
          api.get('/catalogs/warehouses').catch(() => ({ data: { data: [] } })),
          api.get('/catalogs/billers').catch(() => ({ data: { data: [] } })),
          api.get('/catalogs/currencies').catch(() => ({ data: { data: [] } }))
        ]);
        const pData = prodRes.data?.data || prodRes.data || [];
        setProductsCatalog(pData.map(p => ({
          id: p._id,
          name: p.productName || p.name,
          code: p.productCode || p.sku || p.code,
          price: p.productPrice || p.salePrice || p.price || 0,
          tax: p.productTax || p.taxRate || 0,
          stock: p.currentStock || 0
        })));
        
        const cData = custRes.data?.data || custRes.data || [];
        if (cData.length > 0) {
          setCustomers(cData.map(c => c.name || c.customerName));
        }

        const wData = whRes.data?.data || [];
        setWarehousesList(wData.length > 0 ? wData.map(w => w.name) : ['Test Shop', 'Main Warehouse']);
        if (!warehouse && wData.length > 0) setWarehouse(wData[0].name);

        const bData = bilRes.data?.data || [];
        setBillersList(bData.length > 0 ? bData.map(b => b.name) : ['Admin Biller']);
        if (!biller && bData.length > 0) setBiller(bData[0].name);

        const curData = curRes.data?.data || [];
        setCurrenciesList(curData.length > 0 ? curData.map(c => c.code) : ['INR', 'USD']);
        if (!currency && curData.length > 0) setCurrency(curData[0].code);

      } catch (err) {
        console.error('Failed to load catalogs', err);
      }
    };
    fetchCatalogs();
  }, []);

  // Modal Handlers
  const handleAddBiller = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/catalogs/billers', newBiller);
      setBillersList([...billersList, res.data.data.name]);
      setBiller(res.data.data.name);
      setIsBillerModalOpen(false);
      setNewBiller({ name: '', companyName: '', email: '' });
    } catch(err) { alert("Failed to add Biller"); }
  };

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/catalogs/warehouses', newWarehouse);
      setWarehousesList([...warehousesList, res.data.data.name]);
      setWarehouse(res.data.data.name);
      setIsWarehouseModalOpen(false);
      setNewWarehouse({ name: '', location: '' });
    } catch(err) { alert("Failed to add Warehouse"); }
  };

  const handleAddCurrency = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/catalogs/currencies', newCurrency);
      setCurrenciesList([...currenciesList, res.data.data.code]);
      setCurrency(res.data.data.code);
      setIsCurrencyModalOpen(false);
      setNewCurrency({ code: '', name: '', symbol: '' });
    } catch(err) { alert("Failed to add Currency"); }
  };

  // Form States
  const [saleDate, setSaleDate] = useState('2026-08-13');
  const [referenceNo, setReferenceNo] = useState('');
  const [customer, setCustomer] = useState('John Doe');
  const [warehouse, setWarehouse] = useState('Test Shop');
  const [biller, setBiller] = useState('Admin Biller');
  const [currency, setCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState('1');
  
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  // Footer configurations
  const [orderTax, setOrderTax] = useState('No Tax');
  const [discountType, setDiscountType] = useState('Flat');
  const [discountValue, setDiscountValue] = useState('0.00');
  const [shippingCost, setShippingCost] = useState('0');
  const [saleStatus, setSaleStatus] = useState('Completed');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [documentFile, setDocumentFile] = useState(null);
  
  const [saleNote, setSaleNote] = useState('');
  const [staffNote, setStaffNote] = useState('');

  // Handle autocomplete search
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

  // Add Item to Order list
  const handleSelectProduct = (prod) => {
    const exists = orderItems.find(item => item.code === prod.code);
    if (exists) {
      setOrderItems(orderItems.map(item => 
        item.code === prod.code ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setOrderItems([...orderItems, {
        name: prod.name,
        code: prod.code,
        productId: prod.id,
        quantity: 1,
        netUnitPrice: prod.price,
        discount: 0,
        taxPercent: prod.tax
      }]);
    }
    setProductSearch('');
    setSearchResults([]);
  };

  // Table element modifiers
  const handleQtyChange = (code, val) => {
    const num = Math.max(1, Number(val));
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, quantity: num } : item
    ));
  };

  const handlePriceChange = (code, val) => {
    const price = Math.max(0, Number(val));
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, netUnitPrice: price } : item
    ));
  };

  const handleDiscountChange = (code, val) => {
    const disc = Math.max(0, Number(val));
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, discount: disc } : item
    ));
  };

  const handleTaxChange = (code, val) => {
    const tx = Math.max(0, Number(val));
    setOrderItems(orderItems.map(item => 
      item.code === code ? { ...item, taxPercent: tx } : item
    ));
  };

  const handleDeleteItem = (code) => {
    setOrderItems(orderItems.filter(item => item.code !== code));
  };

  const getSubtotal = (item) => {
    const rawPrice = item.netUnitPrice - item.discount;
    const taxAmt = rawPrice * (item.taxPercent / 100);
    return (rawPrice + taxAmt) * item.quantity;
  };

  // Live total evaluations
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsCount = orderItems.length;

  const rawSubTotal = orderItems.reduce((sum, item) => {
    return sum + (item.netUnitPrice * item.quantity);
  }, 0);

  const calculatedItemsSubtotal = orderItems.reduce((sum, item) => sum + getSubtotal(item), 0);

  // Global Order Tax
  let taxPercent = 0;
  if (orderTax === '5%') taxPercent = 5;
  else if (orderTax === '10%') taxPercent = 10;
  else if (orderTax === '18%') taxPercent = 18;
  const calculatedGlobalTax = calculatedItemsSubtotal * (taxPercent / 100);

  // Global Discount
  let calculatedGlobalDiscount = 0;
  if (discountType === 'Flat') {
    calculatedGlobalDiscount = Number(discountValue) || 0;
  } else {
    // Percentage
    calculatedGlobalDiscount = calculatedItemsSubtotal * ((Number(discountValue) || 0) / 100);
  }

  const grandTotal = calculatedItemsSubtotal + calculatedGlobalTax + Number(shippingCost) - calculatedGlobalDiscount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer) {
      alert("Customer field is required.");
      return;
    }
    if (!warehouse) {
      alert("Warehouse field is required.");
      return;
    }
    if (!biller) {
      alert("Biller field is required.");
      return;
    }
    if (orderItems.length === 0) {
      alert("Please add at least one product to the sale.");
      return;
    }
    
    try {
      const payload = {
        saleDate,
        referenceNo,
        customer,
        warehouse,
        biller,
        currency,
        exchangeRate,
        orderItems,
        orderTax,
        discountType,
        discountValue,
        discountTotal: calculatedGlobalDiscount,
        shippingCost,
        saleStatus,
        paymentStatus,
        saleNote,
        staffNote
      };
      const res = await api.post('/sales', payload);
      alert(`Sale Created Successfully!\nInvoice: ${res.data?.data?.invoiceNo || ''}`);
      navigate('/sales/sale-list');
    } catch (err) {
      console.error(err);
      alert(`Error creating sale: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header */}
      <div className="mb-6 border-b border-blue-500 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-black">Add Sale</h1>
        <p className="text-sm text-gray-500 mt-1">The field labels marked with * are required input fields.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Sale Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 pl-9 text-sm bg-white text-black outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Reference No */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Reference No</label>
            <input 
              type="text"
              placeholder="e.g. SL-1290382"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-400"
            />
          </div>

          {/* Customer */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Customer *</label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
              required
            >
              <option value="">Select customer...</option>
              {customers.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Warehouse */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Warehouse *</label>
            <div className="flex items-center gap-2">
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
                required
              >
                <option value="">Select warehouse...</option>
                {warehousesList.map((w, i) => <option key={i} value={w}>{w}</option>)}
              </select>
              <button 
                type="button" 
                onClick={() => setIsWarehouseModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Biller */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Biller *</label>
            <div className="flex items-center gap-2">
              <select
                value={biller}
                onChange={(e) => setBiller(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
                required
              >
                <option value="">Select biller...</option>
                {billersList.map((b, i) => <option key={i} value={b}>{b}</option>)}
              </select>
              <button 
                type="button" 
                onClick={() => setIsBillerModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Currency *</label>
            <div className="flex items-center gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
                required
              >
                {currenciesList.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
              <button 
                type="button" 
                onClick={() => setIsCurrencyModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 text-sm font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Exchange Rate */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1">
              <span>Exchange Rate *</span>
              <HelpCircle size={14} className="text-blue-500 cursor-pointer" title="Exchange rate translation values" />
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
              placeholder="Scan/Search product by name/code/IMEI..."
              className="w-full border border-blue-500 rounded pl-9 pr-3 py-2.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
            />
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-blue-500 rounded shadow-lg max-h-60 overflow-y-auto divide-y divide-blue-500">
              {searchResults.map((prod, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectProduct(prod)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold">{prod.name} ({prod.code})</span>
                  <span className="text-xs text-gray-500 font-mono">Price: ${prod.price} | Tax: {prod.tax}%</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order Table * */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">Order Table *</h2>
          
          <div className="overflow-x-auto border border-blue-500 rounded-lg">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-blue-500">
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700">Product</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-24 text-center">Quantity</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-32">Net Unit Price</th>
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
                      {/* Product Name & Code */}
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
                      {/* Price */}
                      <td className="px-4 py-3">
                        <input 
                          type="number"
                          step="0.01"
                          value={item.netUnitPrice}
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
                          onChange={(e) => handleTaxChange(item.code, e.target.value)}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-sm bg-white text-black text-center font-medium"
                        />
                      </td>
                      {/* Subtotal */}
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        INR {getSubtotal(item).toFixed(2)}
                      </td>
                      {/* Action Delete */}
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
                    <td colSpan="7" className="px-6 py-8 text-center text-xs text-gray-500 font-medium bg-white">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Info size={20} className="text-gray-400" />
                        <span>No products added to invoice list. Search above to add items.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Table Footer Total Summary */}
                <tr className="bg-gray-50/90 font-bold border-t border-blue-500">
                  <td className="px-4 py-3 text-xs text-gray-800">Total</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900">{totalQuantity}</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm text-gray-900">INR {rawSubTotal.toFixed(2)}</td>
                  <td className="px-4 py-3"></td>
                  <td colSpan="2" className="px-4 py-3 text-sm text-emerald-800 font-extrabold">
                    INR {calculatedItemsSubtotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Footer parameters selectors */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          {/* Order Tax */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Order Tax</label>
            <select
              value={orderTax}
              onChange={(e) => setOrderTax(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
            >
              <option value="No Tax">No Tax</option>
              <option value="5%">GST 5%</option>
              <option value="10%">GST 10%</option>
              <option value="18%">GST 18%</option>
            </select>
          </div>

          {/* Order Discount Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Order Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
            >
              <option value="Flat">Flat</option>
              <option value="Percentage">Percentage (%)</option>
            </select>
          </div>

          {/* Order Discount Value */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Order Discount Value</label>
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
        </div>

        {/* Status, File & Note fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attach Document */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Attach Document</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-2 border border-blue-500 rounded cursor-pointer hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors">
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

          {/* Sale Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Sale Status *</label>
            <select
              value={saleStatus}
              onChange={(e) => setSaleStatus(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
              required
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Payment Status *</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
              required
            >
              <option value="Pending">Pending</option>
              <option value="Due">Due</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
        </div>

        {/* Note Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Sale Note</label>
            <textarea
              rows="3"
              value={saleNote}
              onChange={(e) => setSaleNote(e.target.value)}
              placeholder="Type sale invoice details here..."
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
            ></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Staff Note</label>
            <textarea
              rows="3"
              value={staffNote}
              onChange={(e) => setStaffNote(e.target.value)}
              placeholder="Internal staff note comments..."
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
            ></textarea>
          </div>
        </div>

        {/* Global Summary Ribbon indicators */}
        <div className="bg-gray-50 border border-blue-500 rounded-lg p-4 grid grid-cols-2 md:grid-cols-6 gap-4 text-center font-semibold text-xs tracking-wider text-gray-700 uppercase">
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
            <div className="text-sm font-bold text-gray-900">INR {calculatedGlobalDiscount.toFixed(2)}</div>
          </div>
          <div className="border-r border-blue-500/20 last:border-none">
            <div className="text-gray-500 mb-1">Shipping Cost</div>
            <div className="text-sm font-bold text-gray-900">INR {Number(shippingCost).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-indigo-600 mb-1">Grand Total</div>
            <div className="text-sm font-black text-indigo-600">INR {grandTotal.toFixed(2)}</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setCustomer('');
              setWarehouse('');
              setBiller('');
              setOrderItems([]);
              setSaleNote('');
              setStaffNote('');
              setDiscountValue('0.00');
              setShippingCost('0');
            }}
            className="px-5 py-2.5 border border-blue-500 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset Form
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-sm font-semibold shadow-md transition-colors"
          >
            Submit Sale
          </button>
        </div>

      </form>

      {/* MODALS */}
      
      {/* Biller Modal */}
      {isBillerModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md border border-blue-500">
            <h2 className="text-xl font-bold mb-4">Add Biller</h2>
            <form onSubmit={handleAddBiller} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Name *</label>
                <input required type="text" value={newBiller.name} onChange={e => setNewBiller({...newBiller, name: e.target.value})} className="w-full border border-blue-400 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm mb-1">Company</label>
                <input type="text" value={newBiller.companyName} onChange={e => setNewBiller({...newBiller, companyName: e.target.value})} className="w-full border border-blue-400 p-2 rounded" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsBillerModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warehouse Modal */}
      {isWarehouseModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md border border-blue-500">
            <h2 className="text-xl font-bold mb-4">Add Warehouse</h2>
            <form onSubmit={handleAddWarehouse} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Name *</label>
                <input required type="text" value={newWarehouse.name} onChange={e => setNewWarehouse({...newWarehouse, name: e.target.value})} className="w-full border border-blue-400 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm mb-1">Location</label>
                <input type="text" value={newWarehouse.location} onChange={e => setNewWarehouse({...newWarehouse, location: e.target.value})} className="w-full border border-blue-400 p-2 rounded" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsWarehouseModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Currency Modal */}
      {isCurrencyModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md border border-blue-500">
            <h2 className="text-xl font-bold mb-4">Add Currency</h2>
            <form onSubmit={handleAddCurrency} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Code (e.g. EUR) *</label>
                <input required type="text" value={newCurrency.code} onChange={e => setNewCurrency({...newCurrency, code: e.target.value})} className="w-full border border-blue-400 p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input type="text" value={newCurrency.name} onChange={e => setNewCurrency({...newCurrency, name: e.target.value})} className="w-full border border-blue-400 p-2 rounded" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsCurrencyModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddSale;
