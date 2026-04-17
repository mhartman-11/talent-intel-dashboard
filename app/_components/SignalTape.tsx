"use client";

import Link from "next/link";
import { EVENT_COLOR, EVENT_LABEL } from "@/app/_design/tokens";
import { formatMagnitude, timeAgo } from "@/lib/utils";
import type { Event } from "@/lib/types";
import clsx from "clsx";

interface TapePillProps {
  event: Event;
}

function TapePill({ event }: TapePillProps) {
  const color = EVENT_COLOR[event.type] ?? "#81ecff";
  const label = EVENT_LABEL[event.type] ?? event.type;
  const company = event.company?.name ?? "—";

  return (
    <Link
      href={event.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "group inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "transition-all duration-200 hover:scale-[1.03] shrink-0",
        "glass border"
      )}
      style={{
        borderColor: `${color}20`,
        backgroundColor: `${color}08`,
      }}
    >
      {/* Signal type dot */}
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Event type label */}
      <span
        className="font-mono text-[10px] font-medium uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </span>

      {/* Company name */}
      <span className="font-body text-xs text-white/80 font-medium max-w-[160px] truncate group-hover:text-white transition-colors">
        {company}
      </span>

      {/* Magnitude */}
      {event.magnitude != null && (
        <span className="font-mono text-[10px] text-white/40">
          {formatMagnitude(event.magnitude, event.unit)}
        </span>
      )}

      {/* Time */}
      <span className="font-mono text-[10px] text-white/25 shrink-0">
        {timeAgo(event.ts)}
      </span>
    </Link>
  );
}

interface SignalTapeProps {
  events: Event[];
}

export function SignalTape({ events }: SignalTapeProps) {
  if (events.length === 0) {
    return (
      <div
        className="w-full py-3 flex items-center justify-center border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span className="font-mono text-xs text-white/25">
          No signals yet — ingest pending
        </span>
      </div>
    );
  }

  // Duplicate for seamless loop
  const doubled = [...events, ...events];

  return (
    <div
      className="w-full overflow-hidden border-b relative"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
    >
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
      />
      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
      />

      <div className="py-2 px-4">
        <div className="tape-track">
          {doubled.map((evt, i) => (
            <TapePill key={`${evt.id}-${i}`} event={evt} />
          ))}
        </div>
      </div>
    </div>
  );
}
