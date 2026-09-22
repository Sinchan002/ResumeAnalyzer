import React from 'react';
import { Sparkles, ShieldCheck } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/60 backdrop-blur-md py-6 text-slate-500 text-xs text-center transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>AI Career Counsellor</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-semibold">Made With ❤️ by Sinchan</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            256-bit Encrypted Resume Analysis
          </span>
          <span>© {new Date().getFullYear()}  | All rights reserved.</span>
        </div>

      </div>
    </footer>
  );
};
