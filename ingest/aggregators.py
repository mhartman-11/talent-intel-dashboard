"""
Aggregation logic: list[Event] -> SectorMatrix, recent_signals, per-stream JSONs.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from collections import defaultdict
from typing import Optional

from .normalizers import dedup_events
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

SIGNAL_TYPES = ["layoff", "posting", "exec_move", "funding", "attention"]


def _in_window(ts: datetime, since: datetime) -> bool:
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    return ts >= since


def build_sector_matrix(events: list[Event], now: datetime) -> SectorMatrix:
    """Compute 7-sector x 5-signal counts and Z-scores."""
    window_7d = now - timedelta(days=7)
    window_30d = now - timedelta(days=30)

    counts_7d: dict[tuple[str, str], int] = defaultdict(int)
    counts_30d: dict[tuple[str, str], int] = defaultdict(int)
    magnitudes_7d: dict[tuple[str, str], list[float]] = defaultdict(list)
    magnitudes_30d: dict[tuple[str, str], list[float]] = defaultdict(list)

    for evt in events:
        sector = evt.company.sector if evt.company else "Other"
        if sector not in SECTORS:
            continue
        evt_type = evt.type if evt.type in SIGNAL_TYPES else None
        if not evt_type:
            continue
        key = (sector, evt_type)
        if _in_window(evt.ts, window_30d):
            counts_30d[key] += 1
            if evt.magnitude is not None:
                magnitudes_30d[key].append(evt.magnitude)
        if _in_window(evt.ts, window_7d):
            counts_7d[key] += 1
            if evt.magnitude is not None:
                magnitudes_7d[key].append(evt.magnitude)

    cells: list[SectorSignal] = []
    for sector in SECTORS:
        for sig in SIGNAL_TYPES:
            key = (sector, sig)
            c7 = counts_7d.get(key, 0)
            c30 = counts_30d.get(key, 0)
            daily_mean = c30 / 30.0
            expected_7d = daily_mean * 7
            z_score: Optional[float] = None
            if c30 >= 3:
                sigma = max(1.0, expected_7d ** 0.5)
                z_score = round((c7 - expected_7d) / sigma, 2)

            mag_7d = round(sum(magnitudes_7d.get(key, [])), 0) or None
            mag_30d = round(sum(magnitudes_30d.get(key, [])), 0) or None

            cells.append(SectorSignal(
                sector=sector,
                signal_type=sig,  # type: ignore[arg-type]
                count_7d=c7,
                count_30d=c30,
                magnitude_7d=mag_7d,
                magnitude_30d=mag_30d,
                z_score=z_score,
            ))

    return SectorMatrix(generated_at=now, cells=cells)


def build_snapshot(
    all_events: list[Event],
    source_results: list[SourceResult],
    source_registry: list[SourceMeta],
) -> Snapshot:
    now = datetime.now(timezone.utc)
    window_7d = now - timedelta(days=7)

    # Dedup across overlapping feeds before aggregation
    deduped = dedup_events(all_events)

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

    events_7d = [e for e in deduped if _in_window(e.ts, window_7d)]
    recent = sorted(deduped, key=lambda e: e.ts, reverse=True)[:100]
    sector_matrix = build_sector_matrix(deduped, now=now)

    return Snapshot(
        generated_at=now,
        total_events=len(deduped),
        events_7d=len(events_7d),
        sources=sources,
        recent_signals=recent,
        sector_matrix=sector_matrix,
    )


def split_by_stream(events: list[Event]) -> dict[str, list[Event]]:
    """Partition events into per-stream lists for /public/data/streams/."""
    deduped = dedup_events(events)
    streams: dict[str, list[Event]] = {
        "layoffs": [],
        "hiring": [],
        "org-moves": [],
        "comp": [],
        "macro": [],
    }
    for evt in deduped:
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
