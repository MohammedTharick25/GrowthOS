/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { growth: { forest: 'var(--green)', canvas: 'var(--bg)', surface: 'var(--surface)' } }, borderRadius: { card: 'var(--radius-lg)' } } },
  plugins: [],
};
