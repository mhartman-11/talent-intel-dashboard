import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function LayoffsPage() {
  const stream = getStream("layoffs");
  return (
    <StreamPage
      title="Workforce Shocks"
      overline="Layoffs · RIFs · WARN Notices"
      color={COLORS.cyan}
      stream={stream}
      sources={["layoffs.fyi (public CSV)", "trueup.io (RSS)", "State WARN portals (CA, NY, IL, TX, OH)"]}
      description="Layoff events sourced from layoffs.fyi public CSV exports, trueup.io RSS, and state WARN Act portal disclosures. All data is public record."
    />
  );
}
