"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MagnifyingGlass, Copy, Check } from "@phosphor-icons/react";
import { GlassCard } from "@/app/_components/GlassCard";
import { EventRow } from "@/app/_components/EventRow";
import { SectorFilter } from "@/app/_components/SectorFilter";
import { TrendChart } from "@/app/_components/TrendChart";
import type { Stream } from "@/lib/types";

interface StreamPageProps {
  title: string;
  overline: string;
  color: string;
  stream: Stream;
  sources: string[];
  description: string;
  /** One line answering "what do I actually do with this page?". */
  useIt: string;
  /**
   * Only set this where event timestamps are real event dates. Job-board
   * postings all land at ingest time, so a daily chart of them would plot
   * when the scraper ran, not what the market did.
   */
  trend?: { days: number; unitLabel: string };
  /** Column of `extras` (or "source") to summarise when there is no trend. */
  breakdownBy?: { key: "source" | "sector"; label: string };
}

function buildSourcingString(companies: string[], query: string): string {
  const words = query.trim().split(/\s+/).filter(Boolean);
  const inIdx = words.findIndex((w) => w.toLowerCase() === "in");
  const roleWords = inIdx > 0 ? words.slice(0, inIdx) : words;
  const locWords = inIdx > 0 ? words.slice(inIdx + 1) : [];

  const parts: string[] = [];
  if (companies.length > 0) {
    parts.push(`(${companies.slice(0, 10).map((c) => `"${c}"`).join(" OR ")})`);
  }
  if (roleWords.length > 0) parts.push(`"${roleWords.join(" ")}"`);
  if (locWords.length > 0) parts.push(locWords.join(" "));
  parts.push("site:linkedin.com/in");

  return parts.join(" ");
}

