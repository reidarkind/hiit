import { useMemo, useState } from "react";
import type { AppState, Level, Session } from "../types";
import { allSessions } from "../data/sessions";
import { mustExercise } from "../data/exercises";
import { expandSession, stepSeconds } from "../lib/expand";
import { formatDuration, levelLabel } from "../lib/format";
import { lengthBand, sessionIntensity, sessionKind, type LengthBand, type SessionKind } from "../lib/sessionMeta";
import { Icon } from "../ui/icons";

const INTENSITY: { id: "alle" | Level; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "lett", label: "Lett" },
  { id: "middels", label: "Middels" },
  { id: "krevende", label: "Krevende" },
];

const KINDS: { id: "alle" | SessionKind; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "sirkel", label: "Sirkel" },
  { id: "kjerne", label: "Kjerne" },
  { id: "ute", label: "Ute" },
];

const LENGTHS: { id: "alle" | LengthBand; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "kort", label: "Under 12 min" },
  { id: "vanlig", label: "12–25 min" },
  { id: "lang", label: "Over 25 min" },
];

export function SessionsScreen({ state, onOpen, onCreate }: { state: AppState; onOpen: (id: string) => void; onCreate: () => void }) {
  const [intensity, setIntensity] = useState<(typeof INTENSITY)[number]["id"]>("alle");
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("alle");
  const [length, setLength] = useState<(typeof LENGTHS)[number]["id"]>("alle");
  const described = useMemo(() => {
    return allSessions(state).map((session) => {
      const seconds = stepSeconds(expandSession(session, mustExercise));
      return {
        session,
        seconds,
        intensity: sessionIntensity(session, mustExercise),
        kind: sessionKind(session, mustExercise),
        length: lengthBand(seconds),
      };
    });
  }, [state]);
  const visible = described.filter((item) =>
    (intensity === "alle" || item.intensity === intensity)
    && (kind === "alle" || item.kind === kind)
    && (length === "alle" || item.length === length),
  );
  const groups: { title: string; owned: Session[]; items: typeof visible }[] = [
    { title: "Ferdige økter", owned: described.filter((item) => item.session.builtin).map((item) => item.session), items: visible.filter((item) => item.session.builtin) },
    { title: "Mine økter", owned: state.customSessions, items: visible.filter((item) => state.customSessions.some((session) => session.id === item.session.id)) },
    { title: "Mottatt", owned: state.receivedSessions, items: visible.filter((item) => state.receivedSessions.some((session) => session.id === item.session.id)) },
  ];
  return (
    <div className="stack">
      <div className="between">
        <h1>Økter</h1>
        <button className="btn" onClick={onCreate}><Icon name="plus" /> Ny</button>
      </div>
      <FilterRow label="Intensitet" options={INTENSITY} value={intensity} onChange={setIntensity} />
      <FilterRow label="Type" options={KINDS} value={kind} onChange={setKind} />
      <FilterRow label="Lengde" options={LENGTHS} value={length} onChange={setLength} />
      {groups.map((group) => (
        <section key={group.title} className="stack">
          <h2>{group.title}</h2>
          {group.owned.length === 0 ? <p className="muted">Ingen her ennå.</p> : null}
          {group.owned.length > 0 && group.items.length === 0 ? <p className="muted">Ingen treff.</p> : null}
          {group.items.map((item) => (
            <button key={item.session.id} className="card" onClick={() => onOpen(item.session.id)} style={{ textAlign: "left" }}>
              <div className="between">
                <strong>{item.session.name}</strong>
                <span className="pill">{formatDuration(item.seconds)}</span>
              </div>
              <p className="muted small">{item.session.summary}</p>
              <p className="small">{levelLabel(item.intensity)} · {kindLabel(item.kind)}</p>
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div>
      <p className="muted small">{label}</p>
      <div className="chips" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            className={option.id === value ? "chip on" : "chip"}
            aria-pressed={option.id === value}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function kindLabel(kind: SessionKind): string {
  if (kind === "sirkel") return "Sirkel";
  if (kind === "kjerne") return "Kjerne";
  return "Ute";
}
