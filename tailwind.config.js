/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a2342',
          light: '#0d2d55',
          dark: '#061629',
        },
        solar: {
          orange: '#f4a623',
          'orange-dark': '#e8721c',
          red: '#ef4444',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#38bdf8',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(244, 166, 35, 0.4)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
        'card-3d': '0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      backgroundImage: {
        'space': 'linear-gradient(135deg, #020c1b 0%, #0a2342 50%, #020c1b 100%)',
        'card-glass': 'linear-gradient(135deg, rgba(13,45,85,0.6) 0%, rgba(10,35,66,0.5) 100%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'blink': 'blink 1.2s step-end infinite',
      },
    },
  },
  plugins: [],
}
