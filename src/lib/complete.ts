import type { AppState, Completion, MuscleId, Session, Step, WorkStep } from "../types";
import { MIN_STREAK_SECONDS, MORNING_BIRD_MINUTES } from "./constants";
import { minutesOf, todayIso } from "./dates";
import { isMorningBird, xpFor } from "./level";
import { countingDates, streakCount } from "./streak";
import { weightsFrom } from "./coverage";

export function takenFrom(steps: Step[], index: number, finished: boolean, elapsed: number): {
  workSeconds: number;
  works: WorkStep[];
} {
  const end = finished ? steps.length : index;
  const works = steps.slice(0, end).filter((step): step is WorkStep => step.kind === "work");
  let workSeconds = works.reduce((sum, step) => sum + step.seconds, 0);
  const current = steps[index];
  if (!finished && current?.kind === "work") {
    workSeconds += Math.min(current.seconds, Math.max(0, elapsed));
  }
  return { workSeconds, works };
}

export function assess(
  state: AppState,
  input: {
    id: string;
    now: Date;
    session: Session;
    steps: Step[];
    index: number;
    finished: boolean;
    elapsed: number;
  },
): Completion {
  const taken = takenFrom(input.steps, input.index, input.finished, input.elapsed);
  const counts = input.finished || taken.workSeconds >= MIN_STREAK_SECONDS;
  const date = todayIso(input.now);
  const dates = countingDates(state.history);
  if (counts) dates.push(date);
  const streak = streakCount(dates, state.bridgedDays, date);
  const morningBird = counts && isMorningBird(minutesOf(input.now), MORNING_BIRD_MINUTES);
  const weights = weightsFrom(taken.works);
  const muscles = (Object.entries(weights) as [MuscleId, number][])
    .filter(([, weight]) => weight > 0)
    .map(([id, weight]) => ({ id, weight }));
  return {
    id: input.id,
    at: input.now.toISOString(),
    date,
    sessionId: input.session.id,
    sessionName: input.session.name,
    seconds: taken.workSeconds,
    morningBird,
    counts,
    xp: xpFor(taken.workSeconds, morningBird, streak),
    exerciseIds: [...new Set(taken.works.map((step) => step.exerciseId))],
    muscles,
  };
}
