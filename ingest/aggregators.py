"""
Aggregation logic: list[Event] → SectorMatrix, recent_signals, per-stream JSONs.
"""
from __future__ import annotations

import statistics
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from typing import Optional

from .schema import (
    Event,
    LayoffPulse,
    SectorMatrix,
    SectorSignal,
    Snapshot,
    SourceMeta,
    SourceResult,
)

SECTORS = [
    "Technology", "Finance", "Healthcare", "CPG",
    "Manufacturing", "Retail", "Media",
    "Education", "Hospitality", "Logistics", "Energy", "Telecom",
]

SIGNAL_TYPES = ["layoff", "posting", "exec_move", "funding", "macro"]

NOW = datetime.now(timezone.utc)
WINDOW_7D = NOW - timedelta(days=7)
WINDOW_30D = NOW - timedelta(days=30)
WINDOW_60D = NOW - timedelta(days=60)


def _in_window(ts: datetime, since: datetime) -> bool:
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    return ts >= since


def dedupe_events(events: list[Event]) -> list[Event]:
    """
    Collapse near-duplicate layoff events.

    The same layoff now arrives from multiple feeds (e.g. Uber from both
    TechCrunch and Google News). Group layoff events by
    (company_name.lower(), event date) and keep the best single record —
    preferring one that carries a headcount magnitude, else the earliest.
    Non-layoff events pass through untouched.
    """
    best: dict[tuple[str, str], Event] = {}
    passthrough: list[Event] = []

    for evt in events:
        company = evt.company.name.strip().lower() if evt.company else ""
        if evt.type != "layoff" or not company or company == "unknown":
            passthrough.append(evt)
            continue
        key = (company, evt.ts.date().isoformat())
        incumbent = best.get(key)
        if incumbent is None:
            best[key] = evt
            continue
        # Prefer a record with a magnitude; tie-break on earlier timestamp.
        incumbent_has_mag = incumbent.magnitude is not None
        evt_has_mag = evt.magnitude is not None
        if evt_has_mag and not incumbent_has_mag:
            best[key] = evt
        elif evt_has_mag == incumbent_has_mag and evt.ts < incumbent.ts:
            best[key] = evt

    return passthrough + list(best.values())


def build_sector_matrix(events: list[Event]) -> SectorMatrix:
    """Compute 7-sector × 5-signal counts and Z-scores."""
    # Count events per (sector, type) in 7d and 30d windows
    counts_7d: dict[tuple[str, str], int] = defaultdict(int)
    counts_30d: dict[tuple[str, str], int] = defaultdict(int)
    magnitudes_7d: dict[tuple[str, str], list[float]] = defaultdict(list)

    for evt in events:
        sector = evt.company.sector if evt.company else "Other"
        if sector not in SECTORS:
            continue
        evt_type = evt.type if evt.type in SIGNAL_TYPES else None
        if not evt_type:
            continue
        key = (sector, evt_type)
        if _in_window(evt.ts, WINDOW_30D):
            counts_30d[key] += 1
        if _in_window(evt.ts, WINDOW_7D):
            counts_7d[key] += 1
            if evt.magnitude is not None:
                magnitudes_7d[key].append(evt.magnitude)

    # Compute Z-scores: (count_7d - mean_daily_30d * 7) / (stddev_30d or 1)
    cells: list[SectorSignal] = []
    for sector in SECTORS:
        for sig in SIGNAL_TYPES:
            key = (sector, sig)
            c7 = counts_7d.get(key, 0)
            c30 = counts_30d.get(key, 0)
            daily_mean = c30 / 30.0
            expected_7d = daily_mean * 7
            z_score: Optional[float] = None
            if c30 > 0:
                # Use Poisson approximation: σ ≈ sqrt(expected)
                sigma = max(1.0, expected_7d ** 0.5)
                z_score = round((c7 - expected_7d) / sigma, 2)

            mag_list = magnitudes_7d.get(key, [])
            mag_7d = round(sum(mag_list), 0) if mag_list else None

            cells.append(SectorSignal(
                sector=sector,
                signal_type=sig,  # type: ignore[arg-type]
                count_7d=c7,
                count_30d=c30,
                magnitude_7d=mag_7d,
                z_score=z_score,
            ))

    return SectorMatrix(generated_at=NOW, cells=cells)


