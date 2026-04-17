/**
 * Type-safe data loaders for /public/data/*.json.
 * All reads happen at build time (Next.js static export).
 */
import fs from "fs";
import path from "path";
import type { Snapshot, Stream, SourcesFile, SectorMatrix } from "./types";

const DATA_DIR = path.join(process.cwd(), "public", "data");

function readJson<T>(filePath: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const EMPTY_SNAPSHOT: Snapshot = {
  generated_at: new Date().toISOString(),
  total_events: 0,
  events_7d: 0,
  sources: [],
  recent_signals: [],
};

export function getSnapshot(): Snapshot {
  return readJson<Snapshot>(path.join(DATA_DIR, "snapshot.json"), EMPTY_SNAPSHOT);
}

export function getStream(name: string): Stream {
  return readJson<Stream>(path.join(DATA_DIR, "streams", `${name}.json`), {
    stream: name,
    generated_at: new Date().toISOString(),
    total: 0,
    events: [],
  });
}

export function getSectorMatrix(): SectorMatrix | null {
  const file = path.join(DATA_DIR, "sectors.json");
  if (!fs.existsSync(file)) return null;
  return readJson<SectorMatrix>(file, { generated_at: new Date().toISOString(), cells: [] });
}

export function getSourcesMeta(): SourcesFile {
  return readJson<SourcesFile>(path.join(DATA_DIR, "sources.json"), {
    generated_at: new Date().toISOString(),
    sources: [],
  });
}

/** Format a large number for display (e.g. 12500 → "12.5K") */
export function formatMagnitude(val: number, unit?: string): string {
  if (unit === "USD") {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  }
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString();
}

/** "2h ago", "3d ago" etc. */
export function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
