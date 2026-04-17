import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { EVENT_COLOR, EVENT_LABEL } from "@/app/_design/tokens";
import { formatMagnitude, timeAgo } from "@/lib/utils";
import type { Event } from "@/lib/types";

interface EventRowProps {
  event: Event;
}

export function EventRow({ event }: EventRowProps) {
  const color = EVENT_COLOR[event.type] ?? "#81ecff";
  const label = EVENT_LABEL[event.type] ?? event.type;

  return (
    <Link
      href={event.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/[0.03]"
    >
      {/* Left: colored type indicator */}
      <span
        className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className="font-mono text-[10px] uppercase tracking-wider font-medium"
            style={{ color }}
          >
            {label}
          </span>
          {event.company?.name && (
            <span className="text-sm font-semibold text-white/90 truncate">
              {event.company.name}
            </span>
          )}
          {event.company?.sector && event.company.sector !== "Other" && (
            <span className="text-[10px] text-white/30 font-medium">
              {event.company.sector}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-white/50 line-clamp-2 leading-relaxed">
          {event.raw_text}
        </p>
      </div>

      {/* Right: magnitude + time + arrow */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        {event.magnitude != null && (
          <span className="font-mono text-xs font-semibold" style={{ color }}>
            {formatMagnitude(event.magnitude, event.unit)}
          </span>
        )}
        <span className="font-mono text-[10px] text-white/25">
          {timeAgo(event.ts)}
        </span>
      </div>

      <ArrowUpRight
        size={14}
        className="shrink-0 mt-0.5 text-white/20 group-hover:text-white/50 transition-colors"
      />
    </Link>
  );
}
