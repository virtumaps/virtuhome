"""Settings → Devices & services → VirtuHome → ⋮ → Download diagnostics (report.py says what's in it)."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import __version__ as HA_VERSION
from homeassistant.core import HomeAssistant
from homeassistant.helpers.redact import async_redact_data
from homeassistant.loader import async_get_integration

from . import card_resource
from .const import DOMAIN, PANEL_PATH
from .report import TO_REDACT, build_report
from .storage import PlanStore


async def async_get_config_entry_diagnostics(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    version = str((await async_get_integration(hass, DOMAIN)).version)
    store: PlanStore | None = hass.data.get(DOMAIN)
    manager = store.extension_manager if store else None
    # extensions() looks for the files on disk
    loaded = await hass.async_add_executor_job(manager.extensions) if manager else []
    report = build_report(
        store, entry,
        version=version,
        ha_version=HA_VERSION,
        licence=manager.summary() if manager else None,
        loaded=loaded,
        dashboard=await card_resource.async_state(hass, version),
        panel=PANEL_PATH in hass.data.get("frontend_panels", {}),
        entity_exists=lambda entity_id: hass.states.get(entity_id) is not None,
    )
    return async_redact_data(report, TO_REDACT)
