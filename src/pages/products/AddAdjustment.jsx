import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, Plus, Upload, AlertCircle, Info, 
  AlertTriangle, Calendar, FileText, CheckCircle2, DollarSign, Package
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const AddAdjustment = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Form Header States
  const [warehouse, setWarehouse] = useState('');
  const [adjustmentDate, setAdjustmentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState(() => `ADJ-${Date.now().toString().slice(-6)}`);
  const [primaryReason, setPrimaryReason] = useState('Damage Loss');
  const [documentFile, setDocumentFile] = useState(null);
  const [note, setNote] = useState('');

  // Table Items State
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, warehousesRes] = await Promise.all([
          api.get('/products'),
          api.get('/catalogs/warehouses').catch(() => ({ data: { data: [] } }))
        ]);
        
        if (productsRes.data.success) {
          setProducts(productsRes.data.data);
        }
        if (warehousesRes.data && warehousesRes.data.success) {
          const whList = warehousesRes.data.data || [];
          setWarehouses(whList);
          if (whList.length === 1) {
            setWarehouse(whList[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Helper to fetch Purchase Invoice info for a batch
  const fetchBatchInvoiceDetails = async (batchNo, productCode) => {
    if (!batchNo || batchNo === 'None' || batchNo === 'Default') return null;
    try {
      const res = await api.get(`/products/batch-info?batchNo=${encodeURIComponent(batchNo)}&productCode=${encodeURIComponent(productCode)}`);
      if (res.data.success && res.data.data) {
        return res.data.data;
      }
    } catch (err) {
      console.warn('Batch invoice lookup failed:', err);
    }
    return null;
  };

  // Add Product to Table
  const handleSelectProduct = async (productId) => {
    if (!warehouse) {
      Swal.fire({
        icon: 'warning',
        title: 'Select Warehouse First',
        text: 'Please select a warehouse before adding products.'
      });
      return;
    }

    const product = products.find(p => p._id === productId);
    if (!product) return;

    const pCode = product.productCode || product.sku || 'N/A';
    const pName = product.productName;
    const pCost = Number(product.productCost) || 0;
    
    // Find warehouse specific stock
    const whStockObj = product.warehouseStocks?.find(ws => ws.warehouse === warehouse);
    const pStock = whStockObj ? whStockObj.stock : 0;

    // Check available batches
    const availableBatches = Array.isArray(product.batches) ? product.batches : [];
    let initialBatch = '';
    let initialMfg = product.mfgDate || '';
    let initialExp = product.expDate || '';
    let initialCost = pCost;
    let initialStock = pStock;

    if (availableBatches.length > 0) {
      // Pick first non-empty batch
      const bObj = availableBatches[0];
      initialBatch = bObj.batchNo || '';
      initialMfg = bObj.mfgDate || initialMfg;
      initialExp = bObj.expDate || initialExp;
      initialCost = Number(bObj.cost || bObj.purchaseRate) || pCost;
      if (bObj.stock !== undefined) {
        initialStock = bObj.stock;
      }
    } else if (product.batchNo) {
      initialBatch = product.batchNo;
    }

    // Default action and reason based on header primary reason
    let defaultAction = 'Subtract';
    let defaultReason = 'Damage';
    if (primaryReason.includes('Surplus') || primaryReason.includes('Excess')) {
      defaultAction = 'Add';
      defaultReason = 'Surplus Found';
    } else if (primaryReason.includes('Expired')) {
      defaultAction = 'Subtract';
      defaultReason = 'Expired Stock';
    } else if (primaryReason.includes('Shortage')) {
      defaultAction = 'Subtract';
      defaultReason = 'Physical Shortage';
    }

    const newItemId = `${pCode}-${initialBatch || 'default'}-${Date.now()}`;
    const newItem = {
      rowId: newItemId,
      productId: product._id,
      name: pName,
      code: pCode,
      brandName: product.brand?.name || '',
      batch: initialBatch,
      availableBatches: availableBatches,
      mfgDate: initialMfg,
      expDate: initialExp,
      invoiceNo: '',
      supplierName: '',
      cost: initialCost,
      currentStock: initialStock,
      actionType: defaultAction,
      reason: defaultReason,
      quantity: 1,
      remark: ''
    };

    // Auto-fetch Purchase Invoice for this batch
    if (initialBatch) {
      fetchBatchInvoiceDetails(initialBatch, pCode).then(info => {
        if (info) {
          setOrderItems(prev => prev.map(item => {
            if (item.rowId === newItemId) {
              return {
                ...item,
                invoiceNo: info.invoiceNo || item.invoiceNo,
                supplierName: info.supplierName || item.supplierName,
                expDate: info.expDate || item.expDate,
                mfgDate: info.mfgDate || item.mfgDate,
                cost: info.cost || item.cost
              };
            }
            return item;
          }));
        }
      });
    }

    setOrderItems(prev => [...prev, newItem]);
  };

  // Change Batch for an Item
  const handleBatchChange = async (rowId, newBatch) => {
    const targetItem = orderItems.find(i => i.rowId === rowId);
    if (!targetItem) return;

    let updatedExp = targetItem.expDate;
    let updatedMfg = targetItem.mfgDate;
    let updatedCost = targetItem.cost;
    let updatedStock = targetItem.currentStock;

    const matchedBatchObj = targetItem.availableBatches?.find(b => b.batchNo === newBatch);
    if (matchedBatchObj) {
      updatedExp = matchedBatchObj.expDate || '';
      updatedMfg = matchedBatchObj.mfgDate || '';
      updatedCost = Number(matchedBatchObj.cost || matchedBatchObj.purchaseRate) || updatedCost;
      if (matchedBatchObj.stock !== undefined) {
        updatedStock = matchedBatchObj.stock;
      }
    }

    // Update item immediately
    setOrderItems(prev => prev.map(item => {
      if (item.rowId === rowId) {
        return {
          ...item,
          batch: newBatch,
          expDate: updatedExp,
          mfgDate: updatedMfg,
          cost: updatedCost,
          currentStock: updatedStock
        };
      }
      return item;
    }));

    // Async lookup invoice
    if (newBatch) {
      const invoiceData = await fetchBatchInvoiceDetails(newBatch, targetItem.code);
      if (invoiceData) {
        setOrderItems(prev => prev.map(item => {
          if (item.rowId === rowId) {
            return {
              ...item,
              invoiceNo: invoiceData.invoiceNo || item.invoiceNo,
              supplierName: invoiceData.supplierName || item.supplierName,
              cost: invoiceData.cost || item.cost,
              expDate: invoiceData.expDate || item.expDate,
              mfgDate: invoiceData.mfgDate || item.mfgDate
            };
          }
          return item;
        }));
      }
    }
  };

  // Update item field generically
  const handleItemFieldChange = (rowId, field, value) => {
    setOrderItems(prev => prev.map(item => {
      if (item.rowId === rowId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Delete item from table
  const handleDeleteItem = (rowId) => {
    setOrderItems(prev => prev.filter(item => item.rowId !== rowId));
  };

  // File Upload handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  // Summary Calculations
  const totalItemsCount = orderItems.length;
  const totalAdjustedUnits = orderItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  
  const totalLossValue = orderItems
    .filter(item => item.actionType === 'Subtract')
    .reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.cost) || 0)), 0);

  const totalGainValue = orderItems
    .filter(item => item.actionType === 'Add')
    .reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.cost) || 0)), 0);

  const netImpactValue = totalGainValue - totalLossValue;

  // Form Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!warehouse) {
      Swal.fire({ icon: 'warning', title: 'Missing Information', text: 'Please select a warehouse first.' });
      return;
    }
    if (orderItems.length === 0) {
      Swal.fire({ icon: 'warning', title: 'No Items Added', text: 'Please add at least one product with its batch and reason to adjust.' });
      return;
    }

    // Confirmation prompt with details
    const confirmResult = await Swal.fire({
      title: 'Confirm Stock Adjustment?',
      html: `
        <div class="text-left text-sm space-y-2 p-2 bg-gray-50 rounded border border-gray-200">
          <p><strong>Warehouse:</strong> ${warehouse}</p>
          <p><strong>Reference:</strong> ${referenceNo}</p>
          <p><strong>Total Items:</strong> ${totalItemsCount} (${totalAdjustedUnits} units)</p>
          <p class="text-rose-600"><strong>Total Loss / Damage:</strong> $${totalLossValue.toFixed(2)}</p>
          <p class="text-emerald-600"><strong>Total Surplus / Gain:</strong> $${totalGainValue.toFixed(2)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit Adjustment',
      cancelButtonText: 'Review Again',
      confirmButtonColor: '#4f46e5'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      let docUrl = null;
      if (documentFile) {
        const formData = new FormData();
        formData.append('file', documentFile);
        try {
          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data.success) {
            docUrl = uploadRes.data.url;
          }
        } catch (error) {
          console.warn('Document upload skipped or failed:', error);
        }
      }

      const formattedItems = orderItems.map(item => ({
        name: item.name,
        code: item.code,
        batch: item.batch || '',
        mfgDate: item.mfgDate || '',
        expDate: item.expDate || '',
        invoiceNo: item.invoiceNo || '',
        cost: Number(item.cost) || 0,
        currentStock: Number(item.currentStock) || 0,
        actionType: item.actionType || 'Subtract',
        reason: item.reason || 'Damage',
        quantity: Math.abs(Number(item.quantity) || 1),
        totalCost: (Math.abs(Number(item.quantity) || 1)) * (Number(item.cost) || 0),
        remark: item.remark || ''
      }));

      const payload = {
        reference: referenceNo,
        date: adjustmentDate,
        warehouse,
        lossType: primaryReason,
        documentName: docUrl,
        items: formattedItems,
        totalQuantity: totalAdjustedUnits,
        totalLossCost: totalLossValue,
        totalGainCost: totalGainValue,
        netAmount: netImpactValue,
        note
      };

      const res = await api.post('/products/adjustments', payload);
      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Adjustment Saved Successfully!',
          text: `Adjustment Ref: ${referenceNo} posted. Stock & batches have been updated in ${warehouse}.`
        });

        // Reset Form
        setWarehouse('');
        setDocumentFile(null);
        setOrderItems([]);
        setNote('');
        setReferenceNo(`ADJ-${Date.now().toString().slice(-6)}`);
      }
    } catch (error) {
      console.error('Error creating adjustment:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      Swal.fire({ icon: 'error', title: 'Submission Failed', text: 'Failed to create adjustment: ' + errorMsg });
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header */}
      <div className="mb-6 border-b border-blue-500 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Package className="text-indigo-600" size={26} />
            Stock Adjustment & Expiry/Damage Reconciliation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Capture minute details: damage, expiry, physical shortages (kami), surplus (badhe), batch numbers, and purchase invoices.
          </p>
        </div>

        {/* Live Reference Badge */}
        <div className="bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-800 flex items-center gap-2">
          <span>Ref No:</span>
          <span className="font-mono font-bold">{referenceNo}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Top Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-blue-300">
          
          {/* Warehouse */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Warehouse *
            </label>
            <select
              value={warehouse}
              onChange={(e) => {
                setWarehouse(e.target.value);
                setOrderItems([]); // Clear table if warehouse changes to avoid stock mismatch
              }}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450 font-medium"
              required
            >
              <option value="">-- Select Warehouse --</option>
              {warehouses.map(w => (
                <option key={w._id} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Adjustment Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Adjustment Date
            </label>
            <input 
              type="date"
              value={adjustmentDate}
              onChange={(e) => setAdjustmentDate(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
            />
          </div>

          {/* Primary Reason / Adjustment Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Primary Reason Type
            </label>
            <select
              value={primaryReason}
              onChange={(e) => setPrimaryReason(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450 font-medium"
            >
              <option value="Damage Loss">Damage & Breakage (Toot-phoot / Damage)</option>
              <option value="Expired Stock Disposal">Expired Stock Disposal (Expiry Date Over)</option>
              <option value="Physical Shortage">Physical Shortage (Ginti me Kami / Missing)</option>
              <option value="Stock Surplus Found">Stock Surplus Found (Ginti me Badhe / Excess)</option>
              <option value="Quality Rejection">Quality Rejection (Defective Batch Return)</option>
              <option value="Sample Lab Testing">Internal Sample & Lab Testing</option>
              <option value="General Inventory Correction">General Inventory Correction</option>
            </select>
          </div>

          {/* Attach Document / Proof */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Disposal / Damage Document
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 border border-blue-500 rounded cursor-pointer hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors bg-white">
                <Upload size={13} className="text-gray-500" />
                <span>Upload</span>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="hidden" 
                />
              </label>
              <span className="text-xs text-gray-500 truncate max-w-[140px]" title={documentFile ? documentFile.name : 'No file chosen'}>
                {documentFile ? documentFile.name : 'No file chosen'}
              </span>
            </div>
          </div>

        </div>

        {/* Product Selection Dropdown with Search */}
        <div className="relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
            <span>Select Product to Adjust *</span>
            <span className="text-[11px] font-normal text-gray-500 lowercase normal-case">
              (shows products with available batches and warehouse stocks)
            </span>
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <select
              disabled={!warehouse}
              onChange={(e) => {
                if (e.target.value) {
                  handleSelectProduct(e.target.value);
                  e.target.value = ""; // Reset after selection
                }
              }}
              className="w-full border border-blue-500 rounded pl-9 pr-3 py-2.5 text-sm bg-white text-black outline-none focus:border-blue-450 font-medium"
            >
              <option value="">
                {warehouse 
                  ? "-- Click here to choose a product from this warehouse --" 
                  : "-- Please select a warehouse above first --"}
              </option>
              {warehouse && products.map(product => {
                const whStockObj = product.warehouseStocks?.find(ws => ws.warehouse === warehouse);
                const whStock = whStockObj ? whStockObj.stock : (product.currentStock || 0);
                const batchCount = Array.isArray(product.batches) ? product.batches.length : (product.batchNo ? 1 : 0);
                return (
                  <option key={product._id} value={product._id}>
                    {product.productName} ({product.productCode}) — Wh. Stock: {whStock} | Batches: {batchCount}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Adjustment Order Table Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <span>Adjustment Items Table</span>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                {orderItems.length} Products
              </span>
            </h2>
            <span className="text-xs text-gray-500">
              Set Batch No, Inward Invoice, Expiry, Action (Kami / Badhe), and Unit Cost per line item.
            </span>
          </div>
          
          <div className="overflow-x-auto border border-blue-500 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100/80 border-b border-blue-500 text-gray-700 font-bold uppercase">
                  <th className="px-3 py-3 w-48">Product</th>
                  <th className="px-3 py-3 w-36">Batch No</th>
                  <th className="px-3 py-3 w-32">Expiry Date</th>
                  <th className="px-3 py-3 w-32">Invoice Ref #</th>
                  <th className="px-3 py-3 w-24">Curr. Stock</th>
                  <th className="px-3 py-3 w-32">Action (Kami/Badhe)</th>
                  <th className="px-3 py-3 w-36">Reason Type</th>
                  <th className="px-3 py-3 w-24 text-center">Adj. Qty</th>
                  <th className="px-3 py-3 w-28 text-right">Unit Cost</th>
                  <th className="px-3 py-3 w-28 text-right">Total Impact</th>
                  <th className="px-3 py-3 w-40">Remark / Detail</th>
                  <th className="px-3 py-3 w-12 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500 bg-white">
                {orderItems.length > 0 ? (
                  orderItems.map((item) => {
                    const isSubtract = item.actionType === 'Subtract';
                    const isExpired = item.expDate && new Date(item.expDate) < new Date();
                    const lineTotal = (Number(item.quantity) || 0) * (Number(item.cost) || 0);

                    return (
                      <tr key={item.rowId} className="hover:bg-gray-50/80 transition-colors">
                        
                        {/* Product Info */}
                        <td className="px-3 py-3 font-semibold text-gray-900">
                          <div>{item.name}</div>
                          <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>{item.code}</span>
                            {item.brandName && (
                              <span className="bg-blue-50 text-blue-700 px-1 py-0.2 rounded border border-blue-200">
                                {item.brandName}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Batch No (Dropdown if available or text input) */}
                        <td className="px-3 py-3">
                          {item.availableBatches && item.availableBatches.length > 0 ? (
                            <select
                              value={item.batch}
                              onChange={(e) => handleBatchChange(item.rowId, e.target.value)}
                              className="w-full border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black outline-none font-medium"
                            >
                              <option value="">-- Select Batch --</option>
                              {item.availableBatches.map((b, idx) => (
                                <option key={idx} value={b.batchNo}>
                                  {b.batchNo} {b.stock !== undefined ? `(Stk: ${b.stock})` : ''}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="Batch No (e.g. B-01)"
                              value={item.batch}
                              onChange={(e) => handleItemFieldChange(item.rowId, 'batch', e.target.value)}
                              className="w-full border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black outline-none font-medium"
                            />
                          )}
                        </td>

                        {/* Expiry Date */}
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <input
                              type="date"
                              value={item.expDate}
                              onChange={(e) => handleItemFieldChange(item.rowId, 'expDate', e.target.value)}
                              className="border border-blue-500 rounded px-1.5 py-1 text-xs bg-white text-black outline-none"
                            />
                            {isExpired && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded w-max">
                                <AlertTriangle size={10} /> Expired
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Invoice Ref # */}
                        <td className="px-3 py-3">
                          <input
                            type="text"
                            placeholder="e.g. INV-1092"
                            value={item.invoiceNo}
                            onChange={(e) => handleItemFieldChange(item.rowId, 'invoiceNo', e.target.value)}
                            className="w-full border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black outline-none font-mono"
                            title={item.supplierName ? `Supplier: ${item.supplierName}` : 'Original Purchase Invoice Reference'}
                          />
                          {item.supplierName && (
                            <div className="text-[10px] text-gray-500 truncate max-w-[120px] mt-0.5" title={item.supplierName}>
                              {item.supplierName}
                            </div>
                          )}
                        </td>

                        {/* Current Available Stock */}
                        <td className="px-3 py-3 text-center">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                            {item.currentStock}
                          </span>
                        </td>

                        {/* Action: Kami / Badhe */}
                        <td className="px-3 py-3">
                          <select
                            value={item.actionType}
                            onChange={(e) => handleItemFieldChange(item.rowId, 'actionType', e.target.value)}
                            className={`w-full border rounded px-2 py-1 text-xs font-bold outline-none ${
                              isSubtract 
                                ? 'border-rose-400 text-rose-700 bg-rose-50' 
                                : 'border-emerald-400 text-emerald-700 bg-emerald-50'
                            }`}
                          >
                            <option value="Subtract">(-) Kami (Loss)</option>
                            <option value="Add">(+) Badhe (Surplus)</option>
                          </select>
                        </td>

                        {/* Specific Reason */}
                        <td className="px-3 py-3">
                          <select
                            value={item.reason}
                            onChange={(e) => handleItemFieldChange(item.rowId, 'reason', e.target.value)}
                            className="w-full border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black outline-none"
                          >
                            <option value="Damage">Damage / Broken</option>
                            <option value="Expired Stock">Expired Stock</option>
                            <option value="Physical Shortage">Physical Shortage / Theft</option>
                            <option value="Surplus Found">Surplus Found (Excess)</option>
                            <option value="Quality Rejection">Quality Rejection</option>
                            <option value="Sample Lab Testing">Sample / Lab Test</option>
                            <option value="Data Correction">Data Correction</option>
                          </select>
                        </td>

                        {/* Adj Qty */}
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              handleItemFieldChange(item.rowId, 'quantity', val);
                            }}
                            className="w-16 border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black font-bold text-center outline-none mx-auto block"
                          />
                        </td>

                        {/* Unit Cost */}
                        <td className="px-3 py-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.cost}
                            onChange={(e) => handleItemFieldChange(item.rowId, 'cost', parseFloat(e.target.value) || 0)}
                            className="w-20 border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black font-semibold text-right outline-none"
                          />
                        </td>

                        {/* Total Line Impact */}
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span className={`font-bold ${isSubtract ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isSubtract ? '-' : '+'}${lineTotal.toFixed(2)}
                          </span>
                        </td>

                        {/* Specific Remarks */}
                        <td className="px-3 py-3">
                          <input
                            type="text"
                            placeholder="e.g. Broken seal, box leak..."
                            value={item.remark}
                            onChange={(e) => handleItemFieldChange(item.rowId, 'remark', e.target.value)}
                            className="w-full border border-blue-500 rounded px-2 py-1 text-xs bg-white text-black outline-none placeholder:text-gray-400"
                          />
                        </td>

                        {/* Remove Action */}
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.rowId)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Remove this item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="12" className="px-6 py-10 text-center text-xs text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Info size={22} className="text-gray-400" />
                        <span className="font-semibold text-gray-700">No products added for adjustment yet.</span>
                        <span className="text-gray-500 text-[11px]">Select a warehouse and pick products from the dropdown above to begin.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- SUMMARY IMPACT CARDS --- */}
        {orderItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-blue-300">
            <div className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200">
              <Package className="text-indigo-600" size={24} />
              <div>
                <div className="text-[11px] font-semibold uppercase text-gray-500">Adjusted Items</div>
                <div className="text-base font-bold text-gray-900">{totalItemsCount} Products ({totalAdjustedUnits} Units)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded border border-rose-200">
              <AlertCircle className="text-rose-600" size={24} />
              <div>
                <div className="text-[11px] font-semibold uppercase text-rose-600">Total Loss (Damage / Expired)</div>
                <div className="text-base font-bold text-rose-600">-${totalLossValue.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded border border-emerald-200">
              <CheckCircle2 className="text-emerald-600" size={24} />
              <div>
                <div className="text-[11px] font-semibold uppercase text-emerald-600">Total Gain (Surplus / Excess)</div>
                <div className="text-base font-bold text-emerald-600">+${totalGainValue.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded border border-indigo-200">
              <DollarSign className="text-indigo-600" size={24} />
              <div>
                <div className="text-[11px] font-semibold uppercase text-indigo-600">Net Inventory Valuation Impact</div>
                <div className={`text-base font-bold ${netImpactValue >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {netImpactValue >= 0 ? '+' : '-'}${Math.abs(netImpactValue).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overall Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            General Adjustment Note / Reason Summary
          </label>
          <textarea
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mention any physical audit inspection report details, committee approvals, or disposal reasons..."
            className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-blue-500">
          <button
            type="button"
            onClick={() => {
              setWarehouse('');
              setDocumentFile(null);
              setOrderItems([]);
              setNote('');
              setReferenceNo(`ADJ-${Date.now().toString().slice(-6)}`);
            }}
            className="px-5 py-2.5 border border-blue-500 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset Form
          </button>
          <button
            type="submit"
            className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md transition-colors"
          >
            Submit Stock Adjustment
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddAdjustment;
