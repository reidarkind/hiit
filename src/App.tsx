import { useEffect, useState } from "react";
import type { AppState, Block, Completion, Profile, Session } from "./types";
import { exerciseById, mustExercise } from "./data/exercises";
import { findSession } from "./data/sessions";
import { earnedBadgeIds } from "./lib/badges";
import { encodeShare } from "./lib/code";
import { assess } from "./lib/complete";
import { todayIso } from "./lib/dates";
import { expandSession } from "./lib/expand";
import { randomId } from "./lib/id";
import { setWeekday, toggleFavorite } from "./lib/plan";
import { shareMessage } from "./lib/sms";
import { addCompletion, applyDecoded } from "./lib/social";
import { STORAGE_KEY } from "./lib/constants";
import { freshState, load, parseState, save } from "./lib/storage";
import { awardFreezes, countingDates, reconcileFreezes, streakCount } from "./lib/streak";
import { registerPwa } from "./pwa";
import { CodeScreen } from "./screens/CodeScreen";
import { BuilderScreen } from "./screens/BuilderScreen";
import { DoneScreen } from "./screens/DoneScreen";
import { ExerciseScreen } from "./screens/ExerciseScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { PlayerScreen } from "./screens/PlayerScreen";
import { ProgressScreen } from "./screens/ProgressScreen";
import { PlanScreen } from "./screens/PlanScreen";
import { SessionScreen } from "./screens/SessionScreen";
import { SessionsScreen } from "./screens/SessionsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { Icon, type IconName } from "./ui/icons";

type Route =
  | { name: "home" }
  | { name: "sessions" }
  | { name: "session"; id: string }
  | { name: "builder"; id?: string }
  | { name: "library" }
  | { name: "exercise"; id: string }
  | { name: "player"; id: string; rounds: number }
  | { name: "done"; completion: Completion; beforeBadges: string[]; previousStreak: number }
  | { name: "progress" }
  | { name: "settings" }
  | { name: "plan" }
  | { name: "code"; initial: string; back?: "home" | "progress" };

const SHARE_TITLE = {
  D: "Del økten",
  U: "Utfordre",
  G: "Del gjennomføring",
  S: "Svar på utfordringen",
} as const;

type UpdateFn = (reload?: boolean) => Promise<void>;

function boot(): { state: AppState; rescued: string[] } {
  const loaded = load();
  const today = todayIso();
  const state = awardFreezes(reconcileFreezes(loaded, today), today);
  return { state, rescued: state.bridgedDays.filter((day) => !loaded.bridgedDays.includes(day)) };
}

