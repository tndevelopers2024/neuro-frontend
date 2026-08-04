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
        'card': '20px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 24px rgba(7, 26, 92, 0.04)',
        'elevated': '0 10px 30px rgba(7, 26, 92, 0.08)',
        'glowBlue': '0 0 25px rgba(18, 107, 238, 0.25)',
      },
    },
  },
  plugins: [],
};
