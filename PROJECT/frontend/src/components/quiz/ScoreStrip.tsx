'use client';

import { Badge } from '@/components/ui/Badge';

type ScoreStripProps = {
  score: number;
  streak: number;
  maxStreak: number;
  rankScore?: number;
  rankStreak?: number;
};

export function ScoreStrip({ score, streak, maxStreak, rankScore, rankStreak }: ScoreStripProps) {
  return (
    <div className="flex flex-wrap items-center gap-token-3 py-token-3">
      <Badge variant="default">Score: {score}</Badge>
      <Badge variant="success">Streak: {streak}</Badge>
      <Badge variant="info">Max streak: {maxStreak}</Badge>
      {rankScore != null && <Badge variant="warning">Rank (score): #{rankScore}</Badge>}
      {rankStreak != null && <Badge variant="warning">Rank (streak): #{rankStreak}</Badge>}
    </div>
  );
}
