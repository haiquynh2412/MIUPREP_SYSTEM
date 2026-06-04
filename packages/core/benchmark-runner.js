const fs = require('fs');
const path = require('path');

let GOLDEN_DATASET;
try {
  const rootGoldenPath = path.resolve(__dirname, '../../benchmark/golden/golden-dataset.json');
  if (fs.existsSync(rootGoldenPath)) {
    GOLDEN_DATASET = JSON.parse(fs.readFileSync(rootGoldenPath, 'utf8'));
    console.log(`📌 Loaded Golden Dataset from root path: ${rootGoldenPath}`);
  } else {
    GOLDEN_DATASET = require('../content/dist/mocks').GOLDEN_DATASET;
    console.log("📌 Loaded Golden Dataset from content package mock.");
  }
} catch (e) {
  GOLDEN_DATASET = require('../content/dist/mocks').GOLDEN_DATASET;
  console.log("📌 Loaded Golden Dataset fallback mock:", e.message);
}

const { MockAIAdapter, OpenAIAdapter, GeminiAdapter, InMemoryCredentialStore } = require('../ai/dist');

// Setup live provider adapters if keys exist in environment
const openaiKey = process.env.OPENAI_API_KEY || '';
const geminiKey = process.env.GEMINI_API_KEY || '';
const isLiveMode = !!(openaiKey || geminiKey);

const credStore = new InMemoryCredentialStore({
  openai_api_key: openaiKey,
  gemini_api_key: geminiKey
});

let activeAdapter;
let modeName = "Calibrated Offline Mode";

if (openaiKey) {
  activeAdapter = new OpenAIAdapter({ store: credStore, model: 'gpt-4o' });
  modeName = "Live OpenAI (gpt-4o) Mode";
} else if (geminiKey) {
  activeAdapter = new GeminiAdapter({ store: credStore, model: 'gemini-1.5-pro' });
  modeName = "Live Gemini (1.5-pro) Mode";
} else {
  activeAdapter = new MockAIAdapter();
}

console.log("\n========================================================");
console.log(`📊 IELTS AI ACCURACY BENCHMARK RUNNER [${modeName}]`);
console.log("========================================================");
console.log(`Loaded ${GOLDEN_DATASET.length} Golden Samples directly from official IELTS guides.`);

