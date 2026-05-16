"""
Greenhouse public Job Board API.
Endpoint: https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true
No auth required. ToS: public job board, intentionally public.
"""
from __future__ import annotations

from datetime import datetime, timezone

from ..role_taxonomy import parse_role
from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import extract_region, make_id
from ._companies import slugs_for
from ._http import get_json

API = "https://boards-api.greenhouse.io/v1/boards/{slug}/jobs"

SOURCE_META = SourceMeta(
    source="greenhouse",
    display_name="Greenhouse Public Job Boards",
    url="https://boards-api.greenhouse.io",
    tos_posture="public_api",
    cadence_hours=6,
)


def _parse_job(job: dict, company: str, sector: str) -> Event | None:
    title = str(job.get("title") or "").strip()
    if not title:
        return None
    job_id = str(job.get("id") or "")
    abs_url = str(job.get("absolute_url") or "")
    updated_at = job.get("updated_at") or job.get("created_at") or ""
    location_name = (job.get("location") or {}).get("name", "")
    content = str(job.get("content") or "")[:2000]

    try:
        ts = datetime.fromisoformat(str(updated_at).replace("Z", "+00:00"))
    except ValueError:
        ts = datetime.now(timezone.utc)

    region = extract_region(location_name)
    meta = parse_role(title, content)

    return Event(
        id=make_id("greenhouse", f"{company}:{job_id}"),
        ts=ts,
        source="greenhouse",
        source_url=abs_url or "https://boards-api.greenhouse.io",
        type="posting",
        company=Company(name=company, sector=sector, hq_region=region),
        magnitude=None,
        unit="jobs",
        raw_text=f"{company} | {title} | {location_name}"[:240],
        tags=["hiring", "greenhouse", sector.lower(), *([region] if region else []),
              *([meta.get("function")] if meta.get("function") else [])],
        extras={
            "role": title,
            "location": location_name,
            **{k: v for k, v in meta.items() if v not in (None, [], "")},
        },
    )


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records: list[Event] = []

    targets = slugs_for("greenhouse")
    if dry_run:
        print(f"[greenhouse] dry-run — {len(targets)} companies to query")

    for company, sector, slug in targets:
        try:
            data = get_json(API.format(slug=slug), params={"content": "true"})
            jobs = data.get("jobs", []) if isinstance(data, dict) else []
            count = 0
            for job in jobs:
                try:
                    evt = _parse_job(job, company, sector)
                    if evt:
                        records.append(evt)
                        count += 1
                except Exception as exc:
                    errors.append(f"{company}:{job.get('id')}: {exc}")
            if dry_run:
                print(f"  {company} ({slug}): {count} postings")
        except Exception as exc:
            errors.append(f"{company} ({slug}): {exc}")

    if not dry_run:
        print(f"[greenhouse] {len(records)} postings from {len(targets)} companies")

    return SourceResult(
        source="greenhouse",
        ok=len(records) > 0 or len(errors) < len(targets),
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
