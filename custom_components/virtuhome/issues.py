"""What VirtuHome tells Home Assistant's Repairs (no Home Assistant imports: testable alone).

``found_issues`` turns what the integration knows (how dashboards get the card, what Check my setup
last counted, a licence key from before extensions moved to VirtuHome Pro) into the repair issues
that apply now, each with its placeholders. Issues not in the answer are taken away again
(repair_issues.py).
"""

from __future__ import annotations

from typing import Any

# every issue VirtuHome may raise; their texts are under "issues" in strings.json
ISSUE_IDS = ("card_resource", "missing_entities", "extension_needs_update", "pro_needed")


def found_issues(dashboard: dict[str, Any] | None, counts: dict[str, Any] | None, pro_needed: bool = False) -> dict[str, dict[str, str]]:
    """Issue id -> translation placeholders, for the issues that apply now."""
    out: dict[str, dict[str, str]] = {}
    # dashboards keep their resources in storage, and the card's is missing or names another version
    if dashboard and dashboard.get("mode") == "storage" and not dashboard.get("pending") and not dashboard.get("current"):
        out["card_resource"] = {}
    counts = counts or {}
    links = counts.get("links")
    if isinstance(links, int) and links > 0:
        out["missing_entities"] = {"count": str(links)}
    ext = counts.get("extensions")
    if isinstance(ext, int) and ext > 0:
        out["extension_needs_update"] = {"count": str(ext)}
    # a licence key entered before 0.18, and VirtuHome Pro not installed to use it
    if pro_needed:
        out["pro_needed"] = {}
    return out
