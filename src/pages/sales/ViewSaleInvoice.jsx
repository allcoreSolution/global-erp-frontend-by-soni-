import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FileText, Download, ArrowLeft } from 'lucide-react';

const ViewSaleInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // If we decide to use ID later
  
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    // Read sale from location state passed from SaleList
    if (location.state && location.state.sale) {
      setSelectedSale(location.state.sale);
    } else {
      // If no state, go back
      navigate('/sales/sale-list');
    }
  }, [location.state, navigate]);

  if (!selectedSale) return null;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto text-black print:p-0 print:max-w-none">
      {/* Top action bar - Hidden during print */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Sales
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileText size={14} /> Print
          </button>
          <button
            onClick={() => alert("PDF Download functionality will be implemented soon.")}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      {/* Invoice Document Paper */}
      <div className="bg-white border border-gray-200 shadow-sm p-8 print:p-0 print:border-none print:shadow-none text-sm">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">INVOICE</h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">#{selectedSale.reference}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-gray-800">Your Company Name</h2>
            <p className="text-xs text-gray-600 mt-1">123 Business Road, Tech City</p>
            <p className="text-xs text-gray-600">contact@yourcompany.com</p>
            <p className="text-xs text-gray-600">+91 9876543210</p>
          </div>
        </div>

        {/* Bill To & Details */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Billed To</p>
            <h3 className="text-base font-bold text-gray-800">{selectedSale.customer}</h3>
            <p className="text-xs text-gray-600 mt-0.5">Customer ID / GSTIN (if any)</p>
            <p className="text-xs text-gray-600">{selectedSale.warehouse} (Warehouse)</p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex justify-end gap-3">
              <span className="text-xs font-bold text-gray-500">Date:</span>
              <span className="text-xs font-semibold text-gray-900 w-20">{selectedSale.date}</span>
            </div>
            <div className="flex justify-end gap-3">
              <span className="text-xs font-bold text-gray-500">Status:</span>
              <span className="text-xs font-semibold text-blue-600 w-20">{selectedSale.status}</span>
            </div>
            <div className="flex justify-end gap-3">
              <span className="text-xs font-bold text-gray-500">Payment:</span>
              <span className={`text-xs font-semibold w-20 ${selectedSale.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-red-600'}`}>
                {selectedSale.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 overflow-hidden rounded border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b">Item Details</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b text-center w-16">Qty</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b text-right w-24">Rate</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedSale.items && selectedSale.items.length > 0 ? (
                selectedSale.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-xs text-gray-800 font-medium">
                      {item.productName || item.name || 'Product Item'}
                      {item.taxAmount > 0 && <span className="block text-[10px] text-gray-400 mt-0.5">+ Tax: {item.taxAmount}</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600 text-center">{item.quantity}</td>
                    <td className="px-3 py-2 text-xs text-gray-600 text-right">{item.price?.toFixed(2) || '0.00'}</td>
                    <td className="px-3 py-2 text-xs text-gray-800 font-bold text-right">
                      {item.total?.toFixed(2) || (item.price * item.quantity).toFixed(2) || '0.00'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-3 py-4 text-xs text-center text-gray-400 italic">No items found for this invoice.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">INR {selectedSale.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Discount</span>
              <span className="font-semibold text-red-500">- INR 0.00</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 border-b pb-2">
              <span>Tax</span>
              <span className="font-semibold">+ INR 0.00</span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
              <span>Grand Total</span>
              <span>INR {selectedSale.grandTotal.toFixed(2)}</span>
            </div>
            
            <div className="pt-3 border-t mt-3 border-dashed">
              <div className="flex justify-between text-xs text-emerald-700 font-bold">
                <span>Amount Paid</span>
                <span>INR {selectedSale.paid.toFixed(2)}</span>
              </div>
              {selectedSale.due > 0 && (
                <div className="flex justify-between text-xs text-red-600 font-bold mt-1">
                  <span>Balance Due</span>
                  <span>INR {selectedSale.due.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-100 text-[10px] text-gray-400 mt-6">
          <p className="font-semibold text-gray-500 text-xs">Thank you for your business!</p>
          <p className="mt-1">Terms & Conditions apply. This is a computer generated invoice.</p>
        </div>

      </div>
    </div>
  );
};

export default ViewSaleInvoice;
