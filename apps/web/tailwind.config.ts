import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        secondary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        success: {
          DEFAULT: '#10B981',
          bg: '#D1FAE5',
          dark: '#064E3B',
          'bg-dark': '#064E3B',
          'text-dark': '#A7F3D0',
        },
        error: {
          DEFAULT: '#EF4444',
          bg: '#FEE2E2',
          dark: '#7F1D1D',
          'text-dark': '#FECACA',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FEF3C7',
          dark: '#78350F',
          'text-dark': '#FDE68A',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: '#DBEAFE',
          dark: '#1E3A8A',
          'text-dark': '#BFDBFE',
        },
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
        },
        text: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        h1: ['28px', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '700' }],
        'h1-md': ['40px', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'h2-md': ['30px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        h3: ['20px', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
        'h3-md': ['24px', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
        h4: ['18px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h4-md': ['20px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        caption: ['12px', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionTimingFunction: {
        'modal-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease',
        'fade-in-up': 'fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [animate],
};

export default config;
