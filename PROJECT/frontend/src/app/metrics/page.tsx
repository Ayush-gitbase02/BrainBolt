'use client';

import { useEffect, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getOrCreateUserId, fetchMetrics, type Metrics } from '@/lib/api';

export default function MetricsPage() {
  const userId = getOrCreateUserId();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchMetrics(userId);
        if (!cancelled) setMetrics(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return (
      <Container>
        <div className="animate-pulse h-64 bg-surface-elevated rounded-token-lg" />
      </Container>
    );
  }

  const m = metrics ?? {
    currentDifficulty: 0,
    streak: 0,
    maxStreak: 0,
    totalScore: 0,
    accuracy: 0,
    difficultyHistogram: [],
    recentPerformance: [],
  };

  return (
    <Container>
      <h1 className="text-token-2xl font-bold mb-token-6">Your metrics</h1>
      <div className="grid gap-token-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current state</CardTitle>
          </CardHeader>
          <CardContent className="space-y-token-2">
            <p>Difficulty: {m.currentDifficulty}</p>
            <p>Streak: {m.streak}</p>
            <p>Max streak: {m.maxStreak}</p>
            <p>Total score: {m.totalScore}</p>
            <p>Accuracy: {(m.accuracy * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Difficulty distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {m.difficultyHistogram.length === 0 ? (
              <p className="text-ink-muted">No answers yet.</p>
            ) : (
              <ul className="space-y-token-1">
                {m.difficultyHistogram.map(({ difficulty, count }) => (
                  <li key={difficulty}>
                    Level {difficulty}: {count} answers
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-token-6">
        <CardHeader>
          <CardTitle>Recent performance</CardTitle>
        </CardHeader>
        <CardContent>
          {m.recentPerformance.length === 0 ? (
            <p className="text-ink-muted">No recent answers.</p>
          ) : (
            <ul className="space-y-token-2">
              {m.recentPerformance.map((r, i) => (
                <li key={i} className="flex gap-token-2 text-token-sm">
                  <span>{r.correct ? '✓' : '✗'}</span>
                  <span>+{r.scoreDelta}</span>
                  <span>diff {r.difficulty}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
