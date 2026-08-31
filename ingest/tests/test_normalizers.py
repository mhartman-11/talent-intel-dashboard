"""Golden-fixture tests for normalizers."""
from datetime import datetime, timezone

import pytest

from ingest.normalizers import (
    classify_sector,
    dedup_events,
    dedup_key,
    extract_company_from_headline,
    extract_funding_usd,
    extract_headcount,
    extract_region,
    make_id,
    normalize_company_name,
    normalize_fred_observation,
    normalize_layoffs_fyi_row,
)
from ingest.schema import Company, Event


# --- make_id ---------------------------------------------------------------

def test_make_id_deterministic():
    a = make_id("layoffs_fyi", "AcmeCorp:2024-01-15")
    b = make_id("layoffs_fyi", "AcmeCorp:2024-01-15")
    assert a == b
    assert len(a) == 16


def test_make_id_different_sources():
    assert make_id("layoffs_fyi", "x") != make_id("fred", "x")


# --- normalize_company_name ------------------------------------------------

@pytest.mark.parametrize("raw,expected", [
    ("Acme Corp.", "acme"),
    ("Cisco Systems, Inc.", "cisco systems"),
    ("Pfizer Inc", "pfizer"),
    ("Goldman Sachs Group, LLC", "goldman sachs group"),
    ("OpenAI", "openai"),
    ("", ""),
])
def test_normalize_company_name(raw, expected):
    assert normalize_company_name(raw) == expected


# --- classify_sector -------------------------------------------------------

@pytest.mark.parametrize("text,expected", [
    ("OpenAI software cloud AI platform devops", "Technology"),
    ("Goldman Sachs investment bank lending payment", "Finance"),
    ("Pfizer pharmaceutical biotech medical drug", "Healthcare"),
    ("Procter Gamble consumer packaged goods cosmetic", "CPG"),
    ("Ford automotive manufacturing industrial", "Manufacturing"),
    ("Amazon ecommerce retail marketplace store", "Retail"),
    ("Netflix streaming media entertainment film studio", "Media"),
    ("Some random company with no signals", "Other"),
])
def test_classify_sector_keywords(text, expected):
    assert classify_sector(text) == expected


def test_classify_sector_company_override():
    # Known-company lookup overrides keyword bag
    assert classify_sector("anything goes", company_name="Cisco") == "Technology"
    assert classify_sector("anything goes", company_name="JPMorgan Chase") == "Finance"
    assert classify_sector("anything goes", company_name="Kellanova") == "CPG"


def test_classify_sector_requires_two_hits():
    # Single weak keyword shouldn't trigger sector
    assert classify_sector("data point about something") == "Other"


# --- extract_headcount -----------------------------------------------------

@pytest.mark.parametrize("text,expected", [
    ("Company laid off 500 employees last week", 500.0),
    ("Cut 1,200 workers to reduce costs", 1200.0),
    ("Eliminated 300 positions in restructuring", 300.0),
    ("Cisco cuts nearly 4,000 jobs", 4000.0),
    ("No numbers mentioned here", None),
    ("Trimming 50 staff", 50.0),
])
def test_extract_headcount(text, expected):
    assert extract_headcount(text) == expected


# --- extract_funding_usd ---------------------------------------------------

@pytest.mark.parametrize("text,expected", [
    ("Acme raises $35M Series B", 35_000_000),
    ("Closes $1.2 billion round", 1_200_000_000),
    ("Secured $500 million in funding", 500_000_000),
    ("$2B mega-round", 2_000_000_000),
    ("No funding mentioned", None),
])
def test_extract_funding_usd(text, expected):
    assert extract_funding_usd(text) == expected


# --- extract_region --------------------------------------------------------

def test_extract_region_city():
    assert extract_region("San Francisco, CA") == "CA"
    assert extract_region("New York City") == "NY"
    assert extract_region("Bellevue office") == "WA"


def test_extract_region_state_abbrev():
    assert extract_region("Austin, TX office") == "TX"


def test_extract_region_none():
    assert extract_region("Unknown location") is None


# --- extract_company_from_headline -----------------------------------------

@pytest.mark.parametrize("headline,expected", [
    ("Cisco cuts nearly 4,000 jobs to invest in AI", "Cisco"),
    ("GM lays off hundreds of IT workers", "GM"),
    ("Meridian Ventures raises $35M fund for founders", "Meridian Ventures"),
    ("Stripe appoints new CFO", "Stripe"),
    ("Acme Corp acquires Beta Inc", "Acme Corp"),
    ("Microsoft to cut 10,000 jobs", "Microsoft"),
    ("The Atlantic reports on hiring", None),  # noise lead rejected
])
def test_extract_company_from_headline(headline, expected):
    assert extract_company_from_headline(headline) == expected


# --- dedup -----------------------------------------------------------------

