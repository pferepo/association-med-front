/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#fafafa',
        card: '#141414',
        'card-foreground': '#fafafa',
        primary: '#3ecf8e',
        'primary-foreground': '#0a0a0a',
        secondary: '#1f1f1f',
        'secondary-foreground': '#fafafa',
        muted: '#262626',
        'muted-foreground': '#a3a3a3',
        accent: '#1f1f1f',
        'accent-foreground': '#fafafa',
        destructive: '#ef4444',
        'destructive-foreground': '#fafafa',
        border: '#262626',
        input: '#262626',
        ring: '#3ecf8e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
