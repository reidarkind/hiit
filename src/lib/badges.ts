import type { AppState } from "../types";
import { exerciseById } from "../data/exercises";
import { coveredRegionCount, emptyWeights } from "./coverage";
import { mondayOf } from "./dates";
import { bestStreak, countingDates, morningDates } from "./streak";

export type Badge = {
  id: string;
  name: string;
  text: string;
  icon: "check" | "flame" | "bird" | "body" | "share" | "users" | "timer" | "snow" | "grid";
};

export const BADGES: Badge[] = [
  { id: "forste", name: "Første økt", text: "Fullfør en økt som teller.", icon: "check" },
  { id: "tre", name: "Tre på rad", text: "Tre dager med trening.", icon: "flame" },
  { id: "uke", name: "Hel uke", text: "Sju dager på rad.", icon: "flame" },
  { id: "maned", name: "Måned", text: "Tretti dager på rad.", icon: "flame" },
  { id: "fugl", name: "Morgenfugl", text: "Fem økter ferdig før klokken 9.", icon: "bird" },
  { id: "fuglerekke", name: "Tidlig ute", text: "Tre morgenfugl-dager på rad.", icon: "bird" },
  { id: "bred", name: "Bred økt", text: "Én økt som treffer minst fire regioner.", icon: "body" },
  { id: "sider", name: "Begge sider", text: "Fullfør en ensidig øvelse, med begge sider.", icon: "check" },
  { id: "delt", name: "Delt", text: "Del en økt eller en gjennomføring.", icon: "share" },
  { id: "par", name: "Par", text: "Tre dager med par-streak.", icon: "users" },
  { id: "syv", name: "Klassisk", text: "Fullfør Klassisk 7.", icon: "timer" },
  { id: "ti", name: "Ti øvelser", text: "Prøv ti ulike øvelser.", icon: "grid" },
  { id: "frost", name: "Tilbake", text: "Bruk frost, og tren igjen etterpå.", icon: "snow" },
  { id: "ute", name: "Ute", text: "Fullfør en intervalløkt.", icon: "timer" },
  { id: "mal", name: "Ukesmål", text: "Nå ukesmålet.", icon: "check" },
];

export function earnedBadgeIds(state: AppState): string[] {
  const dates = countingDates(state.history);
  const best = bestStreak(dates, state.bridgedDays);
  const mornings = morningDates(state.history);
  const ids = new Set<string>();
  if (dates.length > 0) ids.add("forste");
  if (best >= 3) ids.add("tre");
  if (best >= 7) ids.add("uke");
  if (best >= 30) ids.add("maned");
  if (mornings.length >= 5) ids.add("fugl");
  if (bestStreak(mornings, []) >= 3) ids.add("fuglerekke");
  if (state.history.some((item) => item.counts && coveredRegionCount(asWeights(item)) >= 4)) {
    ids.add("bred");
  }
  if (state.history.some((item) => item.counts && item.exerciseIds.some((id) => exerciseById(id)?.side === "ensidig"))) {
    ids.add("sider");
  }
  if (state.shared) ids.add("delt");
  if (state.partners.some((partner) => bestStreak(dates.filter((day) => partner.inboundDates.includes(day)), []) >= 3)) {
    ids.add("par");
  }
  if (state.history.some((item) => item.counts && item.sessionId === "KL7")) ids.add("syv");
  const tried = new Set(state.history.filter((item) => item.counts).flatMap((item) => item.exerciseIds));
  if (tried.size >= 10) ids.add("ti");
  if (state.bridgedDays.some((day) => dates.some((trained) => trained > day))) ids.add("frost");
  if (state.history.some((item) => item.counts && item.exerciseIds.some((id) => exerciseById(id)?.format === "intervall"))) {
    ids.add("ute");
  }
  const weeks = new Map<string, number>();
  for (const day of dates) weeks.set(mondayOf(day), (weeks.get(mondayOf(day)) ?? 0) + 1);
  if ([...weeks.values()].some((count) => count >= state.profile.weeklyGoal)) ids.add("mal");
  return BADGES.map((badge) => badge.id).filter((id) => ids.has(id));
}

function asWeights(item: AppState["history"][number]): ReturnType<typeof emptyWeights> {
  const weights = emptyWeights();
  for (const muscle of item.muscles) weights[muscle.id] += muscle.weight;
  return weights;
}
