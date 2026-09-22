import React, { useState } from 'react';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck, Info } from './Icons';
import { User, ActiveTab } from '../types';
import { loginApi, signupApi } from '../api';

interface AuthPageProps {
  mode: 'login' | 'signup';
  setActiveTab: (tab: ActiveTab) => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  mode,
  setActiveTab,
  onAuthSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      let userObj: User;
      if (mode === 'login') {
        userObj = await loginApi(email, password);
      } else {
        userObj = await signupApi(email, password);
      }
      onAuthSuccess(userObj);
      setActiveTab('dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center p-3 sm:p-6 overflow-hidden py-6 sm:py-10">
      
      {/* Animated Ambient Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl ambient-blob-1 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl ambient-blob-2 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl ambient-blob-3 pointer-events-none"></div>

      {/* Glassmorphic Container Card */}
      <div className="relative w-full max-w-md glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl border border-white/80 transition-all duration-300">
        
        {/* Top Icon Badge */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-white/90 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-7 h-7 text-indigo-600 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            {mode === 'login'
              ? 'Work Hard, Stay Focused'
              : 'Build your dream career with AI insights'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200/90 rounded-2xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              {mode === 'signup' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                  <Info className="w-3 h-3 text-indigo-500" />
                  at least 6 characters
                </span>
              )}
            </div>
            <div className="relative rounded-2xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200/90 rounded-2xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 shine-hover active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </div>
            ) : (
              <>
                <span>{mode === 'login' ? 'Login' : 'Sign Up'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-200/70 text-center">
          {mode === 'login' ? (
            <p className="text-sm font-medium text-slate-600">
              Don't have an account?{' '}
              <button
                onClick={() => setActiveTab('signup')}
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-all"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p className="text-sm font-medium text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => setActiveTab('login')}
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-all"
              >
                Log in here
              </button>
            </p>
          )}
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Protected by Cygnatrix Secure Auth</span>
        </div>

      </div>
    </div>
  );
};
