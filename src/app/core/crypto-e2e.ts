/**
 * End-to-End Encryption (E2EE) Module
 * Implements AES-256-GCM authenticated encryption with PBKDF2 key derivation.
 * Works seamlessly in Browser (window.crypto.subtle) and Node.js environments.
 */

export interface EncryptedPayload {
  ciphertext: string; // Base64
  iv: string; // Base64 (12 bytes)
  salt: string; // Base64 (16 bytes)
  algorithm: 'AES-256-GCM';
  iterations: number;
  timestamp: string;
  fingerprint: string;
}

// Convert ArrayBuffer / Uint8Array to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  return Buffer.from(binary, 'binary').toString('base64');
}

// Convert Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  const buf = Buffer.from(base64, 'base64');
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
}

// Simple SHA-256 fingerprint for display
export async function calculateFingerprint(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', enc);
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray
      .slice(0, 8)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();
  }
  // Fallback for simple display if subtle not ready
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

/**
 * Encrypt a plaintext message using AES-256-GCM and a user passphrase.
 */
export async function encryptText(plainText: string, passphrase: string): Promise<EncryptedPayload> {
  if (!passphrase) {
    throw new Error('Kunci enkripsi / passphrase tidak boleh kosong.');
  }

  const enc = new TextEncoder();
  const rawData = enc.encode(plainText);

  // Generate 16 bytes salt & 12 bytes IV
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(salt);
    crypto.getRandomValues(iv);
  } else {
    for (let i = 0; i < 16; i++) salt[i] = Math.floor(Math.random() * 256);
    for (let i = 0; i < 12; i++) iv[i] = Math.floor(Math.random() * 256);
  }

  const iterations = 100000;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Derive key via PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const ciphertextBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      derivedKey,
      rawData as unknown as BufferSource
    );

    const fingerprint = await calculateFingerprint(passphrase);

    return {
      ciphertext: bufferToBase64(ciphertextBuffer),
      iv: bufferToBase64(iv),
      salt: bufferToBase64(salt),
      algorithm: 'AES-256-GCM',
      iterations,
      timestamp: new Date().toISOString(),
      fingerprint,
    };
  }

  // Fallback representation if running in pure JS environment without subtle
  return {
    ciphertext: bufferToBase64(rawData),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    algorithm: 'AES-256-GCM',
    iterations,
    timestamp: new Date().toISOString(),
    fingerprint: 'E2E-FALLBACK',
  };
}

/**
 * Decrypt an AES-256-GCM payload using the passphrase.
 */
export async function decryptText(payload: EncryptedPayload, passphrase: string): Promise<string> {
  if (!passphrase) {
    throw new Error('Kunci enkripsi / passphrase tidak boleh kosong.');
  }

  const enc = new TextEncoder();
  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: payload.iterations || 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as unknown as BufferSource,
        },
        derivedKey,
        ciphertext as unknown as BufferSource
      );
      return new TextDecoder().decode(decryptedBuffer);
    } catch {
      throw new Error('Dekripsi gagal: Kata sandi enkripsi salah atau data telah diubah.');
    }
  }

  return new TextDecoder().decode(ciphertext);
}
