import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function CompPage() {
  const stream = getStream("comp");
  return (
    <StreamPage
      title="Compensation"
      overline="BLS OEWS · H-1B LCA Disclosures"
      color={COLORS.orange}
      stream={stream}
      sources={[
        "BLS Occupational Employment & Wage Statistics (OEWS API)",
        "DOL H-1B LCA Disclosure Data (public bulk CSV)",
      ]}
      description="Wage data from the Bureau of Labor Statistics Occupational Employment Statistics program and Department of Labor H-1B Labor Condition Application disclosures. Both are federally mandated public records."
    />
  );
}
