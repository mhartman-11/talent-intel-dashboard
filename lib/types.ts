/**
 * TypeScript mirrors of the Python pydantic schema.
 * Keep in sync with ingest/schema.py.
 */

export type Sector =
  | "Technology"
  | "Finance"
  | "Healthcare"
  | "CPG"
  | "Manufacturing"
  | "Retail"
  | "Media"
  | "Other";

export type SizeBand = "1-50" | "51-200" | "201-1000" | "1001-5000" | "5000+" | "unknown";

export type EventType =
  | "layoff"
  | "posting"
  | "exec_move"
  | "funding"
  | "m_and_a"
  | "comp"
  | "macro";

export interface Company {
  name: string;
  ticker?: string;
  industry?: string;
  sector: Sector;
  hq_region?: string;
  size_band: SizeBand;
}

export interface Event {
  id: string;
  ts: string; // ISO 8601
  source: string;
  source_url: string;
  type: EventType;
  company?: Company;
  magnitude?: number;
  unit?: string;
  raw_text: string;
  tags: string[];
}

export interface SectorSignal {
  sector: string;
  signal_type: EventType;
  count_7d: number;
  count_30d: number;
  magnitude_7d?: number;
  z_score?: number;
}

export interface SectorMatrix {
  generated_at: string;
  cells: SectorSignal[];
}

export interface SourceMeta {
  source: string;
  display_name: string;
  url: string;
  tos_posture: "public_api" | "public_csv" | "public_rss" | "public_html";
  cadence_hours: number;
  last_ok?: string;
  last_attempted?: string;
  record_count: number;
  ok: boolean;
  errors: string[];
}

export interface Snapshot {
  generated_at: string;
  next_ingest_at?: string;
  total_events: number;
  events_7d: number;
  sources: SourceMeta[];
  recent_signals: Event[];
  sector_matrix?: SectorMatrix;
}

export interface Stream {
  stream: string;
  generated_at: string;
  total: number;
  events: Event[];
}

export interface SourcesFile {
  generated_at: string;
  sources: SourceMeta[];
}
