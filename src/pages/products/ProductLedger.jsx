import React from 'react';

const ProductLedger = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Product Ledger</h1>
          <p className="text-xs text-gray-500">Track and view the ledger details for products.</p>
        </div>
      </div>
      
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
        <p>Product Ledger implementation goes here.</p>
      </div>
    </div>
  );
};

export default ProductLedger;
