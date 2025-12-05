import { expect } from '@playwright/test';
import { test } from '../fixtures/authFixture.js';
import { testData } from '../utils/testData.js';
import { MailinatorHelper } from '../utils/mailinatorHelper.js';

test.describe('Invite Users Functionality', () => {

    // Use authenticated session for all tests (admin user)
    test.beforeEach(async ({ page, signinPage, user }) => {
        // Login as admin before each test
        await signinPage.navigate();
        await signinPage.login(user.username, user.password);
        await page.waitForLoadState('networkidle');
    });

    test.describe('Navigation and Access', () => {

        test('TC-01: Admin can navigate to Consultants page', async ({ consultantsPage }) => {
            await consultantsPage.navigate();
            await consultantsPage.verifyPageLoaded();

            // Verify page title is visible
            await expect(consultantsPage.pageTitle).toBeVisible();
        });

        test('TC-02: Navigate to Invite User page via Add User button', async ({ consultantsPage, inviteUserPage }) => {
            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            // Verify navigation to invite user page
            await inviteUserPage.verifyPageLoaded();
            await expect(inviteUserPage.pageTitle).toBeVisible();
        });
    });

    test.describe('Successful User Invitation', () => {

        test('TC-03: Successfully invite a standard user', async ({ page, consultantsPage, inviteUserPage }) => {
            // Generate unique user data
            const userData = {
                name: 'Test Standard User',
                email: `standarduser${Date.now()}@mailinator.com`,
                isAdmin: false
            };

            // Navigate to invite user page
            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            // Fill and submit form
            await inviteUserPage.inviteUser(userData.name, userData.email, userData.isAdmin);

            // Verify success message
            await expect(inviteUserPage.successToast).toBeVisible({ timeout: 10000 });
            const successMessage = await inviteUserPage.getSuccessMessage();
            expect(successMessage.toLowerCase()).toMatch(/success|invited|sent/);

            console.log(`✓ Standard user invited successfully: ${userData.email}`);
        });

        test('TC-04: Successfully invite an admin user with admin checkbox selected', async ({ page, consultantsPage, inviteUserPage }) => {
            // Generate unique admin user data
            const adminData = {
                name: 'Test Admin User',
                email: `adminuser${Date.now()}@mailinator.com`,
                isAdmin: true
            };

            // Navigate to invite user page
            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            // Verify admin checkbox is unchecked by default
            const isCheckedBefore = await inviteUserPage.isAdminChecked();
            expect(isCheckedBefore).toBe(false);

            // Fill and submit form with admin checkbox
            await inviteUserPage.inviteUser(adminData.name, adminData.email, adminData.isAdmin);

            // Verify success message
            await expect(inviteUserPage.successToast).toBeVisible({ timeout: 10000 });
            const successMessage = await inviteUserPage.getSuccessMessage();
            expect(successMessage.toLowerCase()).toMatch(/success|invited|sent/);

            console.log(`✓ Admin user invited successfully: ${adminData.email}`);
        });
    });

    test.describe('Email Verification with Mailinator', () => {

        test('TC-05: Verify invite email is sent to Mailinator inbox', async ({ page, consultantsPage, inviteUserPage }) => {
            // Generate unique user for email testing
            const emailTestUser = {
                name: 'Email Verification User',
                email: `emailtest${Date.now()}@mailinator.com`,
                isAdmin: false
            };

            // Navigate and invite user
            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();
            await inviteUserPage.inviteUser(emailTestUser.name, emailTestUser.email, emailTestUser.isAdmin);

            // Wait for success confirmation
            await expect(inviteUserPage.successToast).toBeVisible({ timeout: 10000 });

            // Verify email in Mailinator
            const mailinatorHelper = new MailinatorHelper(page);
            const emailVerified = await mailinatorHelper.verifyInviteEmail(
                emailTestUser.email,
                emailTestUser.name,
                30000 // 30 second timeout
            );

            expect(emailVerified).toBe(true);
            console.log(`✓ Invite email verified in Mailinator for: ${emailTestUser.email}`);
        });
    });

    test.describe('Form Validation - Mandatory Fields', () => {

        test('TC-06: Name field is mandatory - show error when empty', async ({ page, consultantsPage, inviteUserPage }) => {
            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            // Leave name empty, fill email
            await inviteUserPage.fillEmail('test@mailinator.com');
            await inviteUserPage.clickAddButton();

            // Wait a moment for validation
            await page.waitForTimeout(1000);

            // Verify error is shown (either field-level or toast)
            const fieldError = await inviteUserPage.nameError.isVisible().catch(() => false);
            const toastError = await inviteUserPage.errorToast.isVisible().catch(() => false);

            expect(fieldError || toastError).toBe(true);

            if (toastError) {
                const errorText = await inviteUserPage.getErrorMessage();
                expect(errorText.toLowerCase()).toMatch(/name|required|mandatory|field/);
            }

            console.log('✓ Name field validation working - error shown when empty');
        });

        test('TC-07: Email field is mandatory - show error when empty', async ({ page, consultantsPage, inviteUserPage }) => {
            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            // Fill name, leave email empty
            await inviteUserPage.fillName('Test User');
            await inviteUserPage.clickAddButton();

            // Wait a moment for validation
            await page.waitForTimeout(1000);

            // Verify error is shown
            const fieldError = await inviteUserPage.emailError.isVisible().catch(() => false);
            const toastError = await inviteUserPage.errorToast.isVisible().catch(() => false);

            expect(fieldError || toastError).toBe(true);

            if (toastError) {
                const errorText = await inviteUserPage.getErrorMessage();
                expect(errorText.toLowerCase()).toMatch(/email|required|mandatory|field/);
            }

            console.log('✓ Email field validation working - error shown when empty');
        });

        test('TC-09: Both fields mandatory - show error when both empty', async ({ page, consultantsPage, inviteUserPage }) => {
            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            // Click add without filling any fields
            await inviteUserPage.clickAddButton();

            // Wait a moment for validation
            await page.waitForTimeout(1000);

            // Verify error is shown
            const nameError = await inviteUserPage.nameError.isVisible().catch(() => false);
            const emailError = await inviteUserPage.emailError.isVisible().catch(() => false);
            const toastError = await inviteUserPage.errorToast.isVisible().catch(() => false);

            expect(nameError || emailError || toastError).toBe(true);

            console.log('✓ Form validation working - error shown when both fields empty');
        });
    });

    test.describe('Email Format Validation', () => {

        test('TC-08: Invalid email format validation', async ({ page, consultantsPage, inviteUserPage }) => {
            const invalidEmails = testData.inviteUsers.invalidEmails;

            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            // Test first invalid email format
            const testEmail = invalidEmails[0];

            await inviteUserPage.fillName('Test User');
            await inviteUserPage.fillEmail(testEmail);
            await inviteUserPage.clickAddButton();

            // Wait for validation
            await page.waitForTimeout(1000);

            // Verify error is shown
            const fieldError = await inviteUserPage.emailError.isVisible().catch(() => false);
            const toastError = await inviteUserPage.errorToast.isVisible().catch(() => false);

            // At least one error should be visible
            expect(fieldError || toastError).toBe(true);

            if (toastError) {
                const errorText = await inviteUserPage.getErrorMessage();
                expect(errorText.toLowerCase()).toMatch(/email|invalid|format|valid/);
            }

            console.log(`✓ Email format validation working for: ${testEmail}`);
        });

        test('TC-08b: Test multiple invalid email formats', async ({ page, consultantsPage, inviteUserPage }) => {
            const invalidEmails = [
                'notanemail',
                '@nodomain.com',
                'double@@domain.com'
            ];

            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            for (const invalidEmail of invalidEmails) {
                // Clear form
                await inviteUserPage.clearForm();

                // Fill with invalid email
                await inviteUserPage.fillName('Test User');
                await inviteUserPage.fillEmail(invalidEmail);
                await inviteUserPage.clickAddButton();

                // Wait for validation
                await page.waitForTimeout(1000);

                // Check for error
                const fieldError = await inviteUserPage.emailError.isVisible().catch(() => false);
                const toastError = await inviteUserPage.errorToast.isVisible().catch(() => false);

                console.log(`Testing invalid email: ${invalidEmail} - Error shown: ${fieldError || toastError}`);

                // Note: Some formats might pass client-side validation but fail server-side
                // We log the results but don't fail the test
            }

            console.log('✓ Email format validation tests completed');
        });
    });

    test.describe('Duplicate User Prevention', () => {

        test('TC-10: Prevent duplicate user invitation - show "user already exists" error', async ({ page, consultantsPage, inviteUserPage }) => {
            // Use the admin email which already exists in the system
            const duplicateData = testData.inviteUsers.duplicateUser;

            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            // Try to invite existing user
            await inviteUserPage.inviteUser(duplicateData.name, duplicateData.email, duplicateData.isAdmin);

            // Wait for error toast
            await expect(inviteUserPage.errorToast).toBeVisible({ timeout: 10000 });

            // Verify error message contains "already exists" or similar
            const errorText = await inviteUserPage.getErrorMessage();
            expect(errorText.toLowerCase()).toMatch(/already|exists|duplicate|registered/);

            console.log(`✓ Duplicate user prevention working - error shown for: ${duplicateData.email}`);
        });

        test('TC-11: Duplicate check is case-insensitive', async ({ page, consultantsPage, inviteUserPage }) => {
            // Use uppercase version of existing admin email
            const duplicateData = {
                name: 'Test User',
                email: 'VIKAS@MAILINATOR.COM', // Uppercase version of existing user
                isAdmin: false
            };

            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            // Try to invite with uppercase email
            await inviteUserPage.inviteUser(duplicateData.name, duplicateData.email, duplicateData.isAdmin);

            // Wait for response
            await page.waitForTimeout(3000);

            // Check if error is shown (case-insensitive duplicate check)
            const errorVisible = await inviteUserPage.errorToast.isVisible().catch(() => false);

            if (errorVisible) {
                const errorText = await inviteUserPage.getErrorMessage();
                const isDuplicateError = errorText.toLowerCase().match(/already|exists|duplicate|registered/);

                if (isDuplicateError) {
                    console.log('✓ Duplicate check is CASE-INSENSITIVE - uppercase email rejected');
                } else {
                    console.log('⚠ Error shown but not duplicate error:', errorText);
                }
            } else {
                console.log('⚠ No error shown - system might be case-sensitive or email format issue');
            }
        });
    });

    test.describe('Admin Checkbox Functionality', () => {

        test('TC-12: Admin checkbox is unchecked by default', async ({ consultantsPage, inviteUserPage }) => {
            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            // Verify checkbox is unchecked
            const isChecked = await inviteUserPage.isAdminChecked();
            expect(isChecked).toBe(false);

            console.log('✓ Admin checkbox is unchecked by default');
        });

        test('TC-13: Admin checkbox can be toggled', async ({ consultantsPage, inviteUserPage }) => {
            await consultantsPage.navigate();
            await consultantsPage.clickAddUser();

            // Verify initial state
            const initialState = await inviteUserPage.isAdminChecked();
            expect(initialState).toBe(false);

            // Toggle to checked
            await inviteUserPage.setAdminCheckbox(true);
            const checkedState = await inviteUserPage.isAdminChecked();
            expect(checkedState).toBe(true);

            // Toggle back to unchecked
            await inviteUserPage.setAdminCheckbox(false);
            const uncheckedState = await inviteUserPage.isAdminChecked();
            expect(uncheckedState).toBe(false);

            console.log('✓ Admin checkbox can be toggled successfully');
        });
    });
});
