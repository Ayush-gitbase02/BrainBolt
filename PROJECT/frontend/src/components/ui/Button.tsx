'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-token transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          variant === 'primary' && 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
          variant === 'secondary' && 'bg-surface-elevated text-ink-primary border border-brand-200 hover:bg-brand-50 dark:border-brand-800 dark:hover:bg-brand-900/30',
          variant === 'ghost' && 'text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary',
          variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
          size === 'sm' && 'px-token-3 py-token-2 text-token-sm',
          size === 'md' && 'px-token-4 py-token-3 text-token-base',
          size === 'lg' && 'px-token-6 py-token-4 text-token-lg',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
