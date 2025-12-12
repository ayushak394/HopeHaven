const KEY_STORAGE_PREFIX = "hopehaven_aes_key_";

function b64encode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b64decode(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

export async function getOrCreateUserKey(uid: string): Promise<CryptoKey> {
  const keyName = KEY_STORAGE_PREFIX + uid;
  const existing = localStorage.getItem(keyName);
  if (existing) {
    const raw = b64decode(existing);
    return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  }
  // Create new 256-bit key
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const raw = await crypto.subtle.exportKey("raw", key);
  localStorage.setItem(keyName, b64encode(raw));
  return key;
}

export async function encryptText(plain: string, key: CryptoKey) {
  const enc = new TextEncoder().encode(plain);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const ctBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc);
  return {
    cipherTextB64: b64encode(ctBuf),
    ivB64: b64encode(iv.buffer),
  };
}

export async function decryptText(cipherTextB64: string, ivB64: string, key: CryptoKey): Promise<string> {
  const ct = b64decode(cipherTextB64);
  const iv = new Uint8Array(b64decode(ivB64));
  const ptBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(ptBuf);
}
