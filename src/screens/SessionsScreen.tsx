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

const FAVORITES: { id: "alle" | "favoritt"; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "favoritt", label: "Favoritter" },
];

type GearChoice = "uten" | Gear;

const GEARS: { id: GearChoice; label: string }[] = [
  { id: "uten", label: "Uten utstyr" },
  { id: "stol", label: "Stol eller krakk" },
  { id: "vekter", label: "Håndvekter" },
  { id: "ball", label: "Pilatesball" },
  { id: "strikk", label: "Strikk" },
];

export function SessionsScreen({
  state,
  onOpen,
  onCreate,
  onFavorite,
}: {
  state: AppState;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onFavorite: (id: string) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [intensity, setIntensity] = useState<(typeof INTENSITY)[number]["id"]>("alle");
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("alle");
  const [length, setLength] = useState<(typeof LENGTHS)[number]["id"]>("alle");
  const [gears, setGears] = useState<GearChoice[]>([]);
  const [favorite, setFavorite] = useState<(typeof FAVORITES)[number]["id"]>("alle");
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
    && matchesGear(item.gears, gears)
    && (favorite === "alle" || state.favorites.includes(item.session.id)),
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
        Filter{filterSummary(intensity, kind, length, gears, favorite)}
        <Icon name={filtersOpen ? "up" : "down"} size={18} />
      </button>
      {filtersOpen ? (
        <div className="stack">
          <FilterRow label="Intensitet" options={INTENSITY} value={intensity} onChange={setIntensity} />
          <FilterRow label="Type" options={KINDS} value={kind} onChange={setKind} />
          <FilterRow label="Lengde" options={LENGTHS} value={length} onChange={setLength} />
          <ToggleRow label="Utstyr" options={GEARS} values={gears} onToggle={(id) => setGears((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} />
          <FilterRow label="Favoritt" options={FAVORITES} value={favorite} onChange={setFavorite} />
        </div>
      ) : null}
      {groups.map((group) => (
        <section key={group.title} className="stack">
          <h2>{group.title}</h2>
          {group.owned.length === 0 ? <p className="muted">Ingen her ennå.</p> : null}
          {group.owned.length > 0 && group.items.length === 0 ? <p className="muted">Ingen treff.</p> : null}
          {group.items.map((item) => {
            const loved = state.favorites.includes(item.session.id);
            return (
              <div key={item.session.id} className="card stack">
                <div className="between">
                  <button className="session-open" onClick={() => onOpen(item.session.id)}>
                    <strong>{item.session.name}</strong>
                  </button>
                  <button
                    className={loved ? "iconbtn loved" : "iconbtn"}
                    aria-pressed={loved}
                    aria-label={loved ? "Fjern favoritt" : "Merk som favoritt"}
                    onClick={() => onFavorite(item.session.id)}
                  >
                    <Icon name="heart" filled={loved} />
                  </button>
                </div>
                <button className="session-open" onClick={() => onOpen(item.session.id)}>
                  <p className="muted small">{item.session.summary}</p>
                  <span className="between" style={{ marginTop: 6 }}>
                    <span className="small">{levelLabel(item.intensity)} · {kindLabel(item.kind)}{item.gears.length ? ` · ${item.gears.map(gearLabel).join(", ")}` : ""}</span>
                    <span className="pill">{formatDuration(item.seconds)}</span>
                  </span>
                </button>
              </div>
            );
          })}
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

function ToggleRow<T extends string>({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: { id: T; label: string }[];
  values: T[];
  onToggle: (id: T) => void;
}) {
  return (
    <div>
      <p className="muted small">{label}</p>
      <div className="chips" role="group" aria-label={label}>
        {options.map((option) => {
          const on = values.includes(option.id);
          return (
            <button
              key={option.id}
              className={on ? "chip on" : "chip"}
              aria-pressed={on}
              onClick={() => onToggle(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function matchesGear(present: Gear[], selected: GearChoice[]): boolean {
  if (selected.length === 0) return true;
  return selected.some((choice) => choice === "uten" ? present.length === 0 : present.includes(choice));
}

function filterSummary(
  intensity: (typeof INTENSITY)[number]["id"],
  kind: (typeof KINDS)[number]["id"],
  length: (typeof LENGTHS)[number]["id"],
  gears: GearChoice[],
  favorite: (typeof FAVORITES)[number]["id"],
): string {
  const gearLabels = GEARS.filter((item) => gears.includes(item.id)).map((item) => item.label);
  const parts = [
    intensity === "alle" ? "" : INTENSITY.find((item) => item.id === intensity)?.label,
    kind === "alle" ? "" : KINDS.find((item) => item.id === kind)?.label,
    length === "alle" ? "" : LENGTHS.find((item) => item.id === length)?.label,
    gearLabels.join(", "),
    favorite === "alle" ? "" : "Favoritter",
  ].filter(Boolean);
  return parts.length ? ` · ${parts.join(" · ")}` : "";
}

function kindLabel(kind: SessionKind): string {
  if (kind === "sirkel") return "Sirkel";
  if (kind === "kjerne") return "Kjerne";
  return "Ute";
}
