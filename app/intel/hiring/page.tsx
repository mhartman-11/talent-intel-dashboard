import { Suspense } from "react";
import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function HiringPage() {
  const stream = getStream("hiring");
  return (
    <Suspense fallback={null}>
    <StreamPage
      title="Hiring Velocity"
      overline="HN Who's Hiring"
      color={COLORS.orange}
      stream={stream}
      sources={[
        "Hacker News “Who is Hiring” thread (official HN Algolia API)",
      ]}
      description="Hiring signals parsed from the monthly Hacker News “Who is Hiring” thread via the official HN Algolia API. Each posting links back to its original comment."
    />
    </Suspense>
  );
}
