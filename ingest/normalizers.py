"""
Normalization utilities: raw dicts → typed Event objects.
Each source module calls the appropriate helper here.
"""
from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from typing import Optional

from .schema import Company, Event, SECTORS


# ─── ID generation ────────────────────────────────────────────────────────────


def make_id(source: str, native_id: str) -> str:
    raw = f"{source}:{native_id}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


# ─── Sector classification ─────────────────────────────────────────────────────

_SECTOR_KEYWORDS: dict[str, list[str]] = {
    "Technology": [
        "software", "saas", "tech", "cloud", "ai", "data", "cyber", "semiconductor",
        "hardware", "internet", "app", "platform", "devops", "fintech", "edtech",
    ],
    "Finance": [
        "bank", "financ", "invest", "capital", "asset", "insurance", "mortgage",
        "lending", "credit", "payment", "fund", "equity", "trading", "wealth",
    ],
    "Healthcare": [
        "health", "pharma", "biotech", "medical", "hospital", "clinic", "drug",
        "therapeut", "diagnostics", "genomic", "medtech", "dental", "vision",
    ],
    "CPG": [
        "consumer", "food", "beverage", "packaged", "brand", "cosmetic", "beauty",
        "nutrition", "snack", "grocery", "cpg", "fmcg", "household",
    ],
    "Manufacturing": [
        "manufactur", "automotive", "aerospace", "defense", "chemical", "material",
        "industrial", "logistic", "supply chain", "warehouse", "3d print", "electric vehicle",
    ],
    "Retail": [
        "retail", "ecommerce", "e-commerce", "fashion", "apparel", "marketplace",
        "store", "shopping", "dTC", "direct-to-consumer", "wholesale",
    ],
    "Media": [
        "media", "entertain", "gaming", "streaming", "content", "publish", "news",
        "music", "film", "sport", "broadcast", "podcast", "social",
    ],
}


def classify_sector(text: str) -> SECTORS:
    """Best-effort sector classification from free text."""
    lower = text.lower()
    scores: dict[str, int] = {}
    for sector, keywords in _SECTOR_KEYWORDS.items():
        scores[sector] = sum(1 for kw in keywords if kw in lower)
    best = max(scores, key=lambda s: scores[s])
    return best if scores[best] > 0 else "Other"  # type: ignore[return-value]


# ─── Region extraction ─────────────────────────────────────────────────────────

_US_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
}

_CITY_STATE: dict[str, str] = {
    "san francisco": "CA", "los angeles": "CA", "new york": "NY", "chicago": "IL",
    "seattle": "WA", "austin": "TX", "boston": "MA", "miami": "FL",
    "denver": "CO", "atlanta": "GA", "dallas": "TX", "houston": "TX",
    "phoenix": "AZ", "minneapolis": "MN", "detroit": "MI", "portland": "OR",
}


def extract_region(text: str) -> Optional[str]:
    lower = text.lower()
    for city, state in _CITY_STATE.items():
        if city in lower:
            return state
    for token in re.findall(r'\b([A-Z]{2})\b', text):
        if token in _US_STATES:
            return token
    return None


# ─── Number extraction ────────────────────────────────────────────────────────

def extract_headcount(text: str) -> Optional[float]:
    """Pull first large number from text as approximate headcount."""
    patterns = [
        r'(\d[\d,]+)\s*(?:employees?|workers?|jobs?|positions?|roles?|people|staff)',
        r'(?:laid off|cut|eliminat|reduc|slash)\s+(?:about\s+|around\s+|roughly\s+)?(\d[\d,]+)',
        r'(\d[\d,]+)\s*(?:job|role|position)\s*(?:cut|eliminat|reduc)',
    ]
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            return float(m.group(1).replace(",", ""))
    # Fallback: grab any bare number 100+
    nums = [int(n.replace(",", "")) for n in re.findall(r'\b(\d[\d,]+)\b', text)]
    large = [n for n in nums if n >= 100]
    return float(large[0]) if large else None


# ─── Layoffs.fyi row → Event ───────────────────────────────────────────────────


