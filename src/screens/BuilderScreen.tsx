import { useMemo, useState } from "react";
import type { Block, Session } from "../types";
import { exercises, mustExercise } from "../data/exercises";
import { expandSession, stepSeconds } from "../lib/expand";
import { formatDuration } from "../lib/format";
import { coverageOf, weightsFrom } from "../lib/coverage";
import { workSteps } from "../lib/expand";
import { Icon } from "../ui/icons";
import { MuscleMap } from "../ui/MuscleMap";

export function BuilderScreen({
  initial,
  onBack,
  onSave,
}: {
  initial: Session | null;
  onBack: () => void;
  onSave: (name: string, blocks: Block[]) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [blocks, setBlocks] = useState<Block[]>(initial?.blocks ?? []);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const preview = useMemo(() => {
    if (blocks.length === 0) return null;
    const session: Session = { id: "draft", name: name || "Utkast", summary: "", about: "", blocks, builtin: false };
    const steps = expandSession(session, mustExercise);
    return { steps, seconds: stepSeconds(steps), coverage: coverageOf(weightsFrom(workSteps(steps))) };
  }, [blocks, name]);
  const choices = exercises.filter((exercise) => exercise.name.toLowerCase().includes(query.trim().toLowerCase()));

  function update(index: number, patch: Partial<Block>) {
    setBlocks((current) => current.map((block, i) => (i === index ? { ...block, ...patch } : block)));
  }

  return (
    <div className="stack">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="Tilbake"><Icon name="back" /></button>
        <h1>{initial ? "Rediger" : "Ny økt"}</h1>
        <span />
      </div>
      <label className="field">
        Navn
        <input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} placeholder="Morgen på stua" />
      </label>
      {blocks.map((block, index) => {
        const exercise = mustExercise(block.exerciseId);
        return (
          <article key={`${block.exerciseId}-${index}`} className="card stack">
            <div className="between">
              <strong>{exercise.name}</strong>
              <span className="muted small">{exercise.side === "ensidig" ? "begge sider" : ""}</span>
            </div>
            <div className="between">
              <span>Arbeid</span>
              <Stepper value={block.workSeconds} min={10} max={600} step={block.workSeconds >= 60 && block.workSeconds % 15 === 0 ? 15 : 5} onChange={(workSeconds) => update(index, { workSeconds })} />
            </div>
            <div className="between">
              <span>Hvile</span>
              <Stepper value={block.restSeconds} min={0} max={180} step={block.restSeconds >= 60 && block.restSeconds % 15 === 0 ? 15 : 5} onChange={(restSeconds) => update(index, { restSeconds })} />
            </div>
            <div className="between">
              <span>Runder</span>
              <Stepper value={block.rounds ?? 1} min={1} max={12} step={1} suffix="" onChange={(rounds) => update(index, { rounds })} />
            </div>
            <div className="btn-row">
              <button className="btn ghost" onClick={() => setBlocks((current) => move(current, index, -1))} aria-label="Flytt opp"><Icon name="up" /></button>
              <button className="btn ghost" onClick={() => setBlocks((current) => move(current, index, 1))} aria-label="Flytt ned"><Icon name="down" /></button>
              <button className="btn danger" onClick={() => setBlocks((current) => current.filter((_, i) => i !== index))} aria-label="Fjern"><Icon name="trash" /></button>
            </div>
          </article>
        );
      })}
      <button className="btn ghost block" onClick={() => setPicking(true)} disabled={blocks.length >= 24}><Icon name="plus" /> Legg til øvelse</button>
      {preview ? (
        <section className="stack">
          <p><strong>{formatDuration(preview.seconds)}</strong></p>
          <MuscleMap weights={weightsFrom(workSteps(preview.steps))} compact />
          <p className="small">{preview.coverage.covers.length ? `Dekker ${preview.coverage.covers.join(", ")}.` : ""} {preview.coverage.gaps.length ? `Lite: ${preview.coverage.gaps.join(", ")}.` : ""}</p>
        </section>
      ) : <p className="muted">Legg til minst én øvelse.</p>}
      <button className="btn block" disabled={!name.trim() || blocks.length === 0} onClick={() => onSave(name.trim(), blocks)}>Lagre økten</button>
      {picking ? (
        <div className="sheet">
          <div className="card stack" style={{ maxHeight: "80dvh", overflow: "auto" }}>
            <div className="between">
              <h2>Velg øvelse</h2>
              <button className="iconbtn" onClick={() => setPicking(false)} aria-label="Lukk"><Icon name="close" /></button>
            </div>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Søk" />
            {choices.map((exercise) => (
              <button
                key={exercise.id}
                className="btn ghost"
                onClick={() => {
                  setBlocks((current) => [...current, { exerciseId: exercise.id, workSeconds: exercise.format === "intervall" ? 60 : 30, restSeconds: exercise.format === "intervall" ? 0 : 10 }]);
                  setPicking(false);
                }}
              >
                {exercise.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stepper({ value, min, max, step, suffix = "s", onChange }: { value: number; min: number; max: number; step: number; suffix?: string; onChange: (value: number) => void }) {
  return (
    <div className="stepper">
      <button className="iconbtn" onClick={() => onChange(Math.max(min, value - step))} aria-label="Mindre">−</button>
      <b>{value}{suffix}</b>
      <button className="iconbtn" onClick={() => onChange(Math.min(max, value + step))} aria-label="Mer">+</button>
    </div>
  );
}

function move(blocks: Block[], index: number, dir: number): Block[] {
  const next = index + dir;
  if (next < 0 || next >= blocks.length) return blocks;
  const copy = blocks.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}
