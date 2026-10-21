"""What "Download diagnostics" puts in the file (no Home Assistant imports: testable alone).

Only versions, counts and states go in, and the frontend's last errors with names, entity ids and
addresses stripped (errors.py). No room or device names and no entity ids from the plan, and never
the licence key, token, activation id or installation hash: the licence part is built from a short
list of safe fields. diagnostics.py also runs Home Assistant's redaction over the result, in case
a secret ever ends up in one of the dicts copied here.
"""

from __future__ import annotations

import json
from collections.abc import Callable
from typing import Any

# blanked by Home Assistant's async_redact_data wherever they appear in the report
TO_REDACT = {"key", "key_hint", "token", "activation", "act", "instance", "inst"}

# what a floor holds, counted per floor
FLOOR_LISTS = ("rooms", "openings", "furniture", "devices", "walls", "outdoor", "fences")

# Check my setup's checks: the frontend reports how many things each found, and nothing else
CHECK_IDS = ("links", "rooms", "areas", "card", "graphics", "extensions", "repairs")

# where a plan item names a Home Assistant entity
_ENTITY_FIELDS = {
    "rooms": ("temperature", "humidity"),
    "openings": ("entity", "cover"),
    "furniture": ("entity",),
    "devices": ("entity",),
}


def _entities(floor: dict[str, Any]) -> list[str]:
    out = []
    for name, fields in _ENTITY_FIELDS.items():
        for item in floor.get(name) or []:
            for field in fields:
                value = item.get(field)
                if isinstance(value, str) and "." in value:
                    out.append(value)
    return out


def plan_summary(
    plan: dict[str, Any], revision: int, snapshots: list[Any],
    entity_exists: Callable[[str], bool] | None = None,
) -> dict[str, Any]:
    """Size and counts of the plan; with `entity_exists`, how many linked entities are gone from HA."""
    floors = []
    for floor in plan.get("floors") or []:
        entry: dict[str, Any] = {
            "elevation": floor.get("elevation"),
            "height": floor.get("height"),
            "ha_floor_linked": bool(floor.get("ha_floor")),
            **{name: len(floor.get(name) or []) for name in FLOOR_LISTS},
        }
        if entity_exists is not None:
            entry["missing_entities"] = sum(1 for e in _entities(floor) if not entity_exists(e))
        floors.append(entry)
    settings = plan.get("settings") or {}
    energy = settings.get("energy") or {}
    return {
        "version": plan.get("version"),
        "revision": revision,
        "size_bytes": len(json.dumps(plan, separators=(",", ":")).encode()),
        "restore_points": len(snapshots),
        "settings": sorted(settings),
        "theme": settings.get("theme"),
        "energy_set": sorted(k for k, v in energy.items() if v not in (None, "", [])) if isinstance(energy, dict) else [],
        "floors": floors,
        "totals": {name: sum(f[name] for f in floors) for name in FLOOR_LISTS},
    }


def checks_summary(checks: dict[str, Any] | None) -> dict[str, Any]:
    """What Check my setup found when an admin last opened VirtuHome: a count per check (0 is fine)."""
    if not checks:
        return {"reported": False}
    counts = checks.get("counts") or {}
    return {
        "reported": True,
        "time": checks.get("time"),
        "counts": {k: counts[k] for k in CHECK_IDS if isinstance(counts.get(k), int)},
    }


def licence_summary(summary: dict[str, Any] | None, loaded: list[dict[str, Any]]) -> dict[str, Any]:
    """The licence state and each extension: from ExtensionManager.summary() and .extensions()."""
    if summary is None:
        return {"status": "unavailable"}
    loaded_ids = {e.get("id") for e in loaded}
    return {
        "status": summary.get("status"),
        "error": summary.get("error"),
        "server": summary.get("server"),
        "key_entered": bool(summary.get("key_hint")),
        "last_check": summary.get("checked"),
        "extensions": [
            {"id": e.get("id"), "version": e.get("version"), "loaded": e.get("id") in loaded_ids}
            for e in summary.get("extensions") or []
        ],
    }


def build_report(
    store: Any, entry: Any, *, version: str, ha_version: str, licence: dict[str, Any] | None,
    loaded: list[dict[str, Any]], dashboard: dict[str, Any], panel: bool,
    entity_exists: Callable[[str], bool] | None = None,
) -> dict[str, Any]:
    """The whole report. `store` is the PlanStore (or None when VirtuHome isn't loaded), `entry` the
    config entry; both are only read."""
    report: dict[str, Any] = {
        "virtuhome_version": version,
        "home_assistant_version": ha_version,
        "loaded": store is not None,
        "options": {k: v for k, v in dict(getattr(entry, "options", {}) or {}).items() if k not in TO_REDACT},
        "panel_registered": panel,
        "dashboard_resource": dashboard,
    }
    if store is not None:
        report["plan"] = plan_summary(store.plan, store.revision, store.snapshots, entity_exists)
        report["checks"] = checks_summary(getattr(store, "checks", None))
        errors = getattr(store, "errors", None)
        report["errors"] = errors.summary() if errors is not None else []
    report["licence"] = licence_summary(licence, loaded)
    return report
