"""
Shared pydantic models for the talent intelligence ingest pipeline.
Every source normalizes to Event. Aggregators produce SectorMatrix + SourceMeta.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


# ─── Company ──────────────────────────────────────────────────────────────────

SECTORS = Literal[
    "Technology",
    "Finance",
    "Healthcare",
    "CPG",
    "Manufacturing",
    "Retail",
    "Media",
    # Added 2026-08-31: WARN filings are dominated by school districts, hotels,
    # freight and utilities. Without these they all collapsed into "Other",
    # which made the heat grid's layoff row useless.
    "Education",
    "Hospitality",
    "Logistics",
    "Energy",
    "Telecom",
    "Other",
]

SIZE_BANDS = Literal["1-50", "51-200", "201-1000", "1001-5000", "5000+", "unknown"]

EVENT_TYPES = Literal[
    "layoff",
    "posting",
    "exec_move",
    "funding",
    "m_and_a",
    "comp",
    "macro",
    "attention",
]


class Company(BaseModel):
    name: str
    ticker: Optional[str] = None
    industry: Optional[str] = None
    sector: SECTORS = "Other"
    hq_region: Optional[str] = None  # e.g. "CA", "NY", "IL"
    size_band: SIZE_BANDS = "unknown"


# ─── Core event ───────────────────────────────────────────────────────────────


class Event(BaseModel):
    id: str                          # sha256(source + native_id)[:16]
    ts: datetime
    source: str                      # e.g. "layoffs_fyi", "greenhouse", "sec_edgar"
    source_url: str
    type: EVENT_TYPES
    company: Optional[Company] = None
    magnitude: Optional[float] = None   # people | USD | pp (percentage points)
    unit: Optional[str] = None          # "people" | "USD" | "pp" | "jobs"
    raw_text: str
    tags: list[str] = Field(default_factory=list)
    extras: dict[str, Any] = Field(default_factory=dict)  # source-specific structured fields


# ─── Source result wrapper ─────────────────────────────────────────────────────


class SourceResult(BaseModel):
    source: str
    ok: bool
    fetched_at: datetime
    records: list[Event] = Field(default_factory=list)
    record_count: int = 0
    errors: list[str] = Field(default_factory=list)

    def model_post_init(self, __context: object) -> None:
        self.record_count = len(self.records)


# ─── Aggregated outputs ────────────────────────────────────────────────────────


class SectorSignal(BaseModel):
    sector: str
    signal_type: EVENT_TYPES
    count_7d: int = 0
    count_30d: int = 0
    magnitude_7d: Optional[float] = None
    magnitude_30d: Optional[float] = None
    z_score: Optional[float] = None   # 7d vs 30d baseline, used for heat grid intensity


class SectorMatrix(BaseModel):
    """7 sectors × 5 signal types heat-grid data."""
    generated_at: datetime
    cells: list[SectorSignal] = Field(default_factory=list)


class SourceMeta(BaseModel):
    source: str
    display_name: str
    url: str
    tos_posture: Literal["public_api", "public_csv", "public_rss", "public_html"]
    cadence_hours: int
    last_ok: Optional[datetime] = None
    last_attempted: Optional[datetime] = None
    record_count: int = 0
    ok: bool = False
    errors: list[str] = Field(default_factory=list)


class LayoffPulse(BaseModel):
    """Homepage layoff scoreboard.

    Counts announcements and companies, not people. Only a minority of layoff
    reports state a headcount, so a summed "people cut" number would silently
    understate reality and read as precise. `disclosed_jobs_30d` is reported
    alongside `disclosed_events_30d` so the coverage is always visible.
    """
    events_7d: int = 0
    events_30d: int = 0
    events_prev_30d: int = 0          # the 30 days before that, for direction
    companies_30d: int = 0
    disclosed_jobs_30d: Optional[int] = None
    disclosed_events_30d: int = 0
    warn_events_30d: int = 0          # official filings, as opposed to news
    warn_events_total: int = 0        # Texas publishes on a lag, so the 30d
                                      # count is often 0 while the archive is not
    top_events: list["Event"] = Field(default_factory=list)
    by_sector_30d: dict[str, int] = Field(default_factory=dict)


class Snapshot(BaseModel):
    """Top-level file written to public/data/snapshot.json."""
    generated_at: datetime
    next_ingest_at: Optional[datetime] = None
    total_events: int = 0
    events_7d: int = 0
    sources: list[SourceMeta] = Field(default_factory=list)
    recent_signals: list[Event] = Field(default_factory=list)  # last 100 for tape
    sector_matrix: Optional[SectorMatrix] = None
    layoff_pulse: Optional[LayoffPulse] = None
