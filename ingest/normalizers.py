"""
Normalization utilities: raw dicts -> typed Event objects.
Each source module calls the appropriate helper here.
"""
from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from typing import Optional

from .schema import Company, Event, SECTORS


# --- ID generation ----------------------------------------------------------


def make_id(source: str, native_id: str) -> str:
    raw = f"{source}:{native_id}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


# --- Company name normalization --------------------------------------------

_CORP_SUFFIX = re.compile(
    r",?\s+(?:Inc|Incorporated|LLC|L\.L\.C\.|Corp|Corporation|Co|Company|"
    r"Ltd|Limited|PLC|GmbH|S\.A\.|SA|AG|N\.V\.|NV|PBC|LP|LLP)\.?\s*$",
    re.IGNORECASE,
)
_PUNCT = re.compile(r"[^a-z0-9 ]+")
_WS = re.compile(r"\s+")


def normalize_company_name(name: str) -> str:
    """Canonical lowercase key for company entity matching."""
    if not name:
        return ""
    n = name.strip()
    # Strip corporate suffixes iteratively (handle "Acme Corp Inc.")
    for _ in range(3):
        stripped = _CORP_SUFFIX.sub("", n).strip()
        if stripped == n:
            break
        n = stripped
    n = n.lower()
    n = _PUNCT.sub(" ", n)
    n = _WS.sub(" ", n).strip()
    return n


# --- Sector classification --------------------------------------------------

_SECTOR_KEYWORDS: dict[str, list[str]] = {
    "Technology": [
        "software", "saas", "cloud", "semiconductor", "hardware",
        "developer", "engineer", "platform", "devops", "fintech",
        "edtech", "cybersecurity", "data center", "ai startup",
    ],
    "Finance": [
        "bank", "financial services", "investment", "insurance", "mortgage",
        "lending", "credit", "payment", "asset management", "hedge fund",
        "private equity", "venture capital", "trading", "wealth management",
        "broker", "fintech",
    ],
    "Healthcare": [
        "health", "pharma", "biotech", "medical", "hospital", "clinic", "drug",
        "therapeutic", "diagnostics", "genomic", "medtech", "dental",
        "vision care", "telehealth", "life sciences", "pharmaceutical",
    ],
    "CPG": [
        "consumer packaged", "food", "beverage", "cosmetic", "beauty",
        "nutrition", "snack", "grocery", "cpg", "fmcg", "household",
        "personal care", "apparel brand",
    ],
    "Manufacturing": [
        "manufactur", "automotive", "aerospace", "defense", "chemical",
        "industrial", "supply chain", "warehouse", "electric vehicle",
        "robotics", "auto parts", "heavy machinery",
    ],
    "Retail": [
        "retail", "ecommerce", "e-commerce", "fashion", "apparel",
        "marketplace", "store", "shopping", "direct-to-consumer",
        "wholesale", "department store", "grocery chain",
    ],
    "Media": [
        "media", "entertainment", "gaming", "streaming", "publishing",
        "news outlet", "music label", "film studio", "sports league",
        "broadcast", "podcast network", "social network",
    ],
}

# Known company -> sector shortcuts (deterministic override of keyword bag)
_COMPANY_SECTOR: dict[str, str] = {
    "cisco": "Technology", "microsoft": "Technology", "google": "Technology",
    "alphabet": "Technology", "meta": "Technology", "apple": "Technology",
    "amazon": "Retail", "oracle": "Technology", "salesforce": "Technology",
    "openai": "Technology", "anthropic": "Technology", "stripe": "Technology",
    "shopify": "Retail", "nvidia": "Technology", "intel": "Technology",
    "amd": "Technology", "ibm": "Technology", "dell": "Technology",
    "hp": "Technology", "vmware": "Technology", "twilio": "Technology",
    "snowflake": "Technology", "databricks": "Technology",
    "jpmorgan": "Finance", "goldman sachs": "Finance", "morgan stanley": "Finance",
    "bank of america": "Finance", "wells fargo": "Finance", "citi": "Finance",
    "citigroup": "Finance", "blackrock": "Finance", "vanguard": "Finance",
    "visa": "Finance", "mastercard": "Finance", "paypal": "Finance",
    "square": "Finance", "block": "Finance", "coinbase": "Finance",
    "pfizer": "Healthcare", "moderna": "Healthcare", "merck": "Healthcare",
    "johnson johnson": "Healthcare", "abbvie": "Healthcare",
    "unitedhealth": "Healthcare", "cvs": "Healthcare", "walgreens": "Healthcare",
    "humana": "Healthcare", "anthem": "Healthcare", "elevance": "Healthcare",
    "procter gamble": "CPG", "unilever": "CPG", "nestle": "CPG",
    "pepsi": "CPG", "pepsico": "CPG", "coca cola": "CPG", "coca-cola": "CPG",
    "kraft heinz": "CPG", "general mills": "CPG", "kellogg": "CPG",
    "kellanova": "CPG", "mondelez": "CPG", "estee lauder": "CPG",
    "ford": "Manufacturing", "gm": "Manufacturing", "general motors": "Manufacturing",
    "stellantis": "Manufacturing", "boeing": "Manufacturing",
    "lockheed martin": "Manufacturing", "raytheon": "Manufacturing",
    "tesla": "Manufacturing", "rivian": "Manufacturing", "ge": "Manufacturing",
    "general electric": "Manufacturing", "3m": "Manufacturing",
    "walmart": "Retail", "target": "Retail", "costco": "Retail",
    "home depot": "Retail", "lowes": "Retail", "kroger": "Retail",
    "best buy": "Retail", "macys": "Retail",
    "netflix": "Media", "disney": "Media", "warner bros": "Media",
    "paramount": "Media", "comcast": "Media", "spotify": "Media",
    "nyt": "Media", "new york times": "Media", "washington post": "Media",
}


