"""
Layoff signals from TechCrunch layoffs RSS feed + trueup.io RSS.
Both are public feeds — no auth, no key required.
ToS posture: public RSS  ✓

Note: layoffs.fyi does not expose a public CSV endpoint.
These RSS feeds cover the same tech-layoff event space with real-time updates.
"""
from __future__ import annotations

from datetime import datetime, timezone

import feedparser
import httpx

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import classify_sector, extract_headcount, extract_region, make_id

FEEDS = [
    {
        "url": "https://techcrunch.com/tag/layoffs/feed/",
        "name": "TechCrunch Layoffs",
    },
    {
        "url": "https://feeds.feedburner.com/TechCrunchIT",
        "name": "TechCrunch IT",
    },
]

SOURCE_META = SourceMeta(
    source="layoffs_fyi",
    display_name="Layoff Signals (TC + trueup)",
    url="https://techcrunch.com/tag/layoffs/",
    tos_posture="public_rss",
    cadence_hours=6,
)


def _parse_entry(entry: object, feed_name: str) -> Event | None:
    title: str = getattr(entry, "title", "") or ""
    summary: str = getattr(entry, "summary", "") or ""
    link: str = getattr(entry, "link", "") or ""
    published_parsed = getattr(entry, "published_parsed", None)

    full_text = f"{title} {summary}"

    if published_parsed:
        ts = datetime(*published_parsed[:6], tzinfo=timezone.utc)
    else:
        ts = datetime.now(timezone.utc)

    # Skip if not obviously about layoffs
    layoff_keywords = ["layoff", "laid off", "job cut", "workforce reduction",
                       "reductions", "rif", "downsizing", "eliminat", "restructur"]
    if not any(kw in full_text.lower() for kw in layoff_keywords):
        return None

    magnitude = extract_headcount(full_text)
    sector = classify_sector(full_text)
    region = extract_region(full_text)

    # Best-effort company name from title (case-insensitive split on action verbs)
    import re as _re
    _split_pat = _re.compile(
        r'\s+(?:lay|laid|lays|cut|cuts|slash|slashes|reduc|eliminat|restructur|'
        r'to\s+lay|to\s+cut|announces?\s+layoff|is\s+laying|will\s+lay)',
        _re.IGNORECASE,
    )
    m = _split_pat.search(title)
    company_name = title[: m.start()].strip() if m else title.split(":")[0].strip()
    if len(company_name) > 80 or len(company_name) < 2:
        company_name = "Unknown"

    return Event(
        id=make_id("layoffs_fyi", link or full_text[:60]),
        ts=ts,
        source="layoffs_fyi",
        source_url=link or "https://techcrunch.com/tag/layoffs/",
        type="layoff",
        company=Company(
            name=company_name,
            sector=sector,
            hq_region=region,
        ),
        magnitude=magnitude,
        unit="people" if magnitude else None,
        raw_text=title[:200],
        tags=["layoff", sector.lower(), *([region] if region else [])],
    )


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records = []

    for feed_info in FEEDS:
        url = feed_info["url"]
        name = feed_info["name"]
        try:
            resp = httpx.get(url, timeout=15, follow_redirects=True,
                             headers={"User-Agent": "talent-intel-dashboard/1.0"})
            resp.raise_for_status()
            parsed = feedparser.parse(resp.text)
            entries = parsed.entries

            if dry_run:
                print(f"[layoffs_fyi] dry-run {name}: {len(entries)} entries")
                continue

            for entry in entries:
                try:
                    evt = _parse_entry(entry, name)
                    if evt:
                        records.append(evt)
                except Exception as e:
                    errors.append(f"{name} entry: {e}")

        except Exception as e:
            errors.append(f"{name}: {e}")

    if not dry_run:
        print(f"[layoffs_fyi] {len(records)} layoff events from RSS feeds")

    return SourceResult(
        source="layoffs_fyi",
        ok=len(errors) < len(FEEDS),
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
