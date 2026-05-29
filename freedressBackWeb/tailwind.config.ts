import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Editorial Noir palette
        noir: {
          DEFAULT: '#0A0A0F',
          50: '#1A1A22',
          100: '#16161D',
          200: '#121218',
          300: '#0E0E14',
          400: '#0A0A0F',
          500: '#08080C',
          600: '#06060A',
          700: '#040407',
          800: '#020204',
          900: '#000000',
        },
        gold: {
          DEFAULT: '#D4AF37',
          50: '#F5E9C0',
          100: '#EFDC9F',
          200: '#E6C977',
          300: '#DDB94F',
          400: '#D4AF37',
          500: '#B8860B',
          600: '#9C7409',
          700: '#7F5E07',
          800: '#624805',
          900: '#453203',
        },
        ivory: '#F5F5F0',
        ash: '#8A8A8A',
        success: '#5CB85C',
        danger: '#D9534F',
        warning: '#F0AD4E',
        info: '#5BC0DE',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
        'noir-gradient':
          'radial-gradient(ellipse at top, rgba(212,175,55,0.06) 0%, rgba(10,10,15,0) 60%), #0A0A0F',
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(212,175,55,0.25), 0 8px 30px rgba(212,175,55,0.08)',
        glass: '0 4px 24px rgba(0,0,0,0.4)',
      },
      borderColor: {
        DEFAULT: 'rgba(212,175,55,0.1)',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-18px) translateX(8px)' },
        },
        'float-slower': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(20px) translateX(-10px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'float-slower': 'float-slower 10s ease-in-out infinite',
        'spin-slow': 'spin-slow 24s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
