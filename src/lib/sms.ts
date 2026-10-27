import { PAGES_URL } from "./constants";

export function shareMessage(input: {
  kind: "D" | "U" | "G" | "S";
  name: string;
  sessionName: string;
  code: string;
}): string {
  const who = input.name.trim();
  const subject = who || "Jeg";
  const lines: Record<typeof input.kind, string> = {
    D: `${subject} deler økten «${input.sessionName}».`,
    U: `${subject} utfordrer deg til «${input.sessionName}».`,
    G: `${subject} har gjennomført «${input.sessionName}» i dag.`,
    S: `${subject} har tatt utfordringen «${input.sessionName}».`,
  };
  return `${lines[input.kind]}\nHer er appen: ${PAGES_URL}\nÅpne den, trykk «Legg inn en kode» på forsiden, og lim inn:\n${input.code}`;
}
