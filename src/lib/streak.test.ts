import { describe, expect, it } from "vitest";
import { freshState } from "./storage";
import { addDays } from "./dates";
import { awardFreezes, bestStreak, morningStreak, pairStreak, reconcileFreezes, streakCount } from "./streak";

function trained(dates: string[]) {
  return dates.map((date) => ({ date, counts: true }));
}

describe("streak", () => {
  const today = "2026-10-25";

  it("teller sammenhengende dager og lar i dag stå åpen", () => {
    expect(streakCount(["2026-10-23", "2026-10-24"], [], today)).toBe(2);
    expect(streakCount(["2026-10-25"], [], today)).toBe(1);
    expect(streakCount(["2026-10-22"], [], today)).toBe(0);
  });

  it("bruker frost på nøyaktig de dagene som mangler", () => {
    const state = { ...freshState("ABCD"), history: trained(["2026-10-23"]), freezeBank: 1, bridgedDays: [] as string[] };
    const bridged = reconcileFreezes(state, today);
    expect(bridged.bridgedDays).toEqual(["2026-10-24"]);
    expect(bridged.freezeBank).toBe(0);
    expect(streakCount(trained(bridged.history.map((item) => item.date)).map((item) => item.date), bridged.bridgedDays, today)).toBe(2);
  });

  it("beholder frosten når hullet er for stort", () => {
    const state = { ...freshState("ABCD"), history: trained(["2026-10-22"]), freezeBank: 1, bridgedDays: [] as string[] };
    expect(reconcileFreezes(state, today)).toBe(state);
  });

  it("bruker to frost på to glemte dager", () => {
    const state = { ...freshState("ABCD"), history: trained(["2026-10-22"]), freezeBank: 2, bridgedDays: [] as string[] };
    const next = reconcileFreezes(state, today);
    expect(next.bridgedDays).toEqual(["2026-10-23", "2026-10-24"]);
    expect(next.freezeBank).toBe(0);
  });

  it("er idempotent", () => {
    const state = { ...freshState("ABCD"), history: trained(["2026-10-23"]), freezeBank: 1, bridgedDays: [] as string[] };
    const once = reconcileFreezes(state, today);
    expect(reconcileFreezes(once, today)).toEqual(once);
  });

  it("deler ut frost på sju dager, maks to i banken", () => {
    const dates = Array.from({ length: 7 }, (_, i) => addDays("2026-10-19", i));
    const state = { ...freshState("ABCD"), history: trained(dates), freezeBank: 1, bridgedDays: [] as string[], freezeAwarded: [] as number[] };
    const next = awardFreezes(state, "2026-10-25");
    expect(next.freezeBank).toBe(2);
    expect(next.freezeAwarded).toEqual([7]);
    expect(awardFreezes({ ...next, freezeBank: 2 }, "2026-10-25").freezeBank).toBe(2);
  });

  it("morgenfugl-streaken lever før grensen og ryker etter", () => {
    expect(morningStreak(["2026-10-24"], today, 8 * 60, 9 * 60)).toBe(1);
    expect(morningStreak(["2026-10-24"], today, 10 * 60, 9 * 60)).toBe(0);
    expect(morningStreak(["2026-10-24", today], today, 12 * 60, 9 * 60)).toBe(2);
  });

  it("par-streak krever egen økt og innkommende kode samme dag", () => {
    expect(pairStreak(["2026-10-24", today], [today], today)).toBe(1);
    expect(pairStreak(["2026-10-23", "2026-10-24"], ["2026-10-23", "2026-10-24"], today)).toBe(2);
  });

  it("beste streak ignorerer hull", () => {
    expect(bestStreak(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-05"], [])).toBe(3);
  });
});
