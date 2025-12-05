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

## Allure Reporting

This project uses Allure for rich, interactive test reporting.

> [!IMPORTANT]
> Old Allure results and reports are **automatically deleted** before each test run to ensure only the latest results are stored.

### Generating Reports

After running tests, generate and view the Allure report:

```bash
# Generate the report
npm run allure:generate

# Open the report in your browser
npm run allure:open

# Or do both in one command
npm run allure:serve
```

### Cleaning Reports

To clean up Allure results and reports:

```bash
npm run allure:clean
```

### Report Features

Allure reports provide:
- Test execution overview with pass/fail statistics
- Detailed test case information with execution time
- Screenshots, videos, and traces for failed tests
- Test history and trends across multiple runs
- Test categorization and severity levels

### Report Location

- **Results**: `allure-results/` (raw test data)
- **Report**: `allure-report/` (generated HTML report)

