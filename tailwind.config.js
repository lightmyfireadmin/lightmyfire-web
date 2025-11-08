
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',           ],
  theme: {
    extend: {
      colors: {         background: '#F8F8F4',
        foreground: '#2C2C2C',
        muted: '#EAEAEA',
        'muted-foreground': '#5C5C5C',
        primary: '#B400A3',
        'primary-foreground': '#FFFFFF',
        secondary: '#D7F2D4',
        'secondary-foreground': '#1E4620',
        accent: '#FFD700',
        'accent-foreground': '#2C2C2C',
        border: '#D1D1D1',
        input: '#D1D1D1',
        'post-text': '#3B82F6',         'post-image': '#22C55E',         'post-location': '#EAB308',         'post-song': '#EF4444',         'post-refuel': '#F97316',         error: '#EF4444',       },
      fontFamily: {         sans: ['var(--font-nunito-sans)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-poppins)', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
      animation: {
        'fade-in-out': 'fadeInOut 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInOut: {
          '0%': { opacity: '0' },
          '5%': { opacity: '1' },
          '95%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.foreground'),
            '--tw-prose-headings': theme('colors.foreground'),
            '--tw-prose-lead': theme('colors.muted-foreground'),
            '--tw-prose-links': theme('colors.primary'),
            '--tw-prose-bold': theme('colors.foreground'),
            '--tw-prose-counters': theme('colors.muted-foreground'),
            '--tw-prose-bullets': theme('colors.border'),
            '--tw-prose-hr': theme('colors.border'),
            '--tw-prose-quotes': theme('colors.foreground'),
            '--tw-prose-quote-borders': theme('colors.border'),
            '--tw-prose-captions': theme('colors.muted-foreground'),
            '--tw-prose-code': theme('colors.foreground'),
            '--tw-prose-pre-code': theme('colors.foreground'),
            '--tw-prose-pre-bg': theme('colors.muted'),
            '--tw-prose-th-borders': theme('colors.border'),
            '--tw-prose-td-borders': theme('colors.border'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};