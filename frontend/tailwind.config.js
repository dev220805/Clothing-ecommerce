/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f7f7f8',
          100: '#ececef',
          200: '#d9d9df',
          300: '#b8b8c4',
          400: '#9191a1',
          500: '#737384',
          600: '#5d5d6b',
          700: '#4c4c58',
          800: '#42424b',
          900: '#3a3a41',
          950: '#0c0c0f',
        },
        accent: {
          DEFAULT: '#e85d4c',
          muted: '#c24131',
          glow: '#ff7a6a',
        },
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to bottom, rgba(12,12,15,0) 0%, rgba(12,12,15,0.85) 100%), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      animation: {
        shimmer: 'shimmer 1.4s ease-in-out infinite',
        'fade-slide': 'fadeSlide 0.5s ease-out both',
        'fade-slide-delay': 'fadeSlide 0.55s ease-out 60ms both',
        'fade-in-delay': 'fadeIn 0.5s ease-out 110ms both',
        'fade-in-delay-lg': 'fadeIn 0.45s ease-out 140ms both',
        'hero-reveal': 'heroReveal 0.55s ease-out both',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeSlide: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        heroReveal: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
