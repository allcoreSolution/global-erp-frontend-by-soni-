import React, { useState, useEffect } from 'react';
import { Package, Download, Printer, RefreshCw, Search, AlertTriangle, TrendingUp, BookOpen, Layers, Home, BarChart2, Sliders, Move, Trash2, Calendar, FolderMinus, Percent, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';

const TABS = [
  { key: 'summary', label: 'Stock Summary', icon: Package },
  { key: 'current', label: 'Current Stock', icon: Layers },
  { key: 'valuation', label: 'Valuation', icon: Percent },
  { key: 'ledger', label: 'Stock Ledger', icon: BookOpen },
  { key: 'movement', label: 'Movement', icon: TrendingUp },
  { key: 'warehouse', label: 'Warehouse-wise', icon: Home },
  { key: 'lowstock', label: 'Low Stock', icon: AlertTriangle },
  { key: 'overstock', label: 'Overstock', icon: BarChart2 },
  { key: 'outofstock', label: 'Out of Stock', icon: FolderMinus },
  { key: 'opening', label: 'Opening Stock', icon: Calendar },
  { key: 'closing', label: 'Closing Stock', icon: FolderMinus },
  { key: 'adjustment', label: 'Adjustments', icon: Sliders },
  { key: 'transfer', label: 'Transfers', icon: Move },
  { key: 'damaged', label: 'Damaged', icon: Trash2 },
];

const fmt = (n) => `₹ ${(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return d || '-'; } };

const exportCSV = (headers, rows, filename) => {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c ?? ''}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename + '.csv'; a.click();
  URL.revokeObjectURL(url);
};

const Loader = () => <tr><td colSpan="20" className="p-6 text-center text-gray-400 italic text-sm">Loading data...</td></tr>;
const Empty = () => <tr><td colSpan="20" className="p-6 text-center text-gray-400 italic text-sm">No records found.</td></tr>;

const TH = ({ children, right }) => <th className={`p-3 text-xs font-bold uppercase text-slate-600 whitespace-nowrap ${right ? 'text-right' : ''}`}>{children}</th>;
const TD = ({ children, right, bold, color }) => <td className={`p-3 text-xs ${right ? 'text-right' : ''} ${bold ? 'font-bold' : ''} ${color || 'text-slate-700'}`}>{children}</td>;

export default function StockReport() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('summary');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [search, setSearch] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(today);

  const API_MAP = {
    summary: '/reports/stock/summary',
    current: '/reports/stock/current-stock',
    valuation: '/reports/stock/valuation',
    ledger: '/reports/stock/ledger',
    movement: '/reports/stock/movement',
    warehouse: '/reports/stock/warehouse-wise',
    lowstock: '/reports/stock/low-stock',
    overstock: '/reports/stock/overstock',
    outofstock: '/reports/stock/out-of-stock',
    opening: '/reports/stock/opening-stock',
    closing: '/reports/stock/closing-stock',
    adjustment: '/reports/stock/adjustment',
    transfer: '/reports/stock/transfer',
    damaged: '/reports/stock/damaged',
  };

  const fetchTab = async (key) => {
    if (data[key]) return;
    setLoading(p => ({ ...p, [key]: true }));
    try {
      const res = await api.get(API_MAP[key]);
      if (res.data?.success) {
        const raw = res.data.data;
        setData(p => ({ ...p, [key]: key === 'summary' ? raw : (key === 'closing' ? raw : raw) }));
      }
    } catch (e) {
      console.error(e);
      setData(p => ({ ...p, [key]: [] }));
    } finally {
      setLoading(p => ({ ...p, [key]: false }));
    }
  };

  useEffect(() => { fetchTab(tab); }, [tab]);

  const refresh = () => {
    setData(p => ({ ...p, [tab]: undefined }));
    setTimeout(() => fetchTab(tab), 100);
  };

  const rows = data[tab];
  const isLoading = loading[tab];

  const filterBySearch = (arr, fields) => {
    if (!search.trim()) return arr || [];
    return (arr || []).filter(r => fields.some(f => String(r[f] || '').toLowerCase().includes(search.toLowerCase())));
  };

  const filterByDate = (arr, field) => {
    return (arr || []).filter(r => {
      const d = new Date(r[field]).toISOString().split('T')[0];
      return d >= fromDate && d <= toDate;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-screen font-sans">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={16} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-indigo-600" size={22} /> Stock Reports
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Complete inventory reports — real-time data from database</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50">
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700">
            <Printer size={13} /> Print
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-100 no-scrollbar">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-4">
        {renderTab(tab, rows, isLoading, search, setSearch, fromDate, setFromDate, toDate, setToDate, filterBySearch, filterByDate, fmt, fmtDate, exportCSV, Loader, Empty, TH, TD)}
      </div>
    </div>
  );
}

function renderTab(tab, rows, isLoading, search, setSearch, fromDate, setFromDate, toDate, setToDate, filterBySearch, filterByDate, fmt, fmtDate, exportCSV, Loader, Empty, TH, TD) {

  const SearchBar = ({ fields, onExport }) => (
    <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
      </div>
      {onExport && (
        <button onClick={onExport} className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-white">
          <Download size={13} /> Export CSV
        </button>
      )}
    </div>
  );

  const DateBar = ({ onExport }) => (
    <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
      <span className="text-xs font-semibold text-slate-600">From:</span>
      <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
      <span className="text-xs font-semibold text-slate-600">To:</span>
      <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
      {onExport && (
        <button onClick={onExport} className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-white ml-auto">
          <Download size={13} /> Export CSV
        </button>
      )}
    </div>
  );

  const Table = ({ children }) => (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {children}
        </table>
      </div>
    </div>
  );

  // ── SUMMARY ──
  if (tab === 'summary') {
    const items = rows?.items || [];
    const summary = rows?.summary || {};
    const filtered = filterBySearch(items, ['name', 'sku', 'category']);
    const totalVal = filtered.reduce((a, c) => a + (c.stockValue || 0), 0);
    const totalQty = filtered.reduce((a, c) => a + (c.currentStock || 0), 0);
    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Products', val: summary.totalProducts || 0, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
            { label: 'Total Units', val: (totalQty).toLocaleString(), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { label: 'Stock Value', val: fmt(totalVal), color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { label: 'Low Stock Items', val: summary.lowStockItemsCount || 0, color: 'bg-rose-50 text-rose-700 border-rose-200' },
          ].map((s, i) => (
            <div key={i} className={`p-4 rounded-xl border ${s.color}`}>
              <div className="text-[10px] font-bold uppercase opacity-70">{s.label}</div>
              <div className="text-xl font-extrabold mt-1">{s.val}</div>
            </div>
          ))}
        </div>
        <SearchBar fields={['name', 'sku', 'category']} onExport={() => exportCSV(['Category', 'Item Name', 'SKU', 'Qty', 'Cost Rate', 'Stock Value'], filtered.map(r => [r.category, r.name, r.sku, r.currentStock, r.purchasePrice, r.stockValue]), 'stock_summary')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Category</TH><TH>Item Name</TH><TH>SKU</TH><TH right>Qty</TH><TH right>Cost Rate</TH><TH right>Stock Value</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <TD>{r.category}</TD><TD bold>{r.name}<div className="text-[10px] text-slate-400">{r.sku}</div></TD><TD>{r.sku}</TD>
                <TD right bold>{(r.currentStock || 0).toLocaleString()}</TD>
                <TD right>{(r.purchasePrice || 0).toLocaleString()}</TD>
                <TD right bold color="text-indigo-700">{fmt(r.stockValue)}</TD>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && <tfoot className="bg-slate-100 border-t-2 border-slate-200"><tr><td colSpan="5" className="p-3 text-right text-xs font-bold text-slate-700 uppercase">Grand Total</td><td className="p-3 text-right text-xs font-extrabold text-indigo-800">{fmt(totalVal)}</td></tr></tfoot>}
        </Table>
      </>
    );
  }

  // ── CURRENT STOCK ──
  if (tab === 'current') {
    const filtered = filterBySearch(rows, ['name', 'sku']);
    return (
      <>
        <SearchBar onExport={() => exportCSV(['SKU', 'Name', 'Location', 'On Hand', 'Committed', 'Available'], filtered.map(r => [r.sku, r.name, r.location, r.onHand, r.committed, r.available]), 'current_stock')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>SKU</TH><TH>Item Name</TH><TH>Location</TH><TH right>On Hand</TH><TH right>Committed</TH><TH right>Available</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <TD color="text-emerald-700 font-mono">{r.sku}</TD><TD bold>{r.name}</TD><TD>{r.location}</TD>
                <TD right bold>{(r.onHand || 0).toLocaleString()}</TD>
                <TD right color="text-rose-600">{(r.committed || 0).toLocaleString()}</TD>
                <TD right bold color="text-emerald-700">{(r.available || 0).toLocaleString()}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── VALUATION ──
  if (tab === 'valuation') {
    const items = rows?.items || [];
    const totalCost = rows?.totalCostValue || 0;
    const filtered = filterBySearch(items, ['name', 'sku']);
    return (
      <>
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-sm font-bold text-slate-700">Total Inventory Value (Cost): <span className="text-indigo-700">{fmt(totalCost)}</span></span>
          <button onClick={() => exportCSV(['SKU', 'Name', 'Qty', 'Cost Rate', 'Cost Value', 'Retail Rate', 'Retail Value'], filtered.map(r => [r.sku, r.name, r.qty, r.costRate, r.costValue, r.retailRate, r.retailValue]), 'stock_valuation')}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-white">
            <Download size={13} /> Export CSV
          </button>
        </div>
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>SKU</TH><TH>Item Name</TH><TH right>Qty</TH><TH right>Cost Rate</TH><TH right>Cost Value</TH><TH right>Retail Rate</TH><TH right>Retail Value</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <TD color="text-slate-500 font-mono">{r.sku}</TD><TD bold>{r.name}</TD>
                <TD right>{(r.qty || 0).toLocaleString()}</TD>
                <TD right color="text-indigo-600">{(r.costRate || 0).toLocaleString()}</TD>
                <TD right bold color="text-slate-800">{fmt(r.costValue)}</TD>
                <TD right>{(r.retailRate || 0).toLocaleString()}</TD>
                <TD right bold color="text-emerald-700">{fmt(r.retailValue)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── STOCK LEDGER ──
  if (tab === 'ledger') {
    const filtered = filterByDate(filterBySearch(rows, ['productName', 'sku']), 'date');
    return (
      <>
        <DateBar onExport={() => exportCSV(['Date', 'Product', 'SKU', 'Type', 'In', 'Out', 'Balance'], filtered.map(r => [fmtDate(r.date), r.productName, r.sku, r.type, r.in, r.out, r.balance]), 'stock_ledger')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Date</TH><TH>Product</TH><TH>SKU</TH><TH>Type</TH><TH right>In</TH><TH right>Out</TH><TH right>Balance</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <TD color="text-slate-500">{fmtDate(r.date)}</TD>
                <TD bold>{r.productName}</TD>
                <TD color="text-slate-500 font-mono">{r.sku}</TD>
                <TD>{r.type}</TD>
                <TD right color="text-emerald-700">{r.in > 0 ? r.in.toLocaleString() : '-'}</TD>
                <TD right color="text-rose-600">{r.out > 0 ? r.out.toLocaleString() : '-'}</TD>
                <TD right bold>{(r.balance || 0).toLocaleString()}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── MOVEMENT ──
  if (tab === 'movement') {
    const filtered = filterByDate(filterBySearch(rows, ['productName', 'sku']), 'date');
    return (
      <>
        <DateBar onExport={() => exportCSV(['Date', 'Product', 'SKU', 'Movement Type', 'Qty', 'Reference'], filtered.map(r => [fmtDate(r.date), r.productName, r.sku, r.movementType, r.qty, r.reference]), 'stock_movement')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Date</TH><TH>Product</TH><TH>SKU</TH><TH>Movement Type</TH><TH right>Qty</TH><TH>Reference</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <TD color="text-slate-500">{fmtDate(r.date)}</TD>
                <TD bold>{r.productName}</TD>
                <TD color="text-slate-500 font-mono">{r.sku}</TD>
                <TD>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.movementType === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {r.movementType}
                  </span>
                </TD>
                <TD right bold>{(r.qty || 0).toLocaleString()}</TD>
                <TD color="text-slate-500">{r.reference || '-'}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── WAREHOUSE-WISE ──
  if (tab === 'warehouse') {
    const filtered = filterBySearch(rows, ['warehouse', 'productName', 'sku']);
    return (
      <>
        <SearchBar onExport={() => exportCSV(['Warehouse', 'Product', 'SKU', 'Qty', 'Value'], filtered.map(r => [r.warehouse, r.productName, r.sku, r.qty, r.value]), 'warehouse_wise_stock')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Warehouse</TH><TH>Product</TH><TH>SKU</TH><TH right>Qty</TH><TH right>Value</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <TD bold color="text-indigo-700">{r.warehouse}</TD>
                <TD>{r.productName}</TD>
                <TD color="text-slate-500 font-mono">{r.sku}</TD>
                <TD right bold>{(r.qty || 0).toLocaleString()}</TD>
                <TD right bold color="text-emerald-700">{fmt(r.value)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── LOW STOCK ──
  if (tab === 'lowstock') {
    const filtered = filterBySearch(rows, ['name', 'sku', 'category']);
    return (
      <>
        <SearchBar onExport={() => exportCSV(['Product', 'SKU', 'Category', 'Current Stock', 'Min Level', 'Shortage'], filtered.map(r => [r.name, r.sku, r.category, r.currentStock, r.minStock, r.shortage]), 'low_stock')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Product</TH><TH>SKU</TH><TH>Category</TH><TH right>Current Stock</TH><TH right>Min Level</TH><TH right>Shortage</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-rose-50/40">
                <TD bold>{r.name}</TD>
                <TD color="text-slate-500 font-mono">{r.sku}</TD>
                <TD>{r.category}</TD>
                <TD right bold color="text-rose-600">{(r.currentStock || 0).toLocaleString()}</TD>
                <TD right>{(r.minStock || 0).toLocaleString()}</TD>
                <TD right bold color="text-rose-700">{(r.shortage || 0).toLocaleString()}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── OVERSTOCK ──
  if (tab === 'overstock') {
    const filtered = filterBySearch(rows, ['name', 'sku', 'category']);
    return (
      <>
        <SearchBar onExport={() => exportCSV(['Product', 'SKU', 'Category', 'Current Stock', 'Max Level', 'Excess'], filtered.map(r => [r.name, r.sku, r.category, r.currentStock, r.maxStock, r.excess]), 'overstock')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Product</TH><TH>SKU</TH><TH>Category</TH><TH right>Current Stock</TH><TH right>Max Level</TH><TH right>Excess</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-amber-50/40">
                <TD bold>{r.name}</TD>
                <TD color="text-slate-500 font-mono">{r.sku}</TD>
                <TD>{r.category}</TD>
                <TD right bold color="text-amber-600">{(r.currentStock || 0).toLocaleString()}</TD>
                <TD right>{(r.maxStock || 0).toLocaleString()}</TD>
                <TD right bold color="text-amber-700">{(r.excess || 0).toLocaleString()}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── OUT OF STOCK ──
  if (tab === 'outofstock') {
    const filtered = filterBySearch(rows, ['name', 'sku', 'category']);
    return (
      <>
        <SearchBar onExport={() => exportCSV(['Product', 'SKU', 'Category', 'Last Stock Date'], filtered.map(r => [r.name, r.sku, r.category, fmtDate(r.lastStockDate)]), 'out_of_stock')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Product</TH><TH>SKU</TH><TH>Category</TH><TH>Last Stock Date</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <TD bold>{r.name}</TD>
                <TD color="text-slate-500 font-mono">{r.sku}</TD>
                <TD>{r.category}</TD>
                <TD color="text-rose-600">{fmtDate(r.lastStockDate)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── OPENING STOCK ──
  if (tab === 'opening') {
    const filtered = filterBySearch(rows, ['name', 'sku']);
    return (
      <>
        <SearchBar onExport={() => exportCSV(['Product', 'SKU', 'Opening Qty', 'Opening Value'], filtered.map(r => [r.name, r.sku, r.openingQty, r.openingValue]), 'opening_stock')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Product</TH><TH>SKU</TH><TH right>Opening Qty</TH><TH right>Opening Value</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <TD bold>{r.name}</TD>
                <TD color="text-slate-500 font-mono">{r.sku}</TD>
                <TD right>{(r.openingQty || 0).toLocaleString()}</TD>
                <TD right bold color="text-indigo-700">{fmt(r.openingValue)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── CLOSING STOCK ──
  if (tab === 'closing') {
    const items = Array.isArray(rows) ? rows : (rows?.items || []);
    const filtered = filterBySearch(items, ['name', 'sku']);
    return (
      <>
        <SearchBar onExport={() => exportCSV(['Product', 'SKU', 'Closing Qty', 'Closing Value'], filtered.map(r => [r.name, r.sku, r.closingQty, r.closingValue]), 'closing_stock')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Product</TH><TH>SKU</TH><TH right>Closing Qty</TH><TH right>Closing Value</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <TD bold>{r.name}</TD>
                <TD color="text-slate-500 font-mono">{r.sku}</TD>
                <TD right>{(r.closingQty || 0).toLocaleString()}</TD>
                <TD right bold color="text-emerald-700">{fmt(r.closingValue)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── ADJUSTMENTS ──
  if (tab === 'adjustment') {
    const filtered = filterByDate(filterBySearch(rows, ['productName', 'sku', 'reason']), 'date');
    return (
      <>
        <DateBar onExport={() => exportCSV(['Date', 'Product', 'SKU', 'Type', 'Qty', 'Reason'], filtered.map(r => [fmtDate(r.date), r.productName, r.sku, r.adjustmentType, r.qty, r.reason]), 'stock_adjustments')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Date</TH><TH>Product</TH><TH>SKU</TH><TH>Type</TH><TH right>Qty</TH><TH>Reason</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <TD color="text-slate-500">{fmtDate(r.date)}</TD>
                <TD bold>{r.productName}</TD>
                <TD color="text-slate-500 font-mono">{r.sku}</TD>
                <TD>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.adjustmentType === 'Addition' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {r.adjustmentType}
                  </span>
                </TD>
                <TD right bold>{(r.qty || 0).toLocaleString()}</TD>
                <TD color="text-slate-500">{r.reason || '-'}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── TRANSFERS ──
  if (tab === 'transfer') {
    const filtered = filterByDate(filterBySearch(rows, ['productName', 'sku', 'fromWarehouse', 'toWarehouse']), 'date');
    return (
      <>
        <DateBar onExport={() => exportCSV(['Date', 'Product', 'SKU', 'From', 'To', 'Qty'], filtered.map(r => [fmtDate(r.date), r.productName, r.sku, r.fromWarehouse, r.toWarehouse, r.qty]), 'stock_transfers')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Date</TH><TH>Product</TH><TH>SKU</TH><TH>From</TH><TH>To</TH><TH right>Qty</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <TD color="text-slate-500">{fmtDate(r.date)}</TD>
                <TD bold>{r.productName}</TD>
                <TD color="text-slate-500 font-mono">{r.sku}</TD>
                <TD color="text-rose-600">{r.fromWarehouse}</TD>
                <TD color="text-emerald-600">{r.toWarehouse}</TD>
                <TD right bold>{(r.qty || 0).toLocaleString()}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── DAMAGED ──
  if (tab === 'damaged') {
    const filtered = filterByDate(filterBySearch(rows, ['productName', 'sku', 'reason']), 'date');
    return (
      <>
        <DateBar onExport={() => exportCSV(['Date', 'Product', 'SKU', 'Qty Damaged', 'Reason', 'Value Lost'], filtered.map(r => [fmtDate(r.date), r.productName, r.sku, r.qtyDamaged, r.reason, r.valueLost]), 'damaged_stock')} />
        <Table>
          <thead className="bg-slate-50 border-b border-slate-200"><tr><TH>Date</TH><TH>Product</TH><TH>SKU</TH><TH right>Qty Damaged</TH><TH>Reason</TH><TH right>Value Lost</TH></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <Loader /> : filtered.length === 0 ? <Empty /> : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-rose-50/30">
                <TD color="text-slate-500">{fmtDate(r.date)}</TD>
                <TD bold>{r.productName}</TD>
                <TD color="text-slate-500 font-mono">{r.sku}</TD>
                <TD right bold color="text-rose-600">{(r.qtyDamaged || 0).toLocaleString()}</TD>
                <TD color="text-slate-500">{r.reason || '-'}</TD>
                <TD right bold color="text-rose-700">{fmt(r.valueLost)}</TD>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  // ── DEFAULT FALLBACK ──
  return (
    <div className="p-8 text-center text-gray-400 italic text-sm">
      Select a tab to view stock data.
    </div>
  );
}
