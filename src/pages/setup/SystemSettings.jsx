import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Globe,
  Users,
  Calculator,
  Bell,
  Package,
  Mail,
  ShieldCheck,
  ArrowRight,
  Database,
  Building,
  CreditCard
} from 'lucide-react';

const SystemSettings = () => {
  const navigate = useNavigate();

  const settingsOptions = [
    {
      title: 'General Settings',
      desc: 'Configure localization, time zones, invoicing formats, and base currencies.',
      icon: Globe,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      actionText: 'Manage General Settings',
      to: '/setup/general-settings'
    },
    {
      title: 'Company Profile',
      desc: 'Update company logos, addresses, contact details, and business registration IDs.',
      icon: Building,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      actionText: 'Edit Company Profile',
      to: '/setup/company-profile'
    },
    {
      title: 'User & Roles Management',
      desc: 'Manage employees, assign role-based permissions, and control dashboard access.',
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      actionText: 'Manage Users',
      to: '/setup/user-master'
    },
    {
      title: 'Tax & Financial Settings',
      desc: 'Setup GST slabs, tax templates, financial years, and chart of accounts configurations.',
      icon: Calculator,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      actionText: 'Configure Finance',
      to: '/setup/tax-finance'
    },
    {
      title: 'Inventory & Stock Rules',
      desc: 'Define low stock thresholds, warehouse locations, and item categorization preferences.',
      icon: Package,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'Configure Inventory',
      to: '/setup/inventory-settings'
    },
    {
      title: 'Notification & Alerts',
      desc: 'Set up system notifications, pop-up alerts, and dashboard reminder configurations.',
      icon: Bell,
      color: 'text-orange-600 bg-orange-50 border-orange-100',
      actionText: 'Manage Alerts',
      to: '/setup/notification-settings'
    },
    {
      title: 'Email & SMS Gateway',
      desc: 'Configure SMTP credentials, SMS API keys, and automated messaging templates.',
      icon: Mail,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
      actionText: 'Setup Messaging',
      to: '/setup/email-sms-settings'
    },
    {
      title: 'Payment Gateways',
      desc: 'Integrate UPI, Stripe, Razorpay, or bank transfer details for receiving payments.',
      icon: CreditCard,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      actionText: 'Configure Payments',
      to: '/setup/payment-gateways'
    },
    {
      title: 'Backup & Security',
      desc: 'Schedule automated database backups, enforce 2FA, and manage session timeouts.',
      icon: ShieldCheck,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      actionText: 'Manage Security',
      to: '/setup/backup-restore'
    },
    {
      title: 'Database & API',
      desc: 'Manage developer API keys, webhooks, and database cleanup routines.',
      icon: Database,
      color: 'text-slate-600 bg-slate-50 border-slate-200',
      actionText: 'Developer Options',
      to: '/setup/database-api'
    }
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200/70 shadow-sm min-h-screen space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="text-slate-700 animate-[spin_4s_linear_infinite]" size={24} /> Master Settings Portal
        </h1>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-1 pl-8">
          A centralized hub to configure all ERP modules, security policies, company profiles, and financial rules.
        </p>
      </div>

      {/* Grid of Settings Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {settingsOptions.map((opt, idx) => {
          const IconComponent = opt.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(opt.to)}
              className="border border-slate-200/60 rounded-xl p-5 bg-white hover:bg-slate-50/50 hover:border-slate-300 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className={`p-2.5 rounded-xl border ${opt.color}`}>
                    <IconComponent size={20} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-[15px] font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-normal">
                    {opt.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-5 text-[11px] font-bold text-indigo-600 group-hover:translate-x-1.5 transition-transform duration-200">
                {opt.actionText} <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemSettings;
