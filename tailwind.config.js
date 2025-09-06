/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Mobile-first font sizes (smaller than default)
        'xs': ['0.75rem', { lineHeight: '1.4' }],      // 12px base
        'sm': ['0.8125rem', { lineHeight: '1.4' }],    // 13px base  
        'base': ['0.875rem', { lineHeight: '1.5' }],   // 14px base (smaller than standard 16px)
        'lg': ['1rem', { lineHeight: '1.5' }],         // 16px base
        'xl': ['1.125rem', { lineHeight: '1.5' }],     // 18px base
        '2xl': ['1.25rem', { lineHeight: '1.4' }],     // 20px base
        '3xl': ['1.5rem', { lineHeight: '1.3' }],      // 24px base
        '4xl': ['1.75rem', { lineHeight: '1.2' }],     // 28px base
        '5xl': ['2rem', { lineHeight: '1.1' }],        // 32px base
        '6xl': ['2.25rem', { lineHeight: '1.1' }],     // 36px base
      }
    },
  },
  plugins: [],
}