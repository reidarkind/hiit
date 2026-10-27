export const WEEKDAYS = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

export function emptyWeek(): (string | null)[] {
  return [null, null, null, null, null, null, null];
}

export function weekdayIndex(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return weekday === 0 ? 6 : weekday - 1;
}

export function plannedSessionId(planWeek: (string | null)[], iso: string): string | null {
  return planWeek[weekdayIndex(iso)] ?? null;
}

export function setWeekday(planWeek: (string | null)[], index: number, sessionId: string | null): (string | null)[] {
  const next = emptyWeek();
  planWeek.forEach((id, i) => {
    if (i < 7) next[i] = id;
  });
  next[index] = sessionId;
  return next;
}

export function toggleFavorite(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [id, ...ids];
}