def classify_sector(text: str, company_name: Optional[str] = None) -> SECTORS:
    """Best-effort sector classification.

    1. If company name matches a known entity, use the deterministic mapping.
    2. Otherwise score keyword hits; require min score of 2 to leave 'Other'.
    """
    if company_name:
        key = normalize_company_name(company_name)
        for known, sector in _COMPANY_SECTOR.items():
            if known in key:
                return sector  # type: ignore[return-value]

    lower = (text or "").lower()
    scores: dict[str, int] = {}
    for sector, keywords in _SECTOR_KEYWORDS.items():
        scores[sector] = sum(1 for kw in keywords if kw in lower)
    best = max(scores, key=lambda s: scores[s]) if scores else "Other"
    return best if scores.get(best, 0) >= 2 else "Other"  # type: ignore[return-value]


# --- Region extraction -----------------------------------------------------

_US_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
}

_CITY_STATE: dict[str, str] = {
    "san francisco": "CA", "los angeles": "CA", "san diego": "CA",
    "san jose": "CA", "sacramento": "CA", "oakland": "CA", "palo alto": "CA",
    "mountain view": "CA", "cupertino": "CA", "menlo park": "CA",
    "new york": "NY", "brooklyn": "NY", "manhattan": "NY",
    "chicago": "IL", "naperville": "IL",
    "seattle": "WA", "bellevue": "WA", "redmond": "WA",
    "austin": "TX", "dallas": "TX", "houston": "TX", "san antonio": "TX",
    "boston": "MA", "cambridge": "MA",
    "miami": "FL", "tampa": "FL", "orlando": "FL", "jacksonville": "FL",
    "denver": "CO", "boulder": "CO",
    "atlanta": "GA",
    "phoenix": "AZ", "scottsdale": "AZ", "tempe": "AZ",
    "minneapolis": "MN", "st paul": "MN", "st. paul": "MN",
    "detroit": "MI", "ann arbor": "MI",
    "portland": "OR",
    "philadelphia": "PA", "pittsburgh": "PA",
    "washington dc": "DC", "washington, dc": "DC",
    "raleigh": "NC", "durham": "NC", "charlotte": "NC",
    "nashville": "TN", "memphis": "TN",
    "salt lake city": "UT", "provo": "UT",
    "indianapolis": "IN",
    "columbus": "OH", "cleveland": "OH", "cincinnati": "OH",
    "kansas city": "MO", "st louis": "MO", "st. louis": "MO",
    "las vegas": "NV", "reno": "NV",
    "newark": "NJ", "jersey city": "NJ",
    "providence": "RI",
    "richmond": "VA", "arlington": "VA",
    "baltimore": "MD",
}


def extract_region(text: str) -> Optional[str]:
    if not text:
        return None
    lower = text.lower()
    for city, state in _CITY_STATE.items():
        if city in lower:
            return state
    for token in re.findall(r"\b([A-Z]{2})\b", text):
        if token in _US_STATES:
            return token
    return None


# --- Number extraction -----------------------------------------------------

_SUFFIX_MULT = {"k": 1_000, "m": 1_000_000, "b": 1_000_000_000}


def _suffix_to_num(num_str: str, suffix: str) -> float:
    try:
        base = float(num_str.replace(",", ""))
    except ValueError:
        return 0.0
    return base * _SUFFIX_MULT.get(suffix.lower(), 1)


def extract_headcount(text: str) -> Optional[float]:
    """Pull explicit headcount from layoff/hiring text. Returns None if not explicit."""
    if not text:
        return None

    # Strong patterns: number adjacent to people-noun
    patterns = [
        r"(\d[\d,]*)\s*(?:k\b)?\s*(?:employees?|workers?|jobs?|positions?|roles?|people|staff|head(?:count)?)",
        r"(?:laid off|laying off|cut|cutting|eliminat\w+|reduc\w+|slash\w+|axe?d|trim\w+|lay off|let go)\s+(?:about\s+|around\s+|roughly\s+|nearly\s+|approximately\s+)?(\d[\d,]*)\s*(k\b)?",
        r"(\d[\d,]*)\s*(?:k\b)?\s*(?:job|role|position)\s*(?:cut|eliminat|reduc)",
        r"workforce\s+(?:by|of)\s+(\d[\d,]*)\s*(k\b)?",
    ]
    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            groups = m.groups()
            num = groups[0]
            suffix = groups[1] if len(groups) > 1 and groups[1] else ""
            return _suffix_to_num(num, suffix.strip() if suffix else "")
    return None


