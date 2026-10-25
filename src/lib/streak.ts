import { FREEZE_CAP } from "./constants";
import { addDays, daysBetween } from "./dates";

export function countingDates(history: { date: string; counts: boolean }[]): string[] {
  return [...new Set(history.filter((item) => item.counts).map((item) => item.date))];
}

export function streakCount(trained: string[], bridged: string[], today: string): number {
  const marks = new Set([...trained, ...bridged]);
  let cursor = marks.has(today) ? today : addDays(today, -1);
  if (!marks.has(cursor)) return 0;
  let n = 0;
  while (marks.has(cursor)) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function bestStreak(trained: string[], bridged: string[]): number {
  const days = [...new Set([...trained, ...bridged])].sort();
  let best = 0;
  let current = 0;
  let prev = "";
  for (const day of days) {
    current = prev && addDays(prev, 1) === day ? current + 1 : 1;
    best = Math.max(best, current);
    prev = day;
  }
  return best;
}

export function morningDates(history: { date: string; counts: boolean; morningBird: boolean }[]): string[] {
  return [
    ...new Set(history.filter((item) => item.counts && item.morningBird).map((item) => item.date)),
  ];
}

export function morningStreak(dates: string[], today: string, nowMinutes: number, cutoff: number): number {
  const marks = new Set(dates);
  const open = nowMinutes < cutoff;
  const start = marks.has(today) ? today : open ? addDays(today, -1) : "";
  if (!start || !marks.has(start)) return 0;
  return streakCount([start, ...dates], [], start);
}

export function pairStreak(myDates: string[], inbound: string[], today: string): number {
  const got = new Set(inbound);
  return streakCount(
    myDates.filter((day) => got.has(day)),
    [],
    today,
  );
}

export function reconcileFreezes<T extends { history: { date: string; counts: boolean }[]; bridgedDays: string[]; freezeBank: number }>(
  state: T,
  today: string,
): T {
  const marks = new Set([...countingDates(state.history), ...state.bridgedDays]);
  const past = [...marks].filter((day) => day < today).sort();
  if (past.length === 0) return state;
  const missed = daysBetween(past[past.length - 1], today);
  if (missed.length === 0 || missed.length > state.freezeBank) return state;
  return {
    ...state,
    freezeBank: state.freezeBank - missed.length,
    bridgedDays: [...state.bridgedDays, ...missed].sort(),
  };
}

export function awardFreezes<T extends { history: { date: string; counts: boolean }[]; bridgedDays: string[]; freezeBank: number; freezeAwarded: number[] }>(
  state: T,
  today: string,
): T {
  const streak = streakCount(countingDates(state.history), state.bridgedDays, today);
  const awarded = new Set(state.freezeAwarded);
  let bank = state.freezeBank;
  let changed = false;
  for (let mark = 7; mark <= streak; mark += 7) {
    if (awarded.has(mark)) continue;
    awarded.add(mark);
    changed = true;
    if (bank < FREEZE_CAP) bank += 1;
  }
  if (!changed) return state;
  return {
    ...state,
    freezeBank: bank,
    freezeAwarded: [...awarded].sort((a, b) => a - b),
  };
}

export function riskFromHour(reminderHour: number): number {
  return Math.min(18, reminderHour);
}
