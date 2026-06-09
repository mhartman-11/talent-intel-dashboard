import { Suspense } from "react";
import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function LayoffsPage() {
  const stream = getStream("layoffs");
  return (
    <Suspense fallback={null}>
    <StreamPage
      title="Workforce Shocks"
      overline="Layoffs · RIFs · WARN Notices"
      color={COLORS.cyan}
      stream={stream}
      sources={[
        "Google News — layoffs across all outlets (RSS)",
        "TechCrunch — tech layoff coverage (RSS)",
        "Texas WARN Act notices (data.texas.gov open data)",
      ]}
      description="Layoff events from three public feeds: Google News (catches any layoff in the news, across every outlet), TechCrunch's tech-layoff coverage, and official Texas WARN Act filings — the legally required advance notice of mass layoffs. All data is public record and every row links to its original source."
    />
    </Suspense>
  );
}
