"use client";

import type { Event } from "@/lib/types";

interface TrendChartProps {
  events: Event[];
  color: string;
  days?: number;
}

export function TrendChart({ events, color, days = 60 }: TrendChartProps) {
  const buckets = new Array<number>(days).fill(0);
  const now = Date.now();
  const msPerDay = 86_400_000;

  for (const evt of events) {
    const age = Math.floor((now - new Date(evt.ts).getTime()) / msPerDay);
    if (age >= 0 && age < days) {
      buckets[days - 1 - age]++;
    }
  }

  const max = Math.max(...buckets, 1);
  const W = 600;
  const H = 48;
  const gap = 1;
  const barW = Math.max(2, Math.floor((W - gap * (days - 1)) / days));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H }}
      aria-hidden="true"
    >
      {buckets.map((count, i) => {
        const barH = count > 0 ? Math.max(3, (count / max) * H) : 2;
        const x = i * (barW + gap);
        const y = H - barH;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={barH}
            fill={count > 0 ? color : "rgba(255,255,255,0.05)"}
            opacity={count > 0 ? 0.5 + (count / max) * 0.5 : 1}
            rx={1}
          />
        );
      })}
    </svg>
  );
}
