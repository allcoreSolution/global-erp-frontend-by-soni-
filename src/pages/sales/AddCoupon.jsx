import React, { useState } from 'react';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddCoupon = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    couponCode: 'WELCOME10',
    couponName: 'Welcome Offer',
    couponType: 'Percentage',
    company: 'Select',
    branch: 'Select',
    status: 'Active',
    description: '',
    discountType: 'Percentage',
    discountValue: '10',
    maxDiscount: '500',
    minOrder: '2000',
    maxOrder: '',
    freeShipping: false,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    neverExpire: false,
    applicableTo: 'All Customers',
    customerType: 'All Types',
    customer: 'Select',
    applicableOn: 'All Products',
    product: 'Select',
    category: 'Select',
    brand: 'Select',
    priceList: 'Select',
    totalUsageLimit: '1000',
    perCustomerLimit: '1',
    minQuantity: '',
    firstOrderOnly: true,
    oneCouponPerOrder: true,
    allowMultipleCoupons: false,
    days: {
      Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true
    },
    taxConfiguration: 'Select',
    discountAccount: 'Select',
    termsConditions: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDayChange = (day) => {
    setForm(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: !prev.days[day]
      }
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Coupon created successfully!');
    navigate('/sales/coupon-list');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Top Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/sales/coupon-list')}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back to Coupon List
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-indigo-900 uppercase tracking-wide">Create New Coupon</h2>
          <p className="text-sm text-slate-500 font-medium">Create discount coupon</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          {/* SECTION: BASIC INFORMATION */}
          <div className="border border-slate-200 rounded-lg p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code *</label>
                <input type="text" name="couponCode" value={form.couponCode} onChange={handleChange} required placeholder="e.g. SUMMER20" className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-bold text-indigo-700 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Name *</label>
                <input type="text" name="couponName" value={form.couponName} onChange={handleChange} required placeholder="Enter Name" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Type *</label>
                <select name="couponType" value={form.couponType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all bg-white">
                  <option>Percentage</option>
                  <option>Fixed Amount</option>
                  <option>Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company *</label>
                <select name="company" value={form.company} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all bg-white">
                  <option>Select</option>
                  <option>Allcore Solutions</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                <select name="branch" value={form.branch} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all bg-white">
                  <option>Select</option>
                  <option>Head Office</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all bg-white">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows="2" placeholder="Brief description of the offer..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION: DISCOUNT DETAILS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Discount Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type *</label>
                  <select name="discountType" value={form.discountType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Percentage</option>
                    <option>Fixed Amount</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Value *</label>
                  <input type="number" name="discountValue" value={form.discountValue} onChange={handleChange} required placeholder="e.g. 10" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Discount Amount</label>
                  <input type="number" name="maxDiscount" value={form.maxDiscount} onChange={handleChange} placeholder="e.g. 500" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Order Value</label>
                  <input type="number" name="minOrder" value={form.minOrder} onChange={handleChange} placeholder="e.g. 2000" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Order Value</label>
                  <input type="number" name="maxOrder" value={form.maxOrder} onChange={handleChange} placeholder="e.g. 10000" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 mt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="freeShipping" checked={form.freeShipping} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    Free Shipping
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION: VALIDITY */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Validity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required disabled={form.neverExpire} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-400" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange} disabled={form.neverExpire} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-400" />
                </div>
                <div className="col-span-2 mt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="neverExpire" checked={form.neverExpire} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    Never Expire
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION: CUSTOMER ELIGIBILITY */}
            <div className="border border-slate-200 rounded-lg p-5 lg:col-span-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Customer Eligibility</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Applicable To *</label>
                  <select name="applicableTo" value={form.applicableTo} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>All Customers</option>
                    <option>Specific Customer Groups</option>
                    <option>Specific Customers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Type</label>
                  <select name="customerType" value={form.customerType} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>All Types</option>
                    <option>Retail</option>
                    <option>Wholesale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer</label>
                  <select name="customer" value={form.customer} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>Walk-in Customer</option>
                    <option>John Doe</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: PRODUCT / CATEGORY */}
            <div className="border border-slate-200 rounded-lg p-5 lg:col-span-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Product / Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Applicable On *</label>
                  <select name="applicableOn" value={form.applicableOn} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>All Products</option>
                    <option>Specific Products</option>
                    <option>Specific Categories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product</label>
                  <select name="product" value={form.product} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>Item A</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
                  <select name="brand" value={form.brand} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                    <option>Select</option>
                    <option>Apple</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: USAGE RESTRICTIONS */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Usage Restrictions</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Usage Limit</label>
                  <input type="number" name="totalUsageLimit" value={form.totalUsageLimit} onChange={handleChange} placeholder="e.g. 1000" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Per Customer Limit</label>
                  <input type="number" name="perCustomerLimit" value={form.perCustomerLimit} onChange={handleChange} placeholder="e.g. 1" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Quantity of Items</label>
                  <input type="number" name="minQuantity" value={form.minQuantity} onChange={handleChange} placeholder="e.g. 2" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                </div>
                
                <div className="col-span-2 flex flex-col gap-2 mt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="firstOrderOnly" checked={form.firstOrderOnly} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    First Order Only
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="oneCouponPerOrder" checked={form.oneCouponPerOrder} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    One Coupon Per Order
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input type="checkbox" name="allowMultipleCoupons" checked={form.allowMultipleCoupons} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                    Allow Multiple Coupons
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION: APPLICABLE DAYS & TERMS */}
            <div className="flex flex-col gap-6">
              
              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Applicable Days</h3>
                <div className="flex flex-wrap gap-4">
                  {Object.keys(form.days).map(day => (
                    <label key={day} className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.days[day]} 
                        onChange={() => handleDayChange(day)} 
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Terms & Accounting</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Configuration</label>
                    <select name="taxConfiguration" value={form.taxConfiguration} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                      <option>Select</option>
                      <option>Tax Included</option>
                      <option>Tax Excluded</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Account</label>
                    <select name="discountAccount" value={form.discountAccount} onChange={handleChange} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none bg-white">
                      <option>Select</option>
                      <option>Sales Discounts</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Terms & Conditions</label>
                  <textarea name="termsConditions" value={form.termsConditions} onChange={handleChange} rows="2" placeholder="Enter terms of use..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>

          </div>

          {/* FORM ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/sales/coupon-list')} className="px-6 py-2.5 border border-slate-300 rounded text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Cancel
            </button>
            <button type="button" className="px-6 py-2.5 border border-indigo-200 bg-indigo-50 rounded text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm">
              Save Draft
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold shadow-md transition-colors">
              <Tag size={16} /> Create Coupon
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddCoupon;
