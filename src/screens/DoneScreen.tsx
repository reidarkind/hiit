import type { AppState, Completion } from "../types";
import { BADGES, earnedBadgeIds } from "../lib/badges";
import { countingDates, pairStreak, streakCount } from "../lib/streak";
import { formatDuration } from "../lib/format";
import { Icon } from "../ui/icons";
import { MuscleMap } from "../ui/MuscleMap";

export function DoneScreen({
  state,
  completion,
  beforeBadges,
  previousStreak,
  today,
  onHome,
  onShare,
  onReply,
}: {
  state: AppState;
  completion: Completion;
  beforeBadges: string[];
  previousStreak: number;
  today: string;
  onHome: () => void;
  onShare: () => void;
  onReply: (challengeId: string) => void;
}) {
  const dates = countingDates(state.history);
  const streak = streakCount(dates, state.bridgedDays, today);
  const fresh = earnedBadgeIds(state).filter((id) => !beforeBadges.includes(id));
  const challenge = state.challenges[0];
  const bestPair = Math.max(0, ...state.partners.map((partner) => pairStreak(dates, partner.inboundDates, today)));
  return (
    <div className="stack">
      <p className="eyebrow">Ferdig</p>
      <h1>{completion.sessionName}</h1>
      <p className="serif" style={{ fontSize: "2rem" }}>+{completion.xp} xp</p>
      <p>{formatDuration(completion.seconds)} arbeid{completion.morningBird ? " · morgenfugl" : ""}</p>
      {completion.counts ? <p className="banner good">Streak: {previousStreak} → {streak}.{bestPair > 0 ? ` Par: ${bestPair}.` : ""}</p> : <p className="banner">Under ett minutt teller ikke på streaken. Økten er lagret.</p>}
      {fresh.length > 0 ? (
        <section className="card">
          <h2>Nytt merke</h2>
          {fresh.map((id) => {
            const badge = BADGES.find((item) => item.id === id);
            return badge ? <p key={id}><strong>{badge.name}.</strong> {badge.text}</p> : null;
          })}
        </section>
      ) : null}
      <MuscleMap weights={Object.fromEntries(completion.muscles.map((muscle) => [muscle.id, muscle.weight]))} />
      <button className="btn block" onClick={onShare}><Icon name="share" /> Del gjennomføring</button>
      {challenge ? <button className="btn soft block" onClick={() => onReply(challenge.id)}>Svar på utfordringen</button> : null}
      <button className="btn ghost block" onClick={onHome}>Hjem</button>
    </div>
  );
}
