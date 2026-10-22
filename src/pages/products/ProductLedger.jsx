import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Plus, Search, Eye, Filter, RefreshCw, FileText, Download,
  Printer, X, CheckCircle, Clock, AlertTriangle, Building, Phone, Mail,
  MapPin, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Tag,
  ShieldCheck, ChevronRight, User, ExternalLink, Calendar, Receipt, Landmark,
  Boxes, FileSpreadsheet, AlertCircle, ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api';

// WhatsApp Brand SVG Icon
const WhatsAppIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.886-9.885 9.886m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// Dedicated Full Page Component for Supplier Ledger & Profile
const SupplierLedgerDetailPage = ({
  supplierDetails,
  detailsLoading,
  activeTab,
  setActiveTab,
  invoiceStatusFilter,
  setInvoiceStatusFilter,
  filteredInvoices,
  handleBackToLedger,
  fetchSupplierDetails,
  activeSupplierId,
  handleSendInvoiceWhatsApp,
  handleSendSupplierStatementWhatsApp,
  handleViewInvoice,
  navigate,
  showInvoiceModal,
  setShowInvoiceModal,
  selectedInvoice
}) => {
  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* 1. TOP BREADCRUMB & BACK ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToLedger}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-sm transition-all active:scale-95 group"
          >
            <ArrowLeft size={16} className="text-slate-500 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Supplier Ledger</span>
          </button>
          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2 font-medium">
            <span>Item / Product Master</span>
            <ChevronRight size={13} />
            <span className="hover:text-indigo-600 cursor-pointer" onClick={handleBackToLedger}>Supplier Ledger</span>
            <ChevronRight size={13} />
            <span className="text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
              {supplierDetails?.supplier?.companyName || 'Supplier Profile'}
            </span>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => fetchSupplierDetails(activeSupplierId)}
            disabled={detailsLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={detailsLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleSendSupplierStatementWhatsApp()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all active:scale-95"
            title="Send Statement Slip on WhatsApp"
          >
            <WhatsAppIcon size={16} />
            <span>
              {(supplierDetails?.summary?.netBalance || 0) > 0
                ? `WhatsApp Due Slip (₹${(supplierDetails.summary.netBalance || 0).toLocaleString('en-IN')})`
                : 'WhatsApp Statement'}
            </span>
          </button>

          <button
            onClick={() => navigate(`/purchases/add-purchase?supplierId=${supplierDetails?.supplier?._id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Add Purchase Invoice</span>
          </button>
        </div>
      </div>

      {detailsLoading && !supplierDetails ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center text-slate-400">
          <RefreshCw size={32} className="animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">Loading Supplier Ledger Page...</p>
          <p className="text-xs text-slate-400 mt-1">Fetching complete bills, payments, and account statement.</p>
        </div>
      ) : (
        <>
          {/* 2. Hero Supplier Profile Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-xl border border-slate-800 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 border border-white/20">
                  {supplierDetails?.supplier?.companyName?.slice(0, 2).toUpperCase() || 'SP'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {supplierDetails?.supplier?.companyName || 'Supplier Name'}
                    </h1>
                    <span className="font-mono text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-bold">
                      {supplierDetails?.supplier?.supplierCode || 'SUP-CODE'}
                    </span>
                    {supplierDetails?.supplier?.type && (
                      <span className="text-xs bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
                        {supplierDetails.supplier.type}
                      </span>
                    )}
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {supplierDetails?.supplier?.status !== false ? '● Active Supplier' : 'Inactive'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-5">
                    {supplierDetails?.supplier?.contactPerson && (
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-indigo-400" />
                        <span className="text-slate-400">Contact:</span>
                        <strong className="text-white">{supplierDetails.supplier.contactPerson}</strong>
                      </span>
                    )}
                    {supplierDetails?.supplier?.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} className="text-indigo-400" />
                        <span className="text-slate-400">Phone:</span>
                        <strong className="text-white">{supplierDetails.supplier.phone}</strong>
                      </span>
                    )}
                    {supplierDetails?.supplier?.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} className="text-indigo-400" />
                        <span className="text-slate-400">Email:</span>
                        <strong className="text-white">{supplierDetails.supplier.email}</strong>
                      </span>
                    )}
                    {supplierDetails?.supplier?.gstin && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span className="text-slate-400">GSTIN:</span>
                        <strong className="text-emerald-300">{supplierDetails.supplier.gstin}</strong>
                      </span>
                    )}
                    {supplierDetails?.supplier?.pan && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-400">PAN:</span>
                        <strong className="text-white">{supplierDetails.supplier.pan}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Top KPI Metric Cards for Supplier */}
          {supplierDetails?.summary && (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${(supplierDetails.summary.totalReturns || 0) > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 mb-6`}>
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Purchase Bills</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Receipt size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-800">{supplierDetails.summary.totalInvoices || 0} Bills</div>
                  <div className="text-[11px] text-slate-400 mt-1">All recorded purchase invoices</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Purchased</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Boxes size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-purple-700">₹{(supplierDetails.summary.totalPurchased || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div className="text-[11px] text-purple-600 mt-1">Gross purchase volume</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Paid Out</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-emerald-700">₹{(supplierDetails.summary.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div className="text-[11px] text-emerald-600 mt-1">Cleared disbursements</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
              </div>

              {(supplierDetails.summary.totalReturns || 0) > 0 && (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Returns / Debit Notes</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ArrowDownRight size={20} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-amber-600">-₹{(supplierDetails.summary.totalReturns || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className="text-[11px] text-amber-600 mt-1">{supplierDetails?.returns?.length || 1} debit note(s) credit</div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                </div>
              )}

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-sm relative overflow-hidden group bg-gradient-to-br from-white via-amber-50/20 to-amber-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Current Balance Due</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className={`text-2xl font-black ${supplierDetails.summary.netBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    ₹{(supplierDetails.summary.netBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                    {supplierDetails.summary.netBalance > 0 ? <><AlertTriangle size={13} /> Net Due (Purchased − Paid − Returns)</> : 'Fully Settled (₹0 Due)'}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-red-500" />
              </div>
            </div>
          )}

          {/* 4. Tab Navigation Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
            <div className="px-6 pt-4 bg-white border-b border-slate-200 flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-8 text-sm font-semibold whitespace-nowrap">
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'invoices'
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Receipt size={17} />
                  <span>All Purchase Invoices ({supplierDetails?.purchases?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'profile'
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Building size={17} />
                  <span>Supplier Profile & Legal Details</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'history'
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Clock size={17} />
                  <span>Payments & Returns History</span>
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-5 sm:p-6 bg-slate-50/40">
              {/* TAB 1: ALL INVOICES */}
              {activeTab === 'invoices' && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {['All', 'Received', 'Due', 'Cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setInvoiceStatusFilter(st)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            invoiceStatusFilter === st
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st === 'All' ? `All Bills (${supplierDetails?.purchases?.length || 0})` : st}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSendSupplierStatementWhatsApp(supplierDetails?.supplier, supplierDetails?.summary, supplierDetails?.purchases, false)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                        title="Send All Invoices / Due Summary together on WhatsApp"
                      >
                        <WhatsAppIcon size={14} />
                        <span>Send All Invoices Slip (सारा एक साथ)</span>
                      </button>

                      <span className="text-xs text-slate-400 font-medium">
                        Showing {filteredInvoices.length} bill(s)
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="py-3 px-4">Invoice / Ref No</th>
                          <th className="py-3 px-4">Bill Date</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4">Warehouse</th>
                          <th className="py-3 px-4 text-center">Items</th>
                          <th className="py-3 px-4 text-right">Grand Total</th>
                          <th className="py-3 px-4 text-right">Paid Amount</th>
                          <th className="py-3 px-4 text-right">Return / Debit Note</th>
                          <th className="py-3 px-4 text-right">Balance Due</th>
                          <th className="py-3 px-4 text-center">Purchase Status</th>
                          <th className="py-3 px-4 text-center">Payment Status</th>
                          <th className="py-3 px-4 text-center">Action / Slip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {filteredInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="py-12 text-center text-slate-400">
                              <Receipt size={36} className="mx-auto mb-2 text-slate-300" />
                              <p className="font-semibold text-sm text-slate-600">No invoices match this filter</p>
                              <p className="text-xs text-slate-400 mt-0.5">Click '+ Add Purchase Invoice' to record a new invoice for this supplier.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredInvoices.map((inv) => {
                            const grandTotal = Number(inv.grandTotal) || 0;
                            const amountPaid = Number(inv.amountPaid) || 0;
                            const returnedAmount = Number(inv.returnedAmount) || 0;
                            const balanceDue = inv.balanceDue !== undefined
                              ? Number(inv.balanceDue)
                              : Math.max(0, grandTotal - amountPaid - returnedAmount);

                            return (
                              <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="font-bold text-slate-800 font-mono text-xs">
                                    {inv.referenceNo || inv.purchaseNo || 'PUR-BILL'}
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-medium text-slate-600">
                                  {inv.purchaseDate || '—'}
                                </td>
                                <td className="py-3 px-4 font-medium text-slate-600">
                                  {inv.dueDate || '—'}
                                </td>
                                <td className="py-3 px-4 font-medium text-slate-600">
                                  {inv.warehouse?.name || (typeof inv.warehouse === 'string' ? inv.warehouse : 'General')}
                                </td>
                                <td className="py-3 px-4 text-center font-bold text-slate-700">
                                  {inv.orderItems?.length || 1}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-slate-800">
                                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                                  ₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold">
                                  {returnedAmount > 0 ? (
                                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block text-xs">
                                      -₹{returnedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right font-bold">
                                  {balanceDue > 0 ? (
                                    <div>
                                      <span className="text-rose-600">
                                        ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </span>
                                      {returnedAmount > 0 && (
                                        <div className="text-[10px] text-slate-400 font-normal">
                                          (₹{(grandTotal - amountPaid).toLocaleString('en-IN')} − ₹{returnedAmount.toLocaleString('en-IN')})
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-emerald-600">₹0.00</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    inv.purchaseStatus === 'Received'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : inv.purchaseStatus === 'Pending'
                                      ? 'bg-amber-100 text-amber-800'
                                      : inv.purchaseStatus === 'Cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {inv.purchaseStatus || 'Received'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    balanceDue === 0 || inv.paymentStatus === 'Paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : inv.paymentStatus === 'Partial'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {balanceDue === 0 || inv.paymentStatus === 'Paid' ? 'Paid' : 'Due'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleViewInvoice(inv)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors"
                                      title="View Full Invoice Breakdown"
                                    >
                                      <Eye size={12} />
                                      <span>View</span>
                                    </button>

                                    <button
                                      onClick={() => handleSendInvoiceWhatsApp(inv)}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-sm ${
                                        balanceDue > 0
                                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      }`}
                                      title={balanceDue > 0 ? `Send Unpaid Invoice Slip on WhatsApp (Due: ₹${balanceDue.toLocaleString('en-IN')})` : "Share Invoice Slip on WhatsApp"}
                                    >
                                      <WhatsAppIcon size={13} />
                                      <span>{balanceDue > 0 ? 'Send Slip' : 'WhatsApp'}</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>

                      {filteredInvoices.length > 0 && (
                        <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold">
                          <tr>
                            <td colSpan={5} className="py-3.5 px-4 text-slate-700">
                              Total Summary ({filteredInvoices.length} Bills)
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-900 font-black">
                              ₹{filteredInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 text-right text-emerald-600 font-black">
                              ₹{filteredInvoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 text-right text-amber-600 font-black">
                              {filteredInvoices.reduce((sum, inv) => sum + (Number(inv.returnedAmount) || 0), 0) > 0
                                ? `-₹${filteredInvoices.reduce((sum, inv) => sum + (Number(inv.returnedAmount) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right text-rose-600 font-black text-sm">
                              ₹{filteredInvoices.reduce((sum, inv) => {
                                const gTot = Number(inv.grandTotal) || 0;
                                const pd = Number(inv.amountPaid) || 0;
                                const ret = Number(inv.returnedAmount) || 0;
                                return sum + (inv.balanceDue !== undefined ? Number(inv.balanceDue) : Math.max(0, gTot - pd - ret));
                              }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td colSpan={3} className="py-3.5 px-4 text-center text-[11px] text-slate-500 font-medium">
                              Net Outstanding
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: SUPPLIER FULL PROFILE */}
              {activeTab === 'profile' && supplierDetails?.supplier && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                      <Building size={16} className="text-indigo-600" /> Basic Company & Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Company / Trade Name</span>
                        <span className="font-bold text-slate-800 text-sm">{supplierDetails.supplier.companyName}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Supplier Code</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">{supplierDetails.supplier.supplierCode}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Contact Person</span>
                        <span className="font-bold text-slate-800">{supplierDetails.supplier.contactPerson || 'Not Provided'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Phone Number</span>
                        <span className="font-bold text-slate-800">{supplierDetails.supplier.phone || 'Not Provided'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Email Address</span>
                        <span className="font-bold text-slate-800">{supplierDetails.supplier.email || 'Not Provided'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Supplier Type</span>
                        <span className="font-bold text-slate-800">{supplierDetails.supplier.type || 'Manufacturer'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Category</span>
                        <span className="font-bold text-slate-800">{supplierDetails.supplier.category || 'Raw Materials'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Account Status</span>
                        <span className="font-bold text-emerald-600">
                          {supplierDetails.supplier.status !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-600" /> GST, Tax & Statutory Compliance
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">GSTIN</span>
                        <span className="font-mono font-bold text-slate-800 text-sm">{supplierDetails.supplier.gstin || 'Unregistered'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">GST Status</span>
                        <span className="font-bold text-slate-800">{supplierDetails.supplier.gstStatus || 'Registered'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">PAN Number</span>
                        <span className="font-mono font-bold text-slate-800">{supplierDetails.supplier.pan || 'N/A'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Tax Preference</span>
                        <span className="font-bold text-slate-800">{supplierDetails.supplier.taxPreference || 'Taxable'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">TDS Applicable</span>
                        <span className="font-bold text-slate-800">{supplierDetails.supplier.tdsApplicable ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Currency</span>
                        <span className="font-bold text-slate-800">{supplierDetails.supplier.currency || 'INR'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Payment Terms</span>
                        <span className="font-bold text-slate-800">{supplierDetails.supplier.paymentTerms || 'Net 30'}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 block text-[11px] font-medium">Credit Limit</span>
                        <span className="font-bold text-slate-800">₹{(supplierDetails.supplier.creditLimit || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                        <MapPin size={15} className="text-red-500" /> Billing Address
                      </h4>
                      <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-4 rounded-xl leading-relaxed">
                        <p className="font-bold text-slate-800">{supplierDetails.supplier.billingAddress?.street1 || 'No street address'}</p>
                        {supplierDetails.supplier.billingAddress?.street2 && <p>{supplierDetails.supplier.billingAddress.street2}</p>}
                        <p>
                          {supplierDetails.supplier.billingAddress?.city || '—'}, {supplierDetails.supplier.billingAddress?.state || '—'} {supplierDetails.supplier.billingAddress?.zip || ''}
                        </p>
                        <p className="text-slate-500">{supplierDetails.supplier.billingAddress?.country || 'India'}</p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                        <MapPin size={15} className="text-blue-500" /> Shipping / Dispatch Address
                      </h4>
                      <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-4 rounded-xl leading-relaxed">
                        <p className="font-bold text-slate-800">{supplierDetails.supplier.shippingAddress?.street1 || 'Same as billing address'}</p>
                        {supplierDetails.supplier.shippingAddress?.street2 && <p>{supplierDetails.supplier.shippingAddress.street2}</p>}
                        <p>
                          {supplierDetails.supplier.shippingAddress?.city || '—'}, {supplierDetails.supplier.shippingAddress?.state || '—'} {supplierDetails.supplier.shippingAddress?.zip || ''}
                        </p>
                        <p className="text-slate-500">{supplierDetails.supplier.shippingAddress?.country || 'India'}</p>
                      </div>
                    </div>
                  </div>

                  {supplierDetails.supplier.banks && supplierDetails.supplier.banks.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                        <Landmark size={16} className="text-indigo-600" /> Bank Account Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {supplierDetails.supplier.banks.map((b, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                            <div className="font-bold text-slate-800 text-sm mb-1">{b.bankName || 'Bank'}</div>
                            <div className="text-slate-600">A/C No: <span className="font-mono font-bold text-slate-800">{b.accountNumber || b.accountNo || '—'}</span></div>
                            <div className="text-slate-600">IFSC: <span className="font-mono font-bold text-slate-800">{b.ifscCode || b.ifsc || '—'}</span></div>
                            {b.branch && <div className="text-slate-500 mt-1">Branch: {b.branch}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PAYMENTS & RETURNS HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                      <CreditCard size={16} className="text-emerald-600" /> Payments Disbursed to Supplier
                    </h3>
                    {supplierDetails?.payments?.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No standalone payment records found for this party. Payments recorded during purchase bills appear directly in bills.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500 text-[10px]">
                              <th className="py-2.5 px-3">Payment No</th>
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Mode</th>
                              <th className="py-2.5 px-3">Ref / Cheque</th>
                              <th className="py-2.5 px-3 text-right">Amount</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {supplierDetails?.payments?.map((pay) => (
                              <tr key={pay._id}>
                                <td className="py-2.5 px-3 font-mono font-bold">{pay.paymentNo || 'PAY-N/A'}</td>
                                <td className="py-2.5 px-3">{pay.paymentDate}</td>
                                <td className="py-2.5 px-3">{pay.paymentMethod || 'Bank'}</td>
                                <td className="py-2.5 px-3 font-mono">{pay.transactionRef || pay.chequeNo || '—'}</td>
                                <td className="py-2.5 px-3 text-right font-bold text-emerald-700">₹{(pay.paymentAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    {pay.status || 'Success'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                      <ArrowDownRight size={16} className="text-red-500" /> Purchase Returns & Debit Notes
                    </h3>
                    {supplierDetails?.returns?.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No goods have been returned to this supplier.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500 text-[10px]">
                              <th className="py-2.5 px-3">Return No</th>
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3 font-mono">Debit Note No</th>
                              <th className="py-2.5 px-3">Reason</th>
                              <th className="py-2.5 px-3 text-right">Goods Value</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {supplierDetails?.returns?.map((ret) => (
                              <tr key={ret._id}>
                                <td className="py-2.5 px-3 font-mono font-bold">{ret.returnNo || ret.returnNumber}</td>
                                <td className="py-2.5 px-3">{ret.returnDate || ret.date}</td>
                                <td className="py-2.5 px-3 font-mono">{ret.debitNoteNo || ret.referenceNo || '—'}</td>
                                <td className="py-2.5 px-3">{ret.reason || ret.returnReason || 'Purchase return'}</td>
                                <td className="py-2.5 px-3 text-right font-bold text-red-600">₹{(ret.totalRefundAmount || ret.grandTotal || ret.totals?.goodsValue || ret.totals?.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                    {ret.status || 'Approved'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Invoice breakdown modal if viewing invoice */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative text-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 p-2 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            <div className="border-b border-slate-200 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Purchase Tax Invoice</span>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                  {selectedInvoice.referenceNo || selectedInvoice.purchaseNo || 'PUR-BILL'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendInvoiceWhatsApp(selectedInvoice)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                  title="Send this Invoice Slip on WhatsApp"
                >
                  <WhatsAppIcon size={14} />
                  <span>WhatsApp Slip</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
                >
                  <Printer size={14} /> Print Bill
                </button>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedInvoice.purchaseStatus === 'Received'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedInvoice.purchaseStatus || 'Received'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block font-medium">Invoice Date</span>
                <span className="font-bold text-slate-800 text-sm">{selectedInvoice.purchaseDate || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Due Date</span>
                <span className="font-bold text-slate-800 text-sm">{selectedInvoice.dueDate || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Warehouse / Branch</span>
                <span className="font-bold text-slate-800">{selectedInvoice.warehouse?.name || (typeof selectedInvoice.warehouse === 'string' ? selectedInvoice.warehouse : 'General Warehouse')}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Payment Status</span>
                <span className={`font-bold ${selectedInvoice.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedInvoice.paymentStatus || 'Due'}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Itemized Purchase Products</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Item Details</th>
                      <th className="py-2.5 px-3 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Unit Cost</th>
                      <th className="py-2.5 px-3 text-center">Tax %</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.orderItems && selectedInvoice.orderItems.length > 0 ? (
                      selectedInvoice.orderItems.map((item, idx) => {
                        const rawCost = (Number(item.netUnitCost) || Number(item.productPrice) || 0) - (Number(item.discount) || 0);
                        const taxAmt = rawCost * ((Number(item.taxPercent) || 0) / 100);
                        const sub = (rawCost + taxAmt) * (Number(item.quantity) || 1);

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-800">{item.name || item.product?.productName || 'Product Item'}</div>
                              <div className="text-[10px] font-mono text-slate-400">{item.code || item.product?.productCode || ''}</div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-700">₹{(Number(item.netUnitCost) || 0).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{item.taxPercent || 0}%</td>
                            <td className="py-2.5 px-3 text-right text-slate-600">₹{(Number(item.discount) || 0).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{sub.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{selectedInvoice.productName || 'Standard Item'}</div>
                          <div className="text-[10px] font-mono text-slate-400">{selectedInvoice.productCode || ''}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold">{selectedInvoice.purchaseQty || 1}</td>
                        <td className="py-3 px-3 text-right">₹{Number(selectedInvoice.productCost || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-center">0%</td>
                        <td className="py-3 px-3 text-right">₹0.00</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">₹{Number(selectedInvoice.grandTotal || 0).toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex flex-col items-end space-y-1.5">
                <div className="flex justify-between w-full sm:w-1/2 text-slate-600">
                  <span>Order Tax:</span>
                  <span className="font-medium text-slate-800">{selectedInvoice.orderTax || 'No Tax'}</span>
                </div>
                {selectedInvoice.discountValue > 0 && (
                  <div className="flex justify-between w-full sm:w-1/2 text-slate-600">
                    <span>Discount:</span>
                    <span className="font-medium text-emerald-700">-₹{Number(selectedInvoice.discountValue).toFixed(2)}</span>
                  </div>
                )}
                {selectedInvoice.shippingCost > 0 && (
                  <div className="flex justify-between w-full sm:w-1/2 text-slate-600">
                    <span>Shipping:</span>
                    <span className="font-medium text-slate-800">₹{Number(selectedInvoice.shippingCost).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between w-full sm:w-1/2 text-slate-900 font-extrabold text-sm border-t border-slate-200 pt-2">
                  <span>Grand Total:</span>
                  <span className="text-indigo-700">₹{(Number(selectedInvoice.grandTotal) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between w-full sm:w-1/2 text-emerald-700 font-bold">
                  <span>Amount Paid:</span>
                  <span>₹{(Number(selectedInvoice.amountPaid) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {Number(selectedInvoice.returnedAmount || 0) > 0 && (
                  <div className="flex justify-between w-full sm:w-1/2 text-amber-700 font-bold">
                    <span>Purchase Return / Debit Note:</span>
                    <span>-₹{Number(selectedInvoice.returnedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between w-full sm:w-1/2 text-amber-700 font-bold border-t border-slate-200/60 pt-1">
                  <span>Net Balance Due:</span>
                  <span>₹{(selectedInvoice.balanceDue !== undefined ? Number(selectedInvoice.balanceDue) : Math.max(0, (Number(selectedInvoice.grandTotal) || 0) - (Number(selectedInvoice.amountPaid) || 0) - Number(selectedInvoice.returnedAmount || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {selectedInvoice.note && (
              <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-600">
                <span className="font-bold text-slate-700">Remarks / Notes: </span> {selectedInvoice.note}
              </div>
            )}

            <div className="mt-6 pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  handleSendSupplierStatementWhatsApp(supplierDetails?.supplier, supplierDetails?.summary, supplierDetails?.purchases, false);
                  setShowInvoiceModal(false);
                }}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Send All Invoices Statement on WhatsApp"
              >
                <WhatsAppIcon size={14} />
                <span>Send All Invoices Slip (सारा एक साथ)</span>
              </button>

              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={15} /> Print Slip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSendInvoiceWhatsApp(selectedInvoice);
                    setShowInvoiceModal(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 transition-all cursor-pointer"
                  title="Send This Single Invoice Slip on WhatsApp"
                >
                  <WhatsAppIcon size={15} /> Send Single Slip (सिंगल)
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductLedger = () => {
  const navigate = useNavigate();
  const { supplierId: paramSupplierId } = useParams();
  const [searchParams] = useSearchParams();

  // Active supplier id from route params or state
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const activeSupplierId = paramSupplierId || searchParams.get('supplierId') || selectedSupplierId;

  // State management
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState('all'); // 'all', 'due', 'zero'

  // Selected supplier details
  const [supplierDetails, setSupplierDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices', 'profile', 'history'
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All'); // 'All', 'Received', 'Due', 'Cancelled'

  // Selected invoice modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Fetch all suppliers ledger summary
  const fetchLedgerSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers/ledger/summary');
      if (res.data?.success) {
        setSuppliers(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching supplier ledger summary:', error);
      // Fallback: fetch raw suppliers if summary endpoint has issue
      try {
        const fallbackRes = await api.get('/suppliers');
        if (fallbackRes.data?.success) {
          setSuppliers(fallbackRes.data.data || []);
        }
      } catch (err) {
        toast.error('Failed to load supplier ledger data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerSummary();
  }, []);

  // Fetch detailed data when a supplier is selected
  const fetchSupplierDetails = async (supplierId) => {
    if (!supplierId) return;
    setDetailsLoading(true);
    try {
      const res = await api.get(`/suppliers/${supplierId}/ledger`);
      if (res.data?.success) {
        setSupplierDetails(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching supplier ledger details:', error);
      toast.error('Failed to load supplier detailed history');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSupplierId) {
      fetchSupplierDetails(activeSupplierId);
    }
  }, [activeSupplierId]);

  const handleViewSupplier = (supplierId) => {
    setSelectedSupplierId(supplierId);
    navigate(`/products/ledger/${supplierId}`);
  };

  const handleBackToLedger = () => {
    setSelectedSupplierId(null);
    setSupplierDetails(null);
    navigate('/products/ledger');
  };

  // Open invoice view modal
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  // Export Suppliers Summary to CSV
  const handleExportCSV = () => {
    if (!suppliers.length) {
      toast.info('No supplier data available to export');
      return;
    }
    const headers = ['Supplier Code', 'Company Name', 'Contact Person', 'Phone', 'Email', 'GSTIN', 'Total Invoices', 'Total Purchase (₹)', 'Total Paid (₹)', 'Outstanding Due (₹)', 'Status'];
    const rows = filteredSuppliers.map(s => [
      `"${s.supplierCode || ''}"`,
      `"${s.companyName || ''}"`,
      `"${s.contactPerson || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.email || ''}"`,
      `"${s.gstin || ''}"`,
      s.totalInvoices || 0,
      (s.totalPurchaseAmount || 0).toFixed(2),
      (s.totalPaid || 0).toFixed(2),
      (s.dueAmount || s.balance || 0).toFixed(2),
      s.status ? 'Active' : 'Inactive'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Supplier_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp phone number sanitizer (adds 91 if 10-digit Indian phone)
  const getCleanPhone = (rawPhone) => {
    if (!rawPhone) return '';
    let digits = String(rawPhone).replace(/\D/g, '');
    if (digits.length === 10) {
      digits = '91' + digits;
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = '91' + digits.substring(1);
    }
    return digits;
  };

  // 1. Send Single Invoice Slip on WhatsApp (for unpaid / partial / any invoice)
  const handleSendInvoiceWhatsApp = (inv, targetSupplier = null) => {
    const supp = targetSupplier || supplierDetails?.supplier || inv?.supplier || {};
    let rawPhone = supp?.phone || inv?.supplierPhone || '';
    
    let phone = getCleanPhone(rawPhone);
    if (!phone) {
      const prompted = window.prompt(
        `Supplier (${supp.companyName || 'Supplier'}) phone number is missing.\nPlease enter 10-digit WhatsApp phone number:`,
        ''
      );
      if (prompted) {
        phone = getCleanPhone(prompted);
      }
    }

    const supplierName = supp?.companyName || 'Valued Supplier';
    const invNo = inv.referenceNo || inv.purchaseNo || 'PUR-BILL';
    const billDate = inv.purchaseDate || new Date().toISOString().slice(0, 10);
    const dueDate = inv.dueDate || 'Upon Receipt';
    const grandTotal = Number(inv.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const paid = Number(inv.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const retAmt = Number(inv.returnedAmount || 0);
    const balanceDue = (inv.balanceDue !== undefined
      ? Number(inv.balanceDue)
      : Math.max(0, (Number(inv.grandTotal || 0) - Number(inv.amountPaid || 0) - retAmt))
    ).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const paymentStatus = inv.paymentStatus || (Number(inv.grandTotal || 0) <= (Number(inv.amountPaid || 0) + retAmt) ? 'PAID' : 'DUE / UNPAID');

    // Build items summary if available
    let itemsText = '';
    if (inv.orderItems && inv.orderItems.length > 0) {
      itemsText = inv.orderItems
        .slice(0, 5)
        .map((it, idx) => `  ${idx + 1}. *${it.name || it.product?.productName || 'Item'}* (Qty: ${it.quantity}) - ₹${(Number(it.netUnitCost || it.productPrice || 0) * Number(it.quantity || 1)).toFixed(2)}`)
        .join('\n');
      if (inv.orderItems.length > 5) {
        itemsText += `\n  ...and ${inv.orderItems.length - 5} more items`;
      }
    }

    const message = 
`🧾 *PURCHASE INVOICE PAYMENT SLIP*
━━━━━━━━━━━━━━━━━━━━
🏢 *From:* Global ERP Services
👤 *To Supplier:* ${supplierName}
📱 *Contact:* ${rawPhone || phone || 'N/A'}
━━━━━━━━━━━━━━━━━━━━
📄 *Invoice / Ref:* #${invNo}
📅 *Bill Date:* ${billDate}
⏳ *Due Date:* ${dueDate}
📌 *Payment Status:* *${paymentStatus.toUpperCase()}*

💰 *Total Bill:* ₹${grandTotal}
💵 *Amount Paid:* ₹${paid}
${retAmt > 0 ? `↩️ *Purchase Return / Debit Note:* -₹${retAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` : ''}🔴 *NET BALANCE OUTSTANDING DUE:* *₹${balanceDue}*
${itemsText ? `\n📦 *Purchased Items:*\n${itemsText}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
🏦 *Payment Request Note:*
Kindly update and verify your ledger records. If already settled, please ignore this notice.
_Thank you for your partnership!_`;

    const encoded = encodeURIComponent(message);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
    toast.success('WhatsApp slip opened successfully!');
  };

  // 2. Send Entire Supplier Ledger Due Statement / All Bills on WhatsApp
  const handleSendSupplierStatementWhatsApp = (targetSupplier = null, targetSummary = null, targetPurchases = null, sendAll = false) => {
    const supp = targetSupplier || supplierDetails?.supplier || {};
    const summ = targetSummary || supplierDetails?.summary || {};
    const bills = targetPurchases || supplierDetails?.purchases || [];

    let rawPhone = supp?.phone || '';
    let phone = getCleanPhone(rawPhone);
    if (!phone) {
      const prompted = window.prompt(
        `Supplier (${supp.companyName || 'Supplier'}) phone number is missing.\nPlease enter 10-digit WhatsApp phone number:`,
        ''
      );
      if (prompted) {
        phone = getCleanPhone(prompted);
      }
    }

    const supplierName = supp?.companyName || 'Valued Supplier';
    const totalPurchased = Number(summ.totalPurchased || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const totalPaid = Number(summ.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const netBalance = Number(summ.netBalance !== undefined ? summ.netBalance : (supp.dueAmount !== undefined ? supp.dueAmount : (supp.balance || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    // Pending bills
    const unpaidBills = bills.filter(b => {
      const due = Math.max(0, (Number(b.grandTotal || 0) - Number(b.amountPaid || 0)));
      return due > 0 || b.paymentStatus === 'Due' || b.paymentStatus === 'Partial';
    });

    const billsToList = sendAll ? bills : (unpaidBills.length > 0 ? unpaidBills : bills);
    const listTitle = sendAll
      ? `📄 *ALL PURCHASE BILLS BREAKDOWN (${bills.length} BILLS):*`
      : (unpaidBills.length > 0
          ? `⏳ *PENDING / DUE INVOICES (${unpaidBills.length}):*`
          : `📄 *RECENT PURCHASE INVOICES (${bills.length}):*`);

    let pendingListText = '';
    if (billsToList.length > 0) {
      pendingListText = billsToList
        .slice(0, 15)
        .map((b, idx) => {
          const invNo = b.referenceNo || b.purchaseNo || `BILL-${idx+1}`;
          const gTot = Number(b.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
          const pd = Number(b.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
          const due = Math.max(0, (Number(b.grandTotal || 0) - Number(b.amountPaid || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 });
          const dt = b.purchaseDate || (b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'N/A');
          return `  ${idx + 1}. *#${invNo}* (${dt})\n     Bill: ₹${gTot} | Paid: ₹${pd} | *Due: ₹${due}*`;
        })
        .join('\n');
      if (billsToList.length > 15) {
        pendingListText += `\n  ...and ${billsToList.length - 15} more bills`;
      }
    }

    const message =
`📋 *PURCHASE LEDGER STATEMENT & BILLS SUMMARY*
━━━━━━━━━━━━━━━━━━━━
🏢 *From:* Global ERP Services
👤 *Supplier:* ${supplierName}
📱 *Phone:* ${rawPhone || phone || 'N/A'}
🏛 *GSTIN:* ${supp?.gstin || 'Unregistered'}
━━━━━━━━━━━━━━━━━━━━
📊 *ACCOUNT SUMMARY:*
• Total Invoices: ${summ.totalInvoices || bills.length}
• Total Purchased: ₹${totalPurchased}
• Total Disbursed: ₹${totalPaid}
🔴 *NET OUTSTANDING DUE: ₹${netBalance}*
━━━━━━━━━━━━━━━━━━━━
${pendingListText ? `${listTitle}\n${pendingListText}\n━━━━━━━━━━━━━━━━━━━━\n` : ''}
🏦 *Reconciliation Note:*
This is an automated purchase ledger statement for reconciliation. Please acknowledge upon verification.
_Thank you for your partnership!_`;

    const encoded = encodeURIComponent(message);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
    toast.success('WhatsApp all-bills slip opened successfully!');
  };

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (s.companyName || '').toLowerCase().includes(q) ||
        (s.supplierCode || '').toLowerCase().includes(q) ||
        (s.contactPerson || '').toLowerCase().includes(q) ||
        (s.phone || '').toLowerCase().includes(q) ||
        (s.gstin || '').toLowerCase().includes(q);

      const due = s.dueAmount !== undefined ? s.dueAmount : (s.balance || 0);
      let matchesDue = true;
      if (filterDueOnly === 'due') {
        matchesDue = due > 0;
      } else if (filterDueOnly === 'zero') {
        matchesDue = due <= 0;
      }

      return matchesSearch && matchesDue;
    });
  }, [suppliers, searchTerm, filterDueOnly]);

  // Overall aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const totalSuppliers = suppliers.length;
    let totalPurchases = 0;
    let totalPaid = 0;
    let totalDue = 0;

    suppliers.forEach(s => {
      totalPurchases += Number(s.totalPurchaseAmount) || 0;
      totalPaid += Number(s.totalPaid) || 0;
      const due = s.dueAmount !== undefined ? Number(s.dueAmount) : Number(s.balance) || 0;
      totalDue += due;
    });

    return { totalSuppliers, totalPurchases, totalPaid, totalDue };
  }, [suppliers]);

  // Filtered invoices for detailed view
  const filteredInvoices = useMemo(() => {
    if (!supplierDetails?.purchases) return [];
    if (invoiceStatusFilter === 'All') return supplierDetails.purchases;
    if (invoiceStatusFilter === 'Received') {
      return supplierDetails.purchases.filter(p => p.purchaseStatus === 'Received');
    }
    if (invoiceStatusFilter === 'Due') {
      return supplierDetails.purchases.filter(p => p.paymentStatus !== 'Paid' && p.purchaseStatus !== 'Cancelled');
    }
    if (invoiceStatusFilter === 'Paid') {
      return supplierDetails.purchases.filter(p => p.paymentStatus === 'Paid');
    }
    if (invoiceStatusFilter === 'Cancelled') {
      return supplierDetails.purchases.filter(p => p.purchaseStatus === 'Cancelled');
    }
    return supplierDetails.purchases;
  }, [supplierDetails, invoiceStatusFilter]);

  // If a supplier is selected (via route /products/ledger/:supplierId or state), render full-page detail view
  if (activeSupplierId) {
    return (
      <SupplierLedgerDetailPage
        supplierDetails={supplierDetails}
        detailsLoading={detailsLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        invoiceStatusFilter={invoiceStatusFilter}
        setInvoiceStatusFilter={setInvoiceStatusFilter}
        filteredInvoices={filteredInvoices}
        handleBackToLedger={handleBackToLedger}
        fetchSupplierDetails={fetchSupplierDetails}
        activeSupplierId={activeSupplierId}
        handleSendInvoiceWhatsApp={handleSendInvoiceWhatsApp}
        handleSendSupplierStatementWhatsApp={handleSendSupplierStatementWhatsApp}
        handleViewInvoice={handleViewInvoice}
        navigate={navigate}
        showInvoiceModal={showInvoiceModal}
        setShowInvoiceModal={setShowInvoiceModal}
        selectedInvoice={selectedInvoice}
      />
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER SECTION
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Supplier Ledger & Purchase Hub
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">
                  {filteredSuppliers.length} Parties
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage purchase suppliers, track complete bills, payment statuses, and outstanding dues.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Clean single row with Export CSV & Add Purchase Invoice side-by-side */}
        <div className="flex items-center gap-2 sm:gap-2.5 self-stretch sm:self-auto shrink-0 flex-nowrap">
          <button
            onClick={fetchLedgerSummary}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            title="Refresh Ledger Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap"
            title="Export CSV"
          >
            <Download size={16} className="text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/purchases/add-purchase')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
            title="Add Purchase Invoice"
          >
            <Plus size={18} />
            <span>Add Purchase Invoice</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP SUMMARY METRIC CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Suppliers */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Suppliers</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800">{aggregateMetrics.totalSuppliers}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold">Active in Directory</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>

        {/* Card 2: Total Purchases */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Purchased</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Boxes size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800">₹{aggregateMetrics.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-purple-600 mt-1 flex items-center gap-1 font-semibold">
              <Receipt size={13} /> Across all purchase bills
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
        </div>

        {/* Card 3: Total Paid */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Paid Out</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-700">₹{aggregateMetrics.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-emerald-600 mt-1 font-medium">
              Cleared payments & settlements
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        </div>

        {/* Card 4: Outstanding Due */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-gradient-to-br from-white via-amber-50/20 to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">Total Balance Due</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-700">₹{aggregateMetrics.totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
              <AlertTriangle size={13} /> Payable to suppliers
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-red-500" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH, FILTERS & CONTROLS
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Supplier Name, Code, Phone, or GSTIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs bg-slate-200/60 rounded-full w-5 h-5 flex items-center justify-center"
              >
                &times;
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterDueOnly('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterDueOnly === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Suppliers ({suppliers.length})
            </button>
            <button
              onClick={() => setFilterDueOnly('due')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterDueOnly === 'due'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <AlertTriangle size={13} />
              With Outstanding Dues
            </button>
            <button
              onClick={() => setFilterDueOnly('zero')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterDueOnly === 'zero'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              Fully Cleared (₹0 Due)
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN SUPPLIERS LEDGER TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">GSTIN & PAN</th>
                <th className="py-3.5 px-4 text-center">Invoices</th>
                <th className="py-3.5 px-4 text-right">Total Purchased</th>
                <th className="py-3.5 px-4 text-right">Total Paid</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-indigo-600" />
                      <span className="text-sm font-semibold">Loading purchase suppliers ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building size={36} className="text-slate-300" />
                      <span className="text-base font-bold text-slate-600">No Suppliers Found</span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchTerm ? 'No supplier matches your search query.' : 'No purchase suppliers have been registered yet.'}
                      </p>
                      <button
                        onClick={() => navigate('/purchases/add-purchase')}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                      >
                        <Plus size={15} /> Create First Purchase
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => {
                  const due = s.dueAmount !== undefined ? Number(s.dueAmount) : Number(s.balance) || 0;
                  const isSelected = selectedSupplierId === s._id;

                  return (
                    <tr
                      key={s._id}
                      className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-indigo-50/40' : ''}`}
                    >
                      {/* Supplier Column */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 text-sm hover:text-indigo-600 cursor-pointer" onClick={() => handleViewSupplier(s._id)}>
                          {s.companyName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {s.supplierCode || 'SUP-N/A'}
                          </span>
                          {s.type && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                              {s.type}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-semibold">{s.contactPerson || '—'}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          {s.phone && <span>📞 {s.phone}</span>}
                          {s.email && <span className="truncate max-w-[140px]" title={s.email}>✉️ {s.email}</span>}
                        </div>
                      </td>

                      {/* GSTIN & PAN */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-700">
                          {s.gstin || 'Unregistered'}
                        </div>
                        {s.pan && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            PAN: {s.pan}
                          </div>
                        )}
                      </td>

                      {/* Total Invoices */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {s.totalInvoices || 0} Bills
                        </span>
                      </td>

                      {/* Total Purchased */}
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                        ₹{(s.totalPurchaseAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Total Paid */}
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                        ₹{(s.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4 text-right font-bold">
                        {due > 0 ? (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-block">
                            ₹{due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-block font-semibold">
                            ₹0.00
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {s.status !== false ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions - Only View Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleViewSupplier(s._id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                          title="View Full Supplier Details & All Invoices"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. SUPPLIER 360° FULL DETAIL VIEW OVERLAY / MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedSupplierId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Top Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between border-b border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-indigo-300 font-extrabold text-lg shrink-0">
                  {supplierDetails?.supplier?.companyName?.slice(0, 2).toUpperCase() || 'SP'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {supplierDetails?.supplier?.companyName || 'Loading Supplier Details...'}
                    </h2>
                    <span className="font-mono text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded">
                      {supplierDetails?.supplier?.supplierCode || 'SUP-CODE'}
                    </span>
                    {supplierDetails?.supplier?.type && (
                      <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded font-medium">
                        {supplierDetails.supplier.type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-4">
                    {supplierDetails?.supplier?.contactPerson && (
                      <span className="flex items-center gap-1">
                        <User size={13} className="text-indigo-400" /> {supplierDetails.supplier.contactPerson}
                      </span>
                    )}
                    {supplierDetails?.supplier?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={13} className="text-indigo-400" /> {supplierDetails.supplier.phone}
                      </span>
                    )}
                    {supplierDetails?.supplier?.gstin && (
                      <span className="flex items-center gap-1 font-mono">
                        <ShieldCheck size={13} className="text-emerald-400" /> GSTIN: {supplierDetails.supplier.gstin}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendSupplierStatementWhatsApp()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-all active:scale-95 border border-emerald-400/40"
                  title="Send Outstanding Due Slip on WhatsApp"
                >
                  <WhatsAppIcon size={16} />
                  <span className="hidden sm:inline">
                    {(supplierDetails?.summary?.netBalance || 0) > 0
                      ? `WhatsApp Due Slip (₹${(supplierDetails.summary.netBalance || 0).toLocaleString('en-IN')})`
                      : 'WhatsApp Statement'}
                  </span>
                  <span className="sm:hidden">WhatsApp</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={handleCloseDetails}
                  className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-colors"
                  title="Close Profile"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Quick Stat Bar */}
            {supplierDetails?.summary && (
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Invoices</span>
                  <span className="text-base font-extrabold text-slate-800">
                    {supplierDetails.summary.totalInvoices || 0} Bills
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Purchased</span>
                  <span className="text-base font-extrabold text-indigo-700">
                    ₹{(supplierDetails.summary.totalPurchased || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Paid</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    ₹{(supplierDetails.summary.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Net Balance</span>
                  <span className={`text-base font-extrabold ${supplierDetails.summary.netBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    ₹{(supplierDetails.summary.netBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="px-6 pt-3 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm font-semibold">
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'invoices'
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Receipt size={16} />
                  <span>All Invoices / Purchase Bills ({supplierDetails?.purchases?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'profile'
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Building size={16} />
                  <span>Supplier Profile & Legal Details</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
                    activeTab === 'history'
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Clock size={16} />
                  <span>Payments & Returns History</span>
                </button>
              </div>

              {/* Add invoice button inside modal */}
              <button
                onClick={() => navigate(`/purchases/add-purchase?supplierId=${supplierDetails?.supplier?._id}`)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2 transition-all active:scale-95"
              >
                <Plus size={14} /> Add Invoice for this Supplier
              </button>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">
              {detailsLoading ? (
                <div className="py-16 text-center text-slate-400">
                  <RefreshCw size={28} className="animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Loading supplier profile & transaction history...</p>
                </div>
              ) : (
                <>
                  {/* ──────────────────────────────────
                      TAB 1: ALL INVOICES
                  ────────────────────────────────── */}
                  {activeTab === 'invoices' && (
                    <div>
                      {/* Sub-Filter pills */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          {['All', 'Received', 'Due', 'Paid', 'Cancelled'].map((st) => (
                            <button
                              key={st}
                              onClick={() => setInvoiceStatusFilter(st)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                invoiceStatusFilter === st
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st === 'All' ? `All Bills (${supplierDetails?.purchases?.length || 0})` : st}
                            </button>
                          ))}
                        </div>

                        <span className="text-xs text-slate-400 font-medium">
                          Showing {filteredInvoices.length} bill(s)
                        </span>
                      </div>

                      {/* Invoices Table */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              <th className="py-3 px-4">Invoice / Ref No</th>
                              <th className="py-3 px-4">Bill Date</th>
                              <th className="py-3 px-4">Due Date</th>
                              <th className="py-3 px-4">Warehouse</th>
                              <th className="py-3 px-4 text-center">Items</th>
                              <th className="py-3 px-4 text-right">Grand Total</th>
                              <th className="py-3 px-4 text-right">Paid Amount</th>
                              <th className="py-3 px-4 text-center">Purchase Status</th>
                              <th className="py-3 px-4 text-center">Payment Status</th>
                              <th className="py-3 px-4 text-center">Action / Slip</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {filteredInvoices.length === 0 ? (
                              <tr>
                                <td colSpan={10} className="py-10 text-center text-slate-400">
                                  <Receipt size={32} className="mx-auto mb-2 text-slate-300" />
                                  <p className="font-semibold text-sm text-slate-600">No invoices match this filter</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Click '+ Add Invoice' to create a new purchase invoice for this supplier.</p>
                                </td>
                              </tr>
                            ) : (
                              filteredInvoices.map((inv) => {
                                const grandTotal = Number(inv.grandTotal) || 0;
                                const amountPaid = Number(inv.amountPaid) || 0;
                                const balanceDue = Math.max(0, grandTotal - amountPaid);

                                return (
                                  <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3 px-4">
                                      <div className="font-bold text-slate-800 font-mono text-xs">
                                        {inv.referenceNo || inv.purchaseNo || 'PUR-BILL'}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-600">
                                      {inv.purchaseDate || '—'}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-600">
                                      {inv.dueDate || '—'}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-600">
                                      {inv.warehouse?.name || (typeof inv.warehouse === 'string' ? inv.warehouse : 'General')}
                                    </td>
                                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                                      {inv.orderItems?.length || 1}
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                                      ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                                      ₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        inv.purchaseStatus === 'Received'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : inv.purchaseStatus === 'Pending'
                                          ? 'bg-amber-100 text-amber-800'
                                          : inv.purchaseStatus === 'Cancelled'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {inv.purchaseStatus || 'Received'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        inv.paymentStatus === 'Paid'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : inv.paymentStatus === 'Partial'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}>
                                        {inv.paymentStatus || (balanceDue === 0 ? 'Paid' : 'Due')}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button
                                          onClick={() => handleViewInvoice(inv)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors"
                                          title="View Full Invoice Breakdown"
                                        >
                                          <Eye size={12} />
                                          <span>View</span>
                                        </button>

                                        {/* WhatsApp Invoice Slip Button */}
                                        <button
                                          onClick={() => handleSendInvoiceWhatsApp(inv)}
                                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-sm ${
                                            balanceDue > 0
                                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                          }`}
                                          title={balanceDue > 0 ? `Send Unpaid Invoice Slip on WhatsApp (Due: ₹${balanceDue.toLocaleString('en-IN')})` : "Share Invoice Slip on WhatsApp"}
                                        >
                                          <WhatsAppIcon size={13} />
                                          <span>{balanceDue > 0 ? 'Send Slip' : 'WhatsApp'}</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ──────────────────────────────────
                      TAB 2: SUPPLIER FULL PROFILE
                  ────────────────────────────────── */}
                  {activeTab === 'profile' && supplierDetails?.supplier && (
                    <div className="space-y-6">
                      {/* Section A: Company & Contact */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                          <Building size={16} className="text-indigo-600" /> Basic Company & Contact Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Company / Trade Name</span>
                            <span className="font-bold text-slate-800 text-sm">{supplierDetails.supplier.companyName}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Supplier Code</span>
                            <span className="font-mono font-bold text-slate-800 text-sm">{supplierDetails.supplier.supplierCode}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Contact Person</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.contactPerson || 'Not Provided'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Phone Number</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.phone || 'Not Provided'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Email Address</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.email || 'Not Provided'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Supplier Type</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.type || 'Manufacturer'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Category</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.category || 'Raw Materials'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Account Status</span>
                            <span className="font-bold text-emerald-600">
                              {supplierDetails.supplier.status !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section B: GST & Compliance */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                          <ShieldCheck size={16} className="text-emerald-600" /> GST, Tax & Statutory Compliance
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">GSTIN</span>
                            <span className="font-mono font-bold text-slate-800 text-sm">{supplierDetails.supplier.gstin || 'Unregistered'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">GST Status</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.gstStatus || 'Registered'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">PAN Number</span>
                            <span className="font-mono font-bold text-slate-800">{supplierDetails.supplier.pan || 'N/A'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Tax Preference</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.taxPreference || 'Taxable'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">TDS Applicable</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.tdsApplicable ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Currency</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.currency || 'INR'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Payment Terms</span>
                            <span className="font-bold text-slate-800">{supplierDetails.supplier.paymentTerms || 'Net 30'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block text-[11px] font-medium">Credit Limit</span>
                            <span className="font-bold text-slate-800">₹{(supplierDetails.supplier.creditLimit || 0).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section C: Addresses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Billing Address */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                            <MapPin size={15} className="text-red-500" /> Billing Address
                          </h4>
                          <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-4 rounded-xl leading-relaxed">
                            <p className="font-bold text-slate-800">{supplierDetails.supplier.billingAddress?.street1 || 'No street address'}</p>
                            {supplierDetails.supplier.billingAddress?.street2 && <p>{supplierDetails.supplier.billingAddress.street2}</p>}
                            <p>
                              {supplierDetails.supplier.billingAddress?.city || '—'}, {supplierDetails.supplier.billingAddress?.state || '—'} {supplierDetails.supplier.billingAddress?.zip || ''}
                            </p>
                            <p className="text-slate-500">{supplierDetails.supplier.billingAddress?.country || 'India'}</p>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                            <MapPin size={15} className="text-blue-500" /> Shipping / Dispatch Address
                          </h4>
                          <div className="text-xs text-slate-700 space-y-1 bg-slate-50 p-4 rounded-xl leading-relaxed">
                            <p className="font-bold text-slate-800">{supplierDetails.supplier.shippingAddress?.street1 || 'Same as billing address'}</p>
                            {supplierDetails.supplier.shippingAddress?.street2 && <p>{supplierDetails.supplier.shippingAddress.street2}</p>}
                            <p>
                              {supplierDetails.supplier.shippingAddress?.city || '—'}, {supplierDetails.supplier.shippingAddress?.state || '—'} {supplierDetails.supplier.shippingAddress?.zip || ''}
                            </p>
                            <p className="text-slate-500">{supplierDetails.supplier.shippingAddress?.country || 'India'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Section D: Bank Accounts */}
                      {supplierDetails.supplier.banks && supplierDetails.supplier.banks.length > 0 && (
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                            <Landmark size={16} className="text-indigo-600" /> Bank Account Details
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {supplierDetails.supplier.banks.map((b, idx) => (
                              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                                <div className="font-bold text-slate-800 text-sm mb-1">{b.bankName || 'Bank'}</div>
                                <div className="text-slate-600">A/C No: <span className="font-mono font-bold text-slate-800">{b.accountNumber || b.accountNo || '—'}</span></div>
                                <div className="text-slate-600">IFSC: <span className="font-mono font-bold text-slate-800">{b.ifscCode || b.ifsc || '—'}</span></div>
                                {b.branch && <div className="text-slate-500 mt-1">Branch: {b.branch}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ──────────────────────────────────
                      TAB 3: PAYMENTS & RETURNS HISTORY
                  ────────────────────────────────── */}
                  {activeTab === 'history' && (
                    <div className="space-y-6">
                      {/* Payments History */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                          <CreditCard size={16} className="text-emerald-600" /> Payments Disbursed to Supplier
                        </h3>
                        {supplierDetails?.payments?.length === 0 ? (
                          <div className="py-6 text-center text-slate-400 text-xs">
                            No standalone payment records found for this party. Payments recorded during purchase bills appear directly in bills.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500 text-[10px]">
                                  <th className="py-2.5 px-3">Payment No</th>
                                  <th className="py-2.5 px-3">Date</th>
                                  <th className="py-2.5 px-3">Mode</th>
                                  <th className="py-2.5 px-3">Ref / Cheque</th>
                                  <th className="py-2.5 px-3 text-right">Amount</th>
                                  <th className="py-2.5 px-3 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {supplierDetails?.payments?.map((pay) => (
                                  <tr key={pay._id}>
                                    <td className="py-2.5 px-3 font-mono font-bold">{pay.paymentNo || 'PAY-N/A'}</td>
                                    <td className="py-2.5 px-3">{pay.paymentDate}</td>
                                    <td className="py-2.5 px-3">{pay.paymentMethod || 'Bank'}</td>
                                    <td className="py-2.5 px-3 font-mono">{pay.transactionRef || pay.chequeNo || '—'}</td>
                                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">₹{(pay.paymentAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        {pay.status || 'Success'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Purchase Returns History */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                          <ArrowDownRight size={16} className="text-red-500" /> Purchase Returns & Debit Notes
                        </h3>
                        {supplierDetails?.returns?.length === 0 ? (
                          <div className="py-6 text-center text-slate-400 text-xs">
                            No goods have been returned to this supplier.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500 text-[10px]">
                                  <th className="py-2.5 px-3">Return No</th>
                                  <th className="py-2.5 px-3">Date</th>
                                  <th className="py-2.5 px-3 font-mono">Debit Note No</th>
                                  <th className="py-2.5 px-3">Reason</th>
                                  <th className="py-2.5 px-3 text-right">Goods Value</th>
                                  <th className="py-2.5 px-3 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {supplierDetails?.returns?.map((ret) => (
                                  <tr key={ret._id}>
                                    <td className="py-2.5 px-3 font-mono font-bold">{ret.returnNo}</td>
                                    <td className="py-2.5 px-3">{ret.returnDate}</td>
                                    <td className="py-2.5 px-3 font-mono">{ret.debitNoteNo || '—'}</td>
                                    <td className="py-2.5 px-3">{ret.returnReason || 'Defective Goods'}</td>
                                    <td className="py-2.5 px-3 text-right font-bold text-red-600">₹{(ret.totals?.goodsValue || ret.totals?.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                        {ret.status || 'Draft'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Supplier ID: <span className="font-mono text-slate-600">{supplierDetails?.supplier?._id}</span>
              </span>
              <button
                onClick={handleCloseDetails}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. FULL TAX INVOICE OVERVIEW MODAL
      ───────────────────────────────────────────────────────────── */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-8 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 relative text-slate-800 animate-in fade-in zoom-in-95 duration-200 my-8">
            
            {/* Close Icon */}
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 p-2 rounded-full transition-all"
            >
              <X size={20} />
            </button>

            {/* Printable Area Header */}
            <div className="border-b border-slate-200 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Purchase Tax Invoice</span>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                  {selectedInvoice.referenceNo || selectedInvoice.purchaseNo || 'PUR-BILL'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendInvoiceWhatsApp(selectedInvoice)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                  title="Send this Invoice Slip on WhatsApp"
                >
                  <WhatsAppIcon size={14} />
                  <span>WhatsApp Slip</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
                >
                  <Printer size={14} /> Print Bill
                </button>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedInvoice.purchaseStatus === 'Received'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedInvoice.purchaseStatus || 'Received'}
                </span>
              </div>
            </div>

            {/* Bill Meta Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block font-medium">Invoice Date</span>
                <span className="font-bold text-slate-800 text-sm">{selectedInvoice.purchaseDate || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Due Date</span>
                <span className="font-bold text-slate-800 text-sm">{selectedInvoice.dueDate || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Warehouse / Branch</span>
                <span className="font-bold text-slate-800">{selectedInvoice.warehouse?.name || (typeof selectedInvoice.warehouse === 'string' ? selectedInvoice.warehouse : 'General Warehouse')}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Payment Status</span>
                <span className={`font-bold ${selectedInvoice.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedInvoice.paymentStatus || 'Due'}
                </span>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Itemized Purchase Products</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Item Details</th>
                      <th className="py-2.5 px-3 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Unit Cost</th>
                      <th className="py-2.5 px-3 text-center">Tax %</th>
                      <th className="py-2.5 px-3 text-right">Discount</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.orderItems && selectedInvoice.orderItems.length > 0 ? (
                      selectedInvoice.orderItems.map((item, idx) => {
                        const rawCost = (Number(item.netUnitCost) || Number(item.productPrice) || 0) - (Number(item.discount) || 0);
                        const taxAmt = rawCost * ((Number(item.taxPercent) || 0) / 100);
                        const sub = (rawCost + taxAmt) * (Number(item.quantity) || 1);

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-800">{item.name || item.product?.productName || 'Product Item'}</div>
                              <div className="text-[10px] font-mono text-slate-400">{item.code || item.product?.productCode || ''}</div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-700">₹{(Number(item.netUnitCost) || 0).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-center text-slate-600">{item.taxPercent || 0}%</td>
                            <td className="py-2.5 px-3 text-right text-slate-600">₹{(Number(item.discount) || 0).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{sub.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{selectedInvoice.productName || 'Standard Item'}</div>
                          <div className="text-[10px] font-mono text-slate-400">{selectedInvoice.productCode || ''}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-bold">{selectedInvoice.purchaseQty || 1}</td>
                        <td className="py-3 px-3 text-right">₹{Number(selectedInvoice.productCost || 0).toFixed(2)}</td>
                        <td className="py-3 px-3 text-center">0%</td>
                        <td className="py-3 px-3 text-right">₹0.00</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">₹{Number(selectedInvoice.grandTotal || 0).toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals Breakdown Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex flex-col items-end space-y-1.5">
                <div className="flex justify-between w-full sm:w-1/2 text-slate-600">
                  <span>Order Tax:</span>
                  <span className="font-medium text-slate-800">{selectedInvoice.orderTax || 'No Tax'}</span>
                </div>
                {selectedInvoice.discountValue > 0 && (
                  <div className="flex justify-between w-full sm:w-1/2 text-slate-600">
                    <span>Discount:</span>
                    <span className="font-medium text-emerald-700">-₹{Number(selectedInvoice.discountValue).toFixed(2)}</span>
                  </div>
                )}
                {selectedInvoice.shippingCost > 0 && (
                  <div className="flex justify-between w-full sm:w-1/2 text-slate-600">
                    <span>Shipping:</span>
                    <span className="font-medium text-slate-800">₹{Number(selectedInvoice.shippingCost).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between w-full sm:w-1/2 text-slate-900 font-extrabold text-sm border-t border-slate-200 pt-2">
                  <span>Grand Total:</span>
                  <span className="text-indigo-700">₹{(Number(selectedInvoice.grandTotal) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between w-full sm:w-1/2 text-emerald-700 font-bold">
                  <span>Amount Paid:</span>
                  <span>₹{(Number(selectedInvoice.amountPaid) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between w-full sm:w-1/2 text-amber-700 font-bold border-t border-slate-200/60 pt-1">
                  <span>Balance Due:</span>
                  <span>₹{Math.max(0, (Number(selectedInvoice.grandTotal) || 0) - (Number(selectedInvoice.amountPaid) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Note / Remarks */}
            {selectedInvoice.note && (
              <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-600">
                <span className="font-bold text-slate-700">Remarks / Notes: </span> {selectedInvoice.note}
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all"
              >
                Close Bill View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductLedger;
