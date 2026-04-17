"""
FRED (Federal Reserve Economic Data) — macro labor indicators.
Uses the public CSV endpoint — no API key required.
  https://fred.stlouisfed.org/graph/fredgraph.csv?id=UNRATE
ToS posture: public API  ✓
"""
from __future__ import annotations

import csv
import io
from datetime import datetime, timedelta, timezone

import httpx

from ..schema import SourceMeta, SourceResult
from ..normalizers import normalize_fred_observation

# Public CSV endpoint — no auth, no registration
FRED_CSV_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv"

# Series we care about for talent intelligence
SERIES: dict[str, str] = {
    "UNRATE": "US Unemployment Rate (%)",
    "JTSJOR": "JOLTS: Job Openings Rate (%)",
    "JTSQUR": "JOLTS: Quits Rate (%)",
    "JTSLDL": "JOLTS: Layoffs & Discharges Rate (%)",
    "CES0500000003": "Private Sector Avg Hourly Earnings (YoY %)",
}

SOURCE_META = SourceMeta(
    source="fred",
    display_name="FRED (St. Louis Fed)",
    url="https://fred.stlouisfed.org",
    tos_posture="public_csv",
    cadence_hours=24,
)


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records = []

    # Only fetch last 60 days
    since = (datetime.now() - timedelta(days=60)).strftime("%Y-%m-%d")

    for series_id, series_name in SERIES.items():
        try:
            resp = httpx.get(
                FRED_CSV_URL,
                params={"id": series_id},
                timeout=15,
                follow_redirects=True,
                headers={"User-Agent": "talent-intel-dashboard/1.0 (public data)"},
            )
            resp.raise_for_status()

            reader = csv.DictReader(io.StringIO(resp.text))
            rows = list(reader)

            if dry_run:
                print(f"[fred] dry-run {series_id}: {len(rows)} rows")
                continue

            # CSV columns: DATE, {series_id}
            # Normalize to the same format normalize_fred_observation expects
            series_col = series_id  # column name matches series ID
            obs_added = 0
            for row in rows[-10:]:  # last 10 observations (most recent)
                date = row.get("DATE") or row.get("date", "")
                value = row.get(series_col, ".")
                evt = normalize_fred_observation(
                    series_id,
                    series_name,
                    {"date": date, "value": value},
                )
                if evt:
                    records.append(evt)
                    obs_added += 1

        except Exception as e:
            errors.append(f"{series_id}: {e}")

    if not dry_run:
        print(f"[fred] {len(records)} macro events across {len(SERIES)} series")

    return SourceResult(
        source="fred",
        ok=len(errors) < len(SERIES),
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
