"""
State WARN Act layoff notices.

Each state publishes WARN notices independently — formats vary (HTML tables,
XLSX, CSV). URLs change yearly, so this source is config-driven.

Configure via env var STATE_WARN_CONFIG (JSON string) or
STATE_WARN_CONFIG_FILE (path to JSON file). Shape:

  [
    {"state": "WA",
     "url": "https://esd.wa.gov/.../WARN-FY25.xlsx",
     "format": "xlsx",
     "columns": {"company": "Company Name", "date": "Date Received",
                 "headcount": "Number of Workers", "city": "Worksite City"}},
    {"state": "CA",
     "url": "https://edd.ca.gov/.../WARN_Report_2024-2025.xlsx",
     "format": "xlsx",
     "columns": {"company": "Company", "date": "Notice Date",
                 "headcount": "No. Of Employees", "city": "City"}}
  ]

format: "xlsx" | "csv" | "html_table"

Source is intentionally honest — if unconfigured, reports failure rather
than emitting fake data.
"""
from __future__ import annotations

import io
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import classify_sector, make_id, normalize_company_name
from ._http import get_bytes

SOURCE_META = SourceMeta(
    source="state_warn",
    display_name="State WARN Notices",
    url="https://www.dol.gov/agencies/eta/layoffs/warn",
    tos_posture="public_csv",
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


def _rows_from_dataframe(df, columns: dict, state: str) -> list[Event]:
    import pandas as pd  # noqa: F401

    out: list[Event] = []
    company_col = columns.get("company")
    date_col = columns.get("date")
    head_col = columns.get("headcount")
    city_col = columns.get("city")

    for _, row in df.iterrows():
        company = str(row.get(company_col) or "").strip() if company_col else ""
        if not company or company.lower() in ("nan", "none"):
            continue
        ts = _parse_date(row.get(date_col)) if date_col else datetime.now(timezone.utc)
        headcount = _to_float(row.get(head_col)) if head_col else None
        city = str(row.get(city_col) or "").strip() if city_col else ""

        sector = classify_sector(company, company_name=company)
        norm = normalize_company_name(company)
        out.append(Event(
            id=make_id("state_warn", f"{state}:{norm}:{ts.date().isoformat()}"),
            ts=ts,
            source="state_warn",
            source_url=f"https://www.dol.gov/agencies/eta/layoffs/warn",
            type="layoff",
            company=Company(
                name=company[:120],
                sector=sector,
                hq_region=state,
            ),
            magnitude=headcount,
            unit="people" if headcount else None,
            raw_text=f"{company} — WARN filing ({state}, {city})",
            tags=["layoff", "warn", state.lower(), sector.lower()],
            extras={"state": state, "city": city, "warn": True},
        ))
    return out


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
            if fmt == "xlsx":
                df = _fetch_xlsx(url)
            elif fmt == "csv":
                df = _fetch_csv(url)
            elif fmt == "html_table":
                df = _fetch_html_table(url, entry.get("table_index", 0))
            else:
                raise RuntimeError(f"unknown format {fmt}")
            new_recs = _rows_from_dataframe(df, columns, state)
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
