import React, { useState } from 'react';
import { 
  Upload, HelpCircle, FileSpreadsheet, Download, Info, CheckCircle 
} from 'lucide-react';

const ImportPurchaseCSV = () => {
  // States
  const [warehouse, setWarehouse] = useState('');
  const [supplier, setSupplier] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState('Received');
  const [orderTax, setOrderTax] = useState('No Tax');
  const [discount, setDiscount] = useState('0');
  const [shippingCost, setShippingCost] = useState('0.00');
  const [note, setNote] = useState('');
  
  const [documentFile, setDocumentFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);

  // Download Sample Template simulation
  const handleDownloadSample = () => {
    alert("Downloading sample purchase import sheet schema: purchase_import_template.csv");
  };

  // Submit Handle
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!warehouse) {
      alert("Please select Warehouse.");
      return;
    }
    if (!csvFile) {
      alert("Please select CSV File to upload.");
      return;
    }
    alert(`CSV Purchase records imported successfully!\nWarehouse: ${warehouse}\nFile: ${csvFile.name}`);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Header */}
      <div className="mb-6 border-b border-blue-500 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Import Purchase</h1>
          <p className="text-sm text-gray-500 mt-1">The field labels marked with * are required input fields.</p>
        </div>

        {/* Download Sample file */}
        <button
          type="button"
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
        >
          <Download size={14} /> Download Sample File
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Inputs grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Warehouse */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Warehouse *</label>
            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
              required
            >
              <option value="">Select warehouse...</option>
              <option value="Central Warehouse">Central Warehouse</option>
              <option value="North Branch Warehouse">North Branch Warehouse</option>
              <option value="East Side Storage">East Side Storage</option>
            </select>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Supplier</label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
            >
              <option value="">Select supplier...</option>
              <option value="Apple Global Corp">Apple Global Corp</option>
              <option value="Dell Trading Co">Dell Trading Co</option>
              <option value="Logitech Distribution">Logitech Distribution</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Purchase Status</label>
            <select
              value={purchaseStatus}
              onChange={(e) => setPurchaseStatus(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
            >
              <option value="Received">Received</option>
              <option value="Pending">Pending</option>
              <option value="Ordered">Ordered</option>
            </select>
          </div>

          {/* Attach Document */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Attach Document</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-2 border border-blue-500 rounded cursor-pointer hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors">
                <Upload size={14} className="text-gray-500" />
                <span>Choose File</span>
                <input 
                  type="file" 
                  onChange={(e) => setDocumentFile(e.target.files[0])}
                  className="hidden" 
                />
              </label>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">
                {documentFile ? documentFile.name : 'No file chosen'}
              </span>
            </div>
          </div>

        </div>

        {/* CSV File Upload Section */}
        <div className="bg-gray-50 border border-blue-500 rounded-lg p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">Upload CSV File *</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded cursor-pointer text-xs font-bold shadow transition-colors">
                  <FileSpreadsheet size={15} />
                  <span>Choose CSV File</span>
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="hidden" 
                  />
                </label>
                <span className="text-xs text-gray-800 font-semibold truncate max-w-[250px]">
                  {csvFile ? csvFile.name : 'No CSV file chosen'}
                </span>
              </div>
            </div>

            {/* Note alert */}
            <div className="flex items-start gap-2 max-w-md bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded text-xs">
              <Info size={16} className="shrink-0 mt-0.5 text-indigo-600" />
              <div>
                <p className="font-bold mb-1">Correct Schema Columns Order:</p>
                <p className="font-mono bg-white p-1.5 rounded border border-blue-100 text-[10px] select-all leading-relaxed">
                  product_code, quantity, purchase_unit_code, cost, discount_per_unit, tax_name, profit_margin, profit_margin_type, price, imei_number
                </p>
                <p className="mt-1 text-[10px] text-blue-700">All columns must be mapped. IMEI column is optional but requires header space.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Taxation parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Tax */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Order Tax</label>
            <select
              value={orderTax}
              onChange={(e) => setOrderTax(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
            >
              <option value="No Tax">No Tax</option>
              <option value="5%">GST 5%</option>
              <option value="10%">GST 10%</option>
              <option value="18%">GST 18%</option>
            </select>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Discount</label>
            <input 
              type="number"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-400"
            />
          </div>

          {/* Shipping Cost */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Shipping Cost</label>
            <input 
              type="number"
              step="0.01"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Note details */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Note</label>
          <textarea
            rows="4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type transaction log comments..."
            className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450 placeholder:text-gray-400"
          ></textarea>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setWarehouse('');
              setSupplier('');
              setCsvFile(null);
              setNote('');
            }}
            className="px-5 py-2.5 border border-blue-500 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-sm font-semibold shadow transition-colors flex items-center gap-1.5"
          >
            <CheckCircle size={15} />
            <span>Submit Import</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default ImportPurchaseCSV;
