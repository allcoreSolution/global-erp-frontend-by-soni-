import React, { useState } from 'react';
import { User, Package, Building, Edit, ChevronRight } from 'lucide-react';

const Mapping = () => {
  const [customerMappings] = useState([
    { id: 'MAP-101', target: 'Ramesh Kumar & Sons', priceList: 'VIP Customer Pricing' },
    { id: 'MAP-102', target: 'Apex Retailers', priceList: 'Regular Retail Slab' }
  ]);

  const [productMappings] = useState([
    { id: 'MAP-201', target: 'TMT Steel Bar 12mm', priceList: 'VIP Customer Pricing' },
    { id: 'MAP-202', target: 'GI Pipe 2 Inches', priceList: 'Regular Retail Slab' }
  ]);

  const [branchMappings] = useState([
    { id: 'MAP-301', target: 'Jaipur HQ', priceList: 'VIP Customer Pricing' },
    { id: 'MAP-302', target: 'Kota Branch Office', priceList: 'Regular Retail Slab' }
  ]);

  const [activeTab, setActiveTab] = useState('customer');

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Price List Mapping Rules</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Bind custom pricing lists and structures with specific clients, products, or branch locations.</p>
      </div>

      <div className="flex bg-slate-100 rounded text-[10px] sm:text-xs font-semibold overflow-x-auto no-scrollbar mb-4">
        {[
          { id: 'customer', label: 'Customer-wise Price', icon: User },
          { id: 'product', label: 'Product-wise Price', icon: Package },
          { id: 'branch', label: 'Branch-wise Price', icon: Building }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1 sm:gap-1.5 transition-colors border-r last:border-r-0 whitespace-nowrap px-3 ${
              activeTab === tab.id ? 'bg-white text-indigo-600 border-b-2 border-b-blue-600' : 'text-gray-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="border rounded-lg p-4 min-h-[250px] overflow-hidden">
        {activeTab === 'customer' && (
          <div className="space-y-3 text-[11px] sm:text-xs">
            <h4 className="font-bold text-slate-800">Customer Specific Price List Rules</h4>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b font-bold text-gray-700">
                  <tr>
                    <th className="p-2 whitespace-nowrap">Mapping ID</th>
                    <th className="p-2 whitespace-nowrap">Customer Name</th>
                    <th className="p-2 whitespace-nowrap">Mapped Price List</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerMappings.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2 font-semibold text-indigo-600 whitespace-nowrap font-mono">{item.id}</td>
                      <td className="p-2 text-gray-800 whitespace-nowrap">{item.target}</td>
                      <td className="p-2 text-gray-500 whitespace-nowrap">{item.priceList}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'product' && (
          <div className="space-y-3 text-[11px] sm:text-xs">
            <h4 className="font-bold text-slate-800">Product Specific Price List Rules</h4>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b font-bold text-gray-700">
                  <tr>
                    <th className="p-2 whitespace-nowrap">Mapping ID</th>
                    <th className="p-2 whitespace-nowrap">Product Item</th>
                    <th className="p-2 whitespace-nowrap">Mapped Price List</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productMappings.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2 font-semibold text-indigo-600 whitespace-nowrap font-mono">{item.id}</td>
                      <td className="p-2 text-gray-800 whitespace-nowrap">{item.target}</td>
                      <td className="p-2 text-gray-500 whitespace-nowrap">{item.priceList}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'branch' && (
          <div className="space-y-3 text-[11px] sm:text-xs">
            <h4 className="font-bold text-slate-800">Office Branch Specific Price List Rules</h4>
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b font-bold text-gray-700">
                  <tr>
                    <th className="p-2 whitespace-nowrap">Mapping ID</th>
                    <th className="p-2 whitespace-nowrap">Branch Office</th>
                    <th className="p-2 whitespace-nowrap">Mapped Price List</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branchMappings.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2 font-semibold text-indigo-600 whitespace-nowrap font-mono">{item.id}</td>
                      <td className="p-2 text-gray-800 whitespace-nowrap">{item.target}</td>
                      <td className="p-2 text-gray-500 whitespace-nowrap">{item.priceList}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mapping;
