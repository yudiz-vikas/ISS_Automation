import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config.js';

export default defineConfig({
    ...baseConfig,
    use: {
        ...baseConfig.use,
        baseURL: 'https://staging.example.com',
        // Custom credentials for this environment
        credentials: {
            username: 'staging_user',
            password: 'staging_password'
        }
    },
});
