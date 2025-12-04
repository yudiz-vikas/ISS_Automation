import { test as base } from '@playwright/test';
import { SigninPage } from '../page-objects/SigninPage.js';

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

    signinPage: async ({ page }, use) => {
        const signinPage = new SigninPage(page);
        await use(signinPage);
    },

    // Example of an authenticated page fixture
    authenticatedPage: async ({ page, signinPage, user }, use) => {
        await signinPage.navigate();
        await signinPage.login(user.username, user.password);
        // Wait for navigation or verification here
        await use(page);
    },
});
