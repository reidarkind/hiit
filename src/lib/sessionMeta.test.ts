import { describe, expect, it } from "vitest";
import { mustExercise } from "../data/exercises";
import { builtinById } from "../data/sessions";
import { expandSession, stepSeconds } from "./expand";
import { lengthBand, sessionGears, sessionIntensity, sessionKind } from "./sessionMeta";

describe("øktfilter", () => {
  it("skiller kort, vanlig og lang", () => {
    expect(lengthBand(9 * 60)).toBe("kort");
    expect(lengthBand(12 * 60)).toBe("vanlig");
    expect(lengthBand(25 * 60)).toBe("lang");
  });

  it("legger kjente økter i rett hylle", () => {
    const get = mustExercise;
    expect(sessionKind(builtinById("KJER")!, get)).toBe("kjerne");
    expect(sessionKind(builtinById("KL7")!, get)).toBe("sirkel");
    expect(sessionKind(builtinById("NX44")!, get)).toBe("ute");
    expect(sessionKind(builtinById("LUFT")!, get)).toBe("ute");
    expect(sessionIntensity(builtinById("TABK")!, get)).toBe("krevende");
    expect(sessionIntensity(builtinById("LUFT")!, get)).toBe("lett");
    expect(sessionIntensity(builtinById("SAMT")!, get)).toBe("lett");
    expect(sessionIntensity(builtinById("NX14")!, get)).toBe("krevende");
    expect(lengthBand(stepSeconds(expandSession(builtinById("NX44")!, get)))).toBe("lang");
    expect(lengthBand(stepSeconds(expandSession(builtinById("KL7")!, get)))).toBe("kort");
    expect(sessionGears(builtinById("KL7")!, get)).toEqual([]);
    expect(sessionGears(builtinById("STOL")!, get)).toEqual(["stol"]);
    expect(sessionGears(builtinById("VEKT")!, get)).toEqual(["vekter"]);
    expect(sessionGears(builtinById("BALL")!, get)).toEqual(["ball"]);
    expect(sessionGears(builtinById("STRK")!, get)).toEqual(["strikk"]);
  });
});
