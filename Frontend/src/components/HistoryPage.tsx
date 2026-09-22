import React, { useState } from 'react';
import { 
  History, Clock, Search, ChevronDown, ChevronUp, Trash2, 
  Sparkles, FileText, CheckCircle2, XCircle, Lightbulb, Compass, 
  HelpCircle, ArrowRight
} from './Icons';
import { ResumeAnalysis, ActiveTab } from '../types';

interface HistoryPageProps {
  history: ResumeAnalysis[];
  onDeleteHistoryItem: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onDeleteHistoryItem,
  setActiveTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(history[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const filteredHistory = history.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.targetRole.toLowerCase().includes(term) ||
      item.executiveSummary.toLowerCase().includes(term) ||
      item.resumeSnippet.toLowerCase().includes(term) ||
      (item.fileName && item.fileName.toLowerCase().includes(term))
    );
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Header */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
            <History className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Your Analysis History
            </h1>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-600 font-medium">
              Review, compare, and track improvements across past resume diagnostics
            </p>
          </div>
        </div>

        {/* Search Bar */}
        {history.length > 0 && (
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role or keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-slate-200/90 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-xs"
            />
          </div>
        )}
      </div>

      {/* Empty State Graphic & CTA */}
      {history.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 shadow-lg space-y-6 max-w-2xl mx-auto my-12">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center rounded-3xl bg-indigo-50 border border-indigo-100">
            <Clock className="w-12 h-12 text-indigo-500 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">No Analysis Records Yet</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto font-medium">
              You haven't run any resume analyses yet. Run your first AI diagnostic to get instant match scores, key strengths, gap fixes, and career roadmaps!
            </p>
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 shine-hover transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Start your first analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-card rounded-3xl p-8 text-center border border-slate-200/80">
          <p className="text-sm font-semibold text-slate-600">No records found matching "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        /* Record List View */
        <div className="space-y-6">
          {filteredHistory.map((item) => {
            const isExpanded = expandedId === item.id;
            
            return (
              <div
                key={item.id}
                className={`glass-card rounded-3xl border transition-all duration-300 ${
                  isExpanded
                    ? 'border-indigo-300 shadow-xl ring-2 ring-indigo-500/10'
                    : 'border-slate-200/80 shadow-md hover:border-slate-300'
                }`}
              >
                {/* Header Summary Row */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Compact Gauge Score Badge */}
                    <div className="shrink-0 pt-1">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold text-lg border shadow-xs ${
                        item.score >= 80
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : item.score >= 65
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                      }`}>
                        <span>{item.score}%</span>
                        <span className="text-[9px] font-bold tracking-tight uppercase opacity-80">Match</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">
                          {item.targetRole}
                        </h3>
                        {item.fileName && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-400" />
                            {item.fileName}
                          </span>
                        )}
                      </div>

                      {/* Truncated Snippet Preview */}
                      <p className="text-xs font-mono text-slate-600 bg-slate-100/70 p-2 rounded-xl border border-slate-200/60 max-w-3xl line-clamp-2">
                        {item.resumeSnippet}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" />
                          {formatDate(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Expand Toggle */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteHistoryItem(item.id);
                      }}
                      title="Delete Record"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleExpand(item.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                        isExpanded
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <span>{isExpanded ? 'Collapse' : 'View Full Report'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable/Collapsible Breakdown Grid */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6 animate-fadeIn">
                    
                    {/* Target Job Description Box */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-100/80 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium space-y-1">
                      <span className="text-indigo-900 font-bold text-xs uppercase tracking-wider block">Target Job Description / Role:</span>
                      <p className="whitespace-pre-line text-slate-900 font-semibold">{item.targetRole}</p>
                    </div>

                    {/* Executive Summary */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                      <strong className="text-indigo-900 font-bold block mb-1">Executive Summary:</strong>
                      {item.executiveSummary}
                    </div>

                    {/* Breakdown Grid System */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      
                      {/* Key Strengths */}
                      <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Key Strengths</span>
                        </div>
                        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                          {item.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Missing Skills & Gaps */}
                      <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Missing Skills & Gaps</span>
                        </div>
                        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                          {item.gaps.map((gap, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-rose-500 font-bold">•</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Suggested Improvements */}
                      <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                          <Lightbulb className="w-4 h-4 text-amber-600" />
                          <span>Suggested Improvements</span>
                        </div>
                        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
                          {item.improvements.map((imp, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-amber-500 font-bold">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Preparation Roadmap Timeline */}
                    <div className="p-5 rounded-2xl bg-cyan-50/40 border border-cyan-200/80 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-sm text-cyan-900">
                        <Compass className="w-4 h-4 text-cyan-600" />
                        <span>Preparation Roadmap</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {item.roadmap.map((step) => (
                          <div key={step.stepNumber} className="bg-white/80 p-3.5 rounded-xl border border-cyan-100 text-xs sm:text-sm space-y-1 shadow-xs">
                            <span className="text-[10px] sm:text-xs font-extrabold text-cyan-700 uppercase">
                              {step.timeframe}
                            </span>
                            <h4 className="font-bold text-slate-900">{step.title}</h4>
                            <p className="text-xs sm:text-sm text-slate-600 leading-snug font-medium">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Interview Questions */}
                    <div className="p-5 rounded-2xl bg-violet-50/40 border border-violet-200/80 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-sm text-violet-900">
                        <HelpCircle className="w-4 h-4 text-violet-600" />
                        <span>Targeted Interview Questions</span>
                      </div>
                      <div className="space-y-2.5">
                        {item.interviewQuestions.map((q, idx) => (
                          <div key={idx} className="bg-white/80 p-3.5 rounded-xl border border-violet-100 text-xs sm:text-sm space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-700 text-[10px] sm:text-xs font-extrabold">
                                {q.category}
                              </span>
                              <span className="font-extrabold text-slate-900">"{q.question}"</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 pl-2 border-l-2 border-violet-300 font-medium">
                              <strong className="text-violet-700">Tip:</strong> {q.tip}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
