import React, { useState } from 'react';
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
  CreditCard,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

const SystemSettings = () => {
  const navigate = useNavigate();
  const [comingSoonModal, setComingSoonModal] = useState({ open: false, title: '', desc: '' });

  const showComingSoon = (title, desc) => {
    Swal.fire({
      title: `<span style="font-size: 20px; font-weight: 800; color: #1e293b;">🚀 Coming Soon!</span>`,
      html: `
        <div style="font-size: 13px; color: #64748b; line-height: 1.6; margin-top: 8px;">
          <strong style="color: #4f46e5; font-size: 14px;">${title}</strong> module is currently under development.
          <br />
          Yeh feature agle system update me live kiya jayega.
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Theek Hai, Got it',
      confirmButtonColor: '#4f46e5',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-slate-100',
        confirmButton: 'rounded-xl text-xs font-bold px-6 py-2.5'
      }
    });
  };

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
      to: '/company/profile'
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
      isComingSoon: true
    },
    {
      title: 'Inventory & Stock Rules',
      desc: 'Define low stock thresholds, warehouse locations, and item categorization preferences.',
      icon: Package,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      actionText: 'Configure Inventory',
      to: '/stock-transfer/new'
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
      isComingSoon: true
    },
    {
      title: 'Payment Gateways',
      desc: 'Integrate UPI, Stripe, Razorpay, or bank transfer details for receiving payments.',
      icon: CreditCard,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
      actionText: 'Configure Payments',
      isComingSoon: true
    },
    {
      title: 'Backup & Security',
      desc: 'Schedule automated database backups, enforce 2FA, and manage session timeouts.',
      icon: ShieldCheck,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      actionText: 'Manage Security',
      to: '/setup/backup-restore'
    }
  ];

  const handleCardClick = (opt) => {
    if (opt.isComingSoon) {
      showComingSoon(opt.title, opt.desc);
    } else if (opt.to) {
      navigate(opt.to);
    }
  };

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
              onClick={() => handleCardClick(opt)}
              className="border border-slate-200/60 rounded-xl p-5 bg-white hover:bg-slate-50/50 hover:border-slate-300 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between group relative"
            >
              {opt.isComingSoon && (
                <span className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shadow-xs">
                  <Clock size={10} /> Coming Soon
                </span>
              )}

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
