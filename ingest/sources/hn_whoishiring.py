"""
Hacker News "Who is Hiring?" monthly thread.
Uses HN Firebase API to find the thread, then HN Algolia for comments.
ToS posture: public API  ✓
"""
from __future__ import annotations

from datetime import datetime, timezone

import httpx

from ..schema import SourceMeta, SourceResult
from ..normalizers import normalize_hn_hiring_comment

HN_ALGOLIA_URL = "https://hn.algolia.com/api/v1/search"
HN_FIREBASE_USER = "https://hacker-news.firebaseio.com/v0/user/whoishiring/submitted.json"
HN_FIREBASE_ITEM = "https://hacker-news.firebaseio.com/v0/item/{}.json"

SOURCE_META = SourceMeta(
    source="hn_whoishiring",
    display_name="HN Who is Hiring",
    url="https://news.ycombinator.com",
    tos_posture="public_api",
    cadence_hours=24,
)


def _get_latest_thread_id() -> str | None:
    """Find the most recent 'Ask HN: Who is Hiring?' post via Firebase API."""
    try:
        # whoishiring user posts the monthly thread — get their submission list
        resp = httpx.get(HN_FIREBASE_USER, timeout=15)
        resp.raise_for_status()
        item_ids: list[int] = resp.json() or []

        # Walk the newest submissions until we find a "Who is Hiring" story
        for item_id in item_ids[:10]:
            item_resp = httpx.get(
                HN_FIREBASE_ITEM.format(item_id),
                timeout=10,
            )
            item_resp.raise_for_status()
            item = item_resp.json() or {}
            title = item.get("title") or ""
            if "who is hiring" in title.lower() and item.get("type") == "story":
                return str(item_id)
    except Exception as exc:
        print(f"[hn_whoishiring] Firebase lookup failed: {exc}")

    # Algolia fallback
    try:
        resp = httpx.get(
            "https://hn.algolia.com/api/v1/search",
            params={
                "query": "Ask HN: Who is Hiring?",
                "tags": "story",
                "hitsPerPage": 5,
            },
            timeout=10,
        )
        resp.raise_for_status()
        for hit in resp.json().get("hits", []):
            if "who is hiring" in (hit.get("title") or "").lower():
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
        return SourceResult(
            source="hn_whoishiring",
            ok=False,
            fetched_at=fetched_at,
            errors=errors,
        )

    print(f"[hn_whoishiring] thread_id={thread_id}")

    try:
        resp = httpx.get(
            HN_ALGOLIA_URL,
            params={
                "tags": f"comment,story_{thread_id}",
                "hitsPerPage": 500,
            },
            timeout=20,
        )
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

    print(f"[hn_whoishiring] {len(records)} hiring posts from thread {thread_id}")
    return SourceResult(
        source="hn_whoishiring",
        ok=True,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:5],
    )
