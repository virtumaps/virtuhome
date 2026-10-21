"""Errors the frontend reports (virtuhome/errors/report): the last 50, in memory, for the diagnostics file.

No Home Assistant imports, so it is testable alone. The frontend strips names, entity ids and
addresses before sending (frontend/src/live/strip.ts); they are stripped here again with what Home
Assistant and the plan know, since anything that can open a WebSocket can send a report.
"""

from __future__ import annotations

import re
from collections import deque
from collections.abc import Iterable
from typing import Any

KEEP = 50
# reports kept a minute at most; more are dropped
RATE = 20
# the longest a field is kept
LIMITS = {"where": 40, "message": 300, "stack": 2000, "version": 20, "graphics": 20, "browser": 80}

# the same list as frontend/src/live/strip.ts
ENTITY_DOMAINS = (
    "alarm_control_panel", "automation", "binary_sensor", "calendar", "camera", "climate", "counter", "cover",
    "device_tracker", "fan", "humidifier", "input_boolean", "input_button", "input_datetime", "input_number",
    "input_select", "input_text", "lawn_mower", "light", "lock", "media_player", "person", "remote", "scene",
    "script", "sensor", "siren", "switch", "timer", "vacuum", "valve", "water_heater", "weather", "zone",
)
MIN_NAME = 3
ENTITY_ID = re.compile(r"^[a-z_][a-z0-9_]*\.[a-z0-9_]+$")
PLAN_KEYS = {"name", "label", "title", "area_id", "ha_floor", "entity", "cover", "temperature", "humidity"}

_EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
_ADDRESS = re.compile(r"\b[a-z][a-z0-9+.-]*://[^\s\"'`<>()]*", re.I)
_ENTITY = re.compile(r"\b(?:" + "|".join(ENTITY_DOMAINS) + r")\.[a-z0-9_]+")
_PATTERNS = (
    (re.compile(r"\beyJ[\w-]*\.[\w-]*(?:\.[\w-]*)?"), "<token>"),
    (re.compile(r"[A-Za-z0-9_-]{32,}"), "<token>"),
    (re.compile(r"\b[A-Z0-9]{2,}(?:-[A-Z0-9]{2,}){3,}\b"), "<key>"),
    (re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"), "<ip>"),
    (re.compile(r"\b(?:[0-9a-f]{1,4}:){3,7}[0-9a-f]{1,4}\b", re.I), "<ip>"),
)


def _short_url(match: re.Match[str]) -> str:
    """A script's address keeps its file name and line (what a stack trace needs); any other address goes."""
    url = match.group(0)
    at = re.search(r"(?::\d+){1,2}$", url)
    suffix = at.group(0) if at else ""
    path = re.split(r"[?#]", url[: len(url) - len(suffix)])[0]
    file = path.rsplit("/", 1)[-1]
    return file + suffix if re.fullmatch(r"[\w.-]+\.m?js", file) else "<url>"


def strip_text(text: str, names: Iterable[str] = ()) -> str:
    """`text` without the names, entity ids, addresses, tokens and keys in it."""
    # whole entity ids before the names in them
    out = _ENTITY.sub("<entity>", _ADDRESS.sub(_short_url, _EMAIL.sub("<email>", text)))
    lower = out.lower()
    hits = sorted({n for n in names if n.lower() in lower}, key=len, reverse=True)
    if hits:
        pattern = re.compile("|".join(re.escape(n) for n in hits), re.I)
        out = pattern.sub(lambda m: "<entity>" if ENTITY_ID.match(m.group(0).lower()) else "<name>", out)
    for regex, to in _PATTERNS:
        out = regex.sub(to, out)
    return out


def private_strings(names: Iterable[Any], plan: dict[str, Any] | None = None) -> list[str]:
    """The names given (from Home Assistant) and those in the plan, as the strings to strip."""
    out: set[str] = set()

    def add(value: Any) -> None:
        if isinstance(value, str) and len(value.strip()) >= MIN_NAME:
            out.add(value.strip())

    for name in names:
        add(name)

    def walk(value: Any, key: str, depth: int) -> None:
        if depth > 12:
            return
        if isinstance(value, str):
            if key in PLAN_KEYS or ENTITY_ID.match(value):
                add(value)
        elif isinstance(value, list):
            for item in value:
                walk(item, key, depth + 1)
        elif isinstance(value, dict):
            for k, item in value.items():
                walk(item, str(k), depth + 1)

    if plan:
        walk(plan, "", 0)
    return list(out)


class ErrorLog:
    """The last errors reported, each once with how often it came; a few a minute at most."""

    def __init__(self, keep: int = KEEP, rate: int = RATE) -> None:
        self.entries: deque[dict[str, Any]] = deque(maxlen=keep)
        self._rate = rate
        self._times: deque[float] = deque()

    def add(self, report: dict[str, Any], names: Iterable[str], now: float) -> bool:
        """Keeps a report, stripped; False when too many came this minute."""
        while self._times and now - self._times[0] > 60:
            self._times.popleft()
        if len(self._times) >= self._rate:
            return False
        self._times.append(now)
        names = list(names)
        # every field, though the frontend fills the version, graphics and browser itself; cut after
        # stripping, so no name is cut in half and left
        entry = {field: strip_text(str(report.get(field) or "")[: limit * 4], names)[:limit] for field, limit in LIMITS.items()}
        same = next((e for e in self.entries if all(e[f] == entry[f] for f in ("where", "message", "stack"))), None)
        if same is not None:
            same["count"] += 1
            same["last"] = now
            # the newest last
            self.entries.remove(same)
            self.entries.append(same)
            return True
        self.entries.append({"time": now, "last": now, "count": 1, **entry})
        return True

    def summary(self) -> list[dict[str, Any]]:
        return [dict(e) for e in self.entries]
