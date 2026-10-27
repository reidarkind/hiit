import type { Pt, Stick, StickPose, StickProp } from "../types";

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

function two(a: Stick, b: Stick, face: StickPose["face"] = "side", prop?: StickProp): StickPose {
  return prop ? { a, b, face, prop } : { a, b, face };
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
  [150, 116],
  [164, 132],
  [134, 122],
  [146, 140],
);

const lunge = sk(
  [136, 64],
  [124, 92],
  [108, 136],
  [156, 170],
  [164, 214],
  [78, 172],
  [56, 214],
  [140, 118],
  [146, 158],
  [112, 124],
  [104, 160],
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
  [170, 118],
  [148, 144],
  [96, 166],
  [68, 188],
  [40, 214],
  [78, 196],
  [50, 214],
  [152, 172],
  [158, 214],
  [176, 156],
  [194, 202],
);

const pushLow = sk(
  [166, 156],
  [146, 174],
  [94, 192],
  [66, 202],
  [40, 214],
  [76, 206],
  [50, 214],
  [134, 194],
  [158, 214],
  [162, 182],
  [194, 204],
);

const plank = sk(
  [176, 168],
  [154, 186],
  [108, 192],
  [74, 202],
  [46, 214],
  [78, 208],
  [50, 214],
  [152, 214],
  [178, 214],
  [146, 206],
  [190, 206],
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
  [164, 188],
  [176, 214],
  [150, 184],
  [158, 206],
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
  [158, 186],
  [150, 214],
  [168, 176],
  [178, 206],
);

const camel = sk(
  [188, 118],
  [156, 168],
  [102, 170],
  [80, 214],
  [56, 214],
  [92, 214],
  [70, 214],
  [164, 188],
  [156, 214],
  [174, 180],
  [184, 206],
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
  [108, 148],
  [96, 158],
  [48, 152],
  [62, 160],
);

const crunchFlat = sk(
  [58, 190],
  [84, 204],
  [128, 210],
  [160, 180],
  [186, 198],
  [150, 188],
  [174, 208],
  [90, 176],
  [74, 184],
  [36, 180],
  [44, 188],
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
  [150, 112],
  [146, 78],
  [148, 200],
  [168, 214],
);

const bear = sk(
  [176, 132],
  [150, 148],
  [102, 150],
  [80, 188],
  [60, 206],
  [90, 196],
  [70, 210],
  [162, 178],
  [154, 214],
  [172, 170],
  [182, 206],
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
  [78, 112],
  [62, 148],
  [126, 114],
  [142, 150],
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

const dipHigh = sk(
  [128, 72],
  [112, 100],
  [100, 146],
  [150, 168],
  [172, 214],
  [138, 174],
  [156, 214],
  [78, 118],
  [70, 156],
  [90, 122],
  [82, 150],
);

const dipLow = sk(
  [124, 108],
  [108, 136],
  [100, 178],
  [152, 176],
  [174, 214],
  [140, 182],
  [158, 214],
  [64, 156],
  [70, 156],
  [78, 150],
  [82, 150],
);

const stepUp = sk(
  [124, 48],
  [114, 76],
  [106, 128],
  [148, 146],
  [166, 148],
  [88, 172],
  [76, 214],
  [132, 104],
  [140, 140],
  [104, 108],
  [96, 144],
);

const pressUp = sk(
  [128, 36],
  [118, 68],
  [110, 126],
  [122, 168],
  [124, 214],
  [104, 170],
  [100, 214],
  [140, 46],
  [148, 24],
  [108, 50],
  [100, 28],
);

const rowPull = sk(
  [168, 96],
  [150, 112],
  [104, 142],
  [120, 176],
  [118, 214],
  [108, 178],
  [102, 214],
  [138, 128],
  [126, 146],
  [124, 136],
  [112, 150],
);

const bandOut = sk(
  [100, 42],
  [100, 74],
  [100, 126],
  [76, 168],
  [74, 214],
  [124, 168],
  [126, 214],
  [62, 86],
  [36, 78],
  [138, 86],
  [164, 78],
);

const ballBridge = sk(
  [52, 168],
  [78, 176],
  [124, 132],
  [156, 156],
  [176, 188],
  [148, 164],
  [168, 196],
  [66, 186],
  [48, 196],
  [74, 192],
  [58, 204],
);

const inclineHigh = sk(
  [158, 118],
  [140, 140],
  [98, 166],
  [72, 188],
  [46, 214],
  [80, 196],
  [54, 214],
  [128, 158],
  [118, 176],
  [168, 146],
  [186, 168],
);

const inclineLow = sk(
  [154, 148],
  [138, 164],
  [100, 186],
  [72, 198],
  [46, 214],
  [80, 204],
  [54, 214],
  [124, 168],
  [116, 176],
  [164, 160],
  [184, 176],
);

const ballPlankUp = sk(
  [164, 132],
  [146, 150],
  [104, 172],
  [74, 194],
  [46, 214],
  [82, 202],
  [54, 214],
  [150, 164],
  [168, 156],
  [140, 156],
  [178, 148],
);

const chair = { kind: "stol" as const, x: 36, y: 148, w: 78, h: 66 };
const stepBox = { kind: "stol" as const, x: 146, y: 148, w: 48, h: 66 };
const crunchBall = { kind: "ball" as const, x: 70, y: 188, w: 78, h: 40 };
const bridgeBall = { kind: "ball" as const, x: 150, y: 176, w: 46, h: 40 };

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
      [140, 196],
      [162, 214],
      [168, 188],
      [186, 204],
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
  dip: two(dipHigh, dipLow, "side", chair),
  step: two(stand, stepUp, "side", stepBox),
  press: two(stand, pressUp, "side", { kind: "vekter" }),
  goblet: two(stand, squat, "side", { kind: "vekter" }),
  row: two(hinge, rowPull, "side", { kind: "vekter" }),
  band: two(frontStand, bandOut, "front", { kind: "strikk" }),
  bandRow: two(hinge, rowPull, "side", { kind: "strikk" }),
  ballCrunch: two(crunchFlat, crunch, "side", crunchBall),
  ballBridge: two(lie, ballBridge, "side", bridgeBall),
  ballPlank: two(ballPlankUp, nudge(ballPlankUp, 0, 6), "side", { kind: "ball", x: 142, y: 142, w: 48, h: 32 }),
  incline: two(inclineHigh, inclineLow, "side", { kind: "stol", x: 108, y: 176, w: 86, h: 38 }),
  bandSquat: two(stand, squat, "side", { kind: "strikk" }),
};
