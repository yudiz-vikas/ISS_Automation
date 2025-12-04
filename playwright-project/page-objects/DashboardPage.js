export class DashboardPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.header = page.locator('h1.dashboard-header');
        this.menu = page.locator('nav.main-menu');
    }

    async getHeaderText() {
        return await this.header.innerText();
    }

    async navigateToProfile() {
        await this.menu.getByText('Profile').click();
    }
}
