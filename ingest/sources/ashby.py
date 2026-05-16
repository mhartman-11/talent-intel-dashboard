"""
Ashby public Job Board API.
Endpoint: https://api.ashbyhq.com/posting-api/job-board/{org}
No auth. ToS: public job board feed, designed for embedding.
"""
from __future__ import annotations

from datetime import datetime, timezone

from ..role_taxonomy import parse_role
from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import extract_region, make_id
from ._companies import slugs_for
from ._http import get_json

API = "https://api.ashbyhq.com/posting-api/job-board/{slug}"

SOURCE_META = SourceMeta(
    source="ashby",
    display_name="Ashby Public Job Boards",
    url="https://api.ashbyhq.com/posting-api",
    tos_posture="public_api",
    cadence_hours=6,
)


def _parse_job(job: dict, company: str, sector: str) -> Event | None:
    title = str(job.get("title") or "").strip()
    if not title:
        return None
    job_id = str(job.get("id") or "")
    url = str(job.get("jobUrl") or "")
    published = job.get("publishedAt") or job.get("updatedAt") or ""
    location = str(job.get("location") or "")
    department = str(job.get("department") or "")
    employment = str(job.get("employmentType") or "")
    is_remote = bool(job.get("isRemote", False))
    description = str(job.get("descriptionPlain") or job.get("description") or "")[:2000]

    try:
        ts = datetime.fromisoformat(str(published).replace("Z", "+00:00"))
    except ValueError:
        ts = datetime.now(timezone.utc)

    region = extract_region(location)
    meta = parse_role(title, description)
    if is_remote:
        meta["remote"] = "remote"

    return Event(
        id=make_id("ashby", f"{company}:{job_id}"),
        ts=ts,
        source="ashby",
        source_url=url or "https://jobs.ashbyhq.com",
        type="posting",
        company=Company(name=company, sector=sector, hq_region=region),
        magnitude=None,
        unit="jobs",
        raw_text=f"{company} | {title} | {location} | {department}"[:240],
        tags=["hiring", "ashby", sector.lower(), *([region] if region else []),
              *([meta.get("function")] if meta.get("function") else [])],
        extras={
            "role": title,
            "location": location,
            "department": department,
            "employment_type": employment,
            **{k: v for k, v in meta.items() if v not in (None, [], "")},
        },
    )


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records: list[Event] = []

    targets = slugs_for("ashby")
    if dry_run:
        print(f"[ashby] dry-run — {len(targets)} companies to query")

    for company, sector, slug in targets:
        try:
            data = get_json(API.format(slug=slug))
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
        print(f"[ashby] {len(records)} postings from {len(targets)} companies")

    return SourceResult(
        source="ashby",
        ok=len(records) > 0 or len(errors) < len(targets),
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
