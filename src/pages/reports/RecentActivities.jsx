import React from 'react';
import { Clock } from 'lucide-react';

const RecentActivities = () => {
  const activities = [
    { activity: 'POS Sale Invoice Created', user: 'ADMIN', time: '11:20 AM', date: '09-09-2026' },
    { activity: 'Purchase Voucher Saved', user: 'ADMIN', time: '11:10 AM', date: '09-09-2026' },
    { activity: 'Payment Received', user: 'ACCOUNTANT', time: '10:55 AM', date: '09-09-2026' },
    { activity: 'GSTR-1 Return Synced', user: 'ADMIN', time: '10:40 AM', date: '09-09-2026' },
    { activity: 'Stock Transfer to Noida', user: 'OPERATOR', time: '10:30 AM', date: '09-09-2026' },
    { activity: 'New Employee Registered', user: 'HR', time: '09:15 AM', date: '09-09-2026' },
    { activity: 'System Backup Completed', user: 'SYSTEM', time: '02:00 AM', date: '09-09-2026' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen">
      <div className="flex items-center gap-2 border-b pb-4 mb-4">
        <Clock className="text-indigo-600" size={24} />
        <div>
          <h1 className="text-xl font-bold text-gray-800">Recent Activities</h1>
          <p className="text-xs text-gray-500 mt-1">View all the recent actions taken by users in the system.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Time</th>
              <th className="p-3 text-sm font-semibold text-gray-600">Activity</th>
              <th className="p-3 text-sm font-semibold text-gray-600">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activities.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 text-sm text-gray-700">{item.date}</td>
                <td className="p-3 text-sm text-gray-700">{item.time}</td>
                <td className="p-3 text-sm font-medium text-gray-800">{item.activity}</td>
                <td className="p-3 text-sm text-indigo-600 font-medium">{item.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivities;
