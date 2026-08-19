import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/cn';
import { Spinner } from './spinner';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40 disabled:pointer-events-none disabled:opacity-50';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Show a spinner and disable the button while an action is in flight. */
  loading?: boolean;
}

/** Basic action button. Labels are children; override styling via `className`. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    type,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      disabled={loading || Boolean(disabled)}
      {...props}
    >
      {loading ? <Spinner size="sm" className="text-current" /> : children}
    </button>
  );
});
