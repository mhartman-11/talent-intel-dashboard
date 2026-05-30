import { GlassCard } from "@/app/_components/GlassCard";
import type { Event } from "@/lib/types";

interface CompPanelProps {
  events: Event[];
  color: string;
}

interface SectorSeries {
  sector: string;
  points: number[]; // oldest → newest hourly wage
  latest: number;
  prev: number | null;
  sourceUrl: string;
  months: number;
}

/** Group comp events by sector label, ordered oldest → newest. */
function buildSeries(events: Event[]): SectorSeries[] {
  const groups = new Map<string, Event[]>();
  for (const e of events) {
    const key = e.company?.name;
    if (!key || e.magnitude == null) continue;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(e);
  }

  const out: SectorSeries[] = [];
  for (const [sector, evts] of groups) {
    const sorted = [...evts].sort(
      (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()
    );
    const points = sorted.map((e) => e.magnitude as number);
    if (points.length === 0) continue;
    out.push({
      sector,
      points,
      latest: points[points.length - 1],
      prev: points.length > 1 ? points[points.length - 2] : null,
      sourceUrl: sorted[sorted.length - 1].source_url,
      months: points.length,
    });
  }
  // Highest-paid sector first
  return out.sort((a, b) => b.latest - a.latest);
}

/** Inline SVG sparkline, normalized to its own min/max. */
function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 120;
  const h = 32;
  const pad = 2;
  if (points.length < 2) {
    return <svg width={w} height={h} aria-hidden />;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = (w - pad * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = pad + i * step;
    const y = h - pad - ((p - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden>
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.85}
      />
      <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
    </svg>
  );
}

export function CompPanel({ events, color }: CompPanelProps) {
  const series = buildSeries(events);

  if (series.length === 0) {
    return (
      <GlassCard>
        <div className="text-center py-16 text-white/25 font-mono text-sm">
          No wage data yet — run ingest to populate
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="divide-y divide-white/[0.04]">
        {series.map((s) => {
          const delta =
            s.prev != null && s.prev !== 0
              ? ((s.latest - s.prev) / s.prev) * 100
              : null;
          const up = delta != null && delta >= 0;
          return (
            <a
              key={s.sector}
              href={s.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-white/[0.03]"
            >
              {/* Sector + cadence */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/90 truncate">
                  {s.sector}
                </p>
                <p className="text-[10px] text-white/30 font-mono mt-0.5">
                  avg hourly · last {s.months}mo
                </p>
              </div>

              {/* Sparkline */}
              <Sparkline points={s.points} color={color} />

              {/* Latest + MoM delta */}
              <div className="shrink-0 flex flex-col items-end gap-0.5 w-24">
                <span className="font-mono text-base font-bold" style={{ color }}>
                  ${s.latest.toFixed(2)}
                  <span className="text-[10px] text-white/30 font-normal">/hr</span>
                </span>
                {delta != null && (
                  <span
                    className="font-mono text-[10px] font-medium"
                    style={{ color: up ? "#ff734a" : "#81ecff" }}
                  >
                    {up ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}% MoM
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </GlassCard>
  );
}
