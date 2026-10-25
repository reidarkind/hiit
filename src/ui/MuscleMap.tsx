import type { MuscleId } from "../types";
import { muscleName } from "../data/muscles";
import { emptyWeights } from "../lib/coverage";
import { BACK_BODY, FRONT_BODY, type BodyPoly } from "./bodyMap";

const SKIN = "#f3d2bc";
const SKIN_LINE = "#e2b49a";
const IDLE = "#ead9c6";
const IDLE_LINE = "#d9c4ae";

function tone(weight: number, max: number): string {
  const t = weight / max;
  if (t > 0.66) return "#d4532b";
  if (t > 0.33) return "#e07a3d";
  return "#e8a23a";
}

function weightOf(part: BodyPoly, weights: Record<MuscleId, number>): number {
  if (!part.muscles) return 0;
  return Math.max(0, ...part.muscles.map((id) => weights[id] ?? 0));
}

function Poster({ title, parts, weights, max }: { title: string; parts: BodyPoly[]; weights: Record<MuscleId, number>; max: number }) {
  return (
    <figure className="poster">
      <svg viewBox="40 0 920 2200" role="img" aria-label={title}>
        {parts.map((part, index) => {
          const weight = weightOf(part, weights);
          const neutral = !part.muscles;
          const hot = weight > 0;
          return (
            <polygon
              key={index}
              points={part.points}
              fill={neutral ? SKIN : hot ? tone(weight, max) : IDLE}
              stroke={neutral ? SKIN_LINE : hot ? "#8a2e16" : IDLE_LINE}
              strokeWidth="1.4"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <figcaption>{title}</figcaption>
    </figure>
  );
}

export function MuscleMap({
  primary = [],
  secondary = [],
  weights,
  compact = false,
}: {
  primary?: MuscleId[];
  secondary?: MuscleId[];
  weights?: Partial<Record<MuscleId, number>>;
  compact?: boolean;
}) {
  const base = emptyWeights();
  if (weights) {
    for (const [id, value] of Object.entries(weights) as [MuscleId, number][]) base[id] = value;
  } else {
    for (const id of primary) base[id] += 2;
    for (const id of secondary) base[id] += 1;
  }
  const max = Math.max(1, ...Object.values(base));
  const named = (Object.entries(base) as [MuscleId, number][])
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);
  return (
    <div className={compact ? "map compact" : "map"}>
      <div className="posters">
        <Poster title="Foran" parts={FRONT_BODY} weights={base} max={max} />
        <Poster title="Bak" parts={BACK_BODY} weights={base} max={max} />
      </div>
      {named.length > 0 ? (
        <ul className="muscle-names">
          {named.slice(0, compact ? 4 : 8).map(([id, value]) => (
            <li key={id} className={value >= max * 0.66 ? "hot" : "warm"}>
              {muscleName(id)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Ingen muskler markert.</p>
      )}
    </div>
  );
}
