import { test as base } from '@playwright/test';
import { testData } from '../utils/testData.js';

/**
 * Fixture to load test data.
 */
export const test = base.extend({
    data: async ({ }, use) => {
        // Here you could load dynamic data if needed
        await use(testData);
    },
});
