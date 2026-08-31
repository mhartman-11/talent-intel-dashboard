"""
Ingest orchestrator — run all sources, aggregate, write /public/data/*.json

Usage:
  python -m ingest.run            # full run
  python -m ingest.run --dry-run  # fetch + count, no file writes
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .aggregators import build_snapshot, dedupe_events, split_by_stream
from .sources import ALL_SOURCES

PUBLIC_DATA = Path(__file__).parent.parent / "public" / "data"


def serialize(obj: object) -> object:
    """JSON serializer for pydantic models and datetimes."""
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Not serializable: {type(obj)}")


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, default=serialize, indent=2)
    print(f"  wrote {path.relative_to(Path.cwd()) if path.is_relative_to(Path.cwd()) else path} ({path.stat().st_size // 1024}KB)")


def main(dry_run: bool = False) -> int:
    print(f"\n{'='*60}")
    print(f"Talent Intel Ingest — {'DRY RUN' if dry_run else 'FULL RUN'}")
    print(f"Started at {datetime.now(timezone.utc).isoformat()}")
    print(f"{'='*60}\n")

    source_results = []
    all_events = []
    registry_metas = []

    for name, fetch_fn, meta in ALL_SOURCES:
        print(f"→ {name}")
        registry_metas.append(meta)
        try:
            result = fetch_fn(dry_run=dry_run)
            source_results.append(result)
            all_events.extend(result.records)
            status = "✓" if result.ok else "✗"
            print(f"  {status} {result.record_count} records, {len(result.errors)} errors")
            for err in result.errors[:3]:
                print(f"    ⚠ {err}")
        except Exception as e:
            print(f"  ✗ FATAL: {e}")
            from .schema import SourceResult
            source_results.append(SourceResult(
                source=name,
                ok=False,
                fetched_at=datetime.now(timezone.utc),
                errors=[str(e)],
            ))

    print(f"\nTotal events: {len(all_events)}")

    if dry_run:
        print("\n[dry-run] skipping file writes.")
        return 0

    # Collapse cross-source duplicate layoffs before aggregating.
    deduped = len(all_events)
    all_events = dedupe_events(all_events)
    print(f"Deduped layoffs: {deduped} → {len(all_events)} events")

    # Build aggregated outputs
    snapshot = build_snapshot(all_events, source_results, registry_metas)
    streams = split_by_stream(all_events)

    print("\nWriting output files...")
    write_json(PUBLIC_DATA / "snapshot.json", snapshot)

    STREAM_EVENT_CAP = 500
    for stream_name, events in streams.items():
        ordered = sorted(events, key=lambda x: x.ts, reverse=True)
        shown = ordered[:STREAM_EVENT_CAP]
        # Counted over ALL events, not just the ones we ship. The hiring stream
        # holds thousands; a breakdown computed client-side over the shipped 500
        # reported "ashby: 1" when Ashby actually had hundreds.
        source_counts: dict[str, int] = {}
        sector_counts: dict[str, int] = {}
        for evt in events:
            source_counts[evt.source] = source_counts.get(evt.source, 0) + 1
            sector = (evt.company.sector if evt.company else None) or "Other"
            sector_counts[sector] = sector_counts.get(sector, 0) + 1
        write_json(PUBLIC_DATA / "streams" / f"{stream_name}.json", {
            "stream": stream_name,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total": len(events),
            "showing": len(shown),
            "source_counts": dict(sorted(source_counts.items(), key=lambda kv: -kv[1])),
            "sector_counts": dict(sorted(sector_counts.items(), key=lambda kv: -kv[1])),
            "events": [e.model_dump(mode="json") for e in shown],
        })

    # Write sectors matrix separately for fast homepage load
    if snapshot.sector_matrix:
        write_json(PUBLIC_DATA / "sectors.json", snapshot.sector_matrix)

    # Write sources meta separately for the Sources drawer
    write_json(PUBLIC_DATA / "sources.json", {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "sources": [s.model_dump(mode="json") for s in snapshot.sources],
    })

    # Write tape feed (JSONL) for the SignalTape component
    tape_path = PUBLIC_DATA / "signals.jsonl"
    with open(tape_path, "w") as f:
        for evt in snapshot.recent_signals:
            f.write(json.dumps(evt.model_dump(mode="json"), default=serialize) + "\n")
    print(f"  wrote signals.jsonl ({len(snapshot.recent_signals)} lines)")

    print(f"\n✓ Ingest complete. {len(all_events)} total events.")
    failed_sources = [r.source for r in source_results if not r.ok]
    if failed_sources:
        print(f"⚠ Failed sources: {', '.join(failed_sources)}")
    # Only hard-fail if we got zero data — partial failures are fine,
    # they surface in the Sources drawer. Don't block build/deploy.
    if len(all_events) == 0 and len(failed_sources) == len(source_results):
        print("✗ All sources failed — blocking deploy.")
        return 1
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    sys.exit(main(dry_run=args.dry_run))
