"""Source registry. Each tuple = (source_name, fetch_fn, SOURCE_META)."""
from .ashby import fetch as fetch_ashby, SOURCE_META as ASHBY_META
from .bls_oews import fetch as fetch_bls_oews, SOURCE_META as BLS_OEWS_META
from .comp import fetch as fetch_comp, SOURCE_META as COMP_META
from .dol_lca import fetch as fetch_dol_lca, SOURCE_META as DOL_LCA_META
from .fred import fetch as fetch_fred, SOURCE_META as FRED_META
from .greenhouse import fetch as fetch_greenhouse, SOURCE_META as GREENHOUSE_META
from .layoffs_fyi import fetch as fetch_layoffs_fyi, SOURCE_META as LAYOFFS_FYI_META
from .lever import fetch as fetch_lever, SOURCE_META as LEVER_META
from .news_layoffs import fetch as fetch_news_layoffs, SOURCE_META as NEWS_LAYOFFS_META
from .org_moves import fetch as fetch_org_moves, SOURCE_META as ORG_MOVES_META
from .reddit import fetch as fetch_reddit, SOURCE_META as REDDIT_META
from .sec_edgar import fetch as fetch_sec_edgar, SOURCE_META as SEC_EDGAR_META
from .state_warn import fetch as fetch_state_warn, SOURCE_META as STATE_WARN_META
from .wayback import fetch as fetch_wayback, SOURCE_META as WAYBACK_META
from .wikipedia_pv import fetch as fetch_wikipedia_pv, SOURCE_META as WIKIPEDIA_PV_META

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
    # Visa / sponsorship
    ("dol_lca", fetch_dol_lca, DOL_LCA_META),
    # Compensation
    ("bls_oews", fetch_bls_oews, BLS_OEWS_META),
    ("comp", fetch_comp, COMP_META),
    # Macro
    ("fred", fetch_fred, FRED_META),
    # Sentiment / attention
    ("reddit", fetch_reddit, REDDIT_META),
    ("wikipedia_pv", fetch_wikipedia_pv, WIKIPEDIA_PV_META),
    ("wayback", fetch_wayback, WAYBACK_META),
]
