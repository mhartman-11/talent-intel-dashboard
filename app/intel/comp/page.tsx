import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function CompPage() {
  const stream = getStream("comp");
  return (
    <StreamPage
      title="Compensation"
      overline="BLS CES · Avg Hourly Earnings"
      color={COLORS.orange}
      stream={stream}
      sources={[
        "BLS Current Employment Statistics — Average Hourly Earnings (public API)",
      ]}
      description="Average hourly earnings by industry supersector from the Bureau of Labor Statistics Current Employment Statistics program — one labeled row per sector per month, in dollars per hour. A federally mandated public record, updated monthly."
    />
  );
}
