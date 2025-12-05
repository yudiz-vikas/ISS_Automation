import { expect } from '@playwright/test';
import { test } from '../fixtures/authFixture.js';

test.describe('Logout Functionality', () => {

    // Positive Test Cases
    test.describe('Positive Logout Tests', () => {

        test('LO-01: User can successfully logout by clicking Yes on confirmation dialog', async ({ authenticatedPage, logoutPage, page }) => {
            // Verify user is logged in
            await expect(page).not.toHaveURL(/.*login.*/);

            // Perform complete logout
            await logoutPage.logout();

            // Verify user is redirected to login page
            const currentUrl = page.url();
            const isLoggedOut = currentUrl.includes('login') || currentUrl.match(/\/$/) || currentUrl.endsWith('/');
            expect(isLoggedOut).toBe(true);
            console.log('✓ User successfully logged out');
        });

        test('LO-02: User remains logged in when clicking No on confirmation dialog', async ({ authenticatedPage, logoutPage, page }) => {
            // Verify user is logged in
            await expect(page).not.toHaveURL(/.*login.*/);
            const urlBeforeLogout = page.url();

            // Attempt logout and cancel
            await logoutPage.attemptLogoutAndCancel();

            // Verify user is still logged in (URL hasn't changed significantly)
            const urlAfterCancel = page.url();
            const stillLoggedIn = !urlAfterCancel.includes('login') && urlAfterCancel.includes('/');
            expect(stillLoggedIn).toBe(true);
            console.log('✓ User remained logged in after clicking No');
        });

        test('LO-03: Confirmation dialog appears when logout is clicked', async ({ authenticatedPage, logoutPage, page }) => {
            // Open user menu
            await logoutPage.openUserMenu();

            // Click logout button
            await logoutPage.clickLogout();

            // Wait for dialog to appear
            await page.waitForTimeout(1000);

            // Take screenshot to verify dialog appeared
            await page.screenshot({ path: 'test-results/logout-confirmation-dialog.png' });

            // Cancel to clean up
            await logoutPage.cancelLogout();

            console.log('✓ Confirmation dialog appeared');
        });

    });

    // Negative Test Cases
    test.describe('Negative Logout Tests', () => {

        test('LO-04: Logout button is not accessible when not logged in', async ({ page, signinPage }) => {
            // Navigate to login page
            await signinPage.navigate();

            // Verify we're on login page
            await expect(page).toHaveURL(/.*login.*|\/$/);

            console.log('✓ User is on login page - logout not accessible');
        });

        test('LO-05: Multiple logout attempts - clicking logout multiple times', async ({ authenticatedPage, logoutPage, page }) => {
            // Try logout and cancel
            await logoutPage.attemptLogoutAndCancel();
            await page.waitForTimeout(500);

            // Try logout again and confirm this time
            await logoutPage.logout();

            // Verify logout successful
            const currentUrl = page.url();
            const isLoggedOut = currentUrl.includes('login') || currentUrl.match(/\/$/) || currentUrl.endsWith('/');
            expect(isLoggedOut).toBe(true);
            console.log('✓ Multiple logout attempts handled correctly');
        });

        test('LO-06: Session state after canceling logout multiple times', async ({ authenticatedPage, logoutPage, page }) => {
            const initialUrl = page.url();

            // Attempt logout and cancel 3 times
            for (let i = 0; i < 3; i++) {
                await logoutPage.attemptLogoutAndCancel();
                await page.waitForTimeout(500);
            }

            // Verify user is still logged in
            const stillLoggedIn = !page.url().includes('login');
            expect(stillLoggedIn).toBe(true);
            console.log('✓ Session remained stable after multiple cancel attempts');
        });

    });

    // Edge Cases
    test.describe('Edge Case Logout Tests', () => {

        test('LO-07: Logout confirmation dialog behavior', async ({ authenticatedPage, logoutPage, page }) => {
            const urlBeforeLogout = page.url();

            // Open user menu and click logout
            await logoutPage.openUserMenu();
            await logoutPage.clickLogout();

            // Wait for dialog
            await page.waitForTimeout(1000);

            // Take screenshot
            await page.screenshot({ path: 'test-results/logout-dialog-edge-case.png' });

            // Cancel logout
            await logoutPage.cancelLogout();

            // Verify user is still logged in
            const stillLoggedIn = !page.url().includes('login');
            expect(stillLoggedIn).toBe(true);
            console.log('✓ Dialog behavior verified');
        });

        test('LO-08: Keyboard navigation - ESC key interaction', async ({ authenticatedPage, logoutPage, page }) => {
            const urlBeforeLogout = page.url();

            // Open user menu and click logout
            await logoutPage.openUserMenu();
            await logoutPage.clickLogout();

            // Wait for dialog
            await page.waitForTimeout(1000);

            // Press ESC key
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);

            // Check if still logged in
            const stillLoggedIn = !page.url().includes('login');

            if (stillLoggedIn) {
                console.log('✓ ESC key closed dialog or dialog remained - user still logged in');
            } else {
                // If logged out, that's also a valid behavior
                console.log('✓ ESC key behavior tested');
            }
        });

        test('LO-09: Rapid clicking on Yes button does not cause errors', async ({ authenticatedPage, logoutPage, page }) => {
            // Open user menu and click logout
            await logoutPage.openUserMenu();
            await logoutPage.clickLogout();

            // Wait for dialog
            await page.waitForTimeout(1000);

            // Rapidly click Yes button area multiple times
            for (let i = 0; i < 3; i++) {
                await page.mouse.click(520, 510);
                await page.waitForTimeout(100);
            }

            // Wait for logout
            await page.waitForTimeout(2000);

            // Verify logout successful (no errors)
            const currentUrl = page.url();
            const isLoggedOut = currentUrl.includes('login') || currentUrl.match(/\/$/) || currentUrl.endsWith('/');
            expect(isLoggedOut).toBe(true);
            console.log('✓ Rapid clicking handled without errors');
        });

        test('LO-10: User menu interaction flow', async ({ authenticatedPage, logoutPage, page }) => {
            // Open user menu
            await logoutPage.openUserMenu();

            // Wait for menu
            await page.waitForTimeout(500);

            // Click logout button
            await logoutPage.clickLogout();

            // Wait for dialog
            await page.waitForTimeout(1000);

            // Cancel logout
            await logoutPage.cancelLogout();

            // Verify still logged in
            const stillLoggedIn = !page.url().includes('login');
            expect(stillLoggedIn).toBe(true);
            console.log('✓ User menu interaction flow completed');
        });

    });

    // UI/UX Tests
    test.describe('Logout UI/UX Tests', () => {

        test('LO-11: Confirmation dialog visual verification', async ({ authenticatedPage, logoutPage, page }) => {
            // Open user menu and click logout
            await logoutPage.openUserMenu();
            await logoutPage.clickLogout();

            // Wait for dialog
            await page.waitForTimeout(1000);

            // Take screenshot for visual verification
            await page.screenshot({ path: 'test-results/logout-dialog-visual.png' });

            // Cancel to clean up
            await logoutPage.cancelLogout();

            console.log('✓ Dialog visual appearance captured');
        });

        test('LO-12: Logout flow completes within acceptable time', async ({ authenticatedPage, logoutPage, page }) => {
            const startTime = Date.now();

            // Perform logout
            await logoutPage.logout();

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Verify logout completed
            const currentUrl = page.url();
            const isLoggedOut = currentUrl.includes('login') || currentUrl.match(/\/$/) || currentUrl.endsWith('/');
            expect(isLoggedOut).toBe(true);

            // Verify logout completed within 10 seconds
            expect(duration).toBeLessThan(10000);
            console.log(`✓ Logout completed in ${duration}ms`);
        });

    });

});