def build_layoff_pulse(events: list[Event], top_n: int = 8) -> LayoffPulse:
    """Homepage layoff scoreboard.

    Deliberately counts announcements and companies rather than people. Most
    layoff reports never state a headcount, so summing the ones that do would
    produce a confidently wrong number. The disclosed total is still exposed,
    always paired with how many events it covers.
    """
    layoffs = [e for e in events if e.type == "layoff"]

    in_30d = [e for e in layoffs if _in_window(e.ts, WINDOW_30D)]
    in_7d = [e for e in layoffs if _in_window(e.ts, WINDOW_7D)]
    prev_30d = [
        e for e in layoffs
        if _in_window(e.ts, WINDOW_60D) and not _in_window(e.ts, WINDOW_30D)
    ]

    disclosed = [e for e in in_30d if e.magnitude]
    companies = {
        e.company.name.strip().lower()
        for e in in_30d
        if e.company and e.company.name and e.company.name.lower() != "unknown"
    }

    by_sector: dict[str, int] = defaultdict(int)
    for e in in_30d:
        by_sector[(e.company.sector if e.company else "Other") or "Other"] += 1

    # Headline rows: biggest disclosed cuts first, then the most recent
    # undisclosed ones. A recruiter scanning this wants scale, then freshness.
    with_mag = sorted(disclosed, key=lambda e: e.magnitude or 0, reverse=True)
    without_mag = sorted(
        [e for e in in_30d if not e.magnitude], key=lambda e: e.ts, reverse=True
    )
    top = (with_mag + without_mag)[:top_n]

    return LayoffPulse(
        events_7d=len(in_7d),
        events_30d=len(in_30d),
        events_prev_30d=len(prev_30d),
        companies_30d=len(companies),
        disclosed_jobs_30d=int(sum(e.magnitude or 0 for e in disclosed)) or None,
        disclosed_events_30d=len(disclosed),
        warn_events_30d=sum(1 for e in in_30d if e.source == "state_warn"),
        warn_events_total=sum(1 for e in layoffs if e.source == "state_warn"),
        top_events=top,
        by_sector_30d=dict(sorted(by_sector.items(), key=lambda kv: -kv[1])),
    )


def build_snapshot(
    all_events: list[Event],
    source_results: list[SourceResult],
    source_registry: list[SourceMeta],
) -> Snapshot:
    # Merge registry metadata with actual run results
    result_map = {r.source: r for r in source_results}
    sources: list[SourceMeta] = []
    for meta in source_registry:
        result = result_map.get(meta.source)
        if result:
            meta.ok = result.ok
            meta.last_attempted = result.fetched_at
            if result.ok:
                meta.last_ok = result.fetched_at
            meta.record_count = result.record_count
            meta.errors = result.errors
        sources.append(meta)

    events_7d = [e for e in all_events if _in_window(e.ts, WINDOW_7D)]
    # Newest 100, capped per signal type. Postings arrive in the thousands and
    # funding headlines in the hundreds, all with near-identical timestamps, so
    # an unweighted "newest" list is one type and nothing else. Capping keeps
    # the rare signals (layoffs, exec moves) visible without reordering time.
    by_recency = sorted(all_events, key=lambda e: e.ts, reverse=True)
    per_type_cap = 20
    seen_by_type: dict[str, int] = defaultdict(int)
    recent: list[Event] = []
    for evt in by_recency:
        if seen_by_type[evt.type] >= per_type_cap:
            continue
        seen_by_type[evt.type] += 1
        recent.append(evt)
        if len(recent) >= 100:
            break
    sector_matrix = build_sector_matrix(all_events)
    layoff_pulse = build_layoff_pulse(all_events)

    return Snapshot(
        generated_at=NOW,
        total_events=len(all_events),
        events_7d=len(events_7d),
        sources=sources,
        recent_signals=recent,
        sector_matrix=sector_matrix,
        layoff_pulse=layoff_pulse,
    )


def split_by_stream(events: list[Event]) -> dict[str, list[Event]]:
    """Partition events into per-stream lists for /public/data/streams/."""
    streams: dict[str, list[Event]] = {
        "layoffs": [],
        "hiring": [],
        "org-moves": [],
        "comp": [],
        "macro": [],
    }
    for evt in events:
        if evt.type == "layoff":
            streams["layoffs"].append(evt)
        elif evt.type == "posting":
            streams["hiring"].append(evt)
        elif evt.type in ("exec_move", "funding", "m_and_a"):
            streams["org-moves"].append(evt)
        elif evt.type == "comp":
            streams["comp"].append(evt)
        elif evt.type == "macro":
            streams["macro"].append(evt)
    return streams
