/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    screens: {
      ns: { min: '30rem' }, // 480px
      m: { min: '30rem', max: '60em' }, // 480px - 960px
      l: { min: '60em' }, // 960px
    },
    colors: {
      grey: {
        900: '#454f5f',
        600: '#a9b4c4',
        500: '#a9b4c4',
        400: '#e3ebf2',
        300: '#e3ebf2',
        200: '#f6f9fb',
        100: '#f6f9fb',
      },
      'action-orange': '#fb6c1c',
      'action-orange-light': '#ffe9d7',
      'action-orange-dark': '#ef4800',
      'primary-blue': '#2e3149',
      'dark-blue': '#2e3149',
      'secondary-blue-extralight': '#ebf8ff',
      'secondary-blue-dark': '#33b6ff',
      'secondary-red-light': '#ffe6eb',
      'secondary-red-dark': '#ed1818',
      'secondary-green-light': '#daf3e5',
      'secondary-green-dark': '#58c78a',
      'secondary-purple-light': '#f0e4ff',
      transparent: 'transparent',
      white: '#fff',
      'hd-action': '#f2e3149',
      'hd-action-dark': '#2e3149',
      'hd-base': '#2e3149',
      'hd-menu-text-color': '#2e3149',
      'hd-active-menu-text-color': '#ef4800',
      'hd-confirm': '#58c78a',
      'hd-base-light': '#ebf8ff',
      'hd-menu-color': '#ebf8ff',
    },
    extends: {
      boxShadow: {
        'shadow-2': '0 0 8px 2px rgba( 0, 0, 0, .2 )',
      },
      transitionProperty: {
        color: 'color',
      },
    },
  },
  plugins: [],
}
