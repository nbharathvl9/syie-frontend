"use client";

/**
 * Reusable avatar component.
 * Extracts the repeated initial-letter avatar pattern.
 *
 * Props:
 *   name      - full name (first letter is used)
 *   size      - 'sm' | 'md' | 'lg' (default 'md')
 *   className - additional CSS classes
 */
export default function Avatar({ name, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-24 h-24 text-3xl',
  };

  return (
    <div
      className={`rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold border border-gray-100 ${sizeClasses[size]} ${className}`.trim()}
    >
      {name?.[0]?.toUpperCase() || 'U'}
    </div>
  );
}
