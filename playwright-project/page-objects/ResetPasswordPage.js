export class ResetPasswordPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // Reset Password Page Elements
        this.newPasswordInput = page.locator('input[type="password"]').first();
        this.confirmPasswordInput = page.locator('input[type="password"]').nth(1);
        this.submitButton = page.locator('button[type="submit"], button').filter({ hasText: /reset|submit|save|confirm/i }).first();
        this.cancelButton = page.locator('button[type="button"], a').filter({ hasText: /^cancel$/i }).first();
        this.backButton = page.locator('button[type="button"], a').filter({ hasText: /^back$/i }).first();

        // Error/Success Messages
        this.passwordMismatchError = page.locator('text=/passwords.*must.*same|passwords.*match/i').first();
        this.passwordCriteriaError = page.locator('text=/password.*criteria|minimum.*8.*characters|uppercase|lowercase|number/i').first();
        this.successMessage = page.locator('[role="alert"], .success-message, .toast-success').filter({ hasText: /success|updated|changed/i }).first();
        this.errorMessage = page.locator('[role="alert"], .error-message, .toast-error').first();

        // Password criteria indicators (if shown separately)
        this.minLengthIndicator = page.locator('text=/minimum.*8|8.*characters/i').first();
        this.uppercaseIndicator = page.locator('text=/uppercase|upper.*case|1.*upper/i').first();
        this.lowercaseIndicator = page.locator('text=/lowercase|lower.*case|1.*lower/i').first();
        this.numberIndicator = page.locator('text=/number|digit|1.*number/i').first();
    }

    /**
     * Navigate to reset password page with token
     */
    async navigate(token = '') {
        if (token) {
            await this.page.goto(`/reset-password?token=${token}`);
        } else {
            await this.page.goto('/reset-password');
        }
    }

    /**
     * Enter new password
     */
    async enterNewPassword(password) {
        await this.newPasswordInput.fill(password);
    }

    /**
     * Enter confirm password
     */
    async enterConfirmPassword(password) {
        await this.confirmPasswordInput.fill(password);
    }

    /**
     * Click submit button
     */
    async clickSubmit() {
        await this.submitButton.click();
    }

    /**
     * Click cancel button
     */
    async clickCancel() {
        await this.cancelButton.click();
    }

    /**
     * Click back button
     */
    async clickBack() {
        await this.backButton.click();
    }

    /**
     * Complete password reset flow
     */
    async resetPassword(newPassword, confirmPassword) {
        await this.enterNewPassword(newPassword);
        await this.enterConfirmPassword(confirmPassword);
        await this.clickSubmit();
    }

    /**
     * Check if on reset password page
     */
    async isOnResetPasswordPage() {
        const url = this.page.url();
        return url.includes('reset-password') || url.includes('change-password');
    }

    /**
     * Validate password meets criteria
     */
    validatePasswordCriteria(password) {
        const criteria = {
            minLength: password.length >= 8,
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password)
        };

        const allMet = Object.values(criteria).every(met => met);

        return {
            ...criteria,
            allMet
        };
    }
}
