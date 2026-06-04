/**
 * High-precision validator for IELTS Writing & Speaking AI evaluation JSON outputs.
 * Guarantees schema safety before committing outputs to native SQLite / localStorage.
 */

export class AIValidationError extends Error {
  code: 'AI_MALFORMED_RESPONSE';
  details: string[];

  constructor(message: string, details: string[]) {
    super(`${message}\nDetails:\n${details.map(d => `- ${d}`).join('\n')}`);
    this.name = 'AIValidationError';
    this.code = 'AI_MALFORMED_RESPONSE';
    this.details = details;
  }
}

/**
 * Validates the parsed JSON object against strict IELTS Writing Feedback structures.
 */
export function validateWritingFeedback(parsed: any): void {
  const errors: string[] = [];

  if (!parsed || typeof parsed !== 'object') {
    throw new AIValidationError('AI response is not a valid JSON object.', ['Root node is null or not an object']);
  }

  // 1. Validate bandOverall
  if (typeof parsed.bandOverall !== 'number' || parsed.bandOverall < 0 || parsed.bandOverall > 9) {
    errors.push('bandOverall must be a number between 0 and 9.');
  }

  // 2. Validate criteria
  if (!Array.isArray(parsed.criteria) || parsed.criteria.length !== 4) {
    errors.push(`criteria must be an array of exactly 4 scoring dimensions, got ${Array.isArray(parsed.criteria) ? parsed.criteria.length : 'non-array'}.`);
  } else {
    parsed.criteria.forEach((crit: any, idx: number) => {
      const path = `criteria[${idx}]`;
      if (typeof crit.criterionName !== 'string' || !crit.criterionName.trim()) {
        errors.push(`${path}.criterionName must be a non-empty string.`);
      }
      if (crit.band !== null && (typeof crit.band !== 'number' || crit.band < 0 || crit.band > 9)) {
        errors.push(`${path}.band must be a score number between 0 and 9, or null.`);
      }
      if (typeof crit.feedbackText !== 'string' || !crit.feedbackText.trim()) {
        errors.push(`${path}.feedbackText must contain descriptive educational remarks.`);
      }
      if (crit.evidence !== undefined) {
        if (!Array.isArray(crit.evidence)) {
          errors.push(`${path}.evidence must be a valid array of string quotes.`);
        } else {
          crit.evidence.forEach((ev: any, evIdx: number) => {
            if (typeof ev !== 'string' || !ev.trim()) {
              errors.push(`${path}.evidence[${evIdx}] must be a non-empty string.`);
            }
          });
        }
      }
      if (crit.whyNotHigher !== undefined && typeof crit.whyNotHigher !== 'string') {
        errors.push(`${path}.whyNotHigher must be a string.`);
      }
      if (crit.nextAction !== undefined && typeof crit.nextAction !== 'string') {
        errors.push(`${path}.nextAction must be a string.`);
      }
    });
  }

  // 2.1 Validate extended metadata
  if (parsed.rubricVersion !== undefined && typeof parsed.rubricVersion !== 'string') {
    errors.push('rubricVersion must be a string.');
  }
  if (parsed.descriptorSource !== undefined && typeof parsed.descriptorSource !== 'string') {
    errors.push('descriptorSource must be a string.');
  }
  if (parsed.confidence !== undefined && (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1)) {
    errors.push('confidence must be a decimal number between 0.0 and 1.0.');
  }

  // 3. Validate corrections (optional but must conform if present)
  if (parsed.corrections !== undefined) {
    if (!Array.isArray(parsed.corrections)) {
      errors.push('corrections must be a valid array.');
    } else {
      parsed.corrections.forEach((corr: any, idx: number) => {
        const path = `corrections[${idx}]`;
        if (typeof corr.originalText !== 'string' || !corr.originalText.trim()) {
          errors.push(`${path}.originalText is missing or empty.`);
        }
        if (typeof corr.correctedText !== 'string' || !corr.correctedText.trim()) {
          errors.push(`${path}.correctedText is missing or empty.`);
        }
        if (typeof corr.reason !== 'string' || !corr.reason.trim()) {
          errors.push(`${path}.reason explanation is missing.`);
        }
      });
    }
  }

  // 4. Validate suggestions
  if (!Array.isArray(parsed.suggestionsForImprovement) || parsed.suggestionsForImprovement.length === 0) {
    errors.push('suggestionsForImprovement must be a non-empty array of actionable items.');
  }

  // 5. Validate socratic hints
  if (parsed.socraticHints !== undefined) {
    if (!Array.isArray(parsed.socraticHints)) {
      errors.push('socraticHints must be a valid array of strings.');
    }
  }

  // 6. Validate sentence upgrades
  if (parsed.sentenceUpgrades !== undefined) {
    if (!Array.isArray(parsed.sentenceUpgrades)) {
      errors.push('sentenceUpgrades must be a valid array.');
    } else {
      parsed.sentenceUpgrades.forEach((upg: any, idx: number) => {
        const path = `sentenceUpgrades[${idx}]`;
        if (typeof upg.original !== 'string' || !upg.original.trim()) {
          errors.push(`${path}.original must be a non-empty string.`);
        }
        if (typeof upg.upgraded !== 'string' || !upg.upgraded.trim()) {
          errors.push(`${path}.upgraded must be a non-empty string.`);
        }
        if (typeof upg.explanation !== 'string' || !upg.explanation.trim()) {
          errors.push(`${path}.explanation explanation is missing.`);
        }
      });
    }
  }

  if (errors.length > 0) {
    throw new AIValidationError('AI response failed strict IELTS Writing Feedback schema validation.', errors);
  }
}

