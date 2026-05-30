"""
Cross-sector layoff signals from Google News RSS search.

TechCrunch RSS (layoffs_fyi) is tech-heavy; the heat grid's layoff column was
effectively Technology-only. Google News RSS is a public feed (no auth, no key)
that surfaces layoff headlines across every sector. Parsing is deterministic —
same keyword filter + company/headcount/sector extractors used elsewhere. No LLM.

ToS posture: public RSS  ✓
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from urllib.parse import quote_plus

import feedparser
import httpx

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import (
    classify_sector,
    extract_company_from_headline,
    extract_headcount,
    extract_region,
    make_id,
    normalize_company_name,
)

# Headline-fragment names that aren't real companies. Deterministic denylist.
_GENERIC_NAMES = {
    "ai", "tech", "bank", "banks", "staff", "admin staff", "jobs", "workers",
    "employees", "company", "startup", "startups", "wall street", "big tech",
    "corporate", "us", "uk", "global", "report", "exclusive",
}
# Trailing tokens that signal a parsed headline fragment, not a company name.
_FRAGMENT_TAILS = {"job", "jobs", "staff", "layoff", "layoffs", "cut", "cuts", "workforce"}
# Leading words that mean the extractor grabbed a clause, not a name.
_FRAGMENT_HEADS = {"as", "the", "why", "how", "after", "amid", "more", "over"}


def _is_real_company(name: str) -> bool:
    """Reject generic/headline-fragment 'company' names from RSS title parsing."""
    key = normalize_company_name(name)
    if not key or key in _GENERIC_NAMES:
        return False
    toks = key.split()
    if toks[-1] in _FRAGMENT_TAILS or toks[0] in _FRAGMENT_HEADS:
        return False
    return True

# Sector-spread queries so the layoff column isn't Technology-only.
# `when:21d` limits to recent news. One RSS feed per query; dedup collapses overlap.
QUERIES = [
    "tech layoffs",
    "bank layoffs",
    "healthcare layoffs",
    "retail layoffs",
    "manufacturing layoffs",
    "media layoffs",
    "company layoffs announced",
]

_RSS = "https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en"

LAYOFF_KEYWORDS = [
    "layoff", "laid off", "job cut", "jobs cut", "cuts jobs", "workforce reduction",
    "reduction in force", "rif", "downsizing", "eliminat", "restructur", "to cut",
]

SOURCE_META = SourceMeta(
    source="news_layoffs",
    display_name="Layoff Headlines (Google News RSS)",
    url="https://news.google.com/",
    tos_posture="public_rss",
    cadence_hours=6,
)


def _strip_publisher(title: str) -> str:
    """Google News titles end with ' - Publisher'. Drop it for cleaner parsing."""
    return re.sub(r"\s+-\s+[^-]+$", "", title).strip()


def _parse_entry(entry: object) -> Event | None:
    raw_title: str = getattr(entry, "title", "") or ""
    summary: str = getattr(entry, "summary", "") or ""
    link: str = getattr(entry, "link", "") or ""
    published_parsed = getattr(entry, "published_parsed", None)

    title = _strip_publisher(raw_title)
    full_text = f"{title} {summary}"

    if not any(kw in full_text.lower() for kw in LAYOFF_KEYWORDS):
        return None

    if published_parsed:
        ts = datetime(*published_parsed[:6], tzinfo=timezone.utc)
    else:
        ts = datetime.now(timezone.utc)

    company_name = extract_company_from_headline(title)
    # Quality gate: a layoff signal without a resolvable company is noise
    # (generic roundups, "tech layoffs surge" headlines). Drop it.
    if not company_name or company_name == "Unknown":
        return None
    if not _is_real_company(company_name):
        return None

    magnitude = extract_headcount(full_text)
    region = extract_region(full_text)
    sector = classify_sector(full_text, company_name=company_name)

    return Event(
        id=make_id("news_layoffs", link or full_text[:60]),
        ts=ts,
        source="news_layoffs",
        source_url=link or "https://news.google.com/",
        type="layoff",
        company=Company(name=company_name, sector=sector, hq_region=region),
        magnitude=magnitude,
        unit="people" if magnitude else None,
        raw_text=title[:200],
        tags=["layoff", sector.lower(), *([region] if region else [])],
    )


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records: list[Event] = []
    seen_links: set[str] = set()

    for query in QUERIES:
        url = _RSS.format(q=quote_plus(f"{query} when:21d"))
        try:
            resp = httpx.get(
                url, timeout=12, follow_redirects=True,
                headers={"User-Agent": "talent-intel-dashboard/1.0 (public data)"},
            )
            resp.raise_for_status()
            parsed = feedparser.parse(resp.text)
            if dry_run:
                print(f"[news_layoffs] dry-run '{query}': {len(parsed.entries)} entries")

            for entry in parsed.entries:
                link = getattr(entry, "link", "") or ""
                if link and link in seen_links:
                    continue
                seen_links.add(link)
                try:
                    evt = _parse_entry(entry)
                    if evt:
                        records.append(evt)
                except Exception as e:
                    errors.append(f"'{query}' entry: {e}")

        except Exception as e:
            errors.append(f"'{query}': {e}")

    if not dry_run:
        print(f"[news_layoffs] {len(records)} layoff events from Google News RSS")

    return SourceResult(
        source="news_layoffs",
        ok=len(errors) < len(QUERIES),
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
