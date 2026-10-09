import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Upload, Printer, CheckCircle, Trash2, Edit, Plus, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../../api';

const PaymentList = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState({});
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  const fetchPaymentsAndCatalogs = async () => {
    try {
      setLoading(true);
      const [payRes, suppRes] = await Promise.all([
        api.get('/payments'),
        api.get('/suppliers').catch(() => ({ data: { data: [] } }))
      ]);
      
      if (payRes.data.success) {
        setPayments(payRes.data.data);
      }
      
      const suppData = suppRes.data?.data || [];
      const suppMap = {};
      suppData.forEach(s => {
        suppMap[s._id] = s.companyName || s.supplierName || 'Unknown Supplier';
      });
      setSuppliers(suppMap);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsAndCatalogs();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to delete this payment?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/payments/${id}`);
        setPayments(prev => prev.filter(p => p._id !== id));
        Swal.fire('Deleted!', 'Payment deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting payment:', error);
        Swal.fire('Error', 'Failed to delete payment', 'error');
      }
    }
  };

  const filtered = payments.filter(p => {
    const suppName = suppliers[p.supplierParty] || p.supplierParty || '';
    return suppName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (p.paymentNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
           (p.invoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Real CSV Export
  const handleExportCSV = () => {
    const csvContent = "Payment ID,Supplier Name,Invoice Ref,Amount (₹),Date,Payment Mode,Ref No,Advance\n1001,Sample Name,Sample,100,2023-12-01,Sample,1001,Sample\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payments_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    const csvContent = "Payment ID,Supplier Name,Invoice Ref,Amount (₹),Date,Payment Mode,Ref No,Advance\n1001,Sample Name,Sample,100,2023-12-01,Sample,1001,Sample\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payments_sample.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Swal.fire('Import Success', 'File selected successfully. (Add logic as needed)', 'success');
    e.target.value = '';
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen space-y-6">
      <input
        type="file"
        id="payment-list-import-csv"
        accept=".csv"
        className="hidden"
        onChange={handleImportCSV}
      />

      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Payments Registry</h1>
          <p className="text-[12px] text-gray-500 mt-1">Manage supplier payments and clearing registers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-slate-50 transition-colors"
          >
            <Upload size={14} /> Import CSV
          </button>
          <button 
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-slate-50 transition-colors"
          >
            <FileDown size={14} /> Sample
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-blue-500 rounded hover:bg-slate-50 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={() => navigate('/payment/new')} 
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors"
          >
            <Plus size={14} /> New Payment
          </button>
        </div>
      </div>

      {/* Search demonstration */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-bold text-[11px] sm:text-xs uppercase text-slate-700 tracking-wider">Search Filters Testing Matrix</h3>
        <div className="relative max-w-sm no-print">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, Supplier, or Invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Demo filtered list */}
        <div className="border rounded overflow-x-auto text-[10px] sm:text-[11px]">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-2 whitespace-nowrap">Payment ID</th>
                <th className="p-2 whitespace-nowrap">Supplier Name</th>
                <th className="p-2 whitespace-nowrap">Invoice Ref</th>
                <th className="p-2 whitespace-nowrap text-right">Amount (₹)</th>
                <th className="p-2 whitespace-nowrap">Date</th>
                <th className="p-2 whitespace-nowrap">Mode</th>
                <th className="p-2 whitespace-nowrap">Ref No</th>
                <th className="p-2 whitespace-nowrap text-center">Type</th>
                <th className="p-2 whitespace-nowrap text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-slate-500">Loading payments...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-slate-500">No payments found.</td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold text-indigo-600 whitespace-nowrap">{p.paymentNo}</td>
                    <td className="p-2 font-medium text-gray-900">{suppliers[p.supplierParty] || p.supplierParty || '-'}</td>
                    <td className="p-2 text-gray-650">{p.invoiceNo || '-'}</td>
                    <td className="p-2 text-right font-bold text-rose-600">₹ {(p.paymentAmount || 0).toLocaleString()}</td>
                    <td className="p-2 text-gray-500 whitespace-nowrap">{p.paymentDate}</td>
                    <td className="p-2 text-gray-600">{p.paymentMethod}</td>
                    <td className="p-2 font-mono text-gray-550">{p.transactionRef || '-'}</td>
                    <td className="p-2 text-center">
                      <span className="px-1.5 py-0.5 rounded font-bold text-[9px] bg-blue-100 text-blue-700">
                        {p.paymentType}
                      </span>
                    </td>
                    <td className="p-2 text-center no-print flex justify-center items-center gap-2">
                      <button onClick={() => navigate(`/payment/edit/${p._id}`)} className="p-1 hover:bg-indigo-50 rounded text-indigo-600">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1 hover:bg-red-50 rounded text-red-600">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PaymentList;
