import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, LayoutDashboard, History, LogOut, ChevronDown, Mail } from './Icons';
import { ActiveTab, User } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstLetter = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const fullName = user?.name || (user?.email ? user.email.split('@')[0] : 'User');

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-slate-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between min-h-[4rem] py-2 sm:py-0 gap-2">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2 cursor-pointer group select-none"
            role="button"
            tabIndex={0}
            aria-label="Career AI Home"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('dashboard'); }}
          >
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/30 group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-cyan-200" />
              <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-sm -z-10 group-hover:blur-md transition-all"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">AI</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-1 hidden xs:inline">
                Counselor
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Main Navigation" className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60 shadow-inner order-3 sm:order-2 w-full sm:w-auto justify-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              aria-label="Navigate to Dashboard"
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Dashboard</span>
              {activeTab === 'dashboard' && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              aria-label="Navigate to Analysis History"
              aria-current={activeTab === 'history' ? 'page' : undefined}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>History</span>
              {activeTab === 'history' && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              )}
            </button>
          </nav>

          {/* User Status Badge & Profile Dropdown */}
          <div className="flex items-center gap-2 order-2 sm:order-3 relative" ref={menuRef}>
            {user ? (
              <div className="relative">
                {/* User Logo Button (First Letter Avatar) */}
                <button
                  onClick={() => setIsMenuOpen(prev => !prev)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all cursor-pointer group active:scale-95"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                    {firstLetter}
                  </div>
                  <span className="text-xs font-bold text-slate-800 hidden xs:inline max-w-[100px] sm:max-w-[140px] truncate capitalize">
                    {fullName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>

                {/* Profile & Logout Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 sm:w-64 glass-card rounded-2xl p-4 border border-slate-200/90 shadow-2xl z-50 animate-fadeIn">
                    
                    {/* User Info Header */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md shrink-0">
                        {firstLetter}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate capitalize">
                          {fullName}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="py-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Account Status</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </div>

                    {/* Logout Option */}
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full mt-1 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-500 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-xs group cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                      <span>Logout Account</span>
                    </button>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 rounded-full shadow-sm shine-hover transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
