import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Plus, Search, Eye, Filter, RefreshCw, FileText, Download,
  Printer, X, CheckCircle, Clock, AlertTriangle, Building, Phone, Mail,
  MapPin, CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Tag,
  ShieldCheck, ChevronRight, User, ExternalLink, Calendar, Receipt, Landmark,
  Boxes, FileSpreadsheet, AlertCircle, ArrowLeft, ShoppingCart, ShoppingBag
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

// Dedicated Full Page Component for Customer Ledger & Profile
const CustomerLedgerDetailPage = ({
  customerDetails,
  detailsLoading,
  activeTab,
  setActiveTab,
  invoiceStatusFilter,
  setInvoiceStatusFilter,
  filteredInvoices,
  handleBackToLedger,
  fetchCustomerDetails,
  activeCustomerId,
  handleSendInvoiceWhatsApp,
  handleSendCustomerStatementWhatsApp,
  handleViewInvoice,
  navigate,
  showInvoiceModal,
  setShowInvoiceModal,
  selectedInvoice
}) => {
  const customer = customerDetails?.customer || {};
  const summary = customerDetails?.summary || {};

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* 1. TOP BREADCRUMB & BACK ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToLedger}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95 group cursor-pointer"
          >
            <ArrowLeft size={16} className="text-slate-500 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Customer Ledger</span>
          </button>
          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2 font-medium">
            <span>Sales & CRM</span>
            <ChevronRight size={13} />
            <span className="hover:text-indigo-600 cursor-pointer" onClick={handleBackToLedger}>Customer Ledger</span>
            <ChevronRight size={13} />
            <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-md">
              {customer?.name || customer?.businessName || 'Customer Profile'}
            </span>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => fetchCustomerDetails(activeCustomerId)}
            disabled={detailsLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-800 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={detailsLoading ? 'animate-spin text-emerald-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleSendCustomerStatementWhatsApp()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 dark:shadow-none transition-all active:scale-95 cursor-pointer"
            title="Send Due Statement Slip on WhatsApp"
          >
            <WhatsAppIcon size={16} />
            <span>
              {(summary?.netBalance || 0) > 0
                ? `WhatsApp Due Slip (₹${(summary.netBalance || 0).toLocaleString('en-IN')})`
                : 'WhatsApp Statement'}
            </span>
          </button>

          <button
            onClick={() => navigate(`/sales/add-sale?customerId=${customer?._id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 dark:shadow-none transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Sale Invoice</span>
          </button>
        </div>
      </div>

      {detailsLoading && !customerDetails ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-16 text-center text-slate-400">
          <RefreshCw size={32} className="animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">Loading Customer Ledger Page...</p>
          <p className="text-xs text-slate-400 mt-1">Fetching sales bills, receipts, and statement history.</p>
        </div>
      ) : (
        <>
          {/* 2. Hero Customer Profile Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-xl border border-slate-800 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0 border border-white/20">
                  {(customer?.name || 'CU').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      {customer?.name || customer?.businessName || 'Customer Name'}
                    </h1>
                    <span className="font-mono text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                      {customer?.customerCode || 'CUST-CODE'}
                    </span>
                    {customer?.type && (
                      <span className="text-xs bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
                        {customer.type}
                      </span>
                    )}
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {customer?.status !== false ? '● Active Customer' : 'Inactive'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-5">
                    {customer?.businessName && customer.businessName !== customer.name && (
                      <span className="flex items-center gap-1.5">
                        <Building size={14} className="text-emerald-400" />
                        <span className="text-slate-400">Firm:</span>
                        <strong className="text-white">{customer.businessName}</strong>
                      </span>
                    )}
                    {customer?.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} className="text-emerald-400" />
                        <span className="text-slate-400">Phone:</span>
                        <strong className="text-white">{customer.phone}</strong>
                      </span>
                    )}
                    {customer?.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} className="text-emerald-400" />
                        <span className="text-slate-400">Email:</span>
                        <strong className="text-white">{customer.email}</strong>
                      </span>
                    )}
                    {customer?.gstin && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span className="text-slate-400">GSTIN:</span>
                        <strong className="text-emerald-300">{customer.gstin}</strong>
                      </span>
                    )}
                    {customer?.pan && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-400">PAN:</span>
                        <strong className="text-white">{customer.pan}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Top KPI Metric Cards for Customer */}
          {summary && (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${(summary.totalReturns || 0) > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 mb-6`}>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Sale Invoices</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Receipt size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{summary.totalInvoices || 0} Bills</div>
                  <div className="text-[11px] text-slate-400 mt-1">All recorded sales bills</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Billed (Sales)</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Boxes size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-purple-700 dark:text-purple-400">₹{(summary.totalSold || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">Gross sales billing volume</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Collected</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">₹{(summary.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Total receipts & payments received</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
              </div>

              {(summary.totalReturns || 0) > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-amber-200/80 dark:border-amber-900/60 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">Returns / Credits</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <RotateCcw size={20} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400">-₹{(summary.totalReturns || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">{customerDetails?.returns?.length || 1} return slip(s) credit</div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-rose-200/80 dark:border-rose-900/60 shadow-sm relative overflow-hidden group bg-gradient-to-br from-white via-rose-50/20 to-rose-50/40 dark:from-slate-900 dark:via-rose-950/20 dark:to-rose-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300">Balance Receivable Due</span>
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className={`text-2xl font-black ${summary.netBalance > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    ₹{(summary.netBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1">
                    {summary.netBalance > 0 ? (
                      <><AlertTriangle size={13} /> Net Due (Billed − Paid − Returns)</>
                    ) : (
                      'Fully Settled (₹0 Due)'
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
              </div>
            </div>
          )}

          {/* 4. Tab Navigation Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
            <div className="px-6 pt-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-8 text-sm font-semibold whitespace-nowrap">
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'invoices'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Receipt size={17} />
                  <span>All Sales Invoices ({customerDetails?.sales?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Building size={17} />
                  <span>Customer Profile & Legal Details</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'history'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Clock size={17} />
                  <span>Receipts & Returns History</span>
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-5 sm:p-6 bg-slate-50/40 dark:bg-slate-900/60">
              {/* TAB 1: ALL INVOICES */}
              {activeTab === 'invoices' && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {['All', 'Completed', 'Due', 'Paid', 'Cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setInvoiceStatusFilter(st)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            invoiceStatusFilter === st
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {st === 'All' ? `All Bills (${customerDetails?.sales?.length || 0})` : st}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSendCustomerStatementWhatsApp(customer, summary, customerDetails?.sales, false)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                        title="Send All Due Invoices & Statement together on WhatsApp"
                      >
                        <WhatsAppIcon size={14} />
                        <span>Send All Invoices Slip (सारा एक साथ)</span>
                      </button>

                      <span className="text-xs text-slate-400 font-medium">
                        Showing {filteredInvoices.length} bill(s)
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                          <th className="py-3 px-4">Invoice No</th>
                          <th className="py-3 px-4">Sale Date</th>
                          <th className="py-3 px-4">Mode</th>
                          <th className="py-3 px-4 text-center">Items</th>
                          <th className="py-3 px-4 text-right">Grand Total</th>
                          <th className="py-3 px-4 text-right">Paid Amount</th>
                          <th className="py-3 px-4 text-right">Return / Credit</th>
                          <th className="py-3 px-4 text-right">Balance Due</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-center">Action / Slip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                        {filteredInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-12 text-center text-slate-400">
                              <Receipt size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                              <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">No invoices match this filter</p>
                              <p className="text-xs text-slate-400 mt-0.5">Click '+ Create Sale Invoice' to record a new sale for this customer.</p>
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
                              <tr key={inv._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="font-bold text-slate-800 dark:text-slate-100 font-mono text-xs">
                                    {inv.invoiceNo}
                                  </div>
                                  {inv.referenceNo && (
                                    <div className="text-[10px] text-slate-400">Ref: {inv.referenceNo}</div>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                  {inv.saleDate || new Date(inv.createdAt).toLocaleDateString()}
                                </td>

                                <td className="py-3 px-4">
                                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {inv.paymentMode || 'Cash'}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <span className="font-bold text-slate-700 dark:text-slate-200">
                                    {inv.orderItems?.length || 0}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-100">
                                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>

                                <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                  ₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>

                                <td className="py-3 px-4 text-right font-semibold">
                                  {returnedAmount > 0 ? (
                                    <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/60 inline-block text-xs">
                                      -₹{returnedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-right font-bold">
                                  {balanceDue > 0 ? (
                                    <div>
                                      <span className="text-rose-600 dark:text-rose-400">
                                        ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </span>
                                      {returnedAmount > 0 && (
                                        <div className="text-[10px] text-slate-400 font-normal">
                                          (₹{(grandTotal - amountPaid).toLocaleString('en-IN')} − ₹{returnedAmount.toLocaleString('en-IN')})
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-emerald-600 dark:text-emerald-400">₹0.00</span>
                                  )}
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      balanceDue === 0 || inv.paymentStatus === 'Paid'
                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                    }`}
                                  >
                                    {balanceDue === 0 || inv.paymentStatus === 'Paid' ? 'Paid' : 'Due'}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleViewInvoice(inv)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                                      title="View / Print Invoice Slip"
                                    >
                                      <Eye size={13} />
                                      <span>View</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSendInvoiceWhatsApp(inv, customer)}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer ${
                                        balanceDue > 0
                                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'
                                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                      }`}
                                      title={`Send Single Invoice Slip #${inv.invoiceNo} on WhatsApp`}
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
                        <tfoot className="bg-slate-50/90 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 text-xs font-bold">
                          <tr>
                            <td colSpan={4} className="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                              Total Summary ({filteredInvoices.length} Bills)
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-900 dark:text-slate-100 font-black">
                              ₹{filteredInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-black">
                              ₹{filteredInvoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 text-right text-amber-600 dark:text-amber-400 font-black">
                              {filteredInvoices.reduce((sum, inv) => sum + (Number(inv.returnedAmount) || 0), 0) > 0
                                ? `-₹${filteredInvoices.reduce((sum, inv) => sum + (Number(inv.returnedAmount) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                                : '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right text-rose-600 dark:text-rose-400 font-black text-sm">
                              ₹{filteredInvoices.reduce((sum, inv) => {
                                const gTot = Number(inv.grandTotal) || 0;
                                const pd = Number(inv.amountPaid) || 0;
                                const ret = Number(inv.returnedAmount) || 0;
                                return sum + (inv.balanceDue !== undefined ? Number(inv.balanceDue) : Math.max(0, gTot - pd - ret));
                              }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td colSpan={2} className="py-3.5 px-4 text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              Net Outstanding
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE & LEGAL DETAILS */}
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Financial & Credit Overview */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <CreditCard size={16} className="text-emerald-600" />
                      Credit & Financial Terms
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">Credit Limit:</span>
                        <strong className="text-slate-800 dark:text-slate-200">₹ {(customer.creditLimit || 0).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">Credit Period:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{customer.creditPeriod || 0} Days</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">Opening Balance:</span>
                        <strong className="text-slate-800 dark:text-slate-200">₹ {(customer.openingBalance || 0).toLocaleString()} ({customer.balanceType || 'Dr'})</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">Current Outstanding:</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-bold">₹ {(summary.netBalance || 0).toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Tax & Registration Details */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      Tax & Legal Registrations
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">GSTIN:</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200">{customer.gstin || 'Unregistered'}</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">PAN Number:</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200">{customer.pan || 'Not Provided'}</strong>
                      </div>
                      {customer.drugLicenceNo && (
                        <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                          <span className="text-slate-500">Drug License:</span>
                          <strong className="text-slate-800 dark:text-slate-200">{customer.drugLicenceNo} (Valid: {customer.drugLicenceValidity || 'N/A'})</strong>
                        </div>
                      )}
                      <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800">
                        <span className="text-slate-500">Bank Details:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{customer.bankName ? `${customer.bankName} - ${customer.bankAccount || ''}` : 'Not Provided'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 md:col-span-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <MapPin size={16} className="text-emerald-600" />
                      Billing & Shipping Address
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Billing Address:</span>
                        <p className="text-slate-600 dark:text-slate-400">
                          {customer.billingAddress?.street || customer.billingAddress?.city || customer.billingAddress?.state ? (
                            `${customer.billingAddress.street || ''}, ${customer.billingAddress.city || ''}, ${customer.billingAddress.state || ''} ${customer.billingAddress.zip || ''}`
                          ) : (
                            'No billing address recorded.'
                          )}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Shipping Address:</span>
                        <p className="text-slate-600 dark:text-slate-400">
                          {customer.shippingAddress?.street || customer.shippingAddress?.city || customer.shippingAddress?.state ? (
                            `${customer.shippingAddress.street || ''}, ${customer.shippingAddress.city || ''}, ${customer.shippingAddress.state || ''} ${customer.shippingAddress.zip || ''}`
                          ) : (
                            'Same as billing address.'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RECEIPTS & HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  {/* Receipts History */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle size={15} className="text-emerald-600" />
                        Receipts / Payments Received History ({customerDetails?.receipts?.length || 0})
                      </h4>
                    </div>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
                          <th className="p-3">Receipt No</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Account / Ref</th>
                          <th className="p-3 text-right">Amount Received (₹)</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {(!customerDetails?.receipts || customerDetails.receipts.length === 0) ? (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">
                              No separate receipts recorded for this customer yet.
                            </td>
                          </tr>
                        ) : (
                          customerDetails.receipts.map((r) => (
                            <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-3 font-mono font-bold text-emerald-600">{r.receiptNo || 'REC'}</td>
                              <td className="p-3">{r.receiptDate || new Date(r.createdAt).toLocaleDateString()}</td>
                              <td className="p-3">{r.paymentMethod || 'Cash'}</td>
                              <td className="p-3 text-slate-500">{r.transactionRef || r.account || '—'}</td>
                              <td className="p-3 text-right font-bold text-emerald-600">
                                ₹{(Number(r.paymentAmount || r.totals?.received) || 0).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {r.status || 'Received'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Sales Return History */}
                  {customerDetails?.returns && customerDetails.returns.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                          <RotateCcw size={15} className="text-amber-600" />
                          Sales Returns ({customerDetails.returns.length})
                        </h4>
                      </div>
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase text-[10px]">
                            <th className="p-3">Return No</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Invoice Ref</th>
                            <th className="p-3">Reason</th>
                            <th className="p-3 text-right">Refund Amount (₹)</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                          {customerDetails.returns.map((ret) => (
                            <tr key={ret._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="p-3 font-mono font-bold text-amber-600">{ret.returnNumber || ret.returnNo}</td>
                              <td className="p-3">{ret.returnDate || ret.date}</td>
                              <td className="p-3">{ret.invoiceNumber || ret.invoiceNo || '—'}</td>
                              <td className="p-3 text-slate-500">{ret.reason || ret.returnReason || 'Approved sales return'}</td>
                              <td className="p-3 text-right font-bold text-amber-600">
                                ₹{(Number(ret.totalRefundAmount || ret.totalAmount) || 0).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
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
              )}
            </div>
          </div>
        </>
      )}

      {/* Sale Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowInvoiceModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                  Sale Invoice #{selectedInvoice.invoiceNo}
                </h3>
                <p className="text-xs text-slate-400">
                  Date: {selectedInvoice.saleDate || new Date(selectedInvoice.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{customer?.name || 'Customer'}</span>
                  {customer?.phone && <span className="block text-slate-500">{customer.phone}</span>}
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedInvoice.paymentStatus || 'Paid'}</span>
                  <span className="block text-slate-500">Mode: {selectedInvoice.paymentMode || 'Cash'}</span>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-500 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Rate</th>
                      <th className="p-2.5 text-right">Tax (%)</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(selectedInvoice.orderItems || []).map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium">{it.name || it.product?.productName || 'Product'}</td>
                        <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                        <td className="p-2.5 text-right">₹{Number(it.netUnitPrice || 0).toLocaleString()}</td>
                        <td className="p-2.5 text-right">{it.taxPercent || 0}%</td>
                        <td className="p-2.5 text-right font-bold">₹{Number(it.total || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>₹{Number(selectedInvoice.subTotal || 0).toLocaleString()}</span>
                  </div>
                  {selectedInvoice.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-₹{Number(selectedInvoice.discountTotal).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedInvoice.taxTotal > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Tax Collected:</span>
                      <span>₹{Number(selectedInvoice.taxTotal).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                    <span>Grand Total:</span>
                    <span>₹{Number(selectedInvoice.grandTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs text-emerald-600">
                    <span>Amount Paid:</span>
                    <span>₹{Number(selectedInvoice.amountPaid || 0).toLocaleString()}</span>
                  </div>
                  {Number(selectedInvoice.returnedAmount || 0) > 0 && (
                    <div className="flex justify-between font-bold text-xs text-amber-600">
                      <span>Sales Return / Credit:</span>
                      <span>-₹{Number(selectedInvoice.returnedAmount).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xs text-rose-600 border-t border-dashed border-slate-200 dark:border-slate-800 pt-1">
                    <span>Net Balance Due:</span>
                    <span>₹{selectedInvoice.balanceDue !== undefined ? Number(selectedInvoice.balanceDue).toLocaleString() : Math.max(0, (Number(selectedInvoice.grandTotal || 0) - Number(selectedInvoice.amountPaid || 0) - Number(selectedInvoice.returnedAmount || 0))).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  handleSendCustomerStatementWhatsApp(customer, summary, customerDetails?.sales, false);
                  setShowInvoiceModal(false);
                }}
                className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Send All Invoices & Due Breakdown together on WhatsApp"
              >
                <WhatsAppIcon size={14} />
                <span>Send All Invoices Slip (सारा एक साथ)</span>
              </button>

              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={15} /> Print Slip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSendInvoiceWhatsApp(selectedInvoice, customer);
                    setShowInvoiceModal(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-200 dark:shadow-none transition-all cursor-pointer"
                  title="Send This Single Invoice Slip on WhatsApp"
                >
                  <WhatsAppIcon size={15} /> Send This Slip (सिंगल)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomerLedger = () => {
  const navigate = useNavigate();
  const { customerId: paramCustomerId } = useParams();
  const [searchParams] = useSearchParams();

  // Active customer id from route params or state
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const activeCustomerId = paramCustomerId || searchParams.get('customerId') || selectedCustomerId;

  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState('all'); // 'all', 'due', 'zero'

  // Selected customer details
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices', 'profile', 'history'
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All'); // 'All', 'Completed', 'Due', 'Paid', 'Cancelled'

  // Selected invoice modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Fetch all customers ledger summary from dynamic backend API
  const fetchLedgerSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers/ledger/summary');
      if (res.data?.success) {
        setCustomers(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching customer ledger summary:', error);
      // Fallback: fetch raw customers if summary endpoint has issue
      try {
        const fallbackRes = await api.get('/customers');
        if (fallbackRes.data?.success) {
          setCustomers(fallbackRes.data.data || []);
        }
      } catch (err) {
        toast.error('Failed to load customer ledger data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerSummary();
  }, []);

  // Fetch detailed data when a customer is selected
  const fetchCustomerDetails = async (customerId) => {
    if (!customerId) return;
    setDetailsLoading(true);
    try {
      const res = await api.get(`/customers/${customerId}/ledger`);
      if (res.data?.success) {
        setCustomerDetails(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching customer ledger details:', error);
      toast.error('Failed to load customer detailed history');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (activeCustomerId) {
      fetchCustomerDetails(activeCustomerId);
    }
  }, [activeCustomerId]);

  const handleViewCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    navigate(`/sales/customer-ledger/${customerId}`);
  };

  const handleBackToLedger = () => {
    setSelectedCustomerId(null);
    setCustomerDetails(null);
    navigate('/sales/customer-ledger');
  };

  // Open invoice view modal
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  // Export Customers Summary to CSV
  const handleExportCSV = () => {
    if (!customers.length) {
      toast.info('No customer data available to export');
      return;
    }
    const headers = ['Customer Code', 'Name / Business', 'Contact Person', 'Phone', 'Email', 'GSTIN', 'Total Invoices', 'Total Sales (₹)', 'Total Received (₹)', 'Outstanding Due (₹)', 'Status'];
    const rows = filteredCustomers.map(c => [
      `"${c.customerCode || ''}"`,
      `"${c.name || c.businessName || ''}"`,
      `"${c.contactPerson || c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.gstin || ''}"`,
      c.totalInvoices || 0,
      (c.totalSaleAmount || 0).toFixed(2),
      (c.totalPaid || 0).toFixed(2),
      (c.dueAmount || 0).toFixed(2),
      c.status ? 'Active' : 'Inactive'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Customer_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
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

  // 1. Send Single Sale Invoice Slip on WhatsApp to Customer
  const handleSendInvoiceWhatsApp = (inv, targetCustomer = null) => {
    const cust = targetCustomer || customerDetails?.customer || {};
    let rawPhone = cust?.phone || inv?.customerMobile || '';
    
    let phone = getCleanPhone(rawPhone);
    if (!phone) {
      const prompted = window.prompt(
        `Customer (${cust.name || 'Customer'}) phone number is missing.\nPlease enter 10-digit WhatsApp phone number:`,
        ''
      );
      if (prompted) {
        phone = getCleanPhone(prompted);
      }
    }

    const customerName = cust?.name || cust?.businessName || 'Valued Customer';
    const invNo = inv.invoiceNo || 'INV-BILL';
    const billDate = inv.saleDate || new Date().toISOString().slice(0, 10);
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
        .map((it, idx) => `  ${idx + 1}. *${it.name || it.product?.productName || 'Item'}* (Qty: ${it.quantity}) - ₹${(Number(it.netUnitPrice || 0) * Number(it.quantity || 1)).toFixed(2)}`)
        .join('\n');
      if (inv.orderItems.length > 5) {
        itemsText += `\n  ...and ${inv.orderItems.length - 5} more items`;
      }
    }

    const message = 
`🧾 *SALES INVOICE & BILL RECEIPT*
━━━━━━━━━━━━━━━━━━━━
🏢 *From:* Global ERP Services
👤 *To Customer:* ${customerName}
📱 *Contact:* ${rawPhone || phone || 'N/A'}
━━━━━━━━━━━━━━━━━━━━
📄 *Invoice No:* #${invNo}
📅 *Date:* ${billDate}
📌 *Payment Status:* *${paymentStatus.toUpperCase()}*

💰 *Total Bill:* ₹${grandTotal}
💵 *Amount Paid:* ₹${paid}
${retAmt > 0 ? `↩️ *Sales Return / Credit:* -₹${retAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` : ''}🔴 *NET BALANCE OUTSTANDING DUE:* *₹${balanceDue}*
${itemsText ? `\n📦 *Items Summary:*\n${itemsText}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
🏦 *Payment Information:*
Kindly clear any pending balance via UPI / Bank transfer at your earliest convenience.
_Thank you for your business!_`;

    const encoded = encodeURIComponent(message);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
    toast.success('WhatsApp invoice slip opened successfully!');
  };

  // 2. Send Entire Customer Ledger Due Statement / All Invoices on WhatsApp
  const handleSendCustomerStatementWhatsApp = (targetCustomer = null, targetSummary = null, targetSales = null, sendAll = false) => {
    const cust = targetCustomer || customerDetails?.customer || {};
    const summ = targetSummary || customerDetails?.summary || {};
    const bills = targetSales || customerDetails?.sales || [];

    let rawPhone = cust?.phone || '';
    let phone = getCleanPhone(rawPhone);
    if (!phone) {
      const prompted = window.prompt(
        `Customer (${cust.name || 'Customer'}) phone number is missing.\nPlease enter 10-digit WhatsApp phone number:`,
        ''
      );
      if (prompted) {
        phone = getCleanPhone(prompted);
      }
    }

    const customerName = cust?.name || cust?.businessName || 'Valued Customer';
    const totalSold = Number(summ.totalSold || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const totalPaid = Number(summ.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    const netBalance = Number(summ.netBalance !== undefined ? summ.netBalance : (cust.dueAmount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    // Pending bills
    const unpaidBills = bills.filter(b => {
      const due = Math.max(0, (Number(b.grandTotal || 0) - Number(b.amountPaid || 0)));
      return due > 0 || b.paymentStatus === 'Due' || b.paymentStatus === 'Pending' || b.paymentStatus === 'Partial';
    });

    const billsToList = sendAll ? bills : (unpaidBills.length > 0 ? unpaidBills : bills);
    const listTitle = sendAll
      ? `📄 *ALL INVOICES BREAKDOWN (${bills.length} BILLS):*`
      : (unpaidBills.length > 0
          ? `⏳ *PENDING / DUE INVOICES (${unpaidBills.length}):*`
          : `📄 *RECENT INVOICES (${bills.length}):*`);

    let pendingListText = '';
    if (billsToList.length > 0) {
      pendingListText = billsToList
        .slice(0, 15)
        .map((b, idx) => {
          const invNo = b.invoiceNo || `INV-${idx+1}`;
          const gTot = Number(b.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
          const pd = Number(b.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
          const due = Math.max(0, (Number(b.grandTotal || 0) - Number(b.amountPaid || 0))).toLocaleString('en-IN', { minimumFractionDigits: 2 });
          const dt = b.saleDate || (b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'N/A');
          return `  ${idx + 1}. *#${invNo}* (${dt})\n     Bill: ₹${gTot} | Paid: ₹${pd} | *Due: ₹${due}*`;
        })
        .join('\n');
      if (billsToList.length > 15) {
        pendingListText += `\n  ...and ${billsToList.length - 15} more invoices`;
      }
    }

    const message =
`📋 *CUSTOMER ACCOUNT STATEMENT & DUE INVOICES SLIP*
━━━━━━━━━━━━━━━━━━━━
🏢 *From:* Global ERP Services
👤 *Customer:* ${customerName}
📱 *Phone:* ${rawPhone || phone || 'N/A'}
🏛 *GSTIN:* ${cust?.gstin || 'Unregistered'}
━━━━━━━━━━━━━━━━━━━━
📊 *ACCOUNT SUMMARY:*
• Total Invoices: ${summ.totalInvoices || bills.length}
• Total Sales Billed: ₹${totalSold}
• Total Paid / Settled: ₹${totalPaid}
🔴 *NET OUTSTANDING BALANCE DUE: ₹${netBalance}*
━━━━━━━━━━━━━━━━━━━━
${pendingListText ? `${listTitle}\n${pendingListText}\n━━━━━━━━━━━━━━━━━━━━\n` : ''}
🏦 *Payment Request:*
Please verify this statement and arrange payment for the outstanding dues. If already settled, kindly share the payment receipt.
_Thank you for your business & partnership!_`;

    const encoded = encodeURIComponent(message);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, '_blank');
    toast.success('WhatsApp all-invoices slip opened successfully!');
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (c.name || '').toLowerCase().includes(q) ||
        (c.businessName || '').toLowerCase().includes(q) ||
        (c.customerCode || '').toLowerCase().includes(q) ||
        (c.contactPerson || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.gstin || '').toLowerCase().includes(q);

      const due = c.dueAmount !== undefined ? c.dueAmount : 0;
      let matchesDue = true;
      if (filterDueOnly === 'due') {
        matchesDue = due > 0;
      } else if (filterDueOnly === 'zero') {
        matchesDue = due <= 0;
      }

      return matchesSearch && matchesDue;
    });
  }, [customers, searchTerm, filterDueOnly]);

  // Overall aggregate metrics
  const aggregateMetrics = useMemo(() => {
    const totalCustomers = customers.length;
    let totalSales = 0;
    let totalPaid = 0;
    let totalDue = 0;

    customers.forEach(c => {
      totalSales += Number(c.totalSaleAmount) || 0;
      totalPaid += Number(c.totalPaid) || 0;
      const due = Number(c.dueAmount) || 0;
      totalDue += due;
    });

    return { totalCustomers, totalSales, totalPaid, totalDue };
  }, [customers]);

  // Filtered invoices for detailed view
  const filteredInvoices = useMemo(() => {
    if (!customerDetails?.sales) return [];
    if (invoiceStatusFilter === 'All') return customerDetails.sales;
    if (invoiceStatusFilter === 'Completed') {
      return customerDetails.sales.filter(s => s.saleStatus === 'Completed');
    }
    if (invoiceStatusFilter === 'Due') {
      return customerDetails.sales.filter(s => s.paymentStatus !== 'Paid' && s.saleStatus !== 'Cancelled');
    }
    if (invoiceStatusFilter === 'Paid') {
      return customerDetails.sales.filter(s => s.paymentStatus === 'Paid');
    }
    if (invoiceStatusFilter === 'Cancelled') {
      return customerDetails.sales.filter(s => s.saleStatus === 'Cancelled');
    }
    return customerDetails.sales;
  }, [customerDetails, invoiceStatusFilter]);

  // If a customer is selected (via route /sales/customer-ledger/:customerId or state), render full-page detail view
  if (activeCustomerId) {
    return (
      <CustomerLedgerDetailPage
        customerDetails={customerDetails}
        detailsLoading={detailsLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        invoiceStatusFilter={invoiceStatusFilter}
        setInvoiceStatusFilter={setInvoiceStatusFilter}
        filteredInvoices={filteredInvoices}
        handleBackToLedger={handleBackToLedger}
        fetchCustomerDetails={fetchCustomerDetails}
        activeCustomerId={activeCustomerId}
        handleSendInvoiceWhatsApp={handleSendInvoiceWhatsApp}
        handleSendCustomerStatementWhatsApp={handleSendCustomerStatementWhatsApp}
        handleViewInvoice={handleViewInvoice}
        navigate={navigate}
        showInvoiceModal={showInvoiceModal}
        setShowInvoiceModal={setShowInvoiceModal}
        selectedInvoice={selectedInvoice}
      />
    );
  }

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER SECTION
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 dark:shadow-none shrink-0">
              <User size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                Customer Ledger & Receivables Hub
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold">
                  {filteredCustomers.length} Parties
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage customer statements, sales billing, payment collection records, and outstanding dues.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 self-stretch sm:self-auto shrink-0 flex-nowrap">
          <button
            type="button"
            onClick={fetchLedgerSummary}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap cursor-pointer"
            title="Refresh Ledger Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            title="Export CSV"
          >
            <Download size={16} className="text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/sales/add-sale')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 dark:shadow-none hover:shadow-lg transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            title="Create Sale Invoice"
          >
            <Plus size={18} />
            <span>Add Sale Invoice</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP SUMMARY METRIC CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Customers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Customers</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{aggregateMetrics.totalCustomers}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active in Directory</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>

        {/* Card 2: Total Sales */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Billed (Sales)</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Boxes size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">₹{aggregateMetrics.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1 font-semibold">
              <Receipt size={13} /> Across all sales invoices
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
        </div>

        {/* Card 3: Total Collected */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Received</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">₹{aggregateMetrics.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              Cleared payments & settlements
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        </div>

        {/* Card 4: Outstanding Due */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-rose-200/80 dark:border-rose-900/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group bg-gradient-to-br from-white via-rose-50/20 to-rose-50/40 dark:from-slate-900 dark:via-rose-950/20 dark:to-rose-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-300">Total Balance Receivable</span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">₹{aggregateMetrics.totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold mt-1 flex items-center gap-1">
              <AlertTriangle size={13} /> Outstanding from customers
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SEARCH, FILTERS & CONTROLS
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Customer Name, Firm, Code, Phone, or GSTIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs bg-slate-200/60 dark:bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setFilterDueOnly('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterDueOnly === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Customers ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterDueOnly('due')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filterDueOnly === 'due'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200/60 dark:border-rose-900/60'
              }`}
            >
              <AlertTriangle size={13} />
              With Outstanding Dues
            </button>
            <button
              type="button"
              onClick={() => setFilterDueOnly('zero')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterDueOnly === 'zero'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-900/60'
              }`}
            >
              Fully Cleared (₹0 Due)
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN CUSTOMERS LEDGER TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">GSTIN & PAN</th>
                <th className="py-3.5 px-4 text-center">Invoices</th>
                <th className="py-3.5 px-4 text-right">Total Sales Billed</th>
                <th className="py-3.5 px-4 text-right">Total Received</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw size={24} className="animate-spin text-emerald-600" />
                      <span className="text-sm font-semibold">Loading customer ledger directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <User size={36} className="text-slate-300 dark:text-slate-600" />
                      <span className="text-base font-bold text-slate-600 dark:text-slate-300">No Customers Found</span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchTerm ? 'No customer matches your search query.' : 'No customers have been registered yet.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/customers/customer-master')}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <Plus size={15} /> Create First Customer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const due = Number(c.dueAmount) || 0;
                  const isSelected = selectedCustomerId === c._id;

                  return (
                    <tr
                      key={c._id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''}`}
                    >
                      {/* Customer Column */}
                      <td className="py-3.5 px-4">
                        <div
                          className="font-bold text-slate-800 dark:text-slate-100 text-sm hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                          onClick={() => handleViewCustomer(c._id)}
                        >
                          {c.name || c.businessName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {c.customerCode || 'CUST-N/A'}
                          </span>
                          {c.type && (
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold">
                              {c.type}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-200 font-semibold">{c.contactPerson || c.name || '—'}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          {c.phone && <span>📞 {c.phone}</span>}
                          {c.email && <span className="truncate max-w-[140px]" title={c.email}>✉️ {c.email}</span>}
                        </div>
                      </td>

                      {/* GSTIN & PAN */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {c.gstin || 'Unregistered'}
                        </div>
                        {c.pan && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            PAN: {c.pan}
                          </div>
                        )}
                      </td>

                      {/* Total Invoices */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                          {c.totalInvoices || 0} Bills
                        </span>
                      </td>

                      {/* Total Sales Billed */}
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">
                        ₹{(c.totalSaleAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Total Paid / Received */}
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                        ₹{(c.totalPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4 text-right font-bold">
                        {due > 0 ? (
                          <span className="text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-900/60 inline-block">
                            ₹{due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/60 inline-block font-semibold">
                            ₹0.00
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {c.status !== false ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions - Only View Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleViewCustomer(c._id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                          title="View Customer Details & Ledger"
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
    </div>
  );
};

export default CustomerLedger;
