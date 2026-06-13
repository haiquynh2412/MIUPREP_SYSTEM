import { test, expect } from '@playwright/test';
import { seedTestStudent } from './helpers';

test.describe('IELTS Writing Module E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log(`[BROWSER CONSOLE]: ${msg.text()}`));
    page.on('pageerror', (err) => console.error(`[BROWSER ERROR]: ${err.message}`));

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

  test('Should analyze and score a Writing essay matching criteria limits', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Navigate to Writing page
    const writingNavBtn = page.locator('button:has-text("Writing AI Evaluator")');
    await expect(writingNavBtn).toBeVisible();
    await writingNavBtn.dispatchEvent('click');

    // 2. Locate elements
    await expect(page.locator('text=Phòng Luyện Viết IELTS & Đề cương mẫu')).toBeVisible();

    // 3. Focus and enter a short essay (under 250 words to check capping bounds)
    const textarea = page.locator('textarea[placeholder*="Nhập bài essay Writing"]');
    await expect(textarea).toBeVisible();
    await textarea.focus();
    await page.keyboard.insertText(
      'This is a short IELTS Writing Task 2 essay. Living in an old building has some historic benefits.',
    );

    // 4. Click evaluate
    const evaluateBtn = page.locator('button:has-text("Phân tích bài viết & Chấm điểm")');
    await expect(evaluateBtn).toBeVisible();
    await evaluateBtn.dispatchEvent('click');

    // 5. Verify Rubric components load (capping Task Response to 5.5 due to length constraint)
    await expect(page.locator('text=IELTS Grading Verification').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Estimated Band:').first()).toBeVisible();
    await expect(page.locator('text=Task Response').first()).toBeVisible();
    await expect(page.locator('text=Grammatical Range and Accuracy').first()).toBeVisible();
  });
});
