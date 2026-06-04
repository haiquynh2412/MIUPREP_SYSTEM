import type { IeltsTest } from '@miuprep/content';
import { validateIeltsTest } from '@miuprep/content';
import {
  listLearningEventsFromStorage,
  normalizeErrorNotebookEntry,
  saveLearningEventToStorage,
  scheduleErrorNotebookReview,
  type LearningEventRecord,
} from '@miuprep/learning';

// ==========================================
// 1. Data Schemas
// ==========================================

export interface AnswerState {
  rawValue: string | string[] | boolean | null;
  normalizedValue: string;
  updatedAt: string; // ISO string
}

export interface ExamAttempt {
  local_id: string;
  remote_id?: string;
  testId: string;
  userId: string;
  status: 'in_progress' | 'submitted';
  examMode?: 'practice' | 'exam';
  
  // Drift-proof time tracking
  startedAt: string;             // ISO String
  lastSavedAt: string;           // ISO String
  submittedAt?: string;          // ISO String
  durationSeconds: number;       // Allowed time (e.g. 3600)
  remainingSeconds: number;      // Calculated remaining time

  answers: Record<string, AnswerState>; // Map: QuestionID -> AnswerState
  pauseRanges?: { pausedAt: string; resumedAt: string | null }[];
  scores?: {
    rawScore: number;
    bandScore: number;
    totalQuestions?: number;
    isMockScoring?: boolean;
  };
  
  createdAt: string;
  updatedAt: string;
  sync_status: 'synced' | 'pending' | 'failed';
  version: number;               // For sync conflict detection
}

export interface CriteriaScore {
  criterionName: string;         // e.g. "Task Achievement"
  band: number;
  feedbackText: string;
  evidence?: string[];           // 2-4 direct quotes/tokens from candidate's attempt supporting this score
  whyNotHigher?: string;         // What kept the score from reaching the next band level (Vietnamese)
  nextAction?: string;           // Direct next action to upgrade this score (Vietnamese)
}

export interface GrammarCorrection {
  originalText: string;
  correctedText: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface WritingFeedback {
  attemptId: string;
  taskNumber: 1 | 2;
  bandOverall: number;
  criteria: CriteriaScore[];
  corrections: GrammarCorrection[];
  suggestionsForImprovement: string[];
  socraticHints?: string[];
  sentenceUpgrades?: {
    original: string;
    upgraded: string;
    explanation: string;
    targetedBand: number;
  }[];
  modelUsed: string;
  createdAt: string;
  rubricVersion?: string;        // e.g. "v1.0.0-academic"
  descriptorSource?: string;     // e.g. "IELTS Writing Band Descriptors May 2023"
  confidence?: number;           // Reliability factor (0.0 - 1.0)
  isMockScoring?: boolean;
}

export interface SpeakingFeedback {
  attemptId: string;
  transcript: string;
  bandOverall: number;
  criteria: CriteriaScore[];
  pronunciationErrors: {
    word: string;
    ipaSymbol?: string;
    suggestion: string;
  }[];
  fluencyReview: string;
  socraticHints?: string[];
  sentenceUpgrades?: {
    original: string;
    upgraded: string;
    explanation: string;
    targetedBand: number;
  }[];
  modelUsed: string;
  createdAt: string;
  rubricVersion?: string;        // e.g. "v1.0.0-speaking"
  descriptorSource?: string;     // e.g. "IELTS Speaking Band Descriptors"
  confidence?: number;           // Reliability factor (0.0 - 1.0)
  isMockScoring?: boolean;
}

export interface LearnerProfile {
  userId: string;
  targetBand: number;
  examDate: string;
  weakSkills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ErrorNotebookEntry {
  id: string;
  userId: string;
  attemptId: string;
  questionId: string;
  questionType: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
  createdAt: string;
}

export interface LocalUser {
  id: string;
  username: string;
  passwordHash: string;
  targetBand: number;
  examDate: string;
  role: 'admin' | 'parent' | 'student';
  createdAt: string;
  displayName?: string;
  contactInfo?: string;
  status?: 'approved' | 'pending' | 'rejected';
  assignedTrack?: 'ielts' | 'cpe' | 'cae' | 'math' | 'sat';
  assignedTracks?: ('ielts' | 'cpe' | 'cae' | 'math' | 'sat')[];
  linkedStudents?: string[];
  rewardsAllocated?: number;
}

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  module: 'AI' | 'MICROPHONE' | 'SQLITE' | 'SYSTEM';
  message: string;
  payload?: string | null;
  createdAt?: string;
}


// ==========================================
// 2. StorageAdapter Interface
// ==========================================

export interface StorageAdapter {
  initialize(): Promise<void>;
  
