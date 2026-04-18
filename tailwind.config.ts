import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        major: {
          primary:  '#2D8C6E',
          dark:     '#1A5C47',
          cyan:     '#3ABFBF',
          black:    '#0D0D0D',
          accent:   '#4CAF82',
          surface:  '#1A1A2E',
          surface2: '#111111',
          border:   '#1E3A2F',
        },
      },
      fontFamily: {
        bebas:  ['"Bebas Neue"', 'cursive'],
        oswald: ['Oswald', 'sans-serif'],
        inter:  ['Inter', 'sans-serif'],
        cairo:  ['Cairo', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient':  'linear-gradient(160deg, #0D0D0D 0%, #111827 50%, #1A5C47 100%)',
        'card-gradient':  'linear-gradient(135deg, #1A1A2E 0%, #0F172A 100%)',
        'green-gradient': 'linear-gradient(135deg, #2D8C6E 0%, #1A5C47 100%)',
        'cyan-gradient':  'linear-gradient(135deg, #3ABFBF 0%, #2D8C6E 100%)',
        'cta-gradient':   'linear-gradient(135deg, #1A5C47 0%, #0D0D0D 60%)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(45,140,110,0.4)' },
          '50%':      { boxShadow: '0 0 0 14px rgba(45,140,110,0)' },
        },
        'slide-in': {
          '0%':   { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        typing: {
          '0%, 100%': { opacity: '0.3' },
          '50%':      { opacity: '1' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.6s ease-out forwards',
        'fade-in':    'fade-in 0.4s ease-out forwards',
        'pulse-glow': 'pulse-glow 2.5s infinite',
        'slide-in':   'slide-in 0.3s ease-out forwards',
        typing:       'typing 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
