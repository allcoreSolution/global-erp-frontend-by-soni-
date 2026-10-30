import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FileText, Download, ArrowLeft, MessageSquare, QrCode, Building, CheckCircle } from 'lucide-react';
import api from '../../api';

const ViewSaleInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [selectedSale, setSelectedSale] = useState(null);
  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  useEffect(() => {
    // Read sale from location state passed from SaleList
    if (location.state && location.state.sale) {
      setSelectedSale(location.state.sale);
    } else {
      navigate('/sales/sale-list');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const fetchActiveCompany = async () => {
      try {
        setLoadingCompany(true);
        const res = await api.get('/companies/profile');
        if (res.data) {
          setCompany(res.data);
        }
      } catch (err) {
        console.error('Failed to load active company for invoice:', err);
      } finally {
        setLoadingCompany(false);
      }
    };
    fetchActiveCompany();
  }, []);

  if (!selectedSale) return null;

  const grandTotal = Number(selectedSale.grandTotal || 0);
  const upiId = company?.upiId || '';
  const companyName = company?.name || localStorage.getItem('companyName') || 'Apex Pharma Distributors';

  // Standard NPCI UPI URI string
  const upiPayUri = upiId 
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(companyName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Bill ' + (selectedSale.invoiceNo || selectedSale.reference || ''))}`
    : '';

  const qrCodeUrl = upiPayUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&data=${encodeURIComponent(upiPayUri)}`
    : '';

  const handleWhatsAppShare = () => {
    const customerPhone = selectedSale.customerPhone || selectedSale.phone || selectedSale.customerMobile || '';
    const invoiceNo = selectedSale.invoiceNo || selectedSale.reference || 'INV';
    const total = grandTotal.toFixed(2);
    const balanceDue = Number(selectedSale.due || 0).toFixed(2);
    
    let text = `*TAX INVOICE - ${companyName}*%0A%0A`;
    text += `Dear Customer, Greetings!%0AYour Invoice *#${invoiceNo}* for *Rs. ${total}* has been issued.%0A`;
    text += `Payment Status: *${selectedSale.paymentStatus}*%0A`;
    if (Number(selectedSale.due) > 0) {
      text += `Balance Due: *Rs. ${balanceDue}*%0A`;
    }
    if (upiId) {
      text += `%0AYou can scan & pay directly via UPI: *${upiId}*%0A`;
    }
    text += `%0AThank you for your business!`;

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone.length >= 10
      ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto text-black print:p-0 print:max-w-none">
      {/* Top action bar - Hidden during print */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} /> Back to Sales
        </button>

        <div className="flex items-center gap-2">
          {/* 1-Click WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Share bill details to Customer WhatsApp"
          >
            <MessageSquare size={14} />
            <span>WhatsApp Bill</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileText size={14} /> Print Invoice
          </button>
        </div>
      </div>

      {/* Invoice Document Paper */}
      <div className="bg-white border border-gray-300 shadow-sm p-8 print:p-0 print:border-none print:shadow-none text-sm font-sans">
        
        {/* Dynamic Company Header (From Company Master) */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-5 mb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-black tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded uppercase">
              TAX INVOICE
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight uppercase mt-1">
              {company?.name || companyName}
            </h1>
            <p className="text-xs text-gray-600 font-medium max-w-sm leading-snug">
              {company?.address || 'Main Road Market'}, {company?.city || 'Lucknow'}, {company?.state || 'Uttar Pradesh'} {company?.pincode ? `- ${company.pincode}` : ''}
            </p>
            <div className="text-[11px] text-gray-600 flex flex-wrap gap-x-3 gap-y-0.5 pt-1">
              {company?.phone && <span>Ph: <strong>{company.phone}</strong></span>}
              {company?.email && <span>Email: <strong>{company.email}</strong></span>}
            </div>
            
            {/* Licences & GST Line */}
            <div className="text-[10px] text-gray-800 font-mono font-bold flex flex-wrap gap-x-3 gap-y-0.5 pt-1 bg-gray-50 p-1.5 rounded border border-gray-200">
              {company?.gstin && <span>GSTIN: <strong className="text-indigo-800">{company.gstin}</strong></span>}
              {company?.dl20b && <span>DL 20B: <strong className="text-gray-900">{company.dl20b}</strong></span>}
              {company?.dl21b && <span>DL 21B: <strong className="text-gray-900">{company.dl21b}</strong></span>}
              {company?.fssaiNo && <span>FSSAI: <strong className="text-gray-900">{company.fssaiNo}</strong></span>}
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            {company?.logoUrl ? (
              <img 
                src={company.logoUrl} 
                alt="Logo" 
                className="h-14 w-auto max-w-[140px] object-contain mb-2"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-12 h-12 bg-indigo-600 text-white font-black text-sm rounded-lg flex items-center justify-center mb-2 shadow-xs">
                {company?.code || 'FIRM'}
              </div>
            )}
            
            <div className="bg-gray-100 px-3 py-1.5 rounded border border-gray-200 text-right mt-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Invoice Number</span>
              <span className="text-sm font-black text-indigo-700 font-mono">
                #{selectedSale.invoiceNo || selectedSale.reference || 'INV-001'}
              </span>
            </div>
          </div>
        </div>

        {/* Bill To & Invoice Meta Details */}
        <div className="grid grid-cols-2 gap-8 mb-6 pb-4 border-b border-gray-200">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Billed To (Customer / Chemist)</p>
            <h3 className="text-base font-bold text-gray-900">{selectedSale.customer}</h3>
            {selectedSale.customerAddress && (
              <p className="text-xs text-gray-600 mt-0.5 leading-tight">{selectedSale.customerAddress}</p>
            )}
            {selectedSale.customerGst && (
              <p className="text-xs font-mono text-gray-700 font-bold mt-0.5">GSTIN: {selectedSale.customerGst}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Dispatched from: <strong>{selectedSale.warehouse || 'Main Godown'}</strong></p>
          </div>

          <div className="text-right space-y-1">
            <div className="flex justify-end gap-3 text-xs">
              <span className="font-bold text-gray-500">Invoice Date:</span>
              <span className="font-semibold text-gray-900 w-28">{selectedSale.date}</span>
            </div>
            <div className="flex justify-end gap-3 text-xs">
              <span className="font-bold text-gray-500">Payment Terms:</span>
              <span className="font-semibold text-gray-900 w-28">{selectedSale.paymentTerm || 'Credit / 30 Days'}</span>
            </div>
            <div className="flex justify-end gap-3 text-xs">
              <span className="font-bold text-gray-500">Payment Status:</span>
              <span className={`font-bold w-28 ${selectedSale.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {selectedSale.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 overflow-hidden rounded border border-gray-300">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-700">Item Description</th>
                <th className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-700 text-center w-16">Qty</th>
                <th className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-700 text-right w-24">Unit Rate</th>
                <th className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-700 text-right w-20">GST %</th>
                <th className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-700 text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {selectedSale.items && selectedSale.items.length > 0 ? (
                selectedSale.items.map((item, idx) => {
                  const unitRate = Number(item.netUnitPrice || item.price || item.unitPrice || (item.quantity ? (item.total / item.quantity) : 0)) || 0;
                  const itemBatch = item.batchNo || item.batch || '';
                  const itemTax = item.taxPercent !== undefined ? item.taxPercent : (item.taxRate !== undefined ? item.taxRate : 0);

                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-xs text-gray-800">
                        <div className="font-bold text-gray-950">{item.name || item.productName || 'Product Item'}</div>
                        <div className="text-[10px] text-gray-500 flex flex-wrap items-center gap-2 mt-0.5 font-mono">
                          {itemBatch && <span>Batch: <strong className="text-gray-800">{itemBatch}</strong></span>}
                          {item.expDate && <span>| Exp: <strong className="text-gray-800">{item.expDate}</strong></span>}
                          {Number(item.mrp) > 0 && <span>| MRP: ₹{Number(item.mrp).toFixed(2)}</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-800 text-center font-bold">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-700 text-right font-mono">₹{unitRate.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-700 text-right font-mono">
                        {itemTax}%
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-950 font-bold text-right font-mono">
                        ₹{Number(item.total || (unitRate * item.quantity)).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-xs text-center text-gray-400 italic">No items listed.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Banking Details + Dynamic UPI QR Code + Invoice Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 mb-8 items-start">
          
          {/* Left: Dynamic UPI QR Code & Bank Information (Feature #3) */}
          <div className="border border-gray-300 rounded-xl p-4 bg-gray-50/70 space-y-3">
            <div className="flex items-center gap-3">
              {/* Dynamic QR Code */}
              {qrCodeUrl ? (
                <div className="bg-white p-1.5 rounded-lg border border-gray-300 shadow-2xs shrink-0 text-center">
                  <img src={qrCodeUrl} alt="UPI QR Code" className="w-24 h-24 object-contain" />
                  <span className="text-[8px] font-black uppercase text-indigo-700 tracking-wider block mt-1">SCAN & PAY</span>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-200 border border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-400 text-center p-1 shrink-0">
                  <QrCode size={24} />
                  <span className="text-[8px] mt-1">UPI Not Set</span>
                </div>
              )}

              {/* Bank Details */}
              <div className="text-xs space-y-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-700 block">
                  Bank Payment Details
                </span>
                <p className="text-gray-900 font-bold text-xs truncate">
                  {company?.bankName || 'Bank Name: Config in Company Master'}
                </p>
                <p className="text-gray-700 font-mono text-[11px]">
                  A/C: <strong>{company?.accountNumber || 'XXXXXXXXXXXX'}</strong>
                </p>
                <p className="text-gray-700 font-mono text-[11px]">
                  IFSC: <strong>{company?.ifscCode || 'XXXX0000000'}</strong>
                </p>
                {company?.branchName && (
                  <p className="text-gray-500 text-[10px]">Branch: {company.branchName}</p>
                )}
                {upiId && (
                  <p className="text-emerald-700 font-mono font-bold text-[10px]">
                    UPI ID: {upiId}
                  </p>
                )}
              </div>
            </div>

            <p className="text-[9px] text-gray-500 border-t border-gray-200 pt-2 leading-tight">
              Payable to <strong>{company?.name || companyName}</strong> via PhonePe, Google Pay, or Net Banking.
            </p>
          </div>

          {/* Right: Calculations Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Taxable Subtotal:</span>
              <span className="font-mono font-semibold">₹{(Number(selectedSale.subTotal) || Number(selectedSale.grandTotal) || 0).toFixed(2)}</span>
            </div>
            {Number(selectedSale.discountTotal) > 0 && (
              <div className="flex justify-between text-xs text-rose-600">
                <span>Total Discount:</span>
                <span className="font-mono font-semibold">- ₹{Number(selectedSale.discountTotal).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-600 border-b border-gray-200 pb-2">
              <span>Total Tax (GST):</span>
              <span className="font-mono font-semibold">+ ₹{(Number(selectedSale.taxTotal) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-950 pt-1">
              <span>Grand Total:</span>
              <span className="font-mono text-indigo-700">₹{grandTotal.toFixed(2)}</span>
            </div>
            
            <div className="pt-2 border-t border-gray-200 border-dashed space-y-1">
              <div className="flex justify-between text-xs text-emerald-700 font-bold">
                <span>Amount Paid:</span>
                <span className="font-mono">₹{(Number(selectedSale.paid) || 0).toFixed(2)}</span>
              </div>
              {Number(selectedSale.due) > 0 && (
                <div className="flex justify-between text-xs text-rose-600 font-bold">
                  <span>Balance Due:</span>
                  <span className="font-mono">₹{Number(selectedSale.due).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Authorized Signatory Stamp Box */}
            <div className="pt-8 text-right">
              <div className="text-[11px] font-bold text-gray-900 border-t border-gray-400 inline-block pt-1 min-w-[200px]">
                {company?.signature || `For ${companyName} - Authorized Signatory`}
              </div>
            </div>
          </div>

        </div>

        {/* Invoice Terms Footer */}
        <div className="text-center pt-4 border-t border-gray-200 text-[10px] text-gray-500 mt-4 leading-relaxed">
          <p className="font-semibold text-gray-700 text-xs">Thank you for your business!</p>
          <p className="mt-0.5">{company?.terms || 'Payment is due within credit period. Goods once sold will not be taken back.'}</p>
          <p className="text-[9px] text-gray-400 mt-1">This is a system authenticated computer generated invoice.</p>
        </div>

      </div>
    </div>
  );
};

export default ViewSaleInvoice;
