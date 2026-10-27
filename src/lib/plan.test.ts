import { describe, expect, it } from "vitest";
import { plannedSessionId, setWeekday, toggleFavorite, weekdayIndex } from "./plan";

describe("ukeplan", () => {
  it("mandag er dag null og søndag er dag seks", () => {
    expect(weekdayIndex("2026-10-26")).toBe(0);
    expect(weekdayIndex("2026-11-01")).toBe(6);
  });

  it("henter økten som ligger på dagens ukedag", () => {
    const week = setWeekday([], 0, "KL7");
    expect(plannedSessionId(week, "2026-10-26")).toBe("KL7");
    expect(plannedSessionId(week, "2026-10-27")).toBeNull();
  });

  it("legger favoritter foran og tar dem vekk igjen", () => {
    expect(toggleFavorite(["KL7"], "LUFT")).toEqual(["LUFT", "KL7"]);
    expect(toggleFavorite(["LUFT", "KL7"], "LUFT")).toEqual(["KL7"]);
  });
});
