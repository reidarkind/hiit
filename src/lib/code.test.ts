import { describe, expect, it } from "vitest";
import { exerciseByCode, exerciseById } from "../data/exercises";
import { decodeShare, encodeShare } from "./code";
import { shareMessage } from "./sms";

const codeFor = (id: string) => exerciseById(id)?.code ?? "";
const idFor = (code: string) => exerciseByCode(code)?.id ?? null;

describe("koder", () => {
  it("runder en innebygd utfordring", () => {
    const code = encodeShare({ kind: "U", fromId: "K7NP", session: { type: "builtin", id: "KL7" } }, codeFor);
    expect(code.startsWith("HIIT-U-KL7-K7NP-")).toBe(true);
    const decoded = decodeShare(`hei ${code.toLowerCase()} ferdig`, idFor);
    expect(decoded).toMatchObject({ ok: true, kind: "U", fromId: "K7NP", session: { type: "builtin", id: "KL7" } });
  });

  it("bærer dato på gjennomført og mottaker på svar", () => {
    const done = encodeShare(
      { kind: "G", fromId: "K7NP", date: "2026-10-25", session: { type: "builtin", id: "TABK" } },
      codeFor,
    );
    expect(decodeShare(done, idFor)).toMatchObject({ ok: true, kind: "G", date: "2026-10-25" });
    const reply = encodeShare(
      { kind: "S", fromId: "AB3D", toId: "K7NP", date: "2026-10-25", session: { type: "builtin", id: "KL7" } },
      codeFor,
    );
    expect(decodeShare(reply, idFor)).toMatchObject({ ok: true, kind: "S", fromId: "AB3D", toId: "K7NP", date: "2026-10-25" });
  });

  it("runder en egen økt", () => {
    const blocks = [
      { exerciseId: "knebøy", workSeconds: 30, restSeconds: 10 },
      { exerciseId: "sideplanke", workSeconds: 25, restSeconds: 5, rounds: 2 },
    ];
    const code = encodeShare({ kind: "D", fromId: "K7NP", session: { type: "custom", blocks } }, codeFor);
    const decoded = decodeShare(code, idFor);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok || decoded.session.type !== "custom") throw new Error("forventet egen økt");
    expect(decoded.session.blocks).toEqual([
      { exerciseId: "knebøy", workSeconds: 30, restSeconds: 10 },
      { exerciseId: "sideplanke", workSeconds: 25, restSeconds: 5 },
      { exerciseId: "sideplanke", workSeconds: 25, restSeconds: 5 },
    ]);
  });

  it("avviser en tuklet sjekksum", () => {
    const code = encodeShare({ kind: "U", fromId: "K7NP", session: { type: "builtin", id: "KL7" } }, codeFor);
    const broken = `${code.slice(0, -1)}${code.endsWith("A") ? "B" : "A"}`;
    expect(decodeShare(broken, idFor).ok).toBe(false);
  });

  it("skriver sms med navn, økt og kode", () => {
    const text = shareMessage({ kind: "G", name: "Reidar", sessionName: "Klassisk 7", code: "HIIT-G-KL7-K7NP-AKK-QQ" });
    expect(text).toContain("Reidar har gjennomført «Klassisk 7»");
    expect(text).toContain("HIIT-G-KL7-K7NP-AKK-QQ");
    expect(text).toContain("https://reidarkind.github.io/hiit/");
    expect(text).not.toContain("#k=");
    expect(text).toContain("Legg inn en kode");
  });
});
