import { Suspense } from "react";
import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function MacroPage() {
  const stream = getStream("macro");
  return (
    <Suspense fallback={null}>
      <StreamPage
        title="Labor Market Backdrop"
        overline="Unemployment · Job openings · Quits"
        color={COLORS.cyanDim}
        stream={stream}
        // No trend chart: monthly government series, released once a month.
        sources={[
          "FRED (Federal Reserve Bank of St. Louis) — unemployment, JOLTS, earnings (public API)",
        ]}
        description="Economy-wide context, updated monthly. Unemployment rate, job openings rate, quits rate, and layoff rate come from the Federal Reserve's FRED database, which republishes the official BLS series."
        useIt="Use this to read the room before a comp conversation. A falling quits rate means candidates are staying put and counter-offers are landing; a rising openings rate means you are competing harder for the same person."
      />
    </Suspense>
  );
}
