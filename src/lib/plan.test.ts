import { describe, expect, it } from "vitest";
import { forgetSessionDates, planDateLabel, planSpan, plannedSessionId, setPlanDate, setWeekday, toggleFavorite, weekdayIndex } from "./plan";
import { freshState, parseState } from "./storage";

describe("ukeplan", () => {
  it("mandag er dag null og søndag er dag seks", () => {
    expect(weekdayIndex("2026-10-26")).toBe(0);
    expect(weekdayIndex("2026-11-01")).toBe(6);
  });

  it("henter økten som ligger på dagens ukedag", () => {
    const week = setWeekday([], 0, "KL7");
    expect(plannedSessionId(week, {}, "2026-10-26")).toBe("KL7");
    expect(plannedSessionId(week, {}, "2026-10-27")).toBeNull();
  });

  it("lar en dato vinne over ukedagen", () => {
    const week = setWeekday([], 1, "KL7");
    const dated = setPlanDate({}, "2026-10-27", "LUFT");
    expect(plannedSessionId(week, dated, "2026-10-27")).toBe("LUFT");
    expect(plannedSessionId(week, setPlanDate(dated, "2026-10-27", null), "2026-10-27")).toBeNull();
    expect(plannedSessionId(week, setPlanDate(dated, "2026-10-27", undefined), "2026-10-27")).toBe("KL7");
  });

  it("glemmer en slettet økt på enkeltdatoer", () => {
    const dated = setPlanDate(setPlanDate({}, "2026-10-28", "LUFT"), "2026-10-29", "KL7");
    expect(forgetSessionDates(dated, "LUFT")).toEqual({ "2026-10-29": "KL7" });
  });

  it("navngir en dag i kalenderen", () => {
    expect(planDateLabel("2026-10-27")).toBe("Tirsdag 27. okt");
    expect(planSpan("2026-10-26", "2026-11-01")).toBe("26. okt – 1. nov");
  });

  it("beholder datoøkter og kaster ugyldige", () => {
    const state = freshState("ABCD");
    state.planDates = { "2026-10-28": "LUFT", "2026-10-29": null, tull: "KL7" };
    const parsed = parseState(JSON.stringify(state));
    expect(parsed.planDates).toEqual({ "2026-10-28": "LUFT", "2026-10-29": null });
  });

  it("legger favoritter foran og tar dem vekk igjen", () => {
    expect(toggleFavorite(["KL7"], "LUFT")).toEqual(["LUFT", "KL7"]);
    expect(toggleFavorite(["LUFT", "KL7"], "LUFT")).toEqual(["KL7"]);
  });
});
