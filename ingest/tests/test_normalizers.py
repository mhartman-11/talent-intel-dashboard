"""Golden-fixture tests for normalizers — run with: pytest ingest/tests/"""
from datetime import datetime, timezone

import pytest

from ingest.normalizers import (
    classify_sector,
    extract_headcount,
    extract_region,
    make_id,
    normalize_layoffs_fyi_row,
    normalize_hn_hiring_comment,
    normalize_fred_observation,
)


# ─── make_id ──────────────────────────────────────────────────────────────────

def test_make_id_deterministic():
    a = make_id("layoffs_fyi", "AcmeCorp:2024-01-15")
    b = make_id("layoffs_fyi", "AcmeCorp:2024-01-15")
    assert a == b
    assert len(a) == 16


def test_make_id_different_sources():
    a = make_id("layoffs_fyi", "x")
    b = make_id("fred", "x")
    assert a != b


# ─── classify_sector ──────────────────────────────────────────────────────────

@pytest.mark.parametrize("text,expected", [
    ("OpenAI software cloud AI platform", "Technology"),
    ("Goldman Sachs investment bank", "Finance"),
    ("Pfizer pharmaceutical biotech", "Healthcare"),
    ("Procter & Gamble consumer packaged goods", "CPG"),
    ("Ford automotive manufacturing", "Manufacturing"),
    ("Amazon ecommerce retail marketplace", "Retail"),
    ("Netflix streaming media entertainment", "Media"),
    ("Some random company with no signals", "Other"),
])
def test_classify_sector(text, expected):
    assert classify_sector(text) == expected


# ─── extract_headcount ────────────────────────────────────────────────────────

@pytest.mark.parametrize("text,expected", [
    ("Company laid off 500 employees last week", 500.0),
    ("Cut 1,200 workers to reduce costs", 1200.0),
    ("Eliminated 300 positions in restructuring", 300.0),
    ("No numbers mentioned here", None),
])
def test_extract_headcount(text, expected):
    assert extract_headcount(text) == expected


# ─── extract_region ───────────────────────────────────────────────────────────

def test_extract_region_city():
    assert extract_region("San Francisco, CA") == "CA"
    assert extract_region("New York City") == "NY"


def test_extract_region_state_abbrev():
    assert extract_region("Austin, TX office") == "TX"


def test_extract_region_none():
    assert extract_region("Unknown location") is None


# ─── normalize_layoffs_fyi_row ────────────────────────────────────────────────

GOLDEN_ROW = {
    "Company": "Acme Corp",
    "Location": "San Francisco, CA",
    "# Laid Off": "500",
    "Date": "2024-03-15",
    "Percentage": "10%",
    "URL": "https://example.com/acme-layoff",
    "Industry": "Tech",
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
    assert evt.company.sector == "Technology"
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
    assert evt.ts is not None  # should fall back gracefully


# ─── normalize_hn_hiring_comment ──────────────────────────────────────────────

GOLDEN_HN = {
    "objectID": "38123456",
    "created_at": "2024-04-01T14:00:00Z",
    "comment_text": "Stripe | Senior Software Engineer | Remote, US | Full-time | We are hiring for infrastructure...",
}


def test_normalize_hn_basic():
    evt = normalize_hn_hiring_comment(GOLDEN_HN)
    assert evt is not None
    assert evt.source == "hn_whoishiring"
    assert evt.type == "posting"
    assert evt.company is not None
    assert "Stripe" in evt.company.name
    assert evt.ts == datetime(2024, 4, 1, 14, 0, 0, tzinfo=timezone.utc)


def test_normalize_hn_empty_text():
    evt = normalize_hn_hiring_comment({"objectID": "1", "comment_text": ""})
    assert evt is None


# ─── normalize_fred_observation ───────────────────────────────────────────────

GOLDEN_OBS = {"date": "2024-03-01", "value": "3.8", "realtime_start": "2024-03-08", "realtime_end": "9999-01-01"}


def test_normalize_fred_basic():
    evt = normalize_fred_observation("UNRATE", "US Unemployment Rate (%)", GOLDEN_OBS)
    assert evt is not None
    assert evt.source == "fred"
    assert evt.type == "macro"
    assert evt.magnitude == 3.8
    assert evt.ts == datetime(2024, 3, 1, tzinfo=timezone.utc)


def test_normalize_fred_missing_value():
    obs = {**GOLDEN_OBS, "value": "."}
    evt = normalize_fred_observation("UNRATE", "Unemployment", obs)
    assert evt is None
