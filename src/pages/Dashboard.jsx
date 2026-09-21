import React, { useState, useEffect } from 'react';
import { QuickLinks, SummaryCards } from '../components/DashboardContent1';
import { DashboardCharts } from '../components/DashboardCharts';
import { DashboardTables } from '../components/DashboardTables';
import { HelpAndSupport, ShortcutKeys } from '../components/DashboardFooter';
import api from '../api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        if (response.data && response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <>
      <QuickLinks />
      <SummaryCards data={dashboardData?.summaryCards} loading={loading} />
      <DashboardCharts data={dashboardData} loading={loading} />
      <DashboardTables data={dashboardData?.tables} loading={loading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-10 flex flex-col gap-4">
          <ShortcutKeys />
        </div>
        <div className="lg:col-span-2">
          <HelpAndSupport />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
