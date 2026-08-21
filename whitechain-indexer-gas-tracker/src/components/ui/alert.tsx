import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

/**
 * Error surface. Blockscout answers a malformed request with HTTP 422 and an
 * `errors` array, and GraphQL answers with HTTP 200 and an `errors` array, so
 * every example funnels both into one readable message here rather than
 * leaving the view blank.
 */
export function Alert({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
