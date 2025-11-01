'use client';

/**
 * Loading Spinner Component
 * Replaces GIF-based loaders with CSS animation for better performance
 */

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerColor = 'primary' | 'foreground' | 'muted';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  label?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const colorClasses: Record<SpinnerColor, string> = {
  primary: 'text-primary',
  foreground: 'text-foreground',
  muted: 'text-muted-foreground',
};

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  label = 'Loading',
}: LoadingSpinnerProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <svg
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin-slow`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}