export function App() {
  const [{ state: initial, rescued }] = useState(boot);
  const [state, setState] = useState(initial);
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [now, setNow] = useState(() => new Date());
  const [draft, setDraft] = useState<{ title: string; text: string } | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: "good" | "warn" } | null>(null);
  const [update, setUpdate] = useState<UpdateFn | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const today = todayIso(now);

  useEffect(() => {
    save(state);
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setState((current) => awardFreezes(reconcileFreezes(current, today), today));
  }, [today]);

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace(/^#k=/, ""));
    if (window.location.hash.startsWith("#k=") && hash) setRoute({ name: "code", initial: hash });
    registerPwa((next) => setUpdate(() => next));
  }, []);

  useEffect(() => {
    if (!state.profile.notifications || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const dates = countingDates(state.history);
    if (dates.includes(today) || state.reminderDate === today) return;
    if (streakCount(dates, state.bridgedDays, today) === 0) return;
    const mins = now.getHours() * 60 + now.getMinutes();
    const target = state.profile.reminderHour * 60 + state.profile.reminderMinute;
    const fire = () => {
      if (Notification.permission !== "granted") return;
      new Notification("Streaken ryker ved midnatt", {
        body: "Én økt holder den i live.",
        icon: `${import.meta.env.BASE_URL}ikon-192.png`,
      });
      setState((current) => ({ ...current, reminderDate: todayIso() }));
    };
    if (mins >= target) {
      fire();
      return;
    }
    const timer = window.setTimeout(fire, (target - mins) * 60 * 1000);
    return () => window.clearTimeout(timer);
  }, [state.profile, state.history, state.bridgedDays, state.reminderDate, today, now]);

  function openShare(kind: "D" | "U" | "G" | "S", session: Session, toId?: string) {
    const code = encodeShare(
      {
        kind,
        fromId: state.profile.id,
        toId,
        date: today,
        session: session.builtin ? { type: "builtin", id: session.id } : { type: "custom", blocks: session.blocks },
      },
      (id) => exerciseById(id)?.code ?? "",
    );
    setDraft({
      title: SHARE_TITLE[kind],
      text: shareMessage({ kind, name: state.profile.name, sessionName: session.name, code }),
    });
    setState((current) => ({ ...current, shared: true }));
  }

  function finish(finished: boolean, index: number, elapsed: number, session: Session, rounds: number) {
    const steps = expandSession(session, mustExercise, rounds);
    const beforeBadges = earnedBadgeIds(state);
    const previousStreak = streakCount(countingDates(state.history), state.bridgedDays, today);
    const completion = assess(state, { id: randomId(8), now: new Date(), session, steps, index, finished, elapsed });
    if (completion.seconds < 1) {
      setRoute({ name: "home" });
      return;
    }
    setState((current) => addCompletion(current, completion, today));
    setRoute({ name: "done", completion, beforeBadges, previousStreak });
  }

  const tab = route.name === "sessions" || route.name === "session" || route.name === "builder"
    ? "sessions"
    : route.name === "library" || route.name === "exercise"
      ? "library"
      : route.name === "progress" || route.name === "code"
        ? "progress"
        : "home";

  let screen = null;
  if (route.name === "home") {
    screen = (
      <HomeScreen
        state={state}
        today={today}
        now={now}
        rescued={rescued}
        onDismissIntro={() => setState((current) => ({ ...current, seenIntro: true }))}
        onStart={(id) => setRoute({ name: "player", id, rounds: 1 })}
        onOpen={(id) => setRoute({ name: "session", id })}
        onSettings={() => setRoute({ name: "settings" })}
        onCode={() => setRoute({ name: "code", initial: "", back: "home" })}
        onPlan={() => setRoute({ name: "plan" })}
      />
    );
  } else if (route.name === "sessions") {
    screen = <SessionsScreen state={state} onOpen={(id) => setRoute({ name: "session", id })} onCreate={() => setRoute({ name: "builder" })} />;
  } else if (route.name === "session") {
    const session = findSession(state, route.id);
    screen = session ? (
      <SessionScreen
        session={session}
        favorite={state.favorites.includes(session.id)}
        onBack={() => setRoute({ name: "sessions" })}
        onStart={(rounds) => setRoute({ name: "player", id: session.id, rounds })}
        onShare={() => openShare("D", session)}
        onChallenge={() => openShare("U", session)}
        onFavorite={() => setState((current) => ({ ...current, favorites: toggleFavorite(current.favorites, session.id) }))}
        onEdit={() => setRoute({ name: "builder", id: session.id })}
        onCopy={() => {
          const copy = variant(session);
          setState((current) => ({ ...current, customSessions: [...current.customSessions, copy] }));
          setRoute({ name: "builder", id: copy.id });
        }}
        onDelete={() => {
          setState((current) => ({
            ...current,
            customSessions: current.customSessions.filter((item) => item.id !== session.id),
            receivedSessions: current.receivedSessions.filter((item) => item.id !== session.id),
            favorites: current.favorites.filter((id) => id !== session.id),
            planWeek: current.planWeek.map((id) => (id === session.id ? null : id)),
          }));
          setRoute({ name: "sessions" });
        }}
      />
    ) : <p>Fant ikke økten.</p>;
  } else if (route.name === "builder") {
    const initialSession = route.id ? findSession(state, route.id) ?? null : null;
    screen = (
      <BuilderScreen
        initial={initialSession?.builtin ? null : initialSession}
        onBack={() => setRoute({ name: "sessions" })}
        onSave={(name, blocks) => {
          setState((current) => saveBuilt(current, route.id, name, blocks));
          setRoute({ name: "sessions" });
        }}
      />
    );
  } else if (route.name === "library") {
    screen = <LibraryScreen onOpen={(id) => setRoute({ name: "exercise", id })} />;
  } else if (route.name === "exercise") {
    const exercise = exerciseById(route.id);
    screen = exercise ? <ExerciseScreen exercise={exercise} onBack={() => setRoute({ name: "library" })} /> : <p>Fant ikke øvelsen.</p>;
  } else if (route.name === "player") {
    const session = findSession(state, route.id);
    screen = session ? (
      <PlayerScreen
        title={session.name}
        steps={expandSession(session, mustExercise, route.rounds)}
        profile={state.profile}
        onClose={() => setRoute({ name: "home" })}
        onDone={(finished, index, elapsed) => finish(finished, index, elapsed, session, route.rounds)}
      />
    ) : <p>Fant ikke økten.</p>;
  } else if (route.name === "done") {
    screen = (
      <DoneScreen
        state={state}
        completion={route.completion}
        beforeBadges={route.beforeBadges}
        previousStreak={route.previousStreak}
        today={today}
        onHome={() => setRoute({ name: "home" })}
        onShare={() => {
          const session = findSession(state, route.completion.sessionId);
          if (session) openShare("G", session);
        }}
        onReply={(fromId) => {
          const challenge = state.challenges.find((item) => item.id === fromId || item.fromId === fromId);
          const session = challenge ? findSession(state, challenge.sessionId) : undefined;
          if (!challenge || !session) return;
          openShare("S", session, challenge.fromId);
          setState((current) => ({ ...current, challenges: current.challenges.filter((item) => item.id !== challenge.id) }));
        }}
      />
    );
  } else if (route.name === "progress") {
    screen = (
      <ProgressScreen
        state={state}
        today={today}
        nowMinutes={now.getHours() * 60 + now.getMinutes()}
        onCode={() => setRoute({ name: "code", initial: "", back: "progress" })}
        onRename={(id, name) => setState((current) => ({
          ...current,
          partners: current.partners.map((partner) => (partner.id === id ? { ...partner, name } : partner)),
        }))}
      />
    );
  } else if (route.name === "settings") {
    screen = (
      <SettingsScreen
        state={state}
        onBack={() => setRoute({ name: "home" })}
        onProfile={(profile: Profile) => setState((current) => ({ ...current, profile }))}
        onExport={() => download(JSON.stringify(state, null, 2))}
        onImport={(file) => {
          void file.text().then((raw) => {
            if (!/"version"\s*:\s*1/.test(raw)) {
              setNotice({ text: "Filen kunne ikke leses.", tone: "warn" });
              return;
            }
            setState(awardFreezes(reconcileFreezes(parseState(raw), today), today));
            setNotice({ text: "Filen er lest inn.", tone: "good" });
          });
        }}
        armed={confirmReset}
        onReset={() => {
          if (!confirmReset) {
            setConfirmReset(true);
            return;
          }
          const fresh = bootFresh();
          setState(fresh);
          setConfirmReset(false);
          setRoute({ name: "home" });
        }}
      />
    );
  } else if (route.name === "plan") {
    screen = (
      <PlanScreen
        state={state}
        onBack={() => setRoute({ name: "home" })}
        onSet={(index, sessionId) => setState((current) => ({ ...current, planWeek: setWeekday(current.planWeek, index, sessionId) }))}
      />
    );
  } else {
    screen = (
      <CodeScreen
        initial={route.initial}
        onBack={() => setRoute(route.back === "home" ? { name: "home" } : { name: "progress" })}
        onApply={(decoded) => {
          const applied = applyDecoded(state, decoded, today, new Date().toISOString());
          setState(applied.state);
          setNotice({ text: applied.note, tone: "good" });
          if (applied.sessionId && (decoded.kind === "D" || decoded.kind === "U")) setRoute({ name: "session", id: applied.sessionId });
          else setRoute({ name: "progress" });
        }}
      />
    );
  }

  return (
    <div className="app">
      {route.name === "player" ? screen : (
        <main className="main">
          {notice ? (
            <p className={`banner ${notice.tone} between`}>
              <span>{notice.text}</span>
              <button className="textbtn" onClick={() => setNotice(null)}>Lukk</button>
            </p>
          ) : null}
          {screen}
        </main>
      )}
      {route.name !== "player" ? (
        <nav className="nav">
          <NavButton icon="home" label="Hjem" on={tab === "home"} onClick={() => setRoute({ name: "home" })} />
          <NavButton icon="list" label="Økter" on={tab === "sessions"} onClick={() => setRoute({ name: "sessions" })} />
          <NavButton icon="grid" label="Øvelser" on={tab === "library"} onClick={() => setRoute({ name: "library" })} />
          <NavButton icon="chart" label="Fremgang" on={tab === "progress"} onClick={() => setRoute({ name: "progress" })} />
        </nav>
      ) : null}
      {draft ? <ShareSheet title={draft.title} text={draft.text} onClose={() => setDraft(null)} /> : null}
      {update ? (
        <div className="update card between">
          <span>Ny versjon. Trykk for å laste inn.</span>
          <button className="btn" onClick={() => void update(true)}>Last inn ny versjon</button>
        </div>
      ) : null}
    </div>
  );
}

