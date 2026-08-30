/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New design tokens — engineering/telemetry aesthetic
        'deep-space': '#0B0F14',
        'bg-panel': '#0F1520',
        'bg-panel-alt': '#131A24',
        'border-subtle': '#1A2129',
        'text-primary': '#E8EDF5',
        'text-muted': '#6B7A8D',
        'accent-blue': '#00D9A3',         // phosphor/CRT green — primary accent
        'accent-blue-dark': '#00B889',
        'status-green': '#00D9A3',        // same phosphor green for cleared/live
        'status-red': '#FF6B4A',          // signal amber-red for rejects
        'status-orange': '#F59E0B',
        'status-purple': '#A855F7',
        'star-dot': '#1A2129',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'deep-space-gradient': 'linear-gradient(160deg, #0B0F14 0%, #080C10 100%)',
      },
      boxShadow: {
        'glow-blue': '0 0 16px rgba(0, 217, 163, 0.25)',
        'glow-red': '0 0 12px rgba(255, 107, 74, 0.35)',
        'glow-green': '0 0 12px rgba(0, 217, 163, 0.3)',
      },
      borderRadius: {
        'panel': '3px',
      },
    },
  },
  plugins: [],
}
