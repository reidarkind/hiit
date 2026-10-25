export type IconName =
  | "home"
  | "list"
  | "grid"
  | "chart"
  | "sliders"
  | "play"
  | "pause"
  | "skip"
  | "close"
  | "share"
  | "flame"
  | "bird"
  | "snow"
  | "plus"
  | "back"
  | "check"
  | "timer"
  | "users"
  | "copy"
  | "trash"
  | "up"
  | "down"
  | "body";

const PATHS: Record<IconName, string> = {
  home: "M4 11.5 12 4l8 7.5V20H4z M10 20v-6h4v6",
  list: "M5 7h14M5 12h14M5 17h10",
  grid: "M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z",
  chart: "M4 19h16M7 16v-5M12 16V8M17 16v-8",
  sliders: "M4 8h16M4 16h16M8 8v0M16 16v0",
  play: "M8 5l11 7-11 7z",
  pause: "M7 5h3v14H7zM14 5h3v14h-3z",
  skip: "M6 6l8 6-8 6zM16 6v12",
  close: "M6 6l12 12M18 6 6 18",
  share: "M12 4v10M8 8l4-4 4 4M6 14v5h12v-5",
  flame: "M12 21c3.5 0 6-2.4 6-6 0-3.2-2.2-5-3.4-7.4-.4 2-1.6 2.8-2.6 2.8.2-3-1.6-5.6-4.2-7.4.6 3.2-.2 4.8-1.6 6.6C5 11.6 5.2 16 8 18.4 9 19.4 10.4 21 12 21z",
  bird: "M3 15c4-1 6-6 9-6 2.4.6 5 0 9-3-2.6 3.4-2.2 5.2-.4 7-2.6.2-4.6 1.8-7.6 1.8-3.2 0-6.2-.8-10-.8z",
  snow: "M12 3v18M5 7.5l14 9M19 7.5l-14 9",
  plus: "M12 5v14M5 12h14",
  back: "M15 5 8 12l7 7",
  check: "M5 12.5 9 16.5 19 7",
  timer: "M12 7v6l4 2M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM9 3h6",
  users: "M8 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16.5 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3.5 19c.6-2.4 2.4-3.5 4.5-3.5s3.9 1.1 4.5 3.5M13 15.6c1.2-.4 2.4-.5 3.4-.1 1.6.6 2.6 2 3.1 3.5",
  copy: "M8 8h10v12H8zM6 16H5V4h10v2",
  trash: "M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13",
  up: "M6 14l6-6 6 6",
  down: "M6 10l6 6 6-6",
  body: "M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM12 8v6M8 11l4-1 4 1M9 20l3-6 3 6",
};

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const extra = name === "sliders" ? "M8 6v4M16 14v4" : "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[name]} />
      {extra ? <path d={extra} /> : null}
    </svg>
  );
}
