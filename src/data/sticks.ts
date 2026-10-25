import type { Pt, Stick, StickPose } from "../types";

export const STICK_KEYS = [
  "head",
  "shoulder",
  "hip",
  "knee",
  "ankle",
  "knee2",
  "ankle2",
  "elbow",
  "wrist",
  "elbow2",
  "wrist2",
] as const;

export function nudge(stick: Stick, dx: number, dy: number): Stick {
  const next = {} as Stick;
  for (const key of STICK_KEYS) next[key] = [stick[key][0] + dx, stick[key][1] + dy];
  return next;
}

export function mixStick(a: Stick, b: Stick, t: number): Stick {
  const next = {} as Stick;
  for (const key of STICK_KEYS) {
    next[key] = [a[key][0] + (b[key][0] - a[key][0]) * t, a[key][1] + (b[key][1] - a[key][1]) * t];
  }
  return next;
}

function sk(
  head: Pt,
  shoulder: Pt,
  hip: Pt,
  knee: Pt,
  ankle: Pt,
  knee2: Pt,
  ankle2: Pt,
  elbow: Pt,
  wrist: Pt,
  elbow2: Pt,
  wrist2: Pt,
): Stick {
  return { head, shoulder, hip, knee, ankle, knee2, ankle2, elbow, wrist, elbow2, wrist2 };
}

function two(a: Stick, b: Stick, face: StickPose["face"] = "side"): StickPose {
  return { a, b, face };
}

function breathe(a: Stick, face: StickPose["face"] = "side"): StickPose {
  return { a, b: nudge(a, 1, -2), face };
}

const stand = sk(
  [132, 46],
  [120, 74],
  [112, 128],
  [122, 170],
  [124, 214],
  [104, 172],
  [100, 214],
  [134, 108],
  [140, 142],
  [112, 110],
  [106, 144],
);

const squat = sk(
  [146, 78],
  [132, 104],
  [104, 152],
  [146, 178],
  [132, 214],
  [122, 182],
  [112, 214],
  [164, 118],
  [186, 108],
  [150, 126],
  [170, 116],
);

const lunge = sk(
  [136, 64],
  [124, 92],
  [108, 136],
  [156, 170],
  [164, 214],
  [78, 172],
  [56, 214],
  [142, 112],
  [156, 96],
  [116, 118],
  [128, 102],
);

const hinge = sk(
  [172, 100],
  [154, 112],
  [104, 142],
  [120, 176],
  [118, 214],
  [108, 178],
  [102, 214],
  [176, 124],
  [190, 140],
  [160, 130],
  [174, 146],
);

const pushHigh = sk(
  [166, 146],
  [148, 166],
  [106, 178],
  [74, 196],
  [46, 214],
  [82, 204],
  [54, 214],
  [138, 188],
  [132, 214],
  [180, 176],
  [196, 214],
);

const pushLow = sk(
  [164, 184],
  [146, 196],
  [106, 208],
  [72, 210],
  [46, 214],
  [80, 212],
  [54, 214],
  [128, 194],
  [132, 214],
  [178, 192],
  [196, 214],
);

const plank = sk(
  [176, 168],
  [154, 186],
  [108, 192],
  [74, 202],
  [46, 214],
  [78, 208],
  [50, 214],
  [150, 214],
  [174, 214],
  [146, 214],
  [168, 214],
);

const climber = sk(
  [166, 146],
  [148, 166],
  [106, 178],
  [132, 156],
  [120, 188],
  [78, 200],
  [50, 214],
  [138, 188],
  [132, 214],
  [180, 176],
  [196, 214],
);

const quad = sk(
  [176, 146],
  [150, 162],
  [102, 164],
  [82, 214],
  [58, 214],
  [92, 214],
  [70, 214],
  [164, 186],
  [172, 214],
  [154, 190],
  [160, 214],
);

const bird = sk(
  [178, 142],
  [152, 158],
  [104, 162],
  [56, 156],
  [28, 150],
  [90, 214],
  [68, 214],
  [178, 150],
  [198, 146],
  [156, 188],
  [164, 214],
);

