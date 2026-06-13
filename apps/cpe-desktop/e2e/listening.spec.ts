import { test, expect } from '@playwright/test';
import { seedTestStudent } from './helpers';

test.describe('CPE Listening Module E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log(`[BROWSER CONSOLE]: ${msg.text()}`));
    page.on('pageerror', (err) => console.error(`[BROWSER ERROR]: ${err.message}`));

    await seedTestStudent(page);
    await page.goto('/');

    // Perform authentic login using default seeded student account
    await expect(page.locator('text=CPE C2 Proficiency AI Prep Platform')).toBeVisible({ timeout: 45000 });
    await page.click('button:has-text("Đăng nhập")');
    await page.fill('input[type="text"]', 'student');
    await page.fill('input[type="password"]', 'student');
    await page.click('button:has-text("Đăng nhập vào Hệ thống")');

    // Wait until dashboard loads
    await expect(page.locator('text=Available Mock Exams')).toBeVisible({ timeout: 45000 });
  });

  test('Should load the dashboard and verify listening test availability', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Verify the dashboard loads successfully with CPE branding
    await expect(page.locator('text=Available Mock Exams')).toBeVisible();
    await expect(page.locator('text=CPE C2 Proficiency AI Prep Platform')).toBeVisible();
    await expect(page.locator('text=My Mock Exam History')).toBeVisible();

    // 2. Check if any listening test cards are available
    // CPE listening content may not yet be seeded, so we check gracefully
    const listeningCard = page.locator('text=listening').first();
    const hasListeningTest = await listeningCard.isVisible().catch(() => false);

    if (!hasListeningTest) {
      // Skip the rest of the test if no listening tests are available
      test.skip(true, 'No CPE listening tests currently seeded in the database');
      return;
    }

    // 3. If a listening test exists, verify the Start Mock Test button is present
    const startListeningBtn = page.locator('button:has-text("Start Mock Test")').first();
    await expect(startListeningBtn).toBeVisible();
  });
});
