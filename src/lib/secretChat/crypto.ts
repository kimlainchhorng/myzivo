/**
 * E2E encryption primitives for ZIVO Secret Chats.
 *
 *  - Identity keypair: ECDH P-256, kept in IndexedDB (non-extractable private key).
 *  - Per-conversation message key: HKDF-SHA-256 over the ECDH shared secret,
 *    salted with the chat-id, output an AES-GCM 256 key.
 *  - Each message uses a fresh 12-byte random IV.
 *  - Safety number (SAS): SHA-256 of sorted public-key JWK pair → 60-digit code.
 */

const DB_NAME = "zivo-e2e";
const STORE = "keys";
const SELF_KEY = "self";

interface StoredKeypair {
  publicKeyJwk: JsonWebKey;
  privateKey: CryptoKey; // non-extractable
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T = unknown>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOrCreateIdentity(): Promise<StoredKeypair> {
  const existing = await idbGet<StoredKeypair>(SELF_KEY);
  if (existing) return existing;

  const pair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    false, // non-extractable private key
    ["deriveKey", "deriveBits"],
  );
  const publicKeyJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const stored: StoredKeypair = { publicKeyJwk, privateKey: pair.privateKey };
  await idbSet(SELF_KEY, stored);
  return stored;
}

export async function resetIdentity(): Promise<void> {
  await idbDelete(SELF_KEY);
}

async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    [],
  );
}

async function deriveMessageKey(
  privateKey: CryptoKey,
  theirPublicJwk: JsonWebKey,
  chatId: string,
): Promise<CryptoKey> {
  const theirPub = await importPublicKey(theirPublicJwk);
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: theirPub },
    privateKey,
    256,
  );
  const ikm = await crypto.subtle.importKey("raw", sharedBits, "HKDF", false, ["deriveKey"]);
  const saltBytes = new TextEncoder().encode(`zivo-secret-chat:${chatId}`);
  const salt = saltBytes.buffer.slice(saltBytes.byteOffset, saltBytes.byteOffset + saltBytes.byteLength) as ArrayBuffer;
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt, info: new ArrayBuffer(0) },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function bytesToB64(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}
function b64ToBytes(b64: string): Uint8Array {
  const s = atob(b64);
  const u8 = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i);
  return u8;
}

export interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  senderPublicKeyJwk: JsonWebKey;
}

export async function encryptMessage(params: {
  plaintext: string;
  chatId: string;
  recipientPublicKeyJwk: JsonWebKey;
}): Promise<EncryptedPayload> {
  const self = await getOrCreateIdentity();
  const key = await deriveMessageKey(self.privateKey, params.recipientPublicKeyJwk, params.chatId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(params.plaintext);
  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return {
    iv: bytesToB64(iv),
    ciphertext: bytesToB64(cipherBuf),
    senderPublicKeyJwk: self.publicKeyJwk,
  };
}

export async function decryptMessage(params: {
  payload: { iv: string; ciphertext: string; senderPublicKeyJwk: JsonWebKey };
  chatId: string;
}): Promise<string> {
  const self = await getOrCreateIdentity();
  const key = await deriveMessageKey(self.privateKey, params.payload.senderPublicKeyJwk, params.chatId);
  const iv = b64ToBytes(params.payload.iv);
  const ct = b64ToBytes(params.payload.ciphertext);
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(plainBuf);
}

/** 60-digit Safety Number for SAS verification. */
export async function computeSafetyNumber(params: {
  jwkA: JsonWebKey;
  jwkB: JsonWebKey;
}): Promise<string> {
  const enc = (j: JsonWebKey) => JSON.stringify({ x: j.x, y: j.y, crv: j.crv });
  const concat = enc(params.jwkA) + "|" + enc(params.jwkB);
  const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(concat));
  const u8 = new Uint8Array(hashBuf);
  const groups: string[] = [];
  for (let i = 0; i < 12; i++) {
    const slice = u8.slice(i * 2, i * 2 + 4);
    const n =
      (slice[0] ?? 0) * 0x1000000 +
      (slice[1] ?? 0) * 0x10000 +
      (slice[2] ?? 0) * 0x100 +
      (slice[3] ?? 0);
    groups.push(String(n % 100000).padStart(5, "0"));
  }
  return groups.join(" ");
}
