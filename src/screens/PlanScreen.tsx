import type { AppState } from "../types";
import { allSessions } from "../data/sessions";
import { WEEKDAYS } from "../lib/plan";
import { Icon } from "../ui/icons";

export function PlanScreen({
  state,
  onBack,
  onSet,
}: {
  state: AppState;
  onBack: () => void;
  onSet: (index: number, sessionId: string | null) => void;
}) {
  const sessions = allSessions(state);
  return (
    <div className="stack">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="Tilbake"><Icon name="back" /></button>
        <h1>Ukeplan</h1>
        <span />
      </div>
      <p>Velg en økt for hver dag. Den samme uken gjelder til du endrer den, og dagens økt ligger klar på forsiden.</p>
      {WEEKDAYS.map((name, index) => (
        <label key={name} className="field">
          <span>{name}</span>
          <select
            value={state.planWeek[index] ?? ""}
            onChange={(event) => onSet(index, event.target.value || null)}
          >
            <option value="">Hviledag</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>{session.name}</option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
