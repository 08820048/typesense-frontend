/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      mono: ['JetBrains Mono', 'monospace'],
      sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['ui-serif', 'Georgia', 'serif'],
    },
    extend: {
      colors: {
        background: '#0f0f1a',
        text: '#c3d0e0',
        highlight: '#00f0ff',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
