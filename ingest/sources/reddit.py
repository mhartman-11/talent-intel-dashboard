"""
Reddit public JSON API — community sentiment signal.

Pull /new from talent-relevant subreddits. Emit one Event per post that
mentions a tracked company OR carries a hiring/layoff flair, tagged with
upvote ratio + comment count for sentiment weight.

ToS: Reddit public JSON requires a unique User-Agent (no auth). Polite
rate-limit (~60/min) respected by sequential requests.
"""
from __future__ import annotations

import re
import time
from datetime import datetime, timezone

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import classify_sector, extract_company_from_headline, make_id
from ._http import get_json

# Reddit requires a specific UA format and rejects generic httpx clients.
# Recommended: <platform>:<app>:<version> (by /u/<username>) or contact email.
REDDIT_UA = "python:talent-intel-dashboard:1.0 (contact: contact@hartmanai.com)"

SOURCE_META = SourceMeta(
    source="reddit",
    display_name="Reddit Community Sentiment",
    url="https://www.reddit.com",
    tos_posture="public_api",
    cadence_hours=12,
)

_SUBREDDITS = [
    "layoffs", "recruiting", "cscareerquestions", "jobs",
    "recruitinghell", "ITCareerQuestions",
]

_HIRING_KW = re.compile(
    r"\b(hiring|hired|offer|job offer|recruit|opening|posting|interview|application)\b",
    re.IGNORECASE,
)
_LAYOFF_KW = re.compile(
    r"\b(laid off|layoff|fired|let go|rif|severance|reduction in force|terminated)\b",
    re.IGNORECASE,
)


def _classify_post(title: str, body: str) -> str | None:
    txt = f"{title} {body}"
    is_lay = bool(_LAYOFF_KW.search(txt))
    is_hire = bool(_HIRING_KW.search(txt))
    if is_lay and not is_hire:
        return "layoff"
    if is_hire and not is_lay:
        return "posting"
    if is_lay:
        return "layoff"
    return None


def _parse_post(post: dict, subreddit: str) -> Event | None:
    data = post.get("data") or {}
    title = str(data.get("title") or "")
    body = str(data.get("selftext") or "")[:1500]
    evt_type = _classify_post(title, body)
    if not evt_type:
        return None

    created = data.get("created_utc")
    ts = datetime.fromtimestamp(float(created), tz=timezone.utc) if created else datetime.now(timezone.utc)

    permalink = data.get("permalink") or ""
    url = f"https://www.reddit.com{permalink}" if permalink else "https://www.reddit.com"
    post_id = str(data.get("id") or "")
    score = int(data.get("score") or 0)
    num_comments = int(data.get("num_comments") or 0)
    upvote_ratio = float(data.get("upvote_ratio") or 0)
    flair = str(data.get("link_flair_text") or "")

    company_name = extract_company_from_headline(title) or "Unknown"
    sector = classify_sector(title + " " + body, company_name=company_name)

    return Event(
        id=make_id("reddit", f"{subreddit}:{post_id}"),
        ts=ts,
        source="reddit",
        source_url=url,
        type=evt_type,  # type: ignore[arg-type]
        company=Company(name=company_name, sector=sector),
        magnitude=float(score),
        unit="upvotes",
        raw_text=title[:240],
        tags=["reddit", subreddit.lower(), evt_type, sector.lower(),
              *([flair] if flair else [])],
        extras={
            "subreddit": subreddit,
            "score": score,
            "num_comments": num_comments,
            "upvote_ratio": upvote_ratio,
            "flair": flair,
        },
    )


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records: list[Event] = []

    for sub in _SUBREDDITS:
        url = f"https://www.reddit.com/r/{sub}/new.json"
        try:
            data = get_json(
                url,
                params={"limit": 50},
                headers={"User-Agent": REDDIT_UA},
                timeout=15.0,
            )
            children = data.get("data", {}).get("children", []) if isinstance(data, dict) else []
            for post in children:
                try:
                    evt = _parse_post(post, sub)
                    if evt:
                        records.append(evt)
                except Exception as exc:
                    errors.append(f"{sub} post: {exc}")
            if dry_run:
                print(f"  r/{sub}: {len(children)} posts scanned")
            time.sleep(1.0)  # polite delay
        except Exception as exc:
            errors.append(f"r/{sub}: {exc}")

    if dry_run:
        print(f"[reddit] dry-run — {len(records)} events from {len(_SUBREDDITS)} subreddits")
    else:
        print(f"[reddit] {len(records)} events")

    return SourceResult(
        source="reddit",
        ok=len(errors) < len(_SUBREDDITS),
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
