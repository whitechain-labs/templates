// Tailwind v4 is wired through its PostCSS plugin. There is no tailwind.config:
// Tailwind v4 is CSS-first, configured from globals.css.
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
