import Link from "next/link";
import { ArrowRight, ChartBar, Briefcase, Buildings, Wallet, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { HeatGrid } from "./_components/HeatGrid";
import { SignalTape } from "./_components/SignalTape";
import { GlassCard } from "./_components/GlassCard";
import { EventRow } from "./_components/EventRow";
import { LayoffBoard } from "./_components/LayoffBoard";
import { getSnapshot, getSectorMatrix } from "@/lib/data";
import { COLORS } from "./_design/tokens";

// Stream cards. `sub` says what the stream IS; `use` says what you do with it —
// a cold visitor needs the second one more than the first.
const STREAM_CARDS = [
  {
    href: "/intel/layoffs",
    label: "Layoffs",
    sub: "News coverage + official WARN filings",
    use: "Find candidates before they hit the market",
    icon: ChartBar,
    color: COLORS.cyan,
  },
  {
    href: "/intel/hiring",
    label: "Who's Hiring",
    sub: "Live roles from public ATS boards",
    use: "See who's adding headcount, build a sourcing string",
    icon: Briefcase,
    color: COLORS.orange,
  },
  {
    href: "/intel/org-moves",
    label: "Leadership & Funding",
    sub: "SEC 8-K filings, Form D, funding news",
    use: "Spot hiring waves a quarter early",
    icon: Buildings,
    color: COLORS.violet,
  },
  {
    href: "/intel/comp",
    label: "Pay Benchmarks",
    sub: "BLS wage data by sector and occupation",
    use: "Sanity-check an offer with a neutral number",
    icon: Wallet,
    color: COLORS.orange,
  },
  {
    href: "/intel/macro",
    label: "Market Backdrop",
    sub: "Unemployment, job openings, quits rate",
    use: "Read the room before a comp conversation",
    icon: TrendUp,
    color: COLORS.cyanDim,
  },
];

export default function HomePage() {
  const snapshot = getSnapshot();
  const matrix = getSectorMatrix();
  const pulse = snapshot.layoff_pulse;

  // The mixed feed is the last thing on the page now, and it is capped so job
  // postings can't bury the rarer signals. Layoffs get their own board above.
  const feed = snapshot.recent_signals.filter((e) => e.type !== "posting").slice(0, 12);

  const liveSources = snapshot.sources.filter((s) => s.ok && s.record_count > 0);

  // The tape scrolls layoffs only. A mixed tape was just motion; this one
  // reinforces what the page leads with.
  const tapeEvents = (pulse?.top_events ?? []).length
    ? pulse!.top_events
    : snapshot.recent_signals.filter((e) => e.type === "layoff").slice(0, 12);

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-16 pb-8 px-4 sm:px-6 overflow-hidden"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(129,236,255,0.04) 0%, transparent 70%)" }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="label-overline mb-4">US Talent Market · Updated every 6 hours</p>

          <h1
            className="display-lg text-white mb-4 max-w-3xl"
            style={{ textShadow: "0 0 80px rgba(129,236,255,0.12)" }}
          >
            Who&rsquo;s cutting.
            <br />
            <span style={{ color: COLORS.cyan }}>Who&rsquo;s hiring.</span>
          </h1>

          <p className="text-white/55 text-base max-w-xl leading-relaxed mb-7">
            A free read on the US job market for recruiters. Layoffs, open roles,
            leadership changes, and pay data, pulled from public records and
            government APIs. Every row links to the original source.
          </p>

          <div className="flex flex-wrap gap-6">
            {[
              { label: "Signals tracked", value: snapshot.total_events.toLocaleString(), color: COLORS.cyan },
              { label: "New in the last 7 days", value: snapshot.events_7d.toLocaleString(), color: COLORS.orange },
              { label: "Live data sources", value: liveSources.length.toString(), color: COLORS.violet },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="font-display font-black text-3xl" style={{ color }}>
                  {value}
                </span>
                <span className="label-overline">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {tapeEvents.length > 0 && (
        <SignalTape events={tapeEvents} caption="Latest cuts" />
      )}

      {/* ── Layoff board — the reason most people open this ───────────────── */}
      {pulse && pulse.events_30d > 0 && <LayoffBoard pulse={pulse} />}

      {/* ── Stream cards ──────────────────────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-5">
            <p className="label-overline mb-1">The other four streams</p>
            <h2 className="headline-lg text-white">What else is in here</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {STREAM_CARDS.map(({ href, label, sub, use, icon: Icon, color }) => (
              <Link key={href} href={href}>
                <GlassCard hover className="p-4 flex flex-col gap-3 h-full group">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                      {label}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{sub}</p>
                    <p className="text-xs mt-2 leading-relaxed" style={{ color: `${color}bb` }}>
                      {use}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="mt-auto text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all"
                  />
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Heat Grid ─────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <p className="label-overline mb-1">Industry × Signal</p>
            <h2 className="headline-lg text-white mb-2">Where activity is unusual this week</h2>
            <p className="text-sm text-white/45 max-w-2xl leading-relaxed">
              Industries down the side, signal types across the top. Each cell compares
              this week&rsquo;s volume against that industry&rsquo;s own average for the
              last 30 days, so a bright cell means unusual for them, not just busy.
              Click any cell to see the events behind it.
            </p>
          </div>

          <GlassCard className="p-5 sm:p-6">
            {matrix ? (
              <HeatGrid matrix={matrix} />
            ) : (
              <div className="text-center py-12 text-white/25 font-mono text-sm">
                Heat grid available after first ingest run
              </div>
            )}
          </GlassCard>
        </div>
      </section>

      {/* ── Everything else, newest first ─────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="label-overline mb-1">Newest first</p>
              <h2 className="headline-lg text-white mb-1.5">Latest leadership and funding moves</h2>
              <p className="text-sm text-white/45 max-w-xl leading-relaxed">
                Executive changes, funding rounds, and pay releases as they land. Open
                roles are excluded here because they arrive in the thousands.
              </p>
            </div>
            <Link
              href="/intel/org-moves"
              className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1 shrink-0"
            >
              See all moves <ArrowRight size={12} />
            </Link>
          </div>

          <GlassCard>
            {feed.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {feed.map((evt) => (
                  <EventRow key={evt.id} event={evt} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 flex flex-col items-center gap-3">
                <span className="font-mono text-sm text-white/25">No signals yet</span>
                <p className="text-xs text-white/15 max-w-sm text-center leading-relaxed">
                  Run{" "}
                  <code className="font-mono text-white/30">python -m ingest.run</code>{" "}
                  locally or trigger the GitHub Actions workflow to populate data.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
