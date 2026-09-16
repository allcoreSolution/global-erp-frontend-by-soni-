import React, { useState, useEffect } from 'react';
import { Tag, ShieldAlert, BarChart, Percent, Plus, X, Edit } from 'lucide-react';
import api from '../../api';

const PricingRules = () => {
  const [rules, setRules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRule, setCurrentRule] = useState({
    id: '', name: '', type: 'Discount', description: '', status: 'Active',
    company: '', branch: '', customerType: 'Wholesaler', priceList: '', category: '', brand: '', product: '',
    condition: 'Quantity', operator: 'Greater Than / Equal', conditionValue: 100,
    discountType: 'Percentage', discountValue: 10, maxDiscount: '',
    start: '', end: '', priority: 1, stackDiscount: false
  });
  const [isEdit, setIsEdit] = useState(false);

  const fetchRules = async () => {
    try {
      const res = await api.get('/price-rules');
      setRules(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch pricing rules', err);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    const nextId = `PR-${String(rules.length + 1).padStart(5, '0')}`;
    setCurrentRule({
      id: nextId, name: '', type: 'Discount', description: '', status: 'Active',
      company: '', branch: '', customerType: 'Wholesaler', priceList: '', category: '', brand: '', product: '',
      condition: 'Quantity', operator: 'Greater Than / Equal', conditionValue: 100,
      discountType: 'Percentage', discountValue: 10, maxDiscount: '',
      start: '', end: '', priority: 1, stackDiscount: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setIsEdit(true);
    setCurrentRule({ ...rule });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...currentRule };
      
      // Deep Check: prevent Mongoose cast errors or unwanted empty strings
      if (payload.company === '') delete payload.company;
      if (payload.branch === '') delete payload.branch;
      if (payload.priceList === '') delete payload.priceList;
      if (payload.category === '') delete payload.category;
      if (payload.brand === '') delete payload.brand;
      if (payload.product === '') delete payload.product;
      if (payload.maxDiscount === '') delete payload.maxDiscount;
      
      // Ensure numeric types
      payload.conditionValue = Number(payload.conditionValue) || 0;
      payload.discountValue = Number(payload.discountValue) || 0;
      payload.priority = Number(payload.priority) || 1;

      if (isEdit) {
        const idToUpdate = payload._id || payload.id;
        await api.put(`/price-rules/${idToUpdate}`, payload);
      } else {
        await api.post('/price-rules', payload);
      }
      fetchRules();
      setIsModalOpen(false);
    } catch (error) {
      alert('Failed to save pricing rule. ' + (error.response?.data?.message || ''));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete rule ${id}?`)) {
      try {
        const rule = rules.find(r => r.id === id);
        const idToDelete = rule?._id || id;
        await api.delete(`/price-rules/${idToDelete}`);
        fetchRules();
      } catch (error) {
        alert('Failed to delete pricing rule. ' + (error.response?.data?.message || ''));
      }
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Slab pricing & Discount rules</h1>
          <p className="text-[11px] sm:text-xs text-gray-500">Configure minimum ordering caps, special item rates, percent cuts, and custom schedules.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={14} /> Add Pricing Rule
        </button>
      </div>

      {/* Rules list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map(rule => (
          <div key={rule.id} className="border rounded-lg p-4 bg-slate-50 space-y-3 relative">
            <div className="flex justify-between items-start border-b pb-2">
              <div>
                <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">{rule.id}</span>
                <h3 className="font-bold text-gray-800 text-xs sm:text-sm mt-1">{rule.product}</h3>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => handleOpenEdit(rule)} className="p-1 hover:bg-slate-200 rounded text-slate-600">
                  <Edit size={13} />
                </button>
                <button onClick={() => handleDelete(rule.id)} className="p-1 hover:bg-red-100 rounded text-red-600">
                  <X size={13} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] sm:text-xs">
              <div>
                <span className="text-gray-500">Price Type:</span>
                <p className="font-semibold text-gray-800">{rule.type}</p>
              </div>
              <div>
                <span className="text-gray-500">Value:</span>
                <p className="font-bold text-emerald-600">
                  {rule.discountType === 'Percentage' ? `${rule.discountValue}%` : `₹ ${rule.discountValue}`}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Condition:</span>
                <p className="font-semibold text-gray-800">{rule.condition} {rule.operator}</p>
              </div>
              <div>
                <span className="text-gray-500">Condition Val:</span>
                <p className="font-semibold text-gray-800">{rule.conditionValue}</p>
              </div>
              <div>
                <span className="text-gray-500">Schedule:</span>
                <p className="font-semibold text-gray-800 text-[10px]">{rule.start || 'N/A'} to {rule.end || 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl shadow-xl border my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 text-black">
            <div className="border-b border-blue-500 p-4 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h3 className="font-bold text-lg text-gray-800">{isEdit ? 'Edit Pricing Rule' : 'Create Pricing Rule'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Rule Code</label>
                  <input type="text" disabled value={currentRule.id} className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Rule Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bulk Purchase Discount"
                    value={currentRule.name || ''}
                    onChange={(e) => setCurrentRule({ ...currentRule, name: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none focus:border-blue-450"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Rule Type *</label>
                  <select
                    value={currentRule.type || 'Discount'}
                    onChange={(e) => setCurrentRule({ ...currentRule, type: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                  >
                    <option value="Discount">Discount</option>
                    <option value="Markup">Markup</option>
                    <option value="Fixed Price">Fixed Price</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Status</label>
                  <select
                    value={currentRule.status || 'Active'}
                    onChange={(e) => setCurrentRule({ ...currentRule, status: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Enter description..."
                    value={currentRule.description || ''}
                    onChange={(e) => setCurrentRule({ ...currentRule, description: e.target.value })}
                    className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none focus:border-blue-450"
                  />
                </div>
              </div>

              {/* Apply To */}
              <div>
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">APPLY TO</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Company *</label>
                    <select
                      value={currentRule.company || ''}
                      onChange={(e) => setCurrentRule({ ...currentRule, company: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">Select Company</option>
                      <option value="CompA">Main Company</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Branch</label>
                    <select
                      value={currentRule.branch || ''}
                      onChange={(e) => setCurrentRule({ ...currentRule, branch: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">Select Branch</option>
                      <option value="BranchA">Head Office</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Customer Type</label>
                    <select
                      value={currentRule.customerType || ''}
                      onChange={(e) => setCurrentRule({ ...currentRule, customerType: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">Select Customer Type</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Retailer">Retailer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Price List</label>
                    <select
                      value={currentRule.priceList || ''}
                      onChange={(e) => setCurrentRule({ ...currentRule, priceList: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">Wholesale Price</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Category</label>
                    <select
                      value={currentRule.category || ''}
                      onChange={(e) => setCurrentRule({ ...currentRule, category: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">Select Category</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Brand</label>
                    <select
                      value={currentRule.brand || ''}
                      onChange={(e) => setCurrentRule({ ...currentRule, brand: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">Select Brand</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Product</label>
                    <select
                      value={currentRule.product || ''}
                      onChange={(e) => setCurrentRule({ ...currentRule, product: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="">Select Product</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div>
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">CONDITION</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Condition</label>
                    <select
                      value={currentRule.condition || ''}
                      onChange={(e) => setCurrentRule({ ...currentRule, condition: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="Quantity">Quantity</option>
                      <option value="Amount">Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Operator</label>
                    <select
                      value={currentRule.operator || ''}
                      onChange={(e) => setCurrentRule({ ...currentRule, operator: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="Greater Than / Equal">Greater Than / Equal</option>
                      <option value="Less Than">Less Than</option>
                      <option value="Equal">Equal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Value</label>
                    <input
                      type="number"
                      value={currentRule.conditionValue || ''}
                      onChange={(e) => setCurrentRule({ ...currentRule, conditionValue: Number(e.target.value) })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none focus:border-blue-450"
                    />
                  </div>
                </div>
              </div>

              {/* Price Adjustment */}
              <div>
                <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">PRICE ADJUSTMENT</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Discount Type</label>
                    <select
                      value={currentRule.discountType || ''}
                      onChange={(e) => setCurrentRule({ ...currentRule, discountType: e.target.value })}
                      className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none bg-white"
                    >
                      <option value="Percentage">Percentage</option>
                      <option value="Fixed Amount">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Discount Value</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={currentRule.discountValue || ''}
                        onChange={(e) => setCurrentRule({ ...currentRule, discountValue: Number(e.target.value) })}
                        className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none focus:border-blue-450"
                      />
                      <span className="absolute right-3 top-2 text-gray-500 text-sm">{currentRule.discountType === 'Percentage' ? '%' : ''}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Max Discount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        value={currentRule.maxDiscount || ''}
                        onChange={(e) => setCurrentRule({ ...currentRule, maxDiscount: Number(e.target.value) })}
                        className="w-full border border-blue-500 rounded pl-7 pr-3 py-2 text-sm outline-none focus:border-blue-450"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Validity & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">VALIDITY</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Effective From</label>
                      <input
                        type="date"
                        value={currentRule.start || ''}
                        onChange={(e) => setCurrentRule({ ...currentRule, start: e.target.value })}
                        className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Effective To</label>
                      <input
                        type="date"
                        value={currentRule.end || ''}
                        onChange={(e) => setCurrentRule({ ...currentRule, end: e.target.value })}
                        className="w-full border border-blue-500 rounded px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-600 mb-3 border-b pb-1">PRIORITY</h4>
                  <div className="flex items-center gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Priority</label>
                      <input
                        type="number"
                        value={currentRule.priority || 1}
                        onChange={(e) => setCurrentRule({ ...currentRule, priority: Number(e.target.value) })}
                        className="w-24 border border-blue-500 rounded px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="mt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentRule.stackDiscount || false}
                          onChange={(e) => setCurrentRule({ ...currentRule, stackDiscount: e.target.checked })}
                          className="rounded text-indigo-600 h-4 w-4"
                        />
                        <span className="text-xs font-semibold text-gray-700 uppercase">Stack Discount</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-blue-500 pt-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border border-blue-500 rounded text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded text-sm font-semibold shadow hover:bg-indigo-700">Save Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingRules;
