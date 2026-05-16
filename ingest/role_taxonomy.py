"""
Role taxonomy: title -> SOC family, seniority, function.
Salary / remote / tech-stack extraction from posting text.

Deterministic, regex-driven. No LLM. Output structured fields go into
Event.extras for postings.
"""
from __future__ import annotations

import re
from typing import Optional, TypedDict

# --- Job function (mapped to SOC major group) ------------------------------

# (function_label, soc_major_group, keyword patterns)
_FUNCTIONS: list[tuple[str, str, list[str]]] = [
    ("Software Engineering", "15-1252", [
        "software engineer", "software developer", "swe", "backend engineer",
        "frontend engineer", "full stack", "full-stack", "fullstack",
        "platform engineer", "systems engineer", "applications engineer",
        "ios engineer", "android engineer", "mobile engineer",
        "embedded engineer", "firmware engineer",
    ]),
    ("Data / ML", "15-2051", [
        "data scientist", "data engineer", "machine learning",
        "ml engineer", "mle", "applied scientist", "research scientist",
        "ai engineer", "ai researcher", "analytics engineer",
        "data analyst", "business intelligence", "bi engineer",
    ]),
    ("DevOps / SRE", "15-1244", [
        "devops", "sre", "site reliability", "platform reliability",
        "infrastructure engineer", "cloud engineer", "kubernetes engineer",
    ]),
    ("Security", "15-1212", [
        "security engineer", "appsec", "application security",
        "security analyst", "penetration tester", "pentest",
        "soc analyst", "threat detection", "incident response",
    ]),
    ("Design", "27-1024", [
        "designer", "ux designer", "ui designer", "product designer",
        "design lead", "design systems",
    ]),
    ("Product", "11-2021", [
        "product manager", "product owner", "pm,", " pm ", "tpm",
        "technical product", "group product manager", "gpm",
    ]),
    ("Engineering Management", "11-9041", [
        "engineering manager", "eng manager", "engineering lead",
        "tech lead", "team lead", "head of engineering", "director of engineering",
        "vp of engineering", "vp engineering", "cto",
    ]),
    ("Marketing", "11-2011", [
        "marketing manager", "growth marketing", "content marketing",
        "demand generation", "demand gen", "brand marketing", "performance marketing",
        "marketing director", "head of marketing", "cmo",
    ]),
    ("Sales", "41-3091", [
        "account executive", "sales rep", "sdr", "bdr", "sales development",
        "sales manager", "head of sales", "vp sales", "vp of sales", "cro",
        "enterprise sales", "inside sales",
    ]),
    ("Customer Success", "13-1161", [
        "customer success", "csm", "account manager", "customer experience",
    ]),
    ("Support", "43-4051", [
        "support engineer", "technical support", "customer support",
        "support specialist",
    ]),
    ("People / HR / Recruiting", "13-1071", [
        "recruiter", "recruiting", "talent acquisition", "people ops",
        "people operations", "human resources", "hr business partner",
        "hrbp", "compensation analyst",
    ]),
    ("Finance / Accounting", "13-2011", [
        "controller", "accountant", "finance manager", "financial analyst",
        "fp&a", "cfo", "head of finance", "treasury",
    ]),
    ("Legal / Compliance", "23-1011", [
        "general counsel", "legal counsel", "compliance officer",
        "paralegal", "privacy counsel",
    ]),
    ("Operations", "11-1021", [
        "operations manager", "biz ops", "business operations",
        "chief of staff", "coo", "operations associate",
    ]),
]

_FUNCTION_INDEX: list[tuple[str, str, re.Pattern]] = [
    (label, soc, re.compile("|".join(re.escape(kw) for kw in kws), re.IGNORECASE))
    for label, soc, kws in _FUNCTIONS
]


def classify_function(title: str) -> tuple[Optional[str], Optional[str]]:
    """Return (function_label, soc_major_group) for a job title, or (None, None)."""
    if not title:
        return None, None
    for label, soc, pat in _FUNCTION_INDEX:
        if pat.search(title):
            return label, soc
    return None, None


# --- Seniority -------------------------------------------------------------

_SENIORITY_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("intern", re.compile(r"\bintern(?:ship)?\b", re.IGNORECASE)),
    ("junior", re.compile(r"\b(?:jr\.?|junior|entry[- ]level|associate)\b", re.IGNORECASE)),
    ("senior", re.compile(r"\b(?:sr\.?|senior)\b", re.IGNORECASE)),
    ("staff", re.compile(r"\bstaff\b", re.IGNORECASE)),
    ("principal", re.compile(r"\bprincipal\b", re.IGNORECASE)),
    ("lead", re.compile(r"\blead\b", re.IGNORECASE)),
    ("manager", re.compile(r"\b(?:manager|mgr)\b", re.IGNORECASE)),
    ("director", re.compile(r"\bdirector\b", re.IGNORECASE)),
    ("vp", re.compile(r"\b(?:vp|vice president)\b", re.IGNORECASE)),
    ("c_level", re.compile(r"\b(?:ceo|cfo|coo|cto|cmo|cro|cpo|chief)\b", re.IGNORECASE)),
]


