import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function HiringPage() {
  const stream = getStream("hiring");
  return (
    <StreamPage
      title="Hiring Velocity"
      overline="Job Postings · HN Who's Hiring"
      color={COLORS.orange}
      stream={stream}
      sources={[
        "Greenhouse (public job boards)",
        "Lever (public job boards)",
        "Ashby (public job boards)",
        "Workable (public job boards)",
        "HN Who is Hiring (Algolia API)",
      ]}
      description="Hiring signals pulled from public-facing job boards that companies opt into. HN Who is Hiring thread parsed monthly via the official HN Algolia API."
    />
  );
}
