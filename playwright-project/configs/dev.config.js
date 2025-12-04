import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config.js';

export default defineConfig({
    ...baseConfig,
    testDir: '../tests',
    use: {
        ...baseConfig.use,
        baseURL: 'https://iss-dev.lc.webdevprojects.cloud/',
        // Custom credentials for this environment
        credentials: {
            username: 'vikas@mailinator.com',
            password: 'Test@123'
        }
    },
});
