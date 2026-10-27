export type MuscleId =
  | "bryst"
  | "skulder-foran"
  | "skulder-side"
  | "skulder-bak"
  | "biceps"
  | "triceps"
  | "underarm"
  | "mage"
  | "skraa"
  | "rygg-oever"
  | "rygg-midten"
  | "rygg-nedre"
  | "sete"
  | "fremside-lar"
  | "bakside-lar"
  | "innside-lar"
  | "hofteboyer"
  | "legg"
  | "skinnelegg";

export type Level = "lett" | "middels" | "krevende";
export type Pattern =
  | "press"
  | "trekk"
  | "knebøy"
  | "hengsel"
  | "utfall"
  | "kjerne"
  | "kondisjon"
  | "bevegelighet";
export type SideMode = "begge" | "ensidig" | "annenhver";
export type Place = "gulv" | "staende" | "ute";
export type Format = "ovelse" | "intervall";
export type SideName = "venstre" | "hoyre" | "begge";
export type Gear = "ingen" | "stol" | "vekter" | "ball" | "strikk";
export type StickProp =
  | { kind: "stol" | "ball"; x: number; y: number; w: number; h: number }
  | { kind: "strikk" | "vekter" };

export type Pt = [number, number];

export type Stick = {
  head: Pt;
  shoulder: Pt;
  hip: Pt;
  knee: Pt;
  ankle: Pt;
  knee2: Pt;
  ankle2: Pt;
  elbow: Pt;
  wrist: Pt;
  elbow2: Pt;
  wrist2: Pt;
};

export type StickPose = {
  a: Stick;
  b: Stick;
  face: "side" | "front";
  prop?: StickProp;
};

export type Exercise = {
  id: string;
  code: string;
  name: string;
  summary: string;
  steps: string[];
  cues: string[];
  level: Level;
  pattern: Pattern;
  side: SideMode;
  place: Place;
  format: Format;
  zone: string | null;
  primary: MuscleId[];
  secondary: MuscleId[];
  pose: StickPose;
  gear: Gear;
};

export type Block = {
  exerciseId: string;
  workSeconds: number;
  restSeconds: number;
  rounds?: number;
};

export type Session = {
  id: string;
  name: string;
  summary: string;
  about: string;
  blocks: Block[];
  builtin: boolean;
};

export type WorkStep = {
  kind: "work";
  key: string;
  exerciseId: string;
  title: string;
  side: SideName;
  seconds: number;
  cues: string[];
  how: string[];
  primary: MuscleId[];
  secondary: MuscleId[];
  pose: StickPose;
  switchHalf: boolean;
  zone: string | null;
  format: Format;
};

export type RestStep = {
  kind: "rest";
  key: string;
  title: string;
  seconds: number;
  nextTitle: string | null;
};

export type Step = WorkStep | RestStep;

export type Completion = {
  id: string;
  at: string;
  date: string;
  sessionId: string;
  sessionName: string;
  seconds: number;
  morningBird: boolean;
  counts: boolean;
  xp: number;
  exerciseIds: string[];
  muscles: { id: MuscleId; weight: number }[];
};

export type Profile = {
  id: string;
  name: string;
  reminderHour: number;
  reminderMinute: number;
  sound: boolean;
  haptics: boolean;
  weeklyGoal: number;
  notifications: boolean;
};

export type Partner = {
  id: string;
  name: string;
  inboundDates: string[];
};

export type Challenge = {
  id: string;
  fromId: string;
  sessionId: string;
  sessionName: string;
  at: string;
};

export type AppState = {
  version: 1;
  profile: Profile;
  seenIntro: boolean;
  shared: boolean;
  customSessions: Session[];
  receivedSessions: Session[];
  history: Completion[];
  freezeBank: number;
  bridgedDays: string[];
  freezeAwarded: number[];
  partners: Partner[];
  challenges: Challenge[];
  reminderDate: string | null;
  favorites: string[];
  planWeek: (string | null)[];
};
