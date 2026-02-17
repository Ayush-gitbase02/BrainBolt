'use client';

import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-token px-token-2 py-token-1 text-token-xs font-medium',
        variant === 'default' && 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200',
        variant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        variant === 'warning' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
        variant === 'info' && 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
        className
      )}
      {...props}
    />
  );
}
