import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <Container>
      <section className="text-center py-token-16">
        <h1 className="text-token-3xl font-display font-bold text-ink-primary mb-token-4">
          BrainBolt
        </h1>
        <p className="text-token-lg text-ink-secondary max-w-xl mx-auto mb-token-8">
          Adaptive infinite quiz. One question at a time. Difficulty rises with correct answers and drops with wrong ones. Compete on score and streak.
        </p>
        <div className="flex flex-wrap justify-center gap-token-4">
          <Link href="/quiz">
            <Button size="lg">Start Quiz</Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="secondary" size="lg">View Leaderboard</Button>
          </Link>
        </div>
      </section>
      <section className="grid gap-token-6 md:grid-cols-3 max-w-4xl mx-auto mt-token-12">
        <Card>
          <CardHeader>
            <CardTitle>Adaptive difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            Correct answers increase difficulty; wrong answers decrease it. Anti ping-pong logic keeps the level stable.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Streaks & score</CardTitle>
          </CardHeader>
          <CardContent>
            Build streaks for bonus score. Streak multiplier is capped. Your rank updates after every answer.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Live leaderboards</CardTitle>
          </CardHeader>
          <CardContent>
            Top users by total score and by max streak. See your rank and watch it change in real time.
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}
