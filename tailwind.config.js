/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#071A5C',
        primaryBlue: '#126BEE',
        cyan: '#13A7B5',
        medicalGreen: '#21A447',
        medicalPurple: '#7435D5',
        medicalPink: '#DB2674',
        medicalOrange: '#F17B18',
        background: '#FFFFFF',
        secondaryBg: '#F8FAFF',
        borderLine: '#E7ECF5',
        textColor: '#071A5C',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(7, 26, 92, 0.03)',
        'elevated': '0 6px 16px rgba(7, 26, 92, 0.06)',
        'glowBlue': '0 0 15px rgba(18, 107, 238, 0.15)',
      },
    },
  },
  plugins: [],
};
