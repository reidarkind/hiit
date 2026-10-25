import type { Block } from "../types";
import { CODE_PREFIX, EPOCH } from "./constants";
import { dateFromDays, daysFromEpoch } from "./dates";
import { checksum, decodeNum, encodeNum } from "./id";

export type SessionToken =
  | { type: "builtin"; id: string }
  | { type: "custom"; blocks: Block[] };

export type Decoded =
  | { ok: false; error: string }
  | { ok: true; kind: "D"; fromId: string; session: SessionToken }
  | { ok: true; kind: "U"; fromId: string; session: SessionToken }
  | { ok: true; kind: "G"; fromId: string; date: string; session: SessionToken }
  | { ok: true; kind: "S"; fromId: string; toId: string; date: string; session: SessionToken };

const KINDS = new Set(["D", "U", "G", "S"]);

export function encodeBlocks(blocks: Block[], codeFor: (id: string) => string): string {
  let out = "X";
  for (const block of blocks) {
    const rounds = Math.max(1, block.rounds ?? 1);
    const code = codeFor(block.exerciseId);
    if (!/^[A-Z]{2}$/.test(code)) throw new Error("kode");
    const work = encodeNum(clampUnit(block.workSeconds), 2);
    const rest = encodeNum(clampUnit(block.restSeconds), 2);
    for (let i = 0; i < rounds; i++) out += `${code}${work}${rest}`;
  }
  return out;
}

export function decodeBlocks(token: string, idFor: (code: string) => string | null): Block[] | null {
  if (!token.startsWith("X")) return null;
  const body = token.slice(1);
  if (body.length === 0 || body.length % 6 !== 0) return null;
  const blocks: Block[] = [];
  for (let i = 0; i < body.length; i += 6) {
    const code = body.slice(i, i + 2);
    const work = decodeNum(body.slice(i + 2, i + 4));
    const rest = decodeNum(body.slice(i + 4, i + 6));
    const exerciseId = idFor(code);
    if (!exerciseId || work === null || rest === null) return null;
    blocks.push({ exerciseId, workSeconds: work * 5, restSeconds: rest * 5 });
  }
  return blocks;
}

function clampUnit(seconds: number): number {
  return Math.max(0, Math.min(1023, Math.round(seconds / 5)));
}

export function encodeShare(
  input: { kind: "D" | "U" | "G" | "S"; fromId: string; toId?: string; date?: string; session: SessionToken },
  codeFor: (id: string) => string,
): string {
  const token = input.session.type === "builtin" ? input.session.id : encodeBlocks(input.session.blocks, codeFor);
  const parts = [CODE_PREFIX, input.kind, token, input.fromId];
  if (input.kind === "S") parts.push(input.toId ?? "");
  if (input.kind === "G" || input.kind === "S") parts.push(encodeDate(input.date ?? ""));
  const body = parts.join("-");
  return `${body}-${checksum(body)}`;
}

function encodeDate(iso: string): string {
  const days = daysFromEpoch(iso, EPOCH);
  if (days < 0 || days > 32767) throw new Error("dato");
  return encodeNum(days, 3);
}

export function extractCode(raw: string): string | null {
  const match = raw.toUpperCase().match(/HIIT-[A-Z0-9]+(?:-[A-Z0-9]+){2,8}/);
  return match ? match[0] : null;
}

export function decodeShare(raw: string, idFor: (code: string) => string | null): Decoded {
  const extracted = extractCode(raw);
  if (!extracted) return { ok: false, error: "Fant ingen HIIT-kode i teksten." };
  const parts = extracted.split("-");
  const sum = parts.at(-1) ?? "";
  const body = parts.slice(0, -1).join("-");
  if (checksum(body) !== sum) {
    return { ok: false, error: "Sjekksummen stemmer ikke. Se etter 0/O og 1/I." };
  }
  const [, kind, token, fromId, fourth, fifth] = parts;
  if (!kind || !KINDS.has(kind) || !token || !fromId || fromId.length !== 4) {
    return { ok: false, error: "Koden mangler en bit." };
  }
  const session = resolveToken(token, idFor);
  if (!session) return { ok: false, error: "Ukjent øvelse i koden. Be om en ny SMS." };
  if (kind === "D" || kind === "U") {
    if (parts.length !== 5) return { ok: false, error: "Koden mangler en bit." };
    return kind === "D"
      ? { ok: true, kind: "D", fromId, session }
      : { ok: true, kind: "U", fromId, session };
  }
  if (kind === "G") {
    const date = readDate(fourth);
    if (!date) return { ok: false, error: "Datoen i koden er ugyldig." };
    if (parts.length !== 6) return { ok: false, error: "Koden mangler en bit." };
    return { ok: true, kind: "G", fromId, date, session };
  }
  const date = readDate(fifth);
  if (!fourth || fourth.length !== 4 || !date) return { ok: false, error: "Svaret mangler mottaker eller dato." };
  if (parts.length !== 7) return { ok: false, error: "Koden mangler en bit." };
  return { ok: true, kind: "S", fromId, toId: fourth, date, session };
}

function readDate(token: string | undefined): string | null {
  if (!token) return null;
  const days = decodeNum(token);
  if (days === null) return null;
  return dateFromDays(days, EPOCH);
}

function resolveToken(token: string, idFor: (code: string) => string | null): SessionToken | null {
  if (token.startsWith("X")) {
    const blocks = decodeBlocks(token, idFor);
    return blocks ? { type: "custom", blocks } : null;
  }
  if (!/^[A-Z0-9]{2,8}$/.test(token)) return null;
  return { type: "builtin", id: token };
}
