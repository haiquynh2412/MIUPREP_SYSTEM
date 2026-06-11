/**
 * Unified CredentialStore interface and implementations.
 *
 * Security model:
 * - Desktop (Tauri): use TauriKeychainStore (OS keychain) — see tauri-keychain-store.ts.
 * - Web: SessionCredentialStore keeps keys in memory only. Browsers cannot store
 *   API keys safely (localStorage is readable by any script/extension), so keys
 *   must be re-entered per session. The previous XOR-"obfuscated" localStorage
 *   store was reversible and has been removed; any value it persisted is migrated
 *   into memory once and purged from localStorage.
 */
export interface CredentialStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export class InMemoryCredentialStore implements CredentialStore {
  private memory = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.memory.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.memory.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.memory.delete(key);
  }
}

// Constants of the removed XOR store, kept only to migrate and purge old entries.
const LEGACY_PREFIX = 'ielts_app_secure_';
const LEGACY_SALT = 'ielts-prep-obfuscator-entropy-salt-v1';

function decodeLegacyValue(encoded: string): string {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ LEGACY_SALT.charCodeAt(i % LEGACY_SALT.length));
    }
    return result;
  } catch {
    return '';
  }
}

export class SessionCredentialStore implements CredentialStore {
  private memory = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    const inMemory = this.memory.get(key);
    if (inMemory) return inMemory;

    // One-time migration: adopt a key persisted by the removed XOR store,
    // then purge it from localStorage so nothing reversible stays on disk.
    if (typeof window !== 'undefined' && window.localStorage) {
      const legacyKey = `${LEGACY_PREFIX}${key}`;
      const legacyValue = localStorage.getItem(legacyKey);
      if (legacyValue) {
        localStorage.removeItem(legacyKey);
        const decoded = decodeLegacyValue(legacyValue);
        if (decoded) {
          this.memory.set(key, decoded);
          return decoded;
        }
      }
    }
    return null;
  }

  async set(key: string, value: string): Promise<void> {
    if (!value) {
      await this.delete(key);
      return;
    }
    this.memory.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.memory.delete(key);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`${LEGACY_PREFIX}${key}`);
    }
  }
}
