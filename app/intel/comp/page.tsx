import { Suspense } from "react";
import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function CompPage() {
  const stream = getStream("comp");
  return (
    <Suspense fallback={null}>
    <StreamPage
      title="Compensation"
      overline="BLS Average Hourly Earnings"
      color={COLORS.orange}
      stream={stream}
      sources={[
        "BLS Current Employment Statistics — Average Hourly Earnings by sector (Public Data API)",
      ]}
      description="Average hourly earnings by industry sector from the Bureau of Labor Statistics Current Employment Statistics program (public API, no key required). Federally published wage data, updated on the BLS release schedule."
    />
    </Suspense>
  );
}
