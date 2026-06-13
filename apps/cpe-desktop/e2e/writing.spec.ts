import { test, expect } from '@playwright/test';
import { seedTestStudent } from './helpers';

test.describe('CPE Writing AI Module E2E Flow', () => {
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

  test('Should analyze and score a CPE Writing essay with C2 criteria feedback', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Navigate to Writing page
    const writingNavBtn = page.locator('button:has-text("Writing AI Evaluator")');
    await expect(writingNavBtn).toBeVisible();
    await writingNavBtn.dispatchEvent('click');

    // 2. Verify C2 Proficiency-specific Writing room title (not IELTS)
    await expect(page.locator('text=Phòng Luyện Viết CPE & Đề cương mẫu')).toBeVisible();
    await expect(page.locator('text=CPE Writing Tutor')).toBeVisible();

    // 3. Focus and enter a sample C2-level essay
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    await textarea.focus();
    await page.keyboard.insertText(
      'The proliferation of artificial intelligence in modern educational paradigms has engendered significant discourse. While some commentators argue that AI tutors will fundamentally supplant traditional pedagogical approaches, a more nuanced examination reveals that the symbiosis between human expertise and algorithmic precision offers the most propitious trajectory for advanced learners.',
    );

    // 4. Click evaluate
    const evaluateBtn = page.locator('button:has-text("Phân tích bài viết & Chấm điểm")');
    await expect(evaluateBtn).toBeVisible();
    await evaluateBtn.dispatchEvent('click');

    // 5. Verify C2 Proficiency Rubric components load (not IELTS Grading)
    await expect(page.locator('text=C2 Proficiency Grading Verification').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Cambridge Scale Score:').first()).toBeVisible();
    await expect(page.locator('text=Điểm Chi Tiết Theo Tiêu Chí C2 Proficiency Writing Rubric').first()).toBeVisible();

    // 6. Verify CPE-specific criteria names appear (not IELTS Task Response / Grammatical Range)
    // CPE Writing uses criteria like Content, Communicative Achievement, Organisation, Language
    await expect(page.locator('text=C2 Proficiency Official Writing Descriptors').first()).toBeVisible();
  });
});
