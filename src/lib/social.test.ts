import { describe, expect, it } from "vitest";
import { exerciseByCode, exerciseById } from "../data/exercises";
import { assess } from "./complete";
import { decodeShare, encodeShare } from "./code";
import { xpFor } from "./level";
import { freshState } from "./storage";
import { addCompletion, applyDecoded } from "./social";
import { builtinById } from "../data/sessions";
import { expandSession } from "./expand";
import { mustExercise } from "../data/exercises";

const codeFor = (id: string) => exerciseById(id)?.code ?? "";
const idFor = (code: string) => exerciseByCode(code)?.id ?? null;

describe("sosialt og fullføring", () => {
  it("lagrer en utfordring og en egen økt", () => {
    const state = freshState("ABCD");
    const code = encodeShare(
      {
        kind: "U",
        fromId: "K7NP",
        session: { type: "custom", blocks: [{ exerciseId: "knebøy", workSeconds: 30, restSeconds: 10 }] },
      },
      codeFor,
    );
    const decoded = decodeShare(code, idFor);
    const applied = applyDecoded(state, decoded, "2026-10-25", "2026-10-25T18:00:00.000Z");
    expect(applied.note).toContain("Utfordring");
    expect(applied.state.challenges).toHaveLength(1);
    expect(applied.state.receivedSessions).toHaveLength(1);
    expect(applied.state.partners[0]?.id).toBe("K7NP");
  });

  it("par-dagen krever innkommende kode", () => {
    const state = freshState("ABCD");
    const code = encodeShare(
      { kind: "G", fromId: "K7NP", date: "2026-10-25", session: { type: "builtin", id: "KL7" } },
      codeFor,
    );
    const applied = applyDecoded(state, decodeShare(code, idFor), "2026-10-25", "2026-10-25T18:00:00.000Z");
    expect(applied.state.partners[0]?.inboundDates).toEqual(["2026-10-25"]);
  });

  it("avviser fremtidig dato og egen kode", () => {
    const state = freshState("K7NP");
    const future = encodeShare(
      { kind: "G", fromId: "ABCD", date: "2026-10-26", session: { type: "builtin", id: "KL7" } },
      codeFor,
    );
    expect(applyDecoded(state, decodeShare(future, idFor), "2026-10-25", "2026-10-25T18:00:00.000Z").note).toContain("fram");
    const own = encodeShare({ kind: "D", fromId: "K7NP", session: { type: "builtin", id: "KL7" } }, codeFor);
    expect(applyDecoded(state, decodeShare(own, idFor), "2026-10-25", "2026-10-25T18:00:00.000Z").note).toContain("deg selv");
  });

  it("gir xp og teller økten når den fullføres", () => {
    const state = freshState("ABCD");
    const session = builtinById("TABK")!;
    const steps = expandSession(session, mustExercise);
    const now = new Date(2026, 9, 25, 8, 30);
    const completion = assess(state, { id: "c1", now, session, steps, index: steps.length, finished: true, elapsed: 0 });
    expect(completion.counts).toBe(true);
    expect(completion.morningBird).toBe(true);
    expect(completion.xp).toBe(xpFor(completion.seconds, true, 1));
    const next = addCompletion(state, completion, "2026-10-25");
    expect(next.history).toHaveLength(1);
  });

  it("en avbrutt øvelse under ett minutt teller ikke", () => {
    const state = freshState("ABCD");
    const session = builtinById("KL7")!;
    const steps = expandSession(session, mustExercise);
    const completion = assess(state, {
      id: "c2",
      now: new Date(2026, 9, 25, 12, 0),
      session,
      steps,
      index: 1,
      finished: false,
      elapsed: 10,
    });
    expect(completion.counts).toBe(false);
  });
});
