import { describe, expect, it } from "vitest";
import { addDays, dateFromDays, daysBetween, daysFromEpoch, greeting, mondayOf, todayIso } from "./dates";
import { EPOCH } from "./constants";

describe("datoer", () => {
  it("legger til dager uten å skli på tidssonen", () => {
    expect(addDays("2026-10-25", 1)).toBe("2026-10-26");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("finner dager strengt mellom", () => {
    expect(daysBetween("2026-10-23", "2026-10-26")).toEqual(["2026-10-24", "2026-10-25"]);
  });

  it("runder epoken", () => {
    expect(daysFromEpoch(EPOCH, EPOCH)).toBe(0);
    expect(dateFromDays(0, EPOCH)).toBe(EPOCH);
    expect(dateFromDays(297, EPOCH)).toBe("2026-10-25");
    expect(daysFromEpoch("2026-10-25", EPOCH)).toBe(297);
  });

  it("mandag er ukestart", () => {
    expect(mondayOf("2026-10-25")).toBe("2026-10-19");
    expect(mondayOf("2026-10-19")).toBe("2026-10-19");
  });

  it("hilser etter klokken", () => {
    expect(greeting(7)).toBe("God morgen");
    expect(greeting(12)).toBe("God dag");
    expect(greeting(21)).toBe("God kveld");
  });

  it("todayIso bruker lokal kalender", () => {
    expect(todayIso(new Date(2026, 9, 25, 23, 30))).toBe("2026-10-25");
  });
});