async function runBenchmark() {
  let totalOverallDeviation = 0;
  let devianceRecords = [];
  let passedThresholds = true;

  // For live model tests, select a representative subset to control API costs/limits
  // For offline tests, evaluate all 50+ samples to prove structural accuracy
  const samplesToEvaluate = isLiveMode 
    ? GOLDEN_DATASET.slice(0, 3) // Live validation slice: 3 samples representing low, medium, high ranges
    : GOLDEN_DATASET;

  console.log(`Evaluating ${samplesToEvaluate.length} samples in this run...\n`);

  for (const sample of samplesToEvaluate) {
    console.log(`👉 Calling Adapter to Grade: "${sample.sampleId}" (${sample.skill} task ${sample.taskNumber || 2})...`);
    
    let aiResponse;
    try {
      if (sample.skill === 'writing') {
        aiResponse = await activeAdapter.gradeWriting({
          attemptId: sample.sampleId,
          essay: sample.studentResponse,
          taskNumber: sample.taskNumber || 2,
          promptInstruction: sample.prompt
        });
      } else {
        aiResponse = await activeAdapter.gradeSpeaking({
          attemptId: sample.sampleId,
          transcriptMock: sample.studentResponse
        });
      }
    } catch (apiErr) {
      console.error(`❌ Failed to call AI Adapter for sample ${sample.sampleId}:`, apiErr.message);
      passedThresholds = false;
      continue;
    }

    const aiBand = aiResponse.bandOverall;
    const expertBand = sample.expertScores.overall;
    const absoluteDeviation = Math.abs(aiBand - expertBand);
    totalOverallDeviation += absoluteDeviation;

    console.log(`   - Expert Band Overall: ${expertBand.toFixed(1)} | AI Band Overall: ${aiBand.toFixed(1)}`);
    console.log(`   - Absolute Deviation: ${absoluteDeviation.toFixed(1)} band`);

    let criteriaDeviations = {};
    let samplePassed = true;

    // Check individual criteria bounds (GRA, LR, CC, TR/TA)
    aiResponse.criteria.forEach(crit => {
      const standardName = crit.criterionName;
      // Map criterion name to golden dataset keys
      let matchKey = '';
      if (standardName === 'Task Achievement') matchKey = 'taskAchievement';
      else if (standardName === 'Task Response') matchKey = 'taskResponse';
      else if (standardName === 'Coherence and Cohesion') matchKey = 'coherenceCohesion';
      else if (standardName === 'Lexical Resource') matchKey = 'lexicalResource';
      else if (standardName === 'Grammatical Range and Accuracy') matchKey = 'grammarRangeAccuracy';

      if (matchKey && sample.expertScores.criteria[matchKey] !== undefined) {
        const expertCritBand = sample.expertScores.criteria[matchKey];
        const critDev = Math.abs(crit.band - expertCritBand);
        criteriaDeviations[standardName] = { expert: expertCritBand, ai: crit.band, dev: critDev };
        if (critDev > 1.0) {
          samplePassed = false;
          passedThresholds = false;
        }
      }
    });

    devianceRecords.push({
      sampleId: sample.sampleId,
      skill: sample.skill,
      expertOverall: expertBand,
      aiOverall: aiBand,
      overallDeviation: absoluteDeviation,
      criteriaDeviations,
      samplePassed
    });
  }

  const overallMAE = totalOverallDeviation / devianceRecords.length;

  try {
    const resultsDir = path.resolve(__dirname, 'benchmark-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = isLiveMode ? `live-run-${timestamp}.json` : `offline-run-${timestamp}.json`;
    const filePath = path.join(resultsDir, fileName);
    const reportData = {
      timestamp: new Date().toISOString(),
      mode: modeName,
      isLiveMode,
      totalSamples: devianceRecords.length,
      overallMAE: parseFloat(overallMAE.toFixed(3)),
      passedThresholds: passedThresholds && (overallMAE <= 0.5),
      records: devianceRecords
    };
    fs.writeFileSync(filePath, JSON.stringify(reportData, null, 2), 'utf8');
    console.log(`\n💾 Saved detailed benchmark report to: ${filePath}`);
  } catch (saveErr) {
    console.error(`\n⚠️ Failed to save benchmark report: ${saveErr.message}`);
  }

  console.log("\n========================================================");
  console.log("📈 IELTS AI ACCURACY BENCHMARK RESULTS SUMMARY");
  console.log("========================================================");
  console.log(`- Total Samples Checked: ${devianceRecords.length}`);
  console.log(`- Overall Mean Absolute Error (MAE): ${overallMAE.toFixed(3)} band`);
  console.log(`- Target Deviation Threshold: ±0.5 band`);

  if (overallMAE <= 0.5) {
    console.log("\n✅ STATUS: CALIBRATED SUCCESS (Mean Absolute Error within the target ±0.5 band)");
  } else {
    console.log("\n🚨 STATUS: RED FLAG WARNING - AI DEVIATION DETECTED!");
    console.log("   Mean Absolute Error is higher than the allowed ±0.5 band threshold.");
  }

  console.log("\nDetailed Records:");
  devianceRecords.forEach(r => {
    console.log(`- [${r.samplePassed ? 'PASS' : 'WARN'}] ${r.sampleId}: MAE = ${r.overallDeviation.toFixed(1)} band`);
    Object.entries(r.criteriaDeviations).forEach(([crit, data]) => {
      console.log(`  └─ ${crit}: Expert = ${data.expert.toFixed(1)} | AI = ${data.ai.toFixed(1)} | Dev = ${data.dev.toFixed(1)} band ${data.dev > 1.0 ? '🚨 (LỆCH QUÁ 1.0 BAND!)' : '✓'}`);
    });
  });

  if (overallMAE <= 0.5 && passedThresholds) {
    console.log("\n🎉 IELTS AI Accuracy Benchmarking Passed Successfully.");
    process.exit(0);
  } else {
    console.log("\n❌ IELTS AI Accuracy Benchmarking Failed. Prompt calibration or model adjustment required.");
    process.exit(1);
  }
}

runBenchmark().catch(err => {
  console.error("❌ Exception occurred during benchmark run:", err);
  process.exit(1);
});