def _evt(company: str, ts: datetime, etype: str = "layoff", mag=None) -> Event:
    return Event(
        id=make_id("test", f"{company}-{ts.isoformat()}-{etype}"),
        ts=ts,
        source="test",
        source_url="https://example.com",
        type=etype,  # type: ignore[arg-type]
        company=Company(name=company),
        magnitude=mag,
        raw_text=f"{company} test",
    )


def test_dedup_key_same_day_same_company_same_type():
    t = datetime(2026, 5, 1, 10, 0, tzinfo=timezone.utc)
    a = _evt("Acme Corp", t)
    b = _evt("acme corp inc.", t.replace(hour=15))
    assert dedup_key(a) == dedup_key(b)


def test_dedup_events_prefers_with_magnitude():
    t = datetime(2026, 5, 1, 10, 0, tzinfo=timezone.utc)
    a = _evt("Acme", t, mag=None)
    b = _evt("Acme", t, mag=500.0)
    out = dedup_events([a, b])
    assert len(out) == 1
    assert out[0].magnitude == 500.0


def test_dedup_keeps_different_days():
    a = _evt("Acme", datetime(2026, 5, 1, tzinfo=timezone.utc))
    b = _evt("Acme", datetime(2026, 5, 2, tzinfo=timezone.utc))
    assert len(dedup_events([a, b])) == 2


# --- normalize_layoffs_fyi_row ---------------------------------------------

GOLDEN_ROW = {
    "Company": "Acme Corp",
    "Location": "San Francisco, CA",
    "# Laid Off": "500",
    "Date": "2024-03-15",
    "Percentage": "10%",
    "URL": "https://example.com/acme-layoff",
    "Industry": "Tech software cloud",
    "Stage": "Series C",
    "Date Added": "2024-03-16",
}


def test_normalize_layoffs_fyi_basic():
    evt = normalize_layoffs_fyi_row(GOLDEN_ROW)
    assert evt.source == "layoffs_fyi"
    assert evt.type == "layoff"
    assert evt.magnitude == 500.0
    assert evt.unit == "people"
    assert evt.company is not None
    assert evt.company.name == "Acme Corp"
    assert evt.company.hq_region == "CA"
    assert evt.ts == datetime(2024, 3, 15, tzinfo=timezone.utc)
    assert len(evt.id) == 16


def test_normalize_layoffs_fyi_unknown_headcount():
    row = {**GOLDEN_ROW, "# Laid Off": "Unknown"}
    evt = normalize_layoffs_fyi_row(row)
    assert evt.magnitude is None


def test_normalize_layoffs_fyi_bad_date():
    row = {**GOLDEN_ROW, "Date": "not-a-date"}
    evt = normalize_layoffs_fyi_row(row)
    assert evt.ts is not None


# --- normalize_fred_observation --------------------------------------------

GOLDEN_OBS = {"date": "2024-03-01", "value": "3.8"}


def test_normalize_fred_basic():
    evt = normalize_fred_observation("UNRATE", "US Unemployment Rate (%)", GOLDEN_OBS)
    assert evt is not None
    assert evt.source == "fred"
    assert evt.type == "macro"
    assert evt.magnitude == 3.8
    assert evt.ts == datetime(2024, 3, 1, tzinfo=timezone.utc)


def test_normalize_fred_missing_value():
    evt = normalize_fred_observation("UNRATE", "Unemployment", {**GOLDEN_OBS, "value": "."})
    assert evt is None


# --- regression: whole-word company matching -------------------------------
# The map contains short keys like "ge" and "hp". Substring matching made them
# fire inside unrelated names ("Zedge", "Gaingels", "Legence", "Sharp"), which
# dumped dozens of SEC filers into the wrong sector.
@pytest.mark.parametrize("name,expected", [
    ("Zedge, Inc.", "Other"),
    ("Gaingels Genus AI LLC", "Other"),
    ("Legence Corp.", "Other"),
    ("Nexgel, Inc.", "Other"),
    ("GE Vernova Inc.", "Manufacturing"),
    ("General Electric Co", "Manufacturing"),
])
def test_company_sector_matches_whole_words_only(name, expected):
    assert classify_sector(name, company_name=name) == expected


# --- name-token pass -------------------------------------------------------
# A bare company name gives the keyword bag at most one hit, which never
# clears its min score of 2, so distinctive name tokens are matched directly.
@pytest.mark.parametrize("name,expected", [
    ("El Paso Independent School District", "Education"),
    ("Remington Lodging and Hospitality, LLC", "Hospitality"),
    ("P&O Ferries", "Logistics"),
    ("T-Mobile", "Telecom"),
    ("Fortrex (John Soules Foods, Inc.)", "CPG"),
])
def test_classify_sector_name_tokens(name, expected):
    assert classify_sector(name, company_name=name) == expected
