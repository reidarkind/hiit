import type { AppState, Profile, Session } from "../types";
import { STORAGE_KEY } from "./constants";
import { exerciseById } from "../data/exercises";
import { randomId } from "./id";
import { emptyWeek } from "./plan";

export function defaultProfile(id: string): Profile {
  return {
    id,
    name: "",
    reminderHour: 20,
    reminderMinute: 0,
    sound: true,
    haptics: true,
    weeklyGoal: 3,
    notifications: false,
  };
}

export function freshState(id = ""): AppState {
  const profileId = id || randomId(4);
  return {
    version: 1,
    profile: defaultProfile(profileId),
    seenIntro: false,
    shared: false,
    customSessions: [],
    receivedSessions: [],
    history: [],
    freezeBank: 1,
    bridgedDays: [],
    freezeAwarded: [],
    partners: [],
    challenges: [],
    reminderDate: null,
    favorites: [],
    planWeek: emptyWeek(),
  };
}

function cleanPlan(value: unknown): (string | null)[] {
  const list = Array.isArray(value) ? value : [];
  return emptyWeek().map((_, index) => (typeof list[index] === "string" && list[index] ? list[index] : null));
}

function cleanSession(value: Partial<Session> | undefined): Session | null {
  if (!value?.id || !value.name || !Array.isArray(value.blocks)) return null;
  const blocks = value.blocks.filter(
    (block) =>
      block &&
      typeof block.exerciseId === "string" &&
      exerciseById(block.exerciseId) &&
      typeof block.workSeconds === "number" &&
      typeof block.restSeconds === "number",
  );
  if (blocks.length === 0) return null;
  return {
    id: value.id,
    name: value.name.slice(0, 48),
    summary: value.summary ?? "Egen økt",
    about: value.about ?? "",
    blocks,
    builtin: false,
  };
}

export function parseState(raw: string | null, idFactory: () => string = () => randomId(4)): AppState {
  if (!raw) return freshState(idFactory());
  try {
    const data = JSON.parse(raw) as Partial<AppState>;
    if (data.version !== 1 || !data.profile?.id) return freshState(idFactory());
    const base = freshState(data.profile.id);
    return {
      ...base,
      profile: {
        ...base.profile,
        name: typeof data.profile.name === "string" ? data.profile.name : base.profile.name,
        reminderHour: typeof data.profile.reminderHour === "number" ? data.profile.reminderHour : base.profile.reminderHour,
        reminderMinute: typeof data.profile.reminderMinute === "number" ? data.profile.reminderMinute : base.profile.reminderMinute,
        sound: typeof data.profile.sound === "boolean" ? data.profile.sound : base.profile.sound,
        haptics: typeof data.profile.haptics === "boolean" ? data.profile.haptics : base.profile.haptics,
        weeklyGoal: typeof data.profile.weeklyGoal === "number" ? data.profile.weeklyGoal : base.profile.weeklyGoal,
        notifications: typeof data.profile.notifications === "boolean" ? data.profile.notifications : base.profile.notifications,
        id: data.profile.id,
      },
      seenIntro: Boolean(data.seenIntro),
      shared: Boolean(data.shared),
      customSessions: (data.customSessions ?? []).map(cleanSession).filter((item): item is Session => item !== null),
      receivedSessions: (data.receivedSessions ?? []).map(cleanSession).filter((item): item is Session => item !== null),
      history: Array.isArray(data.history) ? data.history : [],
      freezeBank: typeof data.freezeBank === "number" ? data.freezeBank : 1,
      bridgedDays: Array.isArray(data.bridgedDays) ? data.bridgedDays : [],
      freezeAwarded: Array.isArray(data.freezeAwarded) ? data.freezeAwarded : [],
      partners: Array.isArray(data.partners) ? data.partners : [],
      challenges: Array.isArray(data.challenges) ? data.challenges : [],
      reminderDate: data.reminderDate ?? null,
      favorites: Array.isArray(data.favorites) ? data.favorites.filter((id): id is string => typeof id === "string") : [],
      planWeek: cleanPlan(data.planWeek),
    };
  } catch {
    return freshState(idFactory());
  }
}

export function load(): AppState {
  if (typeof localStorage === "undefined") return freshState();
  return parseState(localStorage.getItem(STORAGE_KEY));
}

export function save(state: AppState): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
