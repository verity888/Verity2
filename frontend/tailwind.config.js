/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        verity: {
          yellow: '#FACC15',
          'yellow-dark': '#CA8A04',
          ink: '#0F0F0F',
          muted: '#6B6B6B',
          border: '#E2E1DC',
          surface: '#FAFAF8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        // Functional only: indicates AI is processing a response
        'typing': 'typing 1.2s infinite',
      },
      keyframes: {
        typing: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
