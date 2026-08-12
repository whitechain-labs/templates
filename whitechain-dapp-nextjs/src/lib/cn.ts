import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names: `clsx` flattens conditionals and `tailwind-merge` dedupes
 * conflicting Tailwind utilities so a caller's classes win over the defaults.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
