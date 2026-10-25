import type { Exercise } from "../types";
import { builtinSessions } from "../data/sessions";
import { muscleName } from "../data/muscles";
import { levelLabel, placeLabel } from "../lib/format";
import { Figure } from "../ui/Figure";
import { Icon } from "../ui/icons";
import { MuscleMap } from "../ui/MuscleMap";

export function ExerciseScreen({ exercise, onBack }: { exercise: Exercise; onBack: () => void }) {
  const used = builtinSessions.filter((session) => session.blocks.some((block) => block.exerciseId === exercise.id));
  return (
    <div className="stack">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="Tilbake"><Icon name="back" /></button>
        <h1>{exercise.name}</h1>
        <span />
      </div>
      <div className="figure-box"><Figure pose={exercise.pose} animate /></div>
      <p>{exercise.summary}</p>
      <p className="muted small">{levelLabel(exercise.level)} · {placeLabel(exercise.place)} · {exercise.side === "ensidig" ? "Ett intervall per side" : exercise.side === "annenhver" ? "Bytt side halvveis" : "Begge sider samtidig"}</p>
      <ol className="stack">
        {exercise.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      {exercise.cues.map((cue) => <p key={cue} className="banner">{cue}</p>)}
      <MuscleMap primary={exercise.primary} secondary={exercise.secondary} />
      <p className="muted small">Sterk farge er hovedmuskel, lysere er hjelper. Forenklet, som på en studioplakat.</p>
      <p className="small">Hoved: {exercise.primary.map(muscleName).join(", ")}</p>
      {used.length > 0 ? <p className="small">Brukes i {used.map((session) => session.name).join(", ")}.</p> : null}
    </div>
  );
}
