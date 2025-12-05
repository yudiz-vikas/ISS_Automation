/**
 * Test data management for various test scenarios
 */
export const testData = {
    user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
    },
    // Credentials for negative test scenarios
    invalidCredentials: {
        invalidEmail: 'invalid@example.com',
        invalidPassword: 'WrongPassword123',
        unverifiedEmail: 'unverified@example.com',
        unverifiedPassword: 'ValidPass123',
        // For case sensitivity testing
        emailUpperCase: 'STAGING_USER',
        emailMixedCase: 'Staging_User'
    },
    // Test data for invite users functionality
    inviteUsers: {
        // Valid users for testing
        standardUser: {
            name: 'Test Standard User',
            email: 'testuser' + Date.now() + '@mailinator.com',
            isAdmin: false
        },
        adminUser: {
            name: 'Test Admin User',
            email: 'testadmin' + Date.now() + '@mailinator.com',
            isAdmin: true
        },
        // Static email for duplicate testing
        duplicateUser: {
            name: 'Vikas Admin',
            email: 'vikas@mailinator.com', // This user already exists
            isAdmin: false
        },
        // Invalid email formats for validation testing
        invalidEmails: [
            'notanemail',
            'missing@domain',
            '@nodomain.com',
            'spaces in@email.com',
            'double@@domain.com',
            'trailing.dot.@domain.com'
        ],
        // Valid test data with Mailinator
        mailinatorUser: {
            name: 'Mailinator Test User',
            email: 'isstest' + Date.now() + '@mailinator.com',
            isAdmin: false
        }
    }
};
