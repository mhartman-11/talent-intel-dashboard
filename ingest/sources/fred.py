"""
Macro labor data via BLS Public Data API v1 (no key required)
+ FRED public CSV as fallback where BLS doesn't cover.

BLS v1 docs: https://www.bls.gov/developers/api_signature.htm
ToS posture: public API  ✓
"""
from __future__ import annotations

import json
from datetime import datetime, timezone

import httpx

from ..schema import SourceMeta, SourceResult
from ..normalizers import normalize_fred_observation

BLS_API = "https://api.bls.gov/publicAPI/v1/timeseries/data/"

# BLS series IDs for key labor indicators
# Docs: https://www.bls.gov/help/hlpforma.htm
BLS_SERIES: dict[str, str] = {
    "LNS14000000": "US Unemployment Rate (%)",          # CPS unemployment rate
    "JTS000000000000000JOR": "JOLTS: Job Openings Rate (%)",
    "JTS000000000000000QUR": "JOLTS: Quits Rate (%)",
    "JTS000000000000000LDR": "JOLTS: Layoffs & Discharges Rate (%)",
    "CES0500000003": "Private Sector Avg Hourly Earnings ($)",
}

SOURCE_META = SourceMeta(
    source="fred",
    display_name="BLS Macro Labor Data",
    url="https://www.bls.gov/developers/",
    tos_posture="public_api",
    cadence_hours=24,
)


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records = []

    series_ids = list(BLS_SERIES.keys())

    try:
        resp = httpx.post(
            BLS_API,
            json={"seriesid": series_ids, "startyear": "2024", "endyear": "2026"},
            headers={
                "User-Agent": "talent-intel-dashboard/1.0 (public data)",
                "Content-Type": "application/json",
            },
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()

        if data.get("status") != "REQUEST_SUCCEEDED":
            msg = data.get("message", ["Unknown BLS error"])
            errors.append(f"BLS API: {msg}")
        else:
            for series in data.get("Results", {}).get("series", []):
                series_id = series.get("seriesID", "")
                series_name = BLS_SERIES.get(series_id, series_id)

                if dry_run:
                    print(f"[fred] dry-run {series_id}: {len(series.get('data', []))} obs")
                    continue

                for obs in series.get("data", [])[:6]:  # last 6 observations
                    # BLS format: {year, period, value, ...}
                    # period is M01-M12 for monthly
                    year = obs.get("year", "")
                    period = obs.get("period", "M01")
                    month = period.replace("M", "").zfill(2)
                    date_str = f"{year}-{month}-01"
                    value = obs.get("value", ".")

                    evt = normalize_fred_observation(
                        series_id,
                        series_name,
                        {"date": date_str, "value": value},
                    )
                    if evt:
                        records.append(evt)

    except Exception as e:
        errors.append(f"BLS API: {e}")

    if not dry_run:
        print(f"[fred] {len(records)} macro events from BLS")

    return SourceResult(
        source="fred",
        ok=len(errors) == 0,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
