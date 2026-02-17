'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Container } from '@/components/ui/Container';
import { ScoreStrip } from '@/components/quiz/ScoreStrip';
import { Leaderboards } from '@/components/leaderboard/Leaderboards';
import {
  getOrCreateUserId,
  fetchNextQuestion,
  type NextQuestion,
} from '@/lib/api';

const QuizQuestion = dynamic(() => import('@/components/quiz/QuizQuestion').then((m) => ({ default: m.QuizQuestion })), {
  ssr: false,
  loading: () => <div className="animate-pulse h-48 bg-surface-elevated rounded-token-lg" />,
});

export default function QuizPage() {
  const userId = getOrCreateUserId();
  const [question, setQuestion] = useState<NextQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [rankScore, setRankScore] = useState<number | undefined>();
  const [rankStreak, setRankStreak] = useState<number | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const loadNext = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNextQuestion(userId, sessionId || undefined);
      setQuestion(data);
      setScore(data.currentScore);
      setStreak(data.currentStreak);
      if (data.sessionId) setSessionId(data.sessionId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId, sessionId]);

  useEffect(() => {
    loadNext();
  }, [loadNext]);

  const handleAnswered = useCallback(
    (correct: boolean, newScore: number, newStreak: number, rScore: number, rStreak: number) => {
      setScore(newScore);
      setStreak(newStreak);
      setMaxStreak((m) => Math.max(m, newStreak));
      setRankScore(rScore);
      setRankStreak(rStreak);
      loadNext();
    },
    [loadNext]
  );

  return (
    <Container>
      <ScoreStrip
        score={score}
        streak={streak}
        maxStreak={maxStreak}
        rankScore={rankScore}
        rankStreak={rankStreak}
      />
      {loading && !question ? (
        <div className="animate-pulse h-64 bg-surface-elevated rounded-token-lg max-w-2xl mx-auto" />
      ) : question ? (
        <QuizQuestion
          data={question}
          userId={userId}
          sessionId={sessionId}
          stateVersion={question.stateVersion}
          onAnswered={handleAnswered}
        />
      ) : null}
      <section className="mt-token-12">
        <h2 className="text-token-xl font-semibold mb-token-4">Live leaderboards</h2>
        <Leaderboards />
      </section>
    </Container>
  );
}