const kick = sk(
  [176, 148],
  [150, 164],
  [104, 166],
  [52, 148],
  [30, 124],
  [90, 214],
  [68, 214],
  [164, 188],
  [172, 214],
  [154, 192],
  [160, 214],
);

const cat = sk(
  [168, 176],
  [146, 150],
  [100, 152],
  [80, 214],
  [56, 214],
  [92, 214],
  [70, 214],
  [160, 180],
  [168, 214],
  [150, 186],
  [156, 214],
);

const camel = sk(
  [188, 118],
  [156, 168],
  [102, 170],
  [80, 214],
  [56, 214],
  [92, 214],
  [70, 214],
  [166, 188],
  [174, 214],
  [156, 194],
  [162, 214],
);

const lie = sk(
  [52, 188],
  [78, 202],
  [122, 208],
  [156, 176],
  [184, 196],
  [146, 186],
  [172, 206],
  [96, 176],
  [114, 156],
  [86, 186],
  [100, 168],
);

const bridge = sk(
  [50, 196],
  [74, 212],
  [122, 150],
  [158, 176],
  [188, 214],
  [148, 186],
  [176, 214],
  [62, 202],
  [46, 196],
  [70, 208],
  [56, 204],
);

const bridgeLeg = sk(
  [50, 196],
  [74, 212],
  [122, 148],
  [146, 132],
  [158, 96],
  [148, 186],
  [176, 214],
  [62, 202],
  [46, 196],
  [70, 208],
  [56, 204],
);

const deadbug = sk(
  [54, 190],
  [82, 204],
  [124, 208],
  [150, 164],
  [150, 128],
  [112, 158],
  [96, 124],
  [104, 162],
  [120, 130],
  [78, 170],
  [68, 138],
);

const deadbugOut = sk(
  [54, 192],
  [82, 206],
  [124, 210],
  [168, 196],
  [196, 190],
  [112, 156],
  [96, 122],
  [104, 160],
  [120, 128],
  [64, 202],
  [40, 206],
);

const crunch = sk(
  [78, 164],
  [100, 184],
  [132, 208],
  [162, 176],
  [188, 194],
  [152, 186],
  [176, 206],
  [92, 140],
  [86, 156],
  [60, 148],
  [66, 170],
);

const crunchFlat = sk(
  [58, 190],
  [84, 204],
  [128, 210],
  [160, 180],
  [186, 198],
  [150, 188],
  [174, 208],
  [74, 168],
  [66, 180],
  [42, 176],
  [48, 196],
);

const superman = sk(
  [176, 162],
  [150, 178],
  [104, 194],
  [70, 188],
  [40, 180],
  [74, 202],
  [46, 206],
  [176, 166],
  [198, 154],
  [166, 180],
  [186, 170],
);

const sideplank = sk(
  [180, 142],
  [156, 160],
  [110, 176],
  [74, 194],
  [46, 208],
  [70, 188],
  [40, 200],
  [156, 206],
  [176, 214],
  [156, 128],
  [156, 100],
);

const bear = sk(
  [176, 132],
  [150, 148],
  [102, 150],
  [80, 188],
  [60, 206],
  [90, 196],
  [70, 210],
  [164, 178],
  [174, 214],
  [154, 186],
  [162, 214],
);

const frontStand = sk(
  [100, 40],
  [100, 70],
  [100, 124],
  [76, 168],
  [74, 214],
  [124, 168],
  [126, 214],
  [70, 102],
  [62, 136],
  [130, 102],
  [138, 136],
);

const jackOut = sk(
  [100, 36],
  [100, 68],
  [100, 120],
  [58, 150],
  [40, 208],
  [142, 150],
  [160, 208],
  [64, 46],
  [42, 24],
  [136, 46],
  [158, 24],
);

const wideDown = sk(
  [100, 58],
  [100, 90],
  [100, 146],
  [52, 176],
  [40, 214],
  [148, 176],
  [160, 214],
  [62, 78],
  [48, 64],
  [138, 78],
  [152, 64],
);

const sideLunge = sk(
  [96, 52],
  [100, 84],
  [104, 132],
  [52, 168],
  [36, 214],
  [136, 170],
  [142, 214],
  [78, 96],
  [64, 78],
  [128, 100],
  [140, 86],
);

