"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SECTOR_ORDER, SIGNAL_ORDER, EVENT_COLOR, EVENT_LABEL, EVENT_DESC, SIGNAL_TO_STREAM } from "@/app/_design/tokens";
import { staggerContainer, cardEntrance } from "@/app/_design/motion";
import type { SectorMatrix } from "@/lib/types";

interface HeatGridProps {
  matrix: SectorMatrix;
  onFilter?: (sector: string, signal: string) => void;
}

// Minimum visible tint for a cell that HAS events but no Z-score baseline
// (z is only computed when 30-day count >= 3). Without this floor, sparse
// signals like exec moves and funding render fully transparent — i.e. invisible.
const PRESENCE_FLOOR = 0.4;
const MAX_INTENSITY = 0.92;

function cellIntensity(z: number | undefined | null, count7d: number): number {
  if (count7d <= 0) return 0;
  if (z == null) return PRESENCE_FLOOR; // present, but no baseline to score against
  // Clamp Z-score to [-2, 3] then normalize into [PRESENCE_FLOOR, MAX_INTENSITY]
  const clamped = Math.max(-2, Math.min(3, z));
  const norm = (clamped + 2) / 5;
  return PRESENCE_FLOOR + norm * (MAX_INTENSITY - PRESENCE_FLOOR);
}

function cellColor(z: number | undefined | null, count7d: number, signalType: string): string {
  const base = EVENT_COLOR[signalType] ?? "#81ecff";
  const intensity = cellIntensity(z, count7d);
  // hex base + alpha byte driven by intensity
  return `${base}${Math.round(intensity * 255).toString(16).padStart(2, "0")}`;
}

export function HeatGrid({ matrix, onFilter }: HeatGridProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();

  // Click a cell → drill into the matching stream, pre-filtered to that sector.
  // (When used inside a stream page, the parent passes onFilter instead.)
  function handleCellClick(sector: string, sig: string, count7d: number) {
    if (onFilter) {
      onFilter(sector, sig);
      return;
    }
    if (count7d > 0) {
      const stream = SIGNAL_TO_STREAM[sig] ?? "layoffs";
      router.push(`/intel/${stream}?sector=${encodeURIComponent(sector)}`);
    }
  }

  // Build lookup map
  const cellMap: Record<string, (typeof matrix.cells)[0]> = {};
  for (const cell of matrix.cells) {
    cellMap[`${cell.sector}:${cell.signal_type}`] = cell;
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[480px]">
        {/* Column headers */}
        <div
          className="grid gap-1.5 mb-1.5"
          style={{ gridTemplateColumns: `140px repeat(${SIGNAL_ORDER.length}, 1fr)` }}
        >
          <div /> {/* empty sector label col */}
          {SIGNAL_ORDER.map((sig) => (
            <div
              key={sig}
              className="label-overline text-center py-1 flex items-center justify-center gap-1 cursor-help"
              title={EVENT_DESC[sig]}
            >
              {EVENT_LABEL[sig]}
              <span aria-hidden className="text-white/25 text-[9px] leading-none">ⓘ</span>
            </div>
          ))}
        </div>

        {/* Rows */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-1.5"
        >
          {SECTOR_ORDER.map((sector) => (
            <motion.div
              key={sector}
              variants={cardEntrance}
              className="grid gap-1.5 items-center"
              style={{
                gridTemplateColumns: `140px repeat(${SIGNAL_ORDER.length}, 1fr)`,
              }}
            >
              {/* Sector label */}
              <div className="text-sm font-medium text-white/60 pr-3 truncate">
                {sector}
              </div>

              {/* Signal cells */}
              {SIGNAL_ORDER.map((sig) => {
                const key = `${sector}:${sig}`;
                const cell = cellMap[key];
                const z = cell?.z_score;
                const count7d = cell?.count_7d ?? 0;
                const isHovered = hovered === key;

                return (
                  <button
                    key={sig}
                    className="heat-cell relative rounded-xl h-10 flex items-center justify-center focus-visible:ring-1"
                    style={{
                      backgroundColor: count7d > 0
                        ? cellColor(z, count7d, sig)
                        : "rgba(255,255,255,0.03)",
                      boxShadow: isHovered && count7d > 0
                        ? `0 0 20px 4px ${EVENT_COLOR[sig]}30`
                        : undefined,
                      outline: "1px solid rgba(255,255,255,0.04)",
                      cursor: count7d > 0 ? "pointer" : "default",
                    }}
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleCellClick(sector, sig, count7d)}
                    title={count7d > 0
                      ? `${sector} · ${EVENT_LABEL[sig]}: ${count7d} this week — click to see them`
                      : `${sector} · ${EVENT_LABEL[sig]}: none this week`}
                    aria-label={`${sector} ${EVENT_LABEL[sig]}: ${count7d} events past 7 days`}
                  >
                    {count7d > 0 && (
                      <span
                        className="font-mono text-xs font-semibold"
                        style={{
                          color: count7d > 0 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)",
                        }}
                      >
                        {count7d}
                      </span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          ))}
        </motion.div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          {SIGNAL_ORDER.map((sig) => (
            <div key={sig} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: EVENT_COLOR[sig] }}
              />
              <span className="text-xs text-white/40">{EVENT_LABEL[sig]}</span>
            </div>
          ))}
          <span className="text-xs text-white/25 ml-auto">
            Brighter = unusually busy this week vs the last month · click a cell to see the events
          </span>
        </div>
      </div>
    </div>
  );
}
