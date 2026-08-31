import { Suspense } from "react";
import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function CompPage() {
  const stream = getStream("comp");
  return (
    <Suspense fallback={null}>
      <StreamPage
        title="Pay Benchmarks"
        overline="Government wage data"
        color={COLORS.orange}
        stream={stream}
        // No trend chart: these are monthly and annual government series, not
        // daily events. Sixty daily bars would be almost entirely empty.
        breakdownBy={{ key: "source", label: "Which government series these come from" }}
        sources={[
          "BLS Current Employment Statistics — average hourly earnings by sector (public API)",
          "BLS Occupational Employment and Wage Statistics — pay by occupation (public API)",
        ]}
        description="Official US wage data from the Bureau of Labor Statistics. Average hourly earnings by sector update monthly; pay by occupation updates annually. This is the government's own number, not a survey of self-reported salaries."
        useIt="Use this to sanity-check an offer or push back on a hiring manager's range. It is the neutral third-party figure both sides can agree on."
      />
    </Suspense>
  );
}
