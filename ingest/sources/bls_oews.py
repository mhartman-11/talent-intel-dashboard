"""
BLS Occupational Employment and Wage Statistics (OEWS).
Annual national + MSA wage data by SOC occupation code.

Approach: pull BLS API v2 for a curated set of OEWS series IDs covering
high-volume occupations relevant to talent intel. Public v2 API, no key
required for under 25 queries/day. With BLS_API_KEY env var, 500/day.

Each Event = one (occupation × all-industries national) annual median wage.

Reference: https://www.bls.gov/oes/
Series ID structure (national, datatype 04 = annual median wage):
  OEUN000000000000{soc_no_dash}04
"""
from __future__ import annotations

import os
from datetime import datetime, timezone

import httpx

from ..schema import Event, SourceMeta, SourceResult
from ..normalizers import make_id

BLS_API = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

SOURCE_META = SourceMeta(
    source="bls_oews",
    display_name="BLS OEWS — Occupational Wages",
    url="https://www.bls.gov/oes/",
    tos_posture="public_api",
    cadence_hours=24,
)

# Curated SOC occupations of interest for talent intel.
# (soc_code, display_name)
_OCCUPATIONS: list[tuple[str, str]] = [
    ("15-1252", "Software Developers"),
    ("15-1244", "Network and Computer Systems Administrators"),
    ("15-1212", "Information Security Analysts"),
    ("15-2051", "Data Scientists"),
    ("15-2031", "Operations Research Analysts"),
    ("15-1257", "Web Developers and Digital Interface Designers"),
    ("11-3021", "Computer and Information Systems Managers"),
    ("11-9041", "Architectural and Engineering Managers"),
    ("11-2021", "Marketing Managers"),
    ("11-2011", "Advertising and Promotions Managers"),
    ("13-1071", "Human Resources Specialists"),
    ("13-1141", "Compensation, Benefits, Job Analysis Specialists"),
    ("13-2011", "Accountants and Auditors"),
    ("13-2051", "Financial and Investment Analysts"),
    ("13-2052", "Personal Financial Advisors"),
    ("13-1161", "Market Research Analysts"),
    ("27-1024", "Graphic Designers"),
    ("27-1014", "Special Effects Artists and Animators"),
    ("23-1011", "Lawyers"),
    ("11-9111", "Medical and Health Services Managers"),
    ("29-1141", "Registered Nurses"),
    ("29-1071", "Physician Assistants"),
    ("11-1021", "General and Operations Managers"),
    ("41-3091", "Sales Representatives, Services"),
    ("41-4011", "Sales Representatives, Wholesale and Manufacturing"),
]


def _series_id(soc_code: str) -> str:
    """National OEWS series.

    Structure: OEU [season N] [area 7] [industry 6] [occupation 6] [datatype 2]
    Area 0000000 = U.S. national. Industry 000000 = all industries.
    Datatype 04 = annual mean wage.
    """
    soc_no_dash = soc_code.replace("-", "")
    return f"OEUN0000000000000{soc_no_dash}04"


def _series_to_event(series: dict, display_map: dict[str, str]) -> Event | None:
    series_id = series.get("seriesID", "")
    # OEU(3) + N(1) + area(7) + industry(6) = 17 chars before SOC
    soc_no_dash = series_id[17:23] if len(series_id) >= 23 else ""
    soc = f"{soc_no_dash[:2]}-{soc_no_dash[2:]}" if len(soc_no_dash) == 6 else soc_no_dash
    display = display_map.get(soc, soc)

    data = series.get("data") or []
    if not data:
        return None
    latest = data[0]
    try:
        value = float(str(latest.get("value", "")).replace(",", ""))
    except ValueError:
        return None
    year = latest.get("year") or str(datetime.now().year)
    period = latest.get("period") or "A01"
    ts = datetime(int(year), 1, 1, tzinfo=timezone.utc)

    return Event(
        id=make_id("bls_oews", f"{soc}:{year}:{period}"),
        ts=ts,
        source="bls_oews",
        source_url=f"https://www.bls.gov/oes/current/oes{soc_no_dash}.htm",
        type="comp",
        company=None,
        magnitude=value,
        unit="USD",
        raw_text=f"OEWS {soc} {display} — annual median wage {year}: ${value:,.0f}",
        tags=["comp", "oews", soc.lower()],
        extras={"soc": soc, "occupation": display, "year": year,
                "geography": "US national"},
    )


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records: list[Event] = []

    api_key = os.environ.get("BLS_API_KEY")
    series_ids = [_series_id(soc) for soc, _ in _OCCUPATIONS]
    display_map = {soc: name for soc, name in _OCCUPATIONS}

    try:
        payload = {
            "seriesid": series_ids,
            "startyear": str(datetime.now().year - 2),
            "endyear": str(datetime.now().year),
        }
        if api_key:
            payload["registrationkey"] = api_key
        resp = httpx.post(
            BLS_API, json=payload,
            headers={"Content-Type": "application/json",
                     "User-Agent": "talent-intel-dashboard/1.0 contact@hartmanai.com"},
            timeout=60.0,
        )
        resp.raise_for_status()
        data = resp.json()
        status = data.get("status", "REQUEST_FAILED")
        if status != "REQUEST_SUCCEEDED":
            messages = data.get("message", [])
            errors.append(f"BLS API: {status} — {'; '.join(messages)[:200]}")
        else:
            for series in data.get("Results", {}).get("series", []):
                try:
                    evt = _series_to_event(series, display_map)
                    if evt:
                        records.append(evt)
                except Exception as exc:
                    errors.append(f"series parse: {exc}")
    except Exception as exc:
        errors.append(f"BLS API fetch: {exc}")

    if dry_run:
        print(f"[bls_oews] dry-run — {len(records)} occupation wage records")
    else:
        print(f"[bls_oews] {len(records)} occupation wage records")

    return SourceResult(
        source="bls_oews",
        ok=len(records) > 0,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
