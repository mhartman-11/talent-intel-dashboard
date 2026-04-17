"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/utils";

interface DataFreshnessChipProps {
  generatedAt: string;
  cadenceHours?: number;
}

export function DataFreshnessChip({
  generatedAt,
  cadenceHours = 6,
}: DataFreshnessChipProps) {
  const [display, setDisplay] = useState("");
  const [nextIn, setNextIn] = useState("");

  useEffect(() => {
    function update() {
      const ago = timeAgo(generatedAt);
      setDisplay(ago);

      const genMs = new Date(generatedAt).getTime();
      const nextMs = genMs + cadenceHours * 60 * 60 * 1000;
      const diff = nextMs - Date.now();
      if (diff > 0) {
        const hrs = Math.floor(diff / 3_600_000);
        const mins = Math.floor((diff % 3_600_000) / 60_000);
        setNextIn(hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`);
      } else {
        setNextIn("soon");
      }
    }
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [generatedAt, cadenceHours]);

  if (!display) return null;

  return (
    <div
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs"
      style={{
        backgroundColor: "rgba(129,236,255,0.06)",
        border: "1px solid rgba(129,236,255,0.12)",
        color: "rgba(129,236,255,0.7)",
      }}
      title={`Data generated at ${new Date(generatedAt).toUTCString()}`}
    >
      <span
        className="pulse-dot w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: "#81ecff" }}
      />
      <span>Updated {display}</span>
      {nextIn && (
        <>
          <span style={{ color: "rgba(129,236,255,0.3)" }}>·</span>
          <span style={{ color: "rgba(129,236,255,0.4)" }}>Next {nextIn}</span>
        </>
      )}
    </div>
  );
}
