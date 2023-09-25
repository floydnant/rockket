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
        plugin(({ addUtilities }) => {
            addUtilities({
                '.glass': {
                    '@supports (backdrop-filter: blur(10px))': {
                        '--tw-bg-opacity': '0.5',
                        '--tw-backdrop-blur': 'blur(16px)',
                        'backdrop-filter':
                            'var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia)',
                    },
                },
                '.child-focus-ring': {
                    '&:has(:focus, :focus-visible)': {
                        // ring-2
                        '--tw-ring-offset-shadow':
                            'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
                        '--tw-ring-shadow':
                            'var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
                        'box-shadow':
                            'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)',

                        // !ring-primary-400
                        '--tw-ring-opacity': '1 !important',
                        '--tw-ring-color': `${colors.primary[400]} !important`,
                    },
                },
            })
        }),
    ],
}
