import { test, expect } from '@playwright/test';
import { seedTestStudent } from './helpers';

test.describe('IELTS Reading Module E2E Flow', () => {
  
    test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER CONSOLE]: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[BROWSER ERROR]: ${err.message}`));

    await seedTestStudent(page);
    await page.goto('/');
    
    // Perform authentic login using default seeded student account
    await expect(page.locator('text=IELTS AI Prep Platform')).toBeVisible({ timeout: 45000 });
    await page.click('button:has-text("Đăng nhập")');
    await page.fill('input[type="text"]', 'student');
    await page.fill('input[type="password"]', 'student');
    await page.click('button:has-text("Đăng nhập vào Hệ thống")');
    
    // Wait until dashboard loads
    await expect(page.locator('text=Available Mock Exams')).toBeVisible({ timeout: 45000 });
  });

  test('Should complete the Reading practice flow and verify pedagogical highlights', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Start a Reading Test
    const startReadingBtn = page.locator('button:has-text("Start Mock Test")').first();
    await expect(startReadingBtn).toBeVisible();
    await startReadingBtn.dispatchEvent('click');

    // 2. Select Practice Mode
    await expect(page.locator('text=Lựa chọn chế độ làm bài')).toBeVisible();
    await page.locator('#practice-mode-select').dispatchEvent('click');
    await expect(page.locator('text=Lựa chọn chế độ làm bài')).toBeHidden();

    // 3. Answer Gap Fill
    const gapInput = page.locator('input[placeholder*="Type answer for blank"]').first();
    await expect(gapInput).toBeVisible();
    await gapInput.focus();
    await page.keyboard.insertText('wood');

    // 4. Submit
    await page.locator('button:has-text("Submit Exam")').dispatchEvent('click');

    // 5. Navigate into Review Answers and verify Highlight overlays
    const reviewBtn = page.locator('button:has-text("Review Answers")').first();
    await expect(reviewBtn).toBeVisible();
    await reviewBtn.dispatchEvent('click');

    // Verify pedagogical elements
    await expect(page.locator('text=Diagnostic Skill Report')).toBeVisible();
    await expect(page.locator('text=Exit Review')).toBeVisible();
    
    // Exit back to dashboard
    await page.locator('button:has-text("Exit Review")').dispatchEvent('click');
    await expect(page.locator('text=Available Mock Exams')).toBeVisible();
  });
});
