import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../api';

const DynamicSelect = ({ 
  category, 
  name, 
  value, 
  onChange, 
  defaultOptions = [], 
  className = '',
  hideAddButton = false,
  disabled = false,
  dependentValue = '',
  dependentValue2 = ''
}) => {
  const [options, setOptions] = useState(defaultOptions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newValue, setNewValue] = useState('');

  const fetchOptions = async () => {
    if ((category === 'Purchase Invoice' || category === 'Invoice') && !dependentValue) {
      setOptions(defaultOptions);
      return;
    }

    let endpoint = `/master-options?category=${category}`;
    try {
      let dataKey = 'value';

      switch(category) {
        case 'Customer': endpoint = '/customers'; dataKey = 'name'; break;
        case 'Supplier': 
            endpoint = dependentValue ? `/suppliers?branchName=${encodeURIComponent(dependentValue)}` : '/suppliers'; 
            dataKey = 'companyName'; 
            break;
        case 'Employee': endpoint = '/employees'; dataKey = 'employeeName'; break;
        case 'Account': endpoint = '/account-ledgers'; dataKey = 'accountName'; break;
        case 'Cost Center': endpoint = '/cost-centers'; dataKey = 'name'; break;
        case 'Tax Config': endpoint = '/tax-slabs'; dataKey = 'name'; break;
        case 'Product': endpoint = '/products'; dataKey = 'productName'; break;
        case 'Branch': endpoint = '/branches'; dataKey = 'name'; break;
        case 'Warehouse': 
            endpoint = dependentValue ? `/catalogs/warehouses?branch=${encodeURIComponent(dependentValue)}` : '/catalogs/warehouses'; 
            dataKey = 'name'; 
            break;
        case 'Purchase Invoice':
            endpoint = `/purchases?supplierName=${encodeURIComponent(dependentValue)}`;
            dataKey = 'purchaseNo';
            break;
        case 'Invoice':
            endpoint = dependentValue ? `/sales?customer=${encodeURIComponent(dependentValue)}` : '/sales';
            dataKey = 'invoiceNo';
            break;
        default:
            break;
      }

      const res = await api.get(endpoint);
      const data = res.data?.data || res.data || [];
      
      if (data.length > 0) {
        let backendOptions = [];
        if (endpoint.includes('master-options')) {
          backendOptions = data.map(opt => opt.value);
        } else {
          backendOptions = data.map(opt => opt[dataKey]);
        }
        
        backendOptions = backendOptions.filter(Boolean);
        const merged = [...new Set([...defaultOptions, ...backendOptions])];
        setOptions(merged);
      } else {
        setOptions(defaultOptions);
      }
    } catch (err) {
      console.error(`Failed to fetch options for ${category} from ${endpoint}`, err);
      setOptions(defaultOptions);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [category, dependentValue, dependentValue2]);

  const handleAddOption = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    try {
      await api.post('/master-options', {
        category,
        label: newValue.trim(),
        value: newValue.trim()
      });
      setOptions(prev => [...new Set([...prev, newValue.trim()])]);
      onChange({ target: { name, value: newValue.trim() } });
      setNewValue('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to add new option', err);
      alert('Failed to add option: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'bg-white'}`}
      >
        <option value="">Select {category} ({options?.length || 0})</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>
      
      {!hideAddButton && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
          className={`p-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={`Add new ${category}`}
        >
          <Plus size={18} />
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <h3 className="font-bold text-indigo-900">Add New {category}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Value</label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={`Enter new ${category}`}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleAddOption} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add Option</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicSelect;
