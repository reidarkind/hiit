import type { AppState, Challenge, Session } from "../types";
import { builtinById } from "../data/sessions";
import type { Decoded } from "./code";
import { randomId } from "./id";
import { awardFreezes } from "./streak";

export type ApplyResult = {
  state: AppState;
  note: string;
  sessionId?: string;
};

export function applyDecoded(state: AppState, decoded: Decoded, today: string, at: string): ApplyResult {
  if (!decoded.ok) return { state, note: decoded.error };
  if ((decoded.kind === "G" || decoded.kind === "S") && decoded.date > today) {
    return { state, note: "Datoen ligger fram i tid." };
  }
  const own = decoded.fromId === state.profile.id;
  const session = materialize(state, decoded);
  if (!session) return { state, note: "Økten i koden finnes ikke i denne versjonen." };
  let next: AppState = session.stored
    ? {
        ...state,
        receivedSessions: upsert(state.receivedSessions, session.session),
      }
    : state;
  if (decoded.kind === "U" && !own) {
    const challenge: Challenge = {
      id: randomId(6),
      fromId: decoded.fromId,
      sessionId: session.session.id,
      sessionName: session.session.name,
      at,
    };
    next = {
      ...next,
      challenges: [challenge, ...next.challenges.filter((item) => item.fromId !== decoded.fromId)].slice(0, 12),
      partners: upsertPartner(next.partners, decoded.fromId),
    };
  }
  if ((decoded.kind === "G" || decoded.kind === "S") && !own) {
    next = {
      ...next,
      partners: addInbound(upsertPartner(next.partners, decoded.fromId), decoded.fromId, decoded.date),
      challenges: decoded.kind === "S" ? next.challenges.filter((item) => item.fromId !== decoded.fromId) : next.challenges,
    };
  }
  const note = noteFor(decoded, session.session.name, own);
  return { state: next, note, sessionId: session.session.id };
}

function materialize(state: AppState, decoded: Extract<Decoded, { ok: true }>): { session: Session; stored: boolean } | null {
  const token = decoded.session;
  if (token.type === "builtin") {
    const session = builtinById(token.id);
    return session ? { session, stored: false } : null;
  }
  const id = `mot-${decoded.fromId}-${hashBlocks(JSON.stringify(token.blocks))}`;
  const existing = state.receivedSessions.find((item) => item.id === id && sameBlocks(item, token));
  if (existing) return { session: existing, stored: false };
  return {
    stored: true,
    session: {
      id,
      name: `Delt økt`,
      summary: `${token.blocks.length} øvelser`,
      about: `Mottatt fra ${decoded.fromId}.`,
      blocks: token.blocks,
      builtin: false,
    },
  };
}

function sameBlocks(session: Session, token: { type: "custom"; blocks: Session["blocks"] }): boolean {
  return JSON.stringify(session.blocks) === JSON.stringify(token.blocks);
}

function upsert(list: Session[], session: Session): Session[] {
  return [session, ...list.filter((item) => item.id !== session.id)];
}

function upsertPartner(list: AppState["partners"], id: string): AppState["partners"] {
  if (list.some((partner) => partner.id === id)) return list;
  return [...list, { id, name: `Venn ${id}`, inboundDates: [] }];
}

function addInbound(list: AppState["partners"], id: string, date: string): AppState["partners"] {
  return list.map((partner) =>
    partner.id === id && !partner.inboundDates.includes(date)
      ? { ...partner, inboundDates: [...partner.inboundDates, date].sort() }
      : partner,
  );
}

function noteFor(decoded: Extract<Decoded, { ok: true }>, name: string, own: boolean): string {
  if (own) return "Dette er en kode fra deg selv.";
  if (decoded.kind === "D") return `Økt mottatt: ${name}.`;
  if (decoded.kind === "U") return `Utfordring: ${name}.`;
  if (decoded.kind === "G") return `Registrert gjennomføring ${decoded.date}.`;
  return `Svar mottatt for ${decoded.date}.`;
}

export function addCompletion(state: AppState, completion: AppState["history"][number], today: string): AppState {
  return awardFreezes({ ...state, history: [...state.history, completion] }, today);
}

function hashBlocks(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (Math.imul(hash, 33) + value.charCodeAt(i)) >>> 0;
  return hash.toString(36).slice(0, 5);
}
