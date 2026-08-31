import { Suspense } from "react";
import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function OrgMovesPage() {
  const stream = getStream("org-moves");
  return (
    <Suspense fallback={null}>
      <StreamPage
        title="Leadership & Funding Moves"
        overline="8-K filings · Form D · Funding news"
        color={COLORS.violet}
        stream={stream}
        // No trend chart. SEC full-text search returns newest-first and we cap
        // each query at 80 hits, so recent days come back full while older days
        // are truncated — a daily chart would show a fake spike at "today".
        breakdownBy={{ key: "sector", label: "Which industries are seeing moves" }}
        sources={[
          "SEC EDGAR full-text search — 8-K Item 5.02 executive changes (public API)",
          "SEC EDGAR — Form D securities offerings (public API)",
          "TechCrunch Venture — funding coverage (public RSS)",
        ]}
        description="Two things that reliably precede hiring: a new executive, and new money. Executive changes come from 8-K filings companies must make within four business days of a leadership change. Funding comes from Form D filings and venture press coverage."
        useIt="Use this as an early warning. A new VP or a fresh round usually means a hiring wave one to two quarters out, so it is the right moment to introduce yourself before the roles are posted."
      />
    </Suspense>
  );
}
