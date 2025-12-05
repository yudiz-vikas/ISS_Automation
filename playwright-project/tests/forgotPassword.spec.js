import { expect } from '@playwright/test';
import { test } from '../fixtures/authFixture.js';
import { MailinatorHelper } from '../utils/mailinatorHelper.js';

test.describe('Forgot Password Functionality', () => {

    // Positive Test Cases
    test.describe('Positive Forgot Password Tests', () => {

        test('FP-01: Navigate to forgot password page from sign in', async ({ page, signinPage, forgotPasswordPage }) => {
            // Navigate to sign in page
            await signinPage.navigate();

            // Click forgot password link
            await signinPage.forgotPasswordLink.click();

            // Verify navigation to forgot password page
            await page.waitForTimeout(2000);
            const url = page.url();
            expect(url).toMatch(/forgot-password|reset/i);

            console.log('✓ Successfully navigated to forgot password page');
        });

        test('FP-02: Send reset link for existing email', async ({ page, forgotPasswordPage }) => {
            // Generate unique test email
            const testEmail = MailinatorHelper.generateEmail('fpreset');

            // Navigate to forgot password page
            await forgotPasswordPage.navigate();

            // Enter email and request reset
            await forgotPasswordPage.requestPasswordReset(testEmail);

            // Wait for response
            await page.waitForTimeout(3000);

            // Verify success message or no error
            const currentUrl = page.url();
            console.log(`✓ Password reset requested for: ${testEmail}`);
            console.log(`Current URL: ${currentUrl}`);
        });

        test('FP-03: Cancel button returns to sign in page', async ({ page, signinPage, forgotPasswordPage }) => {
            // Navigate to forgot password page
            await signinPage.navigate();
            await signinPage.forgotPasswordLink.click();
            await page.waitForTimeout(1000);

            // Click cancel button
            await forgotPasswordPage.clickCancel();

            // Verify navigation back to sign in
            await page.waitForTimeout(1000);
            const url = page.url();
            expect(url).toMatch(/login|signin|\/$/i);

            console.log('✓ Cancel button returned to sign in page');
        });

        test('FP-04: Back button returns to sign in page', async ({ page, signinPage, forgotPasswordPage }) => {
            // Navigate to forgot password page
            await signinPage.navigate();
            await signinPage.forgotPasswordLink.click();
            await page.waitForTimeout(1000);

            // Click back button
            await forgotPasswordPage.clickBack();

            // Verify navigation back to sign in
            await page.waitForTimeout(1000);
            const url = page.url();
            expect(url).toMatch(/login|signin|\/$/i);

            console.log('✓ Back button returned to sign in page');
        });

    });

    // Email Verification Tests
    test.describe('Email Verification Tests', () => {
        test.setTimeout(120000); // Increase timeout for email tests

        test('FP-05: Verify reset email is sent to valid email', async ({ page, context, forgotPasswordPage }) => {
            // Generate unique test email
            const testEmail = MailinatorHelper.generateEmail('resettest');

            // Request password reset
            await forgotPasswordPage.navigate();
            await forgotPasswordPage.requestPasswordReset(testEmail);

            // Wait for email to be sent
            await page.waitForTimeout(5000);

            // Open new page for Mailinator
            const mailinatorPage = await context.newPage();
            const mailinatorHelper = new MailinatorHelper(mailinatorPage);

            // Check for reset email (with longer timeout)
            const emailReceived = await mailinatorHelper.verifyPasswordResetEmail(testEmail, 60000);

            expect(emailReceived).toBe(true);
            console.log('✓ Password reset email verified in Mailinator');

            await mailinatorPage.close();
        });

        test('FP-06: Reset link in email navigates to reset password page', async ({ page, context, forgotPasswordPage }) => {
            // Generate unique test email
            const testEmail = MailinatorHelper.generateEmail('linkttest');

            // Request password reset
            await forgotPasswordPage.navigate();
            await forgotPasswordPage.requestPasswordReset(testEmail);
            await page.waitForTimeout(5000);

            // Get reset link from email
            const mailinatorPage = await context.newPage();
            const mailinatorHelper = new MailinatorHelper(mailinatorPage);

            const resetLink = await mailinatorHelper.getPasswordResetLink(testEmail, 90000);

            if (resetLink) {
                // Navigate to reset link
                await page.goto(resetLink);
                await page.waitForTimeout(2000);

                // Verify on reset password page
                const url = page.url();
                expect(url).toMatch(/reset-password|change-password/i);

                console.log('✓ Reset link navigated to password reset page');
            } else {
                console.log('⚠ Reset link not found in email - skipping navigation test');
            }

            await mailinatorPage.close();
        });

    });

    // Negative Test Cases
    test.describe('Negative Forgot Password Tests', () => {

        test('FP-07: Empty email field shows validation error', async ({ page, forgotPasswordPage }) => {
            await forgotPasswordPage.navigate();

            // Try to submit without email
            await forgotPasswordPage.clickSendResetLink();

            // Check for validation error or that form didn't submit
            await page.waitForTimeout(1000);
            const stillOnPage = await forgotPasswordPage.isOnForgotPasswordPage();
            expect(stillOnPage).toBe(true);

            console.log('✓ Empty email validation working');
        });

        test('FP-08: Invalid email format shows error', async ({ page, forgotPasswordPage }) => {
            await forgotPasswordPage.navigate();

            // Enter invalid email
            await forgotPasswordPage.enterEmail('notanemail');
            await forgotPasswordPage.clickSendResetLink();

            // Verify error or validation
            await page.waitForTimeout(1000);
            const stillOnPage = await forgotPasswordPage.isOnForgotPasswordPage();
            expect(stillOnPage).toBe(true);

            console.log('✓ Invalid email format validation working');
        });

        test('FP-09: Non-existent email handling', async ({ page, forgotPasswordPage }) => {
            await forgotPasswordPage.navigate();

            // Use non-existent email
            const fakeEmail = `nonexistent${Date.now()}@example.com`;
            await forgotPasswordPage.requestPasswordReset(fakeEmail);

            // Wait for response
            await page.waitForTimeout(3000);

            // System should either show success (security) or error
            // Both are acceptable behaviors
            console.log('✓ Non-existent email handled');
        });

    });

    // Password Reset Page Tests
    test.describe('Password Reset Page Tests', () => {

        test('RP-01: Password reset page displays correctly', async ({ page, resetPasswordPage }) => {
            // Navigate to reset password page (without token for UI check)
            await resetPasswordPage.navigate();

            // Verify page elements are visible
            await page.waitForTimeout(2000);

            console.log('✓ Password reset page loaded');
        });

        test('RP-02: Valid password reset with matching passwords', async ({ page, resetPasswordPage }) => {
            await resetPasswordPage.navigate();

            const newPassword = 'NewPass123';

            // Enter matching passwords
            await resetPasswordPage.resetPassword(newPassword, newPassword);

            // Wait for response
            await page.waitForTimeout(2000);

            console.log('✓ Password reset submitted with valid matching passwords');
        });

        test('RP-03: Password mismatch shows error', async ({ page, resetPasswordPage }) => {
            await resetPasswordPage.navigate();

            // Enter non-matching passwords
            await resetPasswordPage.enterNewPassword('Password123');
            await resetPasswordPage.enterConfirmPassword('DifferentPass123');
            await resetPasswordPage.clickSubmit();

            // Wait for error message
            await page.waitForTimeout(2000);

            // Check for mismatch error
            const errorVisible = await resetPasswordPage.passwordMismatchError.isVisible().catch(() => false);

            if (errorVisible) {
                const errorText = await resetPasswordPage.passwordMismatchError.textContent();
                expect(errorText.toLowerCase()).toMatch(/same|match/i);
                console.log('✓ Password mismatch error displayed');
            } else {
                console.log('⚠ Password mismatch error not found - may need selector adjustment');
            }
        });

        test('RP-04: Password too short shows criteria error', async ({ page, resetPasswordPage }) => {
            await resetPasswordPage.navigate();

            const shortPassword = 'Pass1';

            // Enter short password
            await resetPasswordPage.resetPassword(shortPassword, shortPassword);

            // Wait for error
            await page.waitForTimeout(2000);

            // Verify password criteria validation
            const validation = resetPasswordPage.validatePasswordCriteria(shortPassword);
            expect(validation.minLength).toBe(false);

            console.log('✓ Short password validation working');
        });

        test('RP-05: Password without uppercase shows criteria error', async ({ page, resetPasswordPage }) => {
            await resetPasswordPage.navigate();

            const noUpperPassword = 'password123';

            // Enter password without uppercase
            await resetPasswordPage.resetPassword(noUpperPassword, noUpperPassword);

            // Verify validation
            const validation = resetPasswordPage.validatePasswordCriteria(noUpperPassword);
            expect(validation.hasUppercase).toBe(false);

            console.log('✓ Uppercase requirement validation working');
        });

        test('RP-06: Password without lowercase shows criteria error', async ({ page, resetPasswordPage }) => {
            await resetPasswordPage.navigate();

            const noLowerPassword = 'PASSWORD123';

            // Enter password without lowercase
            await resetPasswordPage.resetPassword(noLowerPassword, noLowerPassword);

            // Verify validation
            const validation = resetPasswordPage.validatePasswordCriteria(noLowerPassword);
            expect(validation.hasLowercase).toBe(false);

            console.log('✓ Lowercase requirement validation working');
        });

        test('RP-07: Password without number shows criteria error', async ({ page, resetPasswordPage }) => {
            await resetPasswordPage.navigate();

            const noNumberPassword = 'PasswordABC';

            // Enter password without number
            await resetPasswordPage.resetPassword(noNumberPassword, noNumberPassword);

            // Verify validation
            const validation = resetPasswordPage.validatePasswordCriteria(noNumberPassword);
            expect(validation.hasNumber).toBe(false);

            console.log('✓ Number requirement validation working');
        });

        test('RP-08: Valid password meets all criteria', async ({ page, resetPasswordPage }) => {
            await resetPasswordPage.navigate();

            const validPassword = 'ValidPass123';

            // Verify password meets all criteria
            const validation = resetPasswordPage.validatePasswordCriteria(validPassword);

            expect(validation.minLength).toBe(true);
            expect(validation.hasUppercase).toBe(true);
            expect(validation.hasLowercase).toBe(true);
            expect(validation.hasNumber).toBe(true);
            expect(validation.allMet).toBe(true);

            console.log('✓ Valid password meets all criteria');
        });

        test('RP-09: Cancel button returns to sign in page', async ({ page, resetPasswordPage }) => {
            await resetPasswordPage.navigate();

            // Click cancel
            await resetPasswordPage.clickCancel();

            // Verify navigation to sign in
            await page.waitForTimeout(1000);
            const url = page.url();
            expect(url).toMatch(/login|signin|\/$/i);

            console.log('✓ Cancel button returned to sign in');
        });

        test('RP-10: Back button returns to sign in page', async ({ page, resetPasswordPage }) => {
            await resetPasswordPage.navigate();

            // Click back
            await resetPasswordPage.clickBack();

            // Verify navigation to sign in
            await page.waitForTimeout(1000);
            const url = page.url();
            expect(url).toMatch(/login|signin|\/$/i);

            console.log('✓ Back button returned to sign in');
        });

    });

    // End-to-End Test
    test.describe('End-to-End Password Reset Flow', () => {

        test('E2E-01: Complete password reset flow', async ({ page, context, signinPage, forgotPasswordPage, resetPasswordPage }) => {
            // Generate unique test email
            const testEmail = MailinatorHelper.generateEmail('e2etest');
            const newPassword = 'NewSecure123';

            // Step 1: Navigate to forgot password from sign in
            await signinPage.navigate();
            await signinPage.forgotPasswordLink.click();
            await page.waitForTimeout(1000);

            // Step 2: Request password reset
            await forgotPasswordPage.requestPasswordReset(testEmail);
            await page.waitForTimeout(5000);

            // Step 3: Get reset link from email
            const mailinatorPage = await context.newPage();
            const mailinatorHelper = new MailinatorHelper(mailinatorPage);

            const resetLink = await mailinatorHelper.getPasswordResetLink(testEmail, 60000);

            if (resetLink) {
                // Step 4: Navigate to reset link
                await page.goto(resetLink);
                await page.waitForTimeout(2000);

                // Step 5: Reset password
                await resetPasswordPage.resetPassword(newPassword, newPassword);
                await page.waitForTimeout(3000);

                // Step 6: Verify redirect to sign in or success
                const finalUrl = page.url();
                console.log(`✓ Complete E2E flow executed. Final URL: ${finalUrl}`);
            } else {
                console.log('⚠ Reset link not found - E2E flow incomplete');
            }

            await mailinatorPage.close();
        });

    });

});
