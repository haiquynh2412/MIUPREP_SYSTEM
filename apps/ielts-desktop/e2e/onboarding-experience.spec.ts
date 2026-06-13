import { test, expect } from '@playwright/test';

test.describe('IELTS Onboarding Diagnostic Test E2E Flow', () => {
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

    // 1. Verify Registration Screen is displayed by default
    await expect(page.locator('text=IELTS AI Prep Platform')).toBeVisible();
    await expect(page.locator('text=Đăng ký mới')).toBeVisible();

    // 2. Fill in Registration credentials
    const uniqueUsername = `candidate_${Math.random().toString(36).substring(2, 9)}`;
    await page.fill('input[placeholder*="haiquynh"]', uniqueUsername);
    await page.fill('input[placeholder*="mật khẩu"]', 'SecurePassword123');

    // Select target band 7.0
    await page.selectOption('select', '7');

    // Click "Đăng ký & Bắt đầu khảo sát"
    await page.click('button:has-text("Đăng ký & Bắt đầu khảo sát")');

    // 3. Verify transition to Diagnostic Test Screen
    await expect(page.locator('text=Bài Kiểm Tra Chẩn Đoán Khảo Sát Năng Lực')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=📖 1. Reading')).toBeVisible();

    // 4. Fill in Reading section questions (Q1 - Q5)
    await page.fill('input[placeholder*="TRUE, FALSE"] >> nth=0', 'TRUE');
    await page.fill('input[placeholder*="TRUE, FALSE"] >> nth=1', 'NOT GIVEN');
    await page.fill('input[placeholder*="từ còn thiếu"]', '17th');
    await page.fill('input[placeholder*="tên quốc gia"] >> nth=0', 'India');
    await page.fill('input[placeholder*="tên quốc gia"] >> nth=1', 'China');

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
    await page.fill('input[placeholder*="8:30"]', '8:30');
    await page.fill('input[placeholder*="thứ trong tuần"]', 'Tuesday');
    await page.fill('input[placeholder*="địa điểm"]', 'museum');
    await page.fill('input[placeholder*="10:15"]', '10:15');
    await page.fill('input[placeholder*="số tiền"]', '6');

    // 6. Navigate to Grammar Tab
    await page.click('button:has-text("3. Grammar")');

    // Fill in multiple choice grammar questions (Q11 - Q15) by selecting labels
    await page.click('label:has-text("B. goes")');
    await page.click('label:has-text("C. were watching")');
    await page.click('label:has-text("B. will cancel")');
    await page.click('label:has-text("A. the most")');
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

    // Confirm that Onboarding lock is bypassed and main dashboard is shown
    await expect(page.locator('text=Available Mock Exams')).toBeVisible({ timeout: 10000 });
  });
});
