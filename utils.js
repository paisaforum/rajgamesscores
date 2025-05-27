// shared/utils.js

/**
 * Client-side score hashing utility.
 * This is used for validation with the server, but does NOT include any real secret.
 * The server will re-hash the payload with its true secret to detect tampering.
 */
export async function generateHash(name, score) {
    // For client-side consistency only (NOT secret)
    const pseudoSalt = 'user-safe-key';
  
    const encoder = new TextEncoder();
    const data = encoder.encode(name + score + pseudoSalt);
  
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  