export const WEEKDAYS = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

export function emptyWeek(): (string | null)[] {
  return [null, null, null, null, null, null, null];
}

export function weekdayIndex(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return weekday === 0 ? 6 : weekday - 1;
}

const MONTHS = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

export type PlanDates = Record<string, string | null>;

export function plannedSessionId(planWeek: (string | null)[], planDates: PlanDates, iso: string): string | null {
  if (Object.hasOwn(planDates, iso)) return planDates[iso];
  return planWeek[weekdayIndex(iso)] ?? null;
}

export function setPlanDate(planDates: PlanDates, iso: string, sessionId: string | null | undefined): PlanDates {
  const next = { ...planDates };
  if (sessionId === undefined) delete next[iso];
  else next[iso] = sessionId;
  return next;
}

export function forgetSessionDates(planDates: PlanDates, sessionId: string): PlanDates {
  const next: PlanDates = {};
  for (const [date, id] of Object.entries(planDates)) {
    if (id !== sessionId) next[date] = id;
  }
  return next;
}

export function planDateLabel(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  return `${WEEKDAYS[weekdayIndex(iso)]} ${day}. ${MONTHS[month - 1]}`;
}

export function planSpan(start: string, end: string): string {
  return `${dayMonth(start)} – ${dayMonth(end)}`;
}

function dayMonth(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  return `${day}. ${MONTHS[month - 1]}`;
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
