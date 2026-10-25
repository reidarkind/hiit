import { describe, expect, it } from "vitest";
import { coverageOf, weightsFrom } from "./coverage";
import { suggestId } from "./suggest";
import { formatClock, formatDuration } from "./format";
import { levelFor, xpFor } from "./level";
import { earnedBadgeIds } from "./badges";
import { freshState } from "./storage";
import { parseState } from "./storage";

describe("dekning, nivå og merker", () => {
  it("sier fra om hull", () => {
    const weights = weightsFrom([{ primary: ["mage"], secondary: ["skraa"] }]);
    const result = coverageOf(weights);
    expect(result.covers).toContain("Kjerne");
    expect(result.gaps).toContain("Bein");
  });

  it("foreslår morgenøkt tidlig og klassisk senere", () => {
    expect(suggestId({ trainedToday: false, hour: 7, dayIndex: 3 })).toBe("MRGN");
    expect(suggestId({ trainedToday: false, hour: 15, dayIndex: 3 })).toBe("KL7");
    expect(suggestId({ trainedToday: true, hour: 15, dayIndex: 0 })).toBe("STAA");
  });

  it("formaterer klokke og varighet", () => {
    expect(formatClock(30)).toBe("0:30");
    expect(formatClock(75)).toBe("1:15");
    expect(formatDuration(540)).toBe("9 min");
    expect(formatDuration(2100)).toBe("35 min");
  });

  it("regner xp og nivå", () => {
    expect(xpFor(240, false, 0)).toBe(32);
    expect(xpFor(240, true, 3)).toBe(50);
    expect(levelFor(0).name).toBe("Første steg");
    expect(levelFor(120).name).toBe("Vane");
  });

  it("låser opp første økt", () => {
    const state = freshState("ABCD");
    state.history.push({
      id: "1",
      at: "2026-10-25T08:00:00.000Z",
      date: "2026-10-25",
      sessionId: "KL7",
      sessionName: "Klassisk 7",
      seconds: 540,
      morningBird: true,
      counts: true,
      xp: 40,
      exerciseIds: ["sideplanke", "knebøy"],
      muscles: [
        { id: "mage", weight: 4 },
        { id: "sete", weight: 4 },
        { id: "fremside-lar", weight: 4 },
        { id: "bryst", weight: 4 },
        { id: "rygg-midten", weight: 2 },
      ],
    });
    const badges = earnedBadgeIds(state);
    expect(badges).toContain("forste");
    expect(badges).toContain("syv");
    expect(badges).toContain("sider");
    expect(badges).toContain("bred");
  });

  it("tåler ødelagt lagring", () => {
    expect(parseState("ikke json", () => "ABCD").profile.id).toBe("ABCD");
    const raw = JSON.stringify(freshState("WXYZ"));
    expect(parseState(raw).profile.id).toBe("WXYZ");
  });
});
