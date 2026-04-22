"""
Org & exec moves: SEC EDGAR 8-K Item 5.02 filings + TechCrunch Venture RSS.
Both sources are public record / public RSS — no auth required.
ToS posture: public_api + public_rss  ✓
"""
from __future__ import annotations

from datetime import datetime, timezone

import feedparser
import httpx

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import classify_sector, extract_region, make_id

SOURCE_META = SourceMeta(
    source="org_moves",
    display_name="Org & Exec Moves",
    url="https://www.sec.gov/cgi-bin/browse-edgar",
    tos_posture="public_api",
    cadence_hours=6,
)

# SEC EDGAR full-text search for 8-K filings mentioning Item 5.02 (exec changes)
EDGAR_EFTS = "https://efts.sec.gov/LATEST/search-index"

# TechCrunch venture/funding RSS
TC_VENTURE_RSS = "https://techcrunch.com/category/venture/feed/"

_FUNDING_KW = [
    "raises", "funding", "series", "seed", "round", "investment",
    "backed", "million", "billion", "capital", "venture",
]
_EXEC_KW = [
    "appoints", "names", "hires", "promotes", "departs", "resigns",
    "ceo", "cfo", "coo", "cto", "president", "executive",
]


def _parse_tc_entry(entry: object) -> Event | None:
    title: str = getattr(entry, "title", "") or ""
    summary: str = getattr(entry, "summary", "") or ""
    link: str = getattr(entry, "link", "") or ""
    published_parsed = getattr(entry, "published_parsed", None)

    full_text = f"{title} {summary}".lower()

    is_funding = any(kw in full_text for kw in _FUNDING_KW)
    is_exec = any(kw in full_text for kw in _EXEC_KW)
    if not (is_funding or is_exec):
        return None

    evt_type = "funding" if is_funding else "exec_move"

    if published_parsed:
        ts = datetime(*published_parsed[:6], tzinfo=timezone.utc)
    else:
        ts = datetime.now(timezone.utc)

    sector = classify_sector(f"{title} {summary}")
    region = extract_region(f"{title} {summary}")

    # Company name: first part of title before " raises " / " appoints " etc.
    for sep in [" raises ", " appoints ", " names ", " hires ", " acquires "]:
        if sep in title.lower():
            company_name = title[: title.lower().index(sep)].strip()
            break
    else:
        company_name = title.split(":")[0].strip()
    if len(company_name) > 80 or len(company_name) < 2:
        company_name = "Unknown"

    return Event(
        id=make_id("org_moves_tc", link or title[:60]),
        ts=ts,
        source="org_moves",
        source_url=link or TC_VENTURE_RSS,
        type=evt_type,
        company=Company(
            name=company_name,
            sector=sector,
            hq_region=region,
        ),
        magnitude=None,
        unit=None,
        raw_text=title[:200],
        tags=[evt_type, sector.lower(), *([region] if region else [])],
    )


def _fetch_tc_venture(errors: list[str]) -> list[Event]:
    records: list[Event] = []
    try:
        resp = httpx.get(
            TC_VENTURE_RSS,
            timeout=15,
            follow_redirects=True,
            headers={"User-Agent": "talent-intel-dashboard/1.0"},
        )
        resp.raise_for_status()
        parsed = feedparser.parse(resp.text)
        for entry in parsed.entries:
            try:
                evt = _parse_tc_entry(entry)
                if evt:
                    records.append(evt)
            except Exception as e:
                errors.append(f"TC venture entry: {e}")
    except Exception as e:
        errors.append(f"TC venture RSS: {e}")
    return records


def _fetch_edgar_exec_changes(errors: list[str]) -> list[Event]:
    """Query SEC EDGAR full-text search for recent 8-K Item 5.02 filings."""
    records: list[Event] = []
    today = datetime.now(timezone.utc)
    start_dt = f"{today.year}-01-01"

    try:
        resp = httpx.get(
            EDGAR_EFTS,
            params={
                "q": '"5.02"',
                "forms": "8-K",
                "dateRange": "custom",
                "startdt": start_dt,
                "hits.hits.total.value": 1,
            },
            headers={"User-Agent": "talent-intel-dashboard/1.0 contact@hartmanai.com"},
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()

        hits = data.get("hits", {}).get("hits", [])
        for hit in hits[:30]:
            src = hit.get("_source", {})
            entity_name = src.get("entity_name") or src.get("display_names", ["Unknown"])[0]
            file_date = src.get("file_date") or src.get("period_of_report") or ""
            accession = hit.get("_id", "").replace(":", "-")
            filing_url = f"https://www.sec.gov/Archives/edgar/data/{accession}"

            try:
                ts = datetime.strptime(file_date[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            except ValueError:
                ts = datetime.now(timezone.utc)

            sector = classify_sector(entity_name)
            records.append(Event(
                id=make_id("org_moves_sec", accession or entity_name + file_date),
                ts=ts,
                source="org_moves",
                source_url=filing_url,
                type="exec_move",
                company=Company(
                    name=str(entity_name)[:80],
                    sector=sector,
                ),
                magnitude=None,
                unit=None,
                raw_text=f"{entity_name} — SEC 8-K Item 5.02 exec change filed {file_date}",
                tags=["exec_move", "sec_8k", sector.lower()],
            ))
    except Exception as e:
        errors.append(f"SEC EDGAR EFTS: {e}")
    return records


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []

    tc_records = _fetch_tc_venture(errors)
    sec_records = _fetch_edgar_exec_changes(errors)
    records = tc_records + sec_records

    if dry_run:
        print(f"[org_moves] dry-run — {len(tc_records)} TC, {len(sec_records)} SEC")
        return SourceResult(source="org_moves", ok=True, fetched_at=fetched_at)

    print(f"[org_moves] {len(records)} org/exec events ({len(tc_records)} TC, {len(sec_records)} SEC)")
    return SourceResult(
        source="org_moves",
        ok=len(errors) < 2,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
