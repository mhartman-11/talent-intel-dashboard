import { Suspense } from "react";
import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function HiringPage() {
  const stream = getStream("hiring");
  return (
    <Suspense fallback={null}>
      <StreamPage
        title="Who's Hiring"
        overline="Open roles · Public ATS boards"
        color={COLORS.orange}
        stream={stream}
        // No trend chart on purpose. Job boards return whatever is live right
        // now, so every posting lands with a near-identical timestamp — a
        // daily chart would plot our ingest schedule, not hiring activity.
        breakdownBy={{ key: "source", label: "Where these postings come from" }}
        sources={[
          "Greenhouse public job boards (public API)",
          "Lever public postings (public API)",
          "Ashby public job boards (public API)",
        ]}
        description="Live open roles pulled straight from companies' own public applicant tracking systems. These are the same boards a candidate sees on a company careers page, read through each vendor's public API."
        useIt="Use this to see which companies are actively adding headcount, and to build a sourcing string. Search a role and a city, then copy the generated Boolean string into LinkedIn or Google."
      />
    </Suspense>
  );
}
