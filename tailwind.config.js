/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Scan components folder
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F8F4',
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
      },
      fontFamily: {
        // Use font names directly from the <link> tag in layout.tsx
        sans: ['"Nunito Sans"', ...defaultTheme.fontFamily.sans],
        display: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};