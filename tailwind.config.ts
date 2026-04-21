import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A0F1E',
          900: '#0F172A',
          800: '#1E293B',
          700: '#273549',
          600: '#334155',
        },
        brand: {
          orange: '#F97316',
          'orange-dark': '#EA6C00',
        },
        area: {
          rrhh: '#3B82F6',
          operaciones: '#22C55E',
          calidad: '#F97316',
          capacitacion: '#A855F7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
