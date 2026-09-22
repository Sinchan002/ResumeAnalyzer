import React, { useState, useEffect } from 'react';
import { ActiveTab, User, ResumeAnalysis } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { HistoryPage } from './components/HistoryPage';
import { getCurrentUserApi, logoutApi, getHistoryApi } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('login');
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<ResumeAnalysis[]>([]);
  const [todayScans, setTodayScans] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check current session on mount
  useEffect(() => {
    async function initUser() {
      try {
        const currentUser = await getCurrentUserApi();
        setUser(currentUser);
        if (currentUser) {
          setActiveTab('dashboard');
          const pastData = await getHistoryApi();
          setHistory(pastData.history);
          setTodayScans(pastData.todayScans);
        } else {
          setActiveTab('login');
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        setActiveTab('login');
      } finally {
        setIsInitializing(false);
      }
    }
    initUser();
  }, []);

  // Sync history whenever switching to history tab or after login
  useEffect(() => {
    if (user && activeTab === 'history') {
      getHistoryApi().then((res) => {
        setHistory(res.history);
        setTodayScans(res.todayScans);
      });
    }
  }, [user, activeTab]);

  // Dynamic SEO metadata updates based on active section
  useEffect(() => {
    const seoMap: Record<ActiveTab, { title: string; desc: string }> = {
      dashboard: {
        title: 'Dashboard | Career AI - Resume Analyzer & Career Counselor',
        desc: 'Analyze your resume against target job roles, calculate ATS match score, and receive personalized career improvement roadmaps.'
      },
      history: {
        title: 'Analysis History | Career AI - Past Resume Scans',
        desc: 'Review past resume analysis reports, tracked ATS match scores, missing skills, and interview questions.'
      },
      login: {
        title: 'Account Login | Career AI - Resume Optimization Platform',
        desc: 'Log in to your Career AI account to analyze resumes and access AI-driven career guidance.'
      },
      signup: {
        title: 'Create Account | Career AI - Smart Resume Analysis',
        desc: 'Sign up for Career AI to optimize your resume, prepare for targeted job roles, and generate custom interview questions.'
      }
    };

    const currentSeo = seoMap[activeTab] || seoMap.login;
    document.title = currentSeo.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', currentSeo.desc);
    }
  }, [activeTab]);

  const handleTabChange = (tab: ActiveTab) => {
    if (!user && (tab === 'dashboard' || tab === 'history')) {
      setActiveTab('login');
    } else {
      setActiveTab(tab);
    }
  };

  const handleAuthSuccess = async (loggedUser: User) => {
    setUser(loggedUser);
    setActiveTab('dashboard');
    const pastData = await getHistoryApi();
    setHistory(pastData.history);
    setTodayScans(pastData.todayScans);
  };

  const handleLogout = async () => {
    await logoutApi();
    setUser(null);
    setHistory([]);
    setTodayScans(0);
    setActiveTab('login');
  };

  const handleSaveAnalysis = (newAnalysis: ResumeAnalysis) => {
    setHistory((prev) => [newAnalysis, ...prev]);
    setTodayScans((prev) => prev + 1);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Initializing Career AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'dashboard' && user && (
          <Dashboard
            user={user}
            todayScans={todayScans}
            onSaveAnalysis={handleSaveAnalysis}
            setActiveTab={handleTabChange}
          />
        )}

        {activeTab === 'history' && user && (
          <HistoryPage
            history={history}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            setActiveTab={handleTabChange}
          />
        )}

        {(activeTab === 'login' || (!user && activeTab === 'dashboard')) && (
          <AuthPage
            mode="login"
            setActiveTab={handleTabChange}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {activeTab === 'signup' && (
          <AuthPage
            mode="signup"
            setActiveTab={handleTabChange}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
      </main>

      {/* Minimalist Footer */}
      <Footer />

    </div>
  );
}
