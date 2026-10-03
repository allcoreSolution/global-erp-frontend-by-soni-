import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, Upload, FileDown, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, AlertCircle, X, Filter 
} from 'lucide-react';
import api from '../../api';
import Swal from 'sweetalert2';

const ProductList = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterType, setFilterType] = useState('All Time'); // All Time, Date Range, Monthly, Yearly
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedMonth, setSelectedMonth] = useState(''); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(''); // YYYY
  
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const fileInputRef = useRef(null);

  // Form State for Edit (inline edit modal example)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    code: '',
    brand: '',
    category: '',
    price: 0,
    cost: 0,
    qty: 0,
    unit: 'pcs'
  });

  // Handle Search and Category Filter
  const hasSearched = searchTerm.trim() !== '' || selectedCategory !== 'All' || filterType !== 'All Time';

  const filteredProducts = products.filter(product => {
    const pName = product.productName || '';
    const pCode = product.productCode || '';
    const pBrand = product.brand?.name || '';
    const pCat = product.category?.name || '';

    const matchesSearch = 
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pBrand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || pCat === selectedCategory;

    // Advanced Time/Date Filter Logic
    let matchesTime = true;
    if (filterType !== 'All Time' && product.createdAt) {
      const productDate = new Date(product.createdAt);
      
      if (filterType === 'Date Range') {
        if (dateRange.start) {
          const startDate = new Date(dateRange.start);
          startDate.setHours(0, 0, 0, 0);
          if (productDate < startDate) matchesTime = false;
        }
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (productDate > endDate) matchesTime = false;
        }
      } 
      else if (filterType === 'Monthly' && selectedMonth) {
        // selectedMonth is in 'YYYY-MM' format
        const [year, month] = selectedMonth.split('-');
        if (productDate.getFullYear().toString() !== year || (productDate.getMonth() + 1).toString().padStart(2, '0') !== month) {
          matchesTime = false;
        }
      }
      else if (filterType === 'Yearly' && selectedYear) {
        if (productDate.getFullYear().toString() !== selectedYear) {
          matchesTime = false;
        }
      }
    }

    return matchesSearch && matchesCategory && matchesTime;
  });

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredProducts.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredProducts.length / recordsPerPage);

  // Open Actions Modals
  const handleOpenViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Submit inline edit modal form
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productName: editProductForm.name,
        productCode: editProductForm.code,
        // Assuming we are not editing brand/category easily inline, or they are just strings here
        productPrice: editProductForm.price,
        productCost: editProductForm.cost,
        currentStock: editProductForm.qty,
        productUnit: editProductForm.unit
      };
      await api.put(`/products/${selectedProduct._id}`, payload);
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Unique categories list for filters
  const categoriesList = ['All', ...new Set(products.map(p => p.category?.name || 'Uncategorized'))];

  const handleDownloadSample = () => {
    const headers = [
      'Product Type', 'Product Name', 'Product Code', 'SKU', 'Barcode Symbology', 
      'Brand', 'Category', 'Product Unit', 'Sale Unit', 'Purchase Unit', 
      'Product Cost', 'Profit Margin Type', 'Profit Margin', 'Product Price', 'Wholesale Price', 
      'Daily Sale Objective', 'Alert Quantity', 'Product Tax', 'Tax Method', 
      'Warranty Value', 'Warranty Unit', 'Guarantee Value', 'Guarantee Unit', 
      'Is Featured', 'Is Embedded Barcode', 'Has Initial Stock', 'Initial Stock Qty', 'Initial Stock Warehouse', 
      'Current Stock', 'Is Active', 'Product Details', 'Has Variant', 'Has Different Price Per Warehouse', 
      'Has Batch And Expiry', 'Has IMEI Or Serial', 'Has Promo Price'
    ];
    const dummyData = [
      'Standard', 'Sample Shoes', 'PROD-1001', 'SKU-001', 'CODE128',
      'Nike', 'Footwear', 'Pairs', 'Pairs', 'Pairs',
      '500', 'Percentage', '50', '1000', '800',
      '10', '5', '18%', 'Exclusive',
      '1', 'Year', '1', 'Year',
      'Yes', 'No', 'Yes', '50', 'Main Warehouse',
      '50', 'Yes', 'Comfortable running shoes.', 'No', 'No',
      'No', 'No', 'No'
    ];
    const csvContent = headers.join(',') + '\n' + dummyData.map(d => `"${d}"`).join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    if (products.length === 0) {
      Swal.fire('No Data', 'No products available to export.', 'warning');
      return;
    }
    const headers = [
      'Product Type', 'Product Name', 'Product Code', 'SKU', 'Barcode Symbology', 
      'Brand', 'Category', 'Product Unit', 'Sale Unit', 'Purchase Unit', 
      'Product Cost', 'Profit Margin Type', 'Profit Margin', 'Product Price', 'Wholesale Price', 
      'Daily Sale Objective', 'Alert Quantity', 'Product Tax', 'Tax Method', 
      'Warranty Value', 'Warranty Unit', 'Guarantee Value', 'Guarantee Unit', 
      'Is Featured', 'Is Embedded Barcode', 'Has Initial Stock', 'Initial Stock Qty', 'Initial Stock Warehouse', 
      'Current Stock', 'Is Active', 'Product Details', 'Has Variant', 'Has Different Price Per Warehouse', 
      'Has Batch And Expiry', 'Has IMEI Or Serial', 'Has Promo Price'
    ];
    
    const rows = products.map(p => [
      `"${p.productType || ''}"`,
      `"${p.productName || ''}"`,
      `"${p.productCode || ''}"`,
      `"${p.sku || ''}"`,
      `"${p.barcodeSymbology || ''}"`,
      `"${p.brand?.name || ''}"`,
      `"${p.category?.name || ''}"`,
      `"${p.productUnit || ''}"`,
      `"${p.saleUnit || ''}"`,
      `"${p.purchaseUnit || ''}"`,
      `"${p.productCost || ''}"`,
      `"${p.profitMarginType || ''}"`,
      `"${p.profitMargin || ''}"`,
      `"${p.productPrice || ''}"`,
      `"${p.wholesalePrice || ''}"`,
      `"${p.dailySaleObjective || ''}"`,
      `"${p.alertQuantity || ''}"`,
      `"${p.productTax || ''}"`,
      `"${p.taxMethod || ''}"`,
      `"${p.warrantyValue || ''}"`,
      `"${p.warrantyUnit || ''}"`,
      `"${p.guaranteeValue || ''}"`,
      `"${p.guaranteeUnit || ''}"`,
      p.isFeatured ? 'true' : 'false',
      p.isEmbeddedBarcode ? 'true' : 'false',
      p.hasInitialStock ? 'true' : 'false',
      `"${p.initialStockQty || ''}"`,
      `"${p.initialStockWarehouse || ''}"`,
      p.currentStock || '0',
      p.isActive ? 'true' : 'false',
      `"${(p.productDetails || '').replace(/"/g, '""')}"`,
      p.hasVariant ? 'true' : 'false',
      p.hasDifferentPricePerWarehouse ? 'true' : 'false',
      p.hasBatchAndExpiry ? 'true' : 'false',
      p.hasImeiOrSerial ? 'true' : 'false',
      p.hasPromoPrice ? 'true' : 'false'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) {
        Swal.fire('Error', 'CSV file is empty or invalid.', 'error');
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const importedData = [];
      
      for (let i = 1; i < lines.length; i++) {
        // Simple comma split, careful with quotes
        let values = [];
        let curVal = '';
        let inQuotes = false;
        const line = lines[i];
        for(let j=0; j<line.length; j++) {
            if(line[j] === '"') inQuotes = !inQuotes;
            else if(line[j] === ',' && !inQuotes) { values.push(curVal); curVal = ''; }
            else curVal += line[j];
        }
        values.push(curVal);

        const pData = {};
        headers.forEach((header, index) => {
          pData[header] = values[index] ? values[index].trim() : '';
        });
        
        // Deduplication by productCode
        const pCode = pData['Product Code'];
        const pName = pData['Product Name'];
        const isDuplicate = products.some(p => 
          (pCode && p.productCode && p.productCode.toLowerCase() === pCode.toLowerCase())
        );
        
        if (!isDuplicate && pCode && pName) {
          importedData.push(pData);
        }
      }
      
      if (importedData.length === 0) {
        Swal.fire('Notice', 'No new products found or all are duplicates/missing mandatory fields.', 'info');
        e.target.value = '';
        return;
      }
      
      try {
        Swal.fire({ title: 'Importing...', text: 'Please wait', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        for (const data of importedData) {
          const payload = {
            productType: data['Product Type'] || 'Standard',
            productName: data['Product Name'],
            productCode: data['Product Code'],
            sku: data['SKU'] || '',
            barcodeSymbology: data['Barcode Symbology'] || 'CODE128',
            brand: data['Brand'] || '',
            category: data['Category'] || '',
            productUnit: data['Product Unit'] || 'Pcs',
            saleUnit: data['Sale Unit'] || 'Pcs',
            purchaseUnit: data['Purchase Unit'] || 'Pcs',
            productCost: data['Product Cost'] || '0',
            profitMarginType: data['Profit Margin Type'] || 'Percentage',
            profitMargin: data['Profit Margin'] || '0',
            productPrice: data['Product Price'] || '0',
            wholesalePrice: data['Wholesale Price'] || '0',
            dailySaleObjective: data['Daily Sale Objective'] || '0',
            alertQuantity: data['Alert Quantity'] || '0',
            productTax: data['Product Tax'] || '',
            taxMethod: data['Tax Method'] || 'Exclusive',
            warrantyValue: data['Warranty Value'] || '',
            warrantyUnit: data['Warranty Unit'] || '',
            guaranteeValue: data['Guarantee Value'] || '',
            guaranteeUnit: data['Guarantee Unit'] || '',
            isFeatured: data['Is Featured'] === 'Yes' || data['Is Featured'] === 'true',
            isEmbeddedBarcode: data['Is Embedded Barcode'] === 'Yes' || data['Is Embedded Barcode'] === 'true',
            hasInitialStock: data['Has Initial Stock'] === 'Yes' || data['Has Initial Stock'] === 'true',
            initialStockQty: data['Initial Stock Qty'] || '0',
            initialStockWarehouse: data['Initial Stock Warehouse'] || '',
            currentStock: Number(data['Current Stock']) || 0,
            isActive: data['Is Active'] === 'Yes' || data['Is Active'] === 'true' || data['Is Active'] === '',
            productDetails: data['Product Details'] || '',
            hasVariant: data['Has Variant'] === 'Yes' || data['Has Variant'] === 'true',
            hasDifferentPricePerWarehouse: data['Has Different Price Per Warehouse'] === 'Yes' || data['Has Different Price Per Warehouse'] === 'true',
            hasBatchAndExpiry: data['Has Batch And Expiry'] === 'Yes' || data['Has Batch And Expiry'] === 'true',
            hasImeiOrSerial: data['Has IMEI Or Serial'] === 'Yes' || data['Has IMEI Or Serial'] === 'true',
            hasPromoPrice: data['Has Promo Price'] === 'Yes' || data['Has Promo Price'] === 'true'
          };
          await api.post('/products', payload);
        }
        Swal.fire('Success', `${importedData.length} Products imported successfully!`, 'success');
        fetchProducts();
      } catch (err) {
        console.error('Import error:', err);
        Swal.fire('Error', 'Failed to import products.', 'error');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Stock List</h1>
          <p className="text-sm text-gray-600">Track current items warehouse stock, prices and values.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 w-full md:w-auto pb-1 md:pb-0">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          <button onClick={handleExportCSV} className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded shadow-sm transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={() => navigate('/purchases/add-purchase')} className="whitespace-nowrap flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Filter and Limit Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Records per page:</span>
            <select 
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-blue-450"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            <span className="text-sm text-gray-700">Category:</span>
            <select 
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-blue-450"
            >
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Time filter Type */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Filter By:</span>
            <select 
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-blue-450 font-semibold"
            >
              <option value="All Time">All Time</option>
              <option value="Date Range">Date Range</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          {/* Dynamic Inputs based on Filter Type */}
          {filterType === 'Date Range' && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="border border-blue-500 rounded px-2 py-1 text-xs bg-white outline-none"
                title="From Date"
              />
              <span className="text-gray-500 text-xs">to</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="border border-blue-500 rounded px-2 py-1 text-xs bg-white outline-none"
                title="To Date"
              />
            </div>
          )}

          {filterType === 'Monthly' && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <input 
                type="month" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none"
              />
            </div>
          )}

          {filterType === 'Yearly' && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <input 
                type="number" 
                placeholder="YYYY"
                min="2000"
                max="2100"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none w-24"
              />
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Product Name/Code/Brand..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-9 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Products Table View */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">Product</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">Code</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">Brand</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">Category</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">HSN</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">Cost</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">Price</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">Stock Qty</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">Alert Qty</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">Warranty</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 whitespace-nowrap">Guarantee</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Product Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {product.productName}
                  </td>
                  {/* Code */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.productCode}
                  </td>
                  {/* Brand */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.brand?.name || 'N/A'}
                  </td>
                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.category?.name || 'N/A'}
                  </td>
                  {/* HSN */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.hsnNumber || '-'}
                  </td>
                  {/* Cost */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${Number(product.productCost || 0).toFixed(2)}
                  </td>
                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-700">
                    ${Number(product.productPrice || 0).toFixed(2)}
                  </td>
                  {/* Stock Quantity */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {product.currentStock || 0} {product.productUnit || ''}
                  </td>
                  {/* Alert Qty */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-rose-600 font-semibold">
                    {product.alertQuantity || 0}
                  </td>
                  {/* Warranty */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.warrantyValue ? `${product.warrantyValue} ${product.warrantyUnit}` : '-'}
                  </td>
                  {/* Guarantee */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {product.guaranteeValue ? `${product.guaranteeValue} ${product.guaranteeUnit}` : '-'}
                  </td>
                  {/* Actions (View, Edit, Delete) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1.5">
                      
                      {/* View Action */}
                      <button
                        onClick={() => handleOpenViewModal(product)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <Search size={24} className="text-gray-400" />
                    <span>No products found matching filters.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="text-xs font-semibold text-gray-600">
            Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredProducts.length)} of {filteredProducts.length} records
          </div>

          <div className="inline-flex items-center border border-blue-500 rounded divide-x divide-blue-500 shadow-sm bg-white">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 text-gray-600 transition-colors ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  currentPage === i + 1 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 text-gray-600 transition-colors ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* --- INLINE EDIT PRODUCT DIALOG MODAL --- */}
      {isEditModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-md w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-500 pb-2">
              Edit Product Details
            </h3>

            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Product Name *</label>
                <input 
                  type="text"
                  required
                  value={editProductForm.name}
                  onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                  className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Product Code *</label>
                  <input 
                    type="text"
                    required
                    value={editProductForm.code}
                    onChange={(e) => setEditProductForm({ ...editProductForm, code: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Brand</label>
                  <input 
                    type="text"
                    value={editProductForm.brand}
                    onChange={(e) => setEditProductForm({ ...editProductForm, brand: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Cost ($) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={editProductForm.cost}
                    onChange={(e) => setEditProductForm({ ...editProductForm, cost: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Price ($) *</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={editProductForm.price}
                    onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Stock Quantity *</label>
                  <input 
                    type="number"
                    required
                    value={editProductForm.qty}
                    onChange={(e) => setEditProductForm({ ...editProductForm, qty: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Unit *</label>
                  <input 
                    type="text"
                    required
                    value={editProductForm.unit}
                    onChange={(e) => setEditProductForm({ ...editProductForm, unit: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm text-black bg-white outline-none focus:border-blue-450"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-blue-500">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-blue-500 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-sm font-semibold shadow transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW PRODUCT DETAILS DIALOG MODAL --- */}
      {isViewModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-blue-500 shadow-2xl max-w-2xl w-full p-6 relative text-black animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-blue-500 pb-2">
              Product Overview Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-2 text-sm">
              <div className="flex flex-col border-b border-blue-200 pb-2">
                <span className="font-semibold text-gray-500 text-xs uppercase mb-1">Product Name</span>
                <span className="font-bold text-gray-900 text-base">{selectedProduct.productName}</span>
              </div>
              <div className="flex flex-col border-b border-blue-200 pb-2">
                <span className="font-semibold text-gray-500 text-xs uppercase mb-1">Product Code</span>
                <span className="text-gray-900 font-mono font-bold text-base">{selectedProduct.productCode}</span>
              </div>
              <div className="flex flex-col border-b border-blue-200 pb-2">
                <span className="font-semibold text-gray-500 text-xs uppercase mb-1">Brand</span>
                <span className="text-gray-900 font-medium">{selectedProduct.brand?.name || selectedProduct.brand || '-'}</span>
              </div>
              <div className="flex flex-col border-b border-blue-200 pb-2">
                <span className="font-semibold text-gray-500 text-xs uppercase mb-1">Category</span>
                <span className="text-gray-900 font-medium">{selectedProduct.category?.name || selectedProduct.category || '-'}</span>
              </div>
              <div className="flex flex-col border-b border-blue-200 pb-2">
                <span className="font-semibold text-gray-500 text-xs uppercase mb-1">Product Cost</span>
                <span className="text-gray-900 font-bold">${Number(selectedProduct.productCost || 0).toFixed(2)}</span>
              </div>
              <div className="flex flex-col border-b border-blue-200 pb-2">
                <span className="font-semibold text-gray-500 text-xs uppercase mb-1">Product Price</span>
                <span className="font-bold text-emerald-700 text-base">${Number(selectedProduct.productPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex flex-col border-b border-blue-200 pb-2">
                <span className="font-semibold text-gray-500 text-xs uppercase mb-1">HSN Number</span>
                <span className="text-gray-900 font-medium">{selectedProduct.hsnNumber || '-'}</span>
              </div>
              <div className="flex flex-col border-b border-blue-200 pb-2">
                <span className="font-semibold text-gray-500 text-xs uppercase mb-1">Stock Available</span>
                <span className="font-bold text-indigo-700 text-base">{selectedProduct.currentStock || 0} {selectedProduct.productUnit || ''}</span>
              </div>
              <div className="flex flex-col border-b border-blue-200 pb-2">
                <span className="font-semibold text-gray-500 text-xs uppercase mb-1">Alert Quantity</span>
                <span className="text-rose-600 font-bold">{selectedProduct.alertQuantity || 0}</span>
              </div>
              <div className="flex flex-col border-b border-blue-200 pb-2">
                <span className="font-semibold text-gray-500 text-xs uppercase mb-1">Warranty</span>
                <span className="text-gray-900 font-medium">{selectedProduct.warrantyValue ? `${selectedProduct.warrantyValue} ${selectedProduct.warrantyUnit}` : '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-500 text-xs uppercase mb-1">Guarantee</span>
                <span className="text-gray-900 font-medium">{selectedProduct.guaranteeValue ? `${selectedProduct.guaranteeValue} ${selectedProduct.guaranteeUnit}` : '-'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-blue-500 mt-6">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded shadow-md text-sm font-bold tracking-wide transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductList;
