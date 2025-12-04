/**
 * Environment utility to help pick correct config or data.
 * Since we are using --config flags, this helper can be used
 * to inspect the current environment if needed by tests.
 */
export default class Env {
    static getBaseUrl() {
        return process.env.BASE_URL || 'https://localhost';
    }

    static getCredentials() {
        // In a real scenario, this might fetch from a secure vault or process.env
        return {
            username: process.env.TEST_USERNAME || 'default_user',
            password: process.env.TEST_PASSWORD || 'default_pass'
        };
    }
}
