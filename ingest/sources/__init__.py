from .layoffs_fyi import fetch as fetch_layoffs_fyi, SOURCE_META as LAYOFFS_FYI_META
from .hn_whoishiring import fetch as fetch_hn_whoishiring, SOURCE_META as HN_META
from .fred import fetch as fetch_fred, SOURCE_META as FRED_META
from .org_moves import fetch as fetch_org_moves, SOURCE_META as ORG_MOVES_META
from .comp import fetch as fetch_comp, SOURCE_META as COMP_META

ALL_SOURCES = [
    ("layoffs_fyi", fetch_layoffs_fyi, LAYOFFS_FYI_META),
    ("hn_whoishiring", fetch_hn_whoishiring, HN_META),
    ("fred", fetch_fred, FRED_META),
    ("org_moves", fetch_org_moves, ORG_MOVES_META),
    ("comp", fetch_comp, COMP_META),
]
