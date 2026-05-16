"""Tests for ingest.role_taxonomy."""
import pytest

from ingest.role_taxonomy import (
    classify_function,
    classify_remote,
    classify_seniority,
    extract_salary,
    extract_stack,
    parse_role,
)


@pytest.mark.parametrize("title,fn,soc", [
    ("Senior Software Engineer", "Software Engineering", "15-1252"),
    ("Staff Backend Engineer", "Software Engineering", "15-1252"),
    ("Data Scientist", "Data / ML", "15-2051"),
    ("Machine Learning Engineer", "Data / ML", "15-2051"),
    ("Site Reliability Engineer", "DevOps / SRE", "15-1244"),
    ("Application Security Engineer", "Security", "15-1212"),
    ("Product Designer", "Design", "27-1024"),
    ("Senior Product Manager", "Product", "11-2021"),
    ("VP of Engineering", "Engineering Management", "11-9041"),
    ("Account Executive, Enterprise", "Sales", "41-3091"),
    ("Customer Success Manager", "Customer Success", "13-1161"),
    ("Senior Technical Recruiter", "People / HR / Recruiting", "13-1071"),
    ("Some Random Role", None, None),
])
def test_classify_function(title, fn, soc):
    assert classify_function(title) == (fn, soc)


@pytest.mark.parametrize("title,level", [
    ("Junior Engineer", "junior"),
    ("Senior Engineer", "senior"),
    ("Staff Engineer", "staff"),
    ("Principal Engineer", "principal"),
    ("Engineering Manager", "manager"),
    ("Director of Product", "director"),
    ("VP of Sales", "vp"),
    ("Chief Marketing Officer", "c_level"),
    ("Software Engineer Intern", "intern"),
    ("Software Engineer", "mid"),
])
def test_classify_seniority(title, level):
    assert classify_seniority(title) == level


@pytest.mark.parametrize("text,low,high", [
    ("Salary range $120,000 - $180,000", 120_000, 180_000),
    ("Compensation: $150k–$200k", 150_000, 200_000),
    ("$1.2M to $1.5M total comp", 1_200_000, 1_500_000),
    ("Single value $175,000/yr", 175_000, 175_000),
    ("Some text without dollar amounts", None, None),
])
def test_extract_salary(text, low, high):
    assert extract_salary(text) == (low, high)


@pytest.mark.parametrize("text,expected", [
    ("Fully remote, work from home", "remote"),
    ("Hybrid 3 days/week", "hybrid"),
    ("On-site only", "onsite"),
    ("No location info", None),
])
def test_classify_remote(text, expected):
    assert classify_remote(text) == expected


def test_extract_stack():
    text = "Python, FastAPI, Postgres, AWS, Kubernetes, React, TypeScript"
    stack = extract_stack(text)
    assert "python" in [s.lower() for s in stack]
    assert "react" in [s.lower() for s in stack]
    assert "kubernetes" in [s.lower() for s in stack]


def test_parse_role_full():
    meta = parse_role(
        "Senior Backend Engineer",
        "Remote-friendly. Compensation $180k-$240k. Stack: Python, Postgres, Kubernetes.",
    )
    assert meta["function"] == "Software Engineering"
    assert meta["seniority"] == "senior"
    assert meta["salary_min"] == 180_000
    assert meta["salary_max"] == 240_000
    assert meta["remote"] == "remote"
    assert "python" in [s.lower() for s in meta["stack"]]
