export class InviteUserPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // Form field locators
        this.nameField = page.locator('input[name="name"], input#name, input[placeholder*="name" i]').first();
        this.emailField = page.locator('input[name="email"], input#email, input[type="email"]').first();
        this.adminCheckbox = page.locator('input[type="checkbox"][name*="admin" i], input[type="checkbox"]#admin').first();
        this.addButton = page.locator('button', { hasText: /add|invite|submit/i });

        // Page title
        this.pageTitle = page.locator('h1, h2').filter({ hasText: /invite|add user/i });

        // Toast messages
        this.successToast = page.locator('[role="alert"]').filter({ hasText: /success|invited|sent/i });
        this.errorToast = page.locator('[role="alert"]').filter({ hasText: /error|failed|exists|already/i });

        // Validation error messages (field-level)
        this.nameError = page.locator('[id*="name"][class*="error"], .error:near(input[name="name"])').first();
        this.emailError = page.locator('[id*="email"][class*="error"], .error:near(input[type="email"])').first();
    }

    /**
     * Navigate to Invite User page
     */
    async navigate() {
        await this.page.goto('/invite-user');
    }

    /**
     * Fill name field
     * @param {string} name - User's name
     */
    async fillName(name) {
        await this.nameField.fill(name);
    }

    /**
     * Fill email field
     * @param {string} email - User's email address
     */
    async fillEmail(email) {
        await this.emailField.fill(email);
    }

    /**
     * Toggle admin checkbox
     * @param {boolean} checked - Whether to check or uncheck
     */
    async setAdminCheckbox(checked) {
        const isChecked = await this.adminCheckbox.isChecked();
        if (checked !== isChecked) {
            await this.adminCheckbox.click();
        }
    }

    /**
     * Click Add/Invite button
     */
    async clickAddButton() {
        await this.addButton.click();
    }

    /**
     * Complete invite user flow
     * @param {string} name - User's name
     * @param {string} email - User's email address
     * @param {boolean} isAdmin - Whether user should be admin (default: false)
     */
    async inviteUser(name, email, isAdmin = false) {
        await this.fillName(name);
        await this.fillEmail(email);
        if (isAdmin) {
            await this.setAdminCheckbox(true);
        }
        await this.clickAddButton();
    }

    /**
     * Verify page is loaded
     */
    async verifyPageLoaded() {
        await this.pageTitle.waitFor({ state: 'visible', timeout: 10000 });
    }

    /**
     * Clear all form fields
     */
    async clearForm() {
        await this.nameField.clear();
        await this.emailField.clear();
        const isChecked = await this.adminCheckbox.isChecked();
        if (isChecked) {
            await this.adminCheckbox.click();
        }
    }

    /**
     * Get error toast message text
     */
    async getErrorMessage() {
        await this.errorToast.waitFor({ state: 'visible', timeout: 5000 });
        return await this.errorToast.textContent();
    }

    /**
     * Get success toast message text
     */
    async getSuccessMessage() {
        await this.successToast.waitFor({ state: 'visible', timeout: 5000 });
        return await this.successToast.textContent();
    }

    /**
     * Check if admin checkbox is checked
     */
    async isAdminChecked() {
        return await this.adminCheckbox.isChecked();
    }
}
