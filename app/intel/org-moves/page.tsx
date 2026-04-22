import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function OrgMovesPage() {
  const stream = getStream("org-moves");
  return (
    <StreamPage
      title="Org & Exec Moves"
      overline="SEC 8-K · Funding · M&A"
      color={COLORS.violet}
      stream={stream}
      sources={[
        "SEC EDGAR EFTS — 8-K Item 5.02 (exec changes)",
        "TechCrunch Venture RSS (funding rounds)",
      ]}
      description="Executive appointment and departure filings from SEC 8-K Item 5.02 mandatory disclosures. Funding events from TechCrunch Venture RSS. All primary sources are public record."
    />
  );
}
