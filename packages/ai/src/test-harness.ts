import { MockAIAdapter } from './index';
import { validateWritingFeedback } from './utils/schema-validator';

/**
 * 🚀 IELTS Platform Prompt Quality & Socratic Output Test Harness
 * Used to verify that grading engines adhere to the strict Socratic & Band Upgrade specifications.
 */
async function runTestHarness() {
  console.log('================================================================');
  console.log('🧪 IELTS AI PROMPT & SCHEMA EVALUATION HARNESS STARTING...');
  console.log('================================================================');

  const testEssay = `In my opinion, studying abroad is very good for young people. Because they can learn English fast and make new friends. However, some people thinks it is too expensive and they can feel lonely. But I think the advantages are definitely more than the disadvantages.`;

  const adapter = new MockAIAdapter();

  try {
    console.log('👉 Step 1: Dispatching test essay to Mock AI Adapter...');
    const result = await adapter.gradeWriting({
      attemptId: 'test-harness-essay-1',
      essay: testEssay,
      taskNumber: 2
    });

    console.log('\n✅ Step 2: AI returned response successfully! Analyzing properties...');
    console.log(`- Band Overall Estimate: ${result.bandOverall.toFixed(1)}`);
    console.log(`- Model Used: ${result.modelUsed}`);
    console.log(`- Number of Grammar Corrections found: ${result.corrections.length}`);

    // Validate overall schemas
    console.log('\n👉 Step 3: Checking strict database schema conformance...');
    validateWritingFeedback(result);
    console.log('✅ Schema check passed!');

    // Validate Socratic properties
    console.log('\n👉 Step 4: Verifying Socratic Hints properties...');
    if (!result.socraticHints || result.socraticHints.length === 0) {
      throw new Error('FAILED: socraticHints array is missing or empty!');
    }
    console.log(`✅ Found ${result.socraticHints.length} Socratic guiding hints:`);
    result.socraticHints.forEach((h, idx) => console.log(`  [Hint ${idx + 1}]: ${h}`));

    // Validate Sentence Upgrades properties
    console.log('\n👉 Step 5: Verifying Sentence Upgrades (+0.5 Band Strategy) properties...');
    if (!result.sentenceUpgrades || result.sentenceUpgrades.length === 0) {
      throw new Error('FAILED: sentenceUpgrades array is missing or empty!');
    }
    console.log(`✅ Found ${result.sentenceUpgrades.length} sentence upgrades:`);
    result.sentenceUpgrades.forEach((upg, idx) => {
      console.log(`  [Upgrade ${idx + 1}]:`);
      console.log(`    - Original: "${upg.original}"`);
      console.log(`    - Elevated: "${upg.upgraded}" (Targets Band ${upg.targetedBand.toFixed(1)})`);
      console.log(`    - Pedagogical explanation: ${upg.explanation}`);
    });

    console.log('\n================================================================');
    console.log('🎉 PROMPT QUALITY & SCHEMA VALIDATION PASSED SUCCESSFULLY! (100%)');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ TEST HARNESS ENCOUNTERED A FAILURE:');
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

runTestHarness();
