import { useMemo, useState } from "react";
import type { AppState, Gear, Level, Session } from "../types";
import { allSessions } from "../data/sessions";
import { mustExercise } from "../data/exercises";
import { expandSession, stepSeconds } from "../lib/expand";
import { formatDuration, gearLabel, levelLabel } from "../lib/format";
import { lengthBand, sessionGears, sessionIntensity, sessionKind, type LengthBand, type SessionKind } from "../lib/sessionMeta";
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

const GEARS: { id: "alle" | "uten" | Gear; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "uten", label: "Uten utstyr" },
  { id: "stol", label: "Stol eller krakk" },
  { id: "vekter", label: "Håndvekter" },
  { id: "ball", label: "Pilatesball" },
  { id: "strikk", label: "Strikk" },
];

export function SessionsScreen({ state, onOpen, onCreate }: { state: AppState; onOpen: (id: string) => void; onCreate: () => void }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [intensity, setIntensity] = useState<(typeof INTENSITY)[number]["id"]>("alle");
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("alle");
  const [length, setLength] = useState<(typeof LENGTHS)[number]["id"]>("alle");
  const [gear, setGear] = useState<(typeof GEARS)[number]["id"]>("alle");
  const described = useMemo(() => {
    return allSessions(state).map((session) => {
      const seconds = stepSeconds(expandSession(session, mustExercise));
      return {
        session,
        seconds,
        intensity: sessionIntensity(session, mustExercise),
        kind: sessionKind(session, mustExercise),
        length: lengthBand(seconds),
        gears: sessionGears(session, mustExercise),
      };
    });
  }, [state]);
  const visible = described.filter((item) =>
    (intensity === "alle" || item.intensity === intensity)
    && (kind === "alle" || item.kind === kind)
    && (length === "alle" || item.length === length)
    && (gear === "alle" || (gear === "uten" ? item.gears.length === 0 : item.gears.includes(gear))),
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
      <button className="btn ghost block" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>
        Filter{filterSummary(intensity, kind, length, gear)}
        <Icon name={filtersOpen ? "up" : "down"} size={18} />
      </button>
      {filtersOpen ? (
        <div className="stack">
          <FilterRow label="Intensitet" options={INTENSITY} value={intensity} onChange={setIntensity} />
          <FilterRow label="Type" options={KINDS} value={kind} onChange={setKind} />
          <FilterRow label="Lengde" options={LENGTHS} value={length} onChange={setLength} />
          <FilterRow label="Utstyr" options={GEARS} value={gear} onChange={setGear} />
        </div>
      ) : null}
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
              <p className="small">{levelLabel(item.intensity)} · {kindLabel(item.kind)}{item.gears.length ? ` · ${item.gears.map(gearLabel).join(", ")}` : ""}</p>
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

function filterSummary(
  intensity: (typeof INTENSITY)[number]["id"],
  kind: (typeof KINDS)[number]["id"],
  length: (typeof LENGTHS)[number]["id"],
  gear: (typeof GEARS)[number]["id"],
): string {
  const parts = [
    intensity === "alle" ? "" : INTENSITY.find((item) => item.id === intensity)?.label,
    kind === "alle" ? "" : KINDS.find((item) => item.id === kind)?.label,
    length === "alle" ? "" : LENGTHS.find((item) => item.id === length)?.label,
    gear === "alle" ? "" : GEARS.find((item) => item.id === gear)?.label,
  ].filter(Boolean);
  return parts.length ? ` · ${parts.join(" · ")}` : "";
}

function kindLabel(kind: SessionKind): string {
  if (kind === "sirkel") return "Sirkel";
  if (kind === "kjerne") return "Kjerne";
  return "Ute";
}
