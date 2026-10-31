import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../utils/permissionUtils';

const TableWidget = ({ title, columns, data, viewAllText, onViewAll, greenTotal = false }) => (
  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-xl shadow-md p-4 flex flex-col hover:shadow-lg transition-shadow duration-300">
    <div className="text-sm font-bold text-blue-900 dark:text-slate-200 tracking-wide uppercase mb-4">{title}</div>
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
          {data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-50 dark:border-slate-800/40 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/30 text-gray-700 dark:text-slate-300 font-medium">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`py-2 px-1 whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.width || ''} ${row[col.key] === row.totalValue && greenTotal ? 'text-green-600 dark:text-green-400 font-bold' : ''}`}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-4 text-center text-slate-400 italic">
                No items recorded
              </td>
            </tr>
          )}
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

export const DashboardTables = ({ data, outstandingData, loading }) => {
  const navigate = useNavigate();
  const { isSuperAdmin, isAdmin, hasPerm } = usePermissions();

  const canInventory = isSuperAdmin || isAdmin || hasPerm('view_products') || hasPerm('view_stock');
  const canSales = isSuperAdmin || isAdmin || hasPerm('view_sales');
  const canAccounts = isSuperAdmin || isAdmin || hasPerm('view_accounts') || hasPerm('view_vouchers');
  const canOutstanding = isSuperAdmin || isAdmin || hasPerm('view_accounts') || hasPerm('view_sales') || hasPerm('view_purchases');

  const lowStockData = data?.lowStockData || [];
  const expiryData = data?.expiryData || [];
  const topSellingData = data?.topSellingData || [];
  const recentActivities = data?.recentActivities || [];
  const bankBalanceData = data?.bankBalanceData || [];

  // Dynamically assemble widgets that user is permitted to see
  const widgets = [];

  if (canInventory) {
    widgets.push(
      <TableWidget 
        key="lowStock"
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
    );

    widgets.push(
      <TableWidget 
        key="expiry"
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
    );
  }

  if (canSales) {
    widgets.push(
      <TableWidget 
        key="topSelling"
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
    );
  }

  // Recent Activities is available to users
  widgets.push(
    <TableWidget 
      key="recentActivities"
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
  );

  if (canAccounts) {
    widgets.push(
      <TableWidget 
        key="bankBalance"
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
    );
  }

  if (widgets.length === 0) return null;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(widgets.length, 5)} gap-4`}>
      {widgets}
    </div>
  );
};
