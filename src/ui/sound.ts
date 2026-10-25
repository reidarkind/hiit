let ctx: AudioContext | null = null;

export function beep(kind: "tick" | "go" | "done"): void {
  const AudioCtx = window.AudioContext;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") void ctx.resume();
  const tone = ctx.createOscillator();
  const gain = ctx.createGain();
  tone.type = "sine";
  tone.frequency.value = kind === "tick" ? 740 : kind === "go" ? 523 : 392;
  gain.gain.value = 0.0001;
  tone.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === "done" ? 0.32 : 0.13));
  tone.start(now);
  tone.stop(now + 0.36);
}

export function buzz(pattern: number | number[]): void {
  navigator.vibrate?.(pattern);
}
