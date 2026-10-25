import type { AppState } from "../types";
import { builtinById } from "../data/sessions";
import { mustExercise } from "../data/exercises";
import { greeting, weekDates, weekdayLetters } from "../lib/dates";
import { formatDuration } from "../lib/format";
import { expandSession, stepSeconds } from "../lib/expand";
import { levelFor, totalXp } from "../lib/level";
import { countingDates, morningStreak, riskFromHour, streakCount } from "../lib/streak";
import { suggestId } from "../lib/suggest";
import { daysFromEpoch } from "../lib/dates";
import { EPOCH, MORNING_BIRD_MINUTES } from "../lib/constants";
import { Icon } from "../ui/icons";

export function HomeScreen({
  state,
  today,
  now,
  rescued,
  onDismissIntro,
  onStart,
  onOpen,
  onSettings,
  onCode,
}: {
  state: AppState;
  today: string;
  now: Date;
  rescued: string[];
  onDismissIntro: () => void;
  onStart: (id: string) => void;
  onOpen: (id: string) => void;
  onSettings: () => void;
  onCode: () => void;
}) {
  const dates = countingDates(state.history);
  const trainedToday = dates.includes(today);
  const streak = streakCount(dates, state.bridgedDays, today);
  const mornings = state.history.filter((item) => item.counts && item.morningBird).map((item) => item.date);
  const cutoff = MORNING_BIRD_MINUTES;
  const bird = morningStreak([...new Set(mornings)], today, now.getHours() * 60 + now.getMinutes(), cutoff);
  const level = levelFor(totalXp(state.history));
  const suggestion = builtinById(suggestId({ trainedToday, hour: now.getHours(), dayIndex: daysFromEpoch(today, EPOCH) }))!;
  const seconds = stepSeconds(expandSession(suggestion, mustExercise));
  const week = weekDates(today);
  const letters = weekdayLetters();
  const risk = !trainedToday && streak > 0 && now.getHours() >= riskFromHour(state.profile.reminderHour);
  const weekCount = week.filter((day) => dates.includes(day)).length;
  return (
    <div className="stack">
      <section className="hero">
        <div className="between">
          <p className="eyebrow">{greeting(now.getHours())}</p>
          <button className="iconbtn" style={{ background: "transparent", color: "white", borderColor: "transparent" }} onClick={onSettings} aria-label="Innstillinger">
            <Icon name="sliders" />
          </button>
        </div>
        <h1 className="wordmark" aria-label="Herlig iblant intensiv trening">
          <span>H<small>erlig</small></span>
          <span>I<small>blant</small></span>
          <span>I<small>ntensiv</small></span>
          <span>T<small>rening</small></span>
        </h1>
        <div className="stats">
          <div className="stat"><span className="row"><Icon name="flame" size={16} /> streak</span><b>{streak}</b></div>
          <div className="stat"><span className="row"><Icon name="bird" size={16} /> morgen</span><b>{bird}</b></div>
          <div className="stat"><span className="row"><Icon name="snow" size={16} /> frost</span><b>{state.freezeBank}</b></div>
        </div>
        <div className="xp">
          <div className="between"><span>{level.name}</span><span>{level.nextName ? `${level.into} / ${level.span} xp` : "Topp"}</span></div>
          <div className="track"><span style={{ width: `${level.span ? Math.min(100, (level.into / level.span) * 100) : 100}%` }} /></div>
        </div>
      </section>

      {!state.seenIntro ? (
        <section className="card stack">
          <h2>Herlig iblant intensiv trening</h2>
          <p>Det begynte som harde intervaller, og så ballet det på seg. En luftetur teller. Det gjør 4×4 også. Alt blir liggende på telefonen.</p>
          <button className="btn" onClick={onDismissIntro}>Kom i gang</button>
        </section>
      ) : null}

      {rescued.length > 0 ? <p className="banner good">Frosten dekket {rescued.length === 1 ? "en glemt dag" : `${rescued.length} glemte dager`}. Streaken lever.</p> : null}
      {risk ? (
        <p className="banner warn">Streaken ryker ved midnatt. Én økt holder den i live.{state.freezeBank > 0 ? " Frosten redder en glemt dag, ikke denne." : ""}</p>
      ) : null}
      {state.challenges[0] ? (
        <button className="card" onClick={() => onOpen(state.challenges[0].sessionId)}>
          <p className="eyebrow">Utfordring</p>
          <h2>{state.challenges[0].sessionName}</h2>
          <p className="muted small">Fra {state.partners.find((partner) => partner.id === state.challenges[0].fromId)?.name ?? state.challenges[0].fromId}</p>
        </button>
      ) : null}

      <section className="card stack">
        <p className="eyebrow">{trainedToday ? "En økt til" : "Foreslått"}</p>
        <div className="between">
          <h2>{suggestion.name}</h2>
          <span className="pill">{formatDuration(seconds)}</span>
        </div>
        <p className="muted">{suggestion.summary}</p>
        <button className="btn block" onClick={() => onStart(suggestion.id)}><Icon name="play" /> Start</button>
        <button className="textbtn" onClick={() => onOpen(suggestion.id)}>Se økten</button>
      </section>

      <section className="card stack">
        <div className="between">
          <h2>Denne uken</h2>
          <span className="muted small">{weekCount} / {state.profile.weeklyGoal}</span>
        </div>
        <div className="week">
          {week.map((day, index) => (
            <div key={day}>
              <i className={`${dates.includes(day) ? "on" : ""} ${state.bridgedDays.includes(day) ? "freeze" : ""} ${day === today ? "today" : ""}`}>{dates.includes(day) ? "●" : letters[index]}</i>
            </div>
          ))}
        </div>
        <button className="textbtn" onClick={onCode}>Legg inn en kode</button>
      </section>
    </div>
  );
}
