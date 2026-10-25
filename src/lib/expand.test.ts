import { describe, expect, it } from "vitest";
import { exerciseById, exercises, mustExercise } from "../data/exercises";
import { builtinById, builtinSessions } from "../data/sessions";
import { expandSession, stepSeconds, workSteps } from "./expand";

describe("utvidelse av økt", () => {
  it("tar begge sider på ensidige øvelser og hviler mellom", () => {
    const steps = expandSession(
      {
        id: "t",
        name: "t",
        summary: "",
        about: "",
        builtin: false,
        blocks: [{ exerciseId: "sideplanke", workSeconds: 30, restSeconds: 10 }],
      },
      mustExercise,
    );
    expect(steps.map((step) => (step.kind === "work" ? step.side : step.title))).toEqual(["venstre", "Bytt side", "hoyre"]);
    expect(stepSeconds(steps)).toBe(65);
  });

  it("bytter halvveis på annenhver, uten ekstra side", () => {
    const steps = expandSession(
      {
        id: "t",
        name: "t",
        summary: "",
        about: "",
        builtin: false,
        blocks: [
          { exerciseId: "utfall", workSeconds: 30, restSeconds: 10 },
          { exerciseId: "knebøy", workSeconds: 20, restSeconds: 0 },
        ],
      },
      mustExercise,
    );
    const works = workSteps(steps);
    expect(works).toHaveLength(2);
    expect(works[0]?.switchHalf).toBe(true);
    expect(works[1]?.switchHalf).toBe(false);
    expect(steps.filter((step) => step.kind === "rest")).toHaveLength(1);
  });

  it("legger åtte tabata-runder uten hvile etter siste", () => {
    const session = builtinById("TABK");
    expect(session).toBeTruthy();
    const steps = expandSession(session!, mustExercise);
    expect(workSteps(steps)).toHaveLength(8);
    expect(steps.filter((step) => step.kind === "rest")).toHaveLength(7);
    expect(stepSeconds(steps)).toBe(230);
  });

  it("klassisk 7 blir lengre enn sju minutter fordi begge sider tas", () => {
    const steps = expandSession(builtinById("KL7")!, mustExercise);
    const sides = workSteps(steps).filter((step) => step.exerciseId === "sideplanke");
    expect(sides.map((step) => step.side)).toEqual(["venstre", "hoyre"]);
    expect(stepSeconds(steps)).toBe(540);
  });

  it("4×4 er 35 minutter uten ekstra hvile", () => {
    const steps = expandSession(builtinById("NX44")!, mustExercise);
    expect(stepSeconds(steps)).toBe(2100);
    expect(workSteps(steps).filter((step) => step.exerciseId === "drag")).toHaveLength(4);
  });

  it("kjeder kondisjon når hvilen er null", () => {
    const steps = expandSession(builtinById("GAJO")!, mustExercise);
    expect(steps.every((step) => step.kind === "work")).toBe(true);
  });

  it("setter inn ny runde mellom hele gjennomløp", () => {
    const steps = expandSession(builtinById("TABM")!, mustExercise, 2);
    expect(steps.some((step) => step.kind === "rest" && step.title === "Ny runde")).toBe(true);
  });

  it("alle innebygde økter peker på øvelser som finnes", () => {
    for (const session of builtinSessions) {
      for (const block of session.blocks) expect(exerciseById(block.exerciseId), `${session.id} ${block.exerciseId}`).toBeTruthy();
      expect(stepSeconds(expandSession(session, mustExercise))).toBeGreaterThan(0);
    }
    expect(new Set(exercises.map((exercise) => exercise.code)).size).toBe(exercises.length);
    expect(exercises.every((exercise) => /^[A-HJ-NP-Z]{2}$/.test(exercise.code))).toBe(true);
  });
});
