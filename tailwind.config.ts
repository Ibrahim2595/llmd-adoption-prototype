import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Grayscale — used for 95%+ of the interface
        'gray-50':  '#F9FAFB',
        'gray-100': '#F3F4F6',
        'gray-200': '#E5E7EB',
        'gray-300': '#D1D5DB',
        'gray-500': '#6B7280',
        'gray-700': '#374151',
        'gray-900': '#111827',
        // Brand purple — used very sparingly
        'purple':       '#7B2D8E',
        'purple-light': '#F3E8F9',
        'purple-dark':  '#5B1D6E',
        // Additional grayscale for dark mode
        'gray-400':  '#9CA3AF',
        'gray-800':  '#1F2937',
        // Callout colors — light
        'blue-50':   '#EFF6FF',
        'blue-500':  '#3B82F6',
        'green-50':  '#F0FDF4',
        'green-500': '#22C55E',
        'amber-50':  '#FFFBEB',
        'amber-500': '#F59E0B',
        // Callout colors — dark
        'blue-950':  '#172554',
        'green-950': '#052e16',
        'amber-950': '#451a03',
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        '6xl': '72rem',    // 1152px ≈ 1200px content max
        '3xl': '48rem',    // 768px — blog/docs content column
      },
    },
  },
  plugins: [],
}

export default config
