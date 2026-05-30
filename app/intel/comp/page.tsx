import { getStream } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import { CompPanel } from "@/app/_components/CompPanel";

const SOURCES = [
  "BLS Current Employment Statistics — Average Hourly Earnings (public API)",
];

export default function CompPage() {
  const stream = getStream("comp");
  const color = COLORS.orange;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        className="pt-12 pb-8 px-4 sm:px-6"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 30% 0%, ${color}08 0%, transparent 70%)`,
        }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="label-overline mb-2" style={{ color: `${color}99` }}>
            BLS CES · Avg Hourly Earnings
          </p>
          <h1 className="display-md text-white mb-3">Compensation</h1>
          <p className="text-white/40 text-sm max-w-lg leading-relaxed">
            Average hourly earnings by industry supersector from the Bureau of
            Labor Statistics Current Employment Statistics program — in dollars
            per hour, with the trailing 6-month trend. A federally mandated
            public record, updated monthly. Highest-paid sector first.
          </p>
        </div>
      </section>

      {/* Panel */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <CompPanel events={stream.events} color={color} />

          {/* Source attribution */}
          <div className="mt-6">
            <p className="label-overline mb-2">Data sources</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {SOURCES.map((src) => (
                <li
                  key={src}
                  className="text-xs text-white/30 flex items-center gap-1"
                >
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {src}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