  // Exam Attempt Actions (Autosave / Load)
  saveAttempt(attempt: ExamAttempt): Promise<void>;
  getAttempt(localId: string): Promise<ExamAttempt | null>;
  listAttempts(userId: string): Promise<ExamAttempt[]>;
  
  // Content operations
  getTest(testId: string): Promise<IeltsTest | null>;
  saveTest(test: IeltsTest): Promise<void>;
  listTests(): Promise<IeltsTest[]>;
  
  // AI Evaluations
  saveWritingFeedback(feedback: WritingFeedback): Promise<void>;
  getWritingFeedback(attemptId: string, taskNumber: 1 | 2): Promise<WritingFeedback | null>;
  
  // Adaptive Learning & SRS
  saveLearnerProfile(profile: LearnerProfile): Promise<void>;
  getLearnerProfile(userId: string): Promise<LearnerProfile | null>;
  addErrorEntry(entry: ErrorNotebookEntry): Promise<void>;
  listErrorEntries(userId: string): Promise<ErrorNotebookEntry[]>;
  updateErrorEntrySrs(id: string, grade: number): Promise<void>;
  
  // Backup & Import
  exportLocalData(userId?: string): Promise<string>;
  importLocalData(encryptedJson: string): Promise<void>;

  // Local User Operations
  registerLocalUser(user: LocalUser): Promise<void>;
  getLocalUser(username: string): Promise<LocalUser | null>;
  listLocalUsers(): Promise<Omit<LocalUser, 'passwordHash'>[]>;
  deleteLocalUser(username: string): Promise<void>;

  // Telemetry & Diagnostics Logging
  saveLearningEvent(event: LearningEventRecord): Promise<void>;
  listLearningEvents(userId?: string, limit?: number): Promise<LearningEventRecord[]>;
  logSystemEvent(log: SystemLog): Promise<void>;
  listSystemLogs(limit?: number): Promise<SystemLog[]>;
}

// ==========================================
// 3. LocalStorageAdapter Implementation
// ==========================================

export class LocalStorageAdapter implements StorageAdapter {
  private prefix = 'ielts_app_';

  async initialize(): Promise<void> {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn("LocalStorage is not available in this environment.");
    }
  }

  private getKey(subKey: string): string {
    return `${this.prefix}${subKey}`;
  }

  async saveAttempt(attempt: ExamAttempt): Promise<void> {
    try {
      const listKey = this.getKey('attempts_list');
      const attemptsJson = localStorage.getItem(listKey) || '[]';
      const attemptsList: string[] = JSON.parse(attemptsJson);

      if (!attemptsList.includes(attempt.local_id)) {
        attemptsList.push(attempt.local_id);
        localStorage.setItem(listKey, JSON.stringify(attemptsList));
      }

      const itemKey = this.getKey(`attempt_${attempt.local_id}`);
      localStorage.setItem(itemKey, JSON.stringify(attempt));
    } catch (e) {
      console.error("Failed to save attempt to localStorage", e);
      throw e;
    }
  }

  async getAttempt(localId: string): Promise<ExamAttempt | null> {
    try {
      const itemKey = this.getKey(`attempt_${localId}`);
      const data = localStorage.getItem(itemKey);
      if (!data) return null;
      return JSON.parse(data) as ExamAttempt;
    } catch (e) {
      console.error("Failed to read attempt from localStorage", e);
      return null;
    }
  }

  async listAttempts(userId: string): Promise<ExamAttempt[]> {
    try {
      const listKey = this.getKey('attempts_list');
      const attemptsJson = localStorage.getItem(listKey) || '[]';
      const ids: string[] = JSON.parse(attemptsJson);

      const list: ExamAttempt[] = [];
      for (const id of ids) {
        const attempt = await this.getAttempt(id);
        if (attempt && attempt.userId === userId) {
          list.push(attempt);
        }
      }
      return list;
    } catch (e) {
      console.error("Failed to list attempts from localStorage", e);
      return [];
    }
  }

  async getTest(testId: string): Promise<IeltsTest | null> {
    try {
      const itemKey = this.getKey(`test_${testId}`);
      const data = localStorage.getItem(itemKey);
      if (!data) return null;
      return JSON.parse(data) as IeltsTest;
    } catch (e) {
      console.error("Failed to read test from localStorage", e);
      return null;
    }
  }

