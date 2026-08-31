"use client";

import { useMemo } from "react";
import type { Event } from "@/lib/types";

interface TrendChartProps {
  events: Event[];
  color: string;
  /** Window to chart. Only pass a window the data actually covers. */
  days?: number;
  /** What one bar counts, e.g. "layoff announcements". Rendered in the y-label. */
  unitLabel: string;
}

const MS_PER_DAY = 86_400_000;

function bucketLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Daily event counts over a fixed window.
 *
 * Only use this where the timestamps are genuine event dates. For sources
 * where every record lands at ingest time (job boards), the bars chart when
 * the scraper ran, not what the market did — show a breakdown instead.
 */
export function TrendChart({ events, color, days = 60, unitLabel }: TrendChartProps) {
  const { buckets, max, startDate, endDate, total } = useMemo(() => {
    const b = new Array<number>(days).fill(0);
    const now = Date.now();
    for (const evt of events) {
      const age = Math.floor((now - new Date(evt.ts).getTime()) / MS_PER_DAY);
      if (age >= 0 && age < days) b[days - 1 - age]++;
    }
    return {
      buckets: b,
      max: Math.max(...b, 1),
      startDate: new Date(now - (days - 1) * MS_PER_DAY),
      endDate: new Date(now),
      total: b.reduce((a, c) => a + c, 0),
    };
  }, [events, days]);

  const W = 600;
  const H = 64;
  const gap = 1;
  const barW = Math.max(2, (W - gap * (days - 1)) / days);

  return (
    <figure className="m-0">
      <figcaption className="flex items-baseline justify-between gap-3 mb-1.5 flex-wrap">
        <span className="text-xs text-white/45">
          {unitLabel} per day &middot; last {days} days
        </span>
        <span className="font-mono text-[10px] text-white/30">
          {total.toLocaleString()} total &middot; busiest day: {max}
        </span>
      </figcaption>

      <div className="relative">
        {/* y-axis max, so a tall bar has a number attached to it */}
        <span className="absolute -top-0.5 left-0 font-mono text-[10px] text-white/25 pointer-events-none">
          {max}
        </span>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: H }}
          role="img"
          aria-label={`${unitLabel} per day over the last ${days} days. ${total} total, busiest day ${max}.`}
        >
          {/* baseline */}
          <line x1={0} y1={H - 0.5} x2={W} y2={H - 0.5} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
          {buckets.map((count, i) => {
            const barH = count > 0 ? Math.max(3, (count / max) * (H - 4)) : 1.5;
            const x = i * (barW + gap);
            const date = new Date(endDate.getTime() - (days - 1 - i) * MS_PER_DAY);
            return (
              <rect
                key={i}
                x={x}
                y={H - barH}
                width={barW}
                height={barH}
                fill={count > 0 ? color : "rgba(255,255,255,0.06)"}
                opacity={count > 0 ? 0.45 + (count / max) * 0.55 : 1}
                rx={1}
              >
                <title>{`${bucketLabel(date)} — ${count} ${count === 1 ? unitLabel.replace(/s$/, "") : unitLabel}`}</title>
              </rect>
            );
          })}
        </svg>

        {/* x-axis endpoints — without these nobody knows which end is today */}
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[10px] text-white/25">{bucketLabel(startDate)}</span>
          <span className="font-mono text-[10px] text-white/25">Today</span>
        </div>
      </div>
    </figure>
  );
}