def normalize_layoffs_fyi_row(row: dict) -> Event:
    """
    layoffs.fyi CSV columns (approximate):
      Company, Location, # Laid Off, Date, Percentage, URL, Industry, Stage, Date Added
    """
    company_name = str(row.get("Company") or row.get("company") or "Unknown")
    location = str(row.get("Location") or row.get("location") or "")
    laid_off_raw = row.get("# Laid Off") or row.get("laid_off") or ""
    date_raw = str(row.get("Date") or row.get("date") or row.get("Date Added") or "")
    url = str(row.get("URL") or row.get("url") or "https://layoffs.fyi")
    industry = str(row.get("Industry") or row.get("industry") or "")

    try:
        magnitude = float(str(laid_off_raw).replace(",", "")) if laid_off_raw and str(laid_off_raw).strip() not in ("", "Unknown") else None
    except (ValueError, TypeError):
        magnitude = None

    try:
        ts = datetime.strptime(date_raw.strip(), "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        try:
            from dateutil.parser import parse as dateparse
            ts = dateparse(date_raw).replace(tzinfo=timezone.utc) if date_raw else datetime.now(timezone.utc)
        except Exception:
            ts = datetime.now(timezone.utc)

    sector = classify_sector(f"{company_name} {industry}")
    region = extract_region(location)

    return Event(
        id=make_id("layoffs_fyi", f"{company_name}:{date_raw}"),
        ts=ts,
        source="layoffs_fyi",
        source_url=url,
        type="layoff",
        company=Company(
            name=company_name,
            industry=industry or None,
            sector=sector,
            hq_region=region,
        ),
        magnitude=magnitude,
        unit="people",
        raw_text=f"{company_name} laid off {laid_off_raw} in {location}".strip(),
        tags=["layoff", sector.lower(), *([region] if region else [])],
    )


# ─── HN Who is Hiring comment → Event ─────────────────────────────────────────


def normalize_hn_hiring_comment(comment: dict) -> Optional[Event]:
    """
    HN item comment dict from algolia API.
    Fields: objectID, created_at, author, text, parent_id
    """
    text = comment.get("comment_text") or comment.get("text") or ""
    if not text or len(text) < 20:
        return None

    # Strip HTML tags for raw_text
    clean = re.sub(r'<[^>]+>', ' ', text).strip()
    clean = re.sub(r'\s+', ' ', clean)[:300]

    ts_raw = comment.get("created_at") or comment.get("created_at_i")
    if isinstance(ts_raw, (int, float)):
        ts = datetime.fromtimestamp(ts_raw, tz=timezone.utc)
    elif isinstance(ts_raw, str):
        try:
            ts = datetime.fromisoformat(ts_raw.replace("Z", "+00:00"))
        except ValueError:
            ts = datetime.now(timezone.utc)
    else:
        ts = datetime.now(timezone.utc)

    sector = classify_sector(clean)
    region = extract_region(clean)
    native_id = str(comment.get("objectID") or comment.get("id") or clean[:40])

    return Event(
        id=make_id("hn_whoishiring", native_id),
        ts=ts,
        source="hn_whoishiring",
        source_url=f"https://news.ycombinator.com/item?id={native_id}",
        type="posting",
        company=Company(
            name=_extract_company_from_hn(clean),
            sector=sector,
            hq_region=region,
        ),
        magnitude=None,
        unit="jobs",
        raw_text=clean,
        tags=["hiring", "hn", sector.lower(), *([region] if region else [])],
    )


def _extract_company_from_hn(text: str) -> str:
    """HN format is often 'Company Name | Role | Location | ...'"""
    parts = re.split(r'\s*[|\-–]\s*', text)
    if parts:
        candidate = parts[0].strip()
        if 5 <= len(candidate) <= 80:
            return candidate
    return "Unknown"


# ─── FRED series observation → Event ──────────────────────────────────────────


def normalize_fred_observation(series_id: str, series_name: str, obs: dict, event_type: str = "macro") -> Optional[Event]:
    """
    FRED observation dict: {date: "YYYY-MM-DD", value: "3.7", realtime_start, realtime_end}
    """
    value_raw = obs.get("value", ".")
    if value_raw == ".":
        return None

    try:
        value = float(value_raw)
    except (ValueError, TypeError):
        return None

    date_str = obs.get("date", "")
    try:
        ts = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        ts = datetime.now(timezone.utc)

    return Event(
        id=make_id("fred", f"{series_id}:{date_str}"),
        ts=ts,
        source="fred",
        source_url=f"https://fred.stlouisfed.org/series/{series_id}",
        type=event_type,  # type: ignore[arg-type]
        company=None,
        magnitude=value,
        unit="pp",
        raw_text=f"{series_name}: {value}",
        tags=[event_type, "fred", series_id.lower()],
    )
