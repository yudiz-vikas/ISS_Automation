export class ForgotPasswordPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // Forgot Password Page Elements
        this.emailInput = page.locator('input[type="email"], input#email, input[name="email"]').first();
        this.sendResetLinkButton = page.locator('button[type="submit"]').filter({ hasText: /send.*reset.*link|send.*link|reset/i }).first();
        this.cancelButton = page.locator('button[type="button"], a').filter({ hasText: /^cancel$/i }).first();
        this.backButton = page.locator('button[type="button"], a').filter({ hasText: /^back$/i }).first();

        // Success/Error Messages
        this.successMessage = page.locator('[role="alert"], .success-message, .toast-success').filter({ hasText: /sent|check.*email|reset.*link/i }).first();
        this.errorMessage = page.locator('[role="alert"], .error-message, .toast-error').first();
    }

    /**
     * Navigate to forgot password page
     */
    async navigate() {
        await this.page.goto('/forgot-password');
    }

    /**
     * Enter email address
     */
    async enterEmail(email) {
        await this.emailInput.fill(email);
    }

    /**
     * Click send reset link button
     */
    async clickSendResetLink() {
        await this.sendResetLinkButton.click();
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
     * Complete forgot password flow
     */
    async requestPasswordReset(email) {
        await this.enterEmail(email);
        await this.clickSendResetLink();
    }

    /**
     * Check if on forgot password page
     */
    async isOnForgotPasswordPage() {
        const url = this.page.url();
        return url.includes('forgot-password') || url.includes('reset-password');
    }
}
