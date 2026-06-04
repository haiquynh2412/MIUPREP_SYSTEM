import type { CredentialStore } from './credential-store';

/**
 * World-class zero-dependency Tauri keychain secure storage connector.
 * Uses window.__TAURI__ dynamic dispatching to prevent bundler compilation errors on non-desktop builds.
 */
export class TauriKeychainStore implements CredentialStore {
  private getTauriInvoke() {
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      return (window as any).__TAURI__.invoke;
    }
    return null;
  }

  async get(key: string): Promise<string | null> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return null;
    try {
      return await invoke('keychain_get', { key });
    } catch (e) {
      console.error('[AI Secure Keychain] Get credential failed:', e);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;
    try {
      await invoke('keychain_set', { key, value });
    } catch (e) {
      console.error('[AI Secure Keychain] Set credential failed:', e);
      throw e;
    }
  }

  async delete(key: string): Promise<void> {
    const invoke = this.getTauriInvoke();
    if (!invoke) return;
    try {
      await invoke('keychain_delete', { key });
    } catch (e) {
      console.error('[AI Secure Keychain] Delete credential failed:', e);
      throw e;
    }
  }
}
