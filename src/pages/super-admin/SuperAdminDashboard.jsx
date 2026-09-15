import React from 'react';
import { QuickLinks, SummaryCards } from '../../components/DashboardContent1';
import { DashboardCharts } from '../../components/DashboardCharts';
import { DashboardTables } from '../../components/DashboardTables';
import { IndustrySolutions, HelpAndSupport, ShortcutKeys } from '../../components/DashboardFooter';

const SuperAdminDashboard = () => {
  return (
    <>
      <QuickLinks />
      <SummaryCards />
      <DashboardCharts />
      <DashboardTables />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-10 flex flex-col gap-4">
          <IndustrySolutions />
          <ShortcutKeys />
        </div>
        <div className="lg:col-span-2">
          <HelpAndSupport />
        </div>
      </div>
    </>
  );
};

export default SuperAdminDashboard;
