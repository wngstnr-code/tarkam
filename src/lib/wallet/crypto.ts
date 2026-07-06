// Enkripsi seed phrase dengan password user: PBKDF2 → AES-GCM (Web Crypto).
// Blob tersimpan di IndexedDB; seed plaintext tidak pernah dipersist.

const PBKDF2_ITERATIONS = 310_000;

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes));
}

function fromB64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Enkripsi seed → blob base64 "salt.iv.ciphertext". */
export async function encryptSeed(seed: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(seed)
  );
  return `${toB64(salt)}.${toB64(iv)}.${toB64(ciphertext)}`;
}

/** Dekripsi blob → seed. Melempar error bila password salah. */
export async function decryptSeed(blob: string, password: string): Promise<string> {
  const [saltB64, ivB64, dataB64] = blob.split(".");
  if (!saltB64 || !ivB64 || !dataB64) throw new Error("Blob seed tidak valid");
  const key = await deriveKey(password, fromB64(saltB64));
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64(ivB64) as BufferSource },
      key,
      fromB64(dataB64) as BufferSource
    );
    return new TextDecoder().decode(plain);
  } catch {
    throw new Error("Password salah");
  }
}
