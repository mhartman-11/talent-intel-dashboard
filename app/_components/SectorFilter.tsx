"use client";

import { SECTOR_ORDER } from "@/app/_design/tokens";
import clsx from "clsx";

interface SectorFilterProps {
  active: string | null;
  onChange: (sector: string | null) => void;
}

export function SectorFilter({ active, onChange }: SectorFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange(null)}
        className={clsx(
          "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
          active === null
            ? "text-white"
            : "text-white/40 hover:text-white/70"
        )}
        style={
          active === null
            ? { backgroundColor: "rgba(255,255,255,0.1)" }
            : undefined
        }
      >
        All Sectors
      </button>
      {SECTOR_ORDER.map((sector) => (
        <button
          key={sector}
          onClick={() => onChange(active === sector ? null : sector)}
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
            active === sector
              ? "text-white"
              : "text-white/40 hover:text-white/70"
          )}
          style={
            active === sector
              ? { backgroundColor: "rgba(255,255,255,0.1)" }
              : undefined
          }
        >
          {sector}
        </button>
      ))}
    </div>
  );
}
