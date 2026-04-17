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
    SectorMatrix,
    SectorSignal,
    Snapshot,
    SourceMeta,
    SourceResult,
)

SECTORS = [
    "Technology", "Finance", "Healthcare", "CPG",
    "Manufacturing", "Retail", "Media",
]

SIGNAL_TYPES = ["layoff", "posting", "exec_move", "funding", "macro"]

NOW = datetime.now(timezone.utc)
WINDOW_7D = NOW - timedelta(days=7)
WINDOW_30D = NOW - timedelta(days=30)


def _in_window(ts: datetime, since: datetime) -> bool:
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    return ts >= since


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
    recent = sorted(all_events, key=lambda e: e.ts, reverse=True)[:100]
    sector_matrix = build_sector_matrix(all_events)

    return Snapshot(
        generated_at=NOW,
        total_events=len(all_events),
        events_7d=len(events_7d),
        sources=sources,
        recent_signals=recent,
        sector_matrix=sector_matrix,
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
