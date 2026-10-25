import { PAGES_URL } from "./constants";

export function codeLink(code: string): string {
  return `${PAGES_URL}#k=${code}`;
}

export function shareMessage(input: {
  kind: "D" | "U" | "G" | "S";
  name: string;
  sessionName: string;
  code: string;
}): string {
  const who = input.name.trim();
  const subject = who || "Jeg";
  const link = codeLink(input.code);
  const lines: Record<typeof input.kind, string> = {
    D: `${subject} deler økten «${input.sessionName}» i HIIT.`,
    U: `${subject} utfordrer deg til «${input.sessionName}» i HIIT.`,
    G: `${subject} har gjennomført «${input.sessionName}» i dag.`,
    S: `${subject} har tatt utfordringen «${input.sessionName}».`,
  };
  const tail: Record<typeof input.kind, string> = {
    D: "Lim inn koden i appen:",
    U: "Legg inn koden, gjennomfør, og send svar:",
    G: "Legg inn koden i HIIT om dere har par-streak:",
    S: "Legg inn svaret i HIIT:",
  };
  return `${lines[input.kind]}\n${tail[input.kind]}\n${input.code}\n${link}`;
}
