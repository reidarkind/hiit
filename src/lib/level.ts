export const LEVELS = [
  { xp: 0, name: "Første steg" },
  { xp: 40, name: "I gang" },
  { xp: 120, name: "Vane" },
  { xp: 240, name: "Morgenfugl" },
  { xp: 400, name: "Utholden" },
  { xp: 650, name: "Helkropp" },
  { xp: 950, name: "Stayer" },
  { xp: 1300, name: "Sammen" },
  { xp: 1800, name: "Fast" },
  { xp: 2400, name: "Innarbeidet" },
] as const;

export function totalXp(history: { xp: number }[]): number {
  return history.reduce((sum, item) => sum + item.xp, 0);
}

export function levelFor(xp: number): {
  name: string;
  into: number;
  span: number | null;
  nextName: string | null;
} {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  return {
    name: current.name,
    into: xp - current.xp,
    span: next ? next.xp - current.xp : null,
    nextName: next?.name ?? null,
  };
}

export function xpFor(workSeconds: number, morning: boolean, streak: number): number {
  const minutes = Math.max(1, Math.round(workSeconds / 60));
  const bird = morning ? 15 : 0;
  const bonus = Math.min(24, Math.floor(streak / 3) * 3);
  return minutes * 8 + bird + bonus;
}

export function isMorningBird(nowMinutes: number, cutoffMinutes: number): boolean {
  return nowMinutes < cutoffMinutes;
}
