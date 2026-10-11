import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trash2, ArrowLeft, Truck, PackageCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const AddPackingSlip = () => {
  const navigate = useNavigate();

  // State for fetched data
  const [salesList, setSalesList] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Form State
  const [packingNo, setPackingNo] = useState('');
  const [packingDate, setPackingDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Draft');

  // Selected Invoice
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [selectedSaleData, setSelectedSaleData] = useState(null);

  // Manual Shipping Details
  const [transporter, setTransporter] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');

  // Verification
  const [packedBy, setPackedBy] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');
  const [remarks, setRemarks] = useState('');

  // Products from Invoice to pack
  const [productsToPack, setProductsToPack] = useState([]);

  // Fetch initial data (Invoices and Employees)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, empRes] = await Promise.all([
          api.get('/sales').catch(() => ({ data: { data: [] } })),
          api.get('/employees').catch(() => ({ data: { data: [] } }))
        ]);

        const sData = salesRes.data?.data || salesRes.data || [];
        // Only show completed/pending sales that can be packed
        setSalesList(sData);

        const eData = empRes.data?.data || empRes.data || [];
        setEmployees(eData);

      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    fetchData();
  }, []);

  // Handle Invoice Selection (Auto-fill trigger)
  const handleSaleSelect = (saleId) => {
    setSelectedSaleId(saleId);
    if (!saleId) {
      setSelectedSaleData(null);
      setProductsToPack([]);
      return;
    }

    const sale = salesList.find(s => s._id === saleId);
    if (sale) {
      setSelectedSaleData(sale);

      // Auto-fill products from the sale
      if (sale.orderItems && sale.orderItems.length > 0) {
        const items = sale.orderItems.map(item => ({
          productName: item.name,
          productCode: item.code,
          productId: item.product,
          orderedQty: item.quantity,
          packQty: item.quantity, // default to pack all ordered
          batchNo: '',
          packagesCount: 1,
          weight: 0
        }));
        setProductsToPack(items);
      } else {
        setProductsToPack([]);
      }
    }
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...productsToPack];
    updated[index][field] = value;
    setProductsToPack(updated);
  };

  const handleRemoveProduct = (index) => {
    setProductsToPack(productsToPack.filter((_, i) => i !== index));
  };

  const totalPackages = productsToPack.reduce((sum, p) => sum + (Number(p.packagesCount) || 0), 0);
  const totalWeight = productsToPack.reduce((sum, p) => sum + (Number(p.weight) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSaleId) {
      Swal.fire('Error', 'Please select an Invoice/Sale first.', 'error');
      return;
    }
    if (productsToPack.length === 0) {
      Swal.fire('Error', 'No products to pack.', 'error');
      return;
    }

    // Prepare Payload
    const payload = {
      packingNo: packingNo || 'AUTO-GEN', // Backend will generate if left empty or handle it
      packingDate,
      status,
      saleId: selectedSaleId,
      transporter,
      vehicleNo,
      packedBy,
      verifiedBy,
      remarks,
      items: productsToPack
    };

    try {
      const res = await api.post('/packing-slips', payload);

      console.log('Saved Packing Slip:', res.data);
      Swal.fire('Success', 'Packing Slip saved successfully!', 'success');
      navigate('/sales/packing-slip-list');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save packing slip.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <button
          onClick={() => navigate('/sales/packing-slip-list')}
          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <PackageCheck size={26} className="text-indigo-600" />
            Add Packing Slip
          </h1>
          <p className="text-sm text-gray-500 mt-1">Select an Invoice to auto-fill packing details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* TOP SECTION: Basic Info & Invoice Selection */}
        <div className="bg-blue-50/30 p-4 border border-blue-100 rounded-lg">
          <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">Primary Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Select Invoice *</label>
              <select
                value={selectedSaleId}
                onChange={(e) => handleSaleSelect(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
                required
              >
                <option value="">-- Choose Invoice --</option>
                {salesList.map(sale => (
                  <option key={sale._id} value={sale._id}>
                    {sale.invoiceNo || sale.referenceNo} ({sale.customer?.name || 'Walk-in'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Packing Date *</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="date"
                  value={packingDate}
                  onChange={e => setPackingDate(e.target.value)}
                  className="w-full border border-blue-500 rounded pl-9 pr-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
              >
                <option value="Draft">Draft</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Packing No.</label>
              <input
                type="text"
                value={packingNo}
                onChange={e => setPackingNo(e.target.value)}
                className="w-full border border-blue-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-500 outline-none"
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>
        </div>

        {/* AUTO-FILLED CUSTOMER DETAILS */}
        {selectedSaleData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-in fade-in duration-300">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Customer & Shipping Information (Auto-filled)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                <p className="font-semibold text-sm">{selectedSaleData.customer?.name || 'Walk-in Customer'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Contact Details</p>
                <p className="font-semibold text-sm">
                  {selectedSaleData.customer?.phone || 'N/A'} <br />
                  <span className="text-xs text-gray-500 font-normal">{selectedSaleData.customer?.email || ''}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                <p className="font-semibold text-sm">
                  {selectedSaleData.customer?.billingAddress?.street || ''} {selectedSaleData.customer?.billingAddress?.city || 'Address not provided'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LOGISTICS & VERIFICATION */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2 flex items-center gap-2">
            <Truck size={18} className="text-gray-600" /> Transport & Verification
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Transporter Name</label>
              <input
                type="text"
                value={transporter}
                onChange={e => setTransporter(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
                placeholder="e.g. DTDC, BlueDart"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Vehicle No.</label>
              <input
                type="text"
                value={vehicleNo}
                onChange={e => setVehicleNo(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
                placeholder="e.g. MH-01-AB-1234"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Packed By</label>
              <select
                value={packedBy}
                onChange={e => setPackedBy(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
              >
                <option value="">Select Employee...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name || emp.employeeName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Verified By</label>
              <select
                value={verifiedBy}
                onChange={e => setVerifiedBy(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
              >
                <option value="">Select Supervisor...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name || emp.employeeName}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Remarks / Notes</label>
              <textarea
                rows="2"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full border border-blue-500 rounded px-3 py-2 text-sm bg-white text-black outline-none focus:border-blue-450"
                placeholder="Any special packing instructions..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* PRODUCTS TO PACK */}
        {selectedSaleData && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">
              Products to Pack
            </h2>
            <div className="overflow-x-auto border border-blue-500 rounded-lg">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-blue-500">
                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700">Product</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-32">Batch No</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-24 text-center">Ordered</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-28 text-center">Pack Qty</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-28 text-center">Packages</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-28 text-center">Weight (kg)</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase text-gray-700 w-16 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-200 bg-white">
                  {productsToPack.length > 0 ? (
                    productsToPack.map((prod, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {prod.productName}
                          <div className="text-[10px] text-gray-500 font-mono">{prod.productCode}</div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={prod.batchNo}
                            onChange={e => handleProductChange(index, 'batchNo', e.target.value)}
                            className="w-full border border-blue-500 rounded px-2 py-1.5 text-sm bg-white text-black outline-none"
                            placeholder="e.g. B-102"
                          />
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 bg-gray-50 font-semibold">
                          {prod.orderedQty}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1" max={prod.orderedQty}
                            value={prod.packQty}
                            onChange={e => handleProductChange(index, 'packQty', e.target.value)}
                            className="w-full border border-blue-500 rounded px-2 py-1.5 text-sm bg-white text-black text-center outline-none font-bold text-indigo-700"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={prod.packagesCount}
                            onChange={e => handleProductChange(index, 'packagesCount', e.target.value)}
                            className="w-full border border-blue-500 rounded px-2 py-1.5 text-sm bg-white text-black text-center outline-none"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={prod.weight}
                            onChange={e => handleProductChange(index, 'weight', e.target.value)}
                            className="w-full border border-blue-500 rounded px-2 py-1.5 text-sm bg-white text-black text-center outline-none"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-500">
                        No products available to pack.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Sub Summary */}
            {productsToPack.length > 0 && (
              <div className="flex justify-end gap-6 mt-4 text-sm font-semibold text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                <div>Total Packages: <span className="text-indigo-700 font-bold ml-1">{totalPackages}</span></div>
                <div>Total Weight: <span className="text-indigo-700 font-bold ml-1">{totalWeight} kg</span></div>
              </div>
            )}
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-blue-500 sticky bottom-0 bg-white pb-2">
          <button
            type="button"
            onClick={() => navigate('/sales/packing-slip-list')}
            className="px-6 py-2.5 border border-blue-500 rounded text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold shadow-md transition-colors"
          >
            Save Packing Slip
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddPackingSlip;
