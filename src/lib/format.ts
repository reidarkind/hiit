export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds - 0.001));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r} sek`;
  if (r === 0) return `${m} min`;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return rest ? `${h} t ${rest} min` : `${h} t`;
  }
  return `${m} min ${r} sek`;
}

export function levelLabel(level: "lett" | "middels" | "krevende"): string {
  if (level === "lett") return "Lett";
  if (level === "middels") return "Middels";
  return "Krevende";
}

export function gearLabel(gear: "ingen" | "stol" | "vekter" | "ball" | "strikk"): string {
  if (gear === "stol") return "Stol eller krakk";
  if (gear === "vekter") return "Håndvekter";
  if (gear === "ball") return "Pilatesball";
  if (gear === "strikk") return "Strikk";
  return "Uten utstyr";
}

export function placeLabel(place: "gulv" | "staende" | "ute"): string {
  if (place === "gulv") return "Gulv";
  if (place === "staende") return "Stående";
  return "Ute";
}

export function formatMinutes(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  return `${m} min`;
}
