import { describe, expect, it } from "vitest";
import { rememberListScroll, scrollForRoute } from "./scroll";

const empty = { sessions: 0, library: 0 };

describe("scroll", () => {
  it("husker hvor listen sto da du åpnet noe", () => {
    const saved = rememberListScroll("sessions", 840, empty);
    expect(saved.sessions).toBe(840);
    expect(rememberListScroll("session", 0, saved).sessions).toBe(840);
    expect(scrollForRoute("sessions", saved)).toBe(840);
  });

  it("husker øvelser og økter hver for seg", () => {
    const saved = rememberListScroll("library", 420, rememberListScroll("sessions", 840, empty));
    expect(scrollForRoute("library", saved)).toBe(420);
    expect(scrollForRoute("sessions", saved)).toBe(840);
  });

  it("starter en øvelse og en økt øverst", () => {
    const saved = rememberListScroll("library", 420, rememberListScroll("sessions", 840, empty));
    expect(scrollForRoute("exercise", saved)).toBe(0);
    expect(scrollForRoute("session", saved)).toBe(0);
    expect(scrollForRoute("home", saved)).toBe(0);
  });
});