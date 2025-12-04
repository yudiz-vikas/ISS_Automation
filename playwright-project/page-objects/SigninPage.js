export class SigninPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.emailInput = page.locator('input#input-email');
        this.passwordInput = page.locator('input#input-password');
        this.signinButton = page.locator('button', { hasText: 'Sign in' });
        this.forgotPasswordLink = page.locator('button', { hasText: 'Forgot password?' });
        this.errorToast = page.locator('text="Incorrect username or password. Please try again."');
    }

    async navigate() {
        await this.page.goto('/');
    }

    async login(username, password) {
        await this.emailInput.fill(username);
        await this.passwordInput.fill(password);
        await this.signinButton.click();
    }
}
