export type ListScroll = { sessions: number; library: number };

export function rememberListScroll(from: string, y: number, saved: ListScroll): ListScroll {
  if (from === "sessions") return { ...saved, sessions: y };
  if (from === "library") return { ...saved, library: y };
  return saved;
}

export function scrollForRoute(name: string, saved: ListScroll): number {
  if (name === "sessions") return saved.sessions;
  if (name === "library") return saved.library;
  return 0;
}
