"""
SEC EDGAR Full-Text Search (EFTS).
- 8-K Item 5.02 = exec/director departure or appointment
- Form D       = exempt-offering private placement (employee count + raise size)

Endpoint: https://efts.sec.gov/LATEST/search-index?q=...&forms=...
ToS: SEC requires identifying User-Agent with contact email. We set this in _http.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone

from ..schema import Company, Event, SourceMeta, SourceResult
from ..normalizers import classify_sector, make_id
from ._http import get_json

EFTS = "https://efts.sec.gov/LATEST/search-index"

SOURCE_META = SourceMeta(
    source="sec_edgar",
    display_name="SEC EDGAR (8-K Item 5.02 + Form D)",
    url="https://efts.sec.gov/LATEST/search-index",
    tos_posture="public_api",
    cadence_hours=6,
)


def _filing_url(adsh: str, cik: str | int) -> str:
    """Build canonical SEC filing index URL from accession + CIK."""
    no_dash = (adsh or "").replace("-", "")
    cik_str = str(cik or "").lstrip("0") or "0"
    if not no_dash:
        return "https://www.sec.gov/cgi-bin/browse-edgar"
    return (
        f"https://www.sec.gov/cgi-bin/browse-edgar"
        f"?action=getcompany&CIK={cik_str}&type=&dateb=&owner=include&count=40"
    )


# Most Form D filings are special-purpose vehicles, fund series, and real
# estate partnerships. They never hire anyone, and they outnumber real
# operating companies roughly ten to one — left in, they are the entire
# funding feed. Deterministic name filter, no LLM.
_NON_OPERATING = re.compile(
    r"\ba series of\b"
    r"|\bseries\s+[a-z0-9-]{1,4}\b"
    r"|\b(spv|reit)\b"
    r"|\b(equity|capital|investment|opportunity|venture|growth)\s+(partners|fund|holdings|management)\b"
    r"|\bfund\s*[-–]?\s*\d*\b"
    r"|\b(l\.?p\.?|lllp)\s*$"
    r"|\b(realty|properties|property|apartments|estates|ranch|business park|commons|plaza|towers|acquisition corp)\b",
    re.IGNORECASE,
)


def _is_operating_company(name: str) -> bool:
    """False for SPVs, fund series, and real-estate partnerships."""
    return _NON_OPERATING.search(name or "") is None


def _tidy_name(name: str) -> str:
    """SEC entity names arrive shouted and suffixed: 'LENNAR CORP /NEW/'."""
    n = re.sub(r"\s*/[A-Z]{2,}/\s*$", "", str(name)).strip().strip(",")
    n = re.sub(r"\s+", " ", n)
    # All-caps names read as noise next to normal headlines; title-case them
    # but keep genuine acronyms (IBM, AT&T) intact.
    if n.isupper():
        n = " ".join(w if (len(w) <= 3 and w.isalpha()) else w.title() for w in n.split())
    return n


def _sec_sentence(name: str, event_type: str, file_date: str) -> str:
    """Plain sentence instead of an accession number nobody can read."""
    when = f" on {file_date}" if file_date else ""
    if event_type == "exec_move":
        return f"{name} reported an executive or board change in an 8-K filing{when}."
    if event_type == "funding":
        return f"{name} filed a Form D securities offering with the SEC{when}."
    return f"{name} filed an 8-K with the SEC{when}."


def _hit_to_event(hit: dict, event_type: str, tags: list[str]) -> Event | None:
    src = hit.get("_source", {}) or {}
    display_names = src.get("display_names") or []
    name = display_names[0] if display_names else (src.get("entity_name") or "Unknown")
    # Display name often includes "(CIK 0001234567)" — trim it
    if " (" in name:
        name = name.split(" (")[0]
    name = _tidy_name(name)
    file_date = src.get("file_date") or src.get("period_of_report") or ""
    adsh = src.get("adsh") or hit.get("_id") or ""
    ciks = src.get("ciks") or []
    cik = ciks[0] if ciks else ""

    try:
        ts = datetime.strptime(str(file_date)[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        ts = datetime.now(timezone.utc)

    # Form D is dominated by shell entities; 8-K filers are real registrants.
    if event_type == "funding" and not _is_operating_company(str(name)):
        return None

    sector = classify_sector(str(name), company_name=str(name))

    return Event(
        id=make_id("sec_edgar", f"{adsh}:{event_type}"),
        ts=ts,
        source="sec_edgar",
        source_url=_filing_url(adsh, cik),
        type=event_type,  # type: ignore[arg-type]
        company=Company(name=str(name)[:120], sector=sector),
        magnitude=None,
        unit=None,
        raw_text=_sec_sentence(str(name), event_type, str(file_date)[:10]),
        tags=tags + [sector.lower()],
        extras={"adsh": adsh, "cik": str(cik), "file_date": str(file_date)},
    )


def _query_efts(query: str, forms: str, days_back: int = 30, limit: int = 100) -> list[dict]:
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=days_back)
    params = {
        "q": query,
        "forms": forms,
        "dateRange": "custom",
        "startdt": start.isoformat(),
        "enddt": today.isoformat(),
    }
    data = get_json(EFTS, params=params, timeout=30.0)
    if not isinstance(data, dict):
        return []
    hits = data.get("hits", {}).get("hits", []) or []
    return hits[:limit]


def fetch(dry_run: bool = False) -> SourceResult:
    fetched_at = datetime.now(timezone.utc)
    errors: list[str] = []
    records: list[Event] = []

    # 1. 8-K Item 5.02 exec changes
    try:
        hits = _query_efts('"Item 5.02"', "8-K", days_back=14, limit=80)
        for hit in hits:
            try:
                evt = _hit_to_event(hit, "exec_move", tags=["exec_move", "sec_8k"])
                if evt:
                    records.append(evt)
            except Exception as exc:
                errors.append(f"8-K hit: {exc}")
    except Exception as exc:
        errors.append(f"EFTS 8-K query: {exc}")

    # 2. Form D private placement
    try:
        hits = _query_efts("", "D", days_back=30, limit=80)
        for hit in hits:
            try:
                evt = _hit_to_event(hit, "funding", tags=["funding", "form_d"])
                if evt:
                    records.append(evt)
            except Exception as exc:
                errors.append(f"Form D hit: {exc}")
    except Exception as exc:
        errors.append(f"EFTS Form D query: {exc}")

    if dry_run:
        print(f"[sec_edgar] dry-run — {len(records)} filings")
    else:
        print(f"[sec_edgar] {len(records)} filings")

    return SourceResult(
        source="sec_edgar",
        ok=len(errors) < 2,
        fetched_at=fetched_at,
        records=records,
        errors=errors[:10],
    )
