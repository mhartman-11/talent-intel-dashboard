"""
Lever public Postings API.
Endpoint: https://api.lever.co/v0/postings/{company}?mode=json
No auth required. ToS: public postings, designed for embeds.
"""
from __future__ import annotations

from datetime import datetime, timezone

from ..role_taxonomy import parse_role
from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import extract_region, make_id
from ._companies import slugs_for
from ._http import get_json

API = "https://api.lever.co/v0/postings/{slug}"

SOURCE_META = SourceMeta(
    source="lever",
    display_name="Lever Public Postings",
    url="https://api.lever.co/v0/postings",
    tos_posture="public_api",
    cadence_hours=6,
)


def _parse_posting(posting: dict, company: str, sector: str) -> Event | None:
    title = str(posting.get("text") or "").strip()
    if not title:
        return None
    posting_id = str(posting.get("id") or "")
    url = str(posting.get("hostedUrl") or "")
    created = posting.get("createdAt")  # epoch ms
    if isinstance(created, (int, float)):
        ts = datetime.fromtimestamp(created / 1000, tz=timezone.utc)
    else:
        ts = datetime.now(timezone.utc)

    cats = posting.get("categories") or {}
    location = cats.get("location") or ""
    team = cats.get("team") or ""
    commitment = cats.get("commitment") or ""
    description = str(posting.get("descriptionPlain") or "")[:2000]

    region = extract_region(location)
    meta = parse_role(title, description)

    return Event(
        id=make_id("lever", f"{company}:{posting_id}"),
        ts=ts,
        source="lever",
        source_url=url or "https://jobs.lever.co",
        type="posting",
        company=Company(name=company, sector=sector, hq_region=region),
        magnitude=None,
        unit="jobs",
        raw_text=f"{company} | {title} | {location} | {team}"[:240],
        tags=["hiring", "lever", sector.lower(), *([region] if region else []),
              *([meta.get("function")] if meta.get("function") else [])],
        extras={
            "role": title,
            "location": location,
            "team": team,
            "commitment": commitment,
            **{k: v for k, v in meta.items() if v not in (None, [], "")},
        },
    )


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records: list[Event] = []

    targets = slugs_for("lever")
    if dry_run:
        print(f"[lever] dry-run — {len(targets)} companies to query")

    for company, sector, slug in targets:
        try:
            data = get_json(API.format(slug=slug), params={"mode": "json"})
            postings = data if isinstance(data, list) else []
            count = 0
            for posting in postings:
                try:
                    evt = _parse_posting(posting, company, sector)
                    if evt:
                        records.append(evt)
                        count += 1
                except Exception as exc:
                    errors.append(f"{company}:{posting.get('id')}: {exc}")
            if dry_run:
                print(f"  {company} ({slug}): {count} postings")
        except Exception as exc:
            errors.append(f"{company} ({slug}): {exc}")

    if not dry_run:
        print(f"[lever] {len(records)} postings from {len(targets)} companies")

    return SourceResult(
        source="lever",
        ok=len(records) > 0 or len(errors) < len(targets),
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