/**
 * Validates the parsed JSON object against strict IELTS Speaking Feedback structures.
 */
export function validateSpeakingFeedback(parsed: any): void {
  const errors: string[] = [];

  if (!parsed || typeof parsed !== 'object') {
    throw new AIValidationError('AI response is not a valid JSON object.', ['Root node is null or not an object']);
  }

  // 1. Validate bandOverall
  if (typeof parsed.bandOverall !== 'number' || parsed.bandOverall < 0 || parsed.bandOverall > 9) {
    errors.push('bandOverall must be a number between 0 and 9.');
  }

  // 2. Validate criteria
  if (!Array.isArray(parsed.criteria) || parsed.criteria.length !== 4) {
    errors.push(`criteria must be an array of exactly 4 scoring dimensions, got ${Array.isArray(parsed.criteria) ? parsed.criteria.length : 'non-array'}.`);
  } else {
    parsed.criteria.forEach((crit: any, idx: number) => {
      const path = `criteria[${idx}]`;
      if (typeof crit.criterionName !== 'string' || !crit.criterionName.trim()) {
        errors.push(`${path}.criterionName must be a non-empty string.`);
      }
      if (crit.band !== null && (typeof crit.band !== 'number' || crit.band < 0 || crit.band > 9)) {
        errors.push(`${path}.band must be a score number between 0 and 9, or null.`);
      }
      if (crit.evidence !== undefined) {
        if (!Array.isArray(crit.evidence)) {
          errors.push(`${path}.evidence must be a valid array of string quotes.`);
        } else {
          crit.evidence.forEach((ev: any, evIdx: number) => {
            if (typeof ev !== 'string' || !ev.trim()) {
              errors.push(`${path}.evidence[${evIdx}] must be a non-empty string.`);
            }
          });
        }
      }
      if (crit.whyNotHigher !== undefined && typeof crit.whyNotHigher !== 'string') {
        errors.push(`${path}.whyNotHigher must be a string.`);
      }
      if (crit.nextAction !== undefined && typeof crit.nextAction !== 'string') {
        errors.push(`${path}.nextAction must be a string.`);
      }
    });
  }

  // 2.1 Validate extended metadata
  if (parsed.rubricVersion !== undefined && typeof parsed.rubricVersion !== 'string') {
    errors.push('rubricVersion must be a string.');
  }
  if (parsed.descriptorSource !== undefined && typeof parsed.descriptorSource !== 'string') {
    errors.push('descriptorSource must be a string.');
  }
  if (parsed.confidence !== undefined && (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1)) {
    errors.push('confidence must be a decimal number between 0.0 and 1.0.');
  }

  // 3. Validate pronunciation errors
  if (parsed.pronunciationErrors !== undefined) {
    if (!Array.isArray(parsed.pronunciationErrors)) {
      errors.push('pronunciationErrors must be a valid array.');
    } else {
      parsed.pronunciationErrors.forEach((err: any, idx: number) => {
        const path = `pronunciationErrors[${idx}]`;
        if (typeof err.word !== 'string' || !err.word.trim()) {
          errors.push(`${path}.word reference is missing.`);
        }
        if (typeof err.suggestion !== 'string' || !err.suggestion.trim()) {
          errors.push(`${path}.suggestion is missing.`);
        }
      });
    }
  }

  // 4. Validate fluencyReview
  if (typeof parsed.fluencyReview !== 'string' || !parsed.fluencyReview.trim()) {
    errors.push('fluencyReview evaluation overview is missing or empty.');
  }

  // 5. Validate socratic hints
  if (parsed.socraticHints !== undefined) {
    if (!Array.isArray(parsed.socraticHints)) {
      errors.push('socraticHints must be a valid array of strings.');
    }
  }

  // 6. Validate sentence upgrades
  if (parsed.sentenceUpgrades !== undefined) {
    if (!Array.isArray(parsed.sentenceUpgrades)) {
      errors.push('sentenceUpgrades must be a valid array.');
    } else {
      parsed.sentenceUpgrades.forEach((upg: any, idx: number) => {
        const path = `sentenceUpgrades[${idx}]`;
        if (typeof upg.original !== 'string' || !upg.original.trim()) {
          errors.push(`${path}.original must be a non-empty string.`);
        }
        if (typeof upg.upgraded !== 'string' || !upg.upgraded.trim()) {
          errors.push(`${path}.upgraded must be a non-empty string.`);
        }
        if (typeof upg.explanation !== 'string' || !upg.explanation.trim()) {
          errors.push(`${path}.explanation explanation is missing.`);
        }
      });
    }
  }

  if (errors.length > 0) {
    throw new AIValidationError('AI response failed strict IELTS Speaking Feedback schema validation.', errors);
  }
}
