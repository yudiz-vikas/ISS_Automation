/**
 * Locator Inspector Helper Script
 * 
 * This script helps identify the correct locators for the Invite Users page.
 * Run this in the browser console while on the Consultants or Invite User page.
 */

console.log('🔍 ISS Automation - Locator Inspector');
console.log('=====================================\n');

// Function to get element details
function getElementDetails(element, description) {
    if (!element) {
        console.log(`❌ ${description}: NOT FOUND`);
        return;
    }

    console.log(`✅ ${description}:`);
    console.log(`   Tag: ${element.tagName}`);
    if (element.id) console.log(`   ID: #${element.id}`);
    if (element.className) console.log(`   Classes: .${element.className.split(' ').join('.')}`);
    if (element.name) console.log(`   Name: ${element.name}`);
    if (element.type) console.log(`   Type: ${element.type}`);
    if (element.getAttribute('data-testid')) console.log(`   data-testid: ${element.getAttribute('data-testid')}`);
    if (element.getAttribute('aria-label')) console.log(`   aria-label: ${element.getAttribute('aria-label')}`);
    console.log(`   Text Content: "${element.textContent.trim().substring(0, 50)}..."`);
    console.log('');
}

// Consultants Page Elements
console.log('📄 CONSULTANTS PAGE ELEMENTS');
console.log('─────────────────────────────\n');

// Page title/heading
const consultantsTitle = document.querySelector('h1, h2, [class*="title"], [class*="heading"]');
getElementDetails(consultantsTitle, 'Page Title/Heading');

// Add User button
const addUserBtn = document.querySelector('button:has-text("Add"), button:has-text("Invite"), button:has-text("New"), [class*="add"]');
getElementDetails(addUserBtn, 'Add User Button');

// Alternative button search
const allButtons = document.querySelectorAll('button');
console.log(`📋 All Buttons on Page (${allButtons.length}):`);
allButtons.forEach((btn, index) => {
    if (btn.textContent.trim()) {
        console.log(`   ${index + 1}. "${btn.textContent.trim()}" - ${btn.className || 'no class'}`);
    }
});
console.log('');

// Consultants table
const table = document.querySelector('table, [role="table"], [class*="table"]');
getElementDetails(table, 'Consultants Table');

console.log('\n📝 INVITE USER PAGE ELEMENTS');
console.log('─────────────────────────────\n');

// Name field
const nameInput = document.querySelector('input[name*="name" i], input[placeholder*="name" i], input#name, input[id*="name"]');
getElementDetails(nameInput, 'Name Input Field');

// Email field
const emailInput = document.querySelector('input[type="email"], input[name*="email" i], input[placeholder*="email" i]');
getElementDetails(emailInput, 'Email Input Field');

// Admin checkbox
const adminCheckbox = document.querySelector('input[type="checkbox"]');
getElementDetails(adminCheckbox, 'Admin Checkbox');

// All checkboxes
const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
console.log(`📋 All Checkboxes (${allCheckboxes.length}):`);
allCheckboxes.forEach((cb, index) => {
    const label = cb.closest('label') || document.querySelector(`label[for="${cb.id}"]`);
    console.log(`   ${index + 1}. ID: ${cb.id || 'none'}, Label: ${label ? label.textContent.trim() : 'no label'}`);
});
console.log('');

// Submit/Add button
const submitBtn = document.querySelector('button[type="submit"], button:has-text("Add"), button:has-text("Invite"), button:has-text("Submit")');
getElementDetails(submitBtn, 'Submit/Add Button');

// Toast/Alert containers
const toastContainer = document.querySelector('[role="alert"], [class*="toast"], [class*="alert"], [class*="notification"]');
getElementDetails(toastContainer, 'Toast/Alert Container');

console.log('\n📋 SUGGESTED PLAYWRIGHT LOCATORS');
console.log('─────────────────────────────────\n');

if (consultantsTitle) {
    console.log('ConsultantsPage - pageTitle:');
    console.log(`   page.locator('${consultantsTitle.tagName.toLowerCase()}${consultantsTitle.id ? '#' + consultantsTitle.id : ''}${consultantsTitle.className ? '.' + consultantsTitle.className.split(' ')[0] : ''}')`);
}

if (addUserBtn) {
    console.log('\nConsultantsPage - addUserButton:');
    console.log(`   page.locator('button${addUserBtn.id ? '#' + addUserBtn.id : ''}${addUserBtn.className ? '.' + addUserBtn.className.split(' ')[0] : ''}')`);
}

if (nameInput) {
    console.log('\nInviteUserPage - nameField:');
    console.log(`   page.locator('input${nameInput.id ? '#' + nameInput.id : ''}${nameInput.name ? '[name="' + nameInput.name + '"]' : ''}')`);
}

if (emailInput) {
    console.log('\nInviteUserPage - emailField:');
    console.log(`   page.locator('input${emailInput.id ? '#' + emailInput.id : ''}${emailInput.name ? '[name="' + emailInput.name + '"]' : ''}')`);
}

if (adminCheckbox) {
    console.log('\nInviteUserPage - adminCheckbox:');
    console.log(`   page.locator('input[type="checkbox"]${adminCheckbox.id ? '#' + adminCheckbox.id : ''}${adminCheckbox.name ? '[name="' + adminCheckbox.name + '"]' : ''}')`);
}

console.log('\n✅ Inspection Complete!');
console.log('Copy the suggested locators above and update your page objects.');
