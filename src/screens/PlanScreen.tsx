import { useState } from "react";
import type { AppState } from "../types";
import { allSessions, findSession } from "../data/sessions";
import { addDays, weekDates } from "../lib/dates";
import { WEEKDAYS, planDateLabel, planSpan, plannedSessionId } from "../lib/plan";
import { Icon } from "../ui/icons";

export function PlanScreen({
  state,
  today,
  onBack,
  onSetWeekday,
  onSetDate,
}: {
  state: AppState;
  today: string;
  onBack: () => void;
  onSetWeekday: (index: number, sessionId: string | null) => void;
  onSetDate: (iso: string, sessionId: string | null | undefined) => void;
}) {
  const [cursor, setCursor] = useState(today);
  const days = weekDates(cursor);
  const sessions = allSessions(state);
  const thisWeek = weekDates(today)[0] === days[0];
  return (
    <div className="stack">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="Tilbake"><Icon name="back" /></button>
        <h1>Ukeplan</h1>
        <span />
      </div>
      <p>En dato kan ha sin egen økt. Den gjelder bare den dagen og vinner over ukedagen. Uten det brukes uken under, uke etter uke. Dagens økt ligger klar på forsiden.</p>

      <section className="stack">
        <div className="between">
          <h2>Kalender</h2>
          {thisWeek ? null : <button className="textbtn" onClick={() => setCursor(today)}>Denne uken</button>}
        </div>
        <div className="between">
          <button className="iconbtn" aria-label="Forrige uke" onClick={() => setCursor(addDays(days[0], -7))}><Icon name="back" /></button>
          <strong>{planSpan(days[0], days[6])}</strong>
          <button className="iconbtn" aria-label="Neste uke" onClick={() => setCursor(addDays(days[0], 7))}><Icon name="skip" /></button>
        </div>
        {days.map((day) => {
          const hasOwn = Object.hasOwn(state.planDates, day);
          const own = hasOwn ? state.planDates[day] : undefined;
          const value = own === undefined ? "" : own ?? "hvile";
          const fallbackId = plannedSessionId(state.planWeek, {}, day);
          const fallback = fallbackId ? findSession(state, fallbackId)?.name ?? "Hvile" : "Hvile";
          return (
            <label key={day} className="field">
              <span>{planDateLabel(day)}{day === today ? " · i dag" : ""}</span>
              <select value={value} onChange={(event) => onSetDate(day, event.target.value === "" ? undefined : event.target.value === "hvile" ? null : event.target.value)}>
                <option value="">Som uken · {fallback}</option>
                <option value="hvile">Hviledag</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>{session.name}</option>
                ))}
              </select>
            </label>
          );
        })}
      </section>

      <section className="stack">
        <h2>Hver uke</h2>
        {WEEKDAYS.map((name, index) => (
          <label key={name} className="field">
            <span>{name}</span>
            <select
              value={state.planWeek[index] ?? ""}
              onChange={(event) => onSetWeekday(index, event.target.value || null)}
            >
              <option value="">Hviledag</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>{session.name}</option>
              ))}
            </select>
          </label>
        ))}
      </section>
    </div>
  );
}
