import { test, expect } from '@playwright/test';
import { seedTestStudent } from './helpers';

test.describe('CPE Session Autosave & Recovery E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log(`[BROWSER CONSOLE]: ${msg.text()}`));
    page.on('pageerror', (err) => console.error(`[BROWSER ERROR]: ${err.message}`));

    await seedTestStudent(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Perform authentic login using default seeded student account
    await expect(page.locator('text=CPE C2 Proficiency AI Prep Platform')).toBeVisible({ timeout: 45000 });
    await page.click('button:has-text("Đăng nhập")');
    await page.fill('input[type="text"]', 'student');
    await page.fill('input[type="password"]', 'student');
    await page.click('button:has-text("Đăng nhập vào Hệ thống")');

    // Wait until dashboard loads
    await expect(page.locator('text=Available Mock Exams')).toBeVisible({ timeout: 45000 });
  });

  test('Should resume an in-progress CPE exam session successfully preserving state', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Verify no active session banner initially
    await expect(page.locator('text=You have an exam session in progress')).toBeHidden();

    // 2. Start Reading & Use of English Test in Practice Mode
    const startReadingBtn = page.locator('button:has-text("Start Mock Test")').first();
    await expect(startReadingBtn).toBeVisible();
    await startReadingBtn.dispatchEvent('click');

    await expect(page.locator('text=Lựa chọn chế độ làm bài')).toBeVisible();
    await page.locator('#practice-mode-select').dispatchEvent('click');
    await expect(page.locator('text=Lựa chọn chế độ làm bài')).toBeHidden();

    // 3. Write one answer in a gap fill field
    const gapInput = page.locator('input[placeholder*="Type answer for blank"]').first();
    await expect(gapInput).toBeVisible();
    await gapInput.focus();
    await page.keyboard.insertText('however');

    // Wait for the autosave debounce timer to trigger (500ms + margin)
    await page.waitForTimeout(1000);

    // 4. Force reload browser page to simulate a crash/reboot
    await page.reload({ waitUntil: 'domcontentloaded' });

    // 5. Verify the "You have an exam session in progress" recovery banner appears on dashboard
    await expect(page.locator('text=You have an exam session in progress')).toBeVisible();

    // 6. Click "Resume Active Session" and verify it restores answers
    const resumeBtn = page.locator('button:has-text("Resume Active Session")');
    await expect(resumeBtn).toBeVisible();
    await resumeBtn.dispatchEvent('click');

    // 7. Verify we are back in exam view and answers are restored
    await expect(page.locator('text=exam in progress')).toBeVisible();
    const restoredInput = page.locator('input[placeholder*="Type answer for blank"]').first();
    await expect(restoredInput).toHaveValue('however');

    // Submit to clean up session
    await page.locator('button:has-text("Submit Exam")').dispatchEvent('click');
  });
});
