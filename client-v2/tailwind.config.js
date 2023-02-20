const plugin = require('tailwindcss/plugin')
const colors = require('./colors.json')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,css,ts}'],
    theme: {
        extend: {
            colors,
            fontSize: { md: '0.95rem' },
            boxShadow: {
                header: `
                    0 13px 10px -10px theme(colors.tinted.900),
                    0 10px 20px -25px theme(colors.tinted.900),
                    0 25px 30px -35px theme(colors.tinted.900)
                `,
                footer: `
                    0 -13px 10px -10px theme(colors.tinted.900),
                    0 -10px 20px -25px theme(colors.tinted.900),
                    0 -25px 30px -35px theme(colors.tinted.900)
                `,
            },
        },
    },
    plugins: [
        plugin(({ addVariant }) => {
            addVariant('hover', '@media (hover: hover) { &:is( :hover, :focus-visible ) }')
            addVariant('not-hover', '@media (hover: hover) { &:not( :hover, :focus-visible ) }')
            addVariant('hoverable', '@media (hover: hover)')
            addVariant('not-hoverable', '@media (hover: none)')
        }),
    ],
}
