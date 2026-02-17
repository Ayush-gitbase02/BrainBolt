'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { NextQuestion } from '@/lib/api';
import { cn } from '@/lib/utils';

type QuizQuestionProps = {
  data: NextQuestion;
  userId: string;
  sessionId: string | null;
  stateVersion: number;
  onAnswered: (correct: boolean, newScore: number, newStreak: number, rankScore: number, rankStreak: number) => void;
};

export function QuizQuestion({ data, userId, sessionId, stateVersion, onAnswered }: QuizQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // NEW: regenerate per question
  const idempotencyKey = useMemo(
    () => `answer-${userId}-${data.questionId}-${Date.now()}`,
    [userId, data.questionId]
  );

  // NEW: reset UI state when question changes
  useEffect(() => {
    setSelected(null);
    setSubmitting(false);
  }, [data.questionId]);

  const handleSubmit = useCallback(async () => {
    if (selected == null || !data.questionId || submitting) return;

    setSubmitting(true);
    try {
      const { submitAnswer } = await import('@/lib/api');
      const res = await submitAnswer({
        userId,
        sessionId,
        questionId: data.questionId,
        answer: selected,
        stateVersion,
        answerIdempotencyKey: idempotencyKey,
      });

      onAnswered(
        res.correct,
        res.totalScore,
        res.newStreak,
        res.leaderboardRankScore,
        res.leaderboardRankStreak
      );
    } catch (e) {
      console.error(e);
    } finally {
      // IMPORTANT: always turn off "Checking…"
      setSubmitting(false);
    }
  }, [selected, data.questionId, userId, sessionId, stateVersion, idempotencyKey, submitting, onAnswered]);

  if (!data.prompt || !data.choices?.length) {
    return (
      <Card>
        <CardContent>
          <p className="text-ink-muted">{data.message || 'No question available. Try again later.'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-token-2xl">{data.prompt}</CardTitle>
        <Badge variant="info">Difficulty {data.difficulty}</Badge>
      </CardHeader>
      <CardContent className="space-y-token-4">
        <div className="grid gap-token-2" role="group" aria-label="Answer choices">
          {data.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => setSelected(choice.id)}
              className={cn(
                'w-full text-left rounded-token-lg border-2 p-token-4 transition-colors',
                selected === choice.id
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'
                  : 'border-brand-200 dark:border-brand-800 hover:border-brand-400 dark:hover:border-brand-600'
              )}
            >
              {choice.text}
            </button>
          ))}
        </div>

        <Button fullWidth size="lg" onClick={handleSubmit} disabled={selected == null || submitting}>
          {submitting ? 'Checking…' : 'Submit'}
        </Button>
      </CardContent>
    </Card>
  );
}
