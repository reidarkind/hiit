import { useState } from "react";
import type { AppState } from "../types";
import { BADGES, earnedBadgeIds } from "../lib/badges";
import { MORNING_BIRD_MINUTES } from "../lib/constants";
import { addDays, weekDates } from "../lib/dates";
import { levelFor, totalXp } from "../lib/level";
import { bestStreak, countingDates, morningDates, pairStreak, streakCount } from "../lib/streak";
import { emptyWeights } from "../lib/coverage";
import { Icon } from "../ui/icons";
import { MuscleMap } from "../ui/MuscleMap";

export function ProgressScreen({
  state,
  today,
  nowMinutes,
  onRename,
}: {
  state: AppState;
  today: string;
  nowMinutes: number;
  onRename: (id: string, name: string) => void;
}) {
  const dates = countingDates(state.history);
  const streak = streakCount(dates, state.bridgedDays, today);
  const best = bestStreak(dates, state.bridgedDays);
  const level = levelFor(totalXp(state.history));
  const earned = new Set(earnedBadgeIds(state));
  const week = new Set(weekDates(today));
  const weekMuscles = emptyWeights();
  for (const item of state.history) {
    if (!week.has(item.date)) continue;
    for (const muscle of item.muscles) weekMuscles[muscle.id] += muscle.weight;
  }
  const days = Array.from({ length: 28 }, (_, index) => addDays(today, index - 27));
  const cutoff = MORNING_BIRD_MINUTES;
  const bird = morningDates(state.history);
  return (
    <div className="stack">
      <h1>Fremgang</h1>
      <section className="stats" style={{ color: "inherit" }}>
        <div className="card stat"><span>Streak</span><b>{streak}</b><span className="muted small">beste {best}</span></div>
        <div className="card stat"><span>Morgen</span><b>{bird.length}</b><span className="muted small">{nowMinutes < cutoff ? "åpent" : "lukket"}</span></div>
        <div className="card stat"><span>Nivå</span><b style={{ fontSize: "1rem" }}>{level.name}</b></div>
      </section>
      <section className="card">
        <h2>28 dager</h2>
        <div className="week" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
          {days.map((day) => (
            <i key={day} className={`${dates.includes(day) ? "on" : ""} ${state.bridgedDays.includes(day) ? "freeze" : ""} ${day === today ? "today" : ""}`} title={day} />
          ))}
        </div>
      </section>
      <section className="stack">
        <h2>Kroppen denne uken</h2>
        <MuscleMap weights={weekMuscles} />
      </section>
      <section className="stack">
        <div className="between"><h2>Merker</h2><span className="muted small">{earned.size}/{BADGES.length}</span></div>
        <div className="badges">
          {BADGES.map((badge) => (
            <article key={badge.id} className={earned.has(badge.id) ? "badge" : "badge off"}>
              <Icon name={badge.icon} />
              <b>{badge.name}</b>
              <span className="small muted">{badge.text}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="stack">
        <h2>Par</h2>
        <p className="muted">Par-streaken teller når du har trent og limt inn den andres kode samme dag. Koden legger du inn fra forsiden.</p>
        {state.partners.map((partner) => (
          <PartnerRow key={partner.id} name={partner.name} streak={pairStreak(dates, partner.inboundDates, today)} onRename={(name) => onRename(partner.id, name)} />
        ))}
      </section>
    </div>
  );
}

function PartnerRow({ name, streak, onRename }: { name: string; streak: number; onRename: (name: string) => void }) {
  const [value, setValue] = useState(name);
  return (
    <label className="card stack">
      <span className="between"><span>Par-streak</span><strong>{streak}</strong></span>
      <input value={value} onChange={(event) => setValue(event.target.value)} onBlur={() => onRename(value.trim() || name)} />
    </label>
  );
}
