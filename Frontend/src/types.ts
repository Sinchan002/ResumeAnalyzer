export interface User {
  email: string;
  name: string;
}

export interface StrengthsCardData {
  title: string;
  bullets: string[];
}

export interface GapsCardData {
  title: string;
  bullets: string[];
}

export interface ImprovementsCardData {
  title: string;
  bullets: string[];
}

export interface RoadmapStep {
  stepNumber: number;
  timeframe: string;
  title: string;
  description: string;
}

export interface InterviewQuestion {
  question: string;
  category: 'Technical' | 'Behavioral' | 'System Design' | 'Leadership';
  tip: string;
}

export interface ResumeAnalysis {
  id: string;
  timestamp: string;
  targetRole: string;
  score: number;
  resumeSnippet: string;
  fileName?: string;
  executiveSummary: string;
  strengths: string[];
  gaps: string[];
  improvements: string[];
  roadmap: RoadmapStep[];
  interviewQuestions: InterviewQuestion[];
}

export type ActiveTab = 'dashboard' | 'history' | 'login' | 'signup';