function NavButton({ icon, label, on, onClick }: { icon: IconName; label: string; on: boolean; onClick: () => void }) {
  return (
    <button className={on ? "on" : ""} onClick={onClick}>
      <Icon name={icon} />
      {label}
    </button>
  );
}

function ShareSheet({ title, text, onClose }: { title: string; text: string; onClose: () => void }) {
  return (
    <div className="sheet">
      <div className="card stack">
        <h2>{title}</h2>
        <textarea readOnly rows={7} value={text} />
        <a className="btn block" href={`sms:?&body=${encodeURIComponent(text)}`}>Åpne meldinger</a>
        <button
          className="btn ghost block"
          onClick={() => {
            if (navigator.share) {
              void navigator.share({ text }).catch(() => navigator.clipboard.writeText(text));
              return;
            }
            void navigator.clipboard.writeText(text);
          }}
        >
          Del eller kopier
        </button>
        <button className="textbtn" onClick={onClose}>Lukk</button>
      </div>
    </div>
  );
}

function variant(session: Session): Session {
  return {
    ...session,
    id: `egen-${randomId(6)}`,
    name: `${session.name} kopi`.slice(0, 40),
    summary: "Egen økt",
    builtin: false,
    blocks: session.blocks.map((block) => ({ ...block })),
  };
}

function saveBuilt(state: AppState, id: string | undefined, name: string, blocks: Block[]): AppState {
  if (id && state.customSessions.some((session) => session.id === id)) {
    return {
      ...state,
      customSessions: state.customSessions.map((session) => (session.id === id ? { ...session, name, blocks, builtin: false } : session)),
    };
  }
  if (id && state.receivedSessions.some((session) => session.id === id)) {
    return {
      ...state,
      receivedSessions: state.receivedSessions.map((session) => (session.id === id ? { ...session, name, blocks, builtin: false } : session)),
    };
  }
  return {
    ...state,
    customSessions: [...state.customSessions, { id: `egen-${randomId(6)}`, name, summary: "Egen økt", about: "Satt sammen av deg.", blocks, builtin: false }],
  };
}

function download(contents: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "hiit.json";
  link.click();
  URL.revokeObjectURL(url);
}

function bootFresh(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  return freshState();
}
