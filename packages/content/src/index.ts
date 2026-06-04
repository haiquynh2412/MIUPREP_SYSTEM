export type QuestionType =
  | 'multiple_choice'
  | 'true_false_not_given'
  | 'matching_headings'
  | 'gap_fill'
  | 'map_labeling'
  | 'multiple_select'
  | 'table_completion'
  | 'gapped_text'
  | 'multiple_matching';

export interface IeltsQuestion {
  id: string;
  type: QuestionType;
  instruction: string;
  options?: string[];            // For MCQ / Selection lists
  blankIndex?: number;           // For Gap Fill/Table Completion placement (blank index in passage)
  acceptedAnswers: string[][];   // Supported variations per blank (e.g. [["30", "thirty"]])
  correctAnswer: string | string[] | boolean | null;
  explanation?: string;          // Pedagogy explanation for educational review
  answerLocation?: string;       // Exact string matching the answer location inside the passage
  passageHtml?: string | null;   // Dynamically appended passage html for adaptive/focused practice
  displayMode?: 'topic' | 'test' | 'both'; // Specifies question visibility: study topic, mock test, or both
}

export interface QuestionGroup {
  id: string;
  instruction: string;
  questions: IeltsQuestion[];
  passageText?: string;          // Section of reading passage mapped to this specific group
}

export interface ExamSection {
  id: string;
  title: string;
  instructions: string;
  audioPath?: string;            // Listening section audio file path/URL
  audioChecksum?: string;        // SHA-256 for integrity verification
  audioTimestamps?: {            // Maps questions/groups to specific audio intervals
    questionGroupId: string;
    startSecond: number;
    endSecond: number;
  }[];
  passageHtml?: string;          // For Reading passages (split-screen layout HTML)
  transcript?: string;           // Listening section transcript/tapescript with answer highlight mappings
  questionGroups: QuestionGroup[];
}

export interface IeltsTest {
  id: string;
  title: string;
  type: 'academic' | 'general';
  skill: 'listening' | 'reading' | 'writing' | 'speaking' | 'use_of_english';
  sections: ExamSection[];
  exam?: 'ielts' | 'cpe' | 'cae';
}

export * from './standard';
export * from './math6-plan';
export * from './math6-import';
export * from './math6-geometry-figures';
export * from './math6-content-guard-report';
export * from './math-learning';
export * from './admin-import';
export * from './sat-content';
export * from './english-learning';
export * from './content-query';
export * from './validator';
export * from './miumath-content-guard-report';
export * from './mocks';