def classify_seniority(title: str) -> Optional[str]:
    if not title:
        return None
    # Prefer most-senior tag if multiple match
    priority = ["c_level", "vp", "director", "principal", "staff", "senior",
                "manager", "lead", "junior", "intern"]
    matched = {label for label, pat in _SENIORITY_PATTERNS if pat.search(title)}
    for level in priority:
        if level in matched:
            return level
    return "mid"  # default to mid-level if no marker


# --- Salary extraction -----------------------------------------------------

_SALARY_RANGE = re.compile(
    r"""
    \$\s*
    (?P<low>\d{2,3}(?:,\d{3})*|\d+(?:\.\d+)?)
    \s*(?P<low_unit>k|m|/yr|/year)?
    \s*[\-–—to]+\s*
    \$?\s*
    (?P<high>\d{2,3}(?:,\d{3})*|\d+(?:\.\d+)?)
    \s*(?P<high_unit>k|m|/yr|/year)?
    """,
    re.IGNORECASE | re.VERBOSE,
)

_SALARY_SINGLE = re.compile(
    r"\$\s*(?P<v>\d{2,3}(?:,\d{3})*|\d+(?:\.\d+)?)\s*(?P<u>k|m|/yr|/year)?\b",
    re.IGNORECASE,
)


def _to_usd(raw: str, unit: Optional[str]) -> Optional[float]:
    try:
        v = float(raw.replace(",", ""))
    except ValueError:
        return None
    u = (unit or "").lower()
    if u.startswith("k"):
        v *= 1_000
    elif u.startswith("m"):
        v *= 1_000_000
    # Reject values that look hourly or absurd
    if v < 10_000 or v > 5_000_000:
        return None
    return v


def extract_salary(text: str) -> tuple[Optional[float], Optional[float]]:
    """Return (salary_min, salary_max) in USD/year. None if no parse."""
    if not text:
        return None, None
    m = _SALARY_RANGE.search(text)
    if m:
        low = _to_usd(m.group("low"), m.group("low_unit") or m.group("high_unit"))
        high = _to_usd(m.group("high"), m.group("high_unit") or m.group("low_unit"))
        if low and high and low <= high:
            return low, high
    # Fallback: single value
    m2 = _SALARY_SINGLE.search(text)
    if m2:
        v = _to_usd(m2.group("v"), m2.group("u"))
        if v:
            return v, v
    return None, None


# --- Remote flag -----------------------------------------------------------

_REMOTE_YES = re.compile(
    r"\b(?:remote|work from home|wfh|distributed|fully remote|100%\s*remote)\b",
    re.IGNORECASE,
)
_HYBRID = re.compile(r"\b(?:hybrid)\b", re.IGNORECASE)
_ONSITE = re.compile(r"\b(?:on[- ]?site|in[- ]?office|in[- ]person)\b", re.IGNORECASE)


def classify_remote(text: str) -> Optional[str]:
    """Return 'remote', 'hybrid', 'onsite', or None."""
    if not text:
        return None
    if _REMOTE_YES.search(text):
        return "remote"
    if _HYBRID.search(text):
        return "hybrid"
    if _ONSITE.search(text):
        return "onsite"
    return None


# --- Tech stack ------------------------------------------------------------

_STACK_TERMS = [
    "python", "javascript", "typescript", "ts", "go", "golang", "rust",
    "java", "kotlin", "swift", "ruby", "rails", "php", "scala", "elixir",
    "react", "vue", "angular", "svelte", "next.js", "nextjs", "nuxt",
    "node.js", "nodejs", "django", "flask", "fastapi", "spring",
    "kubernetes", "k8s", "docker", "terraform", "ansible", "helm",
    "aws", "gcp", "azure", "cloudflare workers",
    "postgres", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "snowflake", "bigquery", "redshift", "databricks",
    "kafka", "spark", "airflow", "dbt",
    "pytorch", "tensorflow", "jax", "hugging face", "huggingface",
    "llm", "rag", "langchain",
    "graphql", "rest", "grpc",
]

_STACK_REGEX = [
    (term, re.compile(rf"\b{re.escape(term)}\b", re.IGNORECASE))
    for term in _STACK_TERMS
]


def extract_stack(text: str) -> list[str]:
    if not text:
        return []
    hits: list[str] = []
    seen: set[str] = set()
    for term, pat in _STACK_REGEX:
        if pat.search(text):
            key = term.lower().replace(".js", "js").replace(" ", "")
            if key not in seen:
                seen.add(key)
                hits.append(term)
    return hits


# --- Combined helper -------------------------------------------------------


class RoleMeta(TypedDict, total=False):
    function: Optional[str]
    soc: Optional[str]
    seniority: Optional[str]
    salary_min: Optional[float]
    salary_max: Optional[float]
    remote: Optional[str]
    stack: list[str]


def parse_role(title: str, body: str = "") -> RoleMeta:
    """Run full role taxonomy parse on title + optional body text."""
    function, soc = classify_function(title)
    seniority = classify_seniority(title)
    salary_min, salary_max = extract_salary(body or title)
    remote = classify_remote(body or title)
    stack = extract_stack(body or title)
    return RoleMeta(
        function=function,
        soc=soc,
        seniority=seniority,
        salary_min=salary_min,
        salary_max=salary_max,
        remote=remote,
        stack=stack,
    )
