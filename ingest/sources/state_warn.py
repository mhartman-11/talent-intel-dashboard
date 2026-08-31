"""
State WARN Act layoff notices.

Every state publishes WARN notices, but almost all of them serve the data
through a JavaScript dashboard with no downloadable file. Texas publishes
its notices through a Socrata open-data API — no key, no auth, current, and
with a real headcount on every row. That is the one we ingest.

Coverage is therefore Texas-only, and the UI says so. Do not describe this
source as national. Adding a state means adding an entry to
`ingest/state_warn_endpoints.json`, not editing this file — supported
formats are "socrata", "csv", "xlsx", and "html_table".

Config via env STATE_WARN_CONFIG (JSON string), STATE_WARN_CONFIG_FILE
(path), or the repo default at ingest/state_warn_endpoints.json.

ToS posture: public open-data API  ✓
"""
from __future__ import annotations

import io
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import classify_sector, make_id, normalize_company_name
from ._http import get_bytes, get_json

SOURCE_META = SourceMeta(
    source="state_warn",
    display_name="Texas WARN Notices (state open data)",
    url="https://data.texas.gov/d/8w53-c4f6",
    tos_posture="public_api",
    cadence_hours=24,
)


def _load_config() -> list[dict]:
    raw = os.environ.get("STATE_WARN_CONFIG")
    if raw:
        try:
            return json.loads(raw)
        except Exception:
            pass
    path = os.environ.get("STATE_WARN_CONFIG_FILE")
    if path and Path(path).exists():
        try:
            return json.loads(Path(path).read_text())
        except Exception:
            pass
    # Repo-local default
    repo_default = Path(__file__).parent.parent.parent / "ingest" / "state_warn_endpoints.json"
    if repo_default.exists():
        try:
            return json.loads(repo_default.read_text())
        except Exception:
            pass
    return []


def _parse_date(raw) -> datetime:
    if isinstance(raw, datetime):
        return raw if raw.tzinfo else raw.replace(tzinfo=timezone.utc)
    s = str(raw or "").strip()
    if not s or s.lower() in ("nan", "none"):
        return datetime.now(timezone.utc)
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%m/%d/%y", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(s, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    try:
        from dateutil.parser import parse as dp
        return dp(s).replace(tzinfo=timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


def _to_float(v) -> Optional[float]:
    try:
        s = str(v).replace(",", "").strip()
        if not s or s.lower() in ("nan", "none"):
            return None
        return float(s)
    except (ValueError, TypeError):
        return None


WARN_INDEX_URL = "https://www.dol.gov/agencies/eta/layoffs/warn"


def _warn_sentence(company: str, headcount: Optional[float], city: str, state: str) -> str:
    """One plain sentence a recruiter can read without a legend."""
    where = ", ".join(x for x in (city, state) if x)
    if headcount:
        return f"{company} filed a WARN notice for {int(headcount):,} jobs in {where}."
    return f"{company} filed a WARN notice in {where}."


def _rows_from_dataframe(df, entry: dict, state: str, max_age_days: int = 240) -> list[Event]:
    import pandas as pd  # noqa: F401

    out: list[Event] = []
    columns = entry.get("columns") or {}
    landing = entry.get("landing_url") or entry.get("url") or WARN_INDEX_URL
    cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)
    company_col = columns.get("company")
    date_col = columns.get("date")
    head_col = columns.get("headcount")
    city_col = columns.get("city")

    for _, row in df.iterrows():
        company = str(row.get(company_col) or "").strip() if company_col else ""
        if not company or company.lower() in ("nan", "none"):
            continue
        ts = _parse_date(row.get(date_col)) if date_col else datetime.now(timezone.utc)
        if ts < cutoff:
            continue
        headcount = _to_float(row.get(head_col)) if head_col else None
        city = str(row.get(city_col) or "").strip() if city_col else ""

        sector = classify_sector(company, company_name=company)
        norm = normalize_company_name(company)
        out.append(Event(
            id=make_id("state_warn", f"{state}:{norm}:{ts.date().isoformat()}"),
            ts=ts,
            source="state_warn",
            source_url=landing,
            type="layoff",
            company=Company(
                name=company[:120],
                sector=sector,
                hq_region=state,
            ),
            magnitude=headcount,
            unit="people" if headcount else None,
            raw_text=_warn_sentence(company, headcount, city, state),
            tags=["layoff", "warn", state.lower(), sector.lower()],
            extras={"state": state, "city": city, "warn": True},
        ))
    return out


def _fetch_socrata(entry: dict) -> "object":
    """Newest-N rows from a Socrata open-data endpoint. No API key required."""
    import pandas as pd

    date_field = entry.get("date_field") or (entry.get("columns") or {}).get("date")
    params = {"$limit": str(entry.get("limit", 2000))}
    if date_field:
        params["$order"] = f"{date_field} DESC"
    rows = get_json(entry["url"], params=params, timeout=60.0)
    if not isinstance(rows, list):
        raise RuntimeError("socrata endpoint did not return a list")
    return pd.DataFrame(rows)


def _fetch_xlsx(url: str) -> "object":
    import pandas as pd
    content = get_bytes(url, timeout=90.0)
    return pd.read_excel(io.BytesIO(content))


def _fetch_csv(url: str) -> "object":
    import pandas as pd
    content = get_bytes(url, timeout=90.0)
    return pd.read_csv(io.BytesIO(content), low_memory=False)


def _fetch_html_table(url: str, table_index: int = 0) -> "object":
    import pandas as pd
    text_bytes = get_bytes(url, timeout=60.0)
    tables = pd.read_html(io.BytesIO(text_bytes))
    if not tables:
        raise RuntimeError("no HTML tables found")
    return tables[table_index]


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records: list[Event] = []

    config = _load_config()
    if not config:
        errors.append("no STATE_WARN_CONFIG provided; see source docstring")
        return SourceResult(
            source="state_warn", ok=False, fetched_at=fetched_at,
            records=[], errors=errors,
        )

    for entry in config:
        state = str(entry.get("state") or "??").upper()
        url = entry.get("url")
        fmt = (entry.get("format") or "xlsx").lower()
        columns = entry.get("columns") or {}
        try:
            if fmt == "socrata":
                df = _fetch_socrata(entry)
            elif fmt == "xlsx":
                df = _fetch_xlsx(url)
            elif fmt == "csv":
                df = _fetch_csv(url)
            elif fmt == "html_table":
                df = _fetch_html_table(url, entry.get("table_index", 0))
            else:
                raise RuntimeError(f"unknown format {fmt}")
            new_recs = _rows_from_dataframe(df, entry, state)
            records.extend(new_recs)
            if dry_run:
                print(f"  {state}: {len(new_recs)} WARN notices")
        except Exception as exc:
            errors.append(f"{state} ({url}): {exc}")

    if dry_run:
        print(f"[state_warn] dry-run — {len(records)} WARN notices across {len(config)} states")
    else:
        print(f"[state_warn] {len(records)} WARN notices")

    return SourceResult(
        source="state_warn",
        ok=len(records) > 0,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
