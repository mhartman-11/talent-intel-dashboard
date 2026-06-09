import { Suspense } from "react";
import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function MacroPage() {
  const stream = getStream("macro");
  return (
    <Suspense fallback={null}>
    <StreamPage
      title="Macro Labor"
      overline="BLS Unemployment · JOLTS"
      color={COLORS.cyan}
      stream={stream}
      sources={[
        "BLS — US Unemployment Rate (LNS14000000)",
        "BLS JOLTS — Job Openings Rate (JTS…JOR)",
        "BLS JOLTS — Quits Rate (JTS…QUR)",
        "BLS JOLTS — Layoffs & Discharges Rate (JTS…LDR)",
        "BLS — Private Sector Avg Hourly Earnings (CES0500000003)",
      ]}
      description="Economy-wide labor indicators from the Bureau of Labor Statistics Public Data API (no key required) — unemployment, the JOLTS job-openings/quits/layoffs rates, and private-sector wage growth. Background context for the company-level signals, updated on the BLS release schedule."
    />
    </Suspense>
  );
}
