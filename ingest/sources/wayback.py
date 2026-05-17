"""
Wayback CDX API — careers-page snapshot frequency as proxy for hiring activity.

For tracked companies with known careers URLs, query the Internet Archive
CDX index for snapshots in the last 90 days. More snapshots = page changing
often = active hiring. Emit one macro event per company with snapshot count.

Endpoint: http://web.archive.org/cdx/search/cdx?url=...&from=...&to=...&output=json
ToS: free, polite UA.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import make_id
from ._companies import load_tracked_companies
from ._http import get_json

CDX_API = "https://web.archive.org/cdx/search/cdx"

SOURCE_META = SourceMeta(
    source="wayback",
    display_name="Wayback Careers-Page Snapshots",
    url="https://web.archive.org/cdx/search/cdx",
    tos_posture="public_api",
    cadence_hours=24,
)


def _careers_url_guess(company_name: str) -> str:
    """Best-effort careers URL from company name. Override via tracked companies file."""
    domain = (
        company_name.lower()
        .replace(" ", "")
        .replace(",", "")
        .replace(".", "")
        .replace("&", "and")
    )
    return f"{domain}.com/careers"


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records: list[Event] = []

    today = datetime.now(timezone.utc).date()
    from_dt = (today - timedelta(days=90)).strftime("%Y%m%d")
    to_dt = today.strftime("%Y%m%d")

    for entry in load_tracked_companies():
        name = entry["name"]
        sector = entry.get("sector", "Other")
        careers_url = entry.get("careers_url") or _careers_url_guess(name)
        try:
            data = get_json(
                CDX_API,
                params={
                    "url": careers_url,
                    "from": from_dt,
                    "to": to_dt,
                    "output": "json",
                    "limit": 200,
                    "fl": "timestamp",
                    "collapse": "timestamp:8",  # dedup to one row per day
                },
                timeout=8.0,
                retries=0,  # IA is flaky; fail fast rather than block ingest
            )
            rows = data if isinstance(data, list) else []
            snapshot_count = max(0, len(rows) - 1)  # first row is header
            if snapshot_count == 0:
                continue
            records.append(Event(
                id=make_id("wayback", f"{name}:{to_dt}"),
                ts=datetime.now(timezone.utc),
                source="wayback",
                source_url=f"https://web.archive.org/web/*/{careers_url}",
                type="macro",
                company=Company(name=name, sector=sector),
                magnitude=float(snapshot_count),
                unit="snapshots/90d",
                raw_text=f"{name} careers page: {snapshot_count} archived snapshots in 90 days",
                tags=["careers_activity", "wayback", sector.lower()],
                extras={"careers_url": careers_url, "snapshots_90d": snapshot_count},
            ))
        except Exception as exc:
            errors.append(f"{name}: {exc}")

    if dry_run:
        print(f"[wayback] dry-run — {len(records)} careers snapshot signals")
    else:
        print(f"[wayback] {len(records)} careers snapshot signals")

    return SourceResult(
        source="wayback",
        ok=len(records) > 0,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
