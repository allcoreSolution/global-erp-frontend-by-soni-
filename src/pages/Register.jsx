import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, ShieldCheck, ArrowRight, User } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Company Details, 2 = Admin User Details
  const [companyName, setCompanyName] = useState('');
  const [userName, setUserName] = useState('');
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl flex overflow-hidden border border-slate-100">
        
        {/* Left Side: Branding / Info */}
        <div className="hidden lg:flex lg:w-5/12 bg-indigo-600 p-12 flex-col justify-between relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-700 opacity-50 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-white mb-12">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Building2 size={22} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">GlobalERP</span>
            </div>
            
            <h1 className="text-4xl font-black text-white leading-tight mb-6">
              Start Managing Your Business Better.
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed mb-8">
              Join thousands of companies using GlobalERP to streamline their inventory, sales, and HR operations in one unified platform.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-indigo-50">
                <ShieldCheck className="text-emerald-400" size={20} />
                <span className="font-medium">Enterprise-grade security & isolation</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-50">
                <ShieldCheck className="text-emerald-400" size={20} />
                <span className="font-medium">Cloud-synced backups automatically</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-7/12 p-8 sm:p-12">
          <div className="max-w-md mx-auto">
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                {step === 1 ? 'Register Your Company' : 'Create Admin Account'}
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                {step === 1 ? 'Step 1 of 2: Let\'s setup your workspace.' : 'Step 2 of 2: Create your personal login credentials.'}
              </p>
            </div>

            {step === 1 ? (
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Company Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 size={16} className="text-slate-400" />
                    </div>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g. Acme Corporation" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Business Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-slate-400" />
                    </div>
                    <input type="email" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="contact@company.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-slate-400" />
                      </div>
                      <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">GST Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck size={16} className="text-slate-400" />
                      </div>
                      <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="Optional" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-200 transition-all">
                  Continue to Step 2 <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={(e) => { 
                e.preventDefault(); 
                localStorage.setItem('companyName', companyName.toUpperCase());
                localStorage.setItem('userName', userName.toUpperCase());
                localStorage.setItem('isLoggedIn', 'true');
                navigate('/'); 
              }}>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Admin Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-slate-400" />
                    </div>
                    <input type="text" value={userName} onChange={e => setUserName(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="John Doe" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Admin Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheck size={16} className="text-slate-400" />
                    </div>
                    <input type="password" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setStep(1)} className="w-1/3 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">
                    Back
                  </button>
                  <button type="submit" className="w-2/3 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-200 transition-all">
                    Register Company
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Already have an account? <button onClick={() => navigate('/login')} className="text-indigo-600 font-bold hover:underline">Sign in</button>
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
