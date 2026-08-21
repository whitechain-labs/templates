import type { ReactNode } from 'react';

import { ApiBadge, type ApiSurface } from './api-badge';
import { Card } from './card';
import { cn } from '@/lib/cn';

export interface StatProps {
  label: string;
  /** Rendered value. Pass `null` while the value is still loading. */
  value: ReactNode;
  /** Unit suffix shown next to the value, e.g. `WBT` or `Gwei`. */
  unit?: string;
  surface: ApiSurface;
  call: string;
  /** Extra context, shown under the value. */
  hint?: string;
  className?: string;
}

/**
 * One metric tile: label, value, and the API call behind it. `value === null`
 * renders a placeholder so the grid does not reflow when data arrives.
 */
export function Stat({ label, value, unit, surface, call, hint, className }: StatProps) {
  return (
    <Card className={cn('flex flex-col gap-2 px-5 py-4', className)}>
      <span className="text-sm text-gray-500">{label}</span>
      <span className="flex min-w-0 flex-wrap items-baseline gap-1.5 text-2xl font-semibold break-words tabular-nums">
        {value === null ? <span className="text-gray-300">–</span> : value}
        {unit && value !== null && (
          <span className="text-sm font-normal text-gray-500">{unit}</span>
        )}
      </span>
      {hint && <span className="text-xs break-words text-gray-500">{hint}</span>}
      <ApiBadge surface={surface} call={call} className="mt-auto pt-1" />
    </Card>
  );
}
