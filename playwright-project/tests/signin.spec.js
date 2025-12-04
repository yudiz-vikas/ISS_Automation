import { expect } from '@playwright/test';
import { test } from '../fixtures/authFixture.js';

test.describe('Sign In Functionality', () => {

    test('should sign in successfully with valid credentials', async ({ page, signinPage, user }) => {
        await signinPage.navigate();
        await signinPage.login(user.username, user.password);

        // Verify navigation to home/dashboard
        // Since we don't have a specific element yet, we check the URL or title
        // Expecting URL to not contain 'login' or 'signin' after success
        await expect(page).not.toHaveURL(/.*login.*/);
        // Or check for a common dashboard element if known, e.g.
        // await expect(page.locator('h1')).toBeVisible();
    });

    test('should display error message with invalid credentials', async ({ page, signinPage }) => {
        await signinPage.navigate();
        await signinPage.login('invalid@example.com', 'WrongPass123');

        // Verify error toast message
        await expect(signinPage.errorToast).toBeVisible();
        await expect(signinPage.errorToast).toContainText('Incorrect username or password. Please try again.');

        // Verify user is NOT signed in (still on login page)
        // Assuming the URL stays the same or contains 'login'
        // await expect(page).toHaveURL(/.*login.*/); 
    });

    test('should navigate to forgot password page', async ({ page, signinPage }) => {
        await signinPage.navigate();
        await signinPage.forgotPasswordLink.click();

        // Verify navigation to forgot password page
        await expect(page).toHaveURL(/.*forgot-password.*/);
    });

});
