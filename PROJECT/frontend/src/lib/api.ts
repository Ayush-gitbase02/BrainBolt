const API_BASE = typeof window !== 'undefined' ? '/api/v1' : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

export type NextQuestion = {
  questionId: string | null;
  difficulty: number;
  prompt: string | null;
  choices: { id: string; text: string }[] | null;
  sessionId: string | null;
  stateVersion: number;
  currentScore: number;
  currentStreak: number;
  message?: string;
};

export type SubmitAnswerResponse = {
  correct: boolean;
  newDifficulty: number;
  newStreak: number;
  scoreDelta: number;
  totalScore: number;
  maxStreak?: number;
  stateVersion: number;
  leaderboardRankScore: number;
  leaderboardRankStreak: number;
  idempotent?: boolean;
};

export type Metrics = {
  currentDifficulty: number;
  streak: number;
  maxStreak: number;
  totalScore: number;
  accuracy: number;
  difficultyHistogram: { difficulty: number; count: number }[];
  recentPerformance: { questionId: string; correct: boolean; scoreDelta: number; difficulty: number; answeredAt: string }[];
};

export type LeaderboardEntry = { userId: string; totalScore?: number; maxStreak?: number; updatedAt?: string };
export type LeaderboardResponse = { entries: LeaderboardEntry[]; updatedAt: string };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export function setUserId(userId: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('brainbolt_userId', userId);
  }
}

export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('brainbolt_userId') || '';
}

export function getOrCreateUserId(): string {
  let id = getUserId();
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 12);
    setUserId(id);
  }
  return id;
}

export async function fetchNextQuestion(userId: string, sessionId?: string): Promise<NextQuestion> {
  const params = new URLSearchParams({ userId });
  if (sessionId) params.set('sessionId', sessionId);
  return request<NextQuestion>(`/quiz/next?${params}`);
}

export async function submitAnswer(params: {
  userId: string;
  sessionId: string | null;
  questionId: string;
  answer: string;
  stateVersion: number;
  answerIdempotencyKey: string;
}): Promise<SubmitAnswerResponse> {
  return request<SubmitAnswerResponse>('/quiz/answer', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function fetchMetrics(userId: string): Promise<Metrics> {
  return request<Metrics>(`/quiz/metrics?userId=${encodeURIComponent(userId)}`);
}

export async function fetchLeaderboardScore(limit?: number): Promise<LeaderboardResponse> {
  const q = limit != null ? `?limit=${limit}` : '';
  return request<LeaderboardResponse>(`/leaderboard/score${q}`);
}

export async function fetchLeaderboardStreak(limit?: number): Promise<LeaderboardResponse> {
  const q = limit != null ? `?limit=${limit}` : '';
  return request<LeaderboardResponse>(`/leaderboard/streak${q}`);
}
