import { test, expect } from '@playwright/test';
import { seedTestStudent } from './helpers';

test.describe('CPE Preparation App E2E User Journey', () => {
  
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER CONSOLE]: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[BROWSER ERROR]: ${err.message}`));

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

  test('Should navigate the complete user journey: Dashboard -> Reading Exam -> Pause/Resume -> Submit -> Review -> Writing AI -> Speaking AI -> Error Notebook', async ({ page }) => {
    // Set higher timeout for E2E user journey to prevent premature aborts during Vite startup and SQLite seeding
    test.setTimeout(180000);

    // 1. Dashboard & Profile Card Verification
    await expect(page.locator('text=Available Mock Exams')).toBeVisible();
    await expect(page.locator('text=My Mock Exam History')).toBeVisible();

    // Verify CPE-specific header branding
    await expect(page.locator('text=CPE C2 Proficiency AI Prep Platform')).toBeVisible();

    // 2. Start a Mock Reading Test
    const startButton = page.locator('button:has-text("Start Mock Test")').first();
    await expect(startButton).toBeVisible();
    await startButton.dispatchEvent('click');

    // Verify Mode Selector Modal appears
    await expect(page.locator('text=Lựa chọn chế độ làm bài')).toBeVisible();
    
    // Choose "Practice Mode" to verify pedagogical pausing capabilities
    await page.locator('#practice-mode-select').dispatchEvent('click');

    // Wait for the mode selector modal to be completely removed from the DOM
    await expect(page.locator('text=Lựa chọn chế độ làm bài')).toBeHidden();

    // 3. Exam Active Session & Question Interaction
    // Verify Exam Header & Timer controls are rendered
    await expect(page.locator('text=exam in progress')).toBeVisible();
    await expect(page.locator('button:has-text("Pause Exam")')).toBeVisible();
    await expect(page.locator('button:has-text("Submit Exam")')).toBeVisible();

    // Interact with Gap Fill input (CPE Reading & Use of English has gap fill questions)
    const gapFillInput = page.locator('input[placeholder*="Type answer for blank"]').first();
    await expect(gapFillInput).toBeVisible();
    await gapFillInput.focus();
    await page.keyboard.insertText('however');

    // Interact with Multiple Choice question option (CPE Part 1 style)
    const mcqLabel = page.locator('label:has-text("A.")').first();
    await expect(mcqLabel).toBeVisible();
    await mcqLabel.dispatchEvent('click');

    // 4. Drift-Proof Timer Pause & Resume
    await page.locator('button:has-text("Pause Exam")').dispatchEvent('click');
    
    // Verify paused warning view appears
    await expect(page.locator('text=Bài thi đang được tạm dừng')).toBeVisible();
    
    // Resume exam
    await page.locator('button:has-text("Tiếp tục làm bài (Resume)")').dispatchEvent('click');
    await expect(page.locator('button:has-text("Pause Exam")')).toBeVisible();

    // 5. Submit Exam & Check Diagnostics Skill Report
    await page.locator('button:has-text("Submit Exam")').dispatchEvent('click');
    
    // Wait for the exam to be submitted and return to the Dashboard, then click "Review Answers" on the completed attempt
    const reviewButton = page.locator('button:has-text("Review Answers")').first();
    await expect(reviewButton).toBeVisible();
    await reviewButton.dispatchEvent('click');

    // Verify Diagnostic report appears on active page in Review mode
    await expect(page.locator('text=Diagnostic Skill Report')).toBeVisible();
    await expect(page.locator('text=Lời khuyên sư phạm cá nhân hóa')).toBeVisible();
    await expect(page.locator('text=Exit Review')).toBeVisible();

    // Exit Review to return to Dashboard
    await page.locator('button:has-text("Exit Review")').dispatchEvent('click');
    await expect(page.locator('text=Available Mock Exams')).toBeVisible();

    // 6. Navigate to Writing AI Evaluation & Verify CPE Rubric Engine
    await page.locator('button:has-text("Writing AI Evaluator")').dispatchEvent('click');
    await expect(page.locator('text=Phòng Luyện Viết CPE & Đề cương mẫu')).toBeVisible();
    
    // Enter dummy essay
    const essayTextarea = page.locator('textarea').first();
    await expect(essayTextarea).toBeVisible();
    await essayTextarea.focus();
    await page.keyboard.insertText('The proliferation of artificial intelligence in modern educational paradigms has engendered significant discourse regarding its pedagogical implications for C2-level learners.');
    
    // Submit essay
    await page.locator('button:has-text("Phân tích bài viết & Chấm điểm")').dispatchEvent('click');
    
    // Verify writing feedback renders the C2 Proficiency Grading Verification and criteria table
    await expect(page.locator('text=C2 Proficiency Grading Verification').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Cambridge Scale Score:').first()).toBeVisible();
    await expect(page.locator('text=Điểm Chi Tiết Theo Tiêu Chí C2 Proficiency Writing Rubric').first()).toBeVisible();
    await expect(page.locator('text=Bằng chứng từ bài làm (Direct Evidence):').first()).toBeVisible();

    // 7. Navigate to Speaking AI Room & Verify Pronunciation Gate
    await page.locator('button:has-text("Speaking AI Room")').dispatchEvent('click');
    await expect(page.locator('text=Practice Room: Real Speech Capture')).toBeVisible();

    // Start Recording (mocked by Chrome launch options sine wave)
    await page.locator('button:has-text("Bắt đầu thu âm")').dispatchEvent('click');
    await page.waitForTimeout(1500); // Record for 1.5 seconds
    await page.locator('button:has-text("Dừng & Lưu ghi âm")').dispatchEvent('click');

    // Verify audio wave indicators ready
    await expect(page.locator('text=Đã sẵn sàng truyền âm thanh Base64')).toBeVisible();

    // Grade Speaking audio
    await page.locator('button:has-text("Gửi audio & Chấm điểm Speaking")').dispatchEvent('click');

    // Verify speaking report with C2 Proficiency band verification badge and Pronunciation criteria loaded
    await expect(page.locator('text=C2 Proficiency Grading Verification').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Cambridge Scale Score:').first()).toBeVisible();
    await expect(page.locator('text=Điểm Chi Tiết Theo Tiêu Chí C2 Proficiency Speaking Rubric').first()).toBeVisible();
    await expect(page.locator('text=Pronunciation').first()).toBeVisible();
    await expect(page.locator('text=Nguyên nhân chưa đạt điểm cao hơn').first()).toBeVisible();

    // 8. Verify Error Notebook and SRS reviewed items
    await page.locator('button:has-text("Sổ Lỗi Sai")').dispatchEvent('click');
    await expect(page.locator('text=SRS Spaced Repetition Panel')).toBeVisible();
  });
});
