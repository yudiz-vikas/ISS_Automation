import { expect } from '@playwright/test';

/**
 * Mailinator Helper - Utilities for email verification using Mailinator API
 * Mailinator provides a public API for accessing emails sent to @mailinator.com addresses
 */

const MAILINATOR_API_BASE = 'https://mailinator.com/api/v2';
const MAILINATOR_INBOX_URL = 'https://www.mailinator.com/v4/public/inboxes.jsp';

/**
 * Helper class for Mailinator email operations
 */
export class MailinatorHelper {
    constructor(page) {
        this.page = page;
    }

    /**
     * Extract inbox name from email address
     * @param {string} email - Full email address (e.g., test@mailinator.com)
     * @returns {string} - Inbox name (e.g., test)
     */
    static getInboxName(email) {
        return email.split('@')[0];
    }

    /**
     * Navigate to Mailinator inbox in browser
     * @param {string} email - Email address to check
     */
    async openInbox(email) {
        const inboxName = MailinatorHelper.getInboxName(email);
        await this.page.goto(`${MAILINATOR_INBOX_URL}?zone=public&query=${inboxName}`);
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Wait for email to arrive in Mailinator inbox
     * @param {string} email - Email address to check
     * @param {string} subject - Expected email subject (partial match)
     * @param {number} timeout - Timeout in milliseconds (default: 30000)
     * @returns {Promise<boolean>} - True if email found
     */
    async waitForEmail(email, subject, timeout = 30000) {
        await this.openInbox(email);

        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            // Refresh inbox
            await this.page.reload();
            await this.page.waitForLoadState('networkidle');

            // Look for email with matching subject
            const emailRow = this.page.locator(`tr:has-text("${subject}")`).first();
            const isVisible = await emailRow.isVisible().catch(() => false);

            if (isVisible) {
                console.log(`✓ Email found with subject: "${subject}"`);
                return true;
            }

            // Wait before next check
            await this.page.waitForTimeout(2000);
        }

        console.log(`✗ Email not found with subject: "${subject}" after ${timeout}ms`);
        return false;
    }

    /**
     * Get the latest email from inbox
     * @param {string} email - Email address to check
     * @param {string} subject - Expected email subject (partial match)
     * @returns {Promise<Object|null>} - Email details or null
     */
    async getLatestEmail(email, subject) {
        await this.openInbox(email);

        // Find email row with matching subject
        const emailRow = this.page.locator(`tr:has-text("${subject}")`).first();
        const isVisible = await emailRow.isVisible().catch(() => false);

        if (!isVisible) {
            return null;
        }

        // Click to open email
        await emailRow.click();
        await this.page.waitForTimeout(2000);

        // Get email content
        const emailContent = await this.page.locator('.message-body, .email-body, iframe').first().textContent();

        return {
            subject: subject,
            content: emailContent
        };
    }

    /**
     * Extract password creation link from email content
     * @param {string} emailContent - Email body content
     * @returns {string|null} - Password creation link or null
     */
    static extractPasswordLink(emailContent) {
        // Look for common patterns in invite emails
        const patterns = [
            /https?:\/\/[^\s]+\/create-password[^\s]*/gi,
            /https?:\/\/[^\s]+\/set-password[^\s]*/gi,
            /https?:\/\/[^\s]+\/password[^\s]*token=[^\s]*/gi,
            /https?:\/\/[^\s]+\?token=[^\s]*/gi
        ];

        for (const pattern of patterns) {
            const match = emailContent.match(pattern);
            if (match) {
                return match[0];
            }
        }

        return null;
    }

    /**
     * Extract password reset link from email content
     * @param {string} emailContent - Email body content
     * @returns {string|null} - Password reset link or null
     */
    static extractPasswordResetLink(emailContent) {
        // Look for password reset link patterns
        const patterns = [
            /https?:\/\/[^\s]+\/reset-password[^\s]*/gi,
            /https?:\/\/[^\s]+\/password-reset[^\s]*/gi,
            /https?:\/\/[^\s]+\/forgot-password[^\s]*token=[^\s]*/gi,
            /https?:\/\/[^\s]+\/reset[^\s]*token=[^\s]*/gi,
            /https?:\/\/[^\s]+\?token=[^\s]*/gi
        ];

        for (const pattern of patterns) {
            const match = emailContent.match(pattern);
            if (match) {
                return match[0];
            }
        }

        return null;
    }

