import { useState } from "react";
import type { AppState, Profile } from "../types";
import { APP_VERSION, COFFEE_URL, OTHER_APPS_URL } from "../lib/constants";
import { applyAppUpdate, browserUpdateBridge, checkForAppUpdate, waitForServiceWorkerControl, type UpdateCheckResult } from "../pwa/updates";
import { Icon } from "../ui/icons";

export function SettingsScreen({
  state,
  onBack,
  onProfile,
  onExport,
  onImport,
  onReset,
  armed,
}: {
  state: AppState;
  onBack: () => void;
  onProfile: (profile: Profile) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  armed: boolean;
}) {
  const profile = state.profile;
  const [updateStep, setUpdateStep] = useState<"idle" | "checking" | UpdateCheckResult>("idle");
  function patch(partial: Partial<Profile>) {
    onProfile({ ...profile, ...partial });
  }
  return (
    <div className="stack">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="Tilbake"><Icon name="back" /></button>
        <h1>Innstillinger</h1>
        <span />
      </div>
      <label className="field">Navn i SMS
        <input value={profile.name} maxLength={24} onChange={(event) => patch({ name: event.target.value })} placeholder="Fornavn" />
      </label>
      <p className="muted small">Din id: {profile.id}. Den ligger i kodene du sender, ikke navnet.</p>
      <section className="card stack">
        <div className="between">
          <span>Påminnelse</span>
          <b>{clock(profile.reminderHour, profile.reminderMinute)}</b>
        </div>
        <div className="between">
          <div className="stepper">
            <button className="iconbtn" aria-label="Time tidligere" onClick={() => patch({ reminderHour: (profile.reminderHour + 23) % 24 })}>−</button>
            <span className="muted small">time</span>
            <button className="iconbtn" aria-label="Time senere" onClick={() => patch({ reminderHour: (profile.reminderHour + 1) % 24 })}>+</button>
          </div>
          <div className="stepper">
            <button className="iconbtn" aria-label="Fem minutter tidligere" onClick={() => patch({ reminderMinute: (profile.reminderMinute + 55) % 60 })}>−</button>
            <span className="muted small">minutt</span>
            <button className="iconbtn" aria-label="Fem minutter senere" onClick={() => patch({ reminderMinute: (profile.reminderMinute + 5) % 60 })}>+</button>
          </div>
        </div>
        <p className="muted small">Klokken er 24 timer.</p>
      </section>
      <label className="between card">Lyd <input type="checkbox" checked={profile.sound} onChange={(event) => patch({ sound: event.target.checked })} /></label>
      <label className="between card">Vibrasjon <input type="checkbox" checked={profile.haptics} onChange={(event) => patch({ haptics: event.target.checked })} /></label>
      <label className="field">Ukesmål
        <input type="number" min={1} max={7} value={profile.weeklyGoal} onChange={(event) => patch({ weeklyGoal: Math.min(7, Math.max(1, Number(event.target.value) || 1)) })} />
      </label>
      <label className="between card">Varsel når streaken står i fare
        <input type="checkbox" checked={profile.notifications} onChange={(event) => void enableNotifications(event.target.checked, patch)} />
      </label>
      <p className="muted small">Varselet sendes når appen er åpen etter tidspunktet, eller hvis du åpner den senere samme kveld. Banneret på hjem vises uansett.</p>
      <section className="card stack">
        <h2>App</h2>
        <button
          className="btn ghost"
          disabled={updateStep === "checking"}
          onClick={() => {
            setUpdateStep("checking");
            void checkForAppUpdate(browserUpdateBridge()).then(setUpdateStep);
          }}
        >
          Sjekk for oppdateringer
        </button>
        {updateStep === "checking" ? <p className="muted small">Sjekker…</p> : null}
        {updateStep === "current" ? <p className="muted small">Du har nyeste versjon.</p> : null}
        {updateStep === "offline" ? <p className="muted small">Ingen nett. Prøv senere.</p> : null}
        {updateStep === "available" ? (
          <>
            <p className="muted small">Ny versjon. Trykk for å laste inn.</p>
            <button
              className="btn"
              onClick={() => void applyAppUpdate(browserUpdateBridge(), {
                reload: () => window.location.reload(),
                whenControlled: waitForServiceWorkerControl,
              })}
            >
              Last inn ny versjon
            </button>
          </>
        ) : null}
      </section>
      <section className="card stack">
        <h2>Installer</h2>
        <p>iPhone: åpne siden i Safari, Del, Legg til på Hjem-skjerm.</p>
        <p>Android: Chrome-menyen, Installer app eller Legg til på startskjermen.</p>
      </section>
      <section className="card stack">
        <h2>Flytt telefon</h2>
        <p className="muted small">Eksport er en fil. Ingen sky.</p>
        <button className="btn ghost" onClick={onExport}>Eksporter</button>
        <label className="btn ghost">Importer
          <input type="file" accept="application/json" hidden onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImport(file);
          }} />
        </label>
      </section>
      <section className="card stack">
        <h2>Mer</h2>
        <a className="btn ghost" href={OTHER_APPS_URL} target="_blank" rel="noopener noreferrer">Andre apper jeg har laget</a>
        <a className="btn ghost" href={COFFEE_URL} target="_blank" rel="noopener noreferrer">Spander en kaffe</a>
      </section>
      <section className="card stack">
        <h2>Om</h2>
        <p>Appen heter HIIT. Det begynte som harde intervaller, og så ballet det på seg. Nå står det for herlig iblant intensiv trening. En luftetur teller. Det gjør 4×4 også.</p>
        <p>HIIT er treningsforslag, ikke medisinsk råd. Stopp ved smerte, svimmelhet eller ubehag. Versjon {APP_VERSION}.</p>
        <p className="muted small">Markeringen av muskler er forenklet. Ensidige øvelser får et eget intervall per side.</p>
      </section>
      <button className="btn danger" onClick={onReset}>{armed ? "Trykk igjen for å nullstille" : "Nullstill alt på denne telefonen"}</button>
    </div>
  );
}

function clock(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

async function enableNotifications(on: boolean, patch: (partial: Partial<Profile>) => void) {
  if (!on) {
    patch({ notifications: false });
    return;
  }
  if (typeof Notification === "undefined") {
    patch({ notifications: false });
    return;
  }
  const result = await Notification.requestPermission();
  patch({ notifications: result === "granted" });
}