  async saveTest(test: IeltsTest): Promise<void> {
    const errors = validateIeltsTest(test);
    const criticalErrors = errors.filter(e => e.severity === 'error');
    if (criticalErrors.length > 0) {
      const errorMsg = `Invalid test content: ${criticalErrors.map(e => `[${e.path}]: ${e.message}`).join(', ')}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const listKey = this.getKey('tests_list');
      const testsJson = localStorage.getItem(listKey) || '[]';
      const testsList: string[] = JSON.parse(testsJson);

      if (!testsList.includes(test.id)) {
        testsList.push(test.id);
        localStorage.setItem(listKey, JSON.stringify(testsList));
      }

      const itemKey = this.getKey(`test_${test.id}`);
      localStorage.setItem(itemKey, JSON.stringify(test));
    } catch (e) {
      console.error("Failed to save test to localStorage", e);
      throw e;
    }
  }

  async listTests(): Promise<IeltsTest[]> {
    try {
      const listKey = this.getKey('tests_list');
      const testsJson = localStorage.getItem(listKey) || '[]';
      const ids: string[] = JSON.parse(testsJson);

      const list: IeltsTest[] = [];
      for (const id of ids) {
        const test = await this.getTest(id);
        if (test) {
          list.push(test);
        }
      }
      return list;
    } catch (e) {
      console.error("Failed to list tests from localStorage", e);
      return [];
    }
  }

  async saveWritingFeedback(feedback: WritingFeedback): Promise<void> {
    try {
      const key = this.getKey(`writing_fb_${feedback.attemptId}_task${feedback.taskNumber}`);
      localStorage.setItem(key, JSON.stringify(feedback));
    } catch (e) {
      console.error("Failed to save writing feedback to localStorage", e);
      throw e;
    }
  }

  async getWritingFeedback(attemptId: string, taskNumber: 1 | 2): Promise<WritingFeedback | null> {
    try {
      const key = this.getKey(`writing_fb_${attemptId}_task${taskNumber}`);
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data) as WritingFeedback;
    } catch (e) {
      console.error("Failed to read writing feedback from localStorage", e);
      return null;
    }
  }

  async saveLearnerProfile(profile: LearnerProfile): Promise<void> {
    try {
      const key = this.getKey(`profile_${profile.userId}`);
      localStorage.setItem(key, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save profile to localStorage", e);
      throw e;
    }
  }

  async getLearnerProfile(userId: string): Promise<LearnerProfile | null> {
    try {
      const key = this.getKey(`profile_${userId}`);
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data) as LearnerProfile;
    } catch (e) {
      console.error("Failed to read profile from localStorage", e);
      return null;
    }
  }

  async addErrorEntry(entry: ErrorNotebookEntry): Promise<void> {
    try {
      const normalized = normalizeErrorNotebookEntry(entry);
      const listKey = this.getKey('errors_list');
      const listJson = localStorage.getItem(listKey) || '[]';
      const ids: string[] = JSON.parse(listJson);
      if (!ids.includes(normalized.id)) {
        ids.push(normalized.id);
        localStorage.setItem(listKey, JSON.stringify(ids));
      }
      const itemKey = this.getKey(`error_${normalized.id}`);
      localStorage.setItem(itemKey, JSON.stringify(normalized));
    } catch (e) {
      console.error("Failed to save error entry to localStorage", e);
      throw e;
    }
  }

  async listErrorEntries(userId: string): Promise<ErrorNotebookEntry[]> {
    try {
      const listKey = this.getKey('errors_list');
      const listJson = localStorage.getItem(listKey) || '[]';
      const ids: string[] = JSON.parse(listJson);
      const entries: ErrorNotebookEntry[] = [];
      for (const id of ids) {
        const itemKey = this.getKey(`error_${id}`);
        const data = localStorage.getItem(itemKey);
        if (data) {
          const entry = normalizeErrorNotebookEntry(JSON.parse(data) as ErrorNotebookEntry);
          if (entry.userId === userId) {
            entries.push(entry);
          }
        }
      }
      return entries;
    } catch (e) {
      console.error("Failed to list error entries from localStorage", e);
      return [];
    }
  }

  async updateErrorEntrySrs(id: string, grade: number): Promise<void> {
    try {
      const itemKey = this.getKey(`error_${id}`);
      const data = localStorage.getItem(itemKey);
      if (!data) return;
      const entry = JSON.parse(data) as ErrorNotebookEntry;
      const updated: ErrorNotebookEntry = scheduleErrorNotebookReview(entry, grade);
      localStorage.setItem(itemKey, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update SRS in localStorage", e);
    }
  }

  async saveLearningEvent(event: LearningEventRecord): Promise<void> {
    try {
      saveLearningEventToStorage(event, localStorage);
    } catch (e) {
      console.error("Failed to save learning event to localStorage", e);
    }
  }

  async listLearningEvents(userId?: string, limit?: number): Promise<LearningEventRecord[]> {
    try {
      return listLearningEventsFromStorage(localStorage, { learnerId: userId, limit });
    } catch (e) {
      console.error("Failed to list learning events from localStorage", e);
      return [];
    }
  }

  async exportLocalData(userId?: string): Promise<string> {
    void userId;
    try {
      const data: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          data[key] = localStorage.getItem(key);
        }
      }
      const rawString = JSON.stringify(data);
      // Encrypt/Encode state into Base64 for simple data mobility and backups
      return btoa(unescape(encodeURIComponent(rawString)));
    } catch (e) {
      console.error("Failed to export local data", e);
      throw new Error("Export failed");
    }
  }

  async importLocalData(encryptedJson: string): Promise<void> {
    try {
      const decoded = decodeURIComponent(escape(atob(encryptedJson)));
      const parsed: Record<string, string> = JSON.parse(decoded);
      for (const [key, val] of Object.entries(parsed)) {
        if (key.startsWith(this.prefix)) {
          localStorage.setItem(key, val);
        }
      }
    } catch (e) {
      console.error("Failed to import local data", e);
      throw new Error("Import failed. Data may be corrupted.");
    }
  }

  async registerLocalUser(user: LocalUser): Promise<void> {
    try {
      const listKey = this.getKey('users_list');
      const usersJson = localStorage.getItem(listKey) || '[]';
      const usersList: string[] = JSON.parse(usersJson);

      if (!usersList.includes(user.username)) {
        usersList.push(user.username);
        localStorage.setItem(listKey, JSON.stringify(usersList));
      }

      const itemKey = this.getKey(`user_${user.username}`);
      const preparedUser = {
        ...user,
        assignedTracks: user.assignedTracks || [user.assignedTrack || 'ielts']
      };
      localStorage.setItem(itemKey, JSON.stringify(preparedUser));
    } catch (e) {
      console.error("Failed to register local user in localStorage", e);
      throw e;
    }
  }

  async getLocalUser(username: string): Promise<LocalUser | null> {
    try {
      const itemKey = this.getKey(`user_${username}`);
      const data = localStorage.getItem(itemKey);
      if (!data) return null;
      const user = JSON.parse(data) as LocalUser;
      if (!user.assignedTracks) {
        user.assignedTracks = [user.assignedTrack || 'ielts'];
      }
      return user;
    } catch (e) {
      console.error("Failed to read user from localStorage", e);
      return null;
    }
  }

  async listLocalUsers(): Promise<Omit<LocalUser, 'passwordHash'>[]> {
    try {
      const listKey = this.getKey('users_list');
      const usersJson = localStorage.getItem(listKey) || '[]';
      const usernames: string[] = JSON.parse(usersJson);

      const list: Omit<LocalUser, 'passwordHash'>[] = [];
      for (const username of usernames) {
        const user = await this.getLocalUser(username);
        if (user) {
          const { passwordHash, ...rest } = user;
          list.push(rest);
        }
      }
      return list;
    } catch (e) {
      console.error("Failed to list users from localStorage", e);
      return [];
    }
  }

  async deleteLocalUser(username: string): Promise<void> {
    try {
      const listKey = this.getKey('users_list');
      const usersJson = localStorage.getItem(listKey) || '[]';
      let usersList: string[] = JSON.parse(usersJson);

      usersList = usersList.filter(u => u !== username);
      localStorage.setItem(listKey, JSON.stringify(usersList));

      const itemKey = this.getKey(`user_${username}`);
      localStorage.removeItem(itemKey);
    } catch (e) {
      console.error("Failed to delete local user from localStorage", e);
      throw e;
    }
  }

  async logSystemEvent(log: SystemLog): Promise<void> {
    try {
      const listKey = this.getKey('logs_list');
      const logsJson = localStorage.getItem(listKey) || '[]';
      const logsList: string[] = JSON.parse(logsJson);

      if (!logsList.includes(log.id)) {
        logsList.push(log.id);
        localStorage.setItem(listKey, JSON.stringify(logsList));
      }

      const completedLog: SystemLog = {
        ...log,
        createdAt: log.createdAt || new Date().toISOString()
      };
      const itemKey = this.getKey(`log_${log.id}`);
      localStorage.setItem(itemKey, JSON.stringify(completedLog));
    } catch (e) {
      console.error("Failed to save log to localStorage", e);
    }
  }

  async listSystemLogs(limit?: number): Promise<SystemLog[]> {
    try {
      const listKey = this.getKey('logs_list');
      const logsJson = localStorage.getItem(listKey) || '[]';
      const ids: string[] = JSON.parse(logsJson);

      const list: SystemLog[] = [];
      for (const id of ids) {
        const itemKey = this.getKey(`log_${id}`);
        const data = localStorage.getItem(itemKey);
        if (data) {
          list.push(JSON.parse(data) as SystemLog);
        }
      }
      
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return list.slice(0, limit || 100);
    } catch (e) {
      console.error("Failed to list logs from localStorage", e);
      return [];
    }
  }
}

export { TauriSqliteAdapter } from './tauri-sqlite-adapter';
