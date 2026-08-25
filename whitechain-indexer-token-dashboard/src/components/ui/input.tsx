import { type InputHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/cn';

/** Single-line text field, sized to match `Button` so they line up in a row. */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        spellCheck={false}
        autoComplete="off"
        className={cn(
          'h-10 w-full rounded-lg border border-gray-200 bg-white px-3 font-mono text-sm text-gray-900',
          'placeholder:font-sans placeholder:text-gray-400',
          'outline-none focus-visible:border-brand-600 focus-visible:ring-2 focus-visible:ring-brand-600/20',
          className,
        )}
        {...props}
      />
    );
  },
);
