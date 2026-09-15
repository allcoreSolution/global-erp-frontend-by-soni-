import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  UserPlus, 
  Percent, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Printer, 
  RotateCcw, 
  Check, 
  Clock,
  X,
  FileText
} from 'lucide-react';

const POS = () => {
  // Demo Products Data
  const [products] = useState([
    { id: 'P001', name: 'Premium Wireless Headphones', price: 2999, category: 'Electronics', stock: 12, code: '890123', hsn: '8518' },
    { id: 'P002', name: 'Smart Fitness Band V4', price: 1999, category: 'Electronics', stock: 8, code: '890124', hsn: '8519' },
    { id: 'P003', name: 'Classic Leather Wallet', price: 799, category: 'Accessories', stock: 15, code: '890125', hsn: '4202' },
    { id: 'P004', name: 'Organic Green Tea (250g)', price: 349, category: 'Grocery', stock: 25, code: '890126', hsn: '0902' },
    { id: 'P005', name: 'Stainless Steel Water Bottle', price: 599, category: 'Accessories', stock: 20, code: '890127', hsn: '7323' },
    { id: 'P006', name: 'Bluetooth Mini Speaker', price: 1499, category: 'Electronics', stock: 5, code: '890128', hsn: '8518' },
    { id: 'P007', name: 'Roasted Almonds (500g)', price: 499, category: 'Grocery', stock: 30, code: '890129', hsn: '0802' },
    { id: 'P008', name: 'Wired Gaming Mouse', price: 899, category: 'Electronics', stock: 10, code: '890130', hsn: '8471' }
  ]);

  const categories = ['All', 'Electronics', 'Grocery', 'Accessories'];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart & Customer State
  const [cart, setCart] = useState([
    { id: 'P001', name: 'Premium Wireless Headphones', price: 2999, category: 'Electronics', qty: 1, code: '890123', hsn: '8518' },
    { id: 'P004', name: 'Organic Green Tea (250g)', price: 349, category: 'Grocery', qty: 2, code: '890126', hsn: '0902' }
  ]);
  const [discount, setDiscount] = useState(100);
  const [gstPercentage, setGstPercentage] = useState(18); // Dynamic GST percentage
  const [paymentMode, setPaymentMode] = useState('Cash'); 
  
  // Customers List State
  const [customers, setCustomers] = useState([
    { name: 'Walk-in Customer', phone: '', gstin: '' },
    { name: 'Soni Tiwari', phone: '9876543210', gstin: '27AAAAA1111A1Z1' },
    { name: 'Rahul Verma', phone: '9988776655', gstin: '27BBBBB2222B2Z2' }
  ]);
  const [selectedCustomerName, setSelectedCustomerName] = useState('Soni Tiwari');

  // Add Customer Modal State
  const [showCustModal, setShowCustModal] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', phone: '', gstin: '' });

  // Hold Queue State
  const [holdBills, setHoldBills] = useState([]);

  // Print Preview Modal States
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('1'); // 1 to 8

  const templates = [
    { id: '1', name: 'Standard A4 Invoice' },
    { id: '2', name: 'Thermal (80mm / 3 inch)' },
    { id: '3', name: 'Thermal (58mm / 2 inch)' },
    { id: '4', name: 'Tax Invoice (B2B)' },
    { id: '5', name: 'Minimalist Modern' },
    { id: '6', name: 'Classic Vintage' },
    { id: '7', name: 'Service Bill' },
    { id: '8', name: 'Simple Cash Memo' }
  ];

  // Add Customer Submit
  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!newCust.name) {
      alert("Customer Name is required!");
      return;
    }
    setCustomers(prev => [...prev, newCust]);
    setSelectedCustomerName(newCust.name);
    setShowCustModal(false);
    setNewCust({ name: '', phone: '', gstin: '' });
  };

  // Add Product to Cart
  const handleAddToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) {
        alert("Stock limit reached!");
        return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // Adjust Quantity
  const handleUpdateQty = (productId, amount) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    const newQty = item.qty + amount;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.id !== productId));
    } else {
      const product = products.find(p => p.id === productId);
      if (product && newQty > product.stock) {
        alert("Stock limit reached!");
        return;
      }
      setCart(cart.map(i => i.id === productId ? { ...i, qty: newQty } : i));
    }
  };

  // Delete Cart Item
  const handleRemoveItem = (productId) => {
    setCart(cart.filter(i => i.id !== productId));
  };

  // Reset Cart
  const handleReset = () => {
    setCart([]);
    setDiscount(0);
    setGstPercentage(18);
    setPaymentMode('Cash');
    setSelectedCustomerName('Walk-in Customer');
  };

  // Calculations
  const getSubtotal = () => cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const getTax = () => Math.round(getSubtotal() * (gstPercentage / 100)); // Dynamic GST Calculation
  const getGrandTotal = () => getSubtotal() + getTax() - discount;

  // Print Action
  const triggerPrint = () => {
    window.print();
  };

  // Hold Current Bill
  const handleHoldBill = () => {
    if (cart.length === 0) return;
    const bill = {
      id: `HOLD-${Date.now()}`,
      customer: selectedCustomerName,
      cart,
      discount,
      gstPercentage,
      total: getGrandTotal(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHoldBills([bill, ...holdBills]);
    setCart([]);
    setDiscount(0);
    alert("Bill put on hold successfully!");
  };

  // Recall Hold Bill
  const handleRecallBill = (bill) => {
    setCart(bill.cart);
    setDiscount(bill.discount);
    setGstPercentage(bill.gstPercentage || 18);
    setSelectedCustomerName(bill.customer);
    setHoldBills(holdBills.filter(b => b.id !== bill.id));
  };

  // Filter Products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const activeCustomerObj = customers.find(c => c.name === selectedCustomerName) || { name: 'Walk-in Customer', phone: '', gstin: '' };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative">
      
      {/* LEFT PANEL: Products Grid & Categories */}
      <div className="flex-1 flex flex-col gap-4 no-print">
        
        {/* Search Bar & Category Navigation */}
        <div className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-4 rounded-xl border dark:border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-850 dark:text-slate-700 flex items-center gap-2">
              <ShoppingCart size={18} className="text-indigo-600" /> POS Billing Terminal
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search products by Name or Barcode..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-200 dark:text-slate-700"
              />
            </div>
          </div>

          {/* Category Navigation Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              onClick={() => handleAddToCart(product)}
              className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200 rounded-xl p-3 flex flex-col justify-between hover:shadow-md cursor-pointer transition transform hover:-translate-y-0.5 group"
            >
              <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 text-xs font-bold mb-2 group-hover:bg-blue-50/10 transition">
                {product.category} Image
              </div>
              <div>
                <div className="text-[10px] text-gray-400 mb-0.5">#{product.id}</div>
                <h3 className="text-xs font-bold text-slate-850 dark:text-slate-200 line-clamp-2 leading-tight min-h-[32px] mb-1">{product.name}</h3>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t dark:border-slate-200">
                <span className="text-xs font-bold text-indigo-600 dark:text-blue-400">₹{product.price}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${product.stock > 5 ? 'bg-emerald-50 text-emerald-700 dark:bg-slate-800' : 'bg-rose-50 text-rose-700 dark:bg-slate-800'}`}>
                  Stock: {product.stock}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT PANEL: Cart & Billing Summary */}
      <div className="w-full lg:w-96 flex flex-col gap-4 no-print">
        
        {/* Customer & Hold List */}
        <div className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-4 rounded-xl border dark:border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2 dark:border-slate-200">
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-500" />
              <select 
                value={selectedCustomerName} 
                onChange={(e) => setSelectedCustomerName(e.target.value)}
                className="text-xs font-bold text-slate-855 dark:text-slate-200 focus:outline-none dark:bg-slate-800"
              >
                {customers.map((c, i) => (
                  <option key={i} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setShowCustModal(true)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-indigo-600 transition" 
              title="Create New Customer"
            >
              <UserPlus size={15} />
            </button>
          </div>

          {/* Hold Bills Counter & List */}
          {holdBills.length > 0 && (
            <div className="bg-amber-50/50 dark:bg-slate-800/40 p-2 rounded-lg border border-amber-200 dark:border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-850 dark:text-amber-400">
                <Clock size={12} /> {holdBills.length} Bill(s) on Hold
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {holdBills.map(bill => (
                  <button 
                    key={bill.id}
                    onClick={() => handleRecallBill(bill)}
                    className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 hover:bg-slate-100 border dark:border-slate-200 text-[10px] font-semibold px-2.5 py-1 rounded shadow-xs transition shrink-0 text-slate-700 dark:text-slate-300"
                  >
                    Recall {bill.customer.split(' ')[0]} (₹{bill.total})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart Item Grid */}
        <div className="flex-1 bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 rounded-xl border dark:border-slate-200 shadow-xs flex flex-col overflow-hidden min-h-[250px] max-h-[350px]">
          <div className="p-3 bg-slate-50/50 border-b dark:border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500">
            Shopping Cart Items
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <ShoppingCart size={32} className="mb-2 text-gray-300" />
                <span className="text-xs font-semibold">Your billing cart is empty</span>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="p-3 flex gap-2 items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</h4>
                    <div className="text-[10px] text-gray-500 mt-0.5">₹{item.price} each</div>
                  </div>
                  
                  {/* Quantity Adjustment */}
                  <div className="flex items-center gap-2 border dark:border-slate-200 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
                    <button 
                      onClick={() => handleUpdateQty(item.id, -1)}
                      className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-650 transition"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-xs font-bold w-6 text-center text-slate-800 dark:text-slate-200">{item.qty}</span>
                    <button 
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-650 transition"
                    >
                      <Plus size={10} />
                    </button>
                  </div>

                  <div className="text-right w-16">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">₹{item.price * item.qty}</div>
                  </div>

                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-rose-600 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Calculation & Checkout */}
        <div className="bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 p-4 rounded-xl border dark:border-slate-200 shadow-xs space-y-4">
          
          <div className="space-y-2 text-xs font-bold text-slate-700 dark:text-slate-350">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-900 dark:text-slate-800">₹{getSubtotal()}</span>
            </div>
            
            {/* Dynamic GST input percentage switcher */}
            <div className="flex justify-between items-center py-1 border-t border-b border-dashed dark:border-slate-200">
              <span className="flex items-center gap-1"><Percent size={12} /> Tax (GST %)</span>
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(Math.max(0, Number(e.target.value)))}
                  className="w-14 text-right p-1 border dark:border-slate-200 dark:bg-slate-800 rounded text-slate-850 dark:text-slate-700 font-bold focus:outline-none" 
                  min="0"
                  max="100"
                />
                <span>%</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Calculated GST Tax ({gstPercentage}%)</span>
              <span className="text-slate-900 dark:text-slate-800">₹{getTax()}</span>
            </div>
            
            <div className="flex justify-between items-center pt-1 border-t border-dashed dark:border-slate-200">
              <span className="flex items-center gap-1"><Percent size={12} /> Discount (₹)</span>
              <input 
                type="number" 
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-20 text-right p-1 border dark:border-slate-200 dark:bg-slate-800 rounded text-slate-855 dark:text-slate-700 font-bold focus:outline-none" 
              />
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-slate-800 pt-2 border-t">
              <span>Grand Total</span>
              <span className="text-lg font-extrabold text-indigo-600 dark:text-blue-400">₹{getGrandTotal()}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Payment Mode</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {[
                { name: 'Cash', icon: Banknote },
                { name: 'Card', icon: CreditCard },
                { name: 'UPI', icon: QrCode }
              ].map(mode => (
                <button
                  key={mode.name}
                  onClick={() => setPaymentMode(mode.name)}
                  className={`flex items-center justify-center gap-1.5 py-2 border rounded-lg transition ${
                    paymentMode === mode.name 
                      ? 'border-blue-600 bg-blue-50/10 text-indigo-600 dark:border-blue-500' 
                      : 'hover:bg-slate-50 dark:border-slate-200 dark:hover:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <mode.icon size={13} />
                  {mode.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2">
            <button 
              onClick={handleHoldBill}
              className="flex items-center justify-center gap-1 py-2.5 border rounded-lg hover:bg-slate-50 dark:border-slate-200 dark:hover:bg-slate-800 dark:text-slate-350 transition"
            >
              <Clock size={14} /> Hold Bill
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center justify-center gap-1 py-2.5 border rounded-lg text-rose-600 hover:bg-rose-50/20 dark:border-slate-200 dark:hover:bg-slate-800 transition"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button 
              onClick={() => {
                if (cart.length === 0) {
                  alert("Cart is empty!");
                  return;
                }
                setShowPrintModal(true);
              }}
              className="col-span-2 flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-slate-800 rounded-lg shadow-sm text-sm transition"
            >
              <Printer size={16} /> Pay & Select Print Template
            </button>
          </div>

        </div>

      </div>

      {/* CREATE NEW CUSTOMER MODAL */}
      {showCustModal && (
        <div className="fixed inset-0 bg-slate-50/50 shadow-inner border border-slate-200/50 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl border w-full max-w-sm overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider">Add New POS Customer</span>
              <button onClick={() => setShowCustModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveCustomer} className="p-4 space-y-3.5 font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">Customer Full Name *</label>
                <input 
                  type="text" 
                  value={newCust.name}
                  onChange={(e) => setNewCust({...newCust, name: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Mobile Number</label>
                <input 
                  type="text" 
                  value={newCust.phone}
                  onChange={(e) => setNewCust({...newCust, phone: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. 9876543210"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">GSTIN Number (Optional)</label>
                <input 
                  type="text" 
                  value={newCust.gstin}
                  onChange={(e) => setNewCust({...newCust, gstin: e.target.value.toUpperCase()})}
                  className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. 27AAAAA1111A1Z1"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setShowCustModal(false)}
                  className="px-3 py-1.5 border rounded text-gray-650 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded font-bold shadow-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT TEMPLATE SELECTION MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-50/50 shadow-inner border border-slate-200/50 flex flex-col md:flex-row z-50 p-4 gap-4 no-print">
          
          {/* Template Sidebar Selector */}
          <div className="w-full md:w-64 bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200 rounded-xl p-4 flex flex-col justify-between shrink-0 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2 dark:border-slate-200">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1">
                  <FileText size={14} /> 8 Print Formats
                </span>
                <button onClick={() => setShowPrintModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[300px] md:max-h-[50vh] pr-1">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`w-full text-left p-2.5 rounded-lg text-[11px] font-bold border transition ${
                      selectedTemplate === t.id 
                        ? 'border-blue-500 bg-blue-50/10 text-indigo-600 dark:border-blue-500 dark:text-blue-400' 
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-gray-300'
                    }`}
                  >
                    {t.id}. {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t dark:border-slate-200 space-y-2">
              <button 
                onClick={triggerPrint}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center gap-1"
              >
                <Printer size={14} /> Print Selected
              </button>
              <button 
                onClick={() => {
                  setShowPrintModal(false);
                  handleReset();
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
              >
                Done / New Sale
              </button>
            </div>
          </div>

          {/* Live Preview Pane */}
          <div className="flex-1 bg-white dark:bg-slate-50/50 shadow-inner border border-slate-200 border dark:border-slate-200 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-200 flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Live Preview: {templates.find(t => t.id === selectedTemplate)?.name}</span>
              <span className="text-[10px] text-gray-450 dark:text-gray-500">(Supports Save as PDF / Spool Printer)</span>
            </div>

            {/* Template Container */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-100 dark:bg-slate-950/20 flex justify-center">
              
              <div id="print-area" className="bg-white text-slate-850 p-6 shadow-sm border rounded w-full max-w-[650px] font-mono text-[11px] leading-relaxed">
                
                {/* 1. STANDARD A4 INVOICE */}
                {selectedTemplate === '1' && (
                  <div className="space-y-4">
                    <div className="text-center pb-2 border-b-2">
                      <h2 className="text-base font-bold uppercase">ALLCORE SOLUTION PVT. LTD.</h2>
                      <p className="text-[10px]">Head Office: Mumbai, India | Email: accounts@allcore.com</p>
                      <h3 className="text-xs font-bold tracking-widest mt-1 uppercase text-slate-500">Retail Tax Invoice</h3>
                    </div>
                    <div className="flex justify-between text-[10px] border-b pb-2">
                      <div>
                        <strong>Client Details:</strong><br />
                        Name: {activeCustomerObj.name}<br />
                        {activeCustomerObj.phone && <>Phone: {activeCustomerObj.phone}<br /></>}
                        {activeCustomerObj.gstin && <>GSTIN: {activeCustomerObj.gstin}<br /></>}
                        Type: Walk-in Client
                      </div>
                      <div className="text-right">
                        <strong>Invoice Details:</strong><br />
                        Invoice No: INV-2026-{Date.now().toString().slice(-4)}<br />
                        Date: {new Date().toLocaleDateString()}<br />
                        Payment: {paymentMode}
                      </div>
                    </div>
                    <table className="w-full text-left border-collapse border-b">
                      <thead>
                        <tr className="border-b font-bold text-[10px]">
                          <th className="py-1">Description</th>
                          <th className="py-1 text-center">Qty</th>
                          <th className="py-1 text-right">Rate</th>
                          <th className="py-1 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-1.5">{item.name}</td>
                            <td className="py-1.5 text-center">{item.qty}</td>
                            <td className="py-1.5 text-right">₹{item.price}</td>
                            <td className="py-1.5 text-right">₹{item.price * item.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-end pt-2">
                      <div className="w-48 text-right space-y-1 text-[10px]">
                        <div className="flex justify-between"><span>Subtotal:</span><span>₹{getSubtotal()}</span></div>
                        <div className="flex justify-between"><span>GST ({gstPercentage}%):</span><span>₹{getTax()}</span></div>
                        <div className="flex justify-between"><span>Discount:</span><span>-₹{discount}</span></div>
                        <div className="flex justify-between font-bold border-t pt-1 text-xs"><span>Total:</span><span>₹{getGrandTotal()}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. THERMAL RECEIPT (80mm) */}
                {selectedTemplate === '2' && (
                  <div className="max-w-[300px] mx-auto text-center space-y-3 font-mono text-[10px]">
                    <div className="border-b border-dashed pb-2">
                      <h3 className="text-xs font-bold uppercase">ALLCORE SOLUTION</h3>
                      <p>MUMBAI HO BRANCH</p>
                      <p>TEL: 022-12345678</p>
                    </div>
                    <div className="text-left space-y-0.5 border-b border-dashed pb-2">
                      <p>DATE: {new Date().toLocaleString()}</p>
                      <p>BILL NO: T-80-{Date.now().toString().slice(-4)}</p>
                      <p>CUST: {activeCustomerObj.name}</p>
                      {activeCustomerObj.phone && <p>PHONE: {activeCustomerObj.phone}</p>}
                    </div>
                    <div className="text-left border-b border-dashed pb-2">
                      <div className="flex justify-between font-bold border-b pb-0.5 mb-1">
                        <span>ITEM</span>
                        <span>QTY * RATE</span>
                        <span>AMT</span>
                      </div>
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between my-0.5">
                          <span className="truncate max-w-[120px]">{item.name}</span>
                          <span>{item.qty} * ₹{item.price}</span>
                          <span>₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-right space-y-0.5 border-b border-dashed pb-2">
                      <div className="flex justify-between"><span>SUBTOTAL:</span><span>₹{getSubtotal()}</span></div>
                      <div className="flex justify-between"><span>GST ({gstPercentage}%):</span><span>₹{getTax()}</span></div>
                      <div className="flex justify-between"><span>DISCOUNT:</span><span>-₹{discount}</span></div>
                      <div className="flex justify-between font-bold text-xs"><span>NET AMOUNT:</span><span>₹{getGrandTotal()}</span></div>
                    </div>
                    <p className="text-[9px] pt-1">*** Thank you! Visit Again ***</p>
                  </div>
                )}

                {/* 3. THERMAL RECEIPT (58mm) */}
                {selectedTemplate === '3' && (
                  <div className="max-w-[210px] mx-auto text-center space-y-2 font-mono text-[9px] leading-tight">
                    <div className="border-b border-dashed pb-1.5">
                      <h4 className="font-bold uppercase text-[10px]">ALLCORE POS</h4>
                      <p>CUST: {activeCustomerObj.name.split(' ')[0]}</p>
                    </div>
                    <div className="text-left border-b border-dashed pb-1.5 space-y-0.5">
                      <p>TXN: {Date.now().toString().slice(-6)}</p>
                      <p>MODE: {paymentMode}</p>
                    </div>
                    <div className="text-left border-b border-dashed pb-1.5">
                      {cart.map((item, idx) => (
                        <div key={idx} className="my-1">
                          <div className="truncate font-bold">{item.name}</div>
                          <div className="flex justify-between">
                            <span>{item.qty} x ₹{item.price}</span>
                            <span>₹{item.price * item.qty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-0.5 text-right font-bold">
                      <div className="flex justify-between"><span>TOTAL:</span><span>₹{getSubtotal() + getTax()}</span></div>
                      <div className="flex justify-between text-slate-500"><span>DISC:</span><span>-₹{discount}</span></div>
                      <div className="flex justify-between text-[10px] border-t border-dashed pt-0.5 font-black"><span>PAID:</span><span>₹{getGrandTotal()}</span></div>
                    </div>
                  </div>
                )}

                {/* 4. TAX INVOICE (B2B) */}
                {selectedTemplate === '4' && (
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                      <div>
                        <h2 className="text-xs font-bold uppercase">ALLCORE SOLUTION PVT. LTD.</h2>
                        <p className="text-[9px]">GSTIN: 27AAAAA0000A1Z2</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600 border">GST Tax Invoice</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-[9px] border-b pb-2">
                      <div>
                        <strong>Supplier / Ship From:</strong><br />
                        Mumbai Warehouse HO<br />
                        State: Maharashtra (Code: 27)
                      </div>
                      <div className="text-right">
                        <strong>Billing Client Info:</strong><br />
                        Name: {activeCustomerObj.name}<br />
                        {activeCustomerObj.phone && <>Phone: {activeCustomerObj.phone}<br /></>}
                        {activeCustomerObj.gstin && <>GSTIN: {activeCustomerObj.gstin}<br /></>}
                      </div>
                    </div>
                    <table className="w-full text-left border-collapse text-[9px]">
                      <thead>
                        <tr className="border-b-2 font-bold bg-slate-50">
                          <th className="py-1">Product Description</th>
                          <th className="py-1">HSN</th>
                          <th className="py-1 text-center">Qty</th>
                          <th className="py-1 text-right">Price</th>
                          <th className="py-1 text-right">Taxable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-1">{item.name}</td>
                            <td className="py-1">{item.hsn || '8518'}</td>
                            <td className="py-1 text-center">{item.qty}</td>
                            <td className="py-1 text-right">₹{item.price}</td>
                            <td className="py-1 text-right">₹{item.price * item.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-between pt-2 text-[9px] font-bold">
                      <div>
                        Payment Mode: {paymentMode}
                      </div>
                      <div className="w-48 text-right space-y-1 text-[9px]">
                        <div className="flex justify-between"><span>Taxable Value:</span><span>₹{getSubtotal()}</span></div>
                        <div className="flex justify-between"><span>CGST ({gstPercentage/2}%):</span><span>₹{Math.round(getTax() / 2)}</span></div>
                        <div className="flex justify-between"><span>SGST ({gstPercentage/2}%):</span><span>₹{Math.round(getTax() / 2)}</span></div>
                        <div className="flex justify-between"><span>Discount:</span><span>-₹{discount}</span></div>
                        <div className="flex justify-between border-t border-double pt-1 text-xs font-black"><span>Invoice Total:</span><span>₹{getGrandTotal()}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MINIMALIST MODERN */}
                {selectedTemplate === '5' && (
                  <div className="space-y-6 font-sans text-xs">
                    <div className="flex justify-between items-center border-b pb-4">
                      <div>
                        <h2 className="text-sm font-extrabold tracking-tight text-indigo-600">ALLCORE SOLUTIONS</h2>
                        <span className="text-[10px] text-gray-400">allcore.com</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500">INVOICE</span>
                        <div className="font-bold text-gray-800">#INV-{Date.now().toString().slice(-4)}</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <div>
                        <span className="text-gray-400 font-bold block mb-1">BILLED TO</span>
                        <strong className="text-slate-800">{activeCustomerObj.name}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 font-bold block mb-1">DATE OF ISSUE</span>
                        <strong>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </div>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-400 font-bold border-b text-[10px]">
                          <th className="py-2">Item Description</th>
                          <th className="py-2 text-center">Quantity</th>
                          <th className="py-2 text-right">Price</th>
                          <th className="py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, idx) => (
                          <tr key={idx} className="border-b text-gray-700">
                            <td className="py-3 font-semibold">{item.name}</td>
                            <td className="py-3 text-center">{item.qty}</td>
                            <td className="py-3 text-right">₹{item.price}</td>
                            <td className="py-3 text-right font-semibold">₹{item.price * item.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-end pt-4">
                      <div className="w-52 text-right space-y-2 text-gray-600">
                        <div className="flex justify-between"><span>Subtotal:</span><span>₹{getSubtotal()}</span></div>
                        <div className="flex justify-between text-slate-800 font-bold"><span>Total Due:</span><span className="text-indigo-600 font-extrabold text-sm">₹{getGrandTotal()}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. CLASSIC VINTAGE */}
                {selectedTemplate === '6' && (
                  <div className="border-4 double border-double border-slate-200 p-4 space-y-4">
                    <div className="text-center border-b pb-2">
                      <h2 className="text-base font-serif font-bold uppercase tracking-wide">*** COMPANY VOUCHER ***</h2>
                      <h3 className="text-xs uppercase font-serif tracking-widest text-slate-650">Allcore Solution Co.</h3>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Customer: {activeCustomerObj.name}</span>
                      <span>Voucher Ref: {Date.now().toString().slice(-6)}</span>
                    </div>
                    <table className="w-full text-left border-t border-b text-[10px]">
                      <thead>
                        <tr className="border-b font-bold font-serif">
                          <th className="py-1">Particulars</th>
                          <th className="py-1 text-center">Qty</th>
                          <th className="py-1 text-right">Rate</th>
                          <th className="py-1 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-1">{item.name}</td>
                            <td className="py-1 text-center">{item.qty}</td>
                            <td className="py-1 text-right">₹{item.price}</td>
                            <td className="py-1 text-right">₹{item.price * item.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-between text-[10px] pt-1">
                      <span>Method: {paymentMode}</span>
                      <strong className="text-xs">NET PAYABLE: ₹{getGrandTotal()}</strong>
                    </div>
                  </div>
                )}

                {/* 7. SERVICE BILL */}
                {selectedTemplate === '7' && (
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h2 className="text-sm font-bold text-gray-800 uppercase">Service Slip / Proforma</h2>
                      <p className="text-[10px] text-gray-500">Service Date: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-[10px] space-y-0.5 text-gray-700">
                      <p><strong>Billed To:</strong> {activeCustomerObj.name}</p>
                      {activeCustomerObj.phone && <p><strong>Phone:</strong> {activeCustomerObj.phone}</p>}
                    </div>
                    <table className="w-full text-left text-[10px] border-b">
                      <thead>
                        <tr className="border-b font-bold text-gray-600 bg-slate-50">
                          <th className="py-1.5 px-2">Service Description</th>
                          <th className="py-1.5 text-right px-2">Total Price (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-1.5 px-2 font-medium">{item.name} (Qty: {item.qty})</td>
                            <td className="py-1.5 text-right px-2 font-bold">₹{item.price * item.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-right text-[10px] font-bold space-y-1">
                      <p>Gross Amount: ₹{getSubtotal()}</p>
                      <p>Net Service Charge: ₹{getGrandTotal()}</p>
                    </div>
                  </div>
                )}

                {/* 8. SIMPLE CASH MEMO */}
                {selectedTemplate === '8' && (
                  <div className="space-y-3 font-mono text-[10px]">
                    <div className="text-center font-bold border-b pb-1">
                      <span>CASH MEMO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ref No: {Date.now().toString().slice(-4)}</span>
                      <span>Date: {new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="border-t border-b py-2 space-y-1">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.name} x{item.qty}</span>
                          <span>₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold text-xs pt-1">
                      <span>TOTAL AMT:</span>
                      <span>₹{getGrandTotal()}</span>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>
      )}

      {/* PRINT MEDIA ONLY CSS INJECTOR */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}} />

    </div>
  );
};

export default POS;
