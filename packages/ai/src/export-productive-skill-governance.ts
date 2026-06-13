import type { SpeakingFeedback, WritingFeedback } from '@miuprep/db';
import {
  buildProductiveSkillGovernanceReport,
  type ProductiveSkillGoldenSample,
  type ProductiveSkillGovernanceReport,
} from './tutor';

declare function require(name: string): any;
declare const process: { argv: string[]; cwd(): string };

const fs = require('node:fs');
const path = require('node:path');

const generatedAt = new Date().toISOString();
const outputDir = getArgValue('--outDir') || path.resolve(process.cwd(), '..', '..', 'reports', 'ai');
const jsonPath = path.join(outputDir, 'productive-skill-governance.json');
const markdownPath = path.join(outputDir, 'productive-skill-governance.md');
const samples = buildGovernanceSamples(generatedAt);
const report = buildProductiveSkillGovernanceReport(samples, { generatedAt });

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  jsonPath,
  `${JSON.stringify({ generatedAt, source: 'seeded_governance_samples', samples, report }, null, 2)}\n`,
);
fs.writeFileSync(markdownPath, renderMarkdown(report));

console.log(`Productive-skill governance written to ${jsonPath}`);
console.log(`Productive-skill governance summary written to ${markdownPath}`);
console.log(`Status: ${report.status}; samples: ${report.samples}; masteryEligible: ${report.masteryEligible}`);

function buildGovernanceSamples(now: string): ProductiveSkillGoldenSample[] {
  const writingFeedback: WritingFeedback = {
    attemptId: 'writing-governance-seed-1',
    taskNumber: 2,
    bandOverall: 7,
    criteria: [
      {
        criterionName: 'Task Response',
        band: 7,
        feedbackText: 'The position is clear and supported with relevant examples.',
        evidence: ['clear position', 'relevant examples'],
        nextAction: 'Add one sharper counterargument sentence.',
      },
      {
        criterionName: 'Coherence and Cohesion',
        band: 6.5,
        feedbackText: 'Paragraphing is logical, but one transition is mechanical.',
        evidence: ['logical paragraphing', 'mechanical transition'],
        nextAction: 'Replace the repeated linker with a cause-effect bridge.',
      },
    ],
    corrections: [],
    suggestionsForImprovement: ['Develop one counterargument before the conclusion.'],
    modelUsed: 'seeded-governance-rater',
    createdAt: now,
    rubricVersion: 'v1.0.0-academic',
    descriptorSource: 'IELTS Writing Band Descriptors May 2023',
    confidence: 0.91,
    isMockScoring: true,
  };

  const speakingFeedback: SpeakingFeedback = {
    attemptId: 'speaking-governance-seed-1',
    transcript: 'I think online learning is useful because students can review lessons and practice more.',
    bandOverall: 7,
    criteria: [
      {
        criterionName: 'Fluency and Coherence',
        band: 7,
        feedbackText: 'The answer is sustained and easy to follow.',
        evidence: ['sustained answer', 'easy to follow'],
        nextAction: 'Add one example without pausing after the first reason.',
      },
      {
        criterionName: 'Pronunciation',
        band: 7,
        feedbackText: 'Pronunciation is clear with minor word-stress slips.',
        evidence: ['clear pronunciation', 'minor word-stress slips'],
        nextAction: 'Repair stress on academic vocabulary before rerecording.',
      },
    ],
    pronunciationErrors: [
      {
        word: 'review',
        suggestion: 'Stress the second syllable.',
      },
    ],
    fluencyReview: 'Generally smooth, with one hesitation before the example.',
    modelUsed: 'seeded-governance-rater',
    createdAt: now,
    rubricVersion: 'v1.0.0-speaking',
    descriptorSource: 'IELTS Speaking Band Descriptors',
    confidence: 0.88,
    isMockScoring: true,
  };

  return [
    {
      sampleId: 'writing-governance-seed-1',
      feedbackType: 'writing',
      feedback: writingFeedback,
      expertOverall: 7,
      expertCriteria: {
        'Task Response': 7,
        'Coherence and Cohesion': 6.5,
      },
      provider: 'seeded',
      allowedOverallDeviation: 0.5,
      allowedCriterionDeviation: 0.75,
    },
    {
      sampleId: 'speaking-governance-seed-1',
      feedbackType: 'speaking',
      feedback: speakingFeedback,
      expertOverall: 7,
      expertCriteria: {
        'Fluency and Coherence': 7,
        Pronunciation: 7,
      },
      provider: 'seeded',
      allowedOverallDeviation: 0.5,
      allowedCriterionDeviation: 0.75,
    },
  ];
}

function renderMarkdown(report: ProductiveSkillGovernanceReport): string {
  return [
    '# Productive Skill Governance',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    '## Decision',
    '',
    `- Status: ${report.status}`,
    `- Samples: ${report.samples}`,
    `- Passed samples: ${report.passedSamples}`,
    `- Watch samples: ${report.watchSamples}`,
    `- Blocked samples: ${report.blockedSamples}`,
    `- Average overall deviation: ${report.averageOverallDeviation}`,
    `- Max overall deviation: ${report.maxOverallDeviation}`,
    `- Mastery policy: ${report.masteryPolicy}`,
    `- Mastery eligible: ${report.masteryEligible ? 'yes' : 'no'}`,
    `- Consensus policy: ${report.consensusPolicy}`,
    '',
    `Detail: ${report.detail}`,
    '',
    'Important constraint: this is a seeded governance artifact for repeatable audit proof. It does not approve Writing/Speaking scores for mastery updates.',
    '',
    '## Required Fields',
    '',
    ...report.requiredFields.map((field) => `- ${field}`),
    '',
    '## Findings',
    '',
    '| Sample | Type | Severity | Reason | Detail |',
    '| --- | --- | --- | --- | --- |',
    ...report.findings.map(
      (finding) =>
        `| ${escapeTable(finding.sampleId)} | ${finding.feedbackType} | ${finding.severity} | ${escapeTable(finding.reason)} | ${escapeTable(finding.detail)} |`,
    ),
    '',
  ].join('\n');
}

function getArgValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function escapeTable(value: string): string {
  return value.replace(/\|/g, '\\|');
}
