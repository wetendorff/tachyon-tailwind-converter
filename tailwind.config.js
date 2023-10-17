/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    screens: {
      ns: { min: '30rem' }, // 480px
      m: { min: '30rem', max: '60em' }, // 480px - 960px
      l: { min: '60em' }, // 960px
    },
  },
  plugins: [],
}
