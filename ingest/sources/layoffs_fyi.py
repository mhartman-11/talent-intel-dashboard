"""
Tech-specific layoff signals from TechCrunch's public RSS feeds.
Public feeds — no auth, no key required.
ToS posture: public RSS  ✓

Note: layoffs.fyi does not expose a public CSV endpoint, so we use TechCrunch's
layoff coverage here. Broad cross-outlet coverage (e.g. Uber) comes from the
news_layoffs source; official filings come from the warn source.
"""
from __future__ import annotations

from datetime import datetime, timezone

import feedparser
import httpx

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import (
    classify_sector,
    clean_layoff_company,
    extract_headcount,
    extract_region,
    make_id,
)

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
    display_name="Tech Layoffs (TechCrunch RSS)",
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

    # Skip if not obviously about layoffs
    layoff_keywords = ["layoff", "laid off", "job cut", "workforce reduction",
                       "reductions", "rif", "downsizing", "eliminat", "restructur"]
    if not any(kw in full_text.lower() for kw in layoff_keywords):
        return None

    # Only keep entries with a clean "<Company> <layoff verb>" headline — the
    # same gate every layoff source uses, so commentary headlines get dropped.
    company_name = clean_layoff_company(title)
    if company_name is None:
        return None

    if published_parsed:
        ts = datetime(*published_parsed[:6], tzinfo=timezone.utc)
    else:
        ts = datetime.now(timezone.utc)

    magnitude = extract_headcount(full_text)
    region = extract_region(full_text)
    sector = classify_sector(full_text, company_name=company_name)

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
