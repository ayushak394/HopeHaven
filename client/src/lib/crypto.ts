// ===============================
// 🔐 BASE64 HELPERS
// ===============================
function b64encode(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

function b64decode(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

// ===============================
// 🔑 STABLE KEY (UID-BASED)
// ===============================
export async function getUserKey(uid: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const data = encoder.encode(uid);

  // 🔥 Hash UID → 256-bit key
  const hash = await crypto.subtle.digest("SHA-256", data);

  return crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

// ===============================
// 🔐 TEXT ENCRYPTION
// ===============================
export async function encryptText(plain: string, key: CryptoKey) {
  const enc = new TextEncoder().encode(plain);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ctBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc
  );

  return {
    cipherTextB64: b64encode(ctBuf),
    ivB64: b64encode(iv.buffer),
  };
}

export async function decryptText(
  cipherTextB64: string,
  ivB64: string,
  key: CryptoKey
): Promise<string> {
  const ct = b64decode(cipherTextB64);
  const iv = new Uint8Array(b64decode(ivB64));

  const ptBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ct
  );

  return new TextDecoder().decode(ptBuf);
}

// ===============================
// 🔐 JSON ENCRYPTION
// ===============================
export async function encryptJSON<T>(
  data: T,
  key: CryptoKey
): Promise<{ cipherTextB64: string; ivB64: string }> {
  return encryptText(JSON.stringify(data), key);
}

export async function decryptJSON<T>(
  cipherTextB64: string,
  ivB64: string,
  key: CryptoKey
): Promise<T> {
  const decryptedText = await decryptText(cipherTextB64, ivB64, key);

  try {
    return JSON.parse(decryptedText) as T;
  } catch {
    return {
      text: decryptedText,
      images: [],
    } as unknown as T;
  }
}

// ===============================
// 🖼 IMAGE → BASE64
// ===============================
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}