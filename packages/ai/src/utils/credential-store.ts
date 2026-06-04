/**
 * Unified CredentialStore interface and secure implementations.
 * Safeguards API keys against simple filesystem scanners on the client side.
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

export class ObfuscatedLocalStorageStore implements CredentialStore {
  private prefix = 'ielts_app_secure_';
  private salt = 'ielts-prep-obfuscator-entropy-salt-v1';

  // Obfuscate using a custom XOR cipher combined with safe Base64 encoding
  private obfuscate(text: string): string {
    if (!text) return '';
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ this.salt.charCodeAt(i % this.salt.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(unescape(encodeURIComponent(result)));
  }

  private deobfuscate(encoded: string): string {
    if (!encoded) return '';
    try {
      const decoded = decodeURIComponent(escape(atob(encoded)));
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ this.salt.charCodeAt(i % this.salt.length);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch (e) {
      console.error('[AI Secure Store] Deobfuscation error:', e);
      return '';
    }
  }

  async get(key: string): Promise<string | null> {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const val = localStorage.getItem(`${this.prefix}${key}`);
    if (!val) return null;
    const deobf = this.deobfuscate(val);
    return deobf || null;
  }

  async set(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (!value) {
      await this.delete(key);
      return;
    }
    const obfuscated = this.obfuscate(value);
    localStorage.setItem(`${this.prefix}${key}`, obfuscated);
  }

  async delete(key: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.removeItem(`${this.prefix}${key}`);
  }
}
