import { chromium } from 'playwright';

const portalUrl = process.env.PORTAL_URL || 'http://127.0.0.1:5181/';
const programs = ['ielts', 'cae', 'cpe'];
const now = new Date().toISOString();
const errors = [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(error.message));

const proofs = [];

for (const programId of programs) {
  const qaUsername = `qa-${programId}-item-bank-${Date.now()}`;

  await page.addInitScript(({ qaUsername, programId, now }) => {
    const user = {
      id: `user-${qaUsername}`,
      username: qaUsername,
      passwordHash: 'qa123456',
      displayName: `QA ${programId.toUpperCase()} Item Bank`,
      contactInfo: `qa-${programId}@example.test`,
      role: 'student',
      targetBand: 7.5,
      examDate: '2026-12-01',
      createdAt: now,
      status: 'approved',
      assignedTrack: programId,
      assignedTracks: [programId],
      linkedStudents: [],
    };
    localStorage.clear();
    localStorage.setItem('miuprep_active_username', qaUsername);
    localStorage.setItem('ielts_app_users_list', JSON.stringify([qaUsername]));
    localStorage.setItem(`ielts_app_user_${qaUsername}`, JSON.stringify(user));
  }, { qaUsername, programId, now });

  await page.goto(portalUrl, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Courses/i }).click();
  await page.getByText('English Core', { exact: true }).waitFor({ state: 'visible', timeout: 20000 });
  const openPracticeButtons = page.getByRole('button', { name: 'Open practice', exact: true });
  if (await openPracticeButtons.count() < 2) {
    throw new Error(`Expected Math and English Open practice buttons for ${programId}, got ${await openPracticeButtons.count()}`);
  }
  await openPracticeButtons.nth(1).click();
  await page.getByTestId('english-item-bank-practice-panel').waitFor({ state: 'visible', timeout: 25000 });
  await page.getByTestId('english-item-bank-practice-choice-A').click();
  await page.getByTestId('english-item-bank-practice-next').waitFor({ state: 'visible', timeout: 15000 });

  const proof = await page.evaluate(({ qaUsername, programId }) => {
    const ids = JSON.parse(localStorage.getItem('ielts_app_learning_events_list') || '[]');
    const events = ids
      .map((id) => JSON.parse(localStorage.getItem(`ielts_app_learning_event_${id}`) || 'null'))
      .filter(Boolean)
      .filter((event) => event.learnerId === qaUsername);
    const actionEvents = events.filter((event) => event.type === 'lesson_template_action');
    const practiceEvents = events.filter((event) => event.type === 'practice_attempt');
    const itemBankPracticeEvents = practiceEvents.filter((event) => event.source === 'miuprep_portal_english_item_bank_practice');
    const latest = itemBankPracticeEvents[itemBankPracticeEvents.length - 1];

    return {
      qaUsername,
      programId,
      actionEventCount: actionEvents.length,
      practiceEventCount: practiceEvents.length,
      itemBankPracticeEventCount: itemBankPracticeEvents.length,
      latest: latest ? {
        type: latest.type,
        source: latest.source,
        entityType: latest.entityType,
        itemId: latest.payload?.itemId,
        domainId: latest.payload?.domainId,
        programId: latest.payload?.programId,
        correct: latest.payload?.correct,
        score: latest.payload?.score,
        maxScore: latest.payload?.maxScore,
        questionType: latest.payload?.questionType,
        templateId: latest.payload?.templateId,
        sourceSurface: latest.payload?.sourceSurface,
        itemBankSource: latest.payload?.itemBankSource,
        testId: latest.payload?.testId,
      } : null,
    };
  }, { qaUsername, programId });

  proofs.push(proof);
}

await browser.close();

const ok =
  proofs.length === programs.length &&
  proofs.every((proof) =>
    proof.actionEventCount === 1 &&
    proof.itemBankPracticeEventCount === 1 &&
    proof.latest?.type === 'practice_attempt' &&
    proof.latest?.source === 'miuprep_portal_english_item_bank_practice' &&
    proof.latest?.entityType === 'learning_item' &&
    proof.latest?.domainId === 'english_core' &&
    proof.latest?.programId === proof.programId &&
    proof.latest?.itemId?.startsWith(`english.${proof.programId}.`) &&
    proof.latest?.correct === true &&
    proof.latest?.score === 1 &&
    proof.latest?.maxScore === 1 &&
    Boolean(proof.latest?.questionType) &&
    Boolean(proof.latest?.templateId) &&
    proof.latest?.sourceSurface === 'english_item_bank_practice' &&
    proof.latest?.itemBankSource === 'english_learning_catalog'
  ) &&
  errors.length === 0;

console.log(JSON.stringify({ ok, proofs, consoleErrors: errors }, null, 2));
if (!ok) process.exit(1);
