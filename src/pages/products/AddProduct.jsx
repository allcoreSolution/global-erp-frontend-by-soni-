import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, HelpCircle, Code, Plus, ArrowRight, Settings, Percent, Info } from 'lucide-react';
import api from '../../api';

const AddProduct = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    productType: 'Standard',
    productName: '',
    productCode: '',
    barcodeSymbology: 'Code 128',
    brand: '',
    category: '',
    productUnit: '',
    saleUnit: '',
    purchaseUnit: '',
    productCost: '',
    profitMarginType: 'Percentage (%)',
    profitMargin: '25.00',
    productPrice: '0.00',
    wholesalePrice: '',
    dailySaleObjective: '',
    alertQuantity: '',
    productTax: 'No Tax',
    taxMethod: 'Exclusive',
    warrantyValue: '',
    warrantyUnit: 'Months',
    guaranteeValue: '',
    guaranteeUnit: 'Months',
    isFeatured: false,
    isEmbeddedBarcode: false,
    hasInitialStock: false,
    initialStockQty: '',
    initialStockWarehouse: '',
    productDetails: '',
    hasVariant: false,
    hasDifferentPricePerWarehouse: false,
    hasBatchAndExpiry: false,
    hasImeiOrSerial: false,
    hasPromoPrice: false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Fetched Data
  const [brandsList, setBrandsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandRes, catRes] = await Promise.all([
          api.get('/products/brands'),
          api.get('/products/categories')
        ]);
        if (brandRes.data.success) setBrandsList(brandRes.data.data);
        if (catRes.data.success) setCategoriesList(catRes.data.data);
      } catch (error) {
        console.error('Error fetching brands/categories:', error);
      }
    };
    fetchData();
  }, []);

  // Auto-calculation of Product Price
  useEffect(() => {
    const cost = parseFloat(formData.productCost) || 0;
    const margin = parseFloat(formData.profitMargin) || 0;

    if (cost > 0) {
      let calculatedPrice = 0;
      if (formData.profitMarginType === 'Percentage (%)') {
        calculatedPrice = cost + (cost * margin) / 100;
      } else {
        calculatedPrice = cost + margin; // Fixed
      }
      setFormData(prev => ({
        ...prev,
        productPrice: calculatedPrice.toFixed(2)
      }));
    }
  }, [formData.productCost, formData.profitMargin, formData.profitMarginType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Generate Product Code
  const generateRandomCode = () => {
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    setFormData(prev => ({ ...prev, productCode: code }));
  };

  // Drag and drop image upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const response = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.success) {
        setFormData(prev => ({ ...prev, productImage: response.data.url }));
        alert('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productName || !formData.productCode || !formData.category || !formData.productUnit || !formData.productCost) {
      alert('Please fill out all required fields marked with *');
      return;
    }
    try {
      const response = await api.post('/products', formData);
      if (response.data.success) {
        alert('Product added successfully!');
        navigate('/products/product-list');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to save product: ' + errorMsg);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6 text-black">
      {/* Title & Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-500/50 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Add Product</h1>
          <p className="text-sm text-black/85 mt-1">Create a new item in your central inventory system.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Main Details Panel */}
        <div className="bg-transparent rounded-xl border border-blue-500 p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-semibold text-black border-b border-blue-500/50 pb-2">Basic Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Product Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Product Type *</label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black outline-none"
              >
                <option value="Standard" className="text-black bg-white">Standard</option>
                <option value="Combo" className="text-black bg-white">Combo</option>
                <option value="Digital" className="text-black bg-white">Digital</option>
                <option value="Service" className="text-black bg-white">Service</option>
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Product Name *</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black placeholder:text-black/60 outline-none"
                required
              />
            </div>

            {/* Product Code */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2 flex items-center justify-between">
                <span>Product Code *</span>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-xs text-indigo-600 hover:text-blue-800 flex items-center gap-1 normal-case font-bold"
                >
                  <Code size={12} /> Auto-Gen
                </button>
              </label>
              <input
                type="text"
                name="productCode"
                value={formData.productCode}
                onChange={handleChange}
                placeholder="Scan barcode or enter code"
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black placeholder:text-black/60 outline-none"
                required
              />
            </div>

            {/* Barcode Symbology */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Barcode Symbology *</label>
              <select
                name="barcodeSymbology"
                value={formData.barcodeSymbology}
                onChange={handleChange}
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black outline-none"
              >
                <option value="Code 128" className="text-black bg-white">Code 128</option>
                <option value="Code 39" className="text-black bg-white">Code 39</option>
                <option value="EAN 8" className="text-black bg-white">EAN-8</option>
                <option value="EAN 13" className="text-black bg-white">EAN-13</option>
                <option value="UPC A" className="text-black bg-white">UPC-A</option>
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2 flex justify-between items-center">
                <span>Brand</span>
                <button
                  type="button"
                  onClick={() => {
                    const newBrand = prompt("Enter new brand name:");
                    if (newBrand) alert(`Brand "${newBrand}" added successfully!`);
                  }}
                  className="text-indigo-600 hover:text-blue-800 font-bold p-1 rounded hover:bg-slate-100 transition-colors"
                  title="Add Brand"
                >
                  <Plus size={16} />
                </button>
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black outline-none"
              >
                <option value="" className="text-black bg-white">Select Brand...</option>
                {brandsList.map(b => (
                  <option key={b._id} value={b._id} className="text-black bg-white">{b.name}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2 flex justify-between items-center">
                <span>Category *</span>
                <button
                  type="button"
                  onClick={() => {
                    const newCategory = prompt("Enter new category name:");
                    if (newCategory) alert(`Category "${newCategory}" added successfully!`);
                  }}
                  className="text-indigo-600 hover:text-blue-800 font-bold p-1 rounded hover:bg-slate-100 transition-colors"
                  title="Add Category"
                >
                  <Plus size={16} />
                </button>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black outline-none"
                required
              >
                <option value="" className="text-black bg-white">Select Category...</option>
                {categoriesList.map(c => (
                  <option key={c._id} value={c._id} className="text-black bg-white">{c.name}</option>
                ))}
              </select>
            </div>

            {/* Product Unit */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2 flex justify-between items-center">
                <span>Product Unit *</span>
                <button
                  type="button"
                  onClick={() => {
                    const newUnit = prompt("Enter new product unit:");
                    if (newUnit) alert(`Unit "${newUnit}" added successfully!`);
                  }}
                  className="text-indigo-600 hover:text-blue-800 font-bold p-1 rounded hover:bg-slate-100 transition-colors"
                  title="Add Unit"
                >
                  <Plus size={16} />
                </button>
              </label>
              <select
                name="productUnit"
                value={formData.productUnit}
                onChange={handleChange}
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black outline-none"
                required
              >
                <option value="" className="text-black bg-white">Select Product Unit...</option>
                <option value="pcs" className="text-black bg-white">Pieces (pcs)</option>
                <option value="kg" className="text-black bg-white">Kilograms (kg)</option>
                <option value="box" className="text-black bg-white">Box (box)</option>
                <option value="meters" className="text-black bg-white">Meters (mtr)</option>
              </select>
            </div>

            {/* Sale Unit */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Sale Unit</label>
              <select
                name="saleUnit"
                value={formData.saleUnit}
                onChange={handleChange}
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black outline-none"
              >
                <option value="" className="text-black bg-white">Select Sale Unit...</option>
                <option value="pcs" className="text-black bg-white">Pieces (pcs)</option>
                <option value="kg" className="text-black bg-white">Kilograms (kg)</option>
                <option value="box" className="text-black bg-white">Box (box)</option>
              </select>
            </div>

            {/* Purchase Unit */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Purchase Unit</label>
              <select
                name="purchaseUnit"
                value={formData.purchaseUnit}
                onChange={handleChange}
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black outline-none"
              >
                <option value="" className="text-black bg-white">Select Purchase Unit...</option>
                <option value="pcs" className="text-black bg-white">Pieces (pcs)</option>
                <option value="kg" className="text-black bg-white">Kilograms (kg)</option>
                <option value="box" className="text-black bg-white">Box (box)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Pricing & Cost Panel */}
        <div className="bg-transparent rounded-xl border border-blue-500 p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-semibold text-black border-b border-blue-500/50 pb-2">Pricing & Stock Strategy</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Product Cost */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Product Cost *</label>
              <div className="relative">
                <input
                  type="number"
                  name="productCost"
                  value={formData.productCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md pl-8 pr-3 py-2 text-sm text-black placeholder:text-black/60 outline-none"
                  required
                />
                <span className="absolute left-3 top-2.5 text-xs text-black/70 font-semibold">$</span>
              </div>
            </div>

            {/* Profit Margin Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Profit Margin Type</label>
              <select
                name="profitMarginType"
                value={formData.profitMarginType}
                onChange={handleChange}
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black outline-none"
              >
                <option value="Percentage (%)" className="text-black bg-white">Percentage (%)</option>
                <option value="Fixed" className="text-black bg-white">Fixed Amount</option>
              </select>
            </div>

            {/* Profit Margin */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Profit Margin</label>
              <div className="relative">
                <input
                  type="number"
                  name="profitMargin"
                  value={formData.profitMargin}
                  onChange={handleChange}
                  placeholder="25.00"
                  step="0.01"
                  className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md pl-3 pr-8 py-2 text-sm text-black placeholder:text-black/60 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-indigo-600">
                  {formData.profitMarginType === 'Percentage (%)' ? '%' : '$'}
                </span>
              </div>
            </div>

            {/* Product Price */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2 flex items-center justify-between">
                <span>Product Price *</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Auto Calculated</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="productPrice"
                  value={formData.productPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md pl-8 pr-3 py-2 text-sm text-black placeholder:text-black/60 outline-none"
                  required
                />
                <span className="absolute left-3 top-2.5 text-xs text-black/70 font-semibold">$</span>
              </div>
            </div>

            {/* Wholesale Price */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Wholesale Price</label>
              <div className="relative">
                <input
                  type="number"
                  name="wholesalePrice"
                  value={formData.wholesalePrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md pl-8 pr-3 py-2 text-sm text-black placeholder:text-black/60 outline-none"
                />
                <span className="absolute left-3 top-2.5 text-xs text-black/70 font-semibold">$</span>
              </div>
            </div>

            {/* Alert Quantity */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Alert Quantity</label>
              <input
                type="number"
                name="alertQuantity"
                value={formData.alertQuantity}
                onChange={handleChange}
                placeholder="Min quantity before warning"
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black placeholder:text-black/60 outline-none"
              />
            </div>

            {/* Daily Sale Objective */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Daily Sale Objective</label>
              <input
                type="number"
                name="dailySaleObjective"
                value={formData.dailySaleObjective}
                onChange={handleChange}
                placeholder="Target units sold per day"
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black placeholder:text-black/60 outline-none"
              />
            </div>

            {/* Product Tax */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Product Tax</label>
              <select
                name="productTax"
                value={formData.productTax}
                onChange={handleChange}
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black outline-none"
              >
                <option value="No Tax" className="text-black bg-white">No Tax</option>
                <option value="VAT 5%" className="text-black bg-white">VAT 5%</option>
                <option value="GST 18%" className="text-black bg-white">GST 18%</option>
              </select>
            </div>

            {/* Tax Method */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Tax Method</label>
              <select
                name="taxMethod"
                value={formData.taxMethod}
                onChange={handleChange}
                className="w-full bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black outline-none"
              >
                <option value="Exclusive" className="text-black bg-white">Exclusive</option>
                <option value="Inclusive" className="text-black bg-white">Inclusive</option>
              </select>
            </div>

            {/* Warranty */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Warranty</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="warrantyValue"
                  value={formData.warrantyValue}
                  onChange={handleChange}
                  placeholder="eg: 1"
                  className="flex-1 bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black placeholder:text-black/60 outline-none"
                />
                <select
                  name="warrantyUnit"
                  value={formData.warrantyUnit}
                  onChange={handleChange}
                  className="w-28 bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-2 py-2 text-sm text-black outline-none"
                >
                  <option value="Days" className="text-black bg-white">Days</option>
                  <option value="Months" className="text-black bg-white">Months</option>
                  <option value="Years" className="text-black bg-white">Years</option>
                </select>
              </div>
            </div>

            {/* Guarantee */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Guarantee</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="guaranteeValue"
                  value={formData.guaranteeValue}
                  onChange={handleChange}
                  placeholder="eg: 1"
                  className="flex-1 bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-3 py-2 text-sm text-black placeholder:text-black/60 outline-none"
                />
                <select
                  name="guaranteeUnit"
                  value={formData.guaranteeUnit}
                  onChange={handleChange}
                  className="w-28 bg-transparent border border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded-md px-2 py-2 text-sm text-black outline-none"
                >
                  <option value="Days" className="text-black bg-white">Days</option>
                  <option value="Months" className="text-black bg-white">Months</option>
                  <option value="Years" className="text-black bg-white">Years</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Feature Switches Section */}
        <div className="bg-transparent rounded-xl border border-blue-500 p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold text-black border-b border-blue-500/50 pb-2">Properties & Flags</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* Featured */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded text-indigo-600 bg-slate-100 border-slate-400 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-semibold text-black/90 group-hover:text-black transition-colors">Featured</span>
                <span className="block text-xs text-black/70 mt-1">Featured product will be displayed in POS</span>
              </div>
            </label>

            {/* Embedded Barcode */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="isEmbeddedBarcode"
                checked={formData.isEmbeddedBarcode}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded text-indigo-600 bg-slate-100 border-slate-400 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-semibold text-black/90 group-hover:text-black transition-colors">Embedded Barcode</span>
                <span className="block text-xs text-black/70 mt-1">Check this if this product will be used in weight scale machine.</span>
              </div>
            </label>

            {/* Initial Stock */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="hasInitialStock"
                checked={formData.hasInitialStock}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded text-indigo-600 bg-slate-100 border-slate-400 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-semibold text-black/90 group-hover:text-black transition-colors">Initial Stock</span>
                <span className="block text-xs text-black/70 mt-1">This feature will not work for product with variants and batches</span>
              </div>
            </label>

          </div>

          {/* Conditional Initial Stock Fields */}
          {formData.hasInitialStock && (
            <div className="p-4 bg-transparent rounded-lg border border-blue-500 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Initial Qty</label>
                <input
                  type="number"
                  name="initialStockQty"
                  value={formData.initialStockQty}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  className="w-full bg-transparent border border-blue-500 focus:border-blue-450 focus:ring-1 focus:ring-blue-450 rounded-md px-3 py-2 text-sm text-black placeholder:text-black/60 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Initial Warehouse</label>
                <select
                  name="initialStockWarehouse"
                  value={formData.initialStockWarehouse}
                  onChange={handleChange}
                  className="w-full bg-transparent border border-blue-500 focus:border-blue-450 focus:ring-1 focus:ring-blue-450 rounded-md px-3 py-2 text-sm text-black outline-none"
                >
                  <option value="" className="text-black bg-white">Select Warehouse...</option>
                  <option value="Warehouse 1" className="text-black bg-white">Central Warehouse</option>
                  <option value="Warehouse 2" className="text-black bg-white">North Branch Warehouse</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Media & Details Section */}
        <div className="bg-transparent rounded-xl border border-blue-500 p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-semibold text-black border-b border-blue-500/50 pb-2">Media & Description</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Product Image */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-2">Product Image</label>
              
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[220px]
                  ${dragActive ? 'border-blue-400 bg-blue-500/10' : 'border-blue-500 bg-transparent hover:border-blue-400'}`}
              >
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {imagePreview ? (
                  <div className="space-y-3 w-full h-full relative">
                     <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="mx-auto max-h-[140px] rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(null); setImageFile(null); }}
                      className="text-xs text-red-655 hover:text-red-800 font-semibold"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <label htmlFor="image-upload" className="cursor-pointer space-y-3 flex flex-col items-center justify-center w-full h-full">
                    <Upload size={32} className="text-black/50 hover:text-black/75" />
                    <div>
                      <span className="text-sm font-medium text-indigo-600 hover:text-blue-800">Choose a file</span>
                      <span className="text-sm text-black/70"> or drag it here</span>
                    </div>
                    <span className="text-xs text-black/50">Drop files here to upload</span>
                  </label>
                )}
              </div>
            </div>

            {/* Product Details - Mock Rich Text Editor */}
            <div className="lg:col-span-2 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-black">Product Details</label>
              
              <div className="border border-blue-500 rounded-xl overflow-hidden bg-transparent">
                {/* Editor Menu Bar */}
                <div className="flex flex-wrap items-center gap-4 px-3 py-2 bg-transparent border-b border-blue-500/50 text-xs text-black/70">
                  <span className="hover:text-black cursor-pointer transition-colors">File</span>
                  <span className="hover:text-black cursor-pointer transition-colors">Edit</span>
                  <span className="hover:text-black cursor-pointer transition-colors">View</span>
                  <span className="hover:text-black cursor-pointer transition-colors">Insert</span>
                  <span className="hover:text-black cursor-pointer transition-colors">Format</span>
                  <span className="hover:text-black cursor-pointer transition-colors">Tools</span>
                  <span className="hover:text-black cursor-pointer transition-colors">Table</span>
                </div>
                
                {/* Editor Toolbar */}
                <div className="flex flex-wrap items-center gap-3 px-3 py-1.5 bg-transparent border-b border-blue-500/50 text-xs text-black/80">
                  <select className="bg-transparent border-none outline-none font-semibold text-xs py-0.5 pr-2">
                    <option className="text-black bg-white">Paragraph</option>
                    <option className="text-black bg-white">Heading 1</option>
                    <option className="text-black bg-white">Heading 2</option>
                  </select>
                  <div className="h-4 w-px bg-blue-500/30"></div>
                  <button type="button" className="font-bold hover:text-black px-1">B</button>
                  <button type="button" className="italic hover:text-black px-1">I</button>
                  <button type="button" className="underline hover:text-black px-1">U</button>
                  <button type="button" className="line-through hover:text-black px-1">S</button>
                  <div className="h-4 w-px bg-blue-500/30"></div>
                  <button type="button" className="hover:text-black px-1">🔗</button>
                  <button type="button" className="hover:text-black px-1">📷</button>
                  <button type="button" className="hover:text-black px-1">📋</button>
                </div>

                {/* Editor Textarea */}
                <textarea
                  name="productDetails"
                  value={formData.productDetails}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Describe your product here..."
                  className="w-full bg-transparent border-none outline-none p-4 text-sm text-black placeholder:text-black/50 resize-y"
                ></textarea>
                
                {/* Editor Footer */}
                <div className="px-3 py-1.5 bg-transparent border-t border-blue-500/30 text-[10px] text-black/60 text-right font-medium">
                  {formData.productDetails ? formData.productDetails.trim().split(/\s+/).filter(Boolean).length : 0} words
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Additional Advanced Checkboxes */}
        <div className="bg-transparent rounded-xl border border-blue-500 p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold text-black border-b border-blue-500/50 pb-2">Advanced Config</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <label className="flex items-center gap-3 cursor-pointer group py-1">
              <input
                type="checkbox"
                name="hasVariant"
                checked={formData.hasVariant}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-100 border-slate-400 focus:ring-blue-500"
              />
              <span className="text-sm text-black/90 group-hover:text-black transition-colors">This product has variant</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group py-1">
              <input
                type="checkbox"
                name="hasDifferentPricePerWarehouse"
                checked={formData.hasDifferentPricePerWarehouse}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-100 border-slate-400 focus:ring-blue-500"
              />
              <span className="text-sm text-black/90 group-hover:text-black transition-colors">This product has different price for different warehouse</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group py-1">
              <input
                type="checkbox"
                name="hasBatchAndExpiry"
                checked={formData.hasBatchAndExpiry}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-100 border-slate-400 focus:ring-blue-500"
              />
              <span className="text-sm text-black/90 group-hover:text-black transition-colors">This product has batch and expired date</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group py-1">
              <input
                type="checkbox"
                name="hasImeiOrSerial"
                checked={formData.hasImeiOrSerial}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-100 border-slate-400 focus:ring-blue-500"
              />
              <span className="text-sm text-black/90 group-hover:text-black transition-colors">This product has IMEI or Serial numbers</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group py-1">
              <input
                type="checkbox"
                name="hasPromoPrice"
                checked={formData.hasPromoPrice}
                onChange={handleChange}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-100 border-slate-400 focus:ring-blue-500"
              />
              <span className="text-sm text-black/90 group-hover:text-black transition-colors">Add Promotional Price</span>
            </label>

          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            className="px-5 py-2.5 rounded-lg border border-blue-500 text-sm font-semibold text-black/70 hover:text-black hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-blue-500 text-slate-800 font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer border border-blue-500/30"
          >
            <span>Save Product</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddProduct;
