export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return todayIso(new Date(y, m - 1, d + days));
}

export function daysBetween(after: string, before: string): string[] {
  const out: string[] = [];
  let cursor = addDays(after, 1);
  while (cursor < before) {
    out.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return out;
}

function utc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysFromEpoch(iso: string, epoch: string): number {
  return Math.round((utc(iso) - utc(epoch)) / 86400000);
}

export function dateFromDays(days: number, epoch: string): string {
  const dt = new Date(utc(epoch) + days * 86400000);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function minutesOf(now: Date): number {
  return now.getHours() * 60 + now.getMinutes();
}

export function mondayOf(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  const delta = day === 0 ? -6 : 1 - day;
  return addDays(iso, delta);
}

export function weekDates(iso: string): string[] {
  const monday = mondayOf(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function greeting(hour: number): string {
  if (hour < 10) return "God morgen";
  if (hour < 17) return "God dag";
  return "God kveld";
}

export function weekdayLetters(): string[] {
  return ["M", "T", "O", "T", "F", "L", "S"];
}
