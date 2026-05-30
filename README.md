# Talent Intel Dashboard

Real-time US talent market intelligence for TA professionals. Free. Open. Anti-slop.

**Live:** [talentintel.app](https://talentintel.app) *(coming soon)*

---

## What it is

A publicly accessible dashboard pulling structured signals from free, publicly available data sources — no paywalls, no auth-walled scraping, no AI-generated prose. Every number is traceable to its origin.

Built as a portfolio piece by [Mike Hartman](https://hartmanai.com) — Senior Manager, Talent Acquisition & AI Enablement — to demonstrate that TA professionals can build production-grade data tools, not just use them.

---

## Data sources

| Stream | Source | Type | Cadence | Auth |
|---|---|---|---|---|
| Hiring | Greenhouse public Job Board API | Public API | 6h | none |
| Hiring | Lever public Postings API | Public API | 6h | none |
| Hiring | Ashby public Job Board API | Public API | 6h | none |
| Hiring (visa) | [USCIS H-1B Employer Data Hub](https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub) | Public CSV | 24h | none |
| Layoffs | TechCrunch layoff RSS feeds | Public RSS | 6h | none |
| Layoffs (cross-sector) | Google News RSS layoff search (7 sector queries, `when:21d`) | Public RSS | 6h | none |
| Layoffs | State WARN portals (config-driven, see `ingest/state_warn_endpoints.json`) | Public CSV/XLSX/HTML | 24h | none |
| Org Moves | SEC EDGAR full-text search — 8-K Item 5.02 | Public API | 6h | UA email |
| Funding | SEC EDGAR full-text search — Form D | Public API | 6h | UA email |
| Funding / Exec | TechCrunch Venture + Personnel RSS | Public RSS | 6h | none |
| Comp | [BLS OEWS](https://www.bls.gov/oes/) occupation wages (national) | Public API v2 | 24h | optional key |
| Comp (sector) | BLS CES — Avg Hourly Earnings by supersector | Public API v1 | 24h | none |
| Macro | [FRED](https://fred.stlouisfed.org) — UNRATE, JOLTS, earnings | Public API | 24h | free key |
| Sentiment | Reddit JSON — r/layoffs, r/recruiting, r/cscareerquestions, r/jobs, etc. | Public JSON | 12h | none |
| Attention | Wikipedia REST pageviews per company | Public API | 24h | none |
| Activity | Wayback CDX careers-page snapshot frequency | Public API | 24h | none |

All sources are ToS-compliant. No authenticated sessions, no login scraping.

---

## Architecture

```
GitHub Actions (cron every 6h)
  └─ Python ingest layer (ingest/)
       ├─ Source modules (one per provider; httpx + feedparser + pandas)
       ├─ Normalizers (→ common Event schema; deterministic entity resolution)
       ├─ Role taxonomy (title → SOC, seniority, salary, remote, stack)
       └─ Aggregators (dedup, sector matrix, Z-scores)
  └─ Writes JSON to /public/data/
  └─ Next.js static build (output: export)
  └─ Deploy to Cloudflare Pages
```

**Stack:** Next.js 15 · TypeScript · Tailwind · Framer Motion · Python 3.12 · Pydantic · pandas · feedparser

**Hosting:** Cloudflare Pages (free tier) · GitHub Actions (free tier)

**Cost to run:** $0 (existing free API tiers cover the registered keys)

---

## Common event schema

```python
class Event(BaseModel):
    id: str              # sha256(source + native_id)[:16]
    ts: datetime
    source: str          # "greenhouse" | "lever" | "sec_edgar" | "reddit" | ...
    source_url: str      # link back to primary source
    type: EventType      # layoff | posting | exec_move | funding | m_and_a | comp | macro
    company: Company     # name, sector, hq_region, ticker, industry, size_band
    magnitude: float     # headcount | USD | percentage points | pageviews | snapshots
    unit: str            # "people" | "USD" | "pp" | "jobs" | "approvals" | "pageviews/day"
    raw_text: str
    tags: list[str]
    extras: dict         # source-specific structured fields (role, soc, salary, remote, ...)
```

Postings carry rich structured fields in `extras` via the role taxonomy parser:

```json
{
  "role": "Senior Backend Engineer",
  "function": "Software Engineering",
  "soc": "15-1252",
  "seniority": "senior",
  "salary_min": 180000,
  "salary_max": 240000,
  "remote": "remote",
  "stack": ["python", "postgres", "kubernetes"],
  "location": "Remote, US"
}
```

---

## Tracked companies

Default tracked-company list lives in `ingest/sources/_companies.py` — the
Greenhouse, Lever, Ashby, Wikipedia pageviews, and Wayback sources query
these companies by their per-platform slugs.

Override with a JSON file by setting:

```bash
TRACKED_COMPANIES_FILE=/path/to/companies.json
```

Shape:

```json
[
  {"name": "Stripe", "sector": "Technology",
   "slugs": {"greenhouse": "stripe", "lever": "", "ashby": ""},
   "careers_url": "stripe.com/jobs"}
]
```

---

## Running locally

### Prerequisites

- Python 3.12+
- Node 20+
- Free API keys (optional but recommended):
  - [FRED](https://fred.stlouisfed.org/docs/api/api_key.html)
  - [BLS](https://www.bls.gov/developers/) (BLS_API_KEY env var)

### Ingest

```bash
# Install Python deps
pip install -r requirements.txt

# Dry run (fetch + count, no file writes)
python -m ingest.run --dry-run

# Full run (writes /public/data/*.json)
python -m ingest.run
```

### State WARN configuration

The State WARN source is config-driven. URLs change yearly, so either:

1. Edit `ingest/state_warn_endpoints.json` (committed default)
2. Set `STATE_WARN_CONFIG_FILE=/path/to/config.json` env var
3. Set `STATE_WARN_CONFIG='<JSON string>'` env var

Format per entry:

```json
{"state": "WA",
 "url": "https://media.esd.wa.gov/.../WARN.csv",
 "format": "csv",
 "columns": {"company": "...", "date": "...",
             "headcount": "...", "city": "..."}}
```

Supported formats: `xlsx`, `csv`, `html_table`.

### USCIS H-1B Data Hub configuration

USCIS publishes the Employer Data Hub CSV at a year-dependent URL. The
default in `ingest/sources/dol_lca.py` may need updating each fiscal year.
Override via env var:

```bash
H1B_DATA_HUB_URL=https://www.uscis.gov/.../h1b_datahubexport-2025.csv
```

### Frontend

```bash
npm install
npm run dev       # dev server at localhost:3000
npm run build     # static export to /out
```

### Tests

```bash
pytest ingest/tests/ -v
```

---

## Secrets for GitHub Actions

| Secret | Required? | Description |
|---|---|---|
| `FRED_API_KEY` | yes | [Register free](https://fred.stlouisfed.org/docs/api/api_key.html) |
| `BLS_API_KEY` | optional | [Register free](https://www.bls.gov/developers/) — increases BLS daily quota from 25→500 |
| `H1B_DATA_HUB_URL` | optional | Override default USCIS H-1B Data Hub URL when filename changes |
| `STATE_WARN_CONFIG` | optional | JSON config string for state WARN endpoints |
| `CF_PAGES_TOKEN` | yes | Cloudflare API token with Pages write permissions |
| `CF_ACCOUNT_ID` | yes | Your Cloudflare account ID |

---

## Anti-slop commitments

- **Zero AI-generated prose** — all content is structured data
- **Zero paywalled sources** — every API/feed listed is free and public
- **Zero login-required scraping** — no authenticated sessions
- **Every data point links to its primary source**
- **Deterministic parsing** — keyword bags, regex, lookup tables, official taxonomies (SOC codes, US state codes). No LLM in the pipeline.
- **Source health is surfaced** on the `/sources` page in real time — failing sources are visible, not hidden

---

## Entity resolution

Company names are canonicalized to lowercase with corporate suffixes
stripped (`Inc`, `Corp`, `LLC`, `Ltd`, etc.) before dedup. A known-company
lookup table in `normalizers.py` maps common names → canonical sector
deterministically, overriding the keyword classifier.

Dedup hashes `(normalized_company, ts_day, signal_type)` — overlapping
feeds (e.g. TechCrunch tags + venture RSS) collapse to a single event,
preferring the variant with a magnitude value.

---

## Design system

**Viscous Flow** — obsidian base (`#0e0e0e`), neon accents:

- Cyan `#81ecff` — layoffs / negative signals
- Orange `#ff734a` — hiring / growth
- Violet `#d277ff` — org / exec / money moves

Typography: Epilogue (display) · Manrope (body) · JetBrains Mono (data)

---

## License

MIT. Data is sourced from public records — respect each source's terms of service.

---

Built by [Hartman AI LLC](https://hartmanai.com)
