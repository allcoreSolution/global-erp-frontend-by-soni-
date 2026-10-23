import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Loader2 } from 'lucide-react';
import api from '../../api';

const RecentOutstandingDetails = () => {
  const [outstandingList, setOutstandingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutstanding = async () => {
      try {
        const [salesRes, purchasesRes] = await Promise.allSettled([
          api.get('/sales'),
          api.get('/purchases')
        ]);

        const items = [];

        if (salesRes.status === 'fulfilled' && salesRes.value.data) {
          const salesData = Array.isArray(salesRes.value.data) ? salesRes.value.data : (salesRes.value.data.data || []);
          salesData.forEach(s => {
            const due = (s.grandTotal || 0) - (s.amountPaid || 0);
            if (due > 0 && (s.paymentStatus || '').toLowerCase() !== 'paid') {
              items.push({
                id: s.invoiceNumber || `INV-${s._id?.slice(-4)}`,
                type: 'Receivable',
                party: s.customerName || 'Customer',
                date: s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-GB') : '-',
                dueDate: s.dueDate ? new Date(s.dueDate).toLocaleDateString('en-GB') : '-',
                amount: due,
                status: s.paymentStatus || 'Pending'
              });
            }
          });
        }

        if (purchasesRes.status === 'fulfilled' && purchasesRes.value.data) {
          const purchaseData = Array.isArray(purchasesRes.value.data) ? purchasesRes.value.data : (purchasesRes.value.data.data || []);
          purchaseData.forEach(p => {
            const due = (p.grandTotal || 0) - (p.amountPaid || 0);
            if (due > 0 && (p.paymentStatus || '').toLowerCase() !== 'paid') {
              items.push({
                id: p.billNumber || p.invoiceNo || `BILL-${p._id?.slice(-4)}`,
                type: 'Payable',
                party: p.supplierName || 'Supplier',
                date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : '-',
                dueDate: p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-GB') : '-',
                amount: due,
                status: p.paymentStatus || 'Pending'
              });
            }
          });
        }

        setOutstandingList(items);
      } catch (err) {
        console.error('Failed to fetch outstanding details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOutstanding();
  }, []);

  const totalReceivables = outstandingList.filter(o => o.type === 'Receivable').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPayables = outstandingList.filter(o => o.type === 'Payable').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-purple-600" size={24} /> Recent Outstanding Details
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Detailed view of recent pending receivables from customers and payables to suppliers.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-slate-50 transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-lg flex justify-between items-center">
          <span className="font-bold text-blue-800 text-sm">Total Receivables (To Receive)</span>
          <span className="text-lg font-extrabold text-blue-700">₹ {totalReceivables.toLocaleString()}</span>
        </div>
        <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-lg flex justify-between items-center">
          <span className="font-bold text-rose-800 text-sm">Total Payables (To Pay)</span>
          <span className="text-lg font-extrabold text-rose-700">₹ {totalPayables.toLocaleString()}</span>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-xs">Loading outstanding records...</span>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 font-semibold text-gray-600">Ref No</th>
                <th className="p-3 font-semibold text-gray-600">Type</th>
                <th className="p-3 font-semibold text-gray-600">Party Name</th>
                <th className="p-3 font-semibold text-gray-600">Bill Date</th>
                <th className="p-3 font-semibold text-gray-600">Due Date</th>
                <th className="p-3 font-semibold text-gray-600 text-center">Status</th>
                <th className="p-3 font-semibold text-gray-600 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outstandingList.length > 0 ? (
                outstandingList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-gray-600">{item.id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'Receivable' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-gray-800">{item.party}</td>
                    <td className="p-3 text-xs text-gray-600">{item.date}</td>
                    <td className="p-3 text-xs text-gray-600">{item.dueDate}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-gray-700">₹ {item.amount.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No outstanding records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentOutstandingDetails;
