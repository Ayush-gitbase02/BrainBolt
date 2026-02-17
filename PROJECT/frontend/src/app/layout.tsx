import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Container } from '@/components/ui/Container';
import '@/styles/globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-display',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BrainBolt – Adaptive Quiz',
  description: 'Infinite adaptive quiz with live leaderboards',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-brand-200 dark:border-brand-800">
            <Container className="flex items-center justify-between h-14">
              <a href="/" className="text-token-xl font-display font-bold text-brand-600 dark:text-brand-400">
                BrainBolt
              </a>
              <nav className="flex items-center gap-token-4">
                <a href="/quiz" className="text-ink-secondary hover:text-ink-primary text-token-sm">
                  Quiz
                </a>
                <a href="/metrics" className="text-ink-secondary hover:text-ink-primary text-token-sm">
                  Metrics
                </a>
                <a href="/leaderboard" className="text-ink-secondary hover:text-ink-primary text-token-sm">
                  Leaderboard
                </a>
                <ThemeToggle />
              </nav>
            </Container>
          </header>
          <main className="flex-1 py-token-8">{children}</main>
          <footer className="border-t border-brand-200 dark:border-brand-800 py-token-4 text-center text-token-sm text-ink-muted">
            BrainBolt – Adaptive Infinite Quiz
          </footer>
        </div>
      </body>
    </html>
  );
}
