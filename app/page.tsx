import Link from "next/link";
import { ArrowRight, ChartBar, Briefcase, Buildings, Wallet, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { SignalTape } from "./_components/SignalTape";
import { HeatGrid } from "./_components/HeatGrid";
import { GlassCard } from "./_components/GlassCard";
import { EventRow } from "./_components/EventRow";
import { getSnapshot, getSectorMatrix } from "@/lib/data";
import { COLORS } from "./_design/tokens";

// Sections with drill-down links
const STREAM_CARDS = [
  {
    href: "/intel/layoffs",
    label: "Workforce Shocks",
    sub: "Layoffs · RIFs · WARN notices",
    icon: ChartBar,
    color: COLORS.cyan,
  },
  {
    href: "/intel/hiring",
    label: "Hiring Velocity",
    sub: "Job boards · HN Who's Hiring",
    icon: Briefcase,
    color: COLORS.orange,
  },
  {
    href: "/intel/org-moves",
    label: "Org & Exec Moves",
    sub: "8-K filings · Funding · M&A",
    icon: Buildings,
    color: COLORS.violet,
  },
  {
    href: "/intel/comp",
    label: "Compensation",
    sub: "BLS OEWS · H-1B LCA data",
    icon: Wallet,
    color: COLORS.orange,
  },
  {
    href: "/intel/macro",
    label: "Macro Labor",
    sub: "FRED · BLS JOLTS · Indeed",
    icon: TrendUp,
    color: COLORS.cyan,
  },
];

export default function HomePage() {
  const snapshot = getSnapshot();
  const matrix = getSectorMatrix();
  const recentEvents = snapshot.recent_signals.slice(0, 20);

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative pt-16 pb-12 px-4 sm:px-6 overflow-hidden"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(129,236,255,0.04) 0%, transparent 70%)" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Overline */}
          <p className="label-overline mb-4">US Talent Market · Live</p>

          {/* Kinetic headline — rendered as h1 with CSS melt-in */}
          <h1
            className="display-lg text-white mb-4 max-w-3xl"
            style={{ textShadow: "0 0 80px rgba(129,236,255,0.12)" }}
          >
            US Talent Market
            <br />
            <span style={{ color: COLORS.cyan }}>Intelligence.</span>
          </h1>

          <p className="text-white/50 text-base max-w-xl leading-relaxed mb-8">
            Real-time signals from public data — layoffs, hiring velocity, org moves,
            comp data, and macro labor indicators. Zero paywalls. Every number sourced.
          </p>

          {/* Stat strip */}
          <div className="flex flex-wrap gap-6 mb-8">
            {[
              { label: "Total Events", value: snapshot.total_events.toLocaleString(), color: COLORS.cyan },
              { label: "Past 7 Days", value: snapshot.events_7d.toLocaleString(), color: COLORS.orange },
              { label: "Data Sources", value: snapshot.sources.length.toString(), color: COLORS.violet },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span
                  className="font-display font-black text-3xl"
                  style={{ color }}
                >
                  {value}
                </span>
                <span className="label-overline">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Signal Tape ───────────────────────────────────────────────────── */}
      <SignalTape events={recentEvents} />

      {/* ── Heat Grid ─────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-baseline justify-between gap-4 flex-wrap">
            <div>
              <p className="label-overline mb-1">Sector × Signal</p>
              <h2 className="headline-lg text-white">Activity Heat Grid</h2>
            </div>
            <p className="text-xs text-white/30 max-w-xs text-right leading-relaxed">
              Cell intensity = 7-day event count vs 30-day baseline (Z-score).
              Click any cell to drill in.
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

      {/* ── Stream Cards ──────────────────────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="label-overline mb-6">Intelligence Streams</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {STREAM_CARDS.map(({ href, label, sub, icon: Icon, color }) => (
              <Link key={href} href={href}>
                <GlassCard
                  hover
                  className="p-4 flex flex-col gap-3 h-full group"
                >
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
                    <p className="text-xs text-white/35 mt-0.5">{sub}</p>
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

      {/* ── Recent Signals ────────────────────────────────────────────────── */}
      <section className="py-8 px-4 sm:px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <div>
              <p className="label-overline mb-1">Latest</p>
              <h2 className="headline-lg text-white">Recent Signals</h2>
            </div>
            <Link
              href="/intel/layoffs"
              className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
            >
              All streams <ArrowRight size={12} />
            </Link>
          </div>

          <GlassCard>
            {recentEvents.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {recentEvents.map((evt) => (
                  <EventRow key={evt.id} event={evt} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 flex flex-col items-center gap-3">
                <span className="font-mono text-sm text-white/25">
                  No signals yet
                </span>
                <p className="text-xs text-white/15 max-w-sm text-center leading-relaxed">
                  Run{" "}
                  <code className="font-mono text-white/30">
                    python -m ingest.run
                  </code>{" "}
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
