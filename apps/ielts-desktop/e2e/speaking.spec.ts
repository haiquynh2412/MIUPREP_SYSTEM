import { test, expect } from '@playwright/test';
import { seedTestStudent } from './helpers';

test.describe('IELTS Speaking Module E2E Flow', () => {
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

  test('Should perform speech capture and evaluate pronunciation-gated feedback', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Navigate to Speaking page
    const speakingNavBtn = page.locator('button:has-text("Speaking AI Room")');
    await expect(speakingNavBtn).toBeVisible();
    await speakingNavBtn.dispatchEvent('click');

    // 2. Locate elements
    await expect(page.locator('text=Practice Room: Real Speech Capture')).toBeVisible();

    // 3. Click Record (Playwright configuration enables mock microphone automatically)
    const recordBtn = page.locator('button:has-text("Bắt đầu thu âm")');
    await expect(recordBtn).toBeVisible();
    await recordBtn.dispatchEvent('click');

    // Record for 1.2 seconds
    await page.waitForTimeout(1200);

    // Stop record
    const stopBtn = page.locator('button:has-text("Dừng & Lưu ghi âm")');
    await expect(stopBtn).toBeVisible();
    await stopBtn.dispatchEvent('click');

    // 4. Verify base64 audio readiness message
    await expect(page.locator('text=Đã sẵn sàng truyền âm thanh Base64')).toBeVisible();

    // 5. Submit Speaking
    const scoreBtn = page.locator('button:has-text("Gửi audio & Chấm điểm Speaking")');
    await expect(scoreBtn).toBeVisible();
    await scoreBtn.dispatchEvent('click');

    // 6. Verify grading elements render (Confidence level, estimated band, Pronunciation criteria)
    await expect(page.locator('text=IELTS Grading Verification').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Estimated Band:').first()).toBeVisible();
    await expect(page.locator('text=Pronunciation').first()).toBeVisible();
    await expect(page.locator('text=Nguyên nhân chưa đạt điểm cao hơn').first()).toBeVisible();
  });
});
