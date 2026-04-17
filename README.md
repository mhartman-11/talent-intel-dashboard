# Talent Intel Dashboard

Real-time US talent market intelligence for TA professionals. Free. Open. Anti-slop.

**Live:** [talentintel.app](https://talentintel.app) *(coming soon)*

---

## What it is

A publicly accessible dashboard pulling structured signals from free, publicly available data sources — no paywalls, no auth-walled scraping, no AI-generated prose. Every number is traceable to its origin.

Built as a portfolio piece by [Mike Hartman](https://hartmanai.com) — Senior Manager, Talent Acquisition & AI Enablement — to demonstrate that TA professionals can build production-grade data tools, not just use them.

---

## Data sources

| Stream | Source | Type | Cadence |
|---|---|---|---|
| Layoffs | [layoffs.fyi](https://layoffs.fyi) | Public CSV | 6h |
| Layoffs | [trueup.io](https://trueup.io) | RSS | 6h |
| Layoffs | State WARN portals (CA, NY, IL, TX, OH) | Public HTML/XLSX | 6h |
| Hiring | Greenhouse / Lever / Ashby / Workable | Public API | 6h |
| Hiring | [HN Who is Hiring](https://news.ycombinator.com) | HN Algolia API | 24h |
| Org Moves | SEC EDGAR 8-K Item 5.02 | Public API | 6h |
| Funding | SEC EDGAR Form D | Public API | 6h |
| Funding | TechCrunch / Crunchbase News | RSS | 6h |
| Comp | [BLS OEWS](https://www.bls.gov/oes/) | Public API | 24h |
| Comp | [DOL H-1B LCA Disclosure](https://www.dol.gov/agencies/eta/foreign-labor/performance) | Public CSV | 24h |
| Macro | [FRED](https://fred.stlouisfed.org) — UNRATE, JOLTS, earnings | Public API | 24h |
| Macro | [Indeed Hiring Lab](https://www.hiringlab.org) | RSS | 24h |

All sources are ToS-compliant. No authenticated sessions, no login scraping.

---

## Architecture

```
GitHub Actions (cron every 6h)
  └─ Python ingest layer
       ├─ Source modules (httpx + feedparser)
       ├─ Normalizers (→ common Event schema)
       └─ Aggregators (sector matrix, Z-scores)
  └─ Writes JSON to /public/data/
  └─ Next.js static build (output: export)
  └─ Deploy to Cloudflare Pages
```

**Stack:** Next.js 15 · TypeScript · Tailwind · Framer Motion · Python 3.12 · Pydantic

**Hosting:** Cloudflare Pages (free tier) · GitHub Actions (free tier)

**Cost to run:** $0

---

## Common event schema

```python
class Event(BaseModel):
    id: str              # sha256(source + native_id)[:16]
    ts: datetime
    source: str          # "layoffs_fyi" | "hn_whoishiring" | "fred" | ...
    source_url: str      # link back to primary source
    type: EventType      # layoff | posting | exec_move | funding | m_and_a | comp | macro
    company: Company     # name, sector, hq_region, size_band
    magnitude: float     # headcount | USD | percentage points
    unit: str            # "people" | "USD" | "pp" | "jobs"
    raw_text: str
    tags: list[str]
```

---

## Running locally

### Prerequisites

- Python 3.12+
- Node 20+
- Free API keys: [FRED](https://fred.stlouisfed.org/docs/api/api_key.html) · [BLS](https://www.bls.gov/developers/)

### Ingest

```bash
# Install Python deps
pip install -r requirements.txt

# Dry run (fetch + count, no file writes)
python -m ingest.run --dry-run

# Full run (writes /public/data/*.json)
python -m ingest.run
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

| Secret | Description |
|---|---|
| `FRED_API_KEY` | [Register free](https://fred.stlouisfed.org/docs/api/api_key.html) |
| `BLS_API_KEY` | [Register free](https://www.bls.gov/developers/) |
| `CF_PAGES_TOKEN` | Cloudflare API token with Pages write permissions |
| `CF_ACCOUNT_ID` | Your Cloudflare account ID |

---

## Anti-slop commitments

- Zero AI-generated prose — all content is structured data
- Zero paywalled sources
- Zero login-required scraping
- Every data point links to its primary source
- Source health is surfaced on the `/sources` page in real time

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
