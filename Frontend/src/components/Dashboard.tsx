import React, { useState, useRef } from 'react';
import { 
  Sparkles, Target, UploadCloud, FileText, CheckCircle2, XCircle, 
  Lightbulb, Compass, HelpCircle, FileCheck, AlertCircle,
  History, ChevronRight, Zap
} from './Icons';
import { User, ResumeAnalysis, ActiveTab } from '../types';
import { SAMPLE_RESUMES } from '../mockData';
import { CircularGauge } from './CircularGauge';
import { analyzeResumeApi } from '../api';

interface DashboardProps {
  user: User | null;
  todayScans?: number;
  onSaveAnalysis: (analysis: ResumeAnalysis) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  todayScans = 0,
  onSaveAnalysis,
  setActiveTab,
}) => {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [inputError, setInputError] = useState('');

  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick preset loader
  const handleLoadSample = (sample: typeof SAMPLE_RESUMES[0]) => {
    setResumeText(sample.text);
    setTargetRole(sample.targetRole);
    setUploadedFile(null);
    setUploadedFileName(null);
    setInputError('');
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'doc' && ext !== 'docx') {
      setInputError('Please upload a valid .PDF, .DOC, or .DOCX file.');
      return;
    }
    setInputError('');
    setUploadedFile(file);
    setUploadedFileName(file.name);
    // Do NOT paste or extract resume text client-side when user uploads a file
    setResumeText('');
  };

  const handleAnalyze = async () => {
    if (todayScans >= 3) {
      setInputError('Daily limit reached! You have used 3/3 analyses today. Please try again tomorrow.');
      return;
    }

    if (!targetRole.trim()) {
      setInputError('Job role is compulsory. Please enter your target job role.');
      return;
    }

    if (!resumeText.trim() && !uploadedFile) {
      setInputError('Please provide either resume text OR upload a resume file.');
      return;
    }

    setInputError('');
    setIsAnalyzing(true);

    try {
      const result = await analyzeResumeApi(targetRole, resumeText, uploadedFile);
      setAnalysisResult(result);
      onSaveAnalysis(result);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setInputError(err.message || 'An error occurred while communicating with Flask backend.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const username = user ? (user.name || user.email.split('@')[0]) : 'User';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 bg-gradient-to-r from-indigo-900/5 via-cyan-900/5 to-slate-900/5 border border-indigo-100/80 shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5 sm:mb-3">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] sm:text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                <span>Next-Gen AI Resume Diagnostics</span>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold border ${
                todayScans >= 3
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                <span>Daily Limit: {todayScans}/3 Used</span>
              </div>
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">{username}</span>!
            </h1>
            <p className="mt-1.5 text-xs sm:text-base text-slate-600 max-w-2xl font-medium leading-relaxed">
              Paste your raw resume or upload a file, set your target role, and get instant deep ATS scoring, gap analysis, and an actionable career roadmap.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Test Examples
            </span>
            <div className="flex flex-wrap sm:flex-col gap-1.5">
              {SAMPLE_RESUMES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadSample(sample)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/90 hover:bg-indigo-50 border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-all flex items-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{sample.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Input Form Card */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl border border-slate-200/80 relative">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Resume & Target Role Details</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Provide your credentials and desired career benchmark</p>
          </div>
        </div>

        {/* Input Error Message */}
        {inputError && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{inputError}</span>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Method 1: Large Interactive Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Input Method 1: Paste Raw Resume Text</span>
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {resumeText.length} characters
              </span>
            </div>
            <textarea
              rows={7}
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setUploadedFile(null);
                setUploadedFileName(null);
                setInputError('');
              }}
              placeholder="Paste work experience, skills, education, and bullet points here..."
              className="w-full p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-slate-900 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner placeholder-slate-400"
            />
          </div>

          {/* Divider: Elegant OR horizontal rule with glowing upload badge */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative px-4 bg-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 via-cyan-50 to-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-extrabold uppercase tracking-widest shadow-xs glow-pill-indigo">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                OR UPLOAD FILE
              </span>
            </div>
          </div>

          {/* Method 2: Custom Drag-and-Drop File Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Input Method 2: Document Upload (.PDF, .DOC, .DOCX)
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
                  : uploadedFileName
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-2">
                {uploadedFileName ? (
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-emerald-300 shadow-sm">
                    <FileCheck className="w-6 h-6 text-emerald-600 animate-bounce" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800">{uploadedFileName}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Ready for AI parsing</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFileName(null);
                      }}
                      className="ml-2 text-slate-400 hover:text-rose-500 font-bold text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Drag and drop your resume file here, or <span className="text-indigo-600 underline">browse</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Supports PDF, DOC, and DOCX formats (Up to 10MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Target Role Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Target Job Role or Description
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Target className="w-5 h-5 text-indigo-500" />
              </div>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Lead Frontend Developer, Senior Data Scientist, AI Product Manager..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || todayScans >= 3}
              className={`w-full py-4 px-8 rounded-2xl text-white font-extrabold text-base tracking-wide shadow-xl flex items-center justify-center gap-3 transition-all ${
                todayScans >= 3
                  ? 'bg-slate-400 cursor-not-allowed shadow-none opacity-80'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 shadow-indigo-500/25 shine-hover active:scale-[0.99] cursor-pointer'
              }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Running Cygnatrix AI Diagnostics & ATS Parser...</span>
                </div>
              ) : todayScans >= 3 ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-white" />
                  <span>Daily Limit Reached (3/3 Used Today)</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-cyan-200 animate-pulse" />
                  <span>Analyze My Resume ({3 - todayScans} Left Today)</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* 3. AI Results Presentation Section (Conditional) */}
      {analysisResult && (
        <div ref={resultsRef} className="space-y-8 animate-fadeIn pt-4">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                AI Diagnostic Report
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('history')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span>Saved to History</span>
              </button>
            </div>
          </div>

          {/* Overall Match Header & Executive Summary Box */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Circular Gauge */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50/60 rounded-2xl border border-slate-200/60">
              <CircularGauge score={analysisResult.score} size={190} strokeWidth={16} />
              <div className="mt-4 text-center">
                <span className="text-xs font-semibold text-slate-500">Target Role:</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{analysisResult.targetRole}</p>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs sm:text-sm font-bold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Executive Summary</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Fit Evaluation for {analysisResult.targetRole}
              </h3>
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100/90 text-slate-800 text-base sm:text-lg leading-relaxed font-medium shadow-xs">
                {analysisResult.executiveSummary}
              </div>
              {analysisResult.fileName && (
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Source Document: <strong className="text-slate-800">{analysisResult.fileName}</strong></span>
                </div>
              )}
            </div>

          </div>

          {/* Results Grid System (Structured Card Breakdown) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Key Strengths (Emerald theme) */}
            <div className="glass-card rounded-3xl p-6 border-t-4 border-t-emerald-500 border-slate-200/80 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Key Strengths</h3>
                </div>
                <ul className="space-y-3.5">
                  {analysisResult.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-800 font-medium leading-normal">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Verified Match Drivers</span>
                <span className="bg-emerald-100 px-2.5 py-0.5 rounded-md">Emerald Tier</span>
              </div>
            </div>

            {/* Card 2: Missing Skills & Gaps (Rose Red theme) */}
            <div className="glass-card rounded-3xl p-6 border-t-4 border-t-rose-500 border-slate-200/80 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Missing Skills & Gaps</h3>
                </div>
                <ul className="space-y-3.5">
                  {analysisResult.gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-800 font-medium leading-normal">
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-700">
                <span>Attention Required</span>
                <span className="bg-rose-100 px-2.5 py-0.5 rounded-md">Rose Red Tier</span>
              </div>
            </div>

            {/* Card 3: Suggested Improvements (Amber theme) */}
            <div className="glass-card rounded-3xl p-6 border-t-4 border-t-amber-500 border-slate-200/80 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Suggested Improvements</h3>
                </div>
                <ul className="space-y-3.5">
                  {analysisResult.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-800 font-medium leading-normal">
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700">
                <span>Phrasing & ATS Polish</span>
                <span className="bg-amber-100 px-2.5 py-0.5 rounded-md">Amber Tier</span>
              </div>
            </div>

          </div>

          {/* Card 4: Preparation Roadmap Card (Cyan theme with step-by-step timeline indicators) */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border-t-4 border-t-cyan-500 border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Preparation Roadmap</h3>
                <p className="text-xs sm:text-sm text-slate-500">Step-by-step milestone timeline to landing the role</p>
              </div>
            </div>

            <div className="relative border-l-2 border-cyan-200 ml-4 space-y-6 my-2">
              {analysisResult.roadmap.map((step) => (
                <div key={step.stepNumber} className="relative pl-6 group">
                  {/* Timeline node */}
                  <div className="absolute -left-[17px] top-0.5 w-8 h-8 rounded-full bg-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-md ring-4 ring-white">
                    {step.stepNumber}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-extrabold">
                        {step.timeframe}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900">{step.title}</h4>
                    </div>
                    <p className="mt-1.5 text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Recommended Interview Questions Card (Violet theme with question mark icons) */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border-t-4 border-t-violet-500 border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Recommended Interview Questions</h3>
                <p className="text-xs sm:text-sm text-slate-500">AI-predicted interview questions based on target role gaps</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.interviewQuestions.map((q, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-violet-50/50 border border-violet-100 hover:border-violet-300 transition-all space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-violet-100 text-violet-800 text-xs font-extrabold uppercase tracking-wider">
                      {q.category}
                    </span>
                    <HelpCircle className="w-4 h-4 text-violet-400" />
                  </div>
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                    "{q.question}"
                  </p>
                  <div className="pt-2 border-t border-violet-100/90 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    <span className="font-extrabold text-violet-700">Pro Tip: </span>
                    {q.tip}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
