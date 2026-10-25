import { useEffect, useState } from "react";
import type { Stick, StickPose } from "../types";
import { mixStick } from "../data/sticks";

const NEAR = "#322b26";
const FAR = "#d9cbb8";
const SKIN = "#f1c7a2";
const HOT = "#d4532b";

function Line({ a, b, color, width }: { a: Stick[keyof Stick]; b: Stick[keyof Stick]; color: string; width: number }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width} strokeLinecap="round" />;
}

function Joint({ at, color, r }: { at: Stick[keyof Stick]; color: string; r: number }) {
  return <circle cx={at[0]} cy={at[1]} r={r} fill={color} />;
}

export function Figure({
  pose,
  animate = false,
  mirror = false,
  emphasize = false,
  t = 1,
}: {
  pose: StickPose;
  animate?: boolean;
  mirror?: boolean;
  emphasize?: boolean;
  t?: number;
}) {
  const [live, setLive] = useState(t);
  useEffect(() => {
    if (!animate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    let frame = 0;
    const loop = (now: number) => {
      const p = ((now - start) % 1600) / 1600;
      setLive(p < 0.5 ? p * 2 : (1 - p) * 2);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [animate, pose]);
  const stick = mixStick(pose.a, pose.b, animate ? live : t);
  const near = emphasize ? HOT : NEAR;
  const ground = (stick.ankle[0] + stick.ankle2[0]) / 2;
  return (
    <svg viewBox="0 0 200 240" className="figure" role="img" aria-hidden="true">
      <ellipse cx={ground} cy="226" rx="34" ry="5" fill="#000" opacity="0.08" />
      <g transform={mirror ? "translate(200 0) scale(-1 1)" : undefined}>
        <Line a={stick.hip} b={stick.knee2} color={FAR} width={12} />
        <Line a={stick.knee2} b={stick.ankle2} color={FAR} width={9} />
        <Line a={stick.shoulder} b={stick.elbow2} color={FAR} width={9} />
        <Line a={stick.elbow2} b={stick.wrist2} color={FAR} width={7} />
        <Line a={stick.hip} b={stick.shoulder} color={NEAR} width={16} />
        <Line a={stick.shoulder} b={stick.head} color={NEAR} width={8} />
        <Line a={stick.hip} b={stick.knee} color={near} width={14} />
        <Line a={stick.knee} b={stick.ankle} color={near} width={10} />
        <Line a={stick.shoulder} b={stick.elbow} color={near} width={11} />
        <Line a={stick.elbow} b={stick.wrist} color={near} width={8} />
        <Joint at={stick.hip} color={NEAR} r={7} />
        <Joint at={stick.shoulder} color={NEAR} r={6} />
        <Joint at={stick.knee} color={near} r={5} />
        <Joint at={stick.ankle} color={near} r={4} />
        <circle cx={stick.head[0]} cy={stick.head[1]} r="15" fill={SKIN} stroke={NEAR} strokeWidth="2" />
        {pose.face === "front" ? (
          <>
            <circle cx={stick.head[0] - 5} cy={stick.head[1] - 1} r="1.4" fill={NEAR} />
            <circle cx={stick.head[0] + 5} cy={stick.head[1] - 1} r="1.4" fill={NEAR} />
            <path d={`M ${stick.head[0] - 4} ${stick.head[1] + 6} q 4 4 8 0`} fill="none" stroke={NEAR} strokeWidth="1.4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d={`M ${stick.head[0] - 8} ${stick.head[1] - 8} Q ${stick.head[0] + 2} ${stick.head[1] - 20} ${stick.head[0] + 12} ${stick.head[1] - 4}`} fill="#2a241c" />
            <circle cx={stick.head[0] + 4} cy={stick.head[1] - 1} r="1.5" fill={NEAR} />
            <path d={`M ${stick.head[0] + 12} ${stick.head[1] + 1} l 7 2`} stroke={NEAR} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </g>
    </svg>
  );
}
