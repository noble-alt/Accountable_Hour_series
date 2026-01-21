const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
        await page.goto('http://localhost:3000/sign-up.html');
        await page.evaluate(() => localStorage.clear());
    });

    test('should sign up a new user and log them in automatically', async ({ page }) => {
        await page.goto('http://localhost:3000/sign-up.html');

        const email = `test_${Date.now()}@example.com`;

        await page.fill('input[name="fullname"]', 'Test User');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'password123');

        // Note: script.js now uses a 1.5s delay and on-page message instead of alert
        await page.click('.continue-btn');

        // Wait for redirection
        await page.waitForURL(url => url.pathname.endsWith('index.html') || url.pathname === '/', { timeout: 10000 });

        const userBtn = page.locator('.nav-actions .btn-solid');
        await expect(userBtn).toContainText('Hi Test');

        const loginBtn = page.locator('.nav-actions .btn-outline');
        await expect(loginBtn).toBeHidden();
    });

    test('should logout when user clicks their name and confirms', async ({ page }) => {
        // Mock a login session
        await page.goto('http://localhost:3000/index.html');
        await page.evaluate(() => {
            localStorage.setItem('token', 'fake-token');
            localStorage.setItem('user', JSON.stringify({ fullname: 'Logout Test' }));
        });
        await page.reload();

        const userBtn = page.locator('.nav-actions .btn-solid');
        await expect(userBtn).toContainText('Hi Logout');

        // Handle confirmation dialog
        page.on('dialog', dialog => dialog.accept());

        await userBtn.click();

        // Wait for reload/redirect
        await expect(userBtn).toHaveText('Meet Mentors');
        const loginBtn = page.locator('.nav-actions .btn-outline');
        await expect(loginBtn).toBeVisible();
    });
});