export function StreamPage({
  title,
  overline,
  color,
  stream,
  sources,
  description,
  useIt,
  trend,
  breakdownBy,
}: StreamPageProps) {
  // Seed the sector filter from a ?sector= deep link (e.g. from the home heat grid).
  const searchParams = useSearchParams();
  const initialSector = searchParams.get("sector");
  const [activeSector, setActiveSector] = useState<string | null>(initialSector);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const eventRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);

  // When arriving via a deep link, scroll the filtered list into view.
  useEffect(() => {
    if (initialSector) {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [initialSector]);

  const sectorFiltered = useMemo(
    () =>
      activeSector
        ? stream.events.filter((e) => e.company?.sector === activeSector)
        : stream.events,
    [stream.events, activeSector]
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return sectorFiltered;
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    return sectorFiltered.filter((evt) => {
      const haystack = [
        evt.raw_text,
        evt.company?.name,
        evt.company?.hq_region,
        ...(evt.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }, [sectorFiltered, query]);

  const companies = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{ name: string; firstId: string }> = [];
    for (const evt of filtered) {
      const name = evt.company?.name;
      if (name && name !== "Unknown" && !seen.has(name)) {
        seen.add(name);
        out.push({ name, firstId: evt.id });
      }
    }
    return out;
  }, [filtered]);

  // Where the records came from / how they split. Used in place of a trend
  // chart on streams whose timestamps are ingest artefacts, not event dates.
  // Counts come from the ingest step because `stream.events` is capped at 500
  // — tallying the shipped slice reported "ashby: 1" out of 247.
  const breakdown = useMemo(() => {
    if (!breakdownBy) return [];
    const counts =
      breakdownBy.key === "sector" ? stream.sector_counts : stream.source_counts;
    if (!counts) return [];
    return Object.entries(counts)
      .filter(([label]) => label !== "Other")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [stream.sector_counts, stream.source_counts, breakdownBy]);

  const breakdownTotal = useMemo(
    () => breakdown.reduce((acc, [, n]) => acc + n, 0),
    [breakdown]
  );

  const scrollToEvent = useCallback((id: string) => {
    eventRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const sourcingString = useMemo(
    () =>
      query.trim()
        ? buildSourcingString(
            companies.map((c) => c.name),
            query
          )
        : "",
    [companies, query]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sourcingString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section
        className="pt-12 pb-8 px-4 sm:px-6"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 30% 0%, ${color}08 0%, transparent 70%)`,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="label-overline mb-2" style={{ color: `${color}99` }}>
            {overline}
          </p>
          <h1 className="display-md text-white mb-3">{title}</h1>
          <p className="text-white/40 text-sm max-w-xl leading-relaxed mb-3">
            {description}
          </p>
          <p
            className="text-sm max-w-xl leading-relaxed mb-6 pl-3 border-l-2"
            style={{ borderColor: `${color}55`, color: "rgba(255,255,255,0.65)" }}
          >
            {useIt}
          </p>

          {/* Stats */}
          <div className="flex gap-6 flex-wrap mb-6">
            <div>
              <span className="font-display font-black text-2xl" style={{ color }}>
                {stream.total.toLocaleString()}
              </span>
              <p className="label-overline mt-0.5">Records in this stream</p>
            </div>
            <div>
              <span className="font-display font-black text-2xl" style={{ color }}>
                {filtered.length.toLocaleString()}
              </span>
              <p className="label-overline mt-0.5">Matching your filters</p>
              {stream.showing != null && stream.showing < stream.total && (
                <p className="text-[10px] text-white/30 mt-0.5">
                  newest {stream.showing.toLocaleString()} loaded
                </p>
              )}
            </div>
          </div>

          {/* Trend chart — only on streams whose timestamps are real event
              dates. Everything else gets a breakdown, which is honest about
              what the data can actually support. */}
          {trend && stream.events.length > 0 && (
            <div className="max-w-2xl">
              <TrendChart
                events={stream.events}
                color={color}
                days={trend.days}
                unitLabel={trend.unitLabel}
              />
            </div>
          )}

          {!trend && breakdown.length > 0 && (
            <div className="max-w-2xl">
              <p className="text-xs text-white/45 mb-2.5">{breakdownBy?.label}</p>
              <div className="space-y-1.5">
                {breakdown.map(([label, count]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-32 sm:w-44 shrink-0 text-xs text-white/60 truncate">
                      {label}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((count / (breakdownTotal || 1)) * 100)}%`,
                          backgroundColor: color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-xs text-white/40 tabular-nums">
                      {count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filters + table */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-7xl mx-auto" ref={listRef}>

          {/* Search bar */}
          <div className="mb-4 relative">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search — e.g. "Account Executive Chicago" or "Maintenance Mechanic Grand Rapids"'
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          {/* Sourcing string */}
          {sourcingString && (
            <div className="mb-4 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-1.5">
                <p className="label-overline" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Sourcing string
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="font-mono text-xs text-white/60 break-all leading-relaxed">
                {sourcingString}
              </p>
            </div>
          )}

          {/* Sector filter */}
          <div className="mb-4">
            <SectorFilter active={activeSector} onChange={setActiveSector} />
          </div>

          {/* Company quick-scan */}
          {companies.length > 0 && (
            <div className="mb-4">
              <p
                className="label-overline mb-2"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Companies in view — click to jump
              </p>
              <div className="flex flex-wrap gap-1.5">
                {companies.map(({ name, firstId }) => (
                  <button
                    key={name}
                    onClick={() => scrollToEvent(firstId)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium border border-white/[0.08] bg-white/[0.03] text-white/55 hover:text-white/90 hover:border-white/20 transition-colors cursor-pointer"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Event list */}
          <GlassCard>
            {filtered.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {filtered.map((evt) => (
                  <div
                    key={evt.id}
                    ref={(el) => {
                      if (el) eventRefs.current.set(evt.id, el);
                      else eventRefs.current.delete(evt.id);
                    }}
                  >
                    <EventRow event={evt} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-white/25 font-mono text-sm">
                {stream.events.length === 0
                  ? "No data yet — run ingest to populate"
                  : "No events match the selected filter"}
              </div>
            )}
          </GlassCard>

          {/* Source attribution */}
          <div className="mt-6">
            <p className="label-overline mb-2">Data sources</p>
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {sources.map((src) => (
                <li key={src} className="text-xs text-white/30 flex items-center gap-1">
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
