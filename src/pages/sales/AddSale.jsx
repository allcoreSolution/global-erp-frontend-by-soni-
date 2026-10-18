


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Search, Trash2, Upload, HelpCircle, Info
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const AddSale = () => {
  const navigate = useNavigate();
  // Fetch dynamic catalogs
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [allCustomers, setAllCustomers] = useState([{ name: 'Walk-in Customer', warehouseName: '' }]);
  const [allBillers, setAllBillers] = useState([{ name: 'Admin Biller', branch: '' }]);

  const [branchesList, setBranchesList] = useState([]); // [{_id, name}]
  const [allWarehouses, setAllWarehouses] = useState([]); // [{_id, name, branch: {_id, name}}]
  const [billersList, setBillersList] = useState([]);
  const [taxSlabsList, setTaxSlabsList] = useState([]);



  // Real data fetch on mount
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [prodRes, custRes, whRes, bilRes, taxRes, branchRes, plRes] = await Promise.all([
          api.get('/products').catch(() => ({ data: { data: [] } })),
          api.get('/customers').catch(() => ({ data: { data: [] } })),
          api.get('/catalogs/warehouses').catch(() => ({ data: { data: [] } })),
          api.get('/employees').catch(() => ({ data: { data: [] } })),
          api.get('/tax-slabs').catch(() => ({ data: { data: [] } })),
          api.get('/branches').catch(() => ({ data: { data: [] } })),
          api.get('/price-lists').catch(() => ({ data: { data: [] } }))
        ]);
        const pData = prodRes.data?.data || prodRes.data || [];
        const plData = plRes.data?.data || plRes.data || [];

        setProductsCatalog(pData.map(p => {
          let appliedPrice = 0;
          let appliedWholesalePrice = 0;
          
          for (let pl of plData) {
             if (pl.status === true) {
                 const plItem = (pl.productPricing || []).find(item => item.product === p._id || item.product === p.productName);
                 if (plItem) {
                     appliedPrice = Number(plItem.retailRate) || 0;
                     appliedWholesalePrice = Number(plItem.wholesaleRate) || 0;
                     break; 
                 }
             }
          }

          return {
            id: p._id,
            name: p.productName || p.name,
            code: p.productCode || p.sku || p.code,
            price: appliedPrice,
            wholesalePrice: appliedWholesalePrice,
            tax: p.productTax || p.taxRate || 0,
            stock: p.currentStock || 0,
            warehouseStocks: p.warehouseStocks || []
          };
        }));

        const cData = custRes.data?.data || custRes.data || [];
        if (cData.length > 0) {
          setAllCustomers([{ name: 'Walk-in Customer', type: 'Retailer' }, ...cData.map(c => ({
            _id: c._id,
            name: c.name || c.customerName || 'Unknown',
            phone: c.phone || 'N/A',
            email: c.email || 'N/A',
            address: c.billingAddress?.city || c.billingAddress?.street || 'N/A',
            balance: c.openingBalance || 0,
            warehouseName: c.warehouseAddress || c.warehouseName || '',
            type: c.type || c.customerType || c.customerGroup || 'Retailer'
          }))]);
        }

        const brData = branchRes.data?.data || [];
        // ✅ Store full objects with _id for proper ObjectId linking
        setBranchesList(brData.map(b => ({ _id: b._id, name: b.name })));

        const wData = whRes.data?.data || [];
        // ✅ Store full objects with _id and branch._id for cascading filter
        setAllWarehouses(wData.map(w => ({
          _id: w._id,
          name: w.name,
          branchId: w.branch?._id || w.branch || null,
          branchName: w.branch?.name || ''
        })));

        const bData = bilRes.data?.data || [];
        if (bData.length > 0) {
          setAllBillers(bData.map(b => ({
            name: b.employeeName || b.name,
            branch: b.branch || ''
          })));
        } else {
          setAllBillers([]);
        }


        const taxData = taxRes.data?.data || taxRes.data || [];
        setTaxSlabsList(taxData.map(t => `${t.rate || 0}%`));
        if (!orderTax && taxData.length > 0) setOrderTax(`${taxData[0].rate || 0}%`);



      } catch (err) {
        console.error('Failed to load catalogs', err);
      }
    };
    fetchCatalogs();
  }, []);



  // Form States
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState('');
  const [branch, setBranch] = useState('');         // stores _id
  const [warehouse, setWarehouse] = useState('');    // stores _id
  const [customer, setCustomer] = useState('');      // stores _id
  const [biller, setBiller] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState('1');

  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  // ✅ Derived filtered dropdowns (Cascading by _id)
  const filteredWarehouses = allWarehouses.filter(w => !branch || w.branchId === branch);
  const customers = allCustomers.filter(c => c.name === 'Walk-in Customer' || c.warehouseId === warehouse || !c.warehouseId);
  const billers = allBillers.filter(b => b.name === 'Admin Biller' || b.branch === warehouse || !b.branch);

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

  // Handle autocomplete search with Warehouse Stock Filtering
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
    // Check stock for current warehouse
    const whStockData = prod.warehouseStocks?.find(w => w.warehouse === warehouse);
    const availableStock = whStockData ? whStockData.stock : prod.stock;

    const whName = allWarehouses.find(w => w._id === warehouse)?.name || warehouse;

    if (availableStock <= 0) {
      Swal.fire('Warning', `Out of stock in ${whName}! Available: 0`, 'warning');
      return;
    }

    const exists = orderItems.find(item => item.code === prod.code);
    if (exists) {
      if (exists.quantity + 1 > availableStock) {
        Swal.fire('Warning', `Cannot add more! Only ${availableStock} in stock at ${whName}.`, 'warning');
        return;
      }
      setOrderItems(orderItems.map(item =>
        item.code === prod.code ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      // Find customer type to determine applied price
      const selectedCust = allCustomers.find(c => (c._id || c.name) === customer) || { type: 'Retailer' };
      const isWholesaler = selectedCust.type === 'Wholesaler';
      const appliedPrice = isWholesaler && prod.wholesalePrice > 0 ? prod.wholesalePrice : prod.price;

      setOrderItems([...orderItems, {
        name: prod.name,
        code: prod.code,
        productId: prod.id,
        quantity: 1,
        netUnitPrice: appliedPrice,
        discount: 0,
        taxPercent: parseInt(prod.tax) || 0
      }]);
    }
    setProductSearch('');
    setSearchResults([]);
  };

  // Table element modifiers
  const handleQtyChange = (code, val) => {
    const num = Math.max(1, Number(val) || 1);
    const prod = productsCatalog.find(p => p.code === code);
    const whStockData = prod?.warehouseStocks?.find(w => w.warehouse === warehouse);
    const availableStock = whStockData ? whStockData.stock : (prod?.stock || 0);
    const whName = allWarehouses.find(w => w._id === warehouse)?.name || warehouse;

    if (num > availableStock) {
      Swal.fire('Warning', `Cannot exceed available stock (${availableStock}) in ${whName}.`, 'warning');
      return;
    }

    setOrderItems(orderItems.map(item =>
      item.code === code ? { ...item, quantity: num } : item
    ));
  };

  const handlePriceChange = (code, val) => {
    const price = Math.max(0, Number(val) || 0);
    setOrderItems(orderItems.map(item =>
      item.code === code ? { ...item, netUnitPrice: price } : item
    ));
  };

  const handleDiscountChange = (code, val) => {
    const disc = Math.max(0, Number(val) || 0);
    setOrderItems(orderItems.map(item =>
      item.code === code ? { ...item, discount: disc } : item
    ));
  };

  const handleTaxChange = (code, val) => {
    const tx = Math.max(0, Number(val) || 0);
    setOrderItems(orderItems.map(item =>
      item.code === code ? { ...item, taxPercent: tx } : item
    ));
  };

  const handleDeleteItem = (code) => {
    setOrderItems(orderItems.filter(item => item.code !== code));
  };

  const getSubtotal = (item) => {
    const netPrice = Number(item.netUnitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const taxPercent = Number(item.taxPercent) || 0;
    const qty = Number(item.quantity) || 0;
    
    const rawPrice = netPrice - discount;
    const taxAmt = rawPrice * (taxPercent / 100);
    return (rawPrice + taxAmt) * qty;
  };

  // Live total evaluations
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsCount = orderItems.length;

  const rawSubTotal = orderItems.reduce((sum, item) => {
    return sum + ((Number(item.netUnitPrice) || 0) * (Number(item.quantity) || 0));
  }, 0);

  const calculatedItemsSubtotal = orderItems.reduce((sum, item) => sum + getSubtotal(item), 0);

  // Global Order Tax
  let taxPercent = parseInt(orderTax) || 0;



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
      Swal.fire('Error', 'Customer field is required.', 'error');
      return;
    }
    if (!warehouse) {
      Swal.fire('Error', 'Warehouse field is required.', 'error');
      return;
    }

    if (orderItems.length === 0) {
      Swal.fire('Error', 'Please add at least one product to the sale.', 'error');
      return;
    }

    try {
      let documentUrl = '';
      if (documentFile) {
        const formData = new FormData();
        formData.append('file', documentFile);
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.success) {
          documentUrl = uploadRes.data.url;
        }
      }

      // ✅ Send _id values (ObjectId) for proper backend linking
      const payload = {
        saleDate,
        referenceNo,
        branch,        // ObjectId of selected branch
        warehouse,     // ObjectId of selected warehouse
        customer,      // ObjectId of selected customer
        biller,
        currency,
        exchangeRate,
        orderItems: orderItems.map(item => ({
          name: item.name,
          code: item.code,
          product: item.productId,   // ObjectId of product
          quantity: item.quantity,
          netUnitPrice: item.netUnitPrice,
          discount: item.discount,
          taxPercent: item.taxPercent,
          total: getSubtotal(item)
        })),
        orderTax,
        discountType,
        discountValue,
        discountTotal: calculatedGlobalDiscount,
        shippingCost,
        grandTotal,
        subTotal: calculatedItemsSubtotal,
        taxTotal: calculatedGlobalTax,
        saleStatus,
        paymentStatus,
        saleNote,
        staffNote,
        documentUrl
      };
      const res = await api.post('/sales', payload);
      Swal.fire('Success', `Sale Created Successfully!\nInvoice: ${res.data?.data?.invoiceNo || ''}`, 'success');
      navigate('/sales/sale-list');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', `Error creating sale: ${err.response?.data?.message || err.message}`, 'error');
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

          {/* Branch */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Branch *</label>
            <select
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);  // stores _id
                setWarehouse('');
                setCustomer('');
                setBiller('');
              }}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
              required
            >
              <option value="">Select branch...</option>
              {/* ✅ value = _id for proper ObjectId linking */}
              {branchesList.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>

          {/* Warehouse */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Warehouse *</label>
            <select
              value={warehouse}
              onChange={(e) => {
                setWarehouse(e.target.value); // stores _id
                setCustomer('');
                setBiller('');
                setOrderItems([]);
              }}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
              required
            >
              <option value="">{branch ? "Select warehouse..." : "Select branch first"}</option>
              {/* ✅ value = _id, filtered by selected branch's _id */}
              {filteredWarehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>

          {/* Biller */}



          {/* Customer */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Customer *</label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450 disabled:opacity-50"
              required
              disabled={!warehouse}
            >
              <option value="">{warehouse ? "Select customer..." : "Select warehouse first"}</option>
              {/* ✅ value = _id for proper ObjectId linking */}
              {customers.map((c, i) => <option key={i} value={c._id || c.name}>{c.name}</option>)}
            </select>
            {customer && customers.find(c => (c._id || c.name) === customer) && customers.find(c => (c._id || c.name) === customer).name !== 'Walk-in Customer' && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900 grid grid-cols-2 gap-2 shadow-sm">
                <div><span className="font-semibold">Phone:</span> {customers.find(c => (c._id || c.name) === customer)?.phone}</div>
                <div><span className="font-semibold">Email:</span> {customers.find(c => (c._id || c.name) === customer)?.email}</div>
                <div><span className="font-semibold">City/Address:</span> {customers.find(c => (c._id || c.name) === customer)?.address}</div>
                <div><span className="font-semibold">Balance:</span> ₹{customers.find(c => (c._id || c.name) === customer)?.balance}</div>
              </div>
            )}
          </div>


          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Currency *</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
              required
            >
              <option value="INR">INR (Indian Rupee)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
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
              onFocus={() => {
                if (!productSearch.trim()) setSearchResults(productsCatalog);
              }}
              onBlur={() => setTimeout(() => setSearchResults([]), 200)}
              placeholder={customer ? "Scan/Search product by name/code/IMEI..." : "Please select customer first..."}
              disabled={!customer}
              className="w-full border border-blue-500 rounded pl-9 pr-3 py-2.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400 disabled:opacity-60 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-blue-500 rounded shadow-lg max-h-60 overflow-y-auto divide-y divide-blue-500">
              {searchResults.map((prod, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectProduct(prod);
                  }}
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
                        <select

                          value={item.taxPercent}
                          onChange={(e) => handleTaxChange(item.code, e.target.value)}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-sm bg-white text-black text-center font-medium"
                        >
                          <option value="0">0%</option>
                          {taxSlabsList.map((t, i) => (
                            <option key={i} value={parseInt(t) || 0}>{t}</option>
                          ))}
                        </select>
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
              <option value="">Select tax...</option>
              {taxSlabsList.map((t, i) => <option key={i} value={t}>{t}</option>)}
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
              <option value="Flat">Flat (Fixed Amount)</option>
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
              <option value="Draft">Draft</option>
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



    </div>
  );
};

export default AddSale;
