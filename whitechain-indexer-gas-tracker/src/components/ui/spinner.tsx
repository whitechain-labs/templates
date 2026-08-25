import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const sizeClasses = {
  sm: 'size-4 border-2',
  md: 'size-5 border-2',
} as const;

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof sizeClasses;
  /** Accessible label announced by screen readers. */
  label?: string;
}

/**
 * Indeterminate loading indicator (`role="status"`). Colour follows the current
 * text colour (`border-current`), so set `text-*` to theme it.
 */
export function Spinner({ className, size = 'md', label, ...props }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? 'Loading'}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-r-transparent',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