    /**
     * Get password reset link from email
     * @param {string} email - Email address to check
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<string|null>} - Reset link or null
     */
    async getPasswordResetLink(email, timeout = 30000) {
        console.log(`Checking for password reset email in: ${email}`);

        // Wait for email with reset/password in subject
        const emailFound = await this.waitForEmail(email, 'reset', timeout).catch(() => false) ||
            await this.waitForEmail(email, 'password', timeout).catch(() => false);

        if (!emailFound) {
            console.log('✗ Password reset email not found');
            return null;
        }

        // Get email content
        const emailData = await this.getLatestEmail(email, 'reset') ||
            await this.getLatestEmail(email, 'password');

        if (!emailData) {
            console.log('✗ Could not retrieve email content');
            return null;
        }

        // Extract reset link
        const resetLink = MailinatorHelper.extractPasswordResetLink(emailData.content);

        if (resetLink) {
            console.log(`✓ Password reset link found: ${resetLink}`);
            return resetLink;
        } else {
            console.log('✗ Password reset link not found in email');
            return null;
        }
    }

    /**
     * Verify invite email was received and contains expected content
     * @param {string} email - Email address to check
     * @param {string} userName - Expected user name in email
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<boolean>} - True if email verified successfully
     */
    async verifyInviteEmail(email, userName, timeout = 30000) {
        console.log(`Checking Mailinator inbox for: ${email}`);

        // Wait for email to arrive
        const emailFound = await this.waitForEmail(email, 'invite', timeout);

        if (!emailFound) {
            console.log('✗ Invite email not found');
            return false;
        }

        // Get email details
        const emailData = await this.getLatestEmail(email, 'invite');

        if (!emailData) {
            console.log('✗ Could not retrieve email content');
            return false;
        }

        // Verify email contains user name
        const containsName = emailData.content.includes(userName);
        console.log(`Email contains user name "${userName}": ${containsName}`);

        // Extract password link
        const passwordLink = MailinatorHelper.extractPasswordLink(emailData.content);
        if (passwordLink) {
            console.log(`✓ Password creation link found: ${passwordLink}`);
        } else {
            console.log('⚠ Password creation link not found in email');
        }

        return emailFound && containsName;
    }

    /**
     * Verify password reset email was received
     * @param {string} email - Email address to check
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<boolean>} - True if email verified successfully
     */
    async verifyPasswordResetEmail(email, timeout = 30000) {
        console.log(`Verifying password reset email for: ${email}`);

        const resetLink = await this.getPasswordResetLink(email, timeout);
        return resetLink !== null;
    }

    /**
     * Clear inbox (navigate to inbox and delete all emails)
     * Note: Mailinator public inboxes auto-expire, so manual cleanup is optional
     * @param {string} email - Email address inbox to clear
     */
    async clearInbox(email) {
        await this.openInbox(email);

        // Look for delete all button if available
        const deleteAllBtn = this.page.locator('button:has-text("Delete All"), a:has-text("Delete All")');
        const isVisible = await deleteAllBtn.isVisible().catch(() => false);

        if (isVisible) {
            await deleteAllBtn.click();
            console.log(`✓ Cleared inbox for: ${email}`);
        } else {
            console.log('⚠ Delete all button not found - inbox will auto-expire');
        }
    }

    /**
     * Generate unique Mailinator email address
     * @param {string} prefix - Email prefix (default: 'test')
     * @returns {string} - Generated email address
     */
    static generateEmail(prefix = 'test') {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `${prefix}${timestamp}${random}@mailinator.com`;
    }
}

/**
 * Standalone helper function for quick email verification
 * @param {Page} page - Playwright page object
 * @param {string} email - Email to check
 * @param {string} userName - Expected user name
 * @param {number} timeout - Timeout in ms
 */
export async function verifyInviteEmailReceived(page, email, userName, timeout = 30000) {
    const helper = new MailinatorHelper(page);
    return await helper.verifyInviteEmail(email, userName, timeout);
}

/**
 * Standalone helper function for password reset email verification
 * @param {Page} page - Playwright page object
 * @param {string} email - Email to check
 * @param {number} timeout - Timeout in ms
 */
export async function verifyPasswordResetEmailReceived(page, email, timeout = 30000) {
    const helper = new MailinatorHelper(page);
    return await helper.verifyPasswordResetEmail(email, timeout);
}
