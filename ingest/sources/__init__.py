from .layoffs_fyi import fetch as fetch_layoffs_fyi, SOURCE_META as LAYOFFS_FYI_META
from .hn_whoishiring import fetch as fetch_hn_whoishiring, SOURCE_META as HN_META
from .fred import fetch as fetch_fred, SOURCE_META as FRED_META

ALL_SOURCES = [
    ("layoffs_fyi", fetch_layoffs_fyi, LAYOFFS_FYI_META),
    ("hn_whoishiring", fetch_hn_whoishiring, HN_META),
    ("fred", fetch_fred, FRED_META),
]
