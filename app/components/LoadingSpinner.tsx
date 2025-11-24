'use client';

/**
 * Available sizes for the spinner.
 */
type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Available colors for the spinner.
 */
type SpinnerColor = 'primary' | 'foreground' | 'muted' | 'white';

/**
 * Props for the LoadingSpinner component.
 */
interface LoadingSpinnerProps {
  /** The size of the spinner. Defaults to 'md'. */
  size?: SpinnerSize;
  /** The color theme of the spinner. Defaults to 'primary'. */
  color?: SpinnerColor;
  /** Optional text label to display next to the spinner. Defaults to 'Loading'. */
  label?: string;
}

/**
 * Maps size props to Tailwind CSS classes.
 */
const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

/**
 * Maps color props to Tailwind CSS classes.
 */
const colorClasses: Record<SpinnerColor, string> = {
  primary: 'text-primary',
  foreground: 'text-foreground',
  muted: 'text-muted-foreground',
  white: 'text-white',
};

/**
 * A versatile loading spinner component.
 *
 * Displays a spinning circle with an optional label.
 *
 * @param {LoadingSpinnerProps} props - The component props.
 * @returns {JSX.Element} The rendered loading spinner.
 */
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
