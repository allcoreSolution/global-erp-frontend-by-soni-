import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (username.trim() === '' || password.trim() === '') {
      setError('Please fill in both Username and Password fields.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email: username,
        password: password
      });

      const { token, user, role } = response.data; // assuming typical structure, adapt if backend returns flat data

      // Safely extract role name
      const roleName = user?.role?.name || role?.name || response.data.role || 'Admin';
      
      localStorage.setItem('erp_token', token || response.data.data?.token || response.data.token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userName', user?.username || response.data.username || username);
      localStorage.setItem('userRole', roleName);
      localStorage.setItem('companyName', user?.company?.name || response.data.companyName || 'GLOBAL ERP');
      
      if (roleName === 'SuperAdmin') {
        navigate('/super-admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
          .font-varela {
            font-family: 'Varela Round', sans-serif;
          }
        `}
      </style>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-varela relative overflow-hidden">
      
      {/* Premium Tech Mesh Gradient Background (Vercel/Stripe style) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/30 dark:bg-indigo-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/30 dark:bg-purple-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-pink-300/20 dark:bg-pink-600/5 rounded-full blur-[90px]"></div>

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-md bg-white shadow-2xl drop-shadow-2xl border border-slate-200/80 rounded-none p-8 relative z-10 mx-4 space-y-6">
        
        {/* Logo and Greeting Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600/10 text-indigo-600 dark:text-blue-400 rounded-2xl border border-blue-500/10 mb-1">
            <Shield size={32} strokeWidth={2} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-850 dark:text-slate-800 uppercase">GLOBAL ERP</h1>
          <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">Allcore Solution Premium Enterprise Suite</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 rounded-xl text-[11px] font-bold text-rose-600 dark:text-rose-400 text-center">
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-350">
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-slate-500">Username ID</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-455" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-800 font-medium"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-slate-500">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-455" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-slate-800 font-medium"
                placeholder="admin123"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-450 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-450 pt-1">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" id="remember" className="rounded bg-slate-50/50 border-slate-200 dark:border-slate-200 focus:ring-0" defaultChecked />
              <label htmlFor="remember" className="select-none font-medium">Keep me signed in</label>
            </div>
            <span className="hover:text-indigo-600 dark:hover:text-blue-400 cursor-pointer font-medium">Forgot Password?</span>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-none font-bold shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm tracking-wider"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>

      </div>
    </div>
    </>
  );
};

export default Login;
