import { describe, expect, it } from "vitest";
import type { Pt } from "../types";
import { poses } from "./sticks";

function same(a: Pt, b: Pt) {
  expect(a).toEqual(b);
}

function gap(a: Pt, b: Pt, c: Pt): number {
  const ab = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const bc = Math.hypot(c[0] - b[0], c[1] - b[1]);
  const ac = Math.hypot(c[0] - a[0], c[1] - a[1]);
  return ab + bc - ac;
}

describe("figurer", () => {
  it("utfall og bakoverutfall holder standbenet i gulvet", () => {
    same(poses.lunge.a.ankle2, poses.lunge.b.ankle2);
    expect(poses.lunge.b.ankle[0]).toBeGreaterThan(poses.lunge.a.ankle[0] + 30);
    same(poses.backLunge.a.ankle, poses.backLunge.b.ankle);
    expect(poses.backLunge.b.ankle2[0]).toBeLessThan(poses.backLunge.a.ankle2[0] - 30);
    same(poses.sideLunge.a.ankle2, poses.sideLunge.b.ankle2);
    same(poses.hipOpen.a.ankle, poses.hipOpen.b.ankle);
    same(poses.hipOpen.a.ankle2, poses.hipOpen.b.ankle2);
  });

  it("seteløft holder armer og føtter i gulvet", () => {
    for (const key of ["ankle", "ankle2", "elbow", "wrist", "elbow2", "wrist2"] as const) {
      same(poses.bridge.a[key], poses.bridge.b[key]);
    }
    for (const key of ["ankle2", "elbow", "wrist", "elbow2", "wrist2"] as const) {
      same(poses.singleBridge.a[key], poses.singleBridge.b[key]);
    }
    expect(poses.singleBridge.b.ankle[1]).toBeLessThan(120);
    expect(poses.bridge.b.hip[1]).toBeLessThan(poses.bridge.a.hip[1] - 30);
  });

  it("sideplanken hviler på underarmen, med den andre armen opp", () => {
    const up = poses.sideplank.b;
    expect(up.elbow2[1]).toBe(214);
    expect(up.wrist2[1]).toBe(214);
    expect(up.wrist[1]).toBeLessThan(up.shoulder[1]);
    expect(Math.abs(up.ankle[0] - up.ankle2[0])).toBeLessThan(16);
    expect(up.hip[1]).toBeLessThan(poses.sideplank.a.hip[1] - 10);
  });

  it("supermann løfter fra mageliggende, og dødbillen strekker benet", () => {
    expect(poses.superman.a.hip[1]).toBeGreaterThan(200);
    expect(poses.superman.b.hip[1]).toBeGreaterThan(200);
    expect(poses.superman.b.head[1]).toBeLessThan(poses.superman.a.head[1] - 20);
    expect(gap(poses.deadbug.b.hip, poses.deadbug.b.knee, poses.deadbug.b.ankle)).toBeLessThan(6);
    expect(poses.deadbug.b.ankle[1]).toBeGreaterThan(200);
  });

  it("krøllen løfter skuldrene og lar hofta ligge", () => {
    same(poses.crunch.a.hip, poses.crunch.b.hip);
    expect(poses.crunch.b.shoulder[1]).toBeLessThan(poses.crunch.a.shoulder[1] - 20);
  });

  it("smal armheving har hendene tettere, og de blir i gulvet", () => {
    const wide = Math.abs(poses.pushup.b.wrist[0] - poses.pushup.b.wrist2[0]);
    const narrow = Math.abs(poses.narrowPush.b.wrist[0] - poses.narrowPush.b.wrist2[0]);
    expect(narrow).toBeLessThan(wide);
    same(poses.pushup.a.wrist, poses.pushup.b.wrist);
    same(poses.pushup.a.wrist2, poses.pushup.b.wrist2);
    same(poses.narrowPush.a.wrist, poses.narrowPush.b.wrist);
    same(poses.narrowPush.a.wrist2, poses.narrowPush.b.wrist2);
  });

  it("rotasjonen skjer på strak arm, og den andre armen går opp", () => {
    same(poses.rotate.a.wrist, poses.rotate.b.wrist);
    expect(Math.abs(poses.rotate.b.shoulder[0] - poses.rotate.b.wrist[0])).toBeLessThan(4);
    expect(gap(poses.rotate.b.shoulder, poses.rotate.b.elbow, poses.rotate.b.wrist)).toBeLessThan(4);
    expect(poses.rotate.b.wrist2[1]).toBeLessThan(poses.rotate.b.shoulder[1]);
  });

  it("burpee og tåhev viser hopp og hælløft, ikke en svevende kropp", () => {
    expect(poses.burpee.b.wrist[1]).toBeLessThan(poses.burpee.b.head[1]);
    expect(poses.burpee.b.ankle[1]).toBeLessThan(190);
    expect(poses.burpee.a.ankle[1]).toBe(214);
    same(poses.calf.a.toe, poses.calf.b.toe);
    same(poses.calf.a.toe2, poses.calf.b.toe2);
    expect(poses.calf.b.ankle[1]).toBeLessThan(poses.calf.a.ankle[1] - 10);
    expect(poses.jumpSquat.b.ankle[1]).toBeLessThan(190);
    expect(poses.jumpSquat.b.wrist[1]).toBeLessThan(poses.jumpSquat.b.head[1]);
    expect(poses.burpee.b.toe[1]).toBeGreaterThan(poses.burpee.b.ankle[1]);
    expect(poses.burpee.b.toe[1]).toBeLessThan(200);
  });

  it("eselsspark bøyer kneet, og fuglehund bytter motstående lem", () => {
    for (const key of ["wrist", "wrist2", "knee2", "ankle2"] as const) {
      same(poses.kick.a[key], poses.kick.b[key]);
    }
    expect(poses.kick.b.knee[1]).toBeLessThan(poses.kick.b.hip[1]);
    expect(poses.kick.b.ankle[1]).toBeLessThan(poses.kick.b.knee[1]);
    same(poses.bird.a.ankle, poses.bird.b.ankle);
    same(poses.bird.a.wrist2, poses.bird.b.wrist2);
    expect(poses.bird.b.wrist[0]).toBeGreaterThan(poses.bird.a.wrist[0] + 20);
    expect(poses.bird.b.ankle2[1]).toBeLessThan(180);
  });

  it("høye knær når hofta, og marsj lar leggen henge", () => {
    const lifted = poses.highknees.a.knee[1] < poses.highknees.a.hip[1] ? poses.highknees.a : poses.highknees.b;
    expect(lifted.knee[1]).toBeLessThan(lifted.hip[1]);
    expect(lifted.ankle[1]).toBeGreaterThan(lifted.knee[1] + 20);
    expect(poses.march.a.ankle[1]).toBeGreaterThan(poses.march.a.knee[1] + 20);
    expect(poses.march.b.ankle2[1]).toBeGreaterThan(poses.march.b.knee2[1] + 20);
  });

  it("vekt og strikk starter i grepet øvelsen beskriver", () => {
    const together = Math.abs(poses.band.a.wrist[0] - poses.band.a.wrist2[0]);
    const apart = Math.abs(poses.band.b.wrist[0] - poses.band.b.wrist2[0]);
    expect(together).toBeLessThan(30);
    expect(apart).toBeGreaterThan(together + 40);
    expect(poses.press.a.wrist[1]).toBeGreaterThan(poses.press.b.wrist[1] + 30);
    expect(Math.abs(poses.goblet.a.wrist[1] - poses.goblet.a.shoulder[1])).toBeLessThan(16);
    expect(Math.abs(poses.goblet.b.wrist[1] - poses.goblet.b.shoulder[1])).toBeLessThan(20);
    same(poses.ballBridge.a.ankle, poses.ballBridge.b.ankle);
    same(poses.ballBridge.a.toe, poses.ballBridge.b.toe);
    expect(poses.ballBridge.b.toe[1]).toBeLessThan(poses.ballBridge.b.ankle[1]);
    same(poses.ballPlank.a.wrist, poses.ballPlank.b.wrist);
    same(poses.ballTuck.a.ankle, poses.ballTuck.b.ankle);
    expect(poses.hipOpen.b.wrist[1]).toBe(214);
    const bentAnkle = poses.bicycle.b.knee[1] < poses.bicycle.b.knee2[1] ? poses.bicycle.b.ankle : poses.bicycle.b.ankle2;
    const bentKnee = poses.bicycle.b.knee[1] < poses.bicycle.b.knee2[1] ? poses.bicycle.b.knee : poses.bicycle.b.knee2;
    expect(bentAnkle[1]).toBeGreaterThan(bentKnee[1] + 15);
    expect(poses.ballTuck.b.knee[1]).toBeLessThan(poses.ballTuck.b.hip[1]);
    expect(poses.ballTuck.b.hip[1]).toBeGreaterThan(poses.ballTuck.b.shoulder[1] - 12);
  });
});
