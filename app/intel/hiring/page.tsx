import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { StreamPage } from "../_StreamPage";

export default function HiringPage() {
  const stream = getStream("hiring");
  return (
    <StreamPage
      title="Hiring Velocity"
      overline="Job Postings · Public ATS Feeds"
      color={COLORS.orange}
      stream={stream}
      sources={[
        "Greenhouse (public job boards)",
        "Lever (public job boards)",
        "Ashby (public job boards)",
        "USCIS H-1B Employer Data Hub",
      ]}
      description="Hiring signals from public ATS job-board APIs (Greenhouse, Lever, Ashby) for tracked companies, plus USCIS H-1B sponsorship volume by employer."
    />
  );
}
