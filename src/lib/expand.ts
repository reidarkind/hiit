import type { Block, Exercise, RestStep, Session, SideName, Step, WorkStep } from "../types";

function workStep(exercise: Exercise, block: Block, side: SideName, key: string, switchHalf: boolean): WorkStep {
  return {
    kind: "work",
    key,
    exerciseId: exercise.id,
    title: exercise.name,
    side,
    seconds: block.workSeconds,
    cues: exercise.cues,
    how: exercise.steps,
    primary: exercise.primary,
    secondary: exercise.secondary,
    pose: exercise.pose,
    switchHalf,
    zone: exercise.zone,
    format: exercise.format,
  };
}

function restStep(key: string, title: string, seconds: number): RestStep {
  return { kind: "rest", key, title, seconds, nextTitle: null };
}

export function expandSession(session: Session, get: (id: string) => Exercise, rounds = 1): Step[] {
  const steps: Step[] = [];
  const safeRounds = Math.max(1, rounds);
  for (let round = 0; round < safeRounds; round++) {
    session.blocks.forEach((block, blockIndex) => {
      const exercise = get(block.exerciseId);
      const reps = Math.max(1, block.rounds ?? 1);
      const mode = exercise.side;
      for (let rep = 0; rep < reps; rep++) {
        const sides: SideName[] = mode === "ensidig" ? ["venstre", "hoyre"] : ["begge"];
        sides.forEach((side, sideIndex) => {
          const key = `${round}-${blockIndex}-${rep}-${side}`;
          steps.push(workStep(exercise, block, side, key, mode === "annenhver"));
          if (sideIndex < sides.length - 1) steps.push(restStep(`bytt-${key}`, "Bytt side", 5));
        });
        const last = rep === reps - 1 && blockIndex === session.blocks.length - 1 && round === safeRounds - 1;
        if (last) return;
        const betweenRounds = rep === reps - 1 && blockIndex === session.blocks.length - 1;
        if (betweenRounds) {
          steps.push(restStep(`runde-${round}`, "Ny runde", Math.max(20, block.restSeconds)));
        } else if (block.restSeconds > 0) {
          steps.push(restStep(`hvile-${round}-${blockIndex}-${rep}`, "Hvil", block.restSeconds));
        }
      }
    });
  }
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.kind !== "rest") continue;
    const next = steps.slice(i + 1).find((item) => item.kind === "work");
    step.nextTitle = next?.title ?? null;
  }
  return steps;
}

export function stepSeconds(steps: Step[]): number {
  return steps.reduce((sum, step) => sum + step.seconds, 0);
}

export function workSteps(steps: Step[]): WorkStep[] {
  return steps.filter((step): step is WorkStep => step.kind === "work");
}

export function sessionLevel(exercises: Exercise[]): Exercise["level"] {
  if (exercises.some((exercise) => exercise.level === "krevende")) return "krevende";
  if (exercises.some((exercise) => exercise.level === "middels")) return "middels";
  return "lett";
}
