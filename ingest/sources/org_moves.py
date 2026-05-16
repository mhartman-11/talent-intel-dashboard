"""
Org & exec moves from TechCrunch Venture RSS (funding) +
TechCrunch tag/personnel RSS (exec moves).
Public RSS, no auth required. ToS posture: public_rss.

For SEC EDGAR proper (8-K Item 5.02 + Form D), see sec_edgar.py.
"""
from __future__ import annotations

from datetime import datetime, timezone

import feedparser
import httpx

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import (
    classify_sector,
    extract_company_from_headline,
    extract_funding_usd,
    extract_region,
    make_id,
)

SOURCE_META = SourceMeta(
    source="org_moves",
    display_name="Org & Exec Moves (TechCrunch)",
    url="https://techcrunch.com/category/venture/feed/",
    tos_posture="public_rss",
    cadence_hours=6,
)

TC_VENTURE_RSS = "https://techcrunch.com/category/venture/feed/"
TC_PERSONNEL_RSS = "https://techcrunch.com/tag/personnel/feed/"

_FUNDING_KW = [
    "raises", "raised", "funding", "series ", "seed round", "round",
    "investment", "backed", "million", "billion", "valuation",
]
_EXEC_KW = [
    "appoints", "appointed", "names new", "hires", "hired",
    "promotes", "promoted", "departs", "departed", "resigns",
    "resigned", "steps down", "new ceo", "new cfo", "new coo",
    "new cto", "new president",
]


def _classify_evt_type(text: str) -> str | None:
    lower = text.lower()
    is_funding = any(kw in lower for kw in _FUNDING_KW)
    is_exec = any(kw in lower for kw in _EXEC_KW)
    if is_funding and not is_exec:
        return "funding"
    if is_exec:
        return "exec_move"
    if is_funding:
        return "funding"
    return None


def _parse_tc_entry(entry: object) -> Event | None:
    title: str = getattr(entry, "title", "") or ""
    summary: str = getattr(entry, "summary", "") or ""
    link: str = getattr(entry, "link", "") or ""
    published_parsed = getattr(entry, "published_parsed", None)

    full_text = f"{title} {summary}"
    evt_type = _classify_evt_type(full_text)
    if not evt_type:
        return None

    if published_parsed:
        ts = datetime(*published_parsed[:6], tzinfo=timezone.utc)
    else:
        ts = datetime.now(timezone.utc)

    company_name = extract_company_from_headline(title) or "Unknown"
    sector = classify_sector(full_text, company_name=company_name)
    region = extract_region(full_text)

    magnitude = extract_funding_usd(full_text) if evt_type == "funding" else None
    unit = "USD" if magnitude else None

    return Event(
        id=make_id("org_moves_tc", link or title[:60]),
        ts=ts,
        source="org_moves",
        source_url=link or TC_VENTURE_RSS,
        type=evt_type,  # type: ignore[arg-type]
        company=Company(
            name=company_name,
            sector=sector,
            hq_region=region,
        ),
        magnitude=magnitude,
        unit=unit,
        raw_text=title[:240],
        tags=[evt_type, sector.lower(), *([region] if region else [])],
    )


def _fetch_feed(url: str, errors: list[str]) -> list[Event]:
    records: list[Event] = []
    try:
        resp = httpx.get(
            url,
            timeout=15,
            follow_redirects=True,
            headers={"User-Agent": "talent-intel-dashboard/1.0 contact@hartmanai.com"},
        )
        resp.raise_for_status()
        parsed = feedparser.parse(resp.text)
        for entry in parsed.entries:
            try:
                evt = _parse_tc_entry(entry)
                if evt:
                    records.append(evt)
            except Exception as e:
                errors.append(f"entry: {e}")
    except Exception as e:
        errors.append(f"feed {url}: {e}")
    return records


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []

    records: list[Event] = []
    for url in (TC_VENTURE_RSS, TC_PERSONNEL_RSS):
        records.extend(_fetch_feed(url, errors))

    if dry_run:
        print(f"[org_moves] dry-run — {len(records)} events")
    else:
        print(f"[org_moves] {len(records)} events")
    return SourceResult(
        source="org_moves",
        ok=len(errors) < 2,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
