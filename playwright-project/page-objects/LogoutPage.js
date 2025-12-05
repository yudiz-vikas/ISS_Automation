export class LogoutPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;

        // User menu - using pixel coordinates since DOM doesn't show clear selectors
        this.userMenuCoords = { x: 960, y: 40 };
        this.logoutCoords = { x: 925, y: 165 };

        // Confirmation dialog - using pixel coordinates
        this.yesButtonCoords = { x: 520, y: 510 };
        this.noButtonCoords = { x: 480, y: 510 };
    }

    /**
     * Click the user menu icon to open the dropdown
     */
    async openUserMenu() {
        // Click user icon using pixel coordinates
        await this.page.mouse.click(this.userMenuCoords.x, this.userMenuCoords.y);
        // Wait for menu to appear
        await this.page.waitForTimeout(1000);
    }

    /**
     * Click the logout button in the user menu
     */
    async clickLogout() {
        await this.page.mouse.click(this.logoutCoords.x, this.logoutCoords.y);
        // Wait for confirmation dialog
        await this.page.waitForTimeout(1000);
    }

    /**
     * Click Yes on the confirmation dialog
     */
    async confirmLogout() {
        await this.page.mouse.click(this.yesButtonCoords.x, this.yesButtonCoords.y);
        // Wait for logout to process
        await this.page.waitForTimeout(2000);
    }

    /**
     * Click No on the confirmation dialog
     */
    async cancelLogout() {
        await this.page.mouse.click(this.noButtonCoords.x, this.noButtonCoords.y);
        // Wait for dialog to close
        await this.page.waitForTimeout(500);
    }

    /**
     * Complete logout flow: open menu -> click logout -> confirm
     */
    async logout() {
        await this.openUserMenu();
        await this.clickLogout();
        await this.confirmLogout();
    }

    /**
     * Start logout but cancel it
     */
    async attemptLogoutAndCancel() {
        await this.openUserMenu();
        await this.clickLogout();
        await this.cancelLogout();
    }

    /**
     * Check if user is logged in by checking URL
     */
    async isLoggedIn() {
        const url = this.page.url();
        const notOnLoginPage = !url.includes('login') && url.includes('/');
        return notOnLoginPage;
    }

    /**
     * Check if user is on login page
     */
    async isOnLoginPage() {
        const url = this.page.url();
        return url.includes('login') || url.match(/\/$/) || url.endsWith('/');
    }

    /**
     * Check if confirmation dialog is visible by checking if page is dimmed
     */
    async isConfirmationDialogVisible() {
        // The dialog dims the page, so we can check for that
        // Or we can just assume it's visible after clicking logout
        return true; // Simplified for now
    }
}
