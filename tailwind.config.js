/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Lato"', 'sans-serif'],
      },
      colors: {
        cream:     '#eef2ff',  // indigo-50
        parchment: '#e0e7ff',  // indigo-100
        wine:      '#4338ca',  // indigo-700
        blush:     '#c7d2fe',  // indigo-200
        sage:      '#818cf8',  // indigo-400
        mauve:     '#a5b4fc',  // indigo-300
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':   'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'highlight':  'highlight 2.5s ease-out forwards',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },                              to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: 0, transform: 'scale(0.95)' },    to: { opacity: 1, transform: 'scale(1)' } },
        pulseSoft: { '0%,100%': { opacity: 1 },                         '50%': { opacity: 0.6 } },
        highlight: {
          '0%':   { boxShadow: '0 0 0 3px rgba(99,102,241,0.7)' },
          '70%':  { boxShadow: '0 0 0 3px rgba(99,102,241,0.3)' },
          '100%': { boxShadow: '0 0 0 0px rgba(99,102,241,0)' },
        },
      },
      boxShadow: {
        soft:  '0 2px 20px rgba(67,56,202,0.08)',
        card:  '0 4px 32px rgba(67,56,202,0.10)',
        modal: '0 8px 64px rgba(67,56,202,0.18)',
      },
    },
  },
  plugins: [],
}