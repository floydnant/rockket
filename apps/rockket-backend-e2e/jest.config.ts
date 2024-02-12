import { Config } from 'jest'

/* eslint-disable */
export default {
    displayName: 'rockket-backend-e2e',
    preset: '../../jest.preset.js',
    globalSetup: '<rootDir>/src/support/global-setup.ts',
    globalTeardown: '<rootDir>/src/support/global-teardown.ts',
    setupFiles: ['<rootDir>/src/support/test-setup.ts'],
    testEnvironment: 'node',
    testMatch: ['**/*.e2e-spec.ts'],
    maxWorkers: 1,
    transform: {
        '^.+\\.[tj]s$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    moduleFileExtensions: ['ts', 'js', 'html', 'json'],
    coverageDirectory: '../../coverage/rockket-backend-e2e',
} satisfies Config
