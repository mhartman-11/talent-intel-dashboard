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
  | "Education"
  | "Hospitality"
  | "Logistics"
  | "Energy"
  | "Telecom"
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

export type Seniority =
  | "intern"
  | "junior"
  | "mid"
  | "senior"
  | "staff"
  | "principal"
  | "lead"
  | "manager"
  | "director"
  | "vp"
  | "c_level";

export type RemoteMode = "remote" | "hybrid" | "onsite";

export interface RoleExtras {
  role?: string;
  function?: string;
  soc?: string;
  seniority?: Seniority;
  salary_min?: number;
  salary_max?: number;
  remote?: RemoteMode;
  stack?: string[];
  location?: string;
  team?: string;
  department?: string;
  employment_type?: string;
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
  extras?: RoleExtras & Record<string, unknown>;
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
  layoff_pulse?: LayoffPulse;
}

/** Homepage layoff scoreboard. Counts announcements and companies, not people —
 *  most layoff reports never state a headcount, so a summed total would be a
 *  confidently wrong number. See ingest/schema.py::LayoffPulse. */
export interface LayoffPulse {
  events_7d: number;
  events_30d: number;
  events_prev_30d: number;
  companies_30d: number;
  disclosed_jobs_30d?: number;
  disclosed_events_30d: number;
  warn_events_30d: number;
  warn_events_total: number;
  top_events: Event[];
  by_sector_30d: Record<string, number>;
}

export interface Stream {
  stream: string;
  generated_at: string;
  /** Every event in this stream. */
  total: number;
  /** How many are actually shipped in `events` (capped at 500). */
  showing?: number;
  /** Counted over ALL events, not the shipped slice. */
  source_counts?: Record<string, number>;
  sector_counts?: Record<string, number>;
  events: Event[];
}

export interface SourcesFile {
  generated_at: string;
  sources: SourceMeta[];
}
