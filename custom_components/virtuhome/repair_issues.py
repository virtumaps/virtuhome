"""Keeps VirtuHome's issues in Home Assistant's Repairs up to date (what they are: issues.py)."""

from __future__ import annotations

import time
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.loader import async_get_integration

from . import card_resource
from .const import DOMAIN
from .issues import ISSUE_IDS, found_issues

GUIDE_TROUBLESHOOTING = "https://virtumaps.github.io/virtuhome/#troubleshooting"
# the issues a fix flow in repairs.py puts right
FIXABLE = {"card_resource"}


async def async_update_issues(hass: HomeAssistant, store: Any) -> None:
    """Raises the issues that apply now and takes away those that went."""
    if store is None:
        return
    version = str((await async_get_integration(hass, DOMAIN)).version)
    dashboard = await card_resource.async_state(hass, version)
    counts = (store.checks or {}).get("counts")
    manager = store.extension_manager
    found = found_issues(dashboard, counts, manager.summary() if manager else None, time.time())
    for issue_id in ISSUE_IDS:
        if issue_id in found:
            ir.async_create_issue(
                hass, DOMAIN, issue_id, is_fixable=issue_id in FIXABLE, is_persistent=False,
                severity=ir.IssueSeverity.WARNING, translation_key=issue_id,
                translation_placeholders=found[issue_id], learn_more_url=GUIDE_TROUBLESHOOTING,
            )
        else:
            ir.async_delete_issue(hass, DOMAIN, issue_id)
