# HIIT

Norsk PWA for kroppsvekt, enkle hjelpemidler (stol, håndvekter, pilatesball, strikk) og løpeintervaller. Ingen konto, ingen backend. Vite + React + TypeScript + Vitest. Publiseres til GitHub Pages på `/hiit/`.

## Kommandoer

```powershell
npm ci
npm test
npm run dev
npm run build
```

Én testfil: `npx vitest run src/lib/expand.test.ts`

## Arkitektur

- `src/types.ts` — felles typer. Ingen enums.
- `src/data/` — øvelser, positurer, innebygde økter, muskelnavn. Ikke DOM.
- `src/lib/` — utvidelse av økt, streak, frost, xp, koder, dekning, lagring. Tester ligger ved siden av.
- `src/ui/` — figur, muskelplakat, ikoner, lyd.
- `src/screens/` — skjermer. `src/App.tsx` holder rute og tilstand.
- `src/pwa.ts` — service worker-oppdatering og `storage.persist`.
- localStorage-nøkkel: `hiit-v1`.

Øktlogikk skal kunne testes uten DOM. Nye øvelser legges i `src/data/exercises.ts` med en kode på to bokstaver (ikke I, O, 0 eller 1), `gear` (`ingen`, `stol`, `vekter`, `ball` eller `strikk`) og en positur i `src/data/sticks.ts`. Favoritter og ukeplan ligger på `AppState` (`favorites`, `planWeek` med mandag som indeks 0). SMS-lenken peker bare på appen. Koden skrives inn via «Legg inn en kode».

## Regler

- UI på bokmål, med æ, ø og å.
- Ensidige øvelser (`side: "ensidig"`) utvides til venstre og høyre med et kort «Bytt side» mellom. `annenhver` er ett intervall som bytter halvveis.
- Ikke legg til backend, konto eller analyse.
- Ikke endre `base` `/hiit/` i produksjon.
- Ikke commit hemmeligheter eller `node_modules`.
- Commit og push bare når mennesket ber om det.
- De andre repoene i workspace (storealfabet, bananmatte, fact_hunter) skal ikke endres.

## Kode i SMS

`HIIT-<D|U|G|S>-<økt>-<fra>-[til-][dato-]<sjekk>`

- D deler en økt, U er en utfordring, G er gjennomført, S er svar på en utfordring.
- Innebygd økt bruker id (`KL7`). Egen økt starter med `X` og er blokker à seks tegn: øvelseskode, arbeid, hvile. Tid er i steg på fem sekunder.
- Dato er dager siden 2026-01-01, tre tegn. Sjekksum er to tegn.
- Par-streak på denne telefonen krever egen fullført økt og en innlagt kode fra den andre, samme dato.

## Tone

Lekent, men ikke barnslig. Tap er mildt: en avbrutt økt under ett minutt teller ikke, og appen sier fra. 4×4 og harde drag skal ha en tydelig advarsel. Appen er ikke medisinsk råd.
