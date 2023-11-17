import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4200',
        supportFile: './cypress/support/e2e.ts',

        video: true,
        videosFolder: './.cypress/e2e/videos',
        screenshotsFolder: './.cypress/e2e/screenshots',
        downloadsFolder: './.cypress/e2e/downloads',
    },

    component: {
        devServer: {
            framework: 'angular',
            bundler: 'webpack',
        },
        specPattern: '**/*.test.ts',

        video: true,
        videosFolder: './.cypress/component/videos',
        screenshotsFolder: './.cypress/component/screenshots',
        downloadsFolder: './.cypress/component/downloads',
    },
})
