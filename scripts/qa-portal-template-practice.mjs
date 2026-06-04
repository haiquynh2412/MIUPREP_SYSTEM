import { chromium } from 'playwright';

const portalUrl = process.env.PORTAL_URL || 'http://127.0.0.1:5181/';
const qaUsername = `qa-template-practice-${Date.now()}`;
const now = new Date().toISOString();
const errors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(error.message));

await page.addInitScript(({ qaUsername, now }) => {
  const user = {
    id: `user-${qaUsername}`,
    username: qaUsername,
    passwordHash: 'qa123456',
    displayName: 'QA Template Practice',
    contactInfo: 'qa-template@example.test',
    role: 'student',
    targetBand: 6.5,
    examDate: '2026-12-01',
    createdAt: now,
    status: 'approved',
    assignedTrack: 'math',
    assignedTracks: ['math', 'ielts'],
    linkedStudents: [],
  };
  localStorage.setItem('miuprep_active_username', qaUsername);
  localStorage.setItem('ielts_app_users_list', JSON.stringify([qaUsername]));
  localStorage.setItem(`ielts_app_user_${qaUsername}`, JSON.stringify(user));
}, { qaUsername, now });

await page.goto(portalUrl, { waitUntil: 'domcontentloaded' });
await page.getByRole('button', { name: 'Courses 5 tracks', exact: true }).click();
await page.getByText('LessonTemplate core', { exact: true }).waitFor({ state: 'visible', timeout: 15000 });
await page.getByText('English Core', { exact: true }).waitFor({ state: 'visible', timeout: 15000 });

const openPracticeButtons = page.getByRole('button', { name: 'Open practice', exact: true });
if (await openPracticeButtons.count() !== 2) {
  throw new Error(`Expected 2 Open practice buttons, got ${await openPracticeButtons.count()}`);
}

await openPracticeButtons.nth(0).click();
await page.getByTestId('template-practice-panel').waitFor({ state: 'visible', timeout: 15000 });
await page.getByTestId('template-practice-choice-A').click();
await page.getByTestId('template-practice-next').waitFor({ state: 'visible', timeout: 15000 });

await page.getByRole('button', { name: 'Courses 5 tracks', exact: true }).click();
await page.getByText('English Core', { exact: true }).waitFor({ state: 'visible', timeout: 15000 });
await openPracticeButtons.nth(1).click();
await page.getByTestId('template-practice-panel').waitFor({ state: 'visible', timeout: 15000 });
await page.getByTestId('template-practice-choice-A').click();
await page.getByTestId('template-practice-next').waitFor({ state: 'visible', timeout: 15000 });

const proof = await page.evaluate((qaUsername) => {
  const ids = JSON.parse(localStorage.getItem('ielts_app_learning_events_list') || '[]');
  const events = ids
    .map((id) => JSON.parse(localStorage.getItem(`ielts_app_learning_event_${id}`) || 'null'))
    .filter(Boolean)
    .filter((event) => event.learnerId === qaUsername);
  const actionEvents = events.filter((event) => event.type === 'lesson_template_action');
  const practiceEvents = events.filter((event) => event.type === 'practice_attempt');

  return {
    qaUsername,
    totalEvents: events.length,
    actionEventCount: actionEvents.length,
    practiceEventCount: practiceEvents.length,
    practiceEvents: practiceEvents.map((event) => ({
      type: event.type,
      source: event.source,
      entityType: event.entityType,
      itemId: event.payload?.itemId,
      programId: event.payload?.programId,
      domainId: event.payload?.domainId,
      correct: event.payload?.correct,
      score: event.payload?.score,
      maxScore: event.payload?.maxScore,
      templateId: event.payload?.templateId,
      sourceSurface: event.payload?.sourceSurface,
    })),
  };
}, qaUsername);

await browser.close();

const ok =
  proof.actionEventCount === 2 &&
  proof.practiceEventCount === 2 &&
  proof.practiceEvents.every((event) =>
    event.type === 'practice_attempt' &&
    event.entityType === 'learning_item' &&
    event.correct === true &&
    event.score === 1 &&
    event.maxScore === 1 &&
    ['mathematics', 'english_core'].includes(event.domainId) &&
    Boolean(event.itemId) &&
    Boolean(event.templateId)
  ) &&
  errors.length === 0;

console.log(JSON.stringify({ ok, proof, consoleErrors: errors }, null, 2));
if (!ok) process.exit(1);
