// Web Crypto API Secure Password Hashing & Session Utilities
// Works identically across Cloudflare Workers and Node.js (globalThis.crypto)

const ITERATIONS = 100000;
const KEY_LENGTH = 32; // 256 bits

/**
 * Generate a cryptographically secure random hex string
 */
export function generateRandomToken(bytesLength = 32): string {
  const bytes = new Uint8Array(bytesLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a password using PBKDF2 with SHA-256 and a random salt
 * Format: pbkdf2$iterations$saltHex$derivedKeyHex
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    KEY_LENGTH * 8
  );

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `pbkdf2$${ITERATIONS}$${saltHex}$${hashHex}`;
}

/**
 * Verify a plain text password against a stored PBKDF2 hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      return false;
    }

    const iterations = parseInt(parts[1], 10);
    const saltHex = parts[2];
    const originalHashHex = parts[3];

    // Decode salt from hex
    const salt = new Uint8Array(
      saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const enc = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256',
      },
      passwordKey,
      KEY_LENGTH * 8
    );

    const derivedHashHex = Array.from(new Uint8Array(derivedBits))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison
    if (derivedHashHex.length !== originalHashHex.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < derivedHashHex.length; i++) {
      result |= derivedHashHex.charCodeAt(i) ^ originalHashHex.charCodeAt(i);
    }
    return result === 0;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}
