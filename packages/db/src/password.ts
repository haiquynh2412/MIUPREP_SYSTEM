// Password hashing for local (offline-first) accounts.
// Format: pbkdf2-sha256$<iterations>$<saltBase64>$<hashBase64>
// verifyPassword also accepts legacy records (SHA-256 hex, plaintext) so existing
// installs keep working; callers must re-hash when `needsRehash` is true.

const PBKDF2_ITERATIONS = 310_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;
const FORMAT_PREFIX = 'pbkdf2-sha256';

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function getCrypto(): Crypto {
  const c = globalThis.crypto;
  if (!c || !c.subtle) {
    throw new Error(
      'Web Crypto (crypto.subtle) is unavailable. Passwords require a secure context (HTTPS/localhost/Tauri).'
    );
  }
  return c;
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const c = getCrypto();
  const keyMaterial = await c.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await c.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
    keyMaterial,
    HASH_BYTES * 8
  );
  return new Uint8Array(bits);
}

async function sha256Hex(value: string): Promise<string> {
  const c = getCrypto();
  const digest = await c.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = getCrypto().getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveKey(password, salt, PBKDF2_ITERATIONS);
  return `${FORMAT_PREFIX}$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export interface PasswordVerifyResult {
  ok: boolean;
  /** true when the stored record uses a legacy/weaker format and should be re-hashed after a successful login */
  needsRehash: boolean;
}

export async function verifyPassword(password: string, stored: string | undefined | null): Promise<PasswordVerifyResult> {
  if (!password || !stored) return { ok: false, needsRehash: false };

  if (stored.startsWith(`${FORMAT_PREFIX}$`)) {
    const parts = stored.split('$');
    if (parts.length !== 4) return { ok: false, needsRehash: false };
    const iterations = parseInt(parts[1], 10);
    if (!Number.isFinite(iterations) || iterations <= 0) return { ok: false, needsRehash: false };
    let salt: Uint8Array;
    let expected: Uint8Array;
    try {
      salt = fromBase64(parts[2]);
      expected = fromBase64(parts[3]);
    } catch {
      return { ok: false, needsRehash: false };
    }
    const derived = await deriveKey(password, salt, iterations);
    const ok = timingSafeEqual(derived, expected);
    return { ok, needsRehash: ok && iterations < PBKDF2_ITERATIONS };
  }

  // Legacy: unsalted SHA-256 hex digest
  if (/^[0-9a-f]{64}$/i.test(stored)) {
    const ok = (await sha256Hex(password)) === stored.toLowerCase();
    return { ok, needsRehash: ok };
  }

  // Legacy: plaintext record from early installs
  const ok = stored === password;
  return { ok, needsRehash: ok };
}
