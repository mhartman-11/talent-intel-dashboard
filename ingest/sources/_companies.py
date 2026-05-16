"""Tracked companies and their public job-board slugs.

To extend, add a (display_name, sector, slugs) entry. Each slug is per-platform
(greenhouse, lever, ashby). Empty string = no public board on that platform.

Add via env var TRACKED_COMPANIES_FILE pointing to a JSON file with the same shape:
  [{"name": "Acme", "sector": "Technology", "slugs": {"greenhouse": "acme", ...}}, ...]
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import TypedDict


class CompanySlug(TypedDict):
    name: str
    sector: str
    slugs: dict[str, str]  # platform -> slug


# Curated tracked-company list. Slugs verified manually from each company's
# public careers page (e.g. boards.greenhouse.io/{slug}, jobs.lever.co/{slug}).
DEFAULT_TRACKED: list[CompanySlug] = [
    # ---- Technology ----
    {"name": "Stripe", "sector": "Technology",
     "slugs": {"greenhouse": "stripe", "lever": "", "ashby": ""}},
    {"name": "Airbnb", "sector": "Technology",
     "slugs": {"greenhouse": "airbnb", "lever": "", "ashby": ""}},
    {"name": "Coinbase", "sector": "Finance",
     "slugs": {"greenhouse": "coinbase", "lever": "", "ashby": ""}},
    {"name": "Robinhood", "sector": "Finance",
     "slugs": {"greenhouse": "robinhood", "lever": "", "ashby": ""}},
    {"name": "Reddit", "sector": "Media",
     "slugs": {"greenhouse": "reddit", "lever": "", "ashby": ""}},
    {"name": "DoorDash", "sector": "Technology",
     "slugs": {"greenhouse": "doordash", "lever": "", "ashby": ""}},
    {"name": "Instacart", "sector": "Technology",
     "slugs": {"greenhouse": "instacart", "lever": "", "ashby": ""}},
    {"name": "Pinterest", "sector": "Technology",
     "slugs": {"greenhouse": "pinterest", "lever": "", "ashby": ""}},
    {"name": "Discord", "sector": "Technology",
     "slugs": {"greenhouse": "discord", "lever": "", "ashby": ""}},
    {"name": "GitLab", "sector": "Technology",
     "slugs": {"greenhouse": "gitlab", "lever": "", "ashby": ""}},
    {"name": "HashiCorp", "sector": "Technology",
     "slugs": {"greenhouse": "hashicorp", "lever": "", "ashby": ""}},
    {"name": "Cloudflare", "sector": "Technology",
     "slugs": {"greenhouse": "cloudflare", "lever": "", "ashby": ""}},
    {"name": "Anthropic", "sector": "Technology",
     "slugs": {"greenhouse": "anthropic", "lever": "", "ashby": ""}},
    {"name": "OpenAI", "sector": "Technology",
     "slugs": {"greenhouse": "openai", "lever": "", "ashby": ""}},
    {"name": "Scale AI", "sector": "Technology",
     "slugs": {"greenhouse": "", "lever": "scaleai", "ashby": ""}},
    {"name": "Notion", "sector": "Technology",
     "slugs": {"greenhouse": "", "lever": "notion", "ashby": ""}},
    {"name": "Figma", "sector": "Technology",
     "slugs": {"greenhouse": "figma", "lever": "", "ashby": ""}},
    {"name": "Snowflake", "sector": "Technology",
     "slugs": {"greenhouse": "snowflake", "lever": "", "ashby": ""}},
    {"name": "Databricks", "sector": "Technology",
     "slugs": {"greenhouse": "databricks11", "lever": "", "ashby": ""}},
    {"name": "Brex", "sector": "Finance",
     "slugs": {"greenhouse": "", "lever": "brex", "ashby": ""}},
    {"name": "Plaid", "sector": "Finance",
     "slugs": {"greenhouse": "plaid", "lever": "", "ashby": ""}},
    {"name": "Ramp", "sector": "Finance",
     "slugs": {"greenhouse": "", "lever": "ramp", "ashby": ""}},
    {"name": "Mercury", "sector": "Finance",
     "slugs": {"greenhouse": "mercury", "lever": "", "ashby": ""}},
    {"name": "Linear", "sector": "Technology",
     "slugs": {"greenhouse": "", "lever": "", "ashby": "linear"}},
    {"name": "Vercel", "sector": "Technology",
     "slugs": {"greenhouse": "", "lever": "", "ashby": "vercel"}},
    {"name": "Replicate", "sector": "Technology",
     "slugs": {"greenhouse": "", "lever": "", "ashby": "replicate"}},
    {"name": "Perplexity AI", "sector": "Technology",
     "slugs": {"greenhouse": "", "lever": "", "ashby": "perplexity"}},
    {"name": "Cursor", "sector": "Technology",
     "slugs": {"greenhouse": "", "lever": "", "ashby": "cursor"}},
    # ---- Healthcare ----
    {"name": "Hims & Hers", "sector": "Healthcare",
     "slugs": {"greenhouse": "himsandhers", "lever": "", "ashby": ""}},
    {"name": "Oscar Health", "sector": "Healthcare",
     "slugs": {"greenhouse": "oscar", "lever": "", "ashby": ""}},
    # ---- CPG / Retail ----
    {"name": "Warby Parker", "sector": "Retail",
     "slugs": {"greenhouse": "warbyparker", "lever": "", "ashby": ""}},
    {"name": "Allbirds", "sector": "Retail",
     "slugs": {"greenhouse": "allbirds", "lever": "", "ashby": ""}},
    {"name": "Glossier", "sector": "CPG",
     "slugs": {"greenhouse": "glossier", "lever": "", "ashby": ""}},
    # ---- Media ----
    {"name": "Spotify", "sector": "Media",
     "slugs": {"greenhouse": "", "lever": "spotify", "ashby": ""}},
]


def load_tracked_companies() -> list[CompanySlug]:
    override = os.environ.get("TRACKED_COMPANIES_FILE")
    if override and Path(override).exists():
        try:
            return json.loads(Path(override).read_text())
        except Exception as exc:
            print(f"[_companies] failed to load {override}: {exc}; using defaults")
    return DEFAULT_TRACKED


def slugs_for(platform: str) -> list[tuple[str, str, str]]:
    """Return [(company_name, sector, slug)] where slug is non-empty for platform."""
    out = []
    for entry in load_tracked_companies():
        slug = entry.get("slugs", {}).get(platform, "")
        if slug:
            out.append((entry["name"], entry["sector"], slug))
    return out
