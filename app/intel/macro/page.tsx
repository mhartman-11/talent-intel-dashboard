import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function MacroPage() {
  const stream = getStream("macro");
  return (
    <StreamPage
      title="Macro Labor"
      overline="FRED · BLS JOLTS · Indeed"
      color={COLORS.cyan}
      stream={stream}
      sources={[
        "FRED — Unemployment Rate (UNRATE)",
        "FRED — JOLTS Job Openings Rate (JTSJOR)",
        "FRED — JOLTS Quits Rate (JTSQUR)",
        "FRED — JOLTS Layoffs Rate (JTSLDL)",
        "FRED — Private Sector Avg Hourly Earnings (CES0500000003)",
        "Indeed Hiring Lab RSS",
      ]}
      description="Macroeconomic labor indicators from the Federal Reserve Economic Data API and Bureau of Labor Statistics Job Openings and Labor Turnover Survey. Free, public APIs updated on BLS release schedule."
    />
  );
}
