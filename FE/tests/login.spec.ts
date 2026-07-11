import { test, expect } from '@playwright/test';
test('test login', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/login');
  await page.fill('#email', 'admin@gmail.com');
  await page.fill('#password', 'wrongpassword');
  await page.click('button[type="submit"]');
  // Wait for 5 seconds to see what happens
  await page.waitForTimeout(5000);
});
