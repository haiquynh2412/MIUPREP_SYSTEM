import { test, expect } from '@playwright/test';

test.describe('CPE Onboarding Diagnostic Test E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure we start from the registration/login screen
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Should complete the registration -> diagnostic test -> Listening audio trigger -> submit -> review -> start learning flow successfully', async ({
    page,
  }) => {
    test.setTimeout(120000);

    // 1. Verify CPE Registration Screen is displayed by default (not IELTS)
    await expect(page.locator('text=CPE C2 Proficiency AI Prep Platform')).toBeVisible();
    await expect(page.locator('text=Đăng ký mới')).toBeVisible();

    // 2. Fill in Registration credentials
    const uniqueUsername = `candidate_${Math.random().toString(36).substring(2, 9)}`;
    await page.fill('input[placeholder*="haiquynh"]', uniqueUsername);
    await page.fill('input[placeholder*="mật khẩu"]', 'SecurePassword123');

    // Select target CPE Score 200 (not IELTS band 7.0)
    await page.selectOption('select', '200');

    // Click "Đăng ký & Bắt đầu khảo sát"
    await page.click('button:has-text("Đăng ký & Bắt đầu khảo sát")');

    // 3. Verify transition to Diagnostic Test Screen
    await expect(page.locator('text=Bài Kiểm Tra Chẩn Đoán Khảo Sát Năng Lực')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=📖 1. Reading')).toBeVisible();

    // 4. Fill in Reading section questions (Q1 - Q5)
    await page.fill('input[placeholder*="đáp án A, B, C hoặc D"] >> nth=0', 'A');
    await page.fill('input[placeholder*="từ còn thiếu"] >> nth=0', 'than');
    await page.fill('input[placeholder*="từ còn thiếu"] >> nth=1', 'incomparable');
    await page.fill('input[placeholder*="cụm từ còn thiếu"]', 'should not have bought');
    await page.fill('input[placeholder*="đáp án A, B, C hoặc D"] >> nth=1', 'B');

    // 5. Navigate to Listening Tab
    await page.click('button:has-text("2. Listening")');
    await expect(page.locator('text=Sẵn Sàng Phát Âm Thanh Bài Nghe')).toBeVisible();

    // Trigger Play Audio SpeechSynthesis
    const playBtn = page.locator('button:has-text("Play")').or(page.locator('button >> svg >> xpath=..')).first();
    await expect(playBtn).toBeVisible();
    await playBtn.click();

    // Verify audio player state updates
    await expect(page.locator('text=Đang Phát Âm Thanh Bài Nghe...')).toBeVisible();

    // Toggle tapescript visibility
    await page.click('button:has-text("Xem Tapescript")');
    await expect(page.locator('text=Listening Excerpt Transcript (Bản Gỡ Băng Để Học)')).toBeVisible();

    // Fill in Listening section questions (Q6 - Q10)
    await page.fill('input[placeholder*="tính chất cấu trúc"]', 'static');
    await page.fill('input[placeholder*="loại kết nối"]', 'neural');
    await page.fill('input[placeholder*="danh từ"]', 'dogma');
    await page.fill('input[placeholder*="tuổi già"]', 'senescence');
    await page.fill('input[placeholder*="phục hồi chức năng"]', 'stroke');

    // 6. Navigate to Grammar Tab
    await page.click('button:has-text("3. Grammar")');

    // Fill in multiple choice grammar questions (Q11 - Q15) by selecting labels
    await page.click('label:has-text("B. goes")');
    await page.click('label:has-text("A. watched")');
    await page.click('label:has-text("A. cancel")');
    await page.click('label:has-text("B. most")');
    await page.click('label:has-text("A. at")');

    // 7. Submit Diagnostic Test
    await page.click('button:has-text("Nộp bài đánh giá năng lực")');

    // Verify Result page renders correctly
    await expect(page.locator('text=Đã Hoàn Thành Khảo Sát Onboarding!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=15 / 15')).toBeVisible(); // Perfect score representation

    // 8. Navigate to Pedagogical Review Card
    await page.click('button:has-text("Xem Lại Đáp Án")');
    await expect(page.locator('text=Xem Lại Đáp Án & Giải Thích Chi Tiết')).toBeVisible();
    await expect(page.locator('text=✓ Chính Xác').first()).toBeVisible();

    // Return to result screen
    await page.click('button:has-text("Quay Lại Bảng Điểm")');

    // 9. Click "Nhận Lộ Trình & Bắt Đầu Học Ngay" and verify transition to main app dashboard
    await page.click('button:has-text("Nhận Lộ Trình & Bắt Đầu Học Ngay")');

    // Confirm that Onboarding lock is bypassed and CPE main dashboard is shown
    await expect(page.locator('text=Available Mock Exams')).toBeVisible({ timeout: 10000 });
  });
});
