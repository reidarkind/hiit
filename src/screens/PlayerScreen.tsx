import { useEffect, useMemo, useRef, useState } from "react";
import type { Profile, RestStep, Step, WorkStep } from "../types";
import { formatClock } from "../lib/format";
import { Figure } from "../ui/Figure";
import { Icon } from "../ui/icons";
import { MuscleMap } from "../ui/MuscleMap";
import { beep, buzz } from "../ui/sound";

export function PlayerScreen({
  title,
  steps,
  profile,
  onClose,
  onDone,
}: {
  title: string;
  steps: Step[];
  profile: Profile;
  onClose: () => void;
  onDone: (finished: boolean, index: number, elapsed: number) => void;
}) {
  const sequence = useMemo<Step[]>(() => {
    const first = steps.find((step) => step.kind === "work");
    const ready: RestStep = { kind: "rest", key: "klar", title: "Gjør deg klar", seconds: 5, nextTitle: first?.title ?? null };
    return [ready, ...steps];
  }, [steps]);
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(sequence[0]?.seconds ?? 0);
  const [paused, setPaused] = useState(false);
  const [flip, setFlip] = useState(false);
  const [ask, setAsk] = useState(false);
  const endRef = useRef(Date.now() + (sequence[0]?.seconds ?? 0) * 1000);
  const flippedRef = useRef(false);
  const lastWhole = useRef((sequence[0]?.seconds ?? 0) + 1);
  const advancing = useRef(false);

  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    void navigator.wakeLock?.request("screen").then((value) => {
      lock = value;
    }).catch(() => undefined);
    return () => {
      void lock?.release();
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    let frame = 0;
    const tick = () => {
      const step = sequence[index];
      if (!step) return;
      const remain = Math.max(0, (endRef.current - Date.now()) / 1000);
      setLeft(remain);
      if (step.kind === "work" && step.switchHalf && !flippedRef.current && remain <= step.seconds / 2) {
        flippedRef.current = true;
        setFlip(true);
        if (profile.sound) beep("tick");
        if (profile.haptics) buzz(20);
      }
      const whole = Math.ceil(remain);
      if (whole !== lastWhole.current && whole > 0 && whole <= 3 && profile.sound) beep("tick");
      lastWhole.current = whole;
      if (remain <= 0) {
        if (!advancing.current) go(index + 1);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [index, paused, sequence, profile.sound, profile.haptics]);

  function skip() {
    if (index + 1 >= sequence.length) {
      onDone(false, Math.max(0, index - 1), 0);
      return;
    }
    go(index + 1);
  }

  function go(next: number) {
    advancing.current = true;
    if (next >= sequence.length) {
      if (profile.sound) beep("done");
      if (profile.haptics) buzz([30, 40, 30]);
      onDone(true, steps.length, 0);
      return;
    }
    const step = sequence[next];
    endRef.current = Date.now() + step.seconds * 1000;
    flippedRef.current = false;
    lastWhole.current = step.seconds + 1;
    setFlip(false);
    setIndex(next);
    setLeft(step.seconds);
    advancing.current = false;
    if (step.kind === "work") {
      if (profile.sound) beep("go");
      if (profile.haptics) buzz(15);
    }
  }

  function togglePause() {
    if (!paused) {
      setPaused(true);
      return;
    }
    endRef.current = Date.now() + left * 1000;
    setPaused(false);
  }

  const step = sequence[index];
  if (!step) return null;
  const works = sequence.map((item, i) => ({ item, i })).filter((entry) => entry.item.kind === "work");
  const ordinal = works.findIndex((entry) => entry.i >= index) + 1;
  const after = sequence.slice(index + 1).filter((item) => item.kind === "work").length;
  const shown: WorkStep | undefined = step.kind === "work" ? step : sequence.slice(index + 1).find((item): item is WorkStep => item.kind === "work");
  const upcoming = sequence.slice((step.kind === "work" ? index : index) + 1).find((item): item is WorkStep => item.kind === "work");
  const side = shown && shown.side === "begge" && shown.switchHalf ? (flip || (step.kind === "work" && flip) ? "hoyre" : "venstre") : shown?.side;
  const mirror = side === "hoyre";
  const emphasize = Boolean(shown && (shown.side !== "begge" || shown.switchHalf));
  const doneBefore = sequence.slice(0, index).reduce((sum, item) => sum + item.seconds, 0);
  const total = sequence.reduce((sum, item) => sum + item.seconds, 0);
  const progress = Math.min(100, ((doneBefore + (step.seconds - left)) / total) * 100);
  const cue = shown?.cues[Math.floor((shown.seconds - (step.kind === "work" ? left : shown.seconds)) / 4) % Math.max(1, shown.cues.length)] ?? shown?.cues[0];

  return (
    <div className="player">
      <div className="track ink"><span style={{ width: `${progress}%` }} /></div>
      <div className="between">
        <button className="iconbtn" onClick={togglePause} aria-label={paused ? "Fortsett" : "Pause"}><Icon name={paused ? "play" : "pause"} /></button>
        <span className="muted small">{ordinal > 0 ? `Øvelse ${Math.min(ordinal, works.length)} av ${works.length}` : title}</span>
        <button className="iconbtn" onClick={() => setAsk(true)} aria-label="Avslutt"><Icon name="close" /></button>
      </div>
      <div className="between">
        <h1 style={{ fontSize: "1.4rem" }}>{step.kind === "work" ? step.title : step.title}</h1>
        {side && side !== "begge" ? <span className="pill coral">{side === "venstre" ? "Venstre" : "Høyre"}</span> : null}
      </div>
      {shown?.zone ? <p className="eyebrow">{shown.zone}</p> : null}
      <div className="figure-box player-figure">{shown ? <Figure pose={shown.pose} animate={!paused} mirror={mirror} emphasize={emphasize} /> : null}</div>
      <p className="clock" aria-live="polite">{formatClock(left)}</p>
      <p>{step.kind === "rest" ? `Neste: ${step.nextTitle ?? "ferdig"}` : cue}</p>
      {step.kind === "work" ? <MuscleMap primary={step.primary} secondary={step.secondary} compact /> : null}
      <div className="next-ex">
        <div className="thumb">{upcoming ? <Figure pose={upcoming.pose} t={1} /> : <Icon name="check" />}</div>
        <div>
          <p className="muted small">Neste</p>
          <strong>{upcoming ? upcoming.title : "Siste"}</strong>
          <p className="small">{step.kind === "work" ? (after === 0 ? "Siste øvelse" : `${after} etter denne`) : `${after} igjen`}</p>
        </div>
      </div>
      <button className="textbtn" onClick={() => skip()}>Hopp over</button>
      {ask ? (
        <div className="sheet">
          <div className="card stack">
            <h2>Avslutte økten?</h2>
            <p className="muted">Minst ett minutt arbeid teller på streaken.</p>
            <button className="btn block" onClick={() => onDone(false, Math.max(0, index - 1), index === 0 ? 0 : step.seconds - left)}>Lagre det du rakk</button>
            <button className="btn ghost block" onClick={onClose}>Forkast</button>
            <button className="textbtn" onClick={() => setAsk(false)}>Fortsett</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
