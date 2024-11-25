/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js}', './views/**/*.ejs', './public/**/*.js'],
  theme: {
    extend: {
      colors: {
        primary: '#c0c0c0',
        orange: '#ff8c00',
        visited: '#aaf',
      },
    },
  },
  plugins: [],
};
