"""
Hacker News "Who is Hiring?" monthly thread.
Uses the official HN Algolia search API — public, no auth required.
ToS posture: public API  ✓
"""
from __future__ import annotations

from datetime import datetime, timezone

import httpx

from ..schema import SourceMeta, SourceResult
from ..normalizers import normalize_hn_hiring_comment

# HN Algolia API: search comments in "Ask HN: Who is Hiring?" threads
# Docs: https://hn.algolia.com/api
HN_ALGOLIA_URL = "https://hn.algolia.com/api/v1/search_by_date"

SOURCE_META = SourceMeta(
    source="hn_whoishiring",
    display_name="HN Who is Hiring",
    url="https://news.ycombinator.com",
    tos_posture="public_api",
    cadence_hours=24,
)


def _get_latest_thread_id() -> str | None:
    """Find the most recent 'Ask HN: Who is Hiring?' post ID."""
    try:
        resp = httpx.get(
            "https://hn.algolia.com/api/v1/search",
            params={
                "query": "Ask HN: Who is Hiring?",
                "tags": "story,ask_hn",
                "hitsPerPage": 5,
            },
            timeout=10,
        )
        resp.raise_for_status()
        hits = resp.json().get("hits", [])
        for hit in hits:
            if "Who is Hiring" in (hit.get("title") or ""):
                return str(hit.get("objectID") or hit.get("story_id"))
    except Exception:
        pass
    return None


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []

    thread_id = _get_latest_thread_id()
    if not thread_id:
        errors.append("Could not find latest Who is Hiring thread")
        # Fall back to a direct search for recent hiring comments
        params = {
            "query": "",
            "tags": "comment,ask_hn",
            "hitsPerPage": 200,
        }
    else:
        params = {
            "query": "",
            "tags": f"comment,story_{thread_id}",
            "hitsPerPage": 200,
        }

    try:
        resp = httpx.get(HN_ALGOLIA_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        return SourceResult(
            source="hn_whoishiring",
            ok=False,
            fetched_at=fetched_at,
            errors=[str(e)],
        )

    hits = data.get("hits", [])
    if dry_run:
        print(f"[hn_whoishiring] dry-run — {len(hits)} hits in thread {thread_id}")
        return SourceResult(source="hn_whoishiring", ok=True, fetched_at=fetched_at)

    records = []
    for hit in hits:
        try:
            evt = normalize_hn_hiring_comment(hit)
            if evt:
                records.append(evt)
        except Exception as e:
            errors.append(f"comment parse error: {e}")

    print(f"[hn_whoishiring] {len(records)} hiring posts parsed from thread {thread_id}")
    return SourceResult(
        source="hn_whoishiring",
        ok=True,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:5],
    )
