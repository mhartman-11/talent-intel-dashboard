"""
Wikipedia pageviews — company-attention signal.

For each tracked company, pull last 30 days of daily pageviews from
Wikimedia REST. Spike vs 30-day baseline becomes an 'attention' event,
the per-sector attention signal in the heat grid.

Endpoint: https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/
                 en.wikipedia/all-access/all-agents/{article}/daily/{start}/{end}
ToS: free, polite UA required.
"""
from __future__ import annotations

import statistics
from datetime import datetime, timedelta, timezone

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import classify_sector, make_id
from ._companies import load_tracked_companies
from ._http import get_json

API = (
    "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
    "en.wikipedia/all-access/all-agents/{article}/daily/{start}/{end}"
)

SOURCE_META = SourceMeta(
    source="wikipedia_pv",
    display_name="Wikipedia Pageviews",
    url="https://wikimedia.org/api/rest_v1/metrics/pageviews",
    tos_posture="public_api",
    cadence_hours=24,
)


def _article_title(name: str) -> str:
    # Wikipedia article slugs use underscores
    return name.replace(" ", "_")


def _fetch_views(article: str, start: str, end: str) -> list[int]:
    url = API.format(article=article, start=start, end=end)
    try:
        data = get_json(url, timeout=20.0)
    except Exception:
        return []
    items = data.get("items", []) if isinstance(data, dict) else []
    return [int(it.get("views") or 0) for it in items]


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records: list[Event] = []

    today = datetime.now(timezone.utc).date()
    start = (today - timedelta(days=30)).strftime("%Y%m%d")
    end = today.strftime("%Y%m%d")

    for entry in load_tracked_companies():
        name = entry["name"]
        sector = entry.get("sector", "Other")
        article = _article_title(name)
        try:
            views = _fetch_views(article, start, end)
            if len(views) < 8:
                continue
            recent_7 = views[-7:]
            baseline_23 = views[:-7]
            avg_recent = statistics.mean(recent_7)
            avg_baseline = statistics.mean(baseline_23) if baseline_23 else avg_recent
            stdev_baseline = statistics.pstdev(baseline_23) if len(baseline_23) > 1 else 1.0
            z = (avg_recent - avg_baseline) / max(1.0, stdev_baseline)

            records.append(Event(
                id=make_id("wikipedia_pv", f"{name}:{end}"),
                ts=datetime.now(timezone.utc),
                source="wikipedia_pv",
                source_url=f"https://en.wikipedia.org/wiki/{article}",
                type="attention",
                company=Company(name=name, sector=sector),
                magnitude=float(round(avg_recent, 1)),
                unit="pageviews/day",
                raw_text=f"{name} — avg 7d pageviews {avg_recent:.0f} vs 23d baseline {avg_baseline:.0f} (z={z:.2f})",
                tags=["attention", "wikipedia", sector.lower()],
                extras={
                    "avg_7d": round(avg_recent, 1),
                    "avg_baseline": round(avg_baseline, 1),
                    "z_score": round(z, 2),
                    "is_spike": z > 1.5,
                },
            ))
        except Exception as exc:
            errors.append(f"{name}: {exc}")

    if dry_run:
        print(f"[wikipedia_pv] dry-run — {len(records)} company pageview records")
    else:
        print(f"[wikipedia_pv] {len(records)} company pageview records")

    return SourceResult(
        source="wikipedia_pv",
        ok=len(records) > 0,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
