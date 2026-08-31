"""Source registry. Each tuple = (source_name, fetch_fn, SOURCE_META).

Only sources that actually return records live here. Three were removed
2026-08-31 after never succeeding once in production:
  - reddit    → 403 Blocked on every subreddit (Reddit killed anon JSON)
  - dol_lca   → 403 Forbidden on the USCIS H-1B datahub export
  - wikipedia_pv → returned data, but pageview z-scores are not a talent signal
  - wayback     → "Discord careers page: 46 archived snapshots in 90 days" counts
                  archive.org's own crawler, not the company. Same flaw as
                  wikipedia_pv: it measures the instrument, not the market.
The modules are kept on disk for reference; they are not wired in.
"""
from .ashby import fetch as fetch_ashby, SOURCE_META as ASHBY_META
from .bls_oews import fetch as fetch_bls_oews, SOURCE_META as BLS_OEWS_META
from .comp import fetch as fetch_comp, SOURCE_META as COMP_META
from .fred import fetch as fetch_fred, SOURCE_META as FRED_META
from .greenhouse import fetch as fetch_greenhouse, SOURCE_META as GREENHOUSE_META
from .layoffs_fyi import fetch as fetch_layoffs_fyi, SOURCE_META as LAYOFFS_FYI_META
from .lever import fetch as fetch_lever, SOURCE_META as LEVER_META
from .news_layoffs import fetch as fetch_news_layoffs, SOURCE_META as NEWS_LAYOFFS_META
from .org_moves import fetch as fetch_org_moves, SOURCE_META as ORG_MOVES_META
from .sec_edgar import fetch as fetch_sec_edgar, SOURCE_META as SEC_EDGAR_META
from .state_warn import fetch as fetch_state_warn, SOURCE_META as STATE_WARN_META

ALL_SOURCES = [
    # ATS / job board APIs
    ("greenhouse", fetch_greenhouse, GREENHOUSE_META),
    ("lever", fetch_lever, LEVER_META),
    ("ashby", fetch_ashby, ASHBY_META),
    # Layoff signals
    ("layoffs_fyi", fetch_layoffs_fyi, LAYOFFS_FYI_META),
    ("news_layoffs", fetch_news_layoffs, NEWS_LAYOFFS_META),
    ("state_warn", fetch_state_warn, STATE_WARN_META),
    # Org & funding moves
    ("org_moves", fetch_org_moves, ORG_MOVES_META),
    ("sec_edgar", fetch_sec_edgar, SEC_EDGAR_META),
    # Compensation
    ("bls_oews", fetch_bls_oews, BLS_OEWS_META),
    ("comp", fetch_comp, COMP_META),
    # Macro
    ("fred", fetch_fred, FRED_META),
]
