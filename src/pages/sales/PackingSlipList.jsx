import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Download, FileText, Printer, Eye, Trash2, Edit, Upload, FileDown,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle, EyeOff, LayoutGrid, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api';

const PackingSlipList = () => {
  const [packingSlips, setPackingSlips] = useState([]);
  const [allPackingSlips, setAllPackingSlips] = useState([]);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewSlip, setViewSlip] = useState(null);

  // Fetch Packing Slips
  const fetchPackingSlips = async () => {
    try {
      const res = await api.get('/packing-slips');
      const data = res.data?.data || res.data || [];
      const mappedData = data.map((item, index) => ({
        id: item._id,
        reference: item.packingNo || `PS-${index}`,
        saleReference: item.saleId?.invoiceNo || item.saleId?.referenceNo || '-',
        customerName: item.saleId?.customer?.name || 'Walk-in',
        productList: (item.items && item.items.length > 0)
          ? item.items.map(i => i.productName || i.productId?.productName || i.product).filter(Boolean).join(', ')
          : (item.products && item.products.length > 0)
            ? item.products.map(p => p.productName || p.product).filter(Boolean).join(', ')
            : '-',
        status: item.status || 'Draft'
      }));
      setPackingSlips(mappedData);
      setAllPackingSlips(data);
    } catch (err) {
      console.error("Failed to fetch packing slips:", err);
    }
  };

  useEffect(() => {
    fetchPackingSlips();
  }, []);

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    reference: true,
    saleReference: true,
    customerName: true,
    productList: true,
    status: true,
  });

  const [isColMenuOpen, setIsColMenuOpen] = useState(false);


  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this packing slip?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/packing-slips/${id}`);
        setPackingSlips(packingSlips.filter(p => p.id !== id));
        setAllPackingSlips(allPackingSlips.filter(p => p._id !== id));
        Swal.fire('Deleted!', 'Deleted successfully', 'success');
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to delete packing slip: ' + (err.response?.data?.message || err.message), 'error');
      }
    }
  };

  const handleView = (id) => {
    const slipDetails = allPackingSlips.find(p => p._id === id);
    if (slipDetails) {
      setViewSlip(slipDetails);
    } else {
      Swal.fire('Error', 'Packing slip details not found', 'error');
    }
  };

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleDownloadSample = () => {
    const csvContent = "Reference,Sale Reference,Delivery Reference,Product List,Amount,Status\nSample,Sample,Sample,Sample,100,Yes\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'packing_slips_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    const headers = ["Reference", "Sale Reference", "Customer Name", "Product List", "Status"];
    const rows = filteredSlips.map(p => [
      `"${p.reference}"`,
      `"${p.saleReference}"`,
      `"${p.customerName}"`,
      `"${p.productList}"`,
      `"${p.status}"`
    ]);
    const csvContent = [headers.join(',') + '\n' + 'Sample,Sample,Sample,Sample,100,Yes', ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'packing_slips_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      if (lines.length <= 1) {
        alert('CSV file is empty or only contains headers.');
        return;
      }
      const newEntries = [];
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        if (columns.length < 4) continue;

        const packingNo = columns[0] || `PS-IMP-${Date.now()}-${i}`;
        const salesOrder = columns[1] || '';
        const deliveryChallan = columns[2] || '';
        const productListStr = columns[3] || 'Imported Product';
        const amount = Number(columns[4]) || 0; // Not explicitly stored in PackingSlip, but we have products
        const status = columns[5] || 'Pending';

        newEntries.push({
          packingNo,
          salesOrder,
          deliveryChallan,
          status,
          products: [
            { product: productListStr, qty: 1, package: 1, weight: 1 }
          ],
          remarks: 'Record generated via CSV data upload sheet'
        });
      }

      if (newEntries.length === 0) {
        alert('No valid packing slips found in the file.');
        return;
      }

      try {
        const res = await api.post('/packing-slips/import', newEntries);
        if (res.data?.success) {
          fetchPackingSlips();
          alert(`Successfully imported ${res.data.count || res.data.data?.length} packing slips!`);
        }
      } catch (error) {
        console.error("Failed to import", error);
        alert('Failed to import packing slips. Some might be duplicates or invalid.');
      }

      e.target.value = '';
    };

    reader.readAsText(file);
  };

  // Filter
  const filteredSlips = packingSlips.filter(p =>
    p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.saleReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productList.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSlips.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredSlips.length / recordsPerPage) || 1;

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">

      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Packing Slips</h1>
          <p className="text-sm text-gray-600">Overview of generated packing slips and challan references.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pb-1 md:pb-0">
          {/* Column Visibility Dropdown toggle */}
          <div className="relative">
            <button
              onClick={() => setIsColMenuOpen(!isColMenuOpen)}
              className="whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 bg-white transition-colors"
            >
              <LayoutGrid size={14} /> Column Visibility
            </button>

            {isColMenuOpen && (
              <div className="absolute right-0 z-15 mt-1.5 w-52 bg-white border border-blue-500 rounded shadow-xl p-2.5 space-y-1.5 text-xs text-gray-800">
                <p className="font-bold border-b border-blue-500/20 pb-1 text-gray-500 uppercase tracking-wider text-[9px]">Toggle Columns</p>
                {Object.keys(visibleColumns).map((col) => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded font-medium">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={() => toggleColumn(col)}
                      className="rounded text-indigo-600 border-blue-500 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          <button
            onClick={() => fileInputRef.current.click()}
            className="whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Upload size={14} /> Import CSV
          </button>
          <button
            onClick={handleDownloadSample}
            className="whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <FileDown size={14} /> Sample
          </button>
          <button
            onClick={handleExportCSV}
            className="whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => navigate('/sales/add-packing-slip')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Add packing slip
          </button>
        </div>
      </div>

      {/* Filter and Limit Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-blue-500 rounded px-2.5 py-1 text-sm bg-white outline-none focus:border-blue-450 font-bold"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={150}>150</option>
          </select>
          <span className="text-sm text-gray-700">entries</span>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-500">Search:</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-blue-500 rounded pl-16 pr-3 py-1.5 text-sm bg-white text-black outline-none focus:border-blue-450 font-medium"
          />
        </div>
      </div>

      {/* Table view grids */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              {visibleColumns.reference && <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Reference</th>}
              {visibleColumns.saleReference && <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Sale Ref/Invoice</th>}
              {visibleColumns.customerName && <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Customer Name</th>}
              {visibleColumns.productList && <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Product List</th>}
              {visibleColumns.status && <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700">Status</th>}
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 text-right w-24">Option</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((slip) => (
                <tr key={slip.id} className="hover:bg-gray-50/70 transition-colors">
                  {visibleColumns.reference && <td className="px-6 py-4 text-sm font-semibold text-gray-900">{slip.reference}</td>}
                  {visibleColumns.saleReference && <td className="px-6 py-4 text-sm text-gray-600">{slip.saleReference}</td>}
                  {visibleColumns.customerName && <td className="px-6 py-4 text-sm text-gray-600">{slip.customerName}</td>}
                  {visibleColumns.productList && <td className="px-6 py-4 text-sm text-gray-800 font-medium">{slip.productList}</td>}
                  {visibleColumns.status && (
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        {slip.status}
                      </span>
                    </td>
                  )}
                  {/* Actions options */}
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleView(slip.id)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(slip.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500 bg-white font-medium">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No data available in table</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-xs font-semibold text-gray-600">
          Showing {filteredSlips.length > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, filteredSlips.length)} of {filteredSlips.length} entries
        </div>

        <div className="inline-flex items-center border border-blue-500 rounded divide-x divide-blue-500 shadow-sm bg-white">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 text-gray-600 transition-colors ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 text-gray-600 transition-colors ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Next
          </button>
        </div>
      </div>



      {/* VIEW MODAL */}
      {viewSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">Packing Slip Details</h2>
              <button onClick={() => setViewSlip(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-600 block">Packing No:</span>
                  <span>{viewSlip.packingNo || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600 block">Status:</span>
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                    {viewSlip.status || 'Draft'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600 block">Sale Invoice No:</span>
                  <span>{viewSlip.saleId?.invoiceNo || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600 block">Customer Name:</span>
                  <span>{viewSlip.saleId?.customer?.name || 'Walk-in'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600 block">Transporter:</span>
                  <span>{viewSlip.transporter || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600 block">Vehicle No:</span>
                  <span>{viewSlip.vehicleNo || '-'}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold border-b pb-1 mt-4 mb-2">Products Packed</h3>
                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Product</th>
                        <th className="px-3 py-2 font-semibold">Ordered Qty</th>
                        <th className="px-3 py-2 font-semibold">Packed Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(viewSlip.items || viewSlip.products || []).map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2">{item.productName || item.productId?.productName || item.product || '-'}</td>
                          <td className="px-3 py-2">{item.orderedQty || item.quantity || 0}</td>
                          <td className="px-3 py-2 font-bold">{item.packQty || item.qty || 0}</td>
                        </tr>
                      ))}
                      {(!viewSlip.items && !viewSlip.products) || (viewSlip.items?.length === 0 && viewSlip.products?.length === 0) ? (
                        <tr>
                          <td colSpan="3" className="px-3 py-4 text-center text-gray-500">No products found.</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>

              {viewSlip.remarks && (
                <div>
                  <span className="font-semibold text-gray-600 block">Remarks:</span>
                  <p className="text-gray-800 bg-gray-50 p-2 rounded border mt-1 text-sm">{viewSlip.remarks}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewSlip(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackingSlipList;
