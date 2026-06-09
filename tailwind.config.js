/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          light: 'var(--color-wood-light)',
          DEFAULT: 'var(--color-wood)',
          dark: 'var(--color-wood-dark)',
        },
        ink: 'var(--color-ink)',
        'ink-soft': 'var(--color-ink-soft)',
        'ink-strong': 'var(--color-ink-strong)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          soft: 'var(--color-border-soft)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          hover: 'var(--color-surface-hover)',
          active: 'var(--color-surface-active)',
        }
      },
      fontFamily: {
        song: ['"Source Han Serif SC"', '"Noto Serif SC"', 'SimSun', 'serif']
      },
      transitionProperty: {
        'colors': 'background-color, border-color, color, fill, stroke, box-shadow',
      }
    },
  },
  plugins: [],
}
