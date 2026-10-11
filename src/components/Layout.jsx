import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { ShoppingCart, FileBox, Receipt, CreditCard, Banknote, ShieldAlert } from 'lucide-react';
import Sidebar from './Sidebar';
import { TopHeader } from './Header';
import { usePermissions } from '../utils/permissionUtils';

const Layout = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const { canRoute, isSuperAdmin, isAdmin } = usePermissions();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(true);
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  const [config, setConfig] = useState({
    company: localStorage.getItem('erp_company') || localStorage.getItem('companyName') || 'ALLCORE SOLUTION PVT. LTD.',
    user: localStorage.getItem('userName') || localStorage.getItem('erp_user') || 'ADMIN',
    fy: localStorage.getItem('erp_fy') || '2024-2025'
  });

  useEffect(() => {
    const handleConfigChange = () => {
      setConfig({
        company: localStorage.getItem('erp_company') || localStorage.getItem('companyName') || 'ALLCORE SOLUTION PVT. LTD.',
        user: localStorage.getItem('userName') || localStorage.getItem('erp_user') || 'ADMIN',
        fy: localStorage.getItem('erp_fy') || '2024-2025'
      });
    };
    window.addEventListener('erp_config_changed', handleConfigChange);
    return () => window.removeEventListener('erp_config_changed', handleConfigChange);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-slate-100 font-sans relative transition-colors">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isDesktopSidebarVisible ? 'lg:relative lg:translate-x-0' : 'lg:absolute lg:-translate-x-full'} transition-transform duration-300 ease-in-out flex-shrink-0 h-full`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f7fb] dark:bg-slate-950 w-full transition-colors">
        <header className="z-10">
          <TopHeader
            onMenuClick={() => setIsSidebarOpen(prev => !prev)}
            onToggleDesktopSidebar={() => setIsDesktopSidebarVisible(prev => !prev)}
          />
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {!isSuperAdmin && !isAdmin && !canRoute(location.pathname) ? (
            <div className="flex h-full min-h-[400px] items-center justify-center p-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg max-w-md text-center border border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Access Restricted</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  You do not have permission to access this page or resource. Please contact your system administrator if you require access.
                </p>
                <Link
                  to="/"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm shadow-md transition-all"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>

        <footer className="bg-[#0a192f] dark:bg-[#071324] py-1.5 px-4 md:px-6 flex justify-start items-center overflow-x-auto no-scrollbar border-t dark:border-slate-850 transition-colors">
          <div className="flex gap-4">
            {[
              { icon: ShoppingCart, text: 'Sale Entry', key: 'F2', to: '/sales/add-sale' },
              { icon: FileBox, text: 'Purchase', key: 'F3', to: '/purchases/add-purchase' },
              { icon: Receipt, text: 'Receipt', key: 'F4', to: '/receipt/new' },
              { icon: CreditCard, text: 'Payment', key: 'F5', to: '/payment/new' },
              { icon: Banknote, text: 'Bk.Receipt', key: 'F6', to: '/bank-receipt/new' }
            ].filter(fav => isSuperAdmin || isAdmin || canRoute(fav.to)).map((fav, i) => (
              <Link
                to={fav.to}
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-slate-700"
              >
                <fav.icon size={14} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white whitespace-nowrap">{fav.text}</span>
                <span className="text-[9px] text-gray-500 bg-slate-800/50 px-1.5 rounded">{fav.key}</span>
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
