import { useMemo, useState } from "react";
import { exercises } from "../data/exercises";
import type { Exercise } from "../types";
import { gearLabel, levelLabel, placeLabel } from "../lib/format";
import { muscleName } from "../data/muscles";
import { Figure } from "../ui/Figure";

const FILTERS: { id: string; label: string; test: (exercise: Exercise) => boolean }[] = [
  { id: "alle", label: "Alle", test: () => true },
  { id: "gulv", label: "Gulv", test: (exercise) => exercise.place === "gulv" },
  { id: "staende", label: "Stående", test: (exercise) => exercise.place === "staende" },
  { id: "ute", label: "Ute", test: (exercise) => exercise.place === "ute" },
  { id: "kjerne", label: "Kjerne", test: (exercise) => exercise.pattern === "kjerne" },
  { id: "bein", label: "Bein", test: (exercise) => ["knebøy", "utfall", "hengsel"].includes(exercise.pattern) },
  { id: "over", label: "Overkropp", test: (exercise) => exercise.pattern === "press" || exercise.pattern === "trekk" },
  { id: "lett", label: "Lett", test: (exercise) => exercise.level === "lett" },
];

const GEARS: { id: string; label: string; test: (exercise: Exercise) => boolean }[] = [
  { id: "alle", label: "Alt utstyr", test: () => true },
  { id: "ingen", label: "Uten utstyr", test: (exercise) => exercise.gear === "ingen" },
  { id: "stol", label: "Stol eller krakk", test: (exercise) => exercise.gear === "stol" },
  { id: "vekter", label: "Håndvekter", test: (exercise) => exercise.gear === "vekter" },
  { id: "ball", label: "Pilatesball", test: (exercise) => exercise.gear === "ball" },
  { id: "strikk", label: "Strikk", test: (exercise) => exercise.gear === "strikk" },
];

export function LibraryScreen({ onOpen }: { onOpen: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("alle");
  const [gear, setGear] = useState("alle");
  const visible = useMemo(() => {
    const test = FILTERS.find((item) => item.id === filter)?.test ?? (() => true);
    const gearTest = GEARS.find((item) => item.id === gear)?.test ?? (() => true);
    const q = query.trim().toLowerCase();
    return exercises.filter((exercise) => test(exercise) && gearTest(exercise) && (!q || `${exercise.name} ${exercise.summary} ${gearLabel(exercise.gear)}`.toLowerCase().includes(q)));
  }, [filter, gear, query]);
  return (
    <div className="stack">
      <h1>Øvelser</h1>
      <label className="field">
        <span className="muted small">Søk</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Knebøy, planke, jogg…" />
      </label>
      <div className="chips">
        {FILTERS.map((item) => (
          <button key={item.id} className={item.id === filter ? "chip on" : "chip"} onClick={() => setFilter(item.id)}>{item.label}</button>
        ))}
      </div>
      <div className="chips">
        {GEARS.map((item) => (
          <button key={item.id} className={item.id === gear ? "chip on" : "chip"} onClick={() => setGear(item.id)}>{item.label}</button>
        ))}
      </div>
      {visible.length === 0 ? <p className="muted">Ingen øvelser der.</p> : null}
      {visible.map((exercise) => (
        <button key={exercise.id} className="list-btn" onClick={() => onOpen(exercise.id)}>
          <div className="thumb"><Figure pose={exercise.pose} t={1} /></div>
          <div>
            <strong>{exercise.name}</strong>
            <p className="muted small">{levelLabel(exercise.level)} · {placeLabel(exercise.place)}{exercise.gear === "ingen" ? "" : ` · ${gearLabel(exercise.gear)}`}</p>
            <p className="small">{exercise.primary.slice(0, 2).map(muscleName).join(", ")}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