const kneeUp = sk(
  [100, 42],
  [100, 72],
  [100, 126],
  [78, 112],
  [76, 78],
  [124, 170],
  [126, 214],
  [70, 96],
  [58, 78],
  [132, 108],
  [142, 140],
);

function run(which: "a" | "b", lift: number, lean: number): Stick {
  const front = which === "a";
  return sk(
    [128 + lean, 48 - lift],
    [118 + lean * 0.5, 76 - lift],
    [110, 130 - lift * 0.3],
    front ? [136, 148 - lift] : [92, 170 - lift * 0.2],
    front ? [128, 186 - lift] : [78, 214],
    front ? [92, 170 - lift * 0.2] : [136, 148 - lift],
    front ? [78, 214] : [128, 186 - lift],
    front ? [96, 100 - lift] : [142, 92 - lift],
    front ? [88, 128 - lift] : [154, 74 - lift],
    front ? [142, 92 - lift] : [96, 100 - lift],
    front ? [154, 74 - lift] : [88, 128 - lift],
  );
}

export const poses = {
  jack: two(frontStand, jackOut, "front"),
  squat: two(stand, squat),
  lunge: two(stand, lunge),
  bridge: two(lie, bridge),
  pushup: two(pushHigh, pushLow),
  plank: breathe(plank),
  sideplank: breathe(sideplank),
  bird: two(quad, bird),
  superman: two(nudge(superman, 0, 8), superman),
  deadbug: two(deadbug, deadbugOut),
  crunch: two(crunchFlat, crunch),
  highknees: two(run("a", 0, 8), run("b", 0, 8)),
  chair: breathe(squat),
  narrowPush: two(
    nudge(pushHigh, 0, 0),
    sk(
      [164, 186],
      [146, 198],
      [106, 208],
      [72, 210],
      [46, 214],
      [80, 212],
      [54, 214],
      [136, 192],
      [150, 214],
      [170, 190],
      [188, 214],
    ),
  ),
  rotate: two(pushHigh, sideplank),
  climber: two(pushHigh, climber),
  burpee: two(pushLow, nudge(stand, 0, -26)),
  calf: two(stand, nudge(stand, 0, -14)),
  singleBridge: two(bridge, bridgeLeg),
  kick: two(quad, kick),
  tap: two(
    plank,
    sk(
      [176, 166],
      [154, 184],
      [108, 192],
      [74, 202],
      [46, 214],
      [78, 208],
      [50, 214],
      [150, 160],
      [142, 142],
      [146, 214],
      [168, 214],
    ),
  ),
  bicycle: two(crunch, deadbugOut),
  inch: two(hinge, pushHigh),
  catcow: two(cat, camel),
  backLunge: two(stand, sk(
    [130, 72],
    [122, 100],
    [116, 150],
    [120, 178],
    [124, 214],
    [72, 192],
    [46, 214],
    [138, 128],
    [144, 164],
    [106, 132],
    [98, 166],
  )),
  wideSquat: two(frontStand, wideDown, "front"),
  hinge: two(stand, hinge),
  jumpSquat: two(squat, nudge(stand, 0, -30)),
  march: two(kneeUp, sk(
    [100, 42],
    [100, 72],
    [100, 126],
    [124, 112],
    [126, 78],
    [76, 170],
    [74, 214],
    [132, 96],
    [144, 78],
    [70, 108],
    [58, 140],
  ), "front"),
  hipOpen: two(lunge, sk(
    [148, 78],
    [132, 104],
    [108, 142],
    [158, 174],
    [166, 214],
    [74, 176],
    [52, 214],
    [156, 150],
    [168, 176],
    [120, 156],
    [132, 178],
  )),
  sideLunge: two(frontStand, sideLunge, "front"),
  bear: breathe(bear),
  walk: two(run("a", 0, 2), run("b", 0, 2)),
  jog: two(run("a", 6, 10), run("b", 6, 10)),
  tempo: two(run("a", 12, 16), run("b", 12, 16)),
  sprint: two(run("a", 20, 22), run("b", 20, 22)),
};
