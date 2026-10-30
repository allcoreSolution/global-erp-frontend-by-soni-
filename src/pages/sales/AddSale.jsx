import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Search, Trash2, Upload, Info, FileText, CheckCircle2, RotateCcw, Zap
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const AddSale = () => {
  const navigate = useNavigate();

  // Dynamic Catalogs
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [allCustomers, setAllCustomers] = useState([{ name: 'Walk-in Customer', warehouseName: '' }]);
  const [allBillers, setAllBillers] = useState([{ name: 'Admin Biller', branch: '' }]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [branchesList, setBranchesList] = useState([]);
  // Standard Indian GST rates as reliable defaults
  const [taxSlabsList, setTaxSlabsList] = useState([0, 5, 12, 18, 28]);

  // Invoice / Bill No generator
  const generateDefaultInvoiceNo = () => {
    const d = new Date();
    const datePart = `${d.getFullYear().toString().slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const randPart = Math.floor(1000 + Math.random() * 9000);
    return `INV-${datePart}-${randPart}`;
  };

  // Form States - Invoice No field for adding invoice
  const [invoiceNo, setInvoiceNo] = useState(generateDefaultInvoiceNo());
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [warehouse, setWarehouse] = useState('');    // stores _id
  const [branch, setBranch] = useState('');          // stores _id
  const [customer, setCustomer] = useState('');      // stores _id
  const [biller, setBiller] = useState('Admin Biller');

  // Product Search & Order Items
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

  // Fetch all catalogs on mount
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [prodRes, custRes, whRes, bilRes, taxRes, branchRes] = await Promise.all([
          api.get('/products').catch(() => ({ data: { data: [] } })),
          api.get('/customers').catch(() => ({ data: { data: [] } })),
          api.get('/catalogs/warehouses').catch(() => ({ data: { data: [] } })),
          api.get('/employees').catch(() => ({ data: { data: [] } })),
          api.get('/tax-slabs').catch(() => ({ data: { data: [] } })),
          api.get('/branches').catch(() => ({ data: { data: [] } }))
        ]);

        const pData = prodRes.data?.data || prodRes.data || [];
        setProductsCatalog(pData.map(p => {
          let taxVal = 0;
          if (p.productTax) {
            const m = String(p.productTax).match(/\d+/);
            if (m) taxVal = parseInt(m[0], 10);
          } else if (p.taxRate) {
            taxVal = Number(p.taxRate) || 0;
          }
          return {
            id: p._id,
            name: p.productName || p.name,
            code: p.productCode || p.sku || p.code,
            mrp: Number(p.mrp) || 0,
            price: Number(p.productPrice) || 0,
            wholesalePrice: Number(p.wholesalePrice) || 0,
            tax: taxVal,
            stock: p.currentStock || 0,
            warehouseStocks: p.warehouseStocks || [],
            batch: p.batchNo || '',
            batches: p.batches || [],
            expDate: p.expDate ? new Date(p.expDate).toISOString().split('T')[0] : ''
          };
        }));

        const cData = custRes.data?.data || custRes.data || [];
        const loadedCustomers = [{ name: 'Walk-in Customer', type: 'Retailer' }, ...cData.map(c => ({
          _id: c._id,
          name: c.name || c.customerName || 'Unknown',
          phone: c.phone || 'N/A',
          email: c.email || 'N/A',
          address: c.billingAddress?.city || c.billingAddress?.street || 'N/A',
          balance: c.openingBalance || 0,
          warehouseName: c.warehouseAddress || c.warehouseName || '',
          type: c.type || c.customerType || c.customerGroup || 'Retailer'
        }))];
        setAllCustomers(loadedCustomers);
        // Auto-select Walk-in Customer by default
        setCustomer(loadedCustomers[0]._id || loadedCustomers[0].name);

        const wData = whRes.data?.data || [];
        const loadedWarehouses = wData.map(w => ({
          _id: w._id,
          name: w.name,
          branchId: w.branch?._id || w.branch || null,
          branchName: w.branch?.name || '',
          status: w.status !== false
        }));
        setAllWarehouses(loadedWarehouses);

        // Auto-select active warehouse on load
        if (loadedWarehouses.length > 0) {
          const activeWh = loadedWarehouses.find(w => w.status) || loadedWarehouses[0];
          setWarehouse(activeWh._id);
          if (activeWh.branchId) {
            setBranch(activeWh.branchId);
          }
        }

        const brData = branchRes.data?.data || [];
        setBranchesList(brData.map(b => ({ _id: b._id, name: b.name })));

        const bData = bilRes.data?.data || [];
        if (bData.length > 0) {
          setAllBillers(bData.map(b => ({
            name: b.employeeName || b.name,
            branch: b.branch || ''
          })));
        }

        const taxData = taxRes.data?.data || taxRes.data || [];
        const apiRates = taxData.map(t => Number(t.rate)).filter(r => !isNaN(r) && r >= 0);
        const mergedSlabs = Array.from(new Set([0, 5, 12, 18, 28, ...apiRates])).sort((a, b) => a - b);
        setTaxSlabsList(mergedSlabs);

      } catch (err) {
        console.error('Failed to load catalogs', err);
      }
    };
    fetchCatalogs();
  }, []);

  // When Warehouse changes, auto-resolve Branch
  const handleWarehouseChange = (whId) => {
    setWarehouse(whId);
    const selWh = allWarehouses.find(w => w._id === whId);
    if (selWh && selWh.branchId) {
      setBranch(selWh.branchId);
    }
  };

  // Helper to fetch inward purchase bill number for a batch
  const fetchBatchBillNo = async (batchNo, productCode) => {
    if (!batchNo) return '';
    try {
      const res = await api.get(`/products/batch-info?batchNo=${encodeURIComponent(batchNo)}&productCode=${encodeURIComponent(productCode || '')}`);
      if (res.data?.success && res.data.data) {
        return res.data.data.billNo || res.data.data.invoiceNo || '';
      }
    } catch (_) {}
    return '';
  };

  // Available in-stock products only (Jo khatam ho gaye hain ya out of stock/damaged hain, wo nahi dikhenge)
  const inStockProducts = React.useMemo(() => {
    return productsCatalog.filter(p => {
      const selWhDoc = allWarehouses.find(w => w._id === warehouse);
      const whStockData = p.warehouseStocks?.find(w => 
        w.warehouse === warehouse || 
        (selWhDoc && (w.warehouse === selWhDoc.name || w.warehouse === selWhDoc._id))
      );
      
      let availStock = 0;
      if (whStockData && typeof whStockData.stock === 'number') {
        availStock = whStockData.stock;
      } else if (p.batches && p.batches.length > 0) {
        availStock = p.batches.reduce((sum, b) => {
          const qty = b.remainingQty !== undefined ? b.remainingQty : b.stock;
          return sum + Math.max(0, Number(qty) || 0);
        }, 0);
      } else {
        availStock = Number(p.stock) || 0;
      }

      // ONLY return products with available stock > 0
      return availStock > 0;
    });
  }, [productsCatalog, warehouse, allWarehouses]);

  // Handle autocomplete search across IN-STOCK inventory only
  const handleProductSearch = (e) => {
    const val = e.target.value;
    setProductSearch(val);
    if (val.trim() === '') {
      setSearchResults(inStockProducts);
      return;
    }
    const filtered = inStockProducts.filter(p =>
      p.name.toLowerCase().includes(val.toLowerCase()) ||
      p.code.toLowerCase().includes(val.toLowerCase()) ||
      (p.batches && p.batches.some(b => 
        ((b.remainingQty !== undefined ? b.remainingQty : b.stock) || 0) > 0 &&
        b.batchNo.toLowerCase().includes(val.toLowerCase())
      ))
    );
    setSearchResults(filtered);
  };

  // Add Item to Order list with complete details - Can select same product multiple times!
  const handleSelectProduct = async (prod) => {
    // Generate a unique rowId so the same product can be selected multiple times
    const rowId = `row-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // Determine applied price (Wholesaler vs Retailer)
    const selectedCust = allCustomers.find(c => (c._id || c.name) === customer) || { type: 'Retailer' };
    const isWholesaler = selectedCust.type === 'Wholesaler';
    let appliedPrice = isWholesaler && prod.wholesalePrice > 0 ? prod.wholesalePrice : prod.price;

    // Check which batches are already selected for this product
    const existingBatchesForProd = orderItems
      .filter(it => it.code === prod.code)
      .map(it => it.batch)
      .filter(Boolean);

    let chosenBatch = '';
    let chosenExp = prod.expDate || '';
    let chosenMrp = prod.mrp || 0;
    let chosenBillNo = '';

    if (prod.batches && prod.batches.length > 0) {
      // Find batches with stock
      const availableBatches = prod.batches
        .filter(b => ((b.remainingQty !== undefined ? b.remainingQty : b.stock) || 0) > 0)
        .sort((a, b) => new Date(a.expDate || '9999-12-31') - new Date(b.expDate || '9999-12-31'));

      // If user is selecting product again, prefer the next available batch!
      const unselectedBatch = availableBatches.find(b => !existingBatchesForProd.includes(b.batchNo));
      const targetBatch = unselectedBatch || availableBatches[0] || prod.batches[0];

      if (targetBatch) {
        chosenBatch = targetBatch.batchNo || '';
        chosenExp = targetBatch.expDate ? new Date(targetBatch.expDate).toISOString().split('T')[0] : '';
        if (targetBatch.saleRate > 0) appliedPrice = targetBatch.saleRate;
        if (targetBatch.mrp > 0) chosenMrp = targetBatch.mrp;
        chosenBillNo = targetBatch.billNo || targetBatch.invoiceNo || '';
      }
    } else {
      chosenBatch = prod.batch || '';
    }

    // If bill number not stored on batch, fetch dynamically via API
    if (chosenBatch && !chosenBillNo) {
      chosenBillNo = await fetchBatchBillNo(chosenBatch, prod.code);
    }

    // Ensure the product's actual tax from database is preserved
    const defaultTax = Number(prod.tax) || 0;

    const newItem = {
      rowId,
      name: prod.name,
      code: prod.code,
      productId: prod.id,
      quantity: 1,
      mrp: chosenMrp,
      netUnitPrice: appliedPrice,
      discount: 0,
      taxPercent: defaultTax, // Actual tax from product master (e.g. 18%, 12%, etc.)
      originalTaxPercent: defaultTax > 0 ? defaultTax : 18, // Remember for 0% undo toggle
      batch: chosenBatch,
      billNo: chosenBillNo,
      expDate: chosenExp,
      batches: prod.batches || []
    };

    // Append as a new row so same product can be added multiple times
    setOrderItems(prev => [...prev, newItem]);
    setProductSearch('');
    setSearchResults([]);
  };

  // Batch change handler - Updates specific row's Batch, Bill No, Exp Date, MRP, Sale Price
  const handleBatchSelect = async (rowId, newBatchNo) => {
    const item = orderItems.find(it => it.rowId === rowId);
    if (!item) return;

    const selBatch = item.batches?.find(b => b.batchNo === newBatchNo);
    let bill = selBatch?.billNo || selBatch?.invoiceNo || '';
    if (!bill && newBatchNo) {
      bill = await fetchBatchBillNo(newBatchNo, item.code);
    }

    setOrderItems(orderItems.map(it => {
      if (it.rowId !== rowId) return it;
      return {
        ...it,
        batch: newBatchNo,
        billNo: bill,
        expDate: selBatch?.expDate ? new Date(selBatch.expDate).toISOString().split('T')[0] : it.expDate,
        netUnitPrice: selBatch?.saleRate > 0 ? selBatch.saleRate : it.netUnitPrice,
        mrp: selBatch?.mrp > 0 ? selBatch.mrp : it.mrp
      };
    }));
  };

  // Quantity Change for specific row
  const handleQtyChange = (rowId, val) => {
    const num = Math.max(1, Number(val) || 1);
    setOrderItems(orderItems.map(item =>
      item.rowId === rowId ? { ...item, quantity: num } : item
    ));
  };

  const handlePriceChange = (rowId, val) => {
    const price = Math.max(0, Number(val) || 0);
    setOrderItems(orderItems.map(item =>
      item.rowId === rowId ? { ...item, netUnitPrice: price } : item
    ));
  };

  const handleDiscountChange = (rowId, val) => {
    const disc = Math.max(0, Number(val) || 0);
    setOrderItems(orderItems.map(item =>
      item.rowId === rowId ? { ...item, discount: disc } : item
    ));
  };

  const handleTaxChange = (rowId, val) => {
    const tx = Math.max(0, Number(val) || 0);
    setOrderItems(orderItems.map(item =>
      item.rowId === rowId ? {
        ...item,
        taxPercent: tx,
        originalTaxPercent: tx > 0 ? tx : item.originalTaxPercent
      } : item
    ));
  };

  // Quick 0% Tax Toggle for specific row
  const toggleZeroTax = (rowId) => {
    setOrderItems(orderItems.map(item => {
      if (item.rowId !== rowId) return item;
      if (item.taxPercent === 0) {
        // Restore original tax (e.g. 18%, 12%, etc.)
        return { ...item, taxPercent: item.originalTaxPercent || 18 };
      } else {
        // Set to 0% Tax Free
        return { ...item, taxPercent: 0 };
      }
    }));
  };

  // Delete specific row by rowId
  const handleDeleteItem = (rowId) => {
    setOrderItems(orderItems.filter(item => item.rowId !== rowId));
  };

  // Item Subtotal calculation
  const getSubtotal = (item) => {
    const netPrice = Number(item.netUnitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const taxPercent = Number(item.taxPercent) || 0;
    const qty = Number(item.quantity) || 0;

    const rawPrice = netPrice - discount;
    const taxAmt = rawPrice * (taxPercent / 100);
    return (rawPrice + taxAmt) * qty;
  };

  // Live total calculations
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalItemsCount = orderItems.length;

  const rawSubTotal = orderItems.reduce((sum, item) => {
    return sum + ((Number(item.netUnitPrice) || 0) * (Number(item.quantity) || 0));
  }, 0);

  const calculatedItemsSubtotal = orderItems.reduce((sum, item) => sum + getSubtotal(item), 0);

  // Global Order Tax
  const globalTaxPercent = parseInt(orderTax) || 0;
  const calculatedGlobalTax = calculatedItemsSubtotal * (globalTaxPercent / 100);

  // Global Discount
  let calculatedGlobalDiscount = 0;
  if (discountType === 'Flat') {
    calculatedGlobalDiscount = Number(discountValue) || 0;
  } else {
    calculatedGlobalDiscount = calculatedItemsSubtotal * ((Number(discountValue) || 0) / 100);
  }

  const grandTotal = Math.max(0, calculatedItemsSubtotal + calculatedGlobalTax + Number(shippingCost) - calculatedGlobalDiscount);

  // Submit Sale
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceNo.trim()) {
      Swal.fire('Error', 'Invoice No field is required.', 'error');
      return;
    }
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

      const payload = {
        invoiceNo: invoiceNo.trim(),
        saleDate,
        branch,
        warehouse,
        customer,
        biller,
        currency: 'INR',
        exchangeRate: '1',
        orderItems: orderItems.map(item => ({
          name: item.name,
          code: item.code,
          product: item.productId,
          quantity: item.quantity,
          netUnitPrice: item.netUnitPrice,
          discount: item.discount,
          taxPercent: item.taxPercent,
          batch: item.batch || '',
          billNo: item.billNo || '',
          mrp: item.mrp || 0,
          expDate: item.expDate || null,
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
      Swal.fire('Success', `Sale Created Successfully!\nInvoice No: ${res.data?.data?.invoiceNo || invoiceNo}`, 'success');
      navigate('/sales/sale-list');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', `Error creating sale: ${err.response?.data?.message || err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">

      {/* Header */}
      <div className="mb-6 border-b border-blue-500 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <span>Add Sale / Invoicing</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Invoice No add karein, Customer chuniye aur Product scan ya select karke sale record karein. Ek product ko multiple times bhi select kar sakte hain.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Clean Header Grid with Invoice No Add field */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 bg-slate-50/80 p-5 rounded-xl border border-blue-500 shadow-sm">

          {/* 1. Invoice No Add Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center justify-between">
              <span>Invoice No *</span>
              <button
                type="button"
                onClick={() => setInvoiceNo(generateDefaultInvoiceNo())}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline"
                title="Auto-generate fresh invoice number"
              >
                Auto Generate
              </button>
            </label>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-3 text-indigo-600" />
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Enter Invoice No (e.g. INV-001)"
                className="w-full border-2 border-indigo-400 focus:border-indigo-600 rounded px-3 py-2 pl-9 text-sm bg-white text-black font-extrabold outline-none shadow-sm"
                required
              />
            </div>
          </div>

          {/* 2. Sale Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Sale Date *</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-3 text-indigo-600" />
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 pl-9 text-sm bg-white text-black outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>
          </div>

          {/* 3. Warehouse / Godown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center justify-between">
              <span>Warehouse / Godown *</span>
              <span className="text-[10px] text-emerald-600 font-medium lowercase">● active</span>
            </label>
            <select
              value={warehouse}
              onChange={(e) => handleWarehouseChange(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-500 font-semibold"
              required
            >
              {allWarehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} {w.branchName ? `(${w.branchName})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Customer */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Customer *</label>
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-500 font-semibold"
              required
            >
              {allCustomers.map((c, i) => (
                <option key={i} value={c._id || c.name}>
                  {c.name} {c.phone && c.phone !== 'N/A' ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
            {customer && allCustomers.find(c => (c._id || c.name) === customer) && allCustomers.find(c => (c._id || c.name) === customer).name !== 'Walk-in Customer' && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 grid grid-cols-2 gap-1.5 shadow-sm">
                <div><span className="font-semibold">Phone:</span> {allCustomers.find(c => (c._id || c.name) === customer)?.phone}</div>
                <div><span className="font-semibold">Balance:</span> ₹{allCustomers.find(c => (c._id || c.name) === customer)?.balance}</div>
              </div>
            )}
          </div>

        </div>

        {/* Product Autocomplete Lookup Search - Click to open dropdown anytime */}
        <div className="relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center justify-between">
            <span>Select Product / Scan Barcode</span>
            <span className="text-[11px] text-indigo-600 font-medium">
              Click box to view products • Ek product ko dobara bhi select kar sakte hain
            </span>
          </label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-indigo-500" />
            <input
              type="text"
              value={productSearch}
              onChange={handleProductSearch}
              onFocus={() => {
                setSearchResults(inStockProducts);
              }}
              onClick={() => {
                setSearchResults(inStockProducts);
              }}
              onBlur={() => setTimeout(() => setSearchResults([]), 250)}
              placeholder="Scan barcode or click to search in-stock products..."
              className="w-full border-2 border-blue-500 focus:border-indigo-600 rounded-lg pl-10 pr-3 py-2.5 text-sm bg-white text-black outline-none font-medium placeholder:text-gray-400 shadow-sm"
            />
          </div>

          {/* Search Dropdown Results - Only In-Stock Items */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 z-20 mt-1 bg-white border-2 border-indigo-400 rounded-lg shadow-2xl max-h-72 overflow-y-auto divide-y divide-gray-100">
              {searchResults.map((prod, idx) => {
                const activeBatches = (prod.batches || []).filter(b => ((b.remainingQty !== undefined ? b.remainingQty : b.stock) || 0) > 0);
                const selWhDoc = allWarehouses.find(w => w._id === warehouse);
                const whStock = prod.warehouseStocks?.find(w => w.warehouse === warehouse || (selWhDoc && (w.warehouse === selWhDoc.name || w.warehouse === selWhDoc._id)));
                const displayStock = whStock ? whStock.stock : prod.stock;

                return (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectProduct(prod);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50/70 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-indigo-700 text-sm flex items-center gap-2">
                        <span>{prod.name}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          In Stock
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-2">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-gray-700">{prod.code}</span>
                        {activeBatches.length > 0 && (
                          <span className="text-indigo-600">
                            {activeBatches.length} Batch(es): {activeBatches.map(b => b.batchNo).filter(Boolean).slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-700">₹{prod.price}</div>
                      <div className="text-[11px] text-gray-500">
                        Stock: <span className="font-bold text-emerald-700">{displayStock}</span> | Tax: <span className="font-bold text-indigo-700">{prod.tax}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Table with Batch No, Inward Bill No, MRP, Product Tax & 0% Option */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
              <span>Order Table</span>
              <span className="text-xs font-normal text-gray-500">({orderItems.length} items added)</span>
            </h2>
          </div>

          <div className="overflow-x-auto border border-blue-500 rounded-lg shadow-sm">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-slate-100 border-b border-blue-500 text-gray-800">
                  <th className="px-3 py-3 text-xs font-bold uppercase w-48">Product</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase w-36">Batch No</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase w-32">Bill No</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase w-28">Exp Date</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase w-24 text-center">Qty</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase w-24">MRP (₹)</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase w-28">Sale Price (₹)</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase w-24">Disc (₹)</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase w-36 text-center">Tax (%) / 0% Free</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase w-28 text-right">SubTotal</th>
                  <th className="px-3 py-3 text-xs font-bold uppercase text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500 bg-white">
                {orderItems.length > 0 ? (
                  orderItems.map((item) => (
                    <tr key={item.rowId} className="hover:bg-slate-50/70 transition-colors">

                      {/* Product Name & Code */}
                      <td className="px-3 py-2.5 text-sm font-semibold text-gray-900">
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{item.code}</div>
                      </td>

                      {/* Batch No with FEFO selection */}
                      <td className="px-3 py-2.5">
                        {item.batches && item.batches.length > 0 ? (
                          <select
                            value={item.batch || ''}
                            onChange={(e) => handleBatchSelect(item.rowId, e.target.value)}
                            className="w-full border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black font-semibold outline-none focus:border-indigo-600"
                          >
                            <option value="">Select Batch...</option>
                            {item.batches
                              .filter(b => ((b.remainingQty !== undefined ? b.remainingQty : b.stock) || 0) > 0)
                              .map((b, bi) => (
                                <option key={bi} value={b.batchNo}>
                                  {b.batchNo} ({b.remainingQty !== undefined ? b.remainingQty : (b.stock || 0)})
                                </option>
                              ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={item.batch || ''}
                            placeholder="Batch No"
                            onChange={(e) => {
                              const val = e.target.value;
                              setOrderItems(orderItems.map(it => it.rowId === item.rowId ? { ...it, batch: val } : it));
                            }}
                            className="w-full border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black font-semibold"
                          />
                        )}
                      </td>

                      {/* Purchase Bill No (Inward Bill) */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={item.billNo || ''}
                          placeholder="Auto Bill No"
                          onChange={(e) => {
                            const val = e.target.value;
                            setOrderItems(orderItems.map(it => it.rowId === item.rowId ? { ...it, billNo: val } : it));
                          }}
                          className="w-full border border-blue-500 rounded px-2 py-1 text-xs bg-slate-50 text-indigo-900 font-semibold focus:bg-white outline-none"
                          title="Original Inward Purchase Bill No for this batch"
                        />
                      </td>

                      {/* Exp Date */}
                      <td className="px-3 py-2.5">
                        <input
                          type="date"
                          value={item.expDate || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOrderItems(orderItems.map(it => it.rowId === item.rowId ? { ...it, expDate: val } : it));
                          }}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-xs bg-white text-black"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQtyChange(item.rowId, e.target.value)}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-sm bg-white text-black text-center font-bold"
                        />
                      </td>

                      {/* MRP (₹) */}
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          step="0.01"
                          value={item.mrp || 0}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setOrderItems(orderItems.map(it => it.rowId === item.rowId ? { ...it, mrp: val } : it));
                          }}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-xs bg-white text-gray-700 font-semibold"
                        />
                      </td>

                      {/* Sale Price (₹) */}
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          step="0.01"
                          value={item.netUnitPrice}
                          onChange={(e) => handlePriceChange(item.rowId, e.target.value)}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-sm bg-white text-indigo-700 font-bold"
                        />
                      </td>

                      {/* Discount (₹) */}
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) => handleDiscountChange(item.rowId, e.target.value)}
                          className="w-full border border-blue-500 rounded px-1.5 py-1 text-xs bg-white text-black"
                        />
                      </td>

                      {/* Tax % with product's original tax and 0% toggle */}
                      <td className="px-3 py-2.5 text-center min-w-[135px]">
                        <div className="flex flex-col items-center gap-1.5">
                          {/* Tax Dropdown */}
                          <select
                            value={item.taxPercent}
                            onChange={(e) => handleTaxChange(item.rowId, e.target.value)}
                            className="w-full border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black font-bold text-center outline-none focus:border-indigo-600 shadow-sm"
                          >
                            {taxSlabsList.map((rate) => (
                              <option key={rate} value={rate}>
                                {rate === 0 ? '0% (Tax Free / Exempt)' : `${rate}% GST`}
                              </option>
                            ))}
                          </select>

                          {/* Quick 0% / Restore Tax Button */}
                          {item.taxPercent > 0 ? (
                            <button
                              type="button"
                              onClick={() => toggleZeroTax(item.rowId)}
                              className="w-full text-[10px] px-2 py-0.5 rounded font-bold transition-all bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 flex items-center justify-center gap-1 shadow-sm"
                              title="Iss product par 0% Tax lagane ke liye click karein"
                            >
                              <span>⚡ Make 0%</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleZeroTax(item.rowId)}
                              className="w-full text-[10px] px-2 py-0.5 rounded font-bold transition-all bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 flex items-center justify-center gap-1 shadow-sm"
                              title={`Click to restore original ${item.originalTaxPercent}% tax`}
                            >
                              <span>✓ 0% Free (Undo)</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td className="px-3 py-2.5 text-sm font-bold text-right text-gray-900">
                        ₹{getSubtotal(item).toFixed(2)}
                      </td>

                      {/* Delete */}
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.rowId)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="px-6 py-10 text-center text-xs text-gray-500 font-medium bg-white">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Info size={22} className="text-indigo-400" />
                        <span className="text-gray-700 font-semibold">Koi product select nahi hai.</span>
                        <span className="text-gray-400">Upar search box se product chuniye.</span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Table Totals Row */}
                <tr className="bg-slate-100 font-bold border-t-2 border-blue-500">
                  <td colSpan="4" className="px-4 py-3 text-xs uppercase text-gray-700">Total Quantities & Subtotal:</td>
                  <td className="px-3 py-3 text-center text-sm font-black text-gray-900">{totalQuantity}</td>
                  <td colSpan="4" className="px-3 py-3 text-right text-xs text-gray-600">Raw Items Total: ₹{rawSubTotal.toFixed(2)}</td>
                  <td className="px-3 py-3 text-sm font-black text-right text-emerald-800">
                    ₹{calculatedItemsSubtotal.toFixed(2)}
                  </td>
                  <td></td>
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
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-500"
            >
              <option value="No Tax">No Tax (0%)</option>
              {taxSlabsList.map((t) => (
                <option key={t} value={`${t}%`}>{t}% GST</option>
              ))}
            </select>
          </div>

          {/* Order Discount Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-500"
            >
              <option value="Flat">Flat Amount (₹)</option>
              <option value="Percentage">Percentage (%)</option>
            </select>
          </div>

          {/* Order Discount Value */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Discount Value</label>
            <input
              type="number"
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-500"
            />
          </div>

          {/* Shipping Cost */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Shipping Cost (₹)</label>
            <input
              type="number"
              step="0.01"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Status, File & Note fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attach Document / Invoice File */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Attach Invoice / Document</label>
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
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-500"
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
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-500"
              required
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Sale Note</label>
            <textarea
              rows="2"
              value={saleNote}
              onChange={(e) => setSaleNote(e.target.value)}
              placeholder="Sale invoice remarks..."
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-500 placeholder:text-gray-400"
            ></textarea>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Staff Note</label>
            <textarea
              rows="2"
              value={staffNote}
              onChange={(e) => setStaffNote(e.target.value)}
              placeholder="Internal comments..."
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-indigo-500 placeholder:text-gray-400"
            ></textarea>
          </div>
        </div>

        {/* Global Summary Ribbon */}
        <div className="bg-slate-50 border-2 border-indigo-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-6 gap-4 text-center font-semibold text-xs tracking-wider text-gray-700 uppercase shadow-sm">
          <div className="border-r border-indigo-200/50 last:border-none">
            <div className="text-gray-500 mb-1">Total Items</div>
            <div className="text-sm font-bold text-gray-900">{totalItemsCount} ({totalQuantity} Qty)</div>
          </div>
          <div className="border-r border-indigo-200/50 last:border-none">
            <div className="text-gray-500 mb-1">Items Total</div>
            <div className="text-sm font-bold text-gray-900">₹{rawSubTotal.toFixed(2)}</div>
          </div>
          <div className="border-r border-indigo-200/50 last:border-none">
            <div className="text-gray-500 mb-1">Order Tax</div>
            <div className="text-sm font-bold text-gray-900">₹{calculatedGlobalTax.toFixed(2)}</div>
          </div>
          <div className="border-r border-indigo-200/50 last:border-none">
            <div className="text-gray-500 mb-1">Discount</div>
            <div className="text-sm font-bold text-gray-900">₹{calculatedGlobalDiscount.toFixed(2)}</div>
          </div>
          <div className="border-r border-indigo-200/50 last:border-none">
            <div className="text-gray-500 mb-1">Shipping</div>
            <div className="text-sm font-bold text-gray-900">₹{Number(shippingCost).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-indigo-600 mb-1">Grand Total</div>
            <div className="text-base font-black text-indigo-700">₹{grandTotal.toFixed(2)}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
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
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold shadow-md transition-colors"
          >
            Submit Sale Invoice
          </button>
        </div>

      </form>

    </div>
  );
};

export default AddSale;
