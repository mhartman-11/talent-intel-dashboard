"""Shared HTTP client with timeouts and polite UA."""
from __future__ import annotations

import time
from typing import Optional

import httpx

USER_AGENT = "talent-intel-dashboard/1.0 contact@hartmanai.com"

DEFAULT_HEADERS = {"User-Agent": USER_AGENT, "Accept": "application/json, */*"}


def get_json(
    url: str,
    *,
    params: Optional[dict] = None,
    headers: Optional[dict] = None,
    timeout: float = 20.0,
    retries: int = 2,
) -> dict | list:
    """GET URL, return parsed JSON. Raises on persistent failure."""
    h = {**DEFAULT_HEADERS, **(headers or {})}
    last_exc: Exception | None = None
    for attempt in range(retries + 1):
        try:
            resp = httpx.get(url, params=params, headers=h, timeout=timeout,
                             follow_redirects=True)
            resp.raise_for_status()
            return resp.json()
        except (httpx.HTTPError, ValueError) as exc:
            last_exc = exc
            if attempt < retries:
                time.sleep(0.5 * (attempt + 1))
    raise RuntimeError(f"GET {url} failed: {last_exc}")


def get_text(
    url: str,
    *,
    params: Optional[dict] = None,
    headers: Optional[dict] = None,
    timeout: float = 20.0,
    retries: int = 2,
) -> str:
    h = {**DEFAULT_HEADERS, **(headers or {})}
    last_exc: Exception | None = None
    for attempt in range(retries + 1):
        try:
            resp = httpx.get(url, params=params, headers=h, timeout=timeout,
                             follow_redirects=True)
            resp.raise_for_status()
            return resp.text
        except httpx.HTTPError as exc:
            last_exc = exc
            if attempt < retries:
                time.sleep(0.5 * (attempt + 1))
    raise RuntimeError(f"GET {url} failed: {last_exc}")


def get_bytes(
    url: str,
    *,
    headers: Optional[dict] = None,
    timeout: float = 60.0,
    retries: int = 2,
) -> bytes:
    h = {**DEFAULT_HEADERS, **(headers or {})}
    last_exc: Exception | None = None
    for attempt in range(retries + 1):
        try:
            resp = httpx.get(url, headers=h, timeout=timeout, follow_redirects=True)
            resp.raise_for_status()
            return resp.content
        except httpx.HTTPError as exc:
            last_exc = exc
            if attempt < retries:
                time.sleep(1.0 * (attempt + 1))
    raise RuntimeError(f"GET {url} failed: {last_exc}")
