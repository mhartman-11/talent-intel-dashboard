"""
Compensation intelligence via BLS Average Hourly Earnings by major industry sector.
BLS series CES*000000003 — no API key required (v1 public endpoint).
ToS posture: public_api  ✓
"""
from __future__ import annotations

from datetime import datetime, timezone

import httpx

from ..schema import SourceMeta, SourceResult
from ..normalizers import normalize_fred_observation

BLS_API = "https://api.bls.gov/publicAPI/v1/timeseries/data/"

# Average Hourly Earnings ($) by supersector — BLS CES series
COMP_SERIES: dict[str, str] = {
    "CES5000000003": "Avg Hourly Earnings — Information ($)",
    "CES5500000003": "Avg Hourly Earnings — Financial Activities ($)",
    "CES6000000003": "Avg Hourly Earnings — Professional & Business Services ($)",
    "CES6500000003": "Avg Hourly Earnings — Education & Health Services ($)",
    "CES3000000003": "Avg Hourly Earnings — Manufacturing ($)",
    "CES4000000003": "Avg Hourly Earnings — Trade, Transport & Utilities ($)",
    "CES7000000003": "Avg Hourly Earnings — Leisure & Hospitality ($)",
    "CES0500000003": "Avg Hourly Earnings — All Private ($)",
}

SOURCE_META = SourceMeta(
    source="comp",
    display_name="BLS Wage & Compensation Data",
    url="https://www.bls.gov/ces/",
    tos_posture="public_api",
    cadence_hours=24,
)


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records = []

    try:
        resp = httpx.post(
            BLS_API,
            json={
                "seriesid": list(COMP_SERIES.keys()),
                "startyear": "2024",
                "endyear": "2026",
            },
            headers={
                "User-Agent": "talent-intel-dashboard/1.0 (public data)",
                "Content-Type": "application/json",
            },
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()

        if data.get("status") != "REQUEST_SUCCEEDED":
            errors.append(f"BLS API: {data.get('message', 'Unknown error')}")
        else:
            for series in data.get("Results", {}).get("series", []):
                series_id = series.get("seriesID", "")
                series_name = COMP_SERIES.get(series_id, series_id)

                if dry_run:
                    print(f"[comp] dry-run {series_id}: {len(series.get('data', []))} obs")
                    continue

                for obs in series.get("data", [])[:6]:
                    year = obs.get("year", "")
                    period = obs.get("period", "M01")
                    month = period.replace("M", "").zfill(2)
                    date_str = f"{year}-{month}-01"
                    value = obs.get("value", ".")

                    evt = normalize_fred_observation(
                        series_id,
                        series_name,
                        {"date": date_str, "value": value},
                        event_type="comp",
                    )
                    if evt:
                        records.append(evt)

    except Exception as e:
        errors.append(f"BLS comp API: {e}")

    if not dry_run:
        print(f"[comp] {len(records)} comp/wage events from BLS")

    return SourceResult(
        source="comp",
        ok=len(errors) == 0,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
