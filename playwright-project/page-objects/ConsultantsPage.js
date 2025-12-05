export class ConsultantsPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // Locators
        this.addUserButton = page.locator('button', { hasText: /add user/i });
        this.pageTitle = page.locator('h1, h2').filter({ hasText: /consultants/i });
        this.consultantsTable = page.locator('table, [role="table"]');

        // Toast messages
        this.successToast = page.locator('[role="alert"]').filter({ hasText: /success/i });
        this.errorToast = page.locator('[role="alert"]').filter({ hasText: /error|failed/i });
    }

    /**
     * Navigate to Consultants page
     */
    async navigate() {
        await this.page.goto('/consultants');
    }

    /**
     * Click Add User button to navigate to Invite User page
     */
    async clickAddUser() {
        await this.addUserButton.click();
    }

    /**
     * Verify page is accessible (admin only)
     */
    async verifyPageLoaded() {
        await this.pageTitle.waitFor({ state: 'visible', timeout: 10000 });
    }

    /**
     * Check if user exists in consultants table
     * @param {string} email - Email address to search for
     */
    async isUserInTable(email) {
        const userRow = this.page.locator(`tr:has-text("${email}")`);
        return await userRow.isVisible().catch(() => false);
    }
}
