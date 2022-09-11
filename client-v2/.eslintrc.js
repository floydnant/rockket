module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        rootDir: './',
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: 'tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended', 'prettier'],
    root: true,
    env: {
        browser: true,
        es2021: true,
    },
    overrides: [],
    ignorePatterns: ['.eslintrc.js', 'tailwind.config.js', 'postcss.config.js'],
    rules: {
        'linebreak-style': ['error', 'unix'],
        'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    },
}
