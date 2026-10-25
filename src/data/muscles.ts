import type { MuscleId } from "../types";

export const MUSCLE_NAME: Record<MuscleId, string> = {
  bryst: "Bryst",
  "skulder-foran": "Skulder foran",
  "skulder-side": "Skulder",
  "skulder-bak": "Skulder bak",
  biceps: "Biceps",
  triceps: "Triceps",
  underarm: "Underarm",
  mage: "Mage",
  skraa: "Skrå mage",
  "rygg-oever": "Øvre rygg",
  "rygg-midten": "Midtre rygg",
  "rygg-nedre": "Korsrygg",
  sete: "Sete",
  "fremside-lar": "Fremside lår",
  "bakside-lar": "Bakside lår",
  "innside-lar": "Innside lår",
  hofteboyer: "Hoftebøyer",
  legg: "Legg",
  skinnelegg: "Skinnelegg",
};

export const MUSCLE_FACE: Record<MuscleId, "front" | "back" | "both"> = {
  bryst: "front",
  "skulder-foran": "front",
  "skulder-side": "both",
  "skulder-bak": "back",
  biceps: "front",
  triceps: "back",
  underarm: "both",
  mage: "front",
  skraa: "both",
  "rygg-oever": "back",
  "rygg-midten": "back",
  "rygg-nedre": "back",
  sete: "back",
  "fremside-lar": "front",
  "bakside-lar": "back",
  "innside-lar": "front",
  hofteboyer: "front",
  legg: "back",
  skinnelegg: "front",
};

export const MUSCLE_IDS = Object.keys(MUSCLE_NAME) as MuscleId[];

export function muscleName(id: MuscleId): string {
  return MUSCLE_NAME[id];
}
