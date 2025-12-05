import { expect } from '@playwright/test';
import { test } from '../fixtures/authFixture.js';
import { testData } from '../utils/testData.js';

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

    // Negative Test Cases
    test.describe('Negative Sign In Tests', () => {

        test('NG-01: Invalid Email + Valid Password should show "Invalid credentials"', async ({ signinPage, user }) => {
            await signinPage.navigate();

            // Use invalid email with valid password
            await signinPage.login(testData.invalidCredentials.invalidEmail, user.password);

            // Verify error message is displayed
            await expect(signinPage.errorToast).toBeVisible({ timeout: 5000 });

            // Check for error message containing relevant text
            const errorText = await signinPage.errorToast.textContent();
            expect(errorText.toLowerCase()).toMatch(/invalid|incorrect|credentials|username|password/);
        });

        test('NG-02: Valid Email + Invalid Password should show error', async ({ signinPage, user }) => {
            await signinPage.navigate();

            // Use valid email with invalid password
            await signinPage.login(user.username, testData.invalidCredentials.invalidPassword);

            // Verify error message is displayed
            await expect(signinPage.errorToast).toBeVisible({ timeout: 5000 });

            // Check for error message
            const errorText = await signinPage.errorToast.textContent();
            expect(errorText.toLowerCase()).toMatch(/invalid|incorrect|credentials|username|password/);
        });

        test('NG-03: Both Invalid Email and Password should show error', async ({ signinPage }) => {
            await signinPage.navigate();

            // Use both invalid email and password
            await signinPage.login(
                testData.invalidCredentials.invalidEmail,
                testData.invalidCredentials.invalidPassword
            );

            // Verify error message is displayed
            await expect(signinPage.errorToast).toBeVisible({ timeout: 5000 });

            // Check for error message
            const errorText = await signinPage.errorToast.textContent();
            expect(errorText.toLowerCase()).toMatch(/invalid|incorrect|credentials|username|password/);
        });

        test('NG-05: Attempt login with unverified email account', async ({ signinPage }) => {
            await signinPage.navigate();

            // Use unverified account credentials
            await signinPage.login(
                testData.invalidCredentials.unverifiedEmail,
                testData.invalidCredentials.unverifiedPassword
            );

            // Verify error message is displayed
            await expect(signinPage.errorToast).toBeVisible({ timeout: 5000 });

            // Check for error message related to unverified account or general error
            const errorText = await signinPage.errorToast.textContent();
            expect(errorText.toLowerCase()).toMatch(/unverified|verify|invalid|incorrect|credentials/);
        });

        test('NG-06: Attempt login with incorrect case (Email case sensitivity)', async ({ signinPage, user, page }) => {
            await signinPage.navigate();

            // Use uppercase version of valid username
            const upperCaseEmail = user.username.toUpperCase();
            await signinPage.login(upperCaseEmail, user.password);

            // Wait for response
            await page.waitForTimeout(3000);

            // Check URL first
            const currentUrl = page.url();
            const urlChanged = !currentUrl.includes('login');

            // Check if any toast/alert is visible
            const toastLocator = page.locator('[role="alert"]').first();
            const toastVisible = await toastLocator.isVisible().catch(() => false);

            // Document the behavior based on URL change and toast content
            if (toastVisible) {
                const toastText = await toastLocator.textContent();
                const isError = toastText.toLowerCase().match(/invalid|incorrect|credentials|username|password|error|failed/);
                const isSuccess = toastText.toLowerCase().match(/success|welcome|logged/);

                if (isError && !urlChanged) {
                    // System is case-sensitive - error shown and URL didn't change
                    expect(toastText.toLowerCase()).toMatch(/invalid|incorrect|credentials|username|password/);
                    console.log('✓ System is CASE-SENSITIVE for email addresses');
                } else if (isSuccess && urlChanged) {
                    // System is case-insensitive - success message and URL changed
                    expect(toastText.toLowerCase()).toMatch(/success|welcome|logged/);
                    expect(urlChanged).toBe(true);
                    console.log('✓ System is CASE-INSENSITIVE for email addresses - login succeeded with uppercase email');
                }
            } else if (urlChanged) {
                // No toast but URL changed - login succeeded (case-insensitive)
                expect(urlChanged).toBe(true);
                console.log('✓ System is CASE-INSENSITIVE for email addresses - login succeeded with uppercase email (no toast)');
            } else {
                // Neither error nor success - might need adjustment
                throw new Error('Unable to determine case sensitivity behavior - no toast and URL did not change');
            }
        });

    });

});
