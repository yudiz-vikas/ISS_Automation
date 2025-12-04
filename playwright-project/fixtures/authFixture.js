import { test as base } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage.js';

/**
 * Auth fixture to handle login/session states.
 * This extends the base test with a custom 'loginPage' fixture
 * and a 'user' fixture that comes from the config.
 */
export const test = base.extend({
    // Define a user fixture that reads from the project config
    user: async ({ }, use, testInfo) => {
        // Access credentials defined in the config's 'use' block
        const credentials = testInfo.project.use.credentials || { username: 'guest', password: 'pwd' };
        await use(credentials);
    },

    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    // Example of an authenticated page fixture
    authenticatedPage: async ({ page, loginPage, user }, use) => {
        await loginPage.navigate();
        await loginPage.login(user.username, user.password);
        // Wait for navigation or verification here
        await use(page);
    },
});
