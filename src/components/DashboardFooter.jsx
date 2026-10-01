import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Hotel, UtensilsCrossed, Stethoscope, HeartPulse, Factory, Store, GraduationCap, Settings2, HelpCircle, FileText, MonitorPlay, Sparkles, MonitorSmartphone, DownloadCloud, MessageCircleQuestion } from 'lucide-react';

export const IndustrySolutions = () => {
  const industries = [
    { icon: Building, title: 'Corporate', desc: 'Manage all business operations effectively', color: 'text-blue-500' },
    { icon: Hotel, title: 'Hotel Management', desc: 'Rooms, Booking, Billing, Services', color: 'text-yellow-500' },
    { icon: UtensilsCrossed, title: 'Restaurant / Cafe', desc: 'POS, Kitchen, Billing, Inventory', color: 'text-orange-500' },
    { icon: Stethoscope, title: 'Hospital', desc: 'OPD, IPD, Billing, Pharmacy, Accounts', color: 'text-red-500' },
    { icon: HeartPulse, title: 'Medical Store', desc: 'Inventory, Sales, Purchase, Expiry', color: 'text-green-500' },
    { icon: Factory, title: 'Manufacturing', desc: 'Production, BOM, Stock, Costing', color: 'text-indigo-500' },
    { icon: Store, title: 'Retail Store', desc: 'POS, Inventory, Sales, Customers', color: 'text-pink-500' },
    { icon: GraduationCap, title: 'School / College', desc: 'Students, Fees, Exams, Staff', color: 'text-cyan-500' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-lg shadow-sm p-4 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-sm font-bold text-blue-900 dark:text-slate-100 tracking-wide uppercase">Industry Solutions</div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500">(Use ERP for Any Industry)</div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
        {industries.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center group cursor-pointer">
            <item.icon size={28} className={`${item.color} mb-2 group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
            <div className="text-[11px] font-bold text-gray-800 dark:text-slate-200 mb-1">{item.title}</div>
            <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">{item.desc}</div>
          </div>
        ))}
        
        {/* Customize */}
        <div className="flex flex-col items-center text-center group cursor-pointer border-l border-gray-100 dark:border-slate-800 pl-4">
          <Settings2 size={28} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          <div className="text-[11px] font-bold text-gray-800 dark:text-slate-200 mb-1">Customize</div>
          <div className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Create your own workflow</div>
        </div>
      </div>
    </div>
  );
};

export const ShortcutKeys = () => {
  const navigate = useNavigate();
  const shortcuts = [
    { key: 'F2', label: 'Sale Entry', to: '/sales/add-sale' },
    { key: 'F3', label: 'Purchase Entry', to: '/purchases/add-purchase' },
    { key: 'F4', label: 'Receipt Entry', to: '/receipt/new' },
    { key: 'F5', label: 'Payment Entry', to: '/payment/new' },
    { key: 'F6', label: 'Bank Receipt', to: '/bank-receipt/new' },
    { key: 'F7', label: 'Bank Payment', to: '/bank-payment/new' },
    { key: 'F8', label: 'Journal Entry', to: '/journal/new' },
    { key: 'F9', label: 'Stock View', to: '/products/product-list' },
    { key: 'F10', label: 'Stock Entry', to: '/stock-entry/new' },
    { key: 'F11', label: 'Stock Transfer', to: '/stock-transfer/new' },
    { key: 'Ctrl+L', label: 'Ledger', to: '/reports/accounts/ledger-voucher' },
    { key: 'Ctrl+O', label: 'Outstanding', to: '/reports/mis/kpi-reports' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-lg shadow-sm p-4 transition-colors">
      <div className="text-sm font-bold text-blue-900 dark:text-slate-100 tracking-wide uppercase mb-4">Shortcut Keys</div>
      <div className="flex flex-wrap gap-2 lg:justify-between">
        {shortcuts.map((item, idx) => (
          <div 
            key={idx} 
            onClick={() => navigate(item.to)}
            className="flex flex-col items-center justify-center flex-1 min-w-[85px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2 group cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
          >
             <div className="text-blue-600 dark:text-blue-450 font-bold text-[13px] mb-1">{item.key}</div>
             <div className="text-[10px] font-semibold text-gray-700 dark:text-slate-300 text-center whitespace-nowrap">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HelpAndSupport = () => {
  const navigate = useNavigate();
  const links = [
    { icon: FileText, text: 'User Manual', shortcut: 'F1', to: '/setup/help-support' },
    { icon: MonitorPlay, text: 'Video Tutorial', to: '/setup/help-support' },
    { icon: Sparkles, text: 'What\'s New', to: '/coming-soon' },
    { icon: MonitorSmartphone, text: 'Remote Support', to: '/setup/help-support' },
    { icon: DownloadCloud, text: 'Check for Update', to: '/coming-soon' },
    { icon: MessageCircleQuestion, text: 'Request a Feature', to: '/setup/help-support' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-lg shadow-sm p-4 h-full transition-colors">
      <div className="text-sm font-bold text-blue-900 dark:text-slate-100 tracking-wide uppercase mb-4 text-center">Help & Support</div>
      <ul className="space-y-3 mb-4">
        {links.map((link, idx) => (
          <li 
            key={idx} 
            onClick={() => navigate(link.to || '/coming-soon')}
            className="flex items-center justify-between text-[11px] text-gray-700 dark:text-slate-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          >
            <div className="flex items-center gap-2 font-medium">
              <link.icon size={14} className="text-blue-500" />
              {link.text}
            </div>
            {link.shortcut && <span className="text-blue-500 dark:text-blue-450 font-bold">{link.shortcut}</span>}
          </li>
        ))}
      </ul>
      <button 
        onClick={() => navigate('/setup/help-support')}
        className="w-full bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 text-[11px] font-semibold py-2 rounded-md border border-blue-200 dark:border-slate-700 transition-colors"
      >
        Contact Support
      </button>
    </div>
  );
};
