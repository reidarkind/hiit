import type { MuscleId } from "../types";
import { MUSCLE_IDS } from "../data/muscles";

export const REGIONS: { id: string; label: string; muscles: MuscleId[] }[] = [
  { id: "bein", label: "Bein", muscles: ["fremside-lar", "bakside-lar", "legg", "skinnelegg", "innside-lar"] },
  { id: "sete", label: "Sete", muscles: ["sete"] },
  { id: "kjerne", label: "Kjerne", muscles: ["mage", "skraa", "rygg-nedre"] },
  { id: "press", label: "Press", muscles: ["bryst", "triceps", "skulder-foran", "skulder-side"] },
  { id: "trekk", label: "Trekk", muscles: ["rygg-oever", "rygg-midten", "biceps", "skulder-bak"] },
];

export function emptyWeights(): Record<MuscleId, number> {
  return Object.fromEntries(MUSCLE_IDS.map((id) => [id, 0])) as Record<MuscleId, number>;
}

export function addMuscles(
  weights: Record<MuscleId, number>,
  primary: MuscleId[],
  secondary: MuscleId[],
): Record<MuscleId, number> {
  const next = { ...weights };
  for (const id of primary) next[id] += 2;
  for (const id of secondary) next[id] += 1;
  return next;
}

export function weightsFrom(
  items: { primary: MuscleId[]; secondary: MuscleId[] }[],
): Record<MuscleId, number> {
  return items.reduce((weights, item) => addMuscles(weights, item.primary, item.secondary), emptyWeights());
}

export function regionScores(weights: Record<MuscleId, number>): { id: string; label: string; score: number }[] {
  return REGIONS.map((region) => ({
    id: region.id,
    label: region.label,
    score: region.muscles.reduce((sum, id) => sum + (weights[id] ?? 0), 0),
  }));
}

export function coverageOf(weights: Record<MuscleId, number>): { covers: string[]; gaps: string[] } {
  const covers: string[] = [];
  const gaps: string[] = [];
  for (const region of regionScores(weights)) {
    if (region.score >= 2) covers.push(region.label);
    else gaps.push(region.label);
  }
  return { covers, gaps };
}

export function coveredRegionCount(weights: Record<MuscleId, number>): number {
  return coverageOf(weights).covers.length;
}
