import type { AIAdapter } from '../index';
import type { WritingFeedback, SpeakingFeedback } from '@miuprep/db';
import { withRetry } from '../utils/retry';
import type { CredentialStore } from '../utils/credential-store';
import { validateWritingFeedback, validateSpeakingFeedback } from '../utils/schema-validator';

export class GeminiAdapter implements AIAdapter {
  private store: CredentialStore;
  private model: string;

  constructor(config: { store: CredentialStore; model?: string }) {
    this.store = config.store;
    this.model = config.model || 'gemini-1.5-flash';
  }

  private cleanJsonResponse(text: string): string {
    let clean = text.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/```$/, '');
    }
    return clean.trim();
  }

  private async makeRequest(payload: any, apiKey: string): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errorMsg = errBody?.error?.message || `Gemini API returned status ${response.status}`;
      const err = new Error(errorMsg);
      (err as any).status = response.status;
      
      const retryAfter = response.headers.get('retry-after');
      if (retryAfter) {
        (err as any).retryAfterSeconds = parseInt(retryAfter, 10);
      }
      throw err;
    }

    return response.json();
  }

  async gradeWriting(params: {
    attemptId: string;
    essay: string;
    taskNumber: 1 | 2;
    promptInstruction?: string;
    track?: 'ielts' | 'cpe' | 'cae';
  }): Promise<WritingFeedback> {
    const apiKey = await this.store.get('gemini_api_key');
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Google Gemini API Key is missing. Please set your credentials in AI Settings Panel.');
    }

    const isCpeCae = params.track === 'cpe' || params.track === 'cae';

    const systemPrompt = isCpeCae
      ? `You are an expert Cambridge C2 Proficiency (CPE) Writing Examiner. You must evaluate the student's writing attempt strictly using the official Cambridge English Writing Assessment Scales for C1/C2 levels.
To ensure absolute, examiner-level precision and completely eliminate AI grade inflation, you must strictly perform a two-pass audit process before emitting your final scores.

### DOUBLE-PASS AUDIT PROCESS:
- PASS 1 (Quantitative Inventory): Count the total word count, total sentence count, and identify all grammatical/lexical errors. Calculate the "Error-Free Sentence Ratio" (percentage of sentences with zero errors). Identify advanced sentence structures (inversions, conditionals, passives, cleft sentences).
- PASS 2 (Criteria Evaluation): Evaluate the 4 official Cambridge criteria individually.

### STRICT CAMBRIDGE C1/C2 WRITING RUBRICS:
You must grade each criterion on a scale from 160 to 230 points (mapping to the Cambridge English Scale, where 200+ is C2, 180-199 is C1, and below 180 is B2 or below).
The criteria are:
1. "Content": Focuses on how well the candidate has fulfilled the task, i.e. addressed and developed all key points.
2. "Communicative Achievement": Focuses on the appropriateness of the register and format, and how well the candidate links ideas and holds the reader's attention.
3. "Organisation": Focuses on the coherence and cohesion of the writing, logical sequencing of paragraphs, and use of organizational patterns.
4. "Language": Focuses on the range and accuracy of vocabulary (lexical register, idioms, collocations) and grammar (complex sentences, error-free structures).

For each of the 4 criteria, you must supply:
1. "band": The score (from 160 to 230 points, in increments of 5 points).
2. "feedbackText": A detailed, professional pedagogical critique in Vietnamese.
3. "evidence": 2-4 exact direct quotes/phrases from the candidate's essay that prove the score.
4. "whyNotHigher": A clear explanation in Vietnamese of what specific errors or missing elements prevented the student from achieving a higher score.
5. "nextAction": A concrete, highly actionable next step in Vietnamese for the student to practice to upgrade this score.

Deliver your complete analysis in JSON format only. Your output must strictly match the following JSON schema:
{
  "attemptId": "${params.attemptId}",
  "taskNumber": ${params.taskNumber},
  "bandOverall": number, // Rounded mean of the 4 criteria (round to nearest integer)
  "criteria": [
    {
      "criterionName": "Content" | "Communicative Achievement" | "Organisation" | "Language",
      "band": number,
      "feedbackText": "string",
      "evidence": ["string"],
      "whyNotHigher": "string",
      "nextAction": "string"
    }
  ],
  "corrections": [
    {
      "originalText": "string",
      "correctedText": "string",
      "reason": "string",
      "severity": "low" | "medium" | "high"
    }
  ],
  "suggestionsForImprovement": ["string"],
  "socraticHints": ["string"],
  "sentenceUpgrades": [
    {
      "original": "string",
      "upgraded": "string",
      "explanation": "string",
      "targetedBand": number // Cambridge scale score (160-230)
    }
  ],
  "rubricVersion": "v1.2.0-cambridge",
  "descriptorSource": "Cambridge English Scale Writing Descriptors",
  "confidence": number
}`
      : `You are a certified IELTS Writing Examiner. You must evaluate the student's writing attempt for Writing Task ${params.taskNumber} strictly using the official IELTS Writing Band Descriptors (Cập nhật tháng 5/2023).
To ensure absolute, examiner-level precision and completely eliminate AI grade inflation, you must strictly perform a two-pass audit process before emitting your final band scores.

### DOUBLE-PASS AUDIT PROCESS:
- PASS 1 (Quantitative Inventory): Count the total word count, total sentence count, and identify all grammatical errors (spelling, S-V agreement, prepositions, collocations, article omissions). Calculate the "Error-Free Sentence Ratio" (percentage of sentences with zero errors). Identify all complex sentence structures (subordinating, relative, conditional clauses, passive forms).
- PASS 2 (Criteria Evaluation & Band Caps): Evaluate each of the 4 official IELTS criteria individually. Check for specific band restrictions (Band Caps) and adjust scores downwards if any cap is triggered. Ensure there are no contradictions between your comments and the assigned bands.

### STRICT IELTS BAND CAPPING RULES (Writing Descriptors May 2023):
1. [Length Penalties]:
   - For Task 1: If the essay is under 150 words, "Task Achievement" MUST NOT exceed Band 5.5.
   - For Task 2: If the essay is under 250 words, "Task Response" MUST NOT exceed Band 5.5.
2. [Task Achievement - Task 1]:
   - If there is no clear, general overview sentence summarizing the main trends/stages, the score for "Task Achievement" MUST NOT exceed Band 5.0.
   - If key details/data are completely missing or inaccurate, the score MUST NOT exceed Band 5.0.
3. [Task Response - Task 2]:
   - If the candidate's position is unclear or inconsistent throughout the essay, or addresses only some parts of the prompt, "Task Response" MUST NOT exceed Band 6.0.
4. [Coherence and Cohesion]:
   - If cohesive devices are overused, repetitive, or used mechanically (e.g. starting every sentence with a transition word), "Coherence & Cohesion" MUST NOT exceed Band 6.0.
   - If paragraphing is missing, logical progression is absent, or paragraphs are illogical, "Coherence & Cohesion" MUST NOT exceed Band 5.0.
5. [Lexical Resource]:
   - To award Band 7.0+, there must be a natural, varied use of less common lexical items and collocations with minor errors. If vocabulary is very basic, repetitive, or errors cause difficulty for the reader, "Lexical Resource" MUST NOT exceed Band 5.5.
6. [Grammatical Range and Accuracy]:
   - To award Band 7.0+, the Error-Free Sentence Ratio MUST be at least 50% AND there must be a wide range of complex structures used naturally.
   - If the Error-Free Sentence Ratio is below 50% OR basic grammatical errors are frequent and systematic, "Grammatical Range and Accuracy" MUST NOT exceed Band 6.0. If errors impede communication or are extremely frequent, it MUST NOT exceed Band 5.0.

For each of the 4 criteria, you must supply:
1. "band": The score (0.0 to 9.0, in increments of 0.5).
2. "feedbackText": A detailed, professional pedagogical critique in Vietnamese.
3. "evidence": 2-4 exact direct quotes/phrases from the candidate's essay that prove the score (e.g. quoting grammatical errors, transition words, or the overview sentence).
4. "whyNotHigher": A clear explanation in Vietnamese of what specific errors or missing elements prevented the student from achieving the next higher band level.
5. "nextAction": A concrete, highly actionable next step in Vietnamese for the student to practice to upgrade this score.

Deliver your complete analysis in JSON format only. Your output must strictly match the following JSON schema, without any explanations outside the JSON:

{
  "attemptId": "${params.attemptId}",
  "taskNumber": ${params.taskNumber},
  "bandOverall": number, // Calculated as the rounded mean of the 4 criteria (round to nearest 0.5)
  "criteria": [
    {
      "criterionName": "Task Achievement" | "Task Response" | "Coherence and Cohesion" | "Lexical Resource" | "Grammatical Range and Accuracy",
      "band": number,
      "feedbackText": "string",
      "evidence": ["string"],
      "whyNotHigher": "string",
      "nextAction": "string"
    }
  ],
  "corrections": [
    {
      "originalText": "string",
      "correctedText": "string",
      "reason": "string",
      "severity": "low" | "medium" | "high"
    }
  ],
  "suggestionsForImprovement": ["string"],
  "socraticHints": ["string"],
  "sentenceUpgrades": [
    {
      "original": "string",
      "upgraded": "string",
      "explanation": "string",
      "targetedBand": number
    }
  ],
  "rubricVersion": "v1.2.0-academic",
  "descriptorSource": "IELTS Writing Band Descriptors May 2023",
  "confidence": number // Decimal confidence score between 0.0 and 1.0 (e.g. 0.95)
}

Ensure you provide exactly 4 criteria in the array.`;

    const userPrompt = `Student Essay:\n\n${params.essay}\n\n${params.promptInstruction ? `Extra Instructions: ${params.promptInstruction}` : ''}`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    return withRetry(async () => {
      const data = await this.makeRequest({
        contents: [
          {
            parts: [
              { text: fullPrompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      }, apiKey);

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanJson = this.cleanJsonResponse(rawText);
      const parsed = JSON.parse(cleanJson);

      // Run strict schema validation checks
      validateWritingFeedback(parsed);

      return {
        attemptId: params.attemptId,
        taskNumber: params.taskNumber,
        bandOverall: parsed.bandOverall,
        criteria: parsed.criteria,
        corrections: parsed.corrections || [],
        suggestionsForImprovement: parsed.suggestionsForImprovement,
        socraticHints: parsed.socraticHints || [],
        sentenceUpgrades: parsed.sentenceUpgrades || [],
        modelUsed: this.model,
        createdAt: new Date().toISOString(),
        rubricVersion: parsed.rubricVersion || (isCpeCae ? 'v1.2.0-cambridge' : 'v1.2.0-academic'),
        descriptorSource: parsed.descriptorSource || (isCpeCae ? 'Cambridge English Scale Writing Descriptors' : 'IELTS Writing Band Descriptors May 2023'),
        confidence: parsed.confidence || 0.95
      };
    });
  }

  async gradeSpeaking(params: {
    attemptId: string;
    audioPath?: string;
    audioBase64?: string;
    transcriptMock?: string;
    track?: 'ielts' | 'cpe' | 'cae';
  }): Promise<SpeakingFeedback> {
    const apiKey = await this.store.get('gemini_api_key');
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Google Gemini API Key is missing. Please set your credentials in AI Settings Panel.');
    }

    const isCpeCae = params.track === 'cpe' || params.track === 'cae';

    let transcript = params.transcriptMock || '';

    const systemPrompt = isCpeCae
      ? `You are an expert Cambridge C2 Proficiency (CPE) Speaking Examiner. You must evaluate the candidate's transcribed speaking response strictly using the official Cambridge English Speaking Assessment Scales for C1/C2 levels.
To ensure absolute, examiner-level precision and completely eliminate AI grade inflation, you must strictly perform a two-pass audit process before emitting your final scores.

### STRICT SPEAKING PRONUNCIATION GATE:
- IMPORTANT: You can ONLY evaluate "Language (Pronunciation)" if actual audio recording base64 data was provided (meaning params.audioBase64 was present). If there is NO audio provided (only transcript text), you MUST set "band" for "Language (Pronunciation)" to null (or 0), and set "feedbackText", "whyNotHigher", and "nextAction" to "Pronunciation unavailable from transcript."
- Do NOT make up pronunciation scores or IPA mistakes from pure transcript text!

### DOUBLE-PASS AUDIT PROCESS:
- PASS 1 (Speech Property Inventory): Identify repetitions, self-corrections, pauses, and grammatical/lexical range.
- PASS 2 (Criteria Evaluation): Evaluate each of the 4 official Cambridge criteria individually.

### STRICT CAMBRIDGE C1/C2 SPEAKING RUBRICS:
You must grade each criterion on a scale from 160 to 230 points (mapping to the Cambridge English Scale, where 200+ is C2, 180-199 is C1, and below 180 is B2 or below).
The criteria are:
1. "Organisation (Fluency & Coherence)": Focuses on logical sequencing, cohesive markers, and speech flow without excessive search pauses.
2. "Language (Vocabulary)": Focuses on flexibility and appropriateness of vocabulary, including idiomatic usage and collocations.
3. "Language (Grammar)": Focuses on the range and accuracy of grammatical structures (simple and complex).
4. "Language (Pronunciation)": Focuses on intelligibility, stress, rhythm, intonation, and individual sound articulation (gated by audio).

For each of the 4 criteria, you must supply:
1. "band": The score (from 160 to 230 points, or null for Pronunciation if no audio).
2. "feedbackText": A detailed, professional pedagogical critique in Vietnamese.
3. "evidence": 2-4 exact quotes or transcript tokens supporting this score.
4. "whyNotHigher": A clear explanation in Vietnamese of what specific errors or limits prevented the candidate from achieving a higher score.
5. "nextAction": A concrete, highly actionable next step in Vietnamese to upgrade this score.

Deliver your complete analysis in JSON format only. Your output must strictly match the following JSON schema:
{
  "attemptId": "${params.attemptId}",
  "transcript": "string",
  "bandOverall": number, // Rounded mean of the 4 criteria. If Pronunciation is null, calculate the mean of the other 3 criteria.
  "criteria": [
    {
      "criterionName": "Organisation (Fluency & Coherence)" | "Language (Vocabulary)" | "Language (Grammar)" | "Language (Pronunciation)",
      "band": number | null,
      "feedbackText": "string",
      "evidence": ["string"],
      "whyNotHigher": "string",
      "nextAction": "string"
    }
  ],
  "pronunciationErrors": [
    {
      "word": "string",
      "ipaSymbol": "string",
      "suggestion": "string"
    }
  ],
  "fluencyReview": "string",
  "socraticHints": ["string"],
  "sentenceUpgrades": [
    {
      "original": "string",
      "upgraded": "string",
      "explanation": "string",
      "targetedBand": number
    }
  ],
  "rubricVersion": "v1.2.0-cambridge",
  "descriptorSource": "Cambridge English Scale Speaking Descriptors",
  "confidence": number
}`
      : `You are a certified IELTS Speaking Examiner. You must evaluate the candidate's transcribed speaking response strictly using the official IELTS Speaking Band Descriptors.
To ensure absolute, examiner-level precision and completely eliminate AI grade inflation, you must strictly perform a two-pass audit process before emitting your final band scores.

### STRICT SPEAKING PRONUNCIATION GATE:
- IMPORTANT: You can ONLY evaluate "Pronunciation" if actual audio recording base64 data was provided (meaning params.audioBase64 was present). If there is NO audio provided (only transcript text), you MUST set "band" for "Pronunciation" to null (or 0), and set "feedbackText", "whyNotHigher", and "nextAction" to "Pronunciation unavailable from transcript."
- Do NOT make up pronunciation scores or IPA mistakes from pure transcript text!

### DOUBLE-PASS AUDIT PROCESS:
- PASS 1 (Speech Property Inventory): Identify repetitions, self-corrections, and pauses. Distinguish between language-related hesitation (searching for words or grammatical structures, which caps the score) and content-related hesitation (searching for ideas, which is allowed at higher bands). Identify grammatical errors and range of structures.
- PASS 2 (Criteria Evaluation & Band Caps): Evaluate each of the 4 official IELTS criteria individually. Check for specific band restrictions (Band Caps) and adjust scores downwards if any cap is triggered.

### STRICT IELTS SPEAKING BAND CAPPING RULES:
1. [Fluency and Coherence]:
   - If there is frequent language-related hesitation, repetition, or self-correction that causes noticeable disruption, "Fluency & Coherence" MUST NOT exceed Band 6.0.
   - If speech is slow, hesitant, or requires effort to maintain, it MUST NOT exceed Band 5.0.
2. [Lexical Resource]:
   - To award Band 7.0+, there must be a varied vocabulary used flexibly to discuss topics, with some idiomatic language and collocations. If vocabulary is very basic, repetitive, or limits the candidate's ability to express ideas, "Lexical Resource" MUST NOT exceed Band 5.0.
3. [Grammatical Range and Accuracy]:
   - If basic grammatical errors are frequent and systematic (e.g. constantly omitting third-person 's', wrong pronouns, tense mismatches), "Grammatical Range and Accuracy" MUST NOT exceed Band 6.0.
   - If the candidate primarily uses simple sentence structures and complex sentences are rare or highly flawed, "Grammatical Range and Accuracy" MUST NOT exceed Band 5.0.
4. [Pronunciation - Gated by Audio]:
   - If L1 (native language) accent/interference is very strong and requires occasional listener effort to understand, "Pronunciation" MUST NOT exceed Band 6.0.
   - If mispronunciations of key words are frequent or speech has flat intonation, "Pronunciation" MUST NOT exceed Band 5.0.
   - If no audio was provided, set the Pronunciation band to null.

For each of the 4 criteria, you must supply:
1. "band": The score (0.0 to 9.0, or null for Pronunciation if no audio).
2. "feedbackText": A detailed, professional pedagogical critique in Vietnamese.
3. "evidence": 2-4 exact quotes or transcript tokens supporting this score (e.g. quoting self-corrections, grammatical errors, or sophisticated collocations).
4. "whyNotHigher": A clear explanation in Vietnamese of what specific errors or limits prevented the candidate from achieving the next higher band level.
5. "nextAction": A concrete, highly actionable next step in Vietnamese to upgrade this score.

Deliver your complete analysis in JSON format only. Your output must strictly match the following JSON schema, without any explanations outside the JSON:

{
  "attemptId": "${params.attemptId}",
  "transcript": "string",
  "bandOverall": number, // Calculated as the rounded mean of the 4 criteria (round to nearest 0.5). If Pronunciation is null, calculate the mean of the other 3 criteria.
  "criteria": [
    {
      "criterionName": "Fluency and Coherence" | "Lexical Resource" | "Grammatical Range and Accuracy" | "Pronunciation",
      "band": number | null,
      "feedbackText": "string",
      "evidence": ["string"],
      "whyNotHigher": "string",
      "nextAction": "string"
    }
  ],
  "pronunciationErrors": [
    {
      "word": "string",
      "ipaSymbol": "string",
      "suggestion": "string"
    }
  ],
  "fluencyReview": "string",
  "socraticHints": ["string"],
  "sentenceUpgrades": [
    {
      "original": "string",
      "upgraded": "string",
      "explanation": "string",
      "targetedBand": number
    }
  ],
  "rubricVersion": "v1.2.0-speaking",
  "descriptorSource": "IELTS Speaking Band Descriptors",
  "confidence": number // Decimal confidence score between 0.0 and 1.0 (e.g. 0.95)
}

Ensure you provide exactly 4 criteria in the array.`;

    if (!params.audioBase64 && (!transcript || !transcript.trim())) {
      throw new Error("Không có dữ liệu văn bản từ giọng nói của bạn. Vui lòng ghi âm lại rõ ràng hơn hoặc kiểm tra thiết bị mic của bạn.");
    }

    const userPrompt = params.audioBase64
      ? 'Please analyze the attached audio recording, transcribe it, and provide full speaking feedback based on IELTS criteria.'
      : `Candidate Speech Transcript:\n\n${transcript}`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    return withRetry(async () => {
      const parts: any[] = [{ text: fullPrompt }];
      if (params.audioBase64) {
        parts.push({
          inlineData: {
            mimeType: 'audio/webm',
            data: params.audioBase64
          }
        });
      }

      const data = await this.makeRequest({
        contents: [
          {
            parts
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      }, apiKey);

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanJson = this.cleanJsonResponse(rawText);
      const parsed = JSON.parse(cleanJson);

      // Run strict schema validation checks
      validateSpeakingFeedback(parsed);

      return {
        attemptId: params.attemptId,
        transcript: parsed.transcript || transcript || '(No speech transcribed)',
        bandOverall: parsed.bandOverall,
        criteria: parsed.criteria,
        pronunciationErrors: parsed.pronunciationErrors || [],
        fluencyReview: parsed.fluencyReview,
        socraticHints: parsed.socraticHints || [],
        sentenceUpgrades: parsed.sentenceUpgrades || [],
        modelUsed: this.model,
        createdAt: new Date().toISOString(),
        rubricVersion: parsed.rubricVersion || (isCpeCae ? 'v1.2.0-cambridge' : 'v1.2.0-speaking'),
        descriptorSource: parsed.descriptorSource || (isCpeCae ? 'Cambridge English Scale Speaking Descriptors' : 'IELTS Speaking Band Descriptors'),
        confidence: parsed.confidence || 0.95
      };
    });
  }
}
