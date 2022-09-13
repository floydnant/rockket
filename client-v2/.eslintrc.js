module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        rootDir: './',
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: 'tsconfig.json',
    },
    plugins: ['@typescript-eslint', 'tailwindcss'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'prettier',
        'plugin:tailwindcss/recommended',
    ],
    root: true,
    env: {
        browser: true,
        es2021: true,
    },
    overrides: [
        {
            files: ['*.html'],
            parser: '@html-eslint/parser',
            // extends: ['plugin:prettier/recommended', 'prettier', 'plugin:tailwindcss/recommended'],
        },
    ],
    ignorePatterns: ['.eslintrc.js', 'tailwind.config.js', 'postcss.config.js', 'karma.conf.js', 'src/index.html'],
    rules: {
        'linebreak-style': ['error', 'unix'],
        'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    },
}
