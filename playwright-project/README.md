# Playwright Automation Framework

This project is a Playwright automation framework using JavaScript (ES Modules).

## Structure

- **configs/**: Environment-specific configurations (dev, staging, prod).
- **fixtures/**: Test fixtures for setup/teardown and data injection.
- **page-objects/**: Page Object Model (POM) classes.
- **utils/**: Utility functions and environment helpers.
- **tests/**: Test specifications.

## Running Tests

To run tests in a specific environment:

```bash
npm run test:staging
# OR
npx playwright test --config=configs/staging.config.js
```
