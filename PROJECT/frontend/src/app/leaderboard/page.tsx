'use client';

import { Container } from '@/components/ui/Container';
import { Leaderboards } from '@/components/leaderboard/Leaderboards';

export default function LeaderboardPage() {
  return (
    <Container>
      <h1 className="text-token-2xl font-bold mb-token-6">Live leaderboards</h1>
      <p className="text-ink-secondary mb-token-6">
        Top users by total score and by max streak. Your row is highlighted. Rankings update after each answer.
      </p>
      <Leaderboards />
    </Container>
  );
}
