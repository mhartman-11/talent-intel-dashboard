import { Suspense } from "react";
import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function LayoffsPage() {
  const stream = getStream("layoffs");
  return (
    <Suspense fallback={null}>
      <StreamPage
        title="Layoffs"
        overline="Job cuts · RIFs · WARN filings"
        color={COLORS.cyan}
        stream={stream}
        // Layoff dates are real event dates (publication date or WARN notice
        // date), so a daily chart here means something.
        trend={{ days: 90, unitLabel: "layoff announcements" }}
        sources={[
          "Google News — layoff coverage across all outlets (public RSS)",
          "TechCrunch — tech layoff coverage (public RSS)",
          "Texas WARN Act notices (data.texas.gov open-data API)",
        ]}
        description="Every layoff we can find in public record. Two news feeds catch announcements as they are reported, and the Texas WARN Act feed adds official filings — the notice a company is legally required to file before a mass layoff. WARN rows always carry an exact headcount; news rows only carry one when the article stated it."
        useIt="Use this to find candidates before they hit the open market. Filter by sector or search a city, then work the company list — people affected by a layoff filed today are usually looking within two weeks."
      />
    </Suspense>
  );
}
