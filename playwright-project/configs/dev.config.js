import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config.js';

export default defineConfig({
    ...baseConfig,
    use: {
        ...baseConfig.use,
        baseURL: 'https://dev.example.com',
        // Custom credentials for this environment
        credentials: {
            username: 'dev_user',
            password: 'dev_password'
        }
    },
});
