import type { Page } from '@playwright/test';

// Precomputed PBKDF2-SHA256 hash of the e2e password "student"
// (default-credential seeding was removed from the app, so tests seed their own user)
const TEST_STUDENT_HASH =
  'pbkdf2-sha256$310000$o0jFEw+BJrvC9V5rvedE4g==$0wA67WJLNjTCxV/pGIQs6GuDALnXzx9oRlaN0JcIJNM=';

export async function seedTestStudent(page: Page): Promise<void> {
  await page.addInitScript((hash: string) => {
    const prefix = 'ielts_app_';
    const user = {
      id: 'user_student',
      username: 'student',
      passwordHash: hash,
      targetBand: 6.5,
      examDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      role: 'student',
      displayName: 'E2E Test Student',
      status: 'approved',
      createdAt: new Date().toISOString()
    };
    const listKey = prefix + 'users_list';
    const list: string[] = JSON.parse(localStorage.getItem(listKey) || '[]');
    if (!list.includes('student')) list.push('student');
    localStorage.setItem(listKey, JSON.stringify(list));
    localStorage.setItem(prefix + 'user_student', JSON.stringify(user));
    localStorage.setItem('diagnostic_done_user_student', 'true');
  }, TEST_STUDENT_HASH);
}
