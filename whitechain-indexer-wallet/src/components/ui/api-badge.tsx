import { cn } from '@/lib/cn';

/**
 * Which Blockscout interface a value came from. The explorer exposes four, and
 * every example in this family labels its data so a reader can trace a number
 * on screen back to the request that produced it.
 *
 * See https://docs.whitechain.io/build/block-explorer/overview
 */
export type ApiSurface = 'REST v2' | 'RPC' | 'ETH RPC' | 'GraphQL';

const surfaceClasses: Record<ApiSurface, string> = {
  'REST v2': 'bg-brand-50 text-brand-700 ring-brand-200',
  RPC: 'bg-amber-50 text-amber-700 ring-amber-200',
  'ETH RPC': 'bg-violet-50 text-violet-700 ring-violet-200',
  GraphQL: 'bg-pink-50 text-pink-700 ring-pink-200',
};

export interface ApiBadgeProps {
  surface: ApiSurface;
  /** The request this value came from, e.g. `GET /addresses/{hash}`. */
  call?: string;
  className?: string;
}

/** Inline provenance label: the API surface, optionally with the exact call. */
export function ApiBadge({ surface, call, className }: ApiBadgeProps) {
  return (
    <span className={cn('flex min-w-0 items-center gap-1.5 text-xs text-gray-500', className)}>
      <span
        className={cn(
          'shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset',
          surfaceClasses[surface],
        )}
      >
        {surface}
      </span>
      {call && <code className="truncate font-mono text-[11px] text-gray-500">{call}</code>}
    </span>
  );
}
