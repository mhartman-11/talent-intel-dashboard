import { CheckCircle, XCircle, Clock, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { GlassCard } from "@/app/_components/GlassCard";
import { getSourcesMeta } from "@/lib/data";
import { COLORS } from "@/app/_design/tokens";
import Link from "next/link";

const TOS_LABELS: Record<string, string> = {
  public_api: "Public API",
  public_csv: "Public CSV",
  public_rss: "Public RSS",
  public_html: "Public HTML",
};

export default function SourcesPage() {
  const { sources, generated_at } = getSourcesMeta();

  const okCount = sources.filter((s) => s.ok).length;
  const totalCount = sources.length;

  return (
    <div className="min-h-screen">
      <section
        className="pt-12 pb-8 px-4 sm:px-6"
        style={{
          background: "radial-gradient(ellipse 50% 30% at 50% 0%, rgba(210,119,255,0.05) 0%, transparent 70%)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="label-overline mb-2">Methodology &amp; Transparency</p>
          <h1 className="display-md text-white mb-3">Data Sources</h1>
          <p className="text-white/40 text-sm max-w-xl leading-relaxed mb-6">
            Every signal on this dashboard comes from a free, publicly accessible source.
            No paywalls. No auth-walled scraping. No AI-generated content.
            Every number is traceable to its origin.
          </p>

          <div className="flex gap-6 flex-wrap">
            <div>
              <span
                className="font-display font-black text-2xl"
                style={{ color: okCount === totalCount ? COLORS.orange : COLORS.cyan }}
              >
                {okCount}/{totalCount}
              </span>
              <p className="label-overline mt-0.5">Sources Live</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-7xl mx-auto">

          {/* Anti-slop commitment box */}
          <GlassCard className="p-5 mb-6 border-l-2" style={{ borderLeftColor: COLORS.cyan }}>
            <h2 className="text-sm font-semibold text-white/90 mb-2">
              Anti-slop commitments
            </h2>
            <ul className="space-y-1.5">
              {[
                "Zero AI-generated prose — all content is structured data",
                "Zero paywalled sources — every source is publicly accessible",
                "Zero login-required scraping — we respect robots.txt and ToS",
                "Every data point links back to its primary source",
                "Source health is monitored and surfaced here in real time",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-white/50">
                  <CheckCircle
                    size={12}
                    className="mt-0.5 shrink-0"
                    style={{ color: COLORS.cyan }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Source table */}
          <GlassCard>
            <div className="divide-y divide-white/[0.04]">
              {sources.length === 0 ? (
                <div className="text-center py-12 text-white/25 font-mono text-sm">
                  No source data yet — run ingest first
                </div>
              ) : (
                sources.map((src) => (
                  <div
                    key={src.source}
                    className="px-5 py-4 flex items-start gap-4"
                  >
                    {/* Status icon */}
                    {src.ok ? (
                      <CheckCircle
                        size={16}
                        className="mt-0.5 shrink-0"
                        style={{ color: COLORS.orange }}
                      />
                    ) : (
                      <XCircle
                        size={16}
                        className="mt-0.5 shrink-0"
                        style={{ color: COLORS.cyan }}
                      />
                    )}

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-white/90 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          {src.display_name}
                          <ArrowUpRight size={12} className="text-white/30" />
                        </Link>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          {TOS_LABELS[src.tos_posture] ?? src.tos_posture}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.3)",
                          }}
                        >
                          Every {src.cadence_hours}h
                        </span>
                      </div>

                      {src.last_ok && (
                        <p className="mt-1 text-xs text-white/30 font-mono">
                          Last OK: {new Date(src.last_ok).toUTCString()}
                        </p>
                      )}

                      {src.errors.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {src.errors.slice(0, 2).map((err, i) => (
                            <li key={i} className="text-xs text-white/25 font-mono truncate">
                              ⚠ {err}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Record count */}
                    <div className="text-right shrink-0">
                      <span
                        className="font-mono text-sm font-bold"
                        style={{ color: src.ok ? COLORS.orange : "rgba(255,255,255,0.2)" }}
                      >
                        {src.record_count.toLocaleString()}
                      </span>
                      <p className="label-overline text-right" style={{ fontSize: "9px" }}>records</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          <p className="mt-4 text-xs text-white/20 text-center font-mono">
            Status as of {new Date(generated_at).toUTCString()}
          </p>
        </div>
      </section>
    </div>
  );
}