_FUNDING_RX = re.compile(
    r"\$\s*(\d+(?:\.\d+)?)\s*(million|billion|m|b)\b",
    re.IGNORECASE,
)


def extract_funding_usd(text: str) -> Optional[float]:
    """Pull funding amount in USD from text like '$35M', '$1.2 billion', '$500 million'."""
    if not text:
        return None
    m = _FUNDING_RX.search(text)
    if not m:
        return None
    num = m.group(1)
    unit = m.group(2).lower()
    mult = 1_000_000 if unit.startswith("m") else 1_000_000_000
    try:
        return float(num) * mult
    except ValueError:
        return None


# --- Company name extraction from headlines --------------------------------

# Verbs that follow a company name in news headlines
_HEADLINE_VERBS = (
    r"cut|cuts|cutting|lay off|lays off|laying off|laid off|"
    r"eliminat\w+|reduc\w+|slash\w+|trim\w+|axe|axes|axed|"
    r"raises?|raised|secures?|secured|closes?|closed|announces?|announced|"
    r"appoints?|appointed|hires?|hired|names?|named|promotes?|promoted|"
    r"acquires?|acquired|merges?|merged|"
    r"launches?|launched|files?|filed|reports?|reported|"
    r"to (?:cut|lay off|reduce|hire|acquire|raise)"
)

_HEADLINE_COMPANY = re.compile(
    rf"^\s*([A-Z][\w&.\-'/]*(?:\s+[A-Z][\w&.\-'/]*){{0,4}})\s+(?i:{_HEADLINE_VERBS})\b",
)

_PREFIX_NOISE = re.compile(
    r"^\s*(?:exclusive|breaking|update|report|opinion|analysis)\s*[:\-]?\s*",
    re.IGNORECASE,
)


def extract_company_from_headline(headline: str) -> Optional[str]:
    """Pull leading proper-noun group before an action verb from a news headline."""
    if not headline:
        return None
    cleaned = _PREFIX_NOISE.sub("", headline).strip()
    m = _HEADLINE_COMPANY.match(cleaned)
    if not m:
        return None
    candidate = m.group(1).strip(" ,.;:")
    # Reject obvious non-company leads
    bad_leads = {"the", "a", "an", "his", "her", "our", "their", "this", "that",
                 "report", "exclusive", "breaking", "opinion"}
    if candidate.lower().split()[0] in bad_leads:
        return None
    if len(candidate) < 2 or len(candidate) > 80:
        return None
    return candidate


# --- Dedup key -------------------------------------------------------------


def dedup_key(event: Event) -> str:
    """Stable hash for dedup across sources.

    Same company + same day + same signal type => duplicate even if URLs differ.
    """
    company_key = normalize_company_name(event.company.name) if event.company else ""
    day = event.ts.date().isoformat()
    raw = f"{company_key}|{day}|{event.type}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def dedup_events(events: list[Event]) -> list[Event]:
    """Keep first occurrence per dedup_key; prefer events with magnitude set."""
    by_key: dict[str, Event] = {}
    for evt in events:
        k = dedup_key(evt)
        existing = by_key.get(k)
        if existing is None:
            by_key[k] = evt
            continue
        # Prefer event that has magnitude over one that doesn't
        if existing.magnitude is None and evt.magnitude is not None:
            by_key[k] = evt
    return list(by_key.values())


# --- Layoffs.fyi row -> Event ----------------------------------------------


def normalize_layoffs_fyi_row(row: dict) -> Event:
    """layoffs.fyi CSV columns: Company, Location, # Laid Off, Date, ..."""
    company_name = str(row.get("Company") or row.get("company") or "Unknown")
    location = str(row.get("Location") or row.get("location") or "")
    laid_off_raw = row.get("# Laid Off") or row.get("laid_off") or ""
    date_raw = str(row.get("Date") or row.get("date") or row.get("Date Added") or "")
    url = str(row.get("URL") or row.get("url") or "https://layoffs.fyi")
    industry = str(row.get("Industry") or row.get("industry") or "")

    try:
        magnitude = (
            float(str(laid_off_raw).replace(",", ""))
            if laid_off_raw and str(laid_off_raw).strip() not in ("", "Unknown")
            else None
        )
    except (ValueError, TypeError):
        magnitude = None

    try:
        ts = datetime.strptime(date_raw.strip(), "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        try:
            from dateutil.parser import parse as dateparse
            ts = (
                dateparse(date_raw).replace(tzinfo=timezone.utc)
                if date_raw
                else datetime.now(timezone.utc)
            )
        except Exception:
            ts = datetime.now(timezone.utc)

    sector = classify_sector(f"{company_name} {industry}", company_name=company_name)
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


# --- FRED series observation -> Event --------------------------------------


def normalize_fred_observation(
    series_id: str,
    series_name: str,
    obs: dict,
    event_type: str = "macro",
) -> Optional[Event]:
    """FRED observation dict: {date: 'YYYY-MM-DD', value: '3.7', ...}"""
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
