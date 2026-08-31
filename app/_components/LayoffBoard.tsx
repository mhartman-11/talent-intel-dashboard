import Link from "next/link";
import { ArrowRight, ArrowUpRight, TrendUp, TrendDown, Minus } from "@phosphor-icons/react/dist/ssr";
import { GlassCard } from "./GlassCard";
import { COLORS } from "@/app/_design/tokens";
import { timeAgo } from "@/lib/utils";
import type { LayoffPulse } from "@/lib/types";

interface LayoffBoardProps {
  pulse: LayoffPulse;
}

/** Direction of travel vs the previous 30 days, in words rather than a bare %. */
function trendCopy(now: number, prev: number) {
  if (prev === 0) return { icon: Minus, text: "no prior-month baseline yet", color: "rgba(255,255,255,0.35)" };
  const pct = Math.round(((now - prev) / prev) * 100);
  if (pct > 10) return { icon: TrendUp, text: `up ${pct}% vs the 30 days before`, color: COLORS.cyan };
  if (pct < -10) return { icon: TrendDown, text: `down ${Math.abs(pct)}% vs the 30 days before`, color: "rgba(255,255,255,0.45)" };
  return { icon: Minus, text: "roughly flat vs the 30 days before", color: "rgba(255,255,255,0.45)" };
}

export function LayoffBoard({ pulse }: LayoffBoardProps) {
  const trend = trendCopy(pulse.events_30d, pulse.events_prev_30d);
  const TrendIcon = trend.icon;
  const topSectors = Object.entries(pulse.by_sector_30d)
    .filter(([sector]) => sector !== "Other")
    .slice(0, 5);

  return (
    <section className="px-4 sm:px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5 flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <p className="label-overline mb-1" style={{ color: `${COLORS.cyan}99` }}>
              Start here
            </p>
            <h2 className="headline-lg text-white">Who cut jobs in the last 30 days</h2>
          </div>
          <Link
            href="/intel/layoffs"
            className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
          >
            See all layoffs <ArrowRight size={12} />
          </Link>
        </div>

        <GlassCard className="p-5 sm:p-7">
          {/* Headline counts — announcements and companies, never a summed
              headcount. Most reports don't disclose one. */}
          <div className="flex flex-wrap gap-x-10 gap-y-5">
            <div>
              <span className="font-display font-black text-4xl sm:text-5xl" style={{ color: COLORS.cyan }}>
                {pulse.events_30d.toLocaleString()}
              </span>
              <p className="text-sm text-white/70 mt-1 font-medium">layoff announcements</p>
              <p className="text-xs text-white/35 mt-0.5">
                across {pulse.companies_30d.toLocaleString()} companies, past 30 days
              </p>
            </div>

            <div>
              <span className="font-display font-black text-4xl sm:text-5xl" style={{ color: COLORS.cyan }}>
                {pulse.events_7d.toLocaleString()}
              </span>
              <p className="text-sm text-white/70 mt-1 font-medium">in the last 7 days</p>
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: trend.color }}>
                <TrendIcon size={12} weight="bold" />
                {trend.text}
              </p>
            </div>

            {pulse.disclosed_jobs_30d != null && (
              <div>
                <span className="font-display font-black text-4xl sm:text-5xl text-white/85">
                  {pulse.disclosed_jobs_30d.toLocaleString()}
                </span>
                <p className="text-sm text-white/70 mt-1 font-medium">jobs, where a number was given</p>
                <p className="text-xs text-white/35 mt-0.5">
                  only {pulse.disclosed_events_30d} of {pulse.events_30d} announcements state a headcount,
                  so the real total is higher
                </p>
              </div>
            )}
          </div>

          {/* Sector spread */}
          {topSectors.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <p className="label-overline mb-2.5">Hardest hit industries, past 30 days</p>
              <div className="flex flex-wrap gap-1.5">
                {topSectors.map(([sector, count]) => (
                  <Link
                    key={sector}
                    href={`/intel/layoffs?sector=${encodeURIComponent(sector)}`}
                    className="px-2.5 py-1 rounded-full text-xs border transition-colors hover:border-white/25"
                    style={{
                      borderColor: `${COLORS.cyan}25`,
                      backgroundColor: `${COLORS.cyan}0d`,
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {sector}{" "}
                    <span className="font-mono text-white/40">{count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* The actual list — biggest disclosed cuts first, then most recent */}
          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <p className="label-overline mb-1">Biggest and most recent</p>
            <p className="text-xs text-white/30 mb-3">
              Sorted by headcount where it was reported, then by how recent. Click any row for the original article or filing.
            </p>

            <div className="divide-y divide-white/[0.04]">
              {pulse.top_events.map((evt) => (
                <Link
                  key={evt.id}
                  href={evt.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 py-2.5 transition-colors hover:bg-white/[0.03] rounded-lg px-2 -mx-2"
                >
                  {/* Headcount column — fixed width so the eye can scan it */}
                  <span
                    className="shrink-0 w-20 text-right font-display font-black text-lg tabular-nums"
                    style={{ color: evt.magnitude ? COLORS.cyan : "rgba(255,255,255,0.2)" }}
                  >
                    {evt.magnitude ? Math.round(evt.magnitude).toLocaleString() : "—"}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white/90 truncate">
                        {evt.company?.name ?? "Unknown company"}
                      </span>
                      {evt.company?.sector && evt.company.sector !== "Other" && (
                        <span className="text-[10px] text-white/30 font-medium">
                          {evt.company.sector}
                        </span>
                      )}
                      {evt.source === "state_warn" && (
                        <span
                          className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${COLORS.cyan}1a`, color: COLORS.cyan }}
                        >
                          Official filing
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/45 line-clamp-1 mt-0.5">{evt.raw_text}</p>
                  </div>

                  <span className="shrink-0 font-mono text-[10px] text-white/25">
                    {timeAgo(evt.ts)}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="shrink-0 text-white/20 group-hover:text-white/50 transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Provenance. Says what is actually in THIS window — Texas publishes
              WARN notices on a two-month lag, so claiming them here when the
              30-day window contains none would be false. */}
          <p className="mt-5 pt-4 border-t border-white/[0.06] text-xs text-white/30 leading-relaxed">
            {pulse.warn_events_30d > 0 ? (
              <>
                These come from news coverage (Google News and TechCrunch) plus official
                WARN Act filings, {pulse.warn_events_30d} of which fall in this window.
              </>
            ) : (
              <>
                These come from news coverage (Google News and TechCrunch). Official Texas
                WARN Act filings are published on roughly a two-month lag, so none land in
                the last 30 days
                {pulse.warn_events_total > 0 && (
                  <>
                    {" "}&mdash;{" "}
                    <Link href="/intel/layoffs" className="underline hover:text-white/60 transition-colors">
                      all {pulse.warn_events_total} of them are on the layoffs page
                    </Link>
                  </>
                )}
                .
              </>
            )}{" "}
            A headcount appears only where the source stated one. Nothing here is estimated.
          </p>
        </GlassCard>
      </div>
    </section>
  );
}
