export const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function encodeNum(n: number, width: number): string {
  if (!Number.isInteger(n) || n < 0) throw new Error("tall");
  let s = "";
  let x = n;
  for (let i = 0; i < width; i++) {
    s = ALPH[x % 32] + s;
    x = Math.floor(x / 32);
  }
  if (x > 0) throw new Error("for stort");
  return s;
}

export function decodeNum(s: string): number | null {
  if (!s) return null;
  let n = 0;
  for (const c of s) {
    const i = ALPH.indexOf(c);
    if (i < 0) return null;
    n = n * 32 + i;
  }
  return n;
}

export function checksum(body: string): string {
  let h = 2166136261;
  for (let i = 0; i < body.length; i++) {
    h ^= body.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return encodeNum((h >>> 0) % 1024, 2);
}

export function randomId(length: number): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return [...bytes].map((b) => ALPH[b % 32]).join("");
}
