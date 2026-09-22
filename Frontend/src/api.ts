import { User, ResumeAnalysis } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

async function safeJsonParse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Server error (${res.status}): Received HTML response instead of JSON. Please ensure the Flask backend is running on port 5000.`
    );
  }
  return res.json();
}

export async function getCurrentUserApi(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/me`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await safeJsonParse(res);
    return data.user || null;
  } catch (err) {
    console.error('Error checking current session user:', err);
    return null;
  }
}

export async function loginApi(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await safeJsonParse(res);
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Login failed');
  }

  return data.user;
}

export async function signupApi(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await safeJsonParse(res);
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Signup failed');
  }

  return data.user;
}

export async function logoutApi(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
    console.error('Logout error:', err);
  }
}

export async function analyzeResumeApi(
  role: string,
  resumeText: string,
  file?: File | null
): Promise<ResumeAnalysis> {
  const formData = new FormData();
  formData.append('role', role);
  if (resumeText) {
    formData.append('resume', resumeText);
  }
  if (file) {
    formData.append('file', file);
  }

  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await safeJsonParse(res);
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Failed to analyze resume');
  }

  return data.analysis;
}

export async function getHistoryApi(): Promise<{ history: ResumeAnalysis[]; todayScans: number; maxDaily: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/history`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) return { history: [], todayScans: 0, maxDaily: 3 };
    const data = await safeJsonParse(res);
    return {
      history: data.history || [],
      todayScans: data.today_scans ?? 0,
      maxDaily: data.max_daily ?? 3
    };
  } catch (err) {
    console.error('Error fetching history:', err);
    return { history: [], todayScans: 0, maxDaily: 3 };
  }
}
