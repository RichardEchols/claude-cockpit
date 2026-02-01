import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        surface: {
          primary: '#000000',
          secondary: '#1c1c1e',
          tertiary: '#2c2c2e',
          quaternary: '#3a3a3c',
        },
        txt: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.7)',
          tertiary: 'rgba(255, 255, 255, 0.55)',
          quaternary: 'rgba(255, 255, 255, 0.4)',
        },
        accent: {
          DEFAULT: '#0a84ff',
          hover: '#409cff',
        },
        system: {
          red: '#ff453a',
          orange: '#ff9f0a',
          yellow: '#ffd60a',
          green: '#30d158',
          teal: '#64d2ff',
          blue: '#0a84ff',
          indigo: '#5e5ce6',
          purple: '#bf5af2',
          pink: '#ff375f',
        },
        separator: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          opaque: '#38383a',
        },
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
        'apple-xl': '24px',
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
        'apple': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'apple-md': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'apple-lg': '0 16px 48px rgba(0, 0, 0, 0.2)',
        'glow-blue': '0 0 30px rgba(10, 132, 255, 0.3)',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'apple-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'apple-snappy': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'apple-enter': 'cubic-bezier(0, 0, 0.2, 1)',
        'apple-exit': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
