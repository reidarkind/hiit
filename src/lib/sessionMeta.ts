import type { Exercise, Gear, Level, Session } from "../types";
import { expandSession, sessionLevel, workSteps } from "./expand";

export type SessionKind = "sirkel" | "kjerne" | "ute";
export type LengthBand = "kort" | "vanlig" | "lang";

const FEEL: Record<string, Level> = {
  KL7: "krevende",
  TABK: "krevende",
  TABM: "krevende",
  KJER: "lett",
  MRGN: "lett",
  HELK: "krevende",
  STAA: "middels",
  UNDE: "middels",
  TOPP: "middels",
  NYBE: "lett",
  GAJO: "middels",
  FART: "krevende",
  PYRA: "middels",
  NX44: "krevende",
  NX14: "krevende",
  NX24: "krevende",
  RUTE: "middels",
  LUFT: "lett",
  SAMT: "lett",
  ST7: "krevende",
  STOL: "middels",
  VEKT: "middels",
  BALL: "lett",
  STRK: "middels",
};

export function sessionGears(session: Session, get: (id: string) => Exercise): Gear[] {
  const found = new Set<Gear>();
  for (const block of session.blocks) {
    const gear = get(block.exerciseId).gear;
    if (gear !== "ingen") found.add(gear);
  }
  return [...found];
}

export function sessionIntensity(session: Session, get: (id: string) => Exercise): Level {
  if (session.builtin && FEEL[session.id]) return FEEL[session.id];
  const works = workSteps(expandSession(session, get));
  if (works.some((step) => step.zone === "Drag" || step.zone === "Tempo")) return "krevende";
  if (works.some((step) => step.zone === "Rolig")) return "middels";
  return sessionLevel(works.map((step) => get(step.exerciseId)));
}

export function sessionKind(session: Session, get: (id: string) => Exercise): SessionKind {
  const works = workSteps(expandSession(session, get));
  let total = 0;
  let ute = 0;
  let kjerne = 0;
  for (const step of works) {
    const exercise = get(step.exerciseId);
    total += step.seconds;
    if (exercise.place === "ute" || exercise.format === "intervall") ute += step.seconds;
    if (exercise.pattern === "kjerne") kjerne += step.seconds;
  }
  if (total > 0 && ute / total >= 0.5) return "ute";
  if (total > 0 && kjerne / total >= 0.5) return "kjerne";
  return "sirkel";
}

export function lengthBand(seconds: number): LengthBand {
  if (seconds < 12 * 60) return "kort";
  if (seconds < 25 * 60) return "vanlig";
  return "lang";
}
