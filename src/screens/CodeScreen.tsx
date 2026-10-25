import { useState } from "react";
import { exerciseByCode } from "../data/exercises";
import { builtinById } from "../data/sessions";
import { decodeShare } from "../lib/code";
import type { Decoded } from "../lib/code";
import { Icon } from "../ui/icons";

export function CodeScreen({
  initial,
  onBack,
  onApply,
}: {
  initial: string;
  onBack: () => void;
  onApply: (decoded: Extract<Decoded, { ok: true }>) => void;
}) {
  const [text, setText] = useState(initial);
  const [error, setError] = useState("");
  const decoded = text.trim() ? decodeShare(text, (code) => exerciseByCode(code)?.id ?? null) : null;
  const preview = decoded?.ok ? describe(decoded) : null;
  return (
    <div className="stack">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="Tilbake"><Icon name="back" /></button>
        <h1>Kode</h1>
        <span />
      </div>
      <p className="muted">Lim inn SMS-en, eller bare koden som starter med HIIT.</p>
      <textarea rows={6} value={text} onChange={(event) => { setText(event.target.value); setError(""); }} />
      {decoded && !decoded.ok ? <p className="banner warn">{decoded.error}</p> : null}
      {error ? <p className="banner warn">{error}</p> : null}
      {preview ? <p className="banner good">{preview}</p> : null}
      <button
        className="btn block"
        disabled={!decoded?.ok}
        onClick={() => {
          if (!decoded?.ok) {
            setError("Koden kan ikke leses.");
            return;
          }
          onApply(decoded);
        }}
      >
        Bruk koden
      </button>
    </div>
  );
}

function describe(decoded: Extract<Decoded, { ok: true }>): string {
  const name = decoded.session.type === "builtin" ? builtinById(decoded.session.id)?.name ?? decoded.session.id : `Egen økt, ${decoded.session.blocks.length} øvelser`;
  if (decoded.kind === "D") return `Delt økt: ${name}.`;
  if (decoded.kind === "U") return `Utfordring: ${name}.`;
  if (decoded.kind === "G") return `${decoded.fromId} har trent ${name} ${decoded.date}.`;
  return `${decoded.fromId} svarte på ${name} ${decoded.date}.`;
}
