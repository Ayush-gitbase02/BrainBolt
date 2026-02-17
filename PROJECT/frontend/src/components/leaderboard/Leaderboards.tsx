'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { fetchLeaderboardScore, fetchLeaderboardStreak, getUserId, type LeaderboardResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

const POLL_MS = 5000;

export function Leaderboards() {
  const [scoreBoard, setScoreBoard] = useState<LeaderboardResponse | null>(null);
  const [streakBoard, setStreakBoard] = useState<LeaderboardResponse | null>(null);
  const userId = getUserId();

  const refresh = async () => {
    const [score, streak] = await Promise.all([
      fetchLeaderboardScore(20),
      fetchLeaderboardStreak(20),
    ]);
    setScoreBoard(score);
    setStreakBoard(streak);
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid gap-token-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>🏆 Top by total score</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardList
            entries={scoreBoard?.entries ?? []}
            keyField="totalScore"
            valueLabel="Score"
            currentUserId={userId}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>🔥 Top by streak</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardList
            entries={streakBoard?.entries ?? []}
            keyField="maxStreak"
            valueLabel="Streak"
            currentUserId={userId}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardList({
  entries,
  keyField,
  valueLabel,
  currentUserId,
}: {
  entries: { userId: string; totalScore?: number; maxStreak?: number }[];
  keyField: 'totalScore' | 'maxStreak';
  valueLabel: string;
  currentUserId: string;
}) {
  const getValue = (e: (typeof entries)[0]) => (keyField === 'totalScore' ? e.totalScore : e.maxStreak) ?? 0;
  return (
    <ul className="space-y-token-2">
      {entries.map((e, i) => (
        <li
          key={e.userId}
          className={cn(
            'flex justify-between rounded-token px-token-2 py-token-2',
            e.userId === currentUserId && 'bg-brand-100 dark:bg-brand-900/40 font-medium'
          )}
        >
          <span>
            #{i + 1} {e.userId === currentUserId ? '(you)' : e.userId}
          </span>
          <span>{getValue(e)}</span>
        </li>
      ))}
      {entries.length === 0 && <li className="text-ink-muted">No entries yet.</li>}
    </ul>
  );
}
