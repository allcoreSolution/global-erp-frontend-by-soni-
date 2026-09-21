import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../api';

const DynamicSelect = ({ 
  category, 
  name, 
  value, 
  onChange, 
  defaultOptions = [], 
  className = '' 
}) => {
  const [options, setOptions] = useState(defaultOptions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newValue, setNewValue] = useState('');

  // Fetch options for this category from backend
  const fetchOptions = async () => {
    try {
      const res = await api.get(`/master-options?category=${category}`);
      const data = res.data?.data || res.data || [];
      if (data.length > 0) {
        // Merge default options and backend options, avoiding duplicates
        const backendOptions = data.map(opt => opt.value);
        const merged = [...new Set([...defaultOptions, ...backendOptions])];
        setOptions(merged);
      }
    } catch (err) {
      console.error(`Failed to fetch options for ${category}`, err);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [category]);

  const handleAddOption = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    try {
      const res = await api.post('/master-options', {
        category,
        label: newValue.trim(),
        value: newValue.trim()
      });
      // Option saved successfully
      setOptions(prev => [...prev, newValue.trim()]);
      // Auto-select the newly added option
      onChange({ target: { name, value: newValue.trim() } });
      
      setNewValue('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to add new option', err);
      alert('Failed to add option: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${className}`}
      >
        <option value="">Select {category}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>
      
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="p-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 hover:text-indigo-800 transition-colors border border-indigo-200"
        title={`Add new ${category}`}
      >
        <Plus size={18} />
      </button>

      {/* Add New Option Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <h3 className="font-bold text-indigo-900">Add New {category}</h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Value
              </label>
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
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddOption}
                className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Option
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicSelect;
