import { useState } from "react";
import type { Session } from "../types";
import { mustExercise } from "../data/exercises";
import { expandSession, sessionLevel, stepSeconds, workSteps } from "../lib/expand";
import { formatDuration, levelLabel } from "../lib/format";
import { coverageOf, weightsFrom } from "../lib/coverage";
import { Figure } from "../ui/Figure";
import { Icon } from "../ui/icons";
import { MuscleMap } from "../ui/MuscleMap";

export function SessionScreen({
  session,
  favorite,
  onBack,
  onStart,
  onShare,
  onChallenge,
  onFavorite,
  onEdit,
  onCopy,
  onDelete,
}: {
  session: Session;
  favorite: boolean;
  onBack: () => void;
  onStart: (rounds: number) => void;
  onShare: () => void;
  onChallenge: () => void;
  onFavorite: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const [rounds, setRounds] = useState(1);
  const steps = expandSession(session, mustExercise, rounds);
  const works = workSteps(steps);
  const level = sessionLevel(works.map((step) => mustExercise(step.exerciseId)));
  const coverage = coverageOf(weightsFrom(works));
  return (
    <div className="stack">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="Tilbake"><Icon name="back" /></button>
        <h1>{session.name}</h1>
        <span className="row">
          <button className="iconbtn" aria-pressed={favorite} aria-label={favorite ? "Fjern favoritt" : "Merk som favoritt"} onClick={onFavorite}>
            <Icon name="star" filled={favorite} />
          </button>
          <span className="pill">{levelLabel(level)}</span>
        </span>
      </div>
      <p>{session.summary}</p>
      <p className="muted">{session.about}</p>
      <div className="between">
        <strong>{formatDuration(stepSeconds(steps))}</strong>
        <span className="muted small">{works.length} øvelser, med begge sider</span>
      </div>
      <div className="card between">
        <span>Runder</span>
        <div className="stepper">
          <button className="iconbtn" onClick={() => setRounds((value) => Math.max(1, value - 1))} aria-label="Færre runder">−</button>
          <b>{rounds}</b>
          <button className="iconbtn" onClick={() => setRounds((value) => Math.min(4, value + 1))} aria-label="Flere runder">+</button>
        </div>
      </div>
      <MuscleMap weights={weightsFrom(works)} />
      <p className="small">{coverage.covers.length ? `Dekker ${coverage.covers.join(", ")}.` : "Smalt utvalg."} {coverage.gaps.length ? `Lite: ${coverage.gaps.join(", ")}.` : ""}</p>
      <ol className="stack">
        {session.blocks.map((block, index) => {
          const exercise = mustExercise(block.exerciseId);
          return (
            <li key={`${block.exerciseId}-${index}`} className="list-btn" style={{ display: "grid" }}>
              <div className="thumb"><Figure pose={exercise.pose} t={1} /></div>
              <div>
                <strong>{exercise.name}</strong>
                <p className="muted small">{block.workSeconds}s arbeid · {block.restSeconds}s hvile{block.rounds && block.rounds > 1 ? ` · ${block.rounds} runder` : ""}{exercise.side === "ensidig" ? " · begge sider" : ""}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <button className="btn block" onClick={() => onStart(rounds)}><Icon name="play" /> Start</button>
      <div className="btn-row">
        <button className="btn ghost" onClick={onShare}><Icon name="share" /> Del økten</button>
        <button className="btn ghost" onClick={onChallenge}>Utfordre</button>
      </div>
      <div className="btn-row">
        {session.builtin ? <button className="btn soft" onClick={onCopy}>Lag variant</button> : <button className="btn soft" onClick={onEdit}>Rediger</button>}
        {!session.builtin ? <button className="btn danger" onClick={onDelete}>Slett</button> : null}
      </div>
    </div>
  );
}
