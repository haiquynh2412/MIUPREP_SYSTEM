import { test, expect } from '@playwright/test';
import { seedTestStudent } from './helpers';

test.describe('IELTS Listening Module E2E Flow', () => {
  
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

  test('Should complete the Listening practice flow and verify tapescripts', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Locate and start the first Listening Mock Exam (e.g. index 3 or search for "Library")
    const startListeningBtn = page.locator('xpath=//h3[contains(text(), "Library Membership Application")]/../../button[contains(., "Start Mock Test")]');
    await expect(startListeningBtn).toBeVisible();
    await startListeningBtn.dispatchEvent('click');

    // 2. Select Practice Mode
    await expect(page.locator('text=Lựa chọn chế độ làm bài')).toBeVisible();
    await page.locator('#practice-mode-select').dispatchEvent('click');
    await expect(page.locator('text=Lựa chọn chế độ làm bài')).toBeHidden();

    // 3. Play Audio Simulator
    const playButton = page.locator('button[aria-label="Play audio"], button:has-text("Play"), button:has-text("Start Audio")').first();
    if (await playButton.isVisible()) {
      await playButton.dispatchEvent('click');
    }

    // 4. Fill an Answer
    const gapInput = page.locator('input[placeholder*="Answer field"]').first();
    await expect(gapInput).toBeVisible();
    await gapInput.focus();
    await page.keyboard.insertText('John');

    // 5. Submit Exam
    await page.locator('button:has-text("Submit Exam")').dispatchEvent('click');

    // Wait for the Dashboard to load and stabilize
    await expect(page.locator('text=Available Mock Exams')).toBeVisible();

    // 6. Review Answers and switch to Transcript Tapescripts tab
    const reviewBtn = page.locator('button:has-text("Review Answers")').first();
    await expect(reviewBtn).toBeVisible();
    await reviewBtn.dispatchEvent('click');

    // Verify Transcript switcher tab exists
    const transcriptTab = page.locator('button:has-text("Listening Tapescript")').first();
    await expect(transcriptTab).toBeVisible();
    await transcriptTab.dispatchEvent('click');
    await expect(page.locator('text=Applicant:').first()).toBeVisible();

    // Return to dashboard
    await page.locator('button:has-text("Exit Review")').dispatchEvent('click');
    await expect(page.locator('text=Available Mock Exams')).toBeVisible();
  });
});
