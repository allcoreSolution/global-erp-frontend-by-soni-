import React from 'react';
import { useNavigate } from 'react-router-dom';

const TableWidget = ({ title, columns, data, viewAllText, onViewAll, greenTotal = false }) => (
  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-xl shadow-md p-4 flex flex-col hover:shadow-lg transition-shadow duration-300">
    <div className="text-sm font-bold text-blue-900 dark:text-slate-250 tracking-wide uppercase mb-4">{title}</div>
    <div className="flex-1 overflow-x-auto">
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-300 font-bold">
            {columns.map((col, idx) => (
              <th key={idx} className={`pb-2 px-1 whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.width || ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b border-gray-50 dark:border-slate-800/40 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/30 text-gray-700 dark:text-slate-350 font-medium">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`py-2 px-1 whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.width || ''} ${row[col.key] === row.totalValue && greenTotal ? 'text-green-600 dark:text-green-400 font-bold' : ''}`}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="mt-3 text-center">
      <button 
        onClick={onViewAll}
        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
      >
        {viewAllText}
      </button>
    </div>
  </div>
);

export const DashboardTables = ({ data, loading }) => {
  const navigate = useNavigate();

  const lowStockData = data?.lowStockData || [
    { id: '1.', name: 'Premium Headphones', stock: '12', reorder: '50' },
    { id: '2.', name: 'Smart Fitness Band', stock: '8', reorder: '25' },
    { id: '3.', name: 'Mini Bluetooth Speaker', stock: '5', reorder: '20' },
    { id: '4.', name: 'Organic Green Tea', stock: '3', reorder: '15' },
    { id: '5.', name: 'Stainless Steel Bottle', stock: '2', reorder: '10' },
  ];
  
  const expiryData = data?.expiryData || [
    { id: '1.', name: 'Organic Green Tea', date: '31-10-2026', qty: '25' },
    { id: '2.', name: 'Roasted Almonds pack', date: '15-12-2026', qty: '18' },
    { id: '3.', name: 'Premium Green Coffee', date: '20-01-2027', qty: '30' },
    { id: '4.', name: 'Chia Seeds organic', date: '30-03-2027', qty: '22' },
    { id: '5.', name: 'Flax Seeds premium', date: '05-04-2027', qty: '15' },
  ];

  const topSellingData = data?.topSellingData || [
    { id: '1.', name: 'Wireless Headphones', qty: '1,250', amount: '₹ 18,75,230.00' },
    { id: '2.', name: 'Smart Fitness Band', qty: '980', amount: '₹ 14,20,450.00' },
    { id: '3.', name: 'Classic Leather Wallet', qty: '875', amount: '₹ 12,45,320.00' },
    { id: '4.', name: 'Roasted Almonds (500g)', qty: '620', amount: '₹ 8,75,120.00' },
    { id: '5.', name: 'Mini Bluetooth Speaker', qty: '540', amount: '₹ 6,25,430.00' },
  ];

  const recentActivities = data?.recentActivities || [
    { activity: 'POS Sale Invoice Created', user: 'ADMIN', time: '11:20 AM' },
    { activity: 'Purchase Voucher Saved', user: 'ADMIN', time: '11:10 AM' },
    { activity: 'Payment Received', user: 'ACCOUNTANT', time: '10:55 AM' },
    { activity: 'GSTR-1 Return Synced', user: 'ADMIN', time: '10:40 AM' },
    { activity: 'Stock Transfer to Noida', user: 'OPERATOR', time: '10:30 AM' },
  ];

  const bankBalanceData = [
    { particulars: 'Cash-in-Hand', amount: '₹ 1,25,430.00' },
    { particulars: 'HDFC Current A/c', amount: '₹ 8,75,230.00' },
    { particulars: 'ICICI Current A/c', amount: '₹ 6,25,430.00' },
    { particulars: 'SBI Cash-Credit A/c', amount: '₹ 2,35,120.00' },
    { particulars: 'Total Balance', amount: '₹ 18,61,210.00', totalValue: '₹ 18,61,210.00' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <TableWidget 
        title="Low Stock Items" 
        columns={[
          { label: '#', key: 'id', align: 'center', width: 'w-6 text-gray-400 font-normal' },
          { label: 'Item Name', key: 'name', align: 'left', width: 'max-w-[120px] truncate' },
          { label: 'Stock', key: 'stock', align: 'center' },
          { label: 'Reorder', key: 'reorder', align: 'center' }
        ]} 
        data={lowStockData} 
        viewAllText="View All Low Stock Items" 
        onViewAll={() => navigate('/reports/stock/low-stock')}
      />
      
      <TableWidget 
        title="Expiry Items" 
        columns={[
          { label: '#', key: 'id', align: 'center', width: 'w-6 text-gray-400 font-normal' },
          { label: 'Item Name', key: 'name', align: 'left', width: 'max-w-[120px] truncate' },
          { label: 'Exp. Date', key: 'date', align: 'center' },
          { label: 'Qty', key: 'qty', align: 'center' }
        ]} 
        data={expiryData} 
        viewAllText="View All Expiry Items" 
        onViewAll={() => navigate('/reports/stock/expired-stock')}
      />

      <TableWidget 
        title="Top Selling Items" 
        columns={[
          { label: '#', key: 'id', align: 'center', width: 'w-6 text-gray-400 font-normal' },
          { label: 'Item Name', key: 'name', align: 'left', width: 'max-w-[120px] truncate' },
          { label: 'Qty', key: 'qty', align: 'center' },
          { label: 'Amount', key: 'amount', align: 'right' }
        ]} 
        data={topSellingData} 
        viewAllText="View All Top Selling Items" 
        onViewAll={() => navigate('/reports/sales/top-selling-items')}
      />

      <TableWidget 
        title="Recent Activities" 
        columns={[
          { label: 'Activity', key: 'activity', align: 'left' },
          { label: 'User', key: 'user', align: 'center' },
          { label: 'Time', key: 'time', align: 'right' }
        ]} 
        data={recentActivities} 
        viewAllText="View All Activities" 
        onViewAll={() => navigate('/reports/recent-activities')}
      />

      <TableWidget 
        title="Cash & Bank Balance" 
        columns={[
          { label: 'Particulars', key: 'particulars', align: 'left' },
          { label: 'Amount', key: 'amount', align: 'right' }
        ]} 
        data={bankBalanceData} 
        viewAllText="View All Accounts"
        onViewAll={() => navigate('/reports/analysis/bank-balance')}
        greenTotal={true}
      />
    </div>
  );
};
