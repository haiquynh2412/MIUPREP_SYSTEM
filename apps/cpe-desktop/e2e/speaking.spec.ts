import { test, expect } from '@playwright/test';
import { seedTestStudent } from './helpers';

test.describe('CPE Speaking AI Module E2E Flow', () => {
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

  test('Should perform speech capture and evaluate CPE speaking with pronunciation-gated feedback', async ({
    page,
  }) => {
    test.setTimeout(60000);

    // 1. Navigate to Speaking page
    const speakingNavBtn = page.locator('button:has-text("Speaking AI Room")');
    await expect(speakingNavBtn).toBeVisible();
    await speakingNavBtn.dispatchEvent('click');

    // 2. Verify CPE Speaking room UI elements
    await expect(page.locator('text=Practice Room: Real Speech Capture')).toBeVisible();
    await expect(page.locator('text=Chọn chủ đề nói thử thách')).toBeVisible();

    // 3. Verify speaking topic options are available
    const topicSelect = page.locator('select').first();
    await expect(topicSelect).toBeVisible();

    // 4. Click Record (Playwright configuration enables mock microphone automatically)
    const recordBtn = page.locator('button:has-text("Bắt đầu thu âm")');
    await expect(recordBtn).toBeVisible();
    await recordBtn.dispatchEvent('click');

    // Verify recording indicator appears
    await expect(page.locator('text=Đang thu âm...')).toBeVisible();

    // Record for 1.2 seconds
    await page.waitForTimeout(1200);

    // Stop record
    const stopBtn = page.locator('button:has-text("Dừng & Lưu ghi âm")');
    await expect(stopBtn).toBeVisible();
    await stopBtn.dispatchEvent('click');

    // 5. Verify base64 audio readiness message
    await expect(page.locator('text=Đã sẵn sàng truyền âm thanh Base64')).toBeVisible();

    // 6. Submit Speaking for grading
    const scoreBtn = page.locator('button:has-text("Gửi audio & Chấm điểm Speaking")');
    await expect(scoreBtn).toBeVisible();
    await scoreBtn.dispatchEvent('click');

    // 7. Verify C2 Proficiency grading elements render (not IELTS Grading Verification)
    await expect(page.locator('text=C2 Proficiency Grading Verification').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Cambridge Scale Score:').first()).toBeVisible();
    await expect(page.locator('text=Điểm Chi Tiết Theo Tiêu Chí C2 Proficiency Speaking Rubric').first()).toBeVisible();
    await expect(page.locator('text=Pronunciation').first()).toBeVisible();
    await expect(page.locator('text=Nguyên nhân chưa đạt điểm cao hơn').first()).toBeVisible();
  });
});
