import { test as base } from '@playwright/test';
import { SigninPage } from '../page-objects/SigninPage.js';
import { LogoutPage } from '../page-objects/LogoutPage.js';
import { ConsultantsPage } from '../page-objects/ConsultantsPage.js';
import { InviteUserPage } from '../page-objects/InviteUserPage.js';
import { ForgotPasswordPage } from '../page-objects/ForgotPasswordPage.js';
import { ResetPasswordPage } from '../page-objects/ResetPasswordPage.js';

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

    logoutPage: async ({ page }, use) => {
        const logoutPage = new LogoutPage(page);
        await use(logoutPage);
    },

    consultantsPage: async ({ page }, use) => {
        const consultantsPage = new ConsultantsPage(page);
        await use(consultantsPage);
    },

    inviteUserPage: async ({ page }, use) => {
        const inviteUserPage = new InviteUserPage(page);
        await use(inviteUserPage);
    },

    forgotPasswordPage: async ({ page }, use) => {
        const forgotPasswordPage = new ForgotPasswordPage(page);
        await use(forgotPasswordPage);
    },

    resetPasswordPage: async ({ page }, use) => {
        const resetPasswordPage = new ResetPasswordPage(page);
        await use(resetPasswordPage);
    },

    // Example of an authenticated page fixture
    authenticatedPage: async ({ page, signinPage, user }, use) => {
        await signinPage.navigate();
        await signinPage.login(user.username, user.password);
        // Wait for navigation or verification here
        await use(page);
    },
});
