/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['var(--font-orbitron)', 'sans-serif']
      },
      animation: {
        'wave': 'wave 15s ease-in-out infinite',
        'wave-reverse': 'wave-reverse 15s ease-in-out infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'blob-1': 'blob-1 20s infinite',
        'blob-2': 'blob-2 15s infinite',
        'pulse-logo': 'pulse-logo 3s ease-in-out infinite',
        'pulse-logo-bg': 'pulse-logo-bg 3s ease-in-out infinite'
      },
      keyframes: {
        'wave': {
          '0%, 100%': { transform: 'translateX(-25%) rotate(0deg)' },
          '50%': { transform: 'translateX(25%) rotate(180deg)' },
        },
        'wave-reverse': {
          '0%, 100%': { transform: 'translateX(25%) rotate(0deg)' },
          '50%': { transform: 'translateX(-25%) rotate(-180deg)' },
        },
        'blob-1': {
          '0%, 100%': { 
            transform: 'translateX(-50%) translateY(-50%) rotate(0deg) scale(1)',
          },
          '50%': { 
            transform: 'translateX(-40%) translateY(-60%) rotate(120deg) scale(1.2)',
          }
        },
        'blob-2': {
          '0%, 100%': { 
            transform: 'translateX(-50%) translateY(-50%) rotate(0deg) scale(1)',
          },
          '50%': { 
            transform: 'translateX(-60%) translateY(-40%) rotate(-120deg) scale(0.9)',
          }
        },
        'pulse-logo': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        'pulse-logo-bg': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            opacity: '0.2' 
          },
          '50%': { 
            transform: 'scale(1.1)', 
            opacity: '0.3' 
          }
        }
      }
    },
  },
  plugins: [],
} 