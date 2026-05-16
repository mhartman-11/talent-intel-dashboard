"""
DOL / USCIS H-1B disclosure data.

Strategy: pull USCIS H-1B Employer Data Hub (smaller, employer-aggregated)
rather than full DOL LCA microdata (~700MB/quarter).

Data Hub publishes employer-level approval/denial counts per fiscal year.
URL pattern (verified for recent years): the CSV/XLSX at uscis.gov changes
per year — pin via env var H1B_DATA_HUB_URL or accept that this source
will degrade until URL is refreshed.

ToS: USCIS data is public-domain federal data, no auth.
"""
from __future__ import annotations

import io
import os
from datetime import datetime, timezone
from typing import Optional

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import classify_sector, make_id
from ._http import get_bytes

DEFAULT_URL = os.environ.get(
    "H1B_DATA_HUB_URL",
    # USCIS H-1B Employer Data Hub CSV (most recent available FY).
    # If this 404s, set H1B_DATA_HUB_URL to the current file URL from:
    # https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub
    "https://www.uscis.gov/sites/default/files/document/data/h1b_datahubexport-2024.csv",
)

SOURCE_META = SourceMeta(
    source="dol_lca",
    display_name="USCIS H-1B Employer Data Hub",
    url="https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub",
    tos_posture="public_csv",
    cadence_hours=24,
)


def _to_int(v) -> int:
    try:
        return int(str(v).replace(",", "").strip() or 0)
    except (ValueError, TypeError):
        return 0


def _parse_csv(content: bytes) -> list[Event]:
    """Parse USCIS H-1B Data Hub CSV into per-employer events."""
    import pandas as pd

    df = pd.read_csv(io.BytesIO(content), low_memory=False)
    # Column names from H-1B Data Hub (vary slightly across years):
    cols = {c.lower().strip(): c for c in df.columns}

    def col(*keys: str) -> Optional[str]:
        for k in keys:
            if k.lower() in cols:
                return cols[k.lower()]
        return None

    employer_col = col("Employer", "Employer Name", "Petitioner Name", "Employer (Petitioner) Name")
    state_col = col("State", "Petitioner State", "Worksite State", "Employer State")
    initial_approve = col("Initial Approval", "Initial Approvals")
    continuing_approve = col("Continuing Approval", "Continuing Approvals")
    initial_deny = col("Initial Denial", "Initial Denials")
    continuing_deny = col("Continuing Denial", "Continuing Denials")
    fy_col = col("Fiscal Year", "FY", "Year")

    if not employer_col:
        raise RuntimeError(f"unrecognized columns: {list(df.columns)[:10]}")

    records: list[Event] = []
    # Aggregate at employer level (sum across worksite rows if granular)
    agg_cols = [c for c in [initial_approve, continuing_approve, initial_deny, continuing_deny] if c]
    group_cols = [employer_col] + ([state_col] if state_col else [])
    if not agg_cols:
        return records
    agg_df = df.groupby(group_cols, dropna=False)[agg_cols].sum(numeric_only=True).reset_index()

    now = datetime.now(timezone.utc)
    fy_label = (
        str(df[fy_col].iloc[0]) if fy_col and len(df) > 0 else str(now.year)
    )

    for _, row in agg_df.iterrows():
        employer = str(row.get(employer_col) or "").strip()
        if not employer or employer.lower() in ("nan", "none"):
            continue
        state = str(row.get(state_col) or "").strip().upper()[:2] if state_col else ""

        init_app = _to_int(row.get(initial_approve)) if initial_approve else 0
        cont_app = _to_int(row.get(continuing_approve)) if continuing_approve else 0
        init_den = _to_int(row.get(initial_deny)) if initial_deny else 0
        cont_den = _to_int(row.get(continuing_deny)) if continuing_deny else 0
        total_app = init_app + cont_app
        if total_app == 0 and (init_den + cont_den) == 0:
            continue

        sector = classify_sector(employer, company_name=employer)
        records.append(Event(
            id=make_id("dol_lca", f"{employer}:{state}:{fy_label}"),
            ts=now,
            source="dol_lca",
            source_url="https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub",
            type="posting",
            company=Company(
                name=employer[:120],
                sector=sector,
                hq_region=state if state and len(state) == 2 else None,
            ),
            magnitude=float(total_app),
            unit="approvals",
            raw_text=f"{employer} — H-1B FY{fy_label}: {total_app} approvals ({init_app} initial, {cont_app} continuing)",
            tags=["hiring", "h1b", "dol_lca", sector.lower(),
                  *([state] if state and len(state) == 2 else [])],
            extras={
                "fy": fy_label,
                "state": state,
                "initial_approvals": init_app,
                "continuing_approvals": cont_app,
                "initial_denials": init_den,
                "continuing_denials": cont_den,
            },
        ))
    return records


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records: list[Event] = []

    try:
        content = get_bytes(DEFAULT_URL, timeout=120.0)
        records = _parse_csv(content)
    except Exception as exc:
        errors.append(f"{DEFAULT_URL}: {exc}")

    if dry_run:
        print(f"[dol_lca] dry-run — {len(records)} employers")
    else:
        print(f"[dol_lca] {len(records)} employers")

    return SourceResult(
        source="dol_lca",
        ok=len(records) > 0,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
