import type { StorageAdapter, ExamAttempt, WritingFeedback, LearnerProfile, ErrorNotebookEntry, LocalUser } from './index';
import type { IeltsTest } from '@miuprep/content';
import { validateIeltsTest } from '@miuprep/content';
import { normalizeLearningEvents, type LearningEventRecord } from '@miuprep/learning';

/**
 * World-class zero-dependency Tauri SQLite database adapter.
 * Uses window.__TAURI__ dynamic dispatching to connect standard React CRUD operations to Rust SQLite APIs.
 */
export class TauriSqliteAdapter implements StorageAdapter {
  private getTauriInvoke() {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return (window as any).__TAURI__.invoke;
    }
    return null;
  }

  async initialize(): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) {
      console.warn('[SQLite Adapter] Running in non-desktop sandbox. SQLite commands are disabled.');
      return;
    }
    console.log('[SQLite Adapter] Native database connection initialized successfully.');
  }

  async saveAttempt(attempt: ExamAttempt): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;

    try {
      await invoke('save_attempt', { attempt });
    } catch (e) {
      console.error('[SQLite Adapter] Save attempt failed:', e);
      try {
        await this.logSystemEvent({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          level: 'ERROR',
          module: 'SQLITE',
          message: `saveAttempt failed: ${e instanceof Error ? e.message : String(e)}`,
          payload: JSON.stringify({ attemptId: attempt.local_id, userId: attempt.userId })
        });
      } catch (logErr) {
        console.error('Failed to log event in DB:', logErr);
      }
      throw e;
    }
  }

  async getAttempt(localId: string): Promise<ExamAttempt | null> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return null;

    try {
      const r = await invoke('get_attempt', { localId }) as any;
      if (!r) return null;

      return {
        local_id: r.local_id,
        remote_id: r.remote_id || undefined,
        testId: r.test_id,
        userId: r.user_id,
        status: r.status as 'in_progress' | 'submitted',
        startedAt: r.started_at,
        lastSavedAt: r.last_saved_at,
        submittedAt: r.submitted_at || undefined,
        durationSeconds: Number(r.duration_seconds),
        remainingSeconds: Number(r.remaining_seconds),
        answers: JSON.parse(r.answers_json || '{}'),
        pauseRanges: JSON.parse(r.pause_ranges_json || '[]'),
        scores: r.status === 'submitted' ? {
          rawScore: Number(r.raw_score),
          bandScore: Number(r.band_score),
          totalQuestions: Number(r.total_questions),
          isMockScoring: r.is_mock_scoring === 1
        } : undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        sync_status: r.sync_status as 'synced' | 'pending' | 'failed',
        version: Number(r.version)
      };
    } catch (e) {
      console.error('[SQLite Adapter] Get attempt failed:', e);
      return null;
    }
  }

  async listAttempts(userId: string): Promise<ExamAttempt[]> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return [];

    try {
      const rows = await invoke('list_attempts', { userId }) as any[];
      return rows.map(r => ({
        local_id: r.local_id,
        remote_id: r.remote_id || undefined,
        testId: r.test_id,
        userId: r.user_id,
        status: r.status as 'in_progress' | 'submitted',
        startedAt: r.started_at,
        lastSavedAt: r.last_saved_at,
        submittedAt: r.submitted_at || undefined,
        durationSeconds: Number(r.duration_seconds),
        remainingSeconds: Number(r.remaining_seconds),
        answers: JSON.parse(r.answers_json || '{}'),
        pauseRanges: JSON.parse(r.pause_ranges_json || '[]'),
        scores: r.status === 'submitted' ? {
          rawScore: Number(r.raw_score),
          bandScore: Number(r.band_score),
          totalQuestions: Number(r.total_questions),
          isMockScoring: r.is_mock_scoring === 1
        } : undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        sync_status: r.sync_status as 'synced' | 'pending' | 'failed',
        version: Number(r.version)
      }));
    } catch (e) {
      console.error('[SQLite Adapter] List attempts failed:', e);
      return [];
    }
  }

  async getTest(testId: string): Promise<IeltsTest | null> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return null;

    try {
      const test = await invoke('get_test', { id: testId }) as IeltsTest;
      return test || null;
    } catch (e) {
      console.error('[SQLite Adapter] Get test failed:', e);
      return null;
    }
  }

  async saveTest(test: IeltsTest): Promise<void> {
    const errors = validateIeltsTest(test);
    const critical = errors.filter(err => err.severity === 'error');
    if (critical.length > 0) {
      throw new Error(`Invalid test package: ${critical.map(c => c.message).join(', ')}`);
    }

    const invoke = this.getTauriInvoke();
    if (!invoke) return;

    try {
      await invoke('save_test', { test });
    } catch (e) {
      console.error('[SQLite Adapter] Save test failed:', e);
      try {
        await this.logSystemEvent({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          level: 'ERROR',
          module: 'SQLITE',
          message: `saveTest failed: ${e instanceof Error ? e.message : String(e)}`,
          payload: JSON.stringify({ testId: test.id, title: test.title })
        });
      } catch (logErr) {
        console.error('Failed to log event in DB:', logErr);
      }
      throw e;
    }
  }

  async listTests(): Promise<IeltsTest[]> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return [];

    try {
      const tests = await invoke('list_tests') as IeltsTest[];
      return tests || [];
    } catch (e) {
      console.error('[SQLite Adapter] List tests failed:', e);
      return [];
    }
  }

  async saveWritingFeedback(feedback: WritingFeedback): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;

    try {
      await invoke('save_writing_feedback', { feedback });
    } catch (e) {
      console.error('[SQLite Adapter] Save writing feedback failed:', e);
      try {
        await this.logSystemEvent({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          level: 'ERROR',
          module: 'SQLITE',
          message: `saveWritingFeedback failed: ${e instanceof Error ? e.message : String(e)}`,
          payload: JSON.stringify({ attemptId: feedback.attemptId, taskNumber: feedback.taskNumber })
        });
      } catch (logErr) {
        console.error('Failed to log event in DB:', logErr);
      }
      throw e;
    }
  }

  async getWritingFeedback(attemptId: string, taskNumber: 1 | 2): Promise<WritingFeedback | null> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return null;

    try {
      const feedback = await invoke('get_writing_feedback', { attemptId, taskNumber }) as WritingFeedback;
      return feedback || null;
    } catch (e) {
      console.error('[SQLite Adapter] Get writing feedback failed:', e);
      return null;
    }
  }

  async exportLocalData(userId?: string): Promise<string> {
    const targetUserId = userId || (typeof window !== 'undefined' ? localStorage.getItem('current_user_id') : null) || '';
    const attempts = await this.listAttempts(targetUserId);
    const tests = await this.listTests();
    const payload = {
      attempts,
      tests,
      export_version: 'sqlite-1.0.0',
      exported_at: new Date().toISOString()
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }

  async importLocalData(encryptedJson: string): Promise<void> {
    try {
      const raw = decodeURIComponent(escape(atob(encryptedJson)));
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.tests)) {
        for (const test of parsed.tests) {
          await this.saveTest(test);
        }
      }
      if (Array.isArray(parsed.attempts)) {
        for (const att of parsed.attempts) {
          await this.saveAttempt(att);
        }
      }
    } catch (e) {
      console.error('[SQLite Adapter] Import failed:', e);
      throw new Error('Data import failed. File may be corrupted.');
    }
  }

  async saveLearningEvent(event: LearningEventRecord): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;
    const normalized = normalizeLearningEvents([event])[0];
    if (!normalized) return;

    try {
      await invoke('save_learning_event', { event: normalized });
    } catch (e) {
      console.warn('[SQLite Adapter] save_learning_event is unavailable; learning event was not persisted.', e);
    }
  }

  async listLearningEvents(userId?: string, limit?: number): Promise<LearningEventRecord[]> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return [];

    try {
      const rows = await invoke('list_learning_events', { userId: userId || null, limit: limit || null }) as unknown[];
      const normalized = normalizeLearningEvents(Array.isArray(rows) ? rows : [])
        .filter((event) => !userId || event.learnerId === userId)
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
      return typeof limit === 'number' ? normalized.slice(0, Math.max(0, limit)) : normalized;
    } catch (e) {
      console.warn('[SQLite Adapter] list_learning_events is unavailable; returning empty event list.', e);
      return [];
    }
  }

  async saveLearnerProfile(profile: LearnerProfile): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;
    try {
      await invoke('save_learner_profile', { profile });
    } catch (e) {
      console.error('[SQLite Adapter] Save profile failed:', e);
      try {
        await this.logSystemEvent({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          level: 'ERROR',
          module: 'SQLITE',
          message: `saveLearnerProfile failed: ${e instanceof Error ? e.message : String(e)}`,
          payload: JSON.stringify({ userId: profile.userId, targetBand: profile.targetBand })
        });
      } catch (logErr) {
        console.error('Failed to log event in DB:', logErr);
      }
      throw e;
    }
  }

  async getLearnerProfile(userId: string): Promise<LearnerProfile | null> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return null;
    try {
      const p = await invoke('get_learner_profile', { userId }) as LearnerProfile;
      return p || null;
    } catch (e) {
      console.error('[SQLite Adapter] Get profile failed:', e);
      return null;
    }
  }

  async addErrorEntry(entry: ErrorNotebookEntry): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;
    try {
      await invoke('add_error_entry', { entry });
    } catch (e) {
      console.error('[SQLite Adapter] Add error entry failed:', e);
      try {
        await this.logSystemEvent({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          level: 'ERROR',
          module: 'SQLITE',
          message: `addErrorEntry failed: ${e instanceof Error ? e.message : String(e)}`,
          payload: JSON.stringify({ userId: entry.userId, attemptId: entry.attemptId, questionId: entry.questionId })
        });
      } catch (logErr) {
        console.error('Failed to log event in DB:', logErr);
      }
      throw e;
    }
  }

  async listErrorEntries(userId: string): Promise<ErrorNotebookEntry[]> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return [];
    try {
      const entries = await invoke('list_error_entries', { userId }) as ErrorNotebookEntry[];
      return entries || [];
    } catch (e) {
      console.error('[SQLite Adapter] List error entries failed:', e);
      return [];
    }
  }

  async updateErrorEntrySrs(id: string, grade: number): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;
    try {
      await invoke('update_error_entry_srs', { id, grade });
    } catch (e) {
      console.error('[SQLite Adapter] Update SRS failed:', e);
      try {
        await this.logSystemEvent({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          level: 'ERROR',
          module: 'SQLITE',
          message: `updateErrorEntrySrs failed: ${e instanceof Error ? e.message : String(e)}`,
          payload: JSON.stringify({ id, grade })
        });
      } catch (logErr) {
        console.error('Failed to log event in DB:', logErr);
      }
      throw e;
    }
  }

  async registerLocalUser(user: LocalUser): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;

    try {
      await invoke('register_local_user', {
        id: user.id,
        username: user.username,
        passwordHash: user.passwordHash,
        targetBand: user.targetBand,
        examDate: user.examDate,
        role: user.role || 'student',
        createdAt: user.createdAt
      });

      // Save additional metadata in localStorage safely
      if (typeof window !== 'undefined') {
        const meta = {
          displayName: user.displayName || user.username,
          contactInfo: user.contactInfo || '',
          status: user.status || (user.role === 'admin' ? 'approved' : 'pending'),
          assignedTrack: user.assignedTrack || 'ielts',
          assignedTracks: user.assignedTracks || [user.assignedTrack || 'ielts']
        };
        localStorage.setItem(`user_meta_${user.id}`, JSON.stringify(meta));
      }
    } catch (e) {
      console.error('[SQLite Adapter] Register local user failed:', e);
      try {
        await this.logSystemEvent({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          level: 'ERROR',
          module: 'SQLITE',
          message: `registerLocalUser failed: ${e instanceof Error ? e.message : String(e)}`,
          payload: JSON.stringify({ username: user.username, targetBand: user.targetBand })
        });
      } catch (logErr) {
        console.error('Failed to log event in DB:', logErr);
      }
      throw e;
    }
  }

  async getLocalUser(username: string): Promise<LocalUser | null> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return null;

    try {
      const r = await invoke('get_local_user', { username }) as any;
      if (!r) return null;

      const user: LocalUser = {
        id: r.id,
        username: r.username,
        passwordHash: r.password_hash,
        targetBand: Number(r.targetBand),
        examDate: r.examDate,
        role: r.role as 'admin' | 'student' || 'student',
        createdAt: r.createdAt
      };

      // Merge local metadata
      if (typeof window !== 'undefined') {
        const metaStr = localStorage.getItem(`user_meta_${r.id}`);
        if (metaStr) {
          const meta = JSON.parse(metaStr);
          user.displayName = meta.displayName;
          user.contactInfo = meta.contactInfo;
          user.status = meta.status;
          user.assignedTrack = meta.assignedTrack || 'ielts';
          user.assignedTracks = meta.assignedTracks || [meta.assignedTrack || 'ielts'];
        } else {
          // Defaults if no metadata exists
          user.displayName = r.username;
          user.contactInfo = '';
          user.status = r.role === 'admin' ? 'approved' : 'pending';
          user.assignedTrack = 'ielts';
          user.assignedTracks = ['ielts'];
        }
      }

      return user;
    } catch (e) {
      console.error('[SQLite Adapter] Get local user failed:', e);
      return null;
    }
  }

  async listLocalUsers(): Promise<Omit<LocalUser, 'passwordHash'>[]> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return [];

    try {
      const rows = await invoke('list_local_users') as any[];
      return rows.map(r => {
        const user: Omit<LocalUser, 'passwordHash'> = {
          id: r.id,
          username: r.username,
          targetBand: Number(r.targetBand),
          examDate: r.examDate,
          role: r.role as 'admin' | 'student' || 'student',
          createdAt: r.createdAt
        };

        // Merge local metadata
        if (typeof window !== 'undefined') {
          const metaStr = localStorage.getItem(`user_meta_${r.id}`);
          if (metaStr) {
            const meta = JSON.parse(metaStr);
            user.displayName = meta.displayName;
            user.contactInfo = meta.contactInfo;
            user.status = meta.status;
            user.assignedTrack = meta.assignedTrack || 'ielts';
            user.assignedTracks = meta.assignedTracks || [meta.assignedTrack || 'ielts'];
          } else {
            // Defaults
            user.displayName = r.username;
            user.contactInfo = '';
            user.status = r.role === 'admin' ? 'approved' : 'pending';
            user.assignedTrack = 'ielts';
            user.assignedTracks = ['ielts'];
          }
        }

        return user;
      });
    } catch (e) {
      console.error('[SQLite Adapter] List local users failed:', e);
      return [];
    }
  }

  async deleteLocalUser(username: string): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) {
      // In web fallback, we can also delete from localStorage
      try {
        const listKey = 'ielts_app_users_list';
        const usersJson = localStorage.getItem(listKey) || '[]';
        let usersList: string[] = JSON.parse(usersJson);
        usersList = usersList.filter(u => u !== username);
        localStorage.setItem(listKey, JSON.stringify(usersList));
        localStorage.removeItem(`ielts_app_user_${username}`);
      } catch (e) {
        console.error('Failed web fallback deleteLocalUser in SQLite adapter:', e);
      }
      return;
    }

    try {
      await invoke('delete_local_user', { username });
    } catch (e) {
      console.warn('[SQLite Adapter] Rust command delete_local_user failed or not found, performing local fallback:', e);
      try {
        const listKey = 'ielts_app_users_list';
        const usersJson = localStorage.getItem(listKey) || '[]';
        let usersList: string[] = JSON.parse(usersJson);
        usersList = usersList.filter(u => u !== username);
        localStorage.setItem(listKey, JSON.stringify(usersList));
        localStorage.removeItem(`ielts_app_user_${username}`);
      } catch (err) {
        console.error('Failed fallback deleteLocalUser in SQLite adapter:', err);
      }
    }
  }

  async logSystemEvent(log: any): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;

    try {
      await invoke('log_system_event', {
        id: log.id,
        level: log.level,
        module: log.module,
        message: log.message,
        payload: log.payload || null
      });
    } catch (e) {
      console.error('[SQLite Adapter] log_system_event failed:', e);
    }
  }

  async listSystemLogs(limit?: number): Promise<any[]> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return [];

    try {
      const rows = await invoke('list_system_logs', { limit: limit || 100 }) as any[];
      return rows.map(r => ({
        id: r.id,
        level: r.level,
        module: r.module,
        message: r.message,
        payload: r.payload,
        createdAt: r.createdAt
      }));
    } catch (e) {
      console.error('[SQLite Adapter] list_system_logs failed:', e);
      return [];
    }
  }
}
