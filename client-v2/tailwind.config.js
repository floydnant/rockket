const colors = require('./colors.json')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,css,ts}'],
    theme: {
        extend: { colors },
    },
    plugins: [],
}
