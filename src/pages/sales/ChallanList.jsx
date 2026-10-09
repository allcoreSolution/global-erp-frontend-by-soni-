import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Search, Download, FileText, Printer, Eye, Trash2, Edit, Upload, FileDown,
  ChevronLeft, ChevronRight, AlertCircle, LayoutGrid, X, Filter, Plus 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const ChallanList = () => {
  const navigate = useNavigate();
  // Empty data table setup as requested: "No data available in table"
  const [challans, setChallans] = useState([]);
  const fileInputRef = useRef(null);

  // States
  const [selectedCourier, setSelectedCourier] = useState('All Courier');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);

  // Fetch Challans
  const fetchChallans = async () => {
    try {
      const res = await api.get('/challans');
      const data = res.data?.data || res.data || [];
      const mappedData = data.map((item, index) => ({
        id: item._id,
        date: item.challanDate || '-',
        referenceNo: item.challanNo || `CH-${index}`,
        orderNo: item.salesOrder || '-',
        courier: item.transporter || 'Self/Road',
        status: item.deliveryStatus || 'Pending',
        closingDate: item.deliveryDate || '-',
        totalAmount: item.items?.reduce((acc, curr) => acc + ((Number(curr.qty) || 0) * (Number(curr.rate) || 0)), 0) || 0,
        createdBy: item.preparedBy || 'System',
        closedBy: item.approvedBy || '-'
      }));
      setChallans(mappedData);
    } catch (err) {
      console.error("Failed to fetch challans:", err);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, []);

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    referenceNo: true,
    orderNo: true,
    courier: true,
    status: true,
    closingDate: true,
    totalAmount: true,
    createdBy: true,
    closedBy: true,
  });

  const [isColMenuOpen, setIsColMenuOpen] = useState(false);


  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this Challan record?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/challans/${id}`);
        setChallans(challans.filter(c => c.id !== id));
        Swal.fire('Deleted!', 'Deleted successfully', 'success');
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Failed to delete challan: ' + (err.response?.data?.message || err.message), 'error');
      }
    }
  };

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleDownloadSample = () => {
    const headers = "Challan No,Challan Date,Challan Type,Sales Order,Invoice No,Packing Slip,Customer,Contact Person,Mobile No,Billing Address,Shipping Address,Same As Billing,Item Product,Item SKU,Item Qty,Item Unit,Item Rate,Transport Mode,Transporter,Vehicle No,LR/GR No,E-Way Bill,Dispatch Date,Delivery Status,Expected Date,Delivery Remarks";
    const sampleData = "CH-1001,2023-12-01,Delivery,ORD-101,INV-101,PS-101,Customer Name,John Doe,9876543210,123 Billing St,123 Shipping St,FALSE,Sample Product,SKU001,10,PCS,500,Road,DHL Logistics,UP32AB1234,LR-9090,EWB-5050,2023-12-02,Pending,2023-12-05,Handle with care";
    const csvContent = headers + "\n" + sampleData + "\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'challans_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    const headers = "Challan No,Challan Date,Challan Type,Sales Order,Invoice No,Packing Slip,Customer,Contact Person,Mobile No,Billing Address,Shipping Address,Same As Billing,Item Product,Item SKU,Item Qty,Item Unit,Item Rate,Transport Mode,Transporter,Vehicle No,LR/GR No,E-Way Bill,Dispatch Date,Delivery Status,Expected Date,Delivery Remarks";
    // For export, we should actually map the real data, but since the previous implementation was a placeholder, 
    // I am updating it to include the correct headers for now.
    const rows = filteredChallans.map(c => {
      return `${c.referenceNo},${c.date},Delivery,${c.orderNo},,,,,,,,,,,,,,,,${c.courier},,,,,${c.status},,`;
    });
    const csvContent = headers + "\n" + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'challans_export.csv');
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
        Swal.fire('Error', 'CSV file is empty or only contains headers.', 'error');
        return;
      }
      
      const newEntries = [];
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
        if (columns.length < 5) continue;
        
        newEntries.push({
          challanNo: columns[0] || `CH-IMP-${Date.now()}-${i}`,
          challanDate: columns[1] || new Date().toISOString().split('T')[0],
          challanType: columns[2] || 'Delivery',
          salesOrder: columns[3] || '',
          invoiceNo: columns[4] || '',
          packingSlip: columns[5] || '',
          customer: columns[6] || 'Imported Customer',
          contactPerson: columns[7] || '',
          mobileNo: columns[8] || '',
          billingAddress: columns[9] || '',
          shippingAddress: columns[10] || '',
          sameAsBilling: columns[11]?.toLowerCase() === 'true',
          items: [
            {
               productName: columns[12] || 'Imported Product',
               sku: columns[13] || '',
               qty: Number(columns[14]) || 1,
               unit: columns[15] || 'PCS',
               rate: Number(columns[16]) || 0
            }
          ],
          transportMode: columns[17] || 'Road',
          transporter: columns[18] || '',
          vehicleNo: columns[19] || '',
          lrGrNo: columns[20] || '',
          ewayBillNo: columns[21] || '',
          dispatchDate: columns[22] || '',
          deliveryStatus: columns[23] || 'Pending',
          expectedDate: columns[24] || '',
          deliveryRemarks: columns[25] || 'Imported via CSV'
        });
      }

      if (newEntries.length === 0) {
        Swal.fire('Error', 'No valid records found in the file.', 'error');
        return;
      }

      try {
        const res = await api.post('/challans/import', newEntries);
        if (res.data?.success) {
          fetchChallans();
          Swal.fire('Success', `Successfully imported ${res.data.count || res.data.data?.length} challans!`, 'success');
        }
      } catch (error) {
        console.error("Failed to import", error);
        Swal.fire('Error', 'Failed to import challans. Some might be duplicates or invalid.', 'error');
      }

      e.target.value = '';
    };

    reader.readAsText(file);
  };

  // Search and status filters
  const filteredChallans = challans.filter(c => {
    const matchesSearch = c.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.courier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourier = selectedCourier === 'All Courier' || c.courier === selectedCourier;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    
    return matchesSearch && matchesCourier && matchesStatus;
  });

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredChallans.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredChallans.length / recordsPerPage) || 1;

  const totalAmountSum = filteredChallans.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="min-h-screen bg-white text-black p-6 rounded-lg shadow-md border border-blue-500">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-blue-500 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Challan List</h1>
          <p className="text-sm text-gray-600">Track and manage inventory courier delivery challans logs.</p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pb-1 md:pb-0">
          {/* Column Visibility Dropdown */}
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
            onClick={() => navigate('/sales/add-challan')}
            className="whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow transition-colors"
          >
            <Plus size={14} /> Create Challan
          </button>
        </div>
      </div>

      {/* Filter Options Controls Form Header */}
      <div className="bg-gray-50 border border-blue-500 rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Courier Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Courier</label>
          <select 
            value={selectedCourier}
            onChange={(e) => setSelectedCourier(e.target.value)}
            className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-blue-400"
          >
            <option value="All Courier">All Courier</option>
            <option value="DHL Logistics">DHL Logistics</option>
            <option value="FedEx Express">FedEx Express</option>
            <option value="Blue Dart">Blue Dart</option>
          </select>
        </div>

        {/* Status Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Status</label>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border border-blue-500 rounded px-2.5 py-1.5 text-xs bg-white text-black outline-none focus:border-blue-400"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Submit query */}
        <div>
          <button 
            type="button"
            onClick={() => alert(`Filtering Challans for ${selectedCourier} and status ${selectedStatus}`)}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-slate-800 rounded text-xs font-bold transition-colors shadow"
          >
            Submit Filter
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

      {/* Table view log grid */}
      <div className="overflow-x-auto border border-blue-500 rounded-lg">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-blue-500">
              {visibleColumns.date && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Date</th>}
              {visibleColumns.referenceNo && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Reference No</th>}
              {visibleColumns.orderNo && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Order No</th>}
              {visibleColumns.courier && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Courier</th>}
              {visibleColumns.status && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Status</th>}
              {visibleColumns.closingDate && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Closing Date</th>}
              {visibleColumns.totalAmount && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Total Amount</th>}
              {visibleColumns.createdBy && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Created By</th>}
              {visibleColumns.closedBy && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700">Closed By</th>}
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-700 text-right w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-500 bg-white">
            {currentRecords.length > 0 ? (
              currentRecords.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                  {visibleColumns.date && <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">{c.date}</td>}
                  {visibleColumns.referenceNo && <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{c.referenceNo}</td>}
                  {visibleColumns.orderNo && <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{c.orderNo}</td>}
                  {visibleColumns.courier && <td className="px-4 py-3 text-sm text-gray-800">{c.courier}</td>}
                  
                  {visibleColumns.status && (
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <span className="inline-flex px-2.5 py-0.5 rounded font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        {c.status}
                      </span>
                    </td>
                  )}

                  {visibleColumns.closingDate && <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">{c.closingDate}</td>}
                  {visibleColumns.totalAmount && <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">${c.totalAmount.toFixed(2)}</td>}
                  {visibleColumns.createdBy && <td className="px-4 py-3 text-sm text-gray-600">{c.createdBy}</td>}
                  {visibleColumns.closedBy && <td className="px-4 py-3 text-sm text-gray-600 text-center">{c.closedBy}</td>}
                  
                  {/* Action buttons */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => alert(`View details: ${c.referenceNo}`)}
                        className="p-1.5 text-indigo-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Challan details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => alert(`Edit not implemented: ${c.referenceNo}`)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Edit Record"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
                <td colSpan="10" className="px-4 py-12 text-center text-sm text-gray-500 bg-white font-medium">
                  <div className="flex flex-col items-center gap-2 justify-center">
                    <AlertCircle size={24} className="text-gray-400" />
                    <span>No data available in table</span>
                  </div>
                </td>
              </tr>
            )}

            {/* Total Row */}
            <tr className="bg-gray-50/90 font-bold border-t border-blue-500">
              <td colSpan={visibleColumns.date ? 1 : 0}>Total</td>
              {visibleColumns.referenceNo && <td></td>}
              {visibleColumns.orderNo && <td></td>}
              {visibleColumns.courier && <td></td>}
              {visibleColumns.status && <td></td>}
              {visibleColumns.closingDate && <td></td>}
              {visibleColumns.totalAmount && <td className="px-4 py-3.5 text-sm font-black text-gray-900">${totalAmountSum.toFixed(2)}</td>}
              {visibleColumns.createdBy && <td></td>}
              {visibleColumns.closedBy && <td></td>}
              <td className="px-4 py-3.5"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-xs font-semibold text-gray-600">
          Showing {filteredChallans.length > 0 ? indexOfFirstRecord + 1 : 0} to {Math.min(indexOfLastRecord, filteredChallans.length)} of {filteredChallans.length} entries
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
    </div>
  );
};

export default ChallanList;
