import { defineConfig } from '@playwright/test';
import baseConfig from '../playwright.config.js';

export default defineConfig({
    ...baseConfig,
    use: {
        ...baseConfig.use,
        baseURL: 'https://prod.example.com',
        // Custom credentials for this environment
        credentials: {
            username: 'prod_user',
            password: 'prod_password'
        }
    },
});
