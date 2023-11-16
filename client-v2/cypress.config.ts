import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4200',
        supportFile: './cypress/support/e2e.ts',
        video: true,
    },

    component: {
        devServer: {
            framework: 'angular',
            bundler: 'webpack',
        },
        specPattern: '**/*.test.ts',
        video: true,
    },
})
