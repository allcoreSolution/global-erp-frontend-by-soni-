import React, { useState } from 'react';
import { FileText, CreditCard, History, DollarSign, ChevronRight } from 'lucide-react';

const TransactionHistory = () => {
  const [suppliers] = useState([
    {
      id: 'SUP-001',
      name: 'Rathi Steel Traders',
      openingBalance: 75000,
      balanceType: 'Cr',
      purchaseHistory: [
        { billNo: 'BILL-2024-102', date: '2024-05-01', amount: 80000, status: 'Paid' },
        { billNo: 'BILL-2024-156', date: '2024-05-18', amount: 95000, status: 'Unpaid' },
      ],
      paymentHistory: [
        { paymentNo: 'PAY-2024-099', date: '2024-05-03', amount: 80000, mode: 'RTGS', refNo: 'R112233' }
      ],
      purchaseReturnHistory: [
        { debitNoteNo: 'DBN-2024-011', date: '2024-05-20', amount: 5000, reason: 'Defective pipes' }
      ]
    },
    {
      id: 'SUP-002',
      name: 'Krishna Enterprises',
      openingBalance: 15000,
      balanceType: 'Cr',
      purchaseHistory: [
        { billNo: 'BILL-2024-045', date: '2024-05-10', amount: 15000, status: 'Paid' }
      ],
      paymentHistory: [
        { paymentNo: 'PAY-2024-023', date: '2024-05-12', amount: 15000, mode: 'UPI', refNo: 'U223344' }
      ],
      purchaseReturnHistory: []
    },
    {
      id: 'SUP-003',
      name: 'Vikas Logistics & Co',
      openingBalance: 0,
      balanceType: 'Dr',
      purchaseHistory: [],
      paymentHistory: [],
      purchaseReturnHistory: []
    }
  ]);

  const [selectedId, setSelectedId] = useState('SUP-001');
  const [activeTab, setActiveTab] = useState('bills');

  const activeSupplier = suppliers.find(s => s.id === selectedId) || suppliers[0];

  const calculatePayable = (sup) => {
    if (!sup) return 0;
    const totalPurchases = sup.purchaseHistory?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const totalPaid = sup.paymentHistory?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const totalReturned = sup.purchaseReturnHistory?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const openingBal = sup.balanceType === 'Cr' ? sup.openingBalance : -sup.openingBalance;
    return openingBal + totalPurchases - totalPaid - totalReturned;
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm min-h-screen">
      <div className="border-b pb-4 mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Supplier Transactions & Histories</h1>
        <p className="text-[11px] sm:text-xs text-gray-500">Track purchase statements, payments, ledger posting reports, and outstanding summaries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suppliers selection */}
        <div className="border rounded-lg overflow-hidden h-[180px] lg:h-[450px] flex flex-col">
          <div className="bg-slate-100 p-2.5 border-b font-bold text-[11px] sm:text-xs text-slate-700">Suppliers Logs</div>
          <div className="divide-y overflow-y-auto flex-1 no-scrollbar text-[11px] sm:text-xs">
            {suppliers.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`p-3 cursor-pointer transition-colors ${selectedId === s.id ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold' : 'hover:bg-slate-50'}`}
              >
                <div>{s.name}</div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 font-mono mt-0.5">{s.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Histories dashboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3.5 rounded border border-slate-200 text-[11px] sm:text-xs gap-2">
            <span className="font-semibold text-gray-700">Outstanding Payable balance:</span>
            <span className={`font-bold ${calculatePayable(activeSupplier) >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              ₹ {Math.abs(calculatePayable(activeSupplier)).toLocaleString()} {calculatePayable(activeSupplier) >= 0 ? 'Cr (Payable)' : 'Dr (Advance)'}
            </span>
          </div>

          <div className="flex bg-slate-100 rounded text-[10px] sm:text-xs font-semibold overflow-x-auto no-scrollbar">
            {[
              { id: 'bills', label: 'Purchase History', icon: FileText },
              { id: 'payments', label: 'Payments Log', icon: CreditCard },
              { id: 'returns', label: 'Returns History', icon: History },
              { id: 'ledger', label: 'Accounting Ledger', icon: DollarSign }
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

          <div className="border rounded-lg p-3 sm:p-4 min-h-[250px] overflow-hidden">
            {activeTab === 'bills' && (
              <div className="space-y-3 text-[11px] sm:text-xs">
                <h4 className="font-bold text-slate-800">Purchase Bills Log</h4>
                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b font-bold text-gray-700">
                      <tr>
                        <th className="p-2 whitespace-nowrap">Bill No</th>
                        <th className="p-2 whitespace-nowrap">Date</th>
                        <th className="p-2 text-right whitespace-nowrap">Amount (₹)</th>
                        <th className="p-2 text-center whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeSupplier.purchaseHistory?.length > 0 ? (
                        activeSupplier.purchaseHistory.map((bill, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-semibold text-gray-800 whitespace-nowrap">{bill.billNo}</td>
                            <td className="p-2 text-gray-500 whitespace-nowrap">{bill.date}</td>
                            <td className="p-2 text-right font-medium whitespace-nowrap">₹ {bill.amount.toLocaleString()}</td>
                            <td className="p-2 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${bill.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {bill.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="p-4 text-center text-gray-400">No purchases found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-3 text-[11px] sm:text-xs">
                <h4 className="font-bold text-slate-800">Supplier Payments Log</h4>
                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b font-bold text-gray-700">
                      <tr>
                        <th className="p-2 whitespace-nowrap">Payment No</th>
                        <th className="p-2 whitespace-nowrap">Date</th>
                        <th className="p-2 whitespace-nowrap">Mode</th>
                        <th className="p-2 font-mono whitespace-nowrap">Ref No</th>
                        <th className="p-2 text-right whitespace-nowrap">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeSupplier.paymentHistory?.length > 0 ? (
                        activeSupplier.paymentHistory.map((pay, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-semibold text-gray-800 whitespace-nowrap">{pay.paymentNo}</td>
                            <td className="p-2 text-gray-500 whitespace-nowrap">{pay.date}</td>
                            <td className="p-2 text-gray-600 font-medium whitespace-nowrap">{pay.mode}</td>
                            <td className="p-2 font-mono text-gray-500 whitespace-nowrap">{pay.refNo}</td>
                            <td className="p-2 text-right font-bold text-emerald-600 whitespace-nowrap">₹ {pay.amount.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="5" className="p-4 text-center text-gray-400">No payments found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="space-y-3 text-[11px] sm:text-xs">
                <h4 className="font-bold text-slate-800">Purchase Returns history (Debit Notes)</h4>
                <div className="overflow-x-auto border rounded">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b font-bold text-gray-700">
                      <tr>
                        <th className="p-2 whitespace-nowrap">Debit Note No</th>
                        <th className="p-2 whitespace-nowrap">Date</th>
                        <th className="p-2 whitespace-nowrap">Reason</th>
                        <th className="p-2 text-right whitespace-nowrap">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeSupplier.purchaseReturnHistory?.length > 0 ? (
                        activeSupplier.purchaseReturnHistory.map((ret, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-semibold text-red-600 whitespace-nowrap">{ret.debitNoteNo}</td>
                            <td className="p-2 text-gray-500 whitespace-nowrap">{ret.date}</td>
                            <td className="p-2 text-gray-700 whitespace-nowrap">{ret.reason}</td>
                            <td className="p-2 text-right font-bold text-rose-600 whitespace-nowrap">₹ {ret.amount.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="p-4 text-center text-gray-400">No returns found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'ledger' && (
              <div className="space-y-3 text-[11px] sm:text-xs">
                <h4 className="font-bold text-slate-800">Supplier General Ledger postings</h4>
                <div className="overflow-x-auto border rounded border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 shadow-inner border border-slate-200 text-slate-800 font-bold">
                      <tr>
                        <th className="p-2 whitespace-nowrap">Date</th>
                        <th className="p-2 whitespace-nowrap">Particulars</th>
                        <th className="p-2 text-right whitespace-nowrap">Debit (Dr) (₹)</th>
                        <th className="p-2 text-right whitespace-nowrap">Credit (Cr) (₹)</th>
                        <th className="p-2 text-right whitespace-nowrap">Balance (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="bg-slate-50 font-semibold">
                        <td className="p-2 text-gray-400">-</td>
                        <td className="p-2 whitespace-nowrap">Opening Balance</td>
                        <td className="p-2 text-right whitespace-nowrap">{activeSupplier.balanceType === 'Dr' ? `₹ ${activeSupplier.openingBalance.toLocaleString()}` : '-'}</td>
                        <td className="p-2 text-right whitespace-nowrap">{activeSupplier.balanceType === 'Cr' ? `₹ ${activeSupplier.openingBalance.toLocaleString()}` : '-'}</td>
                        <td className="p-2 text-right font-bold text-gray-900 whitespace-nowrap">
                          ₹ {activeSupplier.openingBalance.toLocaleString()} {activeSupplier.balanceType}
                        </td>
                      </tr>

                      {(() => {
                        const postings = [];
                        activeSupplier.purchaseHistory?.forEach(p => {
                          postings.push({ date: p.date, desc: `Bill Purchases: ${p.billNo}`, dr: 0, cr: p.amount });
                        });
                        activeSupplier.paymentHistory?.forEach(pm => {
                          postings.push({ date: pm.date, desc: `Supplier Payment: ${pm.paymentNo}`, dr: pm.amount, cr: 0 });
                        });
                        activeSupplier.purchaseReturnHistory?.forEach(pr => {
                          postings.push({ date: pr.date, desc: `Return Debit Note: ${pr.debitNoteNo}`, dr: pr.amount, cr: 0 });
                        });

                        postings.sort((a,b) => new Date(a.date) - new Date(b.date));

                        let runBal = activeSupplier.balanceType === 'Cr' ? activeSupplier.openingBalance : -activeSupplier.openingBalance;

                        return postings.map((post, index) => {
                          runBal = runBal + post.cr - post.dr;
                          const bType = runBal >= 0 ? 'Cr' : 'Dr';
                          return (
                            <tr key={index} className="hover:bg-slate-50">
                              <td className="p-2 text-gray-500 whitespace-nowrap">{post.date}</td>
                              <td className="p-2 text-gray-850 whitespace-nowrap">{post.desc}</td>
                              <td className="p-2 text-right text-emerald-600 font-medium whitespace-nowrap">{post.dr > 0 ? `₹ ${post.dr.toLocaleString()}` : '-'}</td>
                              <td className="p-2 text-right text-amber-600 font-medium whitespace-nowrap">{post.cr > 0 ? `₹ ${post.cr.toLocaleString()}` : '-'}</td>
                              <td className="p-2 text-right font-bold text-gray-900 whitespace-nowrap">
                                ₹ {Math.abs(runBal).toLocaleString()} {bType}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
