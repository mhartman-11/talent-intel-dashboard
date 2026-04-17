"use client";

import { useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { GlassCard } from "@/app/_components/GlassCard";
import { EventRow } from "@/app/_components/EventRow";
import { SectorFilter } from "@/app/_components/SectorFilter";
import type { Stream } from "@/lib/types";

interface StreamPageProps {
  title: string;
  overline: string;
  color: string;
  stream: Stream;
  sources: string[];
  description: string;
}

export function StreamPage({
  title,
  overline,
  color,
  stream,
  sources,
  description,
}: StreamPageProps) {
  const [activeSector, setActiveSector] = useState<string | null>(null);

  const filtered = activeSector
    ? stream.events.filter((e) => e.company?.sector === activeSector)
    : stream.events;

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
          <p className="text-white/40 text-sm max-w-lg leading-relaxed mb-6">
            {description}
          </p>

          {/* Stats */}
          <div className="flex gap-6 flex-wrap">
            <div>
              <span className="font-display font-black text-2xl" style={{ color }}>
                {stream.total.toLocaleString()}
              </span>
              <p className="label-overline mt-0.5">Total Records</p>
            </div>
            <div>
              <span className="font-display font-black text-2xl" style={{ color }}>
                {stream.events.length.toLocaleString()}
              </span>
              <p className="label-overline mt-0.5">Showing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter + table */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Sector filter */}
          <div className="mb-4">
            <SectorFilter active={activeSector} onChange={setActiveSector} />
          </div>

          <GlassCard>
            {filtered.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {filtered.map((evt) => (
                  <EventRow key={evt.id} event={evt} />
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
